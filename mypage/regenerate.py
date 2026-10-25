"""운영진이 자료 하나의 요약·주제 분류·강의 초안을 처음부터 다시 만든다 (관리자 화면 액션, regenerate_documents 명령)."""
import logging
import threading

from django.db import connection

from assistant.guardrails import detect_prompt_injection

from .ai import extract_text, generate_summary
from .models import PersonalDocument, ProcessingStatus

logger = logging.getLogger(__name__)


def regenerate_document(document_id, reextract=True):
    """파일에서 본문을 다시 뽑고(reextract) 요약 → 주제 분류 → 강의 초안을 강제로 다시 만든다.
    운영진 작업이라 사용자 하루 한도에는 넣지 않는다. 성공하면 True."""
    from course.topics import after_summary

    document = PersonalDocument.objects.get(pk=document_id)
    try:
        text = document.extracted_text
        if reextract and document.file:
            with document.file.open("rb") as fh:
                text = extract_text(fh, document.file.name, user=None) or text
        if detect_prompt_injection(text):
            raise ValueError("프롬프트 인젝션으로 의심되는 내용이 있어 중단했습니다.")
        PersonalDocument.objects.filter(pk=document_id).update(extracted_text=text, summary_status=ProcessingStatus.PROCESSING)
        summary = generate_summary(text, user=None)
        if not summary.strip():
            raise ValueError("요약이 비어 있습니다.")
        PersonalDocument.objects.filter(pk=document_id).update(summary=summary, summary_status=ProcessingStatus.DONE)
        after_summary(document_id, force=True)
        return True
    except Exception:
        logger.exception("문서 %s 재생성 실패", document_id)
        PersonalDocument.objects.filter(pk=document_id).update(summary_status=ProcessingStatus.FAILED)
        return False


def regenerate_in_background(document_ids, reextract=True):
    """관리자 화면에서 부를 때: 요청을 막지 않도록 스레드에서 차례로 돌린다."""
    ids = list(document_ids)
    PersonalDocument.objects.filter(pk__in=ids).update(summary_status=ProcessingStatus.PROCESSING)

    def run():
        try:
            for pk in ids:
                regenerate_document(pk, reextract=reextract)
        finally:
            connection.close()

    threading.Thread(target=run, daemon=True).start()
