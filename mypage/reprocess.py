"""자료 정보(구분·과목·교수)를 고친 뒤 분류·출제 스타일·강의 초안을 새 정보에 맞게 다시 맞춘다 (백그라운드 스레드)."""
import logging

from django.db import connection

from .exam import professor_key, professor_topics, refresh_for
from .models import PersonalDocument

logger = logging.getLogger(__name__)


def snapshot(document):
    """고치기 전 상태 — 옛 과목·교수에 남은 스타일과 강의 초안도 정리하려면 필요하다."""
    return {"document_type": document.document_type, "professor": document.professor,
            "course_name": document.course_name, "topics": list(document.topics.values_list("name", flat=True))}


def changed(document, old):
    return (document.document_type, document.professor.strip(), document.course_name.strip()) != \
        (old["document_type"], old["professor"].strip(), old["course_name"].strip())


def reprocess_after_edit(document_id, old):
    """새 정보로 다시 분류하고(과목 이름을 적었으면 그 이름이 주제), 옛 정보에 딸려 있던 스타일·초안도 새로 맞춘다."""
    from course.studio import build_draft
    from course.topics import after_summary

    try:
        after_summary(document_id)                      # 새 구분·과목·교수 기준 분류 + 스타일 + 초안
        old_prof = professor_key(old["professor"])
        if old["document_type"] == PersonalDocument.DocumentType.EXAM:
            refresh_for(professors=[old["professor"]], subjects=[] if old_prof else old["topics"])
        topics = set(old["topics"]) | (professor_topics(old["professor"]) if old_prof else set())
        for name in sorted(topics):                     # 옛 과목·교수 쪽 강의도 자료·스타일이 바뀌었다
            build_draft(name)
    except Exception:
        logger.exception("문서 %s 정보 수정 후 처리 실패", document_id)
    finally:
        connection.close()
