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
    Survey, SurveyQuestion, SurveyQuestionChoice, SurveyResponse, SurveyAnswer, SurveyComment
)


def _user_display_name(user):
    if not user:
        return '(삭제됨)'

    full_name = getattr(user, 'get_full_name', '')
    if callable(full_name):
        full_name = full_name()

    return full_name or getattr(user, 'display_name', '') or getattr(user, 'username', '(삭제됨)')


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

