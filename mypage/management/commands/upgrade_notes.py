"""옛 형식의 요약 노트(옛 디자인, 쪽마다 따로 만든 자료)를 지금 형식(손글씨 디자인, 한 자료에 여러 쪽 이미지)으로 한꺼번에 바꾼다.
AI를 부르지 않고 저장된 노트 글에서 다시 그린다.

이미 지금 형식인 노트는 건너뛰므로 여러 번 실행해도 안전하다 (배포 때 자동으로 한 번 돌리고, 못 바꾼 노트는 열어 볼 때 바뀐다).
  python manage.py upgrade_notes            # 모두 바꾸기
  python manage.py upgrade_notes --dry-run  # 바꿀 노트만 세어 보기
"""
from django.core.management.base import BaseCommand

from mypage import cram
from mypage.models import PersonalDocument, ProcessingStatus


class Command(BaseCommand):
    help = "옛 형식의 요약 노트를 지금 형식으로 다시 그린다 (AI 호출 없음)."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="바꾸지 않고 대상만 센다")

    def handle(self, *args, dry_run=False, **options):
        seen, upgraded, failed, groups = set(), 0, 0, 0
        notes = PersonalDocument.objects.filter(document_type=PersonalDocument.DocumentType.NOTE, is_deleted=False,
                                                summary_status=ProcessingStatus.DONE).exclude(file="").order_by("pk")
        for doc in notes:
            if doc.pk in seen:
                continue
            group = cram.note_group(doc)
            seen.update(d.pk for d in group)
            if not cram.needs_upgrade(group):
                continue
            groups += 1
            if dry_run:
                continue
            try:
                if cram.upgrade_note_group(doc):
                    upgraded += 1
            except Exception as exc:                       # 한 노트가 실패해도 나머지는 계속 바꾼다
                failed += 1
                self.stderr.write(f"노트 {doc.pk} 실패: {exc}")
        verb = "바꿀 노트" if dry_run else "바꾼 노트"
        self.stdout.write(f"{verb}: {groups if dry_run else upgraded}개" + (f", 실패 {failed}개" if failed else ""))
