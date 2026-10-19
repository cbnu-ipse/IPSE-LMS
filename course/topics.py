"""
업로드된 자료의 주제 분류 (사람이 과목·강의를 고르지 않는다).

업로드 → 요약이 끝나면 after_summary(document_id):
  1. classify_document: 자료 제목과 요약 앞부분, 기존 주제 목록(이름 + 설명)을 보고 AI가 어느 주제인지
     (기존 주제 중 하나, 없으면 새 주제 이름과 한 줄 설명)를 정한다. 자료는 걸러내지 않는다 — 어떤 자료든 강의에 쓰인다.
     결과는 PersonalDocument.subject_code, 새 주제는 Subject에 남는다.
  2. 강의는 항상 만든다: 자료가 한 주제에 들어올 때마다 그 주제의 강의 초안을 (자료가 바뀌었을 때만) 만들거나 갱신한다
     (course/studio.build_draft, 근거가 그대로인 챕터는 재사용하므로 바뀐 챕터만 AI가 다시 쓴다).
     "충분한가"를 AI가 미리 판단해 막지 않는다. 초안은 강의자가 judge > 강의 생성에서 언제든 보고, 개설할 수 있다고
     판단될 때 승인(개설)한다.

토큰: 분류는 요약 앞부분만 넣는 짧은 호출이고, 같은 파일을 다시 올리면 분류를 재사용한다.
"""
import logging

from core import ai as core_ai

logger = logging.getLogger(__name__)

HEAD_CHARS = 800          # 분류할 때 넣는 요약 앞부분
MAX_TOPICS_IN_PROMPT = 60

CLASSIFY_SYSTEM = (
    "대학 동아리 학습 플랫폼에 올라온 자료를 분류합니다.\n"
    "어떤 자료든 일단 강의에 쓰입니다(걸러내지 않음). 아래 항목만 정하세요.\n"
    "1. topic: 기존 주제 중 같은 과목·분야면 그 이름을 글자 그대로 쓰고, 맞는 게 없을 때만 새 주제 이름을 짓는다. "
    "새 이름은 과목 단위로 넓게(예: '데이터베이스', '운영체제'), 20자 이내.\n"
    "2. description: 새 주제일 때만 그 주제가 다루는 범위를 한 문장으로.\n"
    'JSON으로만 답하세요: {"topic": "...", "description": "..."}'
)



def _topics_listing():
    from mypage.models import Subject

    topics = Subject.objects.order_by("name")[:MAX_TOPICS_IN_PROMPT]
    return "\n".join(f"- {t.name}" + (f": {t.description}" if t.description else "") for t in topics) or "(없음)"


def classify_document(document):
    """주제·사용 여부를 정해 저장한다. 같은 파일이 이미 분류돼 있으면 AI를 부르지 않고 그 결과를 쓴다."""
    from mypage.models import PersonalDocument, Subject

    same = (PersonalDocument.objects.filter(content_hash=document.content_hash).exclude(pk=document.pk)
            .exclude(subject_code="").first()) if document.content_hash else None
    if same:
        topic = same.subject_code
    else:
        data = core_ai.complete_json("classify", [
            {"role": "system", "content": CLASSIFY_SYSTEM},
            {"role": "user", "content": "기존 주제:\n" + _topics_listing() + "\n\n"
                                        + core_ai.untrusted("자료", f"제목: {document.title}\n{document.summary[:HEAD_CHARS]}")},
        ], user=document.user, counts_as_request=False)
        topic = str(data.get("topic") or "").strip()[:50]
        if topic:
            subject, created = Subject.objects.get_or_create(name=topic)
            description = str(data.get("description") or "").strip()[:300]
            if created and description:
                subject.description = description
                subject.save(update_fields=["description"])
    PersonalDocument.objects.filter(pk=document.pk).update(subject_code=topic, is_course_material=True)
    document.subject_code, document.is_course_material = topic, True
    return topic, True


def after_summary(document_id):
    """요약이 끝난 자료 하나를 분류하고, 필요하면 강의 초안까지 진행한다 (백그라운드 스레드에서 호출)."""
    from mypage.models import PersonalDocument

    from .studio import build_draft

    document = PersonalDocument.objects.select_related("user").get(pk=document_id)
    if not document.summary.strip():
        return None
    topic, _ = classify_document(document)
    if not topic:
        return None
    return build_draft(topic)  # 같은 자료로 이미 만든 초안이 있으면 AI를 부르지 않는다
