import json
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from course.models import Course, CourseCategory, Lesson, Unit

REVIEW_QUEUE_PATH = os.path.join(
    settings.BASE_DIR, "yhw_agent_project", "prototype", "output", "review_queue.json"
)


class Command(BaseCommand):
    help = (
        "yhw_agent_project Agent가 사람 승인(HITL)까지 마친 강의 초안(review_queue.json)을 "
        "실제 course.Course/Unit/Lesson에 반영한다."
    )

    def handle(self, *args, **options):
        with open(REVIEW_QUEUE_PATH, "r", encoding="utf-8") as f:
            entries = json.load(f)

        instructor = get_user_model().objects.filter(is_superuser=True).first()

        for subject_code, draft in self._latest_approved_by_subject(entries).items():
            self._sync_course(subject_code, draft, instructor)

    @staticmethod
    def _latest_approved_by_subject(entries):
        latest = {}
        for entry in entries:
            if entry.get("approved"):
                latest[entry["subject_code"]] = entry["draft"]
        return latest

    def _sync_course(self, subject_code, draft, instructor):
        category, _ = CourseCategory.objects.get_or_create(title="AI 자동 생성")
        course, created = Course.objects.get_or_create(
            code=subject_code,
            defaults={
                "title": draft["title"],
                "summary": draft["description"],
                "category": category,
                "instructor": instructor,
            },
        )
        if not created:
            course.title = draft["title"]
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
                    content=lesson["content_outline"],
                    order=lesson_order,
                )
                lesson_order += 1

        self.stdout.write(
            f"[동기화] {subject_code} → Course(slug={course.slug}) "
            f"{'생성' if created else '갱신'}, Unit {len(draft['units'])}개, Lesson {lesson_order}개"
        )
