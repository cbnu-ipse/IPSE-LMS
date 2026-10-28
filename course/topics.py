"""
업로드된 자료의 주제 분류 (사람이 과목·강의를 고르지 않는다).

업로드 → 요약이 끝나면 after_summary(document_id):
  1. classify_document: 자료 제목과 요약 앞부분, 기존 주제 목록(이름 + 설명)을 보고 AI가 어느 주제인지
     (기존 주제 중 하나 이상 + 필요하면 새 주제, 최대 3개)를 정한다. 그래서 한 자료가 새 강의를 만들면서 기존 강의에도 추가될 수 있다. 자료는 걸러내지 않는다 — 어떤 자료든 강의에 쓰인다.
     결과는 PersonalDocument.topics(다대다)와 대표 주제 subject_code, 새 주제는 Subject에 남는다.
  2. 강의 초안은 업로드할 때마다 만들지 않는다 (자료 하나마다 개요·챕터를 다시 쓰면 토큰이 너무 든다). 초안은
     - 매일 새벽 한 번 `manage.py build_course_drafts`(docker/crontab)가 자료가 바뀐 주제만 한꺼번에 만들고,
     - 강의자가 judge > 강의 생성에서 '지금 초안 만들기'를 눌러 바로 만들 수 있다 (course/studio.build_draft, 근거가 그대로인 챕터는
       재사용하므로 바뀐 챕터만 AI가 다시 쓴다). 초안은 강의자가 보고 개설할 수 있다고 판단될 때 승인(개설)한다.

토큰: 분류는 요약 앞부분만 넣는 짧은 호출이고, 같은 파일을 다시 올리면 분류를 재사용한다.
"""
import logging

from core import ai as core_ai

logger = logging.getLogger(__name__)

HEAD_CHARS = 800          # 분류할 때 넣는 요약 앞부분
MAX_TOPICS_IN_PROMPT = 60

MAX_TOPICS_PER_DOC = 3

CLASSIFY_SYSTEM = (
    "대학 동아리 학습 플랫폼에 올라온 자료를 분류합니다. 어떤 자료든 걸러내지 않고 강의에 씁니다.\n"
    "- topics: 이 자료가 다루는 주제(과목·분야) 1~3개. 자료가 한 과목만 다루면 하나만 씁니다.\n"
    "- 기존 주제와 맞으면 그 이름을 글자 그대로 쓰고, 맞는 게 없을 때만 새 주제 이름을 짓습니다. "
    "기존 주제와 새 주제를 함께 써도 됩니다 (예: 기존 '데이터베이스'에 더해 새 주제 '트랜잭션 심화').\n"
    "- 새 이름은 과목 단위로 넓게(예: '데이터베이스', '운영체제'), 20자 이내. description은 새 주제일 때만 그 범위를 한 문장으로.\n"
    "- professor: 자료에 교수·강사 이름이 분명히 적혀 있을 때만 그 이름(직함 제외). 없거나 확실하지 않으면 빈 문자열(추측 금지).\n"
    'JSON으로만 답하세요: {"topics": [{"name": "...", "description": "..."}], "professor": ""}'
)


def _topics_listing():
    from mypage.models import Subject

    topics = Subject.objects.order_by("name")[:MAX_TOPICS_IN_PROMPT]
    return "\n".join(f"- {t.name}" + (f": {t.description}" if t.description else "") for t in topics) or "(없음)"


def _subject_named(name, description=""):
    """이름 → 과목. 이미 있는 과목과 표기만 다르면 그 과목에 묶는다 (mypage/ontology.py)."""
    from mypage.ontology import resolve_subject

    subject, how = resolve_subject(name)
    if how == "new" and description:
        subject.description = description[:300]
        subject.save(update_fields=["description"])
    return subject


def classify_document(document, force=False):
    """자료가 속한 주제들을 정해 저장하고 이름 목록을 돌려준다 (대표 주제 = 첫 번째, subject_code에도 남김).
    - 사용자가 과목 이름을 적었으면 그 이름이 주제다 (AI가 이름을 짓지 않으므로 강의 이름도 이 이름을 따른다).
    - 교수 이름이 비어 있으면 AI가 자료에서 찾아 채운다 (없으면 빈 채로 둔다).
    - 같은 파일이 이미 분류돼 있으면 AI를 부르지 않고 그 결과를 쓴다 (force=True면 다시 분류)."""
    from mypage.models import PersonalDocument

    typed = " ".join((document.course_name or "").split())[:50]
    same = (PersonalDocument.objects.filter(content_hash=document.content_hash).exclude(pk=document.pk)
            .filter(topics__isnull=False).first()) if document.content_hash and not force and not typed else None
    subjects = [_subject_named(typed)] if typed else (list(same.topics.all()) if same else None)
    found_professor = ""
    if same and not document.professor.strip():
        found_professor = same.professor
    need_professor = not same and not document.professor.strip()     # 같은 파일을 이미 분류했으면 AI를 다시 부르지 않는다
    if subjects is None or need_professor:
        data = core_ai.complete_json("classify", [
            {"role": "system", "content": CLASSIFY_SYSTEM},
            {"role": "user", "content": "기존 주제:\n" + _topics_listing() + "\n\n"
                                        + core_ai.untrusted("자료", f"제목: {document.title}\n본문 앞부분: "
                                                            f"{(document.extracted_text or '')[:500]}\n"
                                                            f"{document.summary[:HEAD_CHARS]}")},
        ], user=document.user, counts_as_request=False)
        found_professor = found_professor or " ".join(str(data.get("professor") or "").split())[:50]
        if subjects is None:
            entries = data.get("topics")
            if not isinstance(entries, list):  # 예전 형식({"topic": ...})도 받아 준다
                entries = [{"name": data.get("topic"), "description": data.get("description")}]
            subjects = []
            for entry in entries:
                if len(subjects) >= MAX_TOPICS_PER_DOC:
                    break
                entry = entry if isinstance(entry, dict) else {"name": entry}
                name = str(entry.get("name") or "").strip()[:50]
                if not name or any(s.name == name for s in subjects):
                    continue
                subjects.append(_subject_named(name, str(entry.get("description") or "").strip()))
    names = [s.name for s in subjects]
    document.topics.set(subjects)
    updates = {"subject_code": names[0] if names else "", "is_course_material": True}
    if found_professor and not document.professor.strip():
        updates["professor"] = found_professor
    PersonalDocument.objects.filter(pk=document.pk).update(**updates)
    for field, value in updates.items():
        setattr(document, field, value)
    return names


def _tag_ontology(document):
    """수업 자료는 요약 부분마다 개념을, 족보는 문제마다 유형·개념을 붙인다 (mypage/ontology.py). 실패해도 나머지는 진행한다."""
    from mypage import ontology
    from mypage.models import PersonalDocument

    try:
        if document.document_type == PersonalDocument.DocumentType.EXAM:
            ontology.analyze_exam(document)
        else:
            ontology.tag_document(document)
    except Exception:
        logger.exception("문서 %s 개념 태그 실패", document.pk)


def after_summary(document_id, force=False):
    """요약이 끝난 자료 하나를 분류하고 개념을 붙이며, 족보면 출제 스타일을 새로 뽑는다 (백그라운드 스레드에서 호출).
    강의 초안은 여기서 만들지 않는다 (하루 한 번 일괄 또는 강의자 버튼). 분류된 주제 이름 목록을 돌려준다."""
    from mypage.exam import professor_key, refresh_for
    from mypage.models import PersonalDocument


    document = PersonalDocument.objects.select_related("user").get(pk=document_id)
    if not document.summary.strip():
        return None
    names = classify_document(document, force=force)
    _tag_ontology(document)
    if document.document_type == PersonalDocument.DocumentType.EXAM:
        has_professor = bool(professor_key(document.professor))
        refresh_for(professors=[document.professor], subjects=[] if has_professor else names)    # 새 출제 스타일(내 자료 문제·모의 출제에 쓰임)
    return names
