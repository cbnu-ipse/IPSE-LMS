import json
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from course.services import queue_legacy_draft

REVIEW_QUEUE_PATH = os.path.join(
    settings.BASE_DIR, "yhw_agent_project", "prototype", "output", "review_queue.json"
)


class Command(BaseCommand):
    help = (
        "yhw_agent_project Agent가 만든 강의 초안(review_queue.json)을 강의 생성 탭의 검토 대기 초안으로 넣는다. "
        "강의에 반영하려면 강의자가 승인해야 한다."
    )

    def handle(self, *args, **options):
        with open(REVIEW_QUEUE_PATH, "r", encoding="utf-8") as f:
            entries = json.load(f)

        for subject_code, draft in self._latest_by_subject(entries).items():
            created, course_draft = queue_legacy_draft(subject_code, draft)
            self.stdout.write(f"[초안] {subject_code} → #{course_draft.pk} {'검토 대기로 추가' if created else '이미 있음'}")

    @staticmethod
    def _latest_by_subject(entries):
        latest = {}
        for entry in entries:
            latest[entry["subject_code"]] = entry["draft"]
        return latest
