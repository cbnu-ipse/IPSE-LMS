import datetime as dt_module
from datetime import date

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.contrib import messages
from django.utils import timezone
from .models import NewsAndEvents, NewsAndEventsComment, Poll, PollChoice, PollVote


@login_required
def community_main(request):
    notices = NewsAndEvents.objects.filter(posted_as='News').order_by('-upload_time')[:5]
    # 💡 수정됨: 빈 리스트였던 activities에 실제 Event 데이터를 불러옴
    activities = NewsAndEvents.objects.filter(posted_as='Event').order_by('-upload_time')[:6]
    
    context = {'notices': notices, 'activities': activities}
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
    active_polls = Poll.objects.filter(is_active=True).prefetch_related('choices', 'votes')
    closed_polls = Poll.objects.filter(is_active=False).prefetch_related('choices', 'votes')
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

    if request.method == 'POST' and not is_closed:
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

    return render(request, 'community/poll_detail.html', {
        'poll': poll,
        'choices': choices,
        'total_voters': total_voters,
        'user_voted_choice_ids': user_voted_choice_ids,
        'has_voted': bool(user_voted_choice_ids),
        'is_closed': is_closed,
    })


@staff_member_required
def poll_create(request):
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        is_multiple = request.POST.get('is_multiple') == 'on'
        is_anonymous = request.POST.get('is_anonymous') == 'on'
        ends_at_date = request.POST.get('ends_at_date', '').strip()
        ends_at_time = request.POST.get('ends_at_time', '').strip()
        choice_texts = [t.strip() for t in request.POST.getlist('choices') if t.strip()]

        if not title:
            messages.error(request, '제목을 입력해주세요.')
            return redirect('poll_create')
        if len(choice_texts) < 2:
            messages.error(request, '선택 항목을 2개 이상 입력해주세요.')
            return redirect('poll_create')

        ends_at = None
        if ends_at_date:
            try:
                d = dt_module.date.fromisoformat(ends_at_date)
                t = dt_module.time.fromisoformat(ends_at_time) if ends_at_time else dt_module.time(23, 59)
                ends_at = timezone.make_aware(dt_module.datetime.combine(d, t))
            except (ValueError, TypeError):
                ends_at = None

        poll = Poll.objects.create(
            title=title,
            description=description,
            created_by=request.user,
            is_multiple=is_multiple,
            is_anonymous=is_anonymous,
            ends_at=ends_at,
        )
        for i, txt in enumerate(choice_texts):
            PollChoice.objects.create(poll=poll, text=txt, order=i)

        return redirect('poll_detail', poll_id=poll.id)

    return render(request, 'community/poll_create.html')


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