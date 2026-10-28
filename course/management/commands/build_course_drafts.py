from django.core.management.base import BaseCommand

from course import studio
from mypage.models import Subject


class Command(BaseCommand):
    help = (
        "강의 초안을 주제별로 한꺼번에 만든다 (하루 한 번 cron: docker/crontab). 자료가 바뀌지 않은 주제는 AI를 부르지 않고 건너뛰며, "
        "바뀐 주제만 개요·챕터를 (바뀐 챕터만) 다시 만든다. 업로드할 때마다 만들지 않으므로 하루에 모인 자료가 한 번에 반영된다."
    )

    def add_arguments(self, parser):
        parser.add_argument("--topic", help="이 주제만 만든다")

    def handle(self, *args, **options):
        names = [options["topic"]] if options.get("topic") else list(Subject.objects.order_by("name").values_list("name", flat=True))
        built = skipped = failed = 0
        for name in names:
            try:
                draft = studio.build_draft(name)
            except Exception as exc:
                failed += 1
                self.stderr.write(f"[실패] {name}: {exc}")
                continue
            if draft:
                built += 1
                self.stdout.write(f"[초안] {name} → #{draft.pk}")
            else:
                skipped += 1
        self.stdout.write(f"끝: 만듦 {built} · 건너뜀(자료 없음/그대로) {skipped} · 실패 {failed}")
