"""예전 강의 초안 형식(yhw_agent_project 프로토타입의 review_queue.json)을 검토용 초안으로 바꾼다.
게시는 course/studio.py의 승인 절차를 거친다 — 여기서 강의를 직접 바꾸지 않는다."""
import hashlib
import json

from .models import CourseDraft
from .studio import course_title


def legacy_to_content(subject_code, draft):
    """{"title", "description", "units": [{"title", "lessons": [{"title", "content"}]}]} → 초안 내용 형식.
    예전 수업 본문은 '---'로 나뉜 페이지를 개념 카드 한 장씩으로 옮긴다."""
    chapters = []
    for unit in draft.get("units", []):
        sets = []
        for lesson in unit.get("lessons", []):
            pages = [p.strip() for p in (lesson.get("content") or "").split("\n---\n") if p.strip()]
            if pages:
                sets.append({"title": lesson.get("title", ""), "questions": [],
                             "cards": [{"title": "", "body": page} for page in pages]})
        if sets:
            chapters.append({"title": unit.get("title", ""), "summary": "", "doc_ids": [], "source_hash": "",
                             "sets": sets})
    return {"title": course_title(subject_code), "description": draft.get("description", ""), "chapters": chapters}


def queue_legacy_draft(subject_code, draft):
    """검토 대기 초안으로 넣는다. 같은 내용이 이미 있으면 (False, 기존 초안)."""
    digest = hashlib.sha256(json.dumps(["legacy", draft], ensure_ascii=False, sort_keys=True).encode()).hexdigest()
    existing = CourseDraft.objects.filter(subject_code=subject_code, source_hash=digest).first()
    if existing:
        return False, existing
    return True, CourseDraft.objects.create(subject_code=subject_code, source_hash=digest,
                                            status=CourseDraft.Status.PENDING,
                                            content=legacy_to_content(subject_code, draft))
