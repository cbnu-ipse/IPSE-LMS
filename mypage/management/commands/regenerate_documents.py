from django.core.management.base import BaseCommand, CommandError

from mypage.models import PersonalDocument
from mypage.regenerate import regenerate_document


class Command(BaseCommand):
    help = "자료의 요약·주제 분류·강의 초안을 처음부터 다시 만든다. 예: regenerate_documents 12 13 [--no-extract]"

    def add_arguments(self, parser):
        parser.add_argument("ids", nargs="+", type=int, help="PersonalDocument id")
        parser.add_argument("--no-extract", action="store_true", help="파일에서 본문을 다시 뽑지 않고 저장된 본문을 쓴다")

    def handle(self, *args, ids, no_extract, **options):
        missing = set(ids) - set(PersonalDocument.objects.filter(pk__in=ids).values_list("pk", flat=True))
        if missing:
            raise CommandError(f"없는 자료: {sorted(missing)}")
        for pk in ids:
            ok = regenerate_document(pk, reextract=not no_extract)
            self.stdout.write(f"{pk}: {'완료' if ok else '실패'}")
