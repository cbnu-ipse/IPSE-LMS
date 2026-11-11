"""이미 올라온 PPT·Word 자료를 PDF로 바꿔 원문 칸에 원본 모양으로 보이게 한다 (이 기능이 생기기 전에 올린 자료용).
사용: python manage.py convert_document_pdfs [--document 12] [--force]
기본은 아직 변환하지 않은(또는 변환하지 못한) 자료만 처리한다. LibreOffice가 없으면 아무것도 하지 않는다."""
from django.core.management.base import BaseCommand, CommandError

from mypage import convert
from mypage.models import PersonalDocument


class Command(BaseCommand):
    help = "PPT·PPTX·DOC·DOCX·RTF 자료를 PDF로 변환해 저장한다 (AI를 부르지 않는다)."

    def add_arguments(self, parser):
        parser.add_argument("--document", type=int, help="이 자료 하나만")
        parser.add_argument("--force", action="store_true", help="이미 변환한 자료도 다시")

    def handle(self, *args, **options):
        if not convert.soffice_path():
            raise CommandError("LibreOffice(soffice)를 찾을 수 없어 변환할 수 없습니다.")
        docs = PersonalDocument.objects.exclude(file="")
        if options["document"]:
            docs = docs.filter(pk=options["document"])
        done = failed = 0
        for doc in docs.iterator():
            if not convert.needs_conversion(doc.file.name):
                continue
            if not options["force"] and doc.file.storage.exists(convert.pdf_name(doc.pk)):
                continue
            if convert.convert_document(doc):
                done += 1
                self.stdout.write(f"자료 {doc.pk} ({doc.title[:30]}): 변환 완료")
            else:
                failed += 1
                self.stderr.write(f"자료 {doc.pk} ({doc.title[:30]}): 변환하지 못했습니다.")
        self.stdout.write(self.style.SUCCESS(f"변환 {done}개, 실패 {failed}개"))
