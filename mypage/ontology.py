"""
과목 · 교수 · 개념 · 족보 문제를 서로 이어 주는 구조 (가벼운 온톨로지).

  과목(Subject) ── 개념(Concept) ┬─ 수업 자료(DocumentConcept, 요약 부분별 태그)  → 강의 챕터를 개념 단위로 구성
                                └─ 족보 문제(ExamQuestion)                       → 교수님의 유형·개념 빈도 → 모의 출제
  교수(Professor) ── 족보(ExamQuestion)  : 같은 교수님이면 과목이 달라도 문제 유형의 비중을 공유한다.

- 과목·교수 이름은 사람이 적는다. resolve_*가 표기가 달라도(공백·'~론') 이미 있는 것에 묶고, 새 이름이면 만든다.
- 개념과 문제 분석은 업로드 뒤 시스템이 AI로 한 번 붙인다(크레딧을 받지 않는다). 기존 개념 목록을 보여 주고 되도록 그 이름을
  쓰게 해서 이름이 갈라지는 것을 막고, 그래도 갈라진 것은 강의자가 합치기·이름 바꾸기로 고친다 (merge/rename 함수).
"""
import logging
import re
from collections import Counter

from django.db import transaction

from core import ai as core_ai

from .models import (Concept, DocumentConcept, ExamQuestion, PersonalDocument, Professor, Subject, SubjectAlias)
from .naming import name_key, professor_key, same_name

logger = logging.getLogger(__name__)

MAX_CONCEPTS_PER_SUBJECT = 200
CONCEPTS_IN_PROMPT = 80
MAX_SECTIONS = 40
SECTION_PREVIEW_CHARS = 220
EXAM_TEXT_CHARS = 16000
MAX_EXAM_QUESTIONS = 60


# ── 과목 · 교수 ─────────────────────────────────────────────────────────────

def clean_name(name, limit=50):
    return " ".join(str(name or "").split())[:limit]


def resolve_subject(name):
    """사람이 적은 과목 이름 → (Subject, 어떻게 찾았는지: exact/alias/soft/new). 이미 있는 과목과 표기만 다르면 그 과목에 묶는다."""
    name = clean_name(name)
    if not name:
        raise ValueError("과목 이름이 비어 있습니다.")
    key = name_key(name)
    alias = SubjectAlias.objects.select_related("subject").filter(key=key).first()
    if alias:
        return alias.subject, "alias"
    soft = None
    for subject in Subject.objects.all():
        if subject.name == name:
            return subject, "exact"
        if name_key(subject.name) == key:
            return subject, "exact"
        if soft is None and same_name(subject.name, name):
            soft = subject
    if soft:
        SubjectAlias.objects.get_or_create(key=key, defaults={"subject": soft, "name": name})
        return soft, "soft"
    return Subject.objects.create(name=name), "new"


def resolve_professor(name):
    """교수 이름 → Professor (없으면 만든다). 직함('교수님')은 이름에서 뗀다. 비어 있으면 None."""
    key = professor_key(name)
    if not key:
        return None
    display = re.sub(r"\s*(교수님|교수|님)\s*$", "", clean_name(name)) or clean_name(name)
    professor, _ = Professor.objects.get_or_create(key=key, defaults={"name": display})
    return professor


def subject_choices():
    return list(Subject.objects.order_by("name").values_list("name", flat=True))


def professor_choices():
    return list(Professor.objects.order_by("name").values_list("name", flat=True))


# ── 개념 ────────────────────────────────────────────────────────────────────

def resolve_concept(subject, name, description="", create=True):
    """과목 안에서 개념 이름 → Concept. 표기만 다른 이름은 기존 개념에 묶고, 없으면(create) 만든다."""
    name = clean_name(name, 80)
    key = name_key(name)
    if not key:
        return None
    found = None
    for concept in subject.concepts.all():
        if concept.key == key:
            return concept
        if found is None and same_name(concept.name, name):
            found = concept
    if found or not create:
        return found
    if subject.concepts.count() >= MAX_CONCEPTS_PER_SUBJECT:
        return None
    return Concept.objects.create(subject=subject, name=name, key=key, description=clean_name(description, 300),
                                  order=subject.concepts.count())


def concept_listing(subject):
    rows = list(subject.concepts.order_by("order", "id")[:CONCEPTS_IN_PROMPT])
    return "\n".join(f"- {c.name}" + (f": {c.description}" if c.description else "") for c in rows) or "(없음)"


def split_summary(summary):
    """요약을 '#'·'##' 제목 단위로 나눈다 → [(제목, 본문 전체)]. 제목이 없으면 통째로 하나."""
    sections, title, lines = [], "", []

    def flush():
        body = "\n".join(lines).strip()
        if body or title:
            sections.append((title or "요약", body))

    for line in str(summary or "").replace("\r\n", "\n").split("\n"):
        m = re.match(r"^#{1,2}\s+(.*)$", line)
        if m:
            flush()
            title, lines = m.group(1).strip(), []
        else:
            lines.append(line)
    flush()
    return sections


def summary_sections(summary):
    """개념을 붙이려고 요약 부분마다 제목과 앞부분만 → [(제목, 앞부분 글)]."""
    return [(t, " ".join(b.split())[:SECTION_PREVIEW_CHARS]) for t, b in split_summary(summary)][:MAX_SECTIONS]


def text_for_concepts(summary, concept_tags, names):
    """요약에서 names 중 하나라도 다루는 부분(개념 태그 기준)만 이어 붙인다. 태그가 없거나 겹치는 부분이 없으면 빈 문자열."""
    wanted = set(names)
    titles = {t["section"] for t in (concept_tags or []) if wanted & set(t.get("concepts", []))}
    parts = [f"## {title}\n{body}" for title, body in split_summary(summary) if title in titles]
    return "\n\n".join(parts)


def concepts_for_docs(doc_ids):
    """자료들이 다루는 개념 → {개념 이름: [자료 id]} (과목의 개념 순서대로)."""
    out = {}
    rows = (DocumentConcept.objects.filter(document_id__in=doc_ids).select_related("concept")
            .order_by("concept__order", "concept_id", "document_id"))
    for row in rows:
        out.setdefault(row.concept.name, []).append(row.document_id)
    return out


CONCEPT_SYSTEM = (
    "대학 과목 학습 자료 요약의 각 부분이 다루는 '개념'을 붙입니다. 개념은 시험에 나올 만한 단위의 짧은 명사구입니다 "
    "(예: '페이징', 'CPU 스케줄링', '정규화'). 너무 넓은 이름('운영체제')이나 너무 좁은 이름은 피합니다.\n"
    "- 부분마다 개념 1~3개. 아래 '기존 개념'에 같은 것이 있으면 그 이름을 글자 그대로 쓰고, 없을 때만 새 이름을 짓습니다.\n"
    "- 새 개념은 descriptions에 한 문장 설명을 적습니다.\n"
    'JSON으로만 답하세요: {"sections": [{"i": 0, "concepts": ["..."]}], "descriptions": {"새 개념": "설명"}}'
)


def tag_document(document):
    """수업 자료 요약의 부분마다 개념을 붙이고 저장한다 (다시 부르면 새로 붙인다). 붙은 개념 수를 돌려준다."""
    subject = _document_subject(document)
    sections = summary_sections(document.summary)
    if not subject or not sections:
        return 0
    listing = "\n".join(f"[{i}] {title}\n{preview}" for i, (title, preview) in enumerate(sections))
    data = core_ai.complete_json("concepts", [
        {"role": "system", "content": CONCEPT_SYSTEM},
        {"role": "user", "content": f"과목: {subject.name}\n기존 개념:\n{concept_listing(subject)}\n\n"
                                    + core_ai.untrusted("요약", listing)},
    ])
    descriptions = data.get("descriptions") if isinstance(data.get("descriptions"), dict) else {}
    tags, found = [], {}
    for entry in data.get("sections") or []:
        if not isinstance(entry, dict) or not isinstance(entry.get("i"), int) or not 0 <= entry["i"] < len(sections):
            continue
        names = []
        for raw in (entry.get("concepts") or [])[:3]:
            concept = resolve_concept(subject, raw, descriptions.get(raw, ""))
            if concept:
                found[concept.pk] = concept
                if concept.name not in names:
                    names.append(concept.name)
        if names:
            tags.append({"section": sections[entry["i"]][0], "concepts": names})
    with transaction.atomic():
        DocumentConcept.objects.filter(document=document).delete()
        DocumentConcept.objects.bulk_create([DocumentConcept(document=document, concept=c) for c in found.values()])
        PersonalDocument.objects.filter(pk=document.pk).update(concept_tags=tags)
    return len(found)


# ── 족보 문제 분석 ──────────────────────────────────────────────────────────

_TYPE_ALIASES = {
    "ox": "ox", "o/x": "ox", "참거짓": "ox", "진위": "ox",
    "mc": "mc", "객관식": "mc", "선택": "mc", "multiple": "mc",
    "short": "short", "단답": "short", "단답형": "short", "빈칸": "short",
    "essay": "essay", "서술": "essay", "서술형": "essay", "논술": "essay", "설명": "essay",
    "calc": "calc", "계산": "calc", "풀이": "calc", "계산형": "calc",
    "code": "code", "코드": "code", "코딩": "code", "프로그래밍": "code",
}

EXAM_SYSTEM = (
    "대학 시험 족보(기출문제)를 문제 단위로 분석합니다. 문제를 그대로 옮기지 말고 아래 항목만 뽑으세요.\n"
    "- number: 문제 번호. text: 무엇을 묻는지 한 문장 요약(150자 이내, 정답은 쓰지 않음).\n"
    "- type: ox | mc(객관식) | short(단답·빈칸) | essay(서술) | calc(계산·풀이) | code(코드) | other.\n"
    "- points: 배점(숫자, 모르면 null).\n"
    "- concepts: 문제가 다루는 개념 1~2개. 아래 '기존 개념'에 같은 것이 있으면 그 이름을 글자 그대로 쓰고, 없을 때만 새 이름을 짓습니다.\n"
    'JSON으로만 답하세요: {"questions": [{"number": 1, "text": "...", "type": "mc", "points": 5, "concepts": ["..."]}]}'
)


def _qtype(raw):
    key = re.sub(r"[\s_-]", "", str(raw or "").lower())
    return _TYPE_ALIASES.get(key, "other")


def analyze_exam(document):
    """족보 본문을 문제 단위로 분석해 ExamQuestion으로 저장한다 (다시 부르면 새로 만든다). 저장한 문제 수를 돌려준다."""
    subject = _document_subject(document)
    text = (document.extracted_text or "").strip()
    if not subject or not text:
        return 0
    data = core_ai.complete_json("exam_analysis", [
        {"role": "system", "content": EXAM_SYSTEM},
        {"role": "user", "content": f"과목: {subject.name}\n기존 개념:\n{concept_listing(subject)}\n\n"
                                    + core_ai.untrusted("족보", text[:EXAM_TEXT_CHARS])},
    ])
    rows = []
    for i, q in enumerate((data.get("questions") or [])[:MAX_EXAM_QUESTIONS], 1):
        if not isinstance(q, dict) or not str(q.get("text") or "").strip():
            continue
        points = q.get("points")
        rows.append({
            "number": q.get("number") if isinstance(q.get("number"), int) and 0 < q["number"] < 1000 else i,
            "text": str(q["text"]).strip()[:300], "qtype": _qtype(q.get("type")),
            "points": points if isinstance(points, int) and 0 < points < 1000 else None,
            "concepts": [c for c in (q.get("concepts") or [])[:2] if isinstance(c, str)],
        })
    with transaction.atomic():
        ExamQuestion.objects.filter(document=document).delete()
        for row in rows:
            concept_names = row.pop("concepts")
            question = ExamQuestion.objects.create(document=document, **row)
            concepts = [c for c in (resolve_concept(subject, n) for n in concept_names) if c]
            if concepts:
                question.concepts.set(concepts)
    return len(rows)


def _document_subject(document):
    """자료의 과목: 올릴 때 정한 과목(대표 주제)."""
    return document.topics.order_by("pk").first() or (
        Subject.objects.filter(name=document.subject_code).first() if document.subject_code else None)


# ── 교수님 출제 통계 (모의 출제·강의 확인 문제의 근거) ─────────────────────────

def exam_questions_for(professor="", subject_name=""):
    """교수님의 족보 문제들(과목이 달라도 전부). 교수 이름이 없으면 그 과목의 족보 문제."""
    qs = ExamQuestion.objects.filter(document__document_type=PersonalDocument.DocumentType.EXAM)
    key = professor_key(professor)
    if key:
        ids = [d.pk for d in PersonalDocument.objects.filter(document_type=PersonalDocument.DocumentType.EXAM)
               .exclude(professor="") if professor_key(d.professor) == key]
        return qs.filter(document_id__in=ids)
    return qs.filter(document__topics__name=subject_name).distinct() if subject_name else qs.none()


def exam_stats(professor="", subject_name=""):
    """{"total", "type_mix"{유형:비율}, "type_counts", "concepts"[(개념, 횟수)], "scope"}. 문제가 없으면 total=0.
    유형 비중은 그 교수님 족보 전체(과목 무관), 개념 빈도는 그 과목 안에서만 센다 (개념은 과목마다 따로이므로)."""
    questions = list(exam_questions_for(professor, subject_name).prefetch_related("concepts__subject"))
    counts = Counter(q.qtype for q in questions)
    total = len(questions)
    in_subject = [q for q in questions if any(c.subject.name == subject_name for c in q.concepts.all())] if subject_name else []
    pool = in_subject
    scope = "professor"
    if not pool and subject_name:      # 그 교수님 족보에 이 과목 문제가 없으면 이 과목의 모든 족보로
        pool = list(ExamQuestion.objects.filter(document__document_type=PersonalDocument.DocumentType.EXAM,
                                                concepts__subject__name=subject_name).distinct().prefetch_related("concepts__subject"))
        scope = "subject"
    freq = Counter(c.name for q in pool for c in q.concepts.all() if c.subject.name == subject_name)
    return {"total": total, "type_counts": dict(counts),
            "type_mix": {t: round(n / total, 2) for t, n in counts.items()} if total else {},
            "concepts": freq.most_common(12), "concept_scope": scope if freq else ""}


# ── 개념 정리 (강의자 화면) ─────────────────────────────────────────────────

def merge_concepts(source, target):
    """source를 target에 합친다: 자료·족보 문제의 연결을 target으로 옮기고 source를 지운다."""
    if source.pk == target.pk or source.subject_id != target.subject_id:
        raise ValueError("같은 과목의 서로 다른 개념만 합칠 수 있습니다.")
    with transaction.atomic():
        for dc in DocumentConcept.objects.filter(concept=source):
            DocumentConcept.objects.get_or_create(document_id=dc.document_id, concept=target)
        for question in source.exam_questions.all():
            question.concepts.add(target)
        for doc in PersonalDocument.objects.filter(document_concepts__concept=source):
            tags = [{"section": t["section"], "concepts": _swap(t["concepts"], source.name, target.name)}
                    for t in (doc.concept_tags or [])]
            PersonalDocument.objects.filter(pk=doc.pk).update(concept_tags=tags)
        source.delete()
    return target


def _swap(names, old, new):
    out = []
    for n in names:
        n = new if n == old else n
        if n not in out:
            out.append(n)
    return out


def rename_concept(concept, new_name):
    """이름을 바꾼다. 같은 이름의 다른 개념이 이미 있으면 그쪽에 합친다. 최종 Concept를 돌려준다."""
    new_name = clean_name(new_name, 80)
    key = name_key(new_name)
    if not key:
        raise ValueError("개념 이름이 비어 있습니다.")
    other = concept.subject.concepts.filter(key=key).exclude(pk=concept.pk).first()
    if other:
        return merge_concepts(concept, other)
    old = concept.name
    with transaction.atomic():
        concept.name, concept.key = new_name, key
        concept.save(update_fields=["name", "key"])
        for doc in PersonalDocument.objects.filter(document_concepts__concept=concept):
            tags = [{"section": t["section"], "concepts": _swap(t["concepts"], old, new_name)}
                    for t in (doc.concept_tags or [])]
            PersonalDocument.objects.filter(pk=doc.pk).update(concept_tags=tags)
    return concept


def delete_concept(concept):
    old = concept.name
    with transaction.atomic():
        for doc in PersonalDocument.objects.filter(document_concepts__concept=concept):
            tags = [{"section": t["section"], "concepts": [n for n in t["concepts"] if n != old]}
                    for t in (doc.concept_tags or [])]
            PersonalDocument.objects.filter(pk=doc.pk).update(concept_tags=[t for t in tags if t["concepts"]])
        concept.delete()


def add_concept(subject, name, description=""):
    concept = resolve_concept(subject, name, description)
    if concept is None:
        raise ValueError("개념을 더 만들 수 없습니다.")
    return concept
