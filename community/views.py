import csv
import datetime as dt_module
import json
from datetime import date

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.utils import timezone
from django.core import signing
from django.db import models as db_models
from django.db.models import Q
from django.db import transaction
from icalendar import Calendar, Event as ICalEvent
from core.models import Schedule
from .models import (
    NewsAndEvents, NewsAndEventsComment, Poll, PollChoice, PollVote, PollComment,
    Survey, SurveyQuestion, SurveyQuestionChoice, SurveyResponse, SurveyAnswer, SurveyComment,
    RecruitmentForm, RecruitmentApplication,
    CommunityPost, CommunityComment, GatheringEvent, GatheringComment
)


def _user_display_name(user):
    if not user:
        return '(삭제됨)'
    return getattr(user, 'display_author', '') or getattr(user, 'username', '(삭제됨)')


def _parse_survey_datetime(dt_str):
    if not dt_str:
        return None
    try:
        return timezone.make_aware(dt_module.datetime.fromisoformat(dt_str))
    except (ValueError, TypeError):
        return None


def _survey_structure_matches_existing(survey, questions_data):
    existing_questions = list(survey.questions.prefetch_related('choices').all())

    if len(existing_questions) != len(questions_data):
        return False

    for existing_question, incoming_question in zip(existing_questions, questions_data):
        if existing_question.order != incoming_question.get('sequence', 0):
            return False
        if existing_question.question_text != (incoming_question.get('title') or '').strip():
            return False
        if existing_question.question_type != incoming_question.get('question_type', 'CHOICE'):
            return False

        incoming_choices = [
            (choice_data.get('text') or '').strip()
            for choice_data in incoming_question.get('choices', [])
            if (choice_data.get('text') or '').strip()
        ]
        existing_choices = [choice.choice_text for choice in existing_question.choices.all()]

        if existing_choices != incoming_choices:
            return False

    return True


def _survey_settings_match_existing(survey, title, description, is_anonymous, allow_duplicate, starts_at, ends_at):
    return all([
        survey.title == title,
        survey.description == description,
        survey.is_anonymous == is_anonymous,
        survey.allow_duplicate_response == allow_duplicate,
        survey.starts_at == starts_at,
        survey.ends_at == ends_at,
    ])


@login_required
def community_main(request):
    notices = NewsAndEvents.objects.filter(posted_as='News').order_by('-upload_time')[:5]
    activities = NewsAndEvents.objects.filter(posted_as='Event').order_by('-upload_time')[:6]
    # 공지쪽으로 등록된 진행 중 투표만 표시
    active_polls = Poll.objects.filter(is_active=True, show_as_notice=True).exclude(
        ends_at__lte=timezone.now()
    ).order_by('-created_at')

    context = {'notices': notices, 'activities': activities, 'active_polls': active_polls}
    return render(request, 'community/community_main.html', context)

@staff_member_required
def post_add(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        summary = request.POST.get('summary')
        posted_as = request.POST.get('posted_as', 'News')
        thumbnail = request.FILES.get('thumbnail') # 썸네일 파일 캐치!
        
        NewsAndEvents.objects.create(
            title=title, summary=summary, posted_as=posted_as, thumbnail=thumbnail
        )
        return redirect(request.META.get('HTTP_REFERER', 'community_main'))
    return redirect('community_main')

@staff_member_required
def delete_post(request, post_id):
    """공지사항 삭제 뷰"""
    if request.method == 'POST':
        post = get_object_or_404(NewsAndEvents, id=post_id)
        post.delete()
        
        # 💡 삭제 후에는 이전 페이지(Referer)가 아니라 무조건 메인 목록으로 이동!
        return redirect('community_main') 
        
    return redirect('community_main')

@staff_member_required
def edit_post(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(NewsAndEvents, id=post_id)
        post.title = request.POST.get('title')
        post.summary = request.POST.get('summary')
        
        if 'thumbnail' in request.FILES: # 수정 시 새로운 썸네일을 올렸다면 교체
            post.thumbnail = request.FILES.get('thumbnail')
            
        post.save()
        if post.posted_as == 'Event':
            return redirect('activity_detail', activity_id=post.id)
        return redirect('notice_detail', notice_id=post.id)
    return redirect('community_main')

@login_required
def notice_detail(request, notice_id):
    """공지사항 상세 페이지 뷰"""
    notice = get_object_or_404(NewsAndEvents, id=notice_id)

    if request.method == "POST":
        action = request.POST.get("action")

        if action == "add_comment":
            content = request.POST.get("content", "").strip()
            if not content:
                messages.error(request, "댓글 내용을 입력해주세요.")
                return redirect("notice_detail", notice_id=notice.id)

            NewsAndEventsComment.objects.create(post=notice, author=request.user, content=content)
            return redirect("notice_detail", notice_id=notice.id)

        if action in {"edit_comment", "delete_comment"}:
            comment_id = request.POST.get("comment_id")
            comment = get_object_or_404(NewsAndEventsComment, id=comment_id, post=notice)

            can_edit = request.user == comment.author
            can_delete = request.user == comment.author or (
                request.user.is_staff and not comment.author.is_staff
            )

            if action == "edit_comment":
                if not can_edit:
                    messages.error(request, "댓글 수정 권한이 없습니다.")
                    return redirect("notice_detail", notice_id=notice.id)

                new_content = request.POST.get("content", "").strip()
                if not new_content:
                    messages.error(request, "댓글 내용을 입력해주세요.")
                    return redirect("notice_detail", notice_id=notice.id)

                comment.content = new_content
                comment.save(update_fields=["content"])
                return redirect("notice_detail", notice_id=notice.id)

            if not can_delete:
                messages.error(request, "댓글 삭제 권한이 없습니다.")
                return redirect("notice_detail", notice_id=notice.id)

            comment.delete()
            return redirect("notice_detail", notice_id=notice.id)
    
    context = {
        'notice': notice,
        'comments': notice.comments.select_related('author').all(),
    }
    return render(request, 'community/notice_detail.html', context)

@login_required
def activity_detail(request, activity_id):
    activity = get_object_or_404(NewsAndEvents, id=activity_id)

    if request.method == "POST":
        action = request.POST.get("action")

        if action == "add_comment":
            content = request.POST.get("content", "").strip()
            if not content:
                messages.error(request, "댓글 내용을 입력해주세요.")
                return redirect("activity_detail", activity_id=activity.id)

            NewsAndEventsComment.objects.create(post=activity, author=request.user, content=content)
            return redirect("activity_detail", activity_id=activity.id)

        if action in {"edit_comment", "delete_comment"}:
            comment_id = request.POST.get("comment_id")
            comment = get_object_or_404(NewsAndEventsComment, id=comment_id, post=activity)

            can_edit = request.user == comment.author
            can_delete = request.user == comment.author or (
                request.user.is_staff and not comment.author.is_staff
            )

            if action == "edit_comment":
                if not can_edit:
                    messages.error(request, "댓글 수정 권한이 없습니다.")
                    return redirect("activity_detail", activity_id=activity.id)

                new_content = request.POST.get("content", "").strip()
                if not new_content:
                    messages.error(request, "댓글 내용을 입력해주세요.")
                    return redirect("activity_detail", activity_id=activity.id)

                comment.content = new_content
                comment.save(update_fields=["content"])
                return redirect("activity_detail", activity_id=activity.id)

            if not can_delete:
                messages.error(request, "댓글 삭제 권한이 없습니다.")
                return redirect("activity_detail", activity_id=activity.id)

            comment.delete()
            return redirect("activity_detail", activity_id=activity.id)

    return render(
        request,
        'community/activity_detail.html',
        {
            'activity': activity,
            'comments': activity.comments.select_related('author').all(),
        },
    )

@staff_member_required
def upload_editor_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image = request.FILES['image']
        fs = FileSystemStorage()
        # 서버의 media/editor_images/ 폴더에 사진 저장
        filename = fs.save(f'editor_images/{image.name}', image)
        image_url = fs.url(filename)
        
        # 저장된 주소를 에디터(프론트엔드)로 반환
        return JsonResponse({'url': image_url})
    return JsonResponse({'error': '업로드 실패'}, status=400)


@login_required
def schedule_list(request):
    return render(request, 'community/schedule_list.html')


# ─────────────────────────────────────────────
# 투표 (Poll)
# ─────────────────────────────────────────────

@login_required
def poll_list(request):
    all_polls = Poll.objects.prefetch_related('choices', 'votes')
    active_polls = [p for p in all_polls if not p.is_closed]
    closed_polls = [p for p in all_polls if p.is_closed]
    return render(request, 'community/poll_list.html', {
        'active_polls': active_polls,
        'closed_polls': closed_polls,
    })


@login_required
def poll_detail(request, poll_id):
    poll = get_object_or_404(Poll, id=poll_id)
    choices = poll.choices.prefetch_related('votes').all()
    total_voters = poll.total_voters
    user_voted_choice_ids = list(
        poll.votes.filter(voter=request.user).values_list('choice_id', flat=True)
    )
    is_closed = poll.is_closed

    if request.method == 'POST':
        action = request.POST.get('action', '')

        if action == 'add_comment':
            content = request.POST.get('content', '').strip()
            if content:
                PollComment.objects.create(poll=poll, author=request.user, content=content)
            return redirect('poll_detail', poll_id=poll_id)

        if action == 'delete_comment':
            comment_id = request.POST.get('comment_id')
            comment = get_object_or_404(PollComment, id=comment_id, poll=poll)
            can_delete = request.user == comment.author or (
                request.user.is_staff and not comment.author.is_staff
            )
            if can_delete:
                comment.delete()
            return redirect('poll_detail', poll_id=poll_id)

        if action == 'edit_comment':
            comment_id = request.POST.get('comment_id')
            comment = get_object_or_404(PollComment, id=comment_id, poll=poll)
            if request.user == comment.author:
                new_content = request.POST.get('content', '').strip()
                if new_content:
                    comment.content = new_content
                    comment.save(update_fields=['content'])
            return redirect('poll_detail', poll_id=poll_id)

        if not is_closed:
            choice_ids = request.POST.getlist('choice')
            if not choice_ids:
                messages.error(request, '항목을 선택해주세요.')
                return redirect('poll_detail', poll_id=poll_id)
            if not poll.is_multiple and len(choice_ids) > 1:
                messages.error(request, '단일 선택 투표입니다.')
                return redirect('poll_detail', poll_id=poll_id)

            PollVote.objects.filter(poll=poll, voter=request.user).delete()
            for cid in choice_ids:
                choice = get_object_or_404(PollChoice, id=int(cid), poll=poll)
                PollVote.objects.create(poll=poll, choice=choice, voter=request.user)

            messages.success(request, '투표가 완료됐습니다.')
        return redirect('poll_detail', poll_id=poll_id)

    comments = poll.comments.select_related('author').all()
    return render(request, 'community/poll_detail.html', {
        'poll': poll,
        'choices': choices,
        'total_voters': total_voters,
        'user_voted_choice_ids': user_voted_choice_ids,
        'has_voted': bool(user_voted_choice_ids),
        'is_closed': is_closed,
        'comments': comments,
    })


@staff_member_required
def poll_create(request):
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        is_multiple = request.POST.get('is_multiple') == 'on'
        is_anonymous = request.POST.get('is_anonymous') == 'on'
        starts_at_date = request.POST.get('starts_at_date', '').strip()
        starts_at_time = request.POST.get('starts_at_time', '').strip()
        ends_at_date = request.POST.get('ends_at_date', '').strip()
        ends_at_time = request.POST.get('ends_at_time', '').strip()
        choice_texts = [t.strip() for t in request.POST.getlist('choices') if t.strip()]

        if not title:
            messages.error(request, '제목을 입력해주세요.')
            return redirect('poll_create')
        if len(choice_texts) < 2:
            messages.error(request, '선택 항목을 2개 이상 입력해주세요.')
            return redirect('poll_create')

        def _parse_dt(d_str, t_str, default_time):
            if not d_str:
                return None
            try:
                d = dt_module.date.fromisoformat(d_str)
                t = dt_module.time.fromisoformat(t_str) if t_str else default_time
                return timezone.make_aware(dt_module.datetime.combine(d, t))
            except (ValueError, TypeError):
                return None

        starts_at = _parse_dt(starts_at_date, starts_at_time, dt_module.time(0, 0))
        ends_at = _parse_dt(ends_at_date, ends_at_time, dt_module.time(23, 59))

        poll = Poll.objects.create(
            title=title,
            description=description,
            created_by=request.user,
            is_multiple=is_multiple,
            is_anonymous=is_anonymous,
            starts_at=starts_at,
            ends_at=ends_at,
            show_as_notice=request.POST.get('show_as_notice') == 'on',
        )
        for i, txt in enumerate(choice_texts):
            PollChoice.objects.create(poll=poll, text=txt, order=i)

        return redirect('poll_detail', poll_id=poll.id)

    return render(request, 'community/poll_create.html')


@staff_member_required
def poll_edit(request, poll_id):
    poll = get_object_or_404(Poll, id=poll_id)
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        starts_at_date = request.POST.get('starts_at_date', '').strip()
        starts_at_time = request.POST.get('starts_at_time', '').strip()
        ends_at_date = request.POST.get('ends_at_date', '').strip()
        ends_at_time = request.POST.get('ends_at_time', '').strip()

        if not title:
            messages.error(request, '제목을 입력해주세요.')
            return redirect('poll_edit', poll_id=poll_id)

        def _parse_dt(d_str, t_str, default_time):
            if not d_str:
                return None
            try:
                d = dt_module.date.fromisoformat(d_str)
                t = dt_module.time.fromisoformat(t_str) if t_str else default_time
                return timezone.make_aware(dt_module.datetime.combine(d, t))
            except (ValueError, TypeError):
                return None

        poll.title = title
        poll.description = description
        poll.is_multiple = request.POST.get('is_multiple') == 'on'
        poll.is_anonymous = request.POST.get('is_anonymous') == 'on'
        poll.show_as_notice = request.POST.get('show_as_notice') == 'on'
        poll.starts_at = _parse_dt(starts_at_date, starts_at_time, dt_module.time(0, 0))
        poll.ends_at = _parse_dt(ends_at_date, ends_at_time, dt_module.time(23, 59))
        poll.save()
        messages.success(request, '투표가 수정됐습니다.')
        return redirect('poll_detail', poll_id=poll_id)

    return render(request, 'community/poll_edit.html', {'poll': poll})


@staff_member_required
def poll_toggle(request, poll_id):
    if request.method == 'POST':
        poll = get_object_or_404(Poll, id=poll_id)
        if poll.is_closed:
            # 재개: 활성화하고, 만료된 ends_at이면 초기화
            poll.is_active = True
            if poll.ends_at and poll.ends_at < timezone.now():
                poll.ends_at = None
            poll.save(update_fields=['is_active', 'ends_at'])
        else:
            poll.is_active = False
            poll.save(update_fields=['is_active'])
    return redirect('poll_detail', poll_id=poll_id)


@staff_member_required
def poll_delete(request, poll_id):
    if request.method == 'POST':
        get_object_or_404(Poll, id=poll_id).delete()
    return redirect('poll_list')


@staff_member_required
def poll_votes(request, poll_id):
    """투표 결과 상세 뷰 (staff 전용) — 누가 어떤 항목에 투표했는지 확인"""
    poll = get_object_or_404(Poll, id=poll_id)
    choices = poll.choices.prefetch_related('votes__voter').all()
    choice_data = []
    for choice in choices:
        voters = choice.votes.select_related('voter').order_by('voted_at')
        choice_data.append({
            'choice': choice,
            'voters': voters,
        })
    context = {
        'poll': poll,
        'choice_data': choice_data,
        'total_voters': poll.total_voters,
    }
    return render(request, 'community/poll_votes.html', context)


@staff_member_required
def poll_votes_export(request, poll_id):
    """투표 결과 CSV 다운로드 (staff 전용)"""
    poll = get_object_or_404(Poll, id=poll_id)

    filename = f"poll_{poll.id}_votes_{timezone.localtime().strftime('%Y%m%d_%H%M')}.csv"
    response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    writer = csv.writer(response)

    if poll.is_anonymous:
        # 익명 투표: 항목별 득표 수만
        writer.writerow(['선택 항목', '득표 수'])
        for choice in poll.choices.all():
            writer.writerow([choice.text, choice.vote_count])
    else:
        writer.writerow(['이름', '학번(username)', '선택 항목', '투표 일시'])
        for choice in poll.choices.prefetch_related('votes__voter').all():
            for vote in choice.votes.select_related('voter').order_by('voted_at'):
                voter = vote.voter
                full_name = voter.get_full_name or voter.username
                voted_at_local = timezone.localtime(vote.voted_at).strftime('%Y-%m-%d %H:%M:%S')
                writer.writerow([full_name, voter.username, choice.text, voted_at_local])

    return response


@login_required
def schedule_detail(request, schedule_id):
    schedule = get_object_or_404(NewsAndEvents, id=schedule_id)

    if request.method == "POST":
        action = request.POST.get("action")

        if action == "add_comment":
            content = request.POST.get("content", "").strip()
            if not content:
                messages.error(request, "댓글 내용을 입력해주세요.")
                return redirect("schedule_detail", schedule_id=schedule.id)
            NewsAndEventsComment.objects.create(post=schedule, author=request.user, content=content)
            return redirect("schedule_detail", schedule_id=schedule.id)

        if action in {"edit_comment", "delete_comment"}:
            comment_id = request.POST.get("comment_id")
            comment = get_object_or_404(NewsAndEventsComment, id=comment_id, post=schedule)

            can_edit = request.user == comment.author
            can_delete = request.user == comment.author or (
                request.user.is_staff and not comment.author.is_staff
            )

            if action == "edit_comment":
                if not can_edit:
                    messages.error(request, "댓글 수정 권한이 없습니다.")
                    return redirect("schedule_detail", schedule_id=schedule.id)
                new_content = request.POST.get("content", "").strip()
                if not new_content:
                    messages.error(request, "댓글 내용을 입력해주세요.")
                    return redirect("schedule_detail", schedule_id=schedule.id)
                comment.content = new_content
                comment.save(update_fields=["content"])
                return redirect("schedule_detail", schedule_id=schedule.id)

            if not can_delete:
                messages.error(request, "댓글 삭제 권한이 없습니다.")
                return redirect("schedule_detail", schedule_id=schedule.id)
            comment.delete()
            return redirect("schedule_detail", schedule_id=schedule.id)

    return render(
        request,
        'community/schedule_detail.html',
        {
            'schedule': schedule,
            'comments': schedule.comments.select_related('author').all(),
            'today': date.today(),
        },
    )


# ─── iCal 피드 ────────────────────────────────────────────────────────────────

def _build_calendar(schedules, cal_name):
    """Schedule 쿼리셋으로 Calendar 객체를 생성합니다."""
    cal = Calendar()
    cal.add('prodid', '-//IPSE LMS//ipse.kr//')
    cal.add('version', '2.0')
    cal.add('x-wr-calname', cal_name)
    cal.add('x-wr-timezone', 'Asia/Seoul')
    cal.add('x-wr-caldesc', 'IPSE 동아리 일정 자동 동기화 피드')

    for schedule in schedules:
        event = ICalEvent()
        event.add('uid', f'ipse-schedule-{schedule.pk}@ipse.kr')
        event.add('summary', schedule.title)
        is_all_day = (
            schedule.end_date is None
            and schedule.start_date.hour == 0
            and schedule.start_date.minute == 0
            and schedule.start_date.second == 0
        )
        if is_all_day:
            event.add('dtstart', schedule.start_date.date())
            event.add('dtend', schedule.start_date.date() + dt_module.timedelta(days=1))
        else:
            event.add('dtstart', schedule.start_date)
            event.add('dtend', schedule.end_date or schedule.start_date)
        if schedule.description:
            event.add('description', schedule.description)
        event.add('dtstamp', timezone.now())
        cal.add_component(event)

    return cal


def global_calendar_feed(request):
    """동아리 전체 공개 일정 iCal 피드 (로그인 불필요, 전체 일정만 포함)"""
    schedules = Schedule.objects.filter(is_global=True).order_by('start_date')
    cal = _build_calendar(schedules, 'IPSE 동아리 전체 일정')
    return HttpResponse(
        cal.to_ical(),
        content_type='text/calendar; charset=utf-8',
        headers={'Content-Disposition': 'inline; filename="ipse-global.ics"'},
    )


def personal_calendar_feed(request, token):
    """개인 일정 + 전체 일정 iCal 피드. 토큰으로 유저를 식별합니다."""
    try:
        user_pk = signing.loads(token, salt='ical-feed', max_age=60 * 60 * 24 * 365)
    except signing.BadSignature:
        return HttpResponse('유효하지 않은 토큰입니다.', status=403, content_type='text/plain')

    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = get_object_or_404(User, pk=user_pk)

    schedules = Schedule.objects.filter(
        db_models.Q(is_global=True) | db_models.Q(user=user)
    ).order_by('start_date')

    cal = _build_calendar(schedules, f'IPSE 일정 ({user.display_name})')
    return HttpResponse(
        cal.to_ical(),
        content_type='text/calendar; charset=utf-8',
        headers={'Content-Disposition': f'inline; filename="ipse-{user.username}.ics"'},
    )


@login_required
def calendar_subscribe(request):
    """구독용 iCal URL을 보여주는 페이지"""
    from django.core import signing
    token = signing.dumps(request.user.pk, salt='ical-feed')
    return render(request, 'community/calendar_subscribe.html', {
        'title': '캘린더 동기화',
        'token': token,
    })


# ─────────────────────────────────────────────
# 설문 (Survey)
# ─────────────────────────────────────────────

@login_required
def survey_list(request):
    """설문 목록 페이지"""
    all_surveys = Survey.objects.prefetch_related('questions', 'responses').all()
    active_surveys = [survey for survey in all_surveys if not survey.is_closed]
    closed_surveys = [survey for survey in all_surveys if survey.is_closed]
    responded_survey_ids = set()

    if request.user.is_authenticated:
        responded_survey_ids = set(
            SurveyResponse.objects.filter(respondent=request.user).values_list('survey_id', flat=True)
        )

    context = {
        'active_surveys': active_surveys,
        'closed_surveys': closed_surveys,
        'responded_survey_ids': responded_survey_ids,
        'title': '설문',
    }
    return render(request, 'community/survey_list.html', context)


@staff_member_required
def survey_create(request):
    """설문 생성 페이지"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            title = data.get('title', '').strip()
            description = data.get('description', '').strip()
            is_anonymous = data.get('is_anonymous', False)
            allow_duplicate = data.get('allow_duplicate_response', False)
            starts_at_str = data.get('starts_at')
            ends_at_str = data.get('ends_at')
            questions_data = data.get('questions', [])

            if not title:
                return JsonResponse({'error': '제목을 입력해주세요.'}, status=400)

            if not questions_data:
                return JsonResponse({'error': '최소 1개 이상의 질문을 추가하세요.'}, status=400)

            starts_at = _parse_survey_datetime(starts_at_str)
            ends_at = _parse_survey_datetime(ends_at_str)

            with transaction.atomic():
                survey = Survey.objects.create(
                    title=title,
                    description=description,
                    created_by=request.user,
                    is_anonymous=is_anonymous,
                    allow_duplicate_response=allow_duplicate,
                    starts_at=starts_at,
                    ends_at=ends_at,
                )

                for q_data in questions_data:
                    question_text = (q_data.get('title') or '').strip()
                    question_description = (q_data.get('description') or '').strip()
                    question_type = q_data.get('question_type', 'CHOICE')

                    if not question_text:
                        raise ValueError('질문 제목을 입력해주세요.')

                    question = SurveyQuestion.objects.create(
                        survey=survey,
                        question_text=question_text,
                        question_description=question_description,
                        question_type=question_type,
                        order=q_data.get('sequence', 0),
                        required=True,
                    )

                    if question_type == 'CHOICE':
                        choices = [
                            (c_data.get('text') or '').strip()
                            for c_data in q_data.get('choices', [])
                            if (c_data.get('text') or '').strip()
                        ]

                        if len(choices) < 2:
                            raise ValueError('객관식 질문은 선택지를 2개 이상 입력해주세요.')

                        for choice_order, choice_text in enumerate(choices):
                            SurveyQuestionChoice.objects.create(
                                question=question,
                                choice_text=choice_text,
                                order=choice_order,
                            )

            return JsonResponse({
                'status': 'success',
                'survey_id': survey.id,
                'message': '설문이 성공적으로 만들어졌습니다!'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return render(request, 'community/survey_create.html')


@staff_member_required
def survey_edit(request, survey_id):
    """설문 수정 페이지"""
    survey = get_object_or_404(Survey, id=survey_id)
    survey_has_responses = survey.responses.exists()

    if not (request.user.is_staff or request.user == survey.created_by):
        return JsonResponse({'error': '권한이 없습니다.'}, status=403)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            title = data.get('title', '').strip()
            description = data.get('description', '').strip()
            is_anonymous = data.get('is_anonymous', False)
            allow_duplicate = data.get('allow_duplicate_response', False)
            starts_at_str = data.get('starts_at')
            ends_at_str = data.get('ends_at')
            questions_data = data.get('questions', [])
            starts_at = _parse_survey_datetime(starts_at_str)
            ends_at = _parse_survey_datetime(ends_at_str)

            if not title:
                return JsonResponse({'error': '제목을 입력해주세요.'}, status=400)

            if not questions_data:
                return JsonResponse({'error': '최소 1개 이상의 질문을 추가하세요.'}, status=400)

            with transaction.atomic():
                if survey_has_responses:
                    if not _survey_settings_match_existing(
                        survey,
                        title,
                        description,
                        is_anonymous,
                        allow_duplicate,
                        starts_at,
                        ends_at,
                    ):
                        return JsonResponse({
                            'error': '응답이 있는 설문은 기본 정보와 옵션을 변경할 수 없습니다. 질문 설명만 수정 가능합니다.'
                        }, status=400)

                    if not _survey_structure_matches_existing(survey, questions_data):
                        return JsonResponse({
                            'error': '응답이 있는 설문은 질문 제목, 유형, 순서, 선택지를 변경할 수 없습니다. 질문 설명만 수정 가능합니다.'
                        }, status=400)

                    for existing_question, incoming_question in zip(survey.questions.all(), questions_data):
                        existing_question.question_description = (incoming_question.get('description') or '').strip()
                        existing_question.save(update_fields=['question_description'])

                    return JsonResponse({
                        'status': 'success',
                        'survey_id': survey.id,
                        'message': '질문 설명이 수정되었습니다.'
                    })

                survey.title = title
                survey.description = description
                survey.is_anonymous = is_anonymous
                survey.allow_duplicate_response = allow_duplicate
                survey.starts_at = starts_at
                survey.ends_at = ends_at
                survey.save()

                survey.questions.all().delete()

                for q_data in questions_data:
                    question_text = (q_data.get('title') or '').strip()
                    question_description = (q_data.get('description') or '').strip()
                    question_type = q_data.get('question_type', 'CHOICE')

                    if not question_text:
                        raise ValueError('질문 제목을 입력해주세요.')

                    question = SurveyQuestion.objects.create(
                        survey=survey,
                        question_text=question_text,
                        question_description=question_description,
                        question_type=question_type,
                        order=q_data.get('sequence', 0),
                        required=True,
                    )

                    if question_type == 'CHOICE':
                        choices = [
                            (c_data.get('text') or '').strip()
                            for c_data in q_data.get('choices', [])
                            if (c_data.get('text') or '').strip()
                        ]

                        if len(choices) < 2:
                            raise ValueError('객관식 질문은 선택지를 2개 이상 입력해주세요.')

                        for choice_order, choice_text in enumerate(choices):
                            SurveyQuestionChoice.objects.create(
                                question=question,
                                choice_text=choice_text,
                                order=choice_order,
                            )

            return JsonResponse({
                'status': 'success',
                'survey_id': survey.id,
                'message': '설문이 수정되었습니다.'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    survey_payload = {
        'title': survey.title,
        'description': survey.description,
        'starts_at': timezone.localtime(survey.starts_at).strftime('%Y-%m-%dT%H:%M') if survey.starts_at else '',
        'ends_at': timezone.localtime(survey.ends_at).strftime('%Y-%m-%dT%H:%M') if survey.ends_at else '',
        'is_anonymous': survey.is_anonymous,
        'allow_duplicate_response': survey.allow_duplicate_response,
        'questions': [
            {
                'sequence': question.order,
                'title': question.question_text,
                'description': question.question_description,
                'question_type': question.question_type,
                'choices': [
                    {
                        'sequence': choice.order,
                        'text': choice.choice_text,
                    }
                    for choice in question.choices.all()
                ],
            }
            for question in survey.questions.prefetch_related('choices').all()
        ],
    }

    return render(request, 'community/survey_create.html', {
        'survey': survey,
        'survey_payload': survey_payload,
        'is_edit_mode': True,
        'survey_has_responses': survey_has_responses,
    })


@staff_member_required
def survey_delete(request, survey_id):
    """설문 삭제"""
    survey = get_object_or_404(Survey, id=survey_id)

    if not (request.user.is_staff or request.user == survey.created_by):
        return JsonResponse({'error': '권한이 없습니다.'}, status=403)

    if request.method != 'POST':
        return JsonResponse({'error': 'POST 요청만 허용됩니다.'}, status=400)

    survey.delete()
    return JsonResponse({'status': 'success', 'message': '설문이 삭제되었습니다.'})


@login_required
def survey_detail(request, survey_id):
    """설문 상세 및 응답 페이지"""
    survey = get_object_or_404(Survey, id=survey_id)

    if request.method == 'POST':
        action = request.POST.get('action', '')

        if action == 'add_comment':
            content = request.POST.get('content', '').strip()
            if not content:
                messages.error(request, '댓글 내용을 입력해주세요.')
                return redirect('survey_detail', survey_id=survey_id)
            SurveyComment.objects.create(survey=survey, author=request.user, content=content)
            return redirect('survey_detail', survey_id=survey_id)

        if action == 'delete_comment':
            comment_id = request.POST.get('comment_id')
            comment = get_object_or_404(SurveyComment, id=comment_id, survey=survey)
            can_delete = request.user == comment.author or (
                request.user.is_staff and not comment.author.is_staff
            )
            if can_delete:
                comment.delete()
            return redirect('survey_detail', survey_id=survey_id)

        if action == 'edit_comment':
            comment_id = request.POST.get('comment_id')
            comment = get_object_or_404(SurveyComment, id=comment_id, survey=survey)
            if request.user == comment.author:
                new_content = request.POST.get('content', '').strip()
                if new_content:
                    comment.content = new_content
                    comment.save(update_fields=['content'])
            return redirect('survey_detail', survey_id=survey_id)

    questions = list(survey.questions.all().prefetch_related('choices'))

    existing_response = None
    has_responded = False
    if not survey.is_anonymous and request.user.is_authenticated:
        existing_response = SurveyResponse.objects.filter(
            survey=survey,
            respondent=request.user,
        ).prefetch_related('answers').order_by('-created_at').first()
        has_responded = existing_response is not None

    current_answers = {}
    if existing_response:
        current_answers = {
            answer.question_id: answer
            for answer in existing_response.answers.all()
        }

    for question in questions:
        question.current_answer = current_answers.get(question.id)

    context = {
        'survey': survey,
        'questions': questions,
        'has_responded': has_responded,
        'existing_response': existing_response,
        'scale_options': [1, 2, 3, 4, 5],
        'can_manage_survey': request.user.is_staff or request.user == survey.created_by,
        'comments': survey.comments.select_related('author').all(),
    }
    return render(request, 'community/survey_detail.html', context)


@login_required
def survey_respond(request, survey_id):
    """설문 응답 API"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST 요청만 허용됩니다.'}, status=400)

    survey = get_object_or_404(Survey, id=survey_id)

    if survey.is_closed:
        return JsonResponse({'error': '마감된 설문입니다.'}, status=403)

    try:
        data = json.loads(request.body)

        respondent = request.user if request.user.is_authenticated and not survey.is_anonymous else None
        existing_response = None

        if respondent:
            response_id = data.get('response_id')
            if response_id:
                existing_response = SurveyResponse.objects.filter(
                    id=response_id,
                    survey=survey,
                    respondent=respondent,
                ).first()
            elif not survey.allow_duplicate_response:
                existing_response = SurveyResponse.objects.filter(
                    survey=survey,
                    respondent=respondent,
                ).order_by('-created_at').first()

        if existing_response:
            response_obj = existing_response
            response_obj.answers.all().delete()
            message = '응답이 수정되었습니다.'
        else:
            response_obj = SurveyResponse.objects.create(survey=survey, respondent=respondent)
            message = '감사합니다! 응답이 정상적으로 제출되었습니다.'

        # question_{{ question.id }}: value 형식 처리
        for key, value in data.items():
            if key.startswith('question_'):
                question_id = int(key.replace('question_', ''))
                question = get_object_or_404(SurveyQuestion, id=question_id, survey=survey)

                if question.question_type == 'CHOICE':
                    # value는 choice_id
                    choice = get_object_or_404(SurveyQuestionChoice, id=value)
                    SurveyAnswer.objects.create(response=response_obj, question=question, choice=choice)

                elif question.question_type == 'TEXT':
                    text = value.strip()
                    if text:
                        SurveyAnswer.objects.create(response=response_obj, question=question, text_answer=text)

                elif question.question_type == 'SCALE':
                    scale = int(value)
                    if 1 <= scale <= 5:
                        SurveyAnswer.objects.create(response=response_obj, question=question, scale_answer=scale)

        return JsonResponse({
            'status': 'success',
            'response_id': response_obj.id,
            'message': message
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
def survey_results(request, survey_id):
    """설문 결과 조회 페이지"""
    survey = get_object_or_404(Survey, id=survey_id)
    
    # 권한 확인: staff 또는 생성자만 볼 수 있음
    if not (request.user.is_staff or request.user == survey.created_by):
        return redirect('survey_list')
    
    questions = survey.questions.all().prefetch_related('choices')

    context = {
        'survey': survey,
        'questions': questions,
        'is_admin': True,
    }
    return render(request, 'community/survey_results.html', context)


@login_required
def survey_results_api(request, survey_id):
    """설문 결과 API"""
    survey = get_object_or_404(Survey, id=survey_id)
    
    # 권한 확인
    if not (request.user.is_staff or request.user == survey.created_by):
        return JsonResponse({'error': '권한이 없습니다.'}, status=403)
    
    results = []
    responses = survey.responses.prefetch_related('answers__question', 'answers__choice')
    
    for question in survey.questions.all():
        question_result = {
            'id': question.id,
            'title': question.question_text,
            'type': question.question_type,
            'stats': [],
            'answers': []
        }
        
        if question.question_type == 'CHOICE':
            for choice in question.choices.all():
                count = question.answers.filter(choice=choice).count()
                question_result['stats'].append({
                    'choice_id': choice.id,
                    'choice_text': choice.choice_text,
                    'count': count,
                })
        
        elif question.question_type == 'SCALE':
            for scale in range(1, 6):
                count = question.answers.filter(scale_answer=scale).count()
                question_result['stats'].append({
                    'scale': scale,
                    'count': count,
                })
        
        elif question.question_type == 'TEXT':
            for answer in question.answers.select_related('response__respondent').all():
                respondent_name = 'Anonymous'
                if not survey.is_anonymous and answer.response.respondent:
                    respondent_name = _user_display_name(answer.response.respondent)
                
                if answer.text_answer:
                    question_result['answers'].append({
                        'text': answer.text_answer,
                        'respondent': respondent_name,
                    })
        
        results.append(question_result)
    
    return JsonResponse({'results': results})


@staff_member_required
def survey_results_export(request, survey_id):
    """설문 결과 CSV 다운로드"""
    survey = get_object_or_404(Survey, id=survey_id)
    
    # 권한 확인
    if not (request.user.is_staff or request.user == survey.created_by):
        return JsonResponse({'error': '권한이 없습니다.'}, status=403)
    
    responses = survey.responses.prefetch_related('answers__question', 'answers__choice').order_by('-created_at')
    questions = list(survey.questions.all())

    http_response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    http_response['Content-Disposition'] = f'attachment; filename="{survey.title}_결과.csv"'

    writer = csv.writer(http_response)

    headers = []
    if not survey.is_anonymous:
        headers.append('응답자')
    headers.append('응답 시간')
    headers.extend([question.question_text for question in questions])
    writer.writerow(headers)

    for response_obj in responses:
        row = []

        if not survey.is_anonymous:
            row.append(_user_display_name(response_obj.respondent))

        row.append(timezone.localtime(response_obj.created_at).strftime('%Y-%m-%d %H:%M'))

        for question in questions:
            answer = response_obj.answers.filter(question=question).first()
            if answer:
                if answer.choice:
                    value = answer.choice.choice_text
                elif answer.text_answer:
                    value = answer.text_answer
                elif answer.scale_answer:
                    value = f"★ {answer.scale_answer}/5"
                else:
                    value = ''
            else:
                value = '(미응답)'
            row.append(value)
        writer.writerow(row)

    return http_response


@staff_member_required
def recruit_list(request):
    """모집 폼 목록 (스태프 전용)"""
    all_forms = RecruitmentForm.objects.all()
    active_forms = [form for form in all_forms if not form.is_closed]
    closed_forms = [form for form in all_forms if form.is_closed]
    return render(request, 'community/recruit_list.html', {
        'active_forms': active_forms,
        'closed_forms': closed_forms,
    })


@staff_member_required
def recruit_create(request):
    """모집 폼 생성 (스태프 전용)"""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        starts_at_str = request.POST.get('starts_at', '').strip()
        ends_at_str = request.POST.get('ends_at', '').strip()
        is_active = request.POST.get('is_active') == 'on'

        if not title:
            messages.error(request, '제목을 입력해주세요.')
            return redirect('recruit_create')

        def _parse_dt(dt_str):
            if not dt_str:
                return None
            try:
                naive_dt = dt_module.datetime.fromisoformat(dt_str)
                return timezone.make_aware(naive_dt)
            except (ValueError, TypeError):
                return None

        opens_at = _parse_dt(starts_at_str)
        closes_at = _parse_dt(ends_at_str)

        RecruitmentForm.objects.create(
            title=title,
            description=description,
            is_active=is_active,
            opens_at=opens_at,
            closes_at=closes_at,
            created_by=request.user
        )
        messages.success(request, '모집 폼이 성공적으로 생성되었습니다.')
        return redirect('recruit_list')

    return render(request, 'community/recruit_create.html')


@staff_member_required
def recruit_edit(request, form_id):
    """모집 폼 수정 (스태프 전용)"""
    form_obj = get_object_or_404(RecruitmentForm, id=form_id)
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        starts_at_str = request.POST.get('starts_at', '').strip()
        ends_at_str = request.POST.get('ends_at', '').strip()
        is_active = request.POST.get('is_active') == 'on'

        if not title:
            messages.error(request, '제목을 입력해주세요.')
            return redirect('recruit_edit', form_id=form_id)

        def _parse_dt(dt_str):
            if not dt_str:
                return None
            try:
                naive_dt = dt_module.datetime.fromisoformat(dt_str)
                return timezone.make_aware(naive_dt)
            except (ValueError, TypeError):
                return None

        form_obj.title = title
        form_obj.description = description
        form_obj.opens_at = _parse_dt(starts_at_str)
        form_obj.closes_at = _parse_dt(ends_at_str)
        form_obj.is_active = is_active
        form_obj.save()

        messages.success(request, '모집 폼이 수정되었습니다.')
        return redirect('recruit_list')

    return render(request, 'community/recruit_edit.html', {'form': form_obj})


@staff_member_required
def recruit_manage(request, form_id):
    """지원서 관리/조회 (스태프 전용)"""
    form_obj = get_object_or_404(RecruitmentForm, id=form_id)
    applications = form_obj.applications.all()
    return render(request, 'community/recruit_manage.html', {
        'form': form_obj,
        'applications': applications
    })


@staff_member_required
def recruit_download_csv(request, form_id):
    """지원서 CSV 다운로드 (스태프 전용)"""
    form_obj = get_object_or_404(RecruitmentForm, id=form_id)
    applications = form_obj.applications.all()

    import csv
    from django.http import HttpResponse
    response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    response['Content-Disposition'] = f'attachment; filename="recruitment_{form_id}_applications.csv"'

    writer = csv.writer(response)
    writer.writerow(['이름', '학번', '학과', '연락처', '지원동기', '제출시간', '제출IP'])

    for app in applications:
        local_time = timezone.localtime(app.submitted_at).strftime('%Y-%m-%d %H:%M:%S')
        writer.writerow([
            app.name,
            app.student_id,
            app.department,
            app.contact,
            app.motivation,
            local_time,
            app.ip_address or '-'
        ])

    return response


def recruit_apply(request, form_id):
    """비로그인 지원서 제출 (공개)"""
    form_obj = get_object_or_404(RecruitmentForm, id=form_id)

    # 마감 여부 확인
    if form_obj.is_closed:
        return render(request, 'community/recruit_apply.html', {
            'form': form_obj,
            'is_closed': True,
            'error_message': '현재 모집 기간이 아닙니다.'
        })

    import time
    if request.method == 'POST':
        # 1. Honeypot 검증
        if request.POST.get('email_confirm'):
            return HttpResponse("Invalid submission", status=400)

        # 2. 시간 검증 (3초 이내 제출 시 차단)
        load_time_key = f'recruit_load_time_{form_id}'
        load_time = request.session.get(load_time_key)
        if not load_time or (time.time() - load_time < 3):
            messages.error(request, '너무 빠른 제출입니다. 내용을 다시 확인 후 잠시 후에 다시 시도해주세요.')
            return redirect('recruit_apply', form_id=form_id)

        # 3. IP 기반 Rate Limit (1시간 최대 3회)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        one_hour_ago = timezone.now() - dt_module.timedelta(hours=1)
        recent_count = RecruitmentApplication.objects.filter(
            form=form_obj,
            ip_address=ip,
            submitted_at__gte=one_hour_ago
        ).count()

        if recent_count >= 3:
            messages.error(request, '동일한 IP에서 너무 많은 지원서가 제출되었습니다. 1시간 뒤에 다시 시도해주세요.')
            return redirect('recruit_apply', form_id=form_id)

        name = request.POST.get('name', '').strip()
        student_id = request.POST.get('student_id', '').strip()
        department = request.POST.get('department', '').strip()
        contact = request.POST.get('contact', '').strip()
        motivation = request.POST.get('motivation', '').strip()

        if not (name and student_id and department and contact and motivation):
            messages.error(request, '필수 항목을 모두 작성해주세요.')
            return redirect('recruit_apply', form_id=form_id)

        # 지원서 저장
        RecruitmentApplication.objects.create(
            form=form_obj,
            name=name,
            student_id=student_id,
            department=department,
            contact=contact,
            motivation=motivation,
            ip_address=ip
        )

        if load_time_key in request.session:
            del request.session[load_time_key]

        messages.success(request, '지원서가 성공적으로 제출되었습니다. 지원해주셔서 감사합니다!')
        return render(request, 'community/recruit_apply.html', {
            'form': form_obj,
            'is_success': True
        })

    request.session[f'recruit_load_time_{form_id}'] = time.time()
    return render(request, 'community/recruit_apply.html', {'form': form_obj})


# ==============================================================================
# 5. 커뮤니티 자유 게시판 & 번개 모임
# ==============================================================================

@login_required
def community_home(request):
    """자유게시판과 번개 모임 목록을 보여주는 통합 홈 뷰"""
    posts = CommunityPost.objects.select_related('author').order_by('-created_at')
    
    # 취소되지 않은 번개모임 조회
    gatherings = GatheringEvent.objects.filter(is_canceled=False).select_related('author').prefetch_related('participants').order_by('-created_at')
    
    # 각 번개모임별로 현재 사용자가 참여했는지 여부 동적 주입
    for g in gatherings:
        g.user_joined = request.user in g.participants.all()

    return render(request, 'community/community_home.html', {
        'title': '커뮤니티',
        'posts': posts,
        'hot_posts': [],
        'gatherings': gatherings,
    })


@login_required
def post_detail(request, post_id):
    """자유게시판 상세 보기 및 댓글 목록/작성"""
    post = get_object_or_404(CommunityPost, id=post_id)
    
    # 조회수 증가
    post.views += 1
    post.save(update_fields=['views'])

    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add_comment':
            content = request.POST.get('content', '').strip()
            if content:
                CommunityComment.objects.create(post=post, author=request.user, content=content)
                messages.success(request, '댓글이 등록되었습니다.')
            return redirect('post_detail', post_id=post.id)

        elif action == 'delete_comment':
            comment_id = request.POST.get('comment_id')
            comment = get_object_or_404(CommunityComment, id=comment_id, post=post)
            # 본인 혹은 스태프만 삭제 가능
            if request.user == comment.author or request.user.is_staff:
                comment.delete()
                messages.success(request, '댓글이 삭제되었습니다.')
            else:
                messages.error(request, '댓글 삭제 권한이 없습니다.')
            return redirect('post_detail', post_id=post.id)

    comments = post.community_comments.select_related('author').order_by('-created_at')
    return render(request, 'community/post_detail.html', {
        'title': post.title,
        'post': post,
        'comments': comments,
    })


@login_required
def post_create(request):
    """자유게시판 게시글 작성"""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '').strip()

        if not title or not content:
            messages.error(request, '제목과 내용을 모두 입력해 주세요.')
            return render(request, 'community/post_create.html', {
                'title': '글쓰기',
                'post_title': title,
                'post_content': content
            })

        post = CommunityPost.objects.create(
            title=title,
            content=content,
            author=request.user
        )
        messages.success(request, '게시글이 성공적으로 등록되었습니다.')
        return redirect('post_detail', post_id=post.id)

    return render(request, 'community/post_create.html', {
        'title': '글쓰기'
    })


@login_required
def post_edit(request, post_id):
    """자유게시판 게시글 수정"""
    post = get_object_or_404(CommunityPost, id=post_id)

    if request.user != post.author:
        messages.error(request, '본인의 게시글만 수정할 수 있습니다.')
        return redirect('post_detail', post_id=post.id)

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '').strip()

        if not title or not content:
            messages.error(request, '제목과 내용을 모두 입력해 주세요.')
            return render(request, 'community/post_create.html', {
                'title': '글 수정',
                'post': post,
                'is_edit': True
            })

        post.title = title
        post.content = content
        post.save(update_fields=['title', 'content'])
        messages.success(request, '게시글이 수정되었습니다.')
        return redirect('post_detail', post_id=post.id)

    return render(request, 'community/post_create.html', {
        'title': '글 수정',
        'post': post,
        'is_edit': True
    })


@login_required
def post_delete(request, post_id):
    """자유게시판 게시글 삭제"""
    if request.method == 'POST':
        post = get_object_or_404(CommunityPost, id=post_id)
        if request.user == post.author or request.user.is_staff:
            post.delete()
            messages.success(request, '게시글이 삭제되었습니다.')
        else:
            messages.error(request, '삭제 권한이 없습니다.')
    return redirect('community_home')


@login_required
def gathering_detail(request, gathering_id):
    """번개 모임 상세 보기 및 댓글"""
    gathering = get_object_or_404(GatheringEvent, id=gathering_id)
    
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add_comment':
            content = request.POST.get('content', '').strip()
            if content:
                GatheringComment.objects.create(gathering=gathering, author=request.user, content=content)
                messages.success(request, '댓글이 등록되었습니다.')
            return redirect('gathering_detail', gathering_id=gathering.id)

        elif action == 'delete_comment':
            comment_id = request.POST.get('comment_id')
            comment = get_object_or_404(GatheringComment, id=comment_id, gathering=gathering)
            if request.user == comment.author or request.user.is_staff:
                comment.delete()
                messages.success(request, '댓글이 삭제되었습니다.')
            else:
                messages.error(request, '댓글 삭제 권한이 없습니다.')
            return redirect('gathering_detail', gathering_id=gathering.id)

    comments = gathering.gathering_comments.select_related('author').order_by('-created_at')
    participants = gathering.participants.all()
    user_joined = request.user in participants

    return render(request, 'community/gathering_detail.html', {
        'title': gathering.title,
        'gathering': gathering,
        'comments': comments,
        'participants': participants,
        'user_joined': user_joined,
    })


@login_required
def gathering_create(request):
    """번개 모임 개설"""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        event_date_str = request.POST.get('event_date', '').strip()
        location = request.POST.get('location', '').strip()
        max_participants_str = request.POST.get('max_participants', '').strip()

        if not (title and description and event_date_str and location and max_participants_str):
            messages.error(request, '모든 필수 항목을 입력해 주세요.')
            return render(request, 'community/gathering_create.html', {
                'title': '번개 모임 만들기',
                'title_val': title,
                'description_val': description,
                'event_date_val': event_date_str,
                'location_val': location,
                'max_participants_val': max_participants_str
            })

        try:
            parsed_date = dt_module.datetime.fromisoformat(event_date_str)
            if timezone.is_naive(parsed_date):
                event_date = timezone.make_aware(parsed_date)
            else:
                event_date = parsed_date
            max_participants = int(max_participants_str)
            if max_participants <= 0:
                raise ValueError("정원은 1명 이상이어야 합니다.")
        except (ValueError, TypeError):
            messages.error(request, '올바른 날짜 형식과 정원 수치를 입력해 주세요.')
            return render(request, 'community/gathering_create.html', {
                'title': '번개 모임 만들기',
                'title_val': title,
                'description_val': description,
                'event_date_val': event_date_str,
                'location_val': location,
                'max_participants_val': max_participants_str
            })

        with transaction.atomic():
            gathering = GatheringEvent.objects.create(
                title=title,
                description=description,
                author=request.user,
                event_date=event_date,
                location=location,
                max_participants=max_participants
            )
            # 주최자 참가 자동 등록
            gathering.participants.add(request.user)

            # 주최자 개인 일정 등록
            Schedule.objects.create(
                user=request.user,
                title=f"[번개] {gathering.title}",
                start_date=event_date,
                end_date=None,
                is_global=False,
                external_id=f"gathering:{gathering.id}",
                description=f"장소: {location} / 주최: {request.user.get_full_name or request.user.username}"
            )

        messages.success(request, '번개 모임이 개설되었습니다!')
        return redirect('gathering_detail', gathering_id=gathering.id)

    return render(request, 'community/gathering_create.html', {
        'title': '번개 모임 만들기'
    })


@login_required
def gathering_join_toggle(request, gathering_id):
    """번개 모임 참가 신청 / 취소 토글 API (POST)"""
    if request.method == 'POST':
        gathering = get_object_or_404(GatheringEvent, id=gathering_id)

        if gathering.is_canceled:
            return JsonResponse({'status': 'error', 'message': '이미 취소된 모임입니다.'}, status=400)

        with transaction.atomic():
            # 이미 참가했는지 검증
            has_joined = gathering.participants.filter(id=request.user.id).exists()

            if has_joined:
                # 참가 취소
                if request.user == gathering.author:
                    return JsonResponse({'status': 'error', 'message': '모임 개설자는 참가를 취소할 수 없습니다. 모임 취소 기능을 이용해 주세요.'}, status=400)
                
                gathering.participants.remove(request.user)
                # 개인 일정 삭제
                Schedule.objects.filter(user=request.user, external_id=f"gathering:{gathering.id}").delete()
                return JsonResponse({'status': 'success', 'joined': False, 'message': '번개 모임 참가를 취소했습니다.'})
            else:
                # 참가 신청
                # 정원 초과 여부 검증
                if gathering.participant_count >= gathering.max_participants:
                    return JsonResponse({'status': 'error', 'message': '정원이 마감되어 신청할 수 없습니다.'}, status=400)

                gathering.participants.add(request.user)
                # 개인 일정 등록
                Schedule.objects.update_or_create(
                    user=request.user,
                    external_id=f"gathering:{gathering.id}",
                    defaults={
                        "title": f"[번개] {gathering.title}",
                        "start_date": gathering.event_date,
                        "end_date": None,
                        "is_global": False,
                        "description": f"장소: {gathering.location} / 주최: {gathering.author.get_full_name or gathering.author.username}",
                    }
                )
                return JsonResponse({'status': 'success', 'joined': True, 'message': '번개 모임 참가가 신청되었습니다!'})

    return JsonResponse({'status': 'error', 'message': '올바르지 않은 요청 방식입니다.'}, status=400)


@login_required
def gathering_cancel(request, gathering_id):
    """번개 모임 폭파/취소 (POST)"""
    if request.method == 'POST':
        gathering = get_object_or_404(GatheringEvent, id=gathering_id)

        if request.user != gathering.author and not request.user.is_staff:
            messages.error(request, '모임 취소 권한이 없습니다.')
            return redirect('gathering_detail', gathering_id=gathering.id)

        with transaction.atomic():
            gathering.is_canceled = True
            gathering.save(update_fields=['is_canceled'])

            # 참여했던 모든 사람들의 개인 일정 일괄 삭제
            Schedule.objects.filter(external_id=f"gathering:{gathering.id}").delete()

        messages.success(request, '번개 모임이 취소(폭파)되었습니다.')
        return redirect('community_home')

    return redirect('gathering_detail', gathering_id=gathering_id)

