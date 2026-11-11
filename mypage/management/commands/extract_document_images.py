"""이미 올라온 PPTX·DOCX 자료에서 그림을 뽑아 저장한다 (그림 뽑기 기능이 생기기 전에 올린 자료용).
사용: python manage.py extract_document_images [--document 12] [--force]
기본은 아직 뽑지 않은 자료만 처리한다."""
from django.core.management.base import BaseCommand

from mypage import images
from mypage.models import PersonalDocument


class Command(BaseCommand):
    help = "PPTX·DOCX 자료의 그림을 뽑아 저장한다 (AI를 부르지 않는다)."

    def add_arguments(self, parser):
        parser.add_argument("--document", type=int, help="이 자료 하나만")
        parser.add_argument("--force", action="store_true", help="이미 뽑은 자료도 다시")

    def handle(self, *args, **options):
        docs = PersonalDocument.objects.exclude(file="")
        if options["document"]:
            docs = docs.filter(pk=options["document"])
        done = pictures = 0
        for doc in docs.iterator():
            if not images.is_office_name(doc.file.name):
                continue
            if not options["force"] and images.load_index(doc) is not None:
                continue
            index = images.extract_for_document(doc)
            if index is None:
                self.stderr.write(f"자료 {doc.pk}: 그림을 뽑지 못했습니다.")
                continue
            done += 1
            pictures += len(index["images"])
            self.stdout.write(f"자료 {doc.pk} ({doc.title[:30]}): 그림 {len(index['images'])}개")
        self.stdout.write(self.style.SUCCESS(f"자료 {done}개에서 그림 {pictures}개를 저장했습니다."))
