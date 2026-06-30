from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import HttpResponseForbidden

from .models import CourseCategory, Course, UserCourseProgress, Upload, UploadVideo, Lesson, CourseComment
from .forms import LecturerCourseForm, LessonForm
from accounts.decorators import lecturer_required
from core.models import ActivityLog
from ranking.utils import sync_user_profile_metrics
import os
import textwrap


def is_course_manager(user, course):
    return user == course.instructor or user.is_staff


@login_required
def course_list(request):
    query = request.GET.get('q', '')
    category_id = request.GET.get('category', '')

    courses = Course.objects.all().select_related('category', 'instructor')

    if query:
        courses = courses.filter(title__icontains=query)
    if category_id:
        courses = courses.filter(category_id=category_id)

    categories = CourseCategory.objects.all()

    user_progresses = UserCourseProgress.objects.filter(
        user=request.user,
        course__in=courses
    ).prefetch_related('completed_lessons')

    progress_map = {
        progress.course_id: progress.progress_percentage
        for progress in user_progresses
    }

    for course in courses:
        course.progress_percent = progress_map.get(course.id, 0)

    return render(request, 'course/course_list.html', {
        'categories': categories,
        'courses': courses,
        'query': query,
        'selected_category': category_id,
    })


@login_required
def course_detail(request, slug):
    course = get_object_or_404(Course, slug=slug)
    videos = UploadVideo.objects.filter(course=course).order_by('-timestamp')
    files = Upload.objects.filter(course=course)
    progress, created = UserCourseProgress.objects.get_or_create(user=request.user, course=course)
    comments = course.comments.select_related("author").all()
    manager = is_course_manager(request.user, course)

    selected_video = None
    selected_video_id = request.GET.get("video")
    if selected_video_id:
        selected_video = videos.filter(id=selected_video_id).first()
    if not selected_video:
        selected_video = videos.first()

    if request.method == "POST":
        action = request.POST.get("action")

        if action == "upload_material":
            if not manager:
                return HttpResponseForbidden("업로드 권한이 없습니다.")

            material_file = request.FILES.get("material_file")
            title = request.POST.get("material_title", "").strip()

            if not material_file:
                messages.error(request, "업로드할 실습 자료 파일을 선택해주세요.")
                return redirect("course_detail", slug=course.slug)

            if not title:
                title = os.path.basename(material_file.name)

            Upload.objects.create(course=course, title=title, file=material_file)
            messages.success(request, "실습 자료가 업로드되었습니다.")
            return redirect("course_detail", slug=course.slug)

        if action == "upload_video":
            if not manager:
                return HttpResponseForbidden("업로드 권한이 없습니다.")

            video_file = request.FILES.get("video_file")
            title = request.POST.get("video_title", "").strip()
            summary = request.POST.get("video_summary", "").strip()

            if not video_file:
                messages.error(request, "업로드할 영상 파일을 선택해주세요.")
                return redirect("course_detail", slug=course.slug)

            if not title:
                title = os.path.basename(video_file.name)

            UploadVideo.objects.create(
                course=course,
                title=title,
                summary=summary,
                video=video_file,
            )
            messages.success(request, "영상이 업로드되었습니다.")
            return redirect("course_detail", slug=course.slug)

        if action == "add_comment":
            content = request.POST.get("content", "").strip()
            if not content:
                messages.error(request, "댓글 내용을 입력해주세요.")
                return redirect("course_detail", slug=course.slug)

            CourseComment.objects.create(course=course, author=request.user, content=content)
            return redirect("course_detail", slug=course.slug)

        if action in {"edit_comment", "delete_comment"}:
            comment_id = request.POST.get("comment_id")
            comment = get_object_or_404(CourseComment, id=comment_id, course=course)

            can_edit = request.user == comment.author
            can_delete = request.user == comment.author or manager

            if action == "edit_comment":
                if not can_edit:
                    messages.error(request, "댓글 수정 권한이 없습니다.")
                    return redirect("course_detail", slug=course.slug)

                new_content = request.POST.get("content", "").strip()
                if not new_content:
                    messages.error(request, "댓글 내용을 입력해주세요.")
                    return redirect("course_detail", slug=course.slug)

                comment.content = new_content
                comment.save(update_fields=["content"])
                return redirect("course_detail", slug=course.slug)

            if not can_delete:
                messages.error(request, "댓글 삭제 권한이 없습니다.")
                return redirect("course_detail", slug=course.slug)

            comment.delete()
            return redirect("course_detail", slug=course.slug)

    completed_lesson_ids = progress.completed_lessons.values_list('id', flat=True)

    all_lessons = course.lessons.all().order_by('id')
    next_lesson = None

    for lesson in all_lessons:
        if lesson.id not in completed_lesson_ids:
            next_lesson = lesson
            break

    if not next_lesson and all_lessons.exists():
        next_lesson = all_lessons.first()

    return render(request, 'course/course_detail.html', {
        'course': course,
        'videos': videos,
        'selected_video': selected_video,
        'files': files,
        'progress': progress,
        'comments': comments,
        'completed_lesson_ids': completed_lesson_ids,
        'next_lesson': next_lesson,
        'is_course_manager': manager,
    })


@login_required
def lesson_detail(request, course_slug, lesson_pk):
    course = get_object_or_404(Course, slug=course_slug)
    lesson = get_object_or_404(Lesson, pk=lesson_pk, course=course)

    progress, created = UserCourseProgress.objects.get_or_create(
        user=request.user,
        course=course
    )

    lesson_newly_completed = False
    if lesson not in progress.completed_lessons.all():
        progress.completed_lessons.add(lesson)
        lesson_newly_completed = True

    if lesson_newly_completed and progress.progress_percentage == 100:
        ActivityLog.objects.get_or_create(
            user=request.user,
            action_type=ActivityLog.ActionType.COURSE,
            course=course,
            defaults={
                "message": f"{course.title} 강의를 완료했습니다.",
            },
        )

    if lesson_newly_completed:
        sync_user_profile_metrics(request.user)

    lessons = list(course.lessons.order_by('id'))
    current_index = lessons.index(lesson)
    prev_lesson = lessons[current_index - 1] if current_index > 0 else None
    next_lesson = lessons[current_index + 1] if current_index < len(lessons) - 1 else None

    return render(request, 'course/lesson_detail.html', {
        'course': course,
        'lesson': lesson,
        'progress': progress,
        'prev_lesson': prev_lesson,
        'next_lesson': next_lesson,
        'total_lessons': len(lessons),
    })


@login_required
def lesson_create(request, course_slug):
    course = get_object_or_404(Course, slug=course_slug)

    if not is_course_manager(request.user, course):
        return redirect('course_detail', slug=course_slug)

    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')

        if title and content:
            Lesson.objects.create(course=course, title=title, content=content)
            return redirect('course_detail', slug=course.slug)

    return render(request, 'course/lesson_create.html', {
        'course': course,
    })


@login_required
@require_POST
def course_update_summary(request, slug):
    course = get_object_or_404(Course, slug=slug)

    if not is_course_manager(request.user, course):
        return HttpResponseForbidden("편집 권한이 없습니다.")

    new_summary = request.POST.get('summary')

    if new_summary is not None:
        course.summary = textwrap.dedent(new_summary).strip()
        course.save()

    return redirect('course_detail', slug=course.slug)


@login_required
@require_POST
def lesson_delete(request, lesson_pk):
    lesson = get_object_or_404(Lesson, pk=lesson_pk)
    course = lesson.course

    if not is_course_manager(request.user, course):
        return HttpResponseForbidden("삭제 권한이 없습니다.")

    course_slug = course.slug
    lesson.delete()

    return redirect('course_detail', slug=course_slug)


@lecturer_required
def course_create(request):
    if request.method == 'POST':
        form = LecturerCourseForm(request.POST, request.FILES)
        if form.is_valid():
            course = form.save(commit=False)
            course.instructor = request.user
            course.save()
            messages.success(request, f"'{course.title}' 강의가 개설되었습니다.")
            return redirect('course_detail', slug=course.slug)
    else:
        form = LecturerCourseForm()

    return render(request, 'course/course_create.html', {'form': form})


@login_required
def course_edit(request, slug):
    course = get_object_or_404(Course, slug=slug)

    if not is_course_manager(request.user, course):
        messages.error(request, "이 강의를 수정할 권한이 없습니다.")
        return redirect('course_detail', slug=slug)

    if request.method == 'POST':
        form = LecturerCourseForm(request.POST, request.FILES, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, "강의 정보가 수정되었습니다.")
            return redirect('course_detail', slug=course.slug)
    else:
        form = LecturerCourseForm(instance=course)

    return render(request, 'course/course_edit.html', {'form': form, 'course': course})


@login_required
def course_delete(request, slug):
    course = get_object_or_404(Course, slug=slug)

    if not is_course_manager(request.user, course):
        messages.error(request, "이 강의를 삭제할 권한이 없습니다.")
        return redirect('course_detail', slug=slug)

    if request.method == 'POST':
        course.delete()
        messages.success(request, "강의가 삭제되었습니다.")
        return redirect('course_list')

    return render(request, 'course/course_delete.html', {'course': course})


@login_required
def lesson_edit(request, course_slug, lesson_pk):
    course = get_object_or_404(Course, slug=course_slug)
    lesson = get_object_or_404(Lesson, pk=lesson_pk, course=course)

    if not is_course_manager(request.user, course):
        messages.error(request, "이 수업을 수정할 권한이 없습니다.")
        return redirect('course_detail', slug=course_slug)

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '').strip()

        if title and content:
            lesson.title = title
            lesson.content = content
            lesson.save(update_fields=['title', 'content'])
            messages.success(request, "수업이 수정되었습니다.")
            return redirect('course_detail', slug=course.slug)
        else:
            messages.error(request, "제목과 내용을 모두 입력해주세요.")

    return render(request, 'course/lesson_edit.html', {
        'course': course,
        'lesson': lesson,
    })
