"""
업로드된 자료의 주제 분류와 강의 개설 판단 (사람이 과목·강의를 고르지 않는다).

업로드 → 요약이 끝나면 after_summary(document_id):
  1. classify_document: 자료 제목과 요약 앞부분, 기존 주제 목록(이름 + 설명)을 보고 AI가
     - 강의에 쓸 만한 학습 자료인지(usable)
     - 어느 주제인지(기존 주제 중 하나, 없으면 새 주제 이름과 한 줄 설명)
     를 한 번에 정한다. 결과는 PersonalDocument.subject_code / is_course_material, 새 주제는 Subject에 남는다.
  2. 그 주제에 이미 게시된 강의가 있으면 새 자료로 내용 갱신 초안을 만든다 (course/studio.build_draft,
     근거가 그대로인 챕터는 재사용하므로 바뀐 챕터만 AI가 다시 쓴다).
  3. 아직 강의가 없으면 judge_readiness: 주제에 모인 자료(제목 + 요약 앞부분)로 "강의 하나를 만들 만큼
     충분한가"를 AI가 판단한다. 정해진 개수 기준은 없다. 같은 자료 묶음(해시)으로는 다시 묻지 않는다.
     충분하다고 하면 초안을 만든다 → 강의자가 검토·승인해야 게시된다.

토큰: 분류·판단 모두 요약 앞부분만 넣는 짧은 호출이고, 같은 파일을 다시 올리면 분류를 재사용한다.
"""
import hashlib
import json
import logging

from django.db import transaction
from django.utils import timezone

from core import ai as core_ai

logger = logging.getLogger(__name__)

HEAD_CHARS = 800          # 분류할 때 넣는 요약 앞부분
READINESS_HEAD_CHARS = 500  # 개설 판단 때 자료 하나당 넣는 요약 앞부분
MAX_TOPICS_IN_PROMPT = 60

CLASSIFY_SYSTEM = (
    "대학 동아리 학습 플랫폼에 올라온 자료를 분류합니다.\n"
    "1. usable: 이 자료가 강의를 만드는 데 쓸 학습 내용(개념 설명, 강의 노트, 교재, 문제 풀이 등)이면 true. "
    "공지·잡담·행정 서류·의미 없는 파일이면 false.\n"
    "2. topic: 기존 주제 중 같은 과목·분야면 그 이름을 글자 그대로 쓰고, 맞는 게 없을 때만 새 주제 이름을 짓는다. "
    "새 이름은 과목 단위로 넓게(예: '데이터베이스', '운영체제'), 20자 이내.\n"
    "3. description: 새 주제일 때만 그 주제가 다루는 범위를 한 문장으로.\n"
    'JSON으로만 답하세요: {"usable": true, "topic": "...", "description": "..."}'
)

READINESS_SYSTEM = (
    "대학 동아리 학습 플랫폼의 강의 설계자입니다. 한 주제로 모인 학습 자료 목록을 보고, 이 자료만으로 "
    "학생이 처음부터 따라갈 수 있는 강의(2개 이상의 챕터, 각 챕터에 개념 설명과 예시)를 만들 수 있는지 판단합니다.\n"
    "- 자료 개수가 아니라 내용의 범위와 깊이로 판단합니다. 한 자료라도 충분히 길고 체계적이면 가능하고, "
    "여러 개라도 조각난 메모·같은 내용 반복이면 부족합니다.\n"
    "- 부족하면 무엇이 더 필요한지 reason에 짧게 씁니다.\n"
    'JSON으로만 답하세요: {"ready": true, "reason": "한두 문장"}'
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
        topic, usable = same.subject_code, same.is_course_material
    else:
        data = core_ai.complete_json("classify", [
            {"role": "system", "content": CLASSIFY_SYSTEM},
            {"role": "user", "content": "기존 주제:\n" + _topics_listing() + "\n\n"
                                        + core_ai.untrusted("자료", f"제목: {document.title}\n{document.summary[:HEAD_CHARS]}")},
        ], user=document.user, counts_as_request=False)
        usable = bool(data.get("usable", True))
        topic = str(data.get("topic") or "").strip()[:50]
        if topic:
            subject, created = Subject.objects.get_or_create(name=topic)
            description = str(data.get("description") or "").strip()[:300]
            if created and description:
                subject.description = description
                subject.save(update_fields=["description"])
    PersonalDocument.objects.filter(pk=document.pk).update(subject_code=topic, is_course_material=usable)
    document.subject_code, document.is_course_material = topic, usable
    return topic, usable


def _bundle_hash(docs):
    return hashlib.sha256(json.dumps(
        [(d["id"], hashlib.sha256(d["summary"].encode()).hexdigest()) for d in docs]).encode()).hexdigest()


def judge_readiness(topic):
    """이 주제의 자료로 강의를 만들 수 있는지 AI 판단. (ready, reason). 같은 자료 묶음은 다시 묻지 않는다."""
    from mypage.models import Subject

    from .studio import eligible_docs

    docs = eligible_docs(topic)
    if not docs:
        return False, "강의에 쓸 자료가 없습니다."
    digest = _bundle_hash(docs)
    with transaction.atomic():
        subject, _ = Subject.objects.select_for_update().get_or_create(name=topic)
        if subject.readiness_hash == digest:
            return subject.is_ready, subject.readiness_reason
        # 같은 묶음으로 동시에 들어온 판단은 하나만 진행 (해시를 먼저 적어 둔다)
        subject.readiness_hash, subject.is_ready, subject.readiness_reason = digest, False, "판단 중"
        subject.save(update_fields=["readiness_hash", "is_ready", "readiness_reason"])
    listing = "\n\n".join(f"[{d['title']}]\n{d['summary'][:READINESS_HEAD_CHARS]}" for d in docs)
    try:
        data = core_ai.complete_json("course_readiness", [
            {"role": "system", "content": READINESS_SYSTEM},
            {"role": "user", "content": f"주제: {topic}\n자료 {len(docs)}개\n" + core_ai.untrusted("자료목록", listing)},
        ])
    except Exception:
        Subject.objects.filter(pk=subject.pk).update(readiness_hash="", readiness_reason="")  # 다음에 다시 판단
        raise
    ready, reason = bool(data.get("ready")), str(data.get("reason") or "").strip()[:500]
    Subject.objects.filter(pk=subject.pk).update(is_ready=ready, readiness_reason=reason, judged_at=timezone.now())
    return ready, reason


def after_summary(document_id):
    """요약이 끝난 자료 하나를 분류하고, 필요하면 강의 초안까지 진행한다 (백그라운드 스레드에서 호출)."""
    from mypage.models import PersonalDocument

    from .models import Course
    from .studio import build_draft

    document = PersonalDocument.objects.select_related("user").get(pk=document_id)
    if not document.summary.strip():
        return None
    topic, usable = classify_document(document)
    if not topic or not usable:
        return None
    if Course.objects.filter(code=topic).exists():
        return build_draft(topic)  # 게시된 강의가 있으면 갱신 초안 (승인해야 반영)
    ready, _ = judge_readiness(topic)
    return build_draft(topic) if ready else None
