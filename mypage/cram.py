"""
'시험 5분 전 속성 노트': 사용자가 고른 자료(하나 또는 여러 개)를 AI가 시험 직전에 훑을 한 장짜리 노트로 줄이고,
손글씨 그림(A4 PNG, 넘치면 여러 장)으로 그려 개인 탭에 새 자료(PersonalDocument.document_type == NOTE)로 저장한다.

- 읽는 내용은 자료의 요약(없으면 본문 앞부분). 자료마다 같은 몫을 나눠 읽고, 전체는 SOURCE_CHARS 안으로 줄인다.
- 크레딧은 노트 한 장에 AI_COST_CRAM_NOTE. AI를 부르다 실패하면 core.ai가, 노트가 비었거나 그림이 실패하면 여기서 돌려준다.
- 노트 문서는 강의·모의 출제의 재료가 아니다 (eligible_docs는 수업 자료만, exam_docs는 족보만 읽는다).
"""
import logging

from django.core.files.base import ContentFile

from core import ai as core_ai

from . import handnote
from .models import PersonalDocument, ProcessingStatus

logger = logging.getLogger(__name__)

MAX_SOURCES = 8
SOURCE_CHARS = 16000
MAX_SECTIONS = 7
MAX_POINTS = 6
MAX_MEMO = 6
MIN_POINTS = 3
FIELD_CHARS = 140

SYSTEM = (
    "시험 5분 전에 훑어볼 '속성 노트'를 만듭니다. 학생이 손으로 쓴 것처럼 짧고 핵심만 담습니다.\n"
    "- 주어진 자료에 있는 내용만 씁니다. 자료에 없는 내용을 지어내지 마세요.\n"
    f"- sections는 2~{MAX_SECTIONS}개. 시험에 나올 만한 개념·정의·공식·비교·순서 단위로 나누고, 각 heading은 12자 안팎으로 짧게.\n"
    f"- 각 section의 points는 2~{MAX_POINTS}개, 한 줄(50자 안팎)로 끝나는 키워드 중심 문장. 문장 끝을 '~다.'로 길게 늘이지 말고 "
    "'A = B', 'A → B', 'A vs B: ...'처럼 줄입니다.\n"
    "- 가장 중요한 말은 **이렇게** 감싸 빨간 펜으로 강조하고, 외울 숫자·용어는 ==이렇게== 감싸 형광펜을 칩니다. 한 줄에 하나씩만.\n"
    "- 수식은 $x^2$, $\\frac{a}{b}$, $\\mu$ 같은 간단한 LaTeX만 씁니다. 표·코드 블록·마크다운 제목은 쓰지 않습니다.\n"
    f"- memo는 '마지막 체크!' 칸: 헷갈리기 쉬운 것·시험 함정·꼭 외울 것 3~{MAX_MEMO}개.\n"
    "- title은 과목과 범위가 드러나게 20자 안팎.\n"
    "- 같은 내용을 반복하지 말고 시험에 나올 핵심만 남깁니다 (노트는 A4 한 장 분량이 이상적이고, 넘치면 다음 장에 이어집니다).\n"
    'JSON으로만 답하세요: {"title": "...", "sections": [{"heading": "...", "points": ["..."]}], "memo": ["..."]}'
)


def usable(document):
    """노트의 재료로 쓸 수 있는 자료인지: 노트가 아니고, 요약이나 본문이 있어야 한다."""
    return (document.document_type != PersonalDocument.DocumentType.NOTE
            and bool(document.summary.strip() or document.extracted_text.strip()))


def _clean(text):
    return " ".join(str(text or "").split())[:FIELD_CHARS]


def normalize_note(data, fallback_title="시험 5분 전 노트"):
    """AI가 돌려준 dict를 그림으로 그릴 수 있는 모양으로 다듬는다 (모양이 어긋난 항목은 버린다)."""
    if not isinstance(data, dict):
        return {"title": fallback_title, "sections": [], "memo": []}
    sections = []
    for raw in (data.get("sections") or [])[:MAX_SECTIONS]:
        if not isinstance(raw, dict):
            continue
        heading = _clean(raw.get("heading"))[:40]
        points = [p for p in (_clean(p) for p in (raw.get("points") or [])[:MAX_POINTS]) if p]
        if heading and points:
            sections.append({"heading": heading, "points": points})
    memo = [m for m in (_clean(m) for m in (data.get("memo") or [])[:MAX_MEMO]) if m]
    return {"title": _clean(data.get("title"))[:60] or fallback_title, "sections": sections, "memo": memo}


def build_request(documents):
    per = max(SOURCE_CHARS // max(len(documents), 1), 1500)
    parts = []
    for d in documents:
        body = (d.summary.strip() or d.extracted_text.strip())[:per]
        parts.append(f"## {d.title}\n{body}")
    return core_ai.untrusted("자료", "\n\n".join(parts))


def note_title(documents):
    subjects = list(dict.fromkeys(d.course_name for d in documents if d.course_name))
    base = subjects[0] if len(subjects) == 1 else (documents[0].title if len(documents) == 1 else "여러 자료")
    return f"{base} 속성 노트"[:200]


def generate_note(user, documents):
    """자료로 노트 dict를 만든다 (크레딧을 받고, 쓸 만한 내용이 모자라면 돌려주고 ValueError)."""
    data = core_ai.complete_json("cram_note", [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": build_request(documents)},
    ], user=user)
    note = normalize_note(data, fallback_title=note_title(documents).removesuffix(" 속성 노트") + " 5분 전 노트")
    points = sum(len(s["points"]) for s in note["sections"])
    if not note["sections"] or points < MIN_POINTS:
        core_ai.refund(user, "cram_note", core_ai.cost_for("cram_note"))
        raise ValueError("AI가 쓸 만한 노트를 만들지 못했습니다.")
    return note


def note_markdown(note):
    """노트를 글로도 남긴다 (자료 화면의 글 보기·검색용). 서식 기호는 그대로 둔다."""
    lines = [f"# {note['title']}", ""]
    for s in note["sections"]:
        lines.append(f"## {s['heading']}")
        lines += [f"- {p}" for p in s["points"]]
        lines.append("")
    if note["memo"]:
        lines.append("## 마지막 체크!")
        lines += [f"- {m}" for m in note["memo"]]
    return "\n".join(lines).strip()


def build_note_document(note_id, source_ids):
    """백그라운드에서 호출: 노트 문서(생성 중)를 AI 내용과 손글씨 그림으로 채운다. 실패하면 FAILED로 두고 크레딧을 돌려준다."""
    doc = PersonalDocument.objects.select_related("user").get(pk=note_id)
    sources = list(PersonalDocument.objects.filter(pk__in=source_ids, user=doc.user, is_deleted=False).order_by("id"))
    sources = [d for d in sources if usable(d)]
    charged = False
    try:
        if not sources:
            raise ValueError("노트로 만들 자료가 없습니다.")
        note = generate_note(doc.user, sources)
        charged = True
        pngs = handnote.render_notes(note)          # A4 한 장씩. 한 장에 안 들어가면 내용을 버리지 않고 다음 장에 이어 쓴다
        total = len(pngs)
        label = (lambda n: f" ({n}/{total})" if total > 1 else "")
        markdown = note_markdown(note)
        for n, png in enumerate(pngs[1:], 2):       # 둘째 장부터는 같은 자리에 새 노트 자료로 만든다
            extra = PersonalDocument.objects.create(
                user=doc.user, folder=doc.folder, title=f"{note['title'][:190]}{label(n)}", file="",
                document_type=PersonalDocument.DocumentType.NOTE, course_name=doc.course_name, professor=doc.professor,
                is_course_material=False, summary=markdown, summary_status=ProcessingStatus.DONE)
            extra.file.save("cram-note.png", ContentFile(png), save=True)
        doc.file.save("cram-note.png", ContentFile(pngs[0]), save=False)
        doc.title = f"{note['title'][:190]}{label(1)}"
        doc.summary = markdown
        doc.summary_status = ProcessingStatus.DONE
        doc.save()
    except Exception:
        logger.exception("속성 노트 %s 생성 실패", note_id)
        if charged:    # AI 호출은 성공했지만 그림을 그리지 못한 경우
            core_ai.refund(doc.user, "cram_note", core_ai.cost_for("cram_note"))
        PersonalDocument.objects.filter(pk=note_id).update(summary_status=ProcessingStatus.FAILED)
