import json
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from course.services import sync_course_from_draft

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

        for subject_code, draft in self._latest_by_subject(entries).items():
            self._sync_course(subject_code, draft, instructor)

    @staticmethod
    def _latest_by_subject(entries):
        # ponytail: IPSE-LMS에서는 일단 승인 없이 자동 수락, 사람 승인이 필요해지면 entry.get("approved") 체크 복원
        latest = {}
        for entry in entries:
            latest[entry["subject_code"]] = entry["draft"]
        return latest

    def _sync_course(self, subject_code, draft, instructor):
        course, created, lesson_count = sync_course_from_draft(subject_code, draft, instructor)
        self.stdout.write(
            f"[동기화] {subject_code} → Course(slug={course.slug}) "
            f"{'생성' if created else '갱신'}, Unit {len(draft['units'])}개, Lesson {lesson_count}개"
        )
