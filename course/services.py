from django.contrib.auth import get_user_model

from mypage.models import Subject

from .models import Course, CourseCategory, Lesson, Unit


def sync_course_from_draft(subject_code, draft, instructor=None):
    """draft: {"title", "description", "units": [{"title", "lessons": [{"title", "content"}]}]}
    subject_code로 Course를 upsert하고, Unit/Lesson은 매번 새로 만든다(기존 것은 삭제 후 재생성).
    강의 제목은 draft["title"]이 아니라 "과목 코드(과목명)" 형식으로 고정한다(Subject.code가 없으면 과목명만 사용)."""
    instructor = instructor or get_user_model().objects.filter(is_superuser=True).first()
    category, _ = CourseCategory.objects.get_or_create(title="AI 자동 생성")
    subject = Subject.objects.filter(name=subject_code).first()
    title = f"{subject.code}({subject.name})" if subject and subject.code else subject_code
    course, created = Course.objects.get_or_create(
        code=subject_code,
        defaults={
            "title": title,
            "summary": draft["description"],
            "category": category,
            "instructor": instructor,
        },
    )
    if not created:
        course.title = title
        course.summary = draft["description"]
        course.save()

    course.units.all().delete()
    course.lessons.all().delete()

    lesson_order = 0
    for unit_idx, unit in enumerate(draft["units"]):
        Unit.objects.create(course=course, title=unit["title"], order=unit_idx)
        for lesson in unit["lessons"]:
            Lesson.objects.create(
                course=course,
                title=lesson["title"],
                content=lesson["content"],
                order=lesson_order,
            )
            lesson_order += 1

    return course, created, lesson_order
