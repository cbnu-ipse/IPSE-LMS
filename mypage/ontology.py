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

from .models import (Concept, DocumentConcept, ExamQuestion, ExamStyle, PersonalDocument, Professor, Subject, SubjectAlias)
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

def trusted_exam_weights():
    """학습에 써도 되는 족보의 {문서 id: 올린 사람의 신뢰도 가중치(처음 신뢰도 50 = 1배)} (mypage.exam.learnable, accounts/trust.py)."""
    from accounts import trust

    from .exam import learnable

    docs = PersonalDocument.objects.filter(document_type=PersonalDocument.DocumentType.EXAM).select_related("user")
    return {d.pk: trust.weight(d.user) for d in docs if learnable(d)}


def exam_questions_for(professor="", subject_name="", weights=None):
    """교수님의 족보 문제들(과목이 달라도 전부). 교수 이름이 없으면 그 과목의 족보 문제. 신뢰할 수 없는 족보의 문제는 뺀다."""
    weights = trusted_exam_weights() if weights is None else weights
    qs = ExamQuestion.objects.filter(document_id__in=list(weights))
    key = professor_key(professor)
    if key:
        ids = [d.pk for d in PersonalDocument.objects.filter(document_type=PersonalDocument.DocumentType.EXAM)
               .exclude(professor="") if professor_key(d.professor) == key]
        return qs.filter(document_id__in=ids)
    return qs.filter(document__topics__name=subject_name).distinct() if subject_name else qs.none()


def exam_stats(professor="", subject_name=""):
    """{"total", "type_mix"{유형:비율}, "type_counts", "type_weight", "concepts"[(개념, 횟수)], "scope"}. 문제가 없으면 total=0.
    유형 비중은 그 교수님 족보 전체(과목 무관), 개념 빈도는 그 과목 안에서만 센다 (개념은 과목마다 따로이므로).
    신뢰할 수 없는 족보는 빼고, 신뢰도가 높은 사용자의 족보를 더 크게 센다 (type_weight·type_mix·개념 횟수)."""
    weights = trusted_exam_weights()
    questions = list(exam_questions_for(professor, subject_name, weights).prefetch_related("concepts__subject"))
    counts = Counter(q.qtype for q in questions)
    weighted = Counter()
    for q in questions:
        weighted[q.qtype] += weights.get(q.document_id, 0)
    total = len(questions)
    in_subject = [q for q in questions if any(c.subject.name == subject_name for c in q.concepts.all())] if subject_name else []
    pool = in_subject
    scope = "professor"
    if not pool and subject_name:      # 그 교수님 족보에 이 과목 문제가 없으면 이 과목의 모든 족보로
        pool = list(ExamQuestion.objects.filter(document_id__in=list(weights),
                                                concepts__subject__name=subject_name).distinct().prefetch_related("concepts__subject"))
        scope = "subject"
    freq = Counter()
    for q in pool:
        for c in q.concepts.all():
            if c.subject.name == subject_name:
                freq[c.name] += weights.get(q.document_id, 0)
    ranked = [(name, max(1, round(n))) for name, n in freq.most_common(12)]
    weight_total = sum(weighted.values())
    return {"total": total, "type_counts": dict(counts), "type_weight": {t: round(w, 2) for t, w in weighted.items()},
            "type_mix": {t: round(w / weight_total, 2) for t, w in weighted.items()} if total and weight_total else {},
            "concepts": ranked, "concept_scope": scope if freq else ""}


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


# ── 시각화 (강의자 화면: judge > 강의 생성 > 개념 지도) ───────────────────────────

CONCEPTS_PER_SUBJECT = 30        # 관계도에 과목마다 보여 줄 개념 수 (자주 나오고 많이 다룬 순)
MAX_EDGES = 160


def _prof_label(name):
    return f"{name} 교수님" if name else ""


def graph_data(subject_name="", per_subject=CONCEPTS_PER_SUBJECT):
    """관계도 데이터: 교수(보라) — 과목(초록) — 개념(파랑, 크기는 족보 출제 횟수), 개념끼리는 같은 요약 부분·같은 문제에 함께
    나온 횟수로 잇는다. 노드를 누르면 보여 줄 상세 정보(자료·요약 부분·족보 문제)도 노드 데이터에 담는다."""
    from collections import defaultdict
    from django.db.models import Count

    subjects = Subject.objects.all()
    if subject_name:
        subjects = subjects.filter(name=subject_name)
    subjects = [s for s in subjects.order_by("name") if s.concepts.exists() or s.documents.exists()]   # 빈 과목은 그리지 않는다
    subject_ids = [s.pk for s in subjects]
    nodes, edges = [], []

    # 개념: 과목마다 자주 출제된 순으로 상위 N개
    concepts = list(Concept.objects.filter(subject_id__in=subject_ids)
                    .annotate(doc_count=Count("document_concepts", distinct=True), q_count=Count("exam_questions", distinct=True)))
    by_subject = defaultdict(list)
    for c in concepts:
        by_subject[c.subject_id].append(c)
    kept = {}
    for sid, rows in by_subject.items():
        for c in sorted(rows, key=lambda c: (-(c.q_count * 3 + c.doc_count), c.order))[:per_subject]:
            kept[c.pk] = c

    # 개념별 상세: 다루는 수업 자료·요약 부분, 출제된 족보 문제
    docs_by_concept = defaultdict(list)
    sections_by_concept = defaultdict(list)
    cooc = defaultdict(int)
    name_to_id = {(c.subject_id, c.name): c.pk for c in kept.values()}
    for dc in (DocumentConcept.objects.filter(concept_id__in=kept).select_related("document")):
        doc = dc.document
        if not doc.is_deleted and len(docs_by_concept[dc.concept_id]) < 10:
            docs_by_concept[dc.concept_id].append(doc.title)
    for doc in PersonalDocument.objects.filter(topics__in=subjects, document_type=PersonalDocument.DocumentType.LECTURE).distinct():
        sid = _document_subject(doc).pk if _document_subject(doc) else None
        for tag in doc.concept_tags or []:
            ids = [name_to_id.get((sid, n)) for n in tag.get("concepts", [])]
            ids = [i for i in ids if i]
            for i in ids:
                if len(sections_by_concept[i]) < 8:
                    sections_by_concept[i].append(f"{doc.title} › {tag.get('section', '')}")
            for a in ids:
                for b in ids:
                    if a < b:
                        cooc[(a, b)] += 1
    questions_by_concept = defaultdict(list)
    prof_by_concept = defaultdict(lambda: defaultdict(int))
    qtype_labels = dict(ExamQuestion.QType.choices)
    for q in (ExamQuestion.objects.filter(concepts__in=kept).distinct().select_related("document").prefetch_related("concepts")):
        ids = [c.pk for c in q.concepts.all() if c.pk in kept]
        for i in ids:
            if len(questions_by_concept[i]) < 10:
                questions_by_concept[i].append({"type": qtype_labels.get(q.qtype, q.qtype), "points": q.points, "text": q.text,
                                                "doc": q.document.title})
            if q.document.professor:
                prof_by_concept[i][professor_key(q.document.professor)] += 1
        for a in ids:
            for b in ids:
                if a < b:
                    cooc[(a, b)] += 1
    prof_names = {p.key: p.name for p in Professor.objects.all()}

    # 교수: 그 과목에 자료(수업 자료·족보)를 올린 교수님
    prof_subjects = defaultdict(set)
    prof_stats = {}
    for doc in PersonalDocument.objects.filter(topics__in=subjects).exclude(professor="").distinct().prefetch_related("topics"):
        key = professor_key(doc.professor)
        for t in doc.topics.all():
            if t.pk in subject_ids:
                prof_subjects[key].add(t.pk)
    for key in prof_subjects:
        s = exam_stats(prof_names.get(key, key), "")
        prof_stats[key] = s

    for s in subjects:
        s_concepts = [c for c in kept.values() if c.subject_id == s.pk]
        lecture_titles = list(PersonalDocument.objects.filter(topics=s, document_type=PersonalDocument.DocumentType.LECTURE,
                                                              is_deleted=False).values_list("title", flat=True)[:15])
        exam_titles = list(PersonalDocument.objects.filter(topics=s, document_type=PersonalDocument.DocumentType.EXAM,
                                                           is_deleted=False).values_list("title", flat=True)[:15])
        nodes.append({"data": {
            "id": f"s{s.pk}", "label": s.name, "kind": "subject", "size": 54,
            "detail": {"title": s.name, "kind": "과목", "concept_count": len(by_subject.get(s.pk, [])),
                       "lectures": lecture_titles, "exams": exam_titles, "description": s.description,
                       "edit_url": f"/course/studio/concepts/?subject={s.name}"}}})
    for key, subject_set in prof_subjects.items():
        stat = prof_stats.get(key) or {}
        name = prof_names.get(key, key)
        labels = dict(ExamQuestion.QType.choices)
        mix = [{"type": labels.get(t, t), "count": n} for t, n in sorted((stat.get("type_counts") or {}).items(), key=lambda kv: -kv[1])]
        style = ExamStyle.objects.filter(key=f"p:{key}").first()
        nodes.append({"data": {
            "id": f"p{key}", "label": _prof_label(name), "kind": "professor", "size": 44,
            "detail": {"title": _prof_label(name), "kind": "교수", "total": stat.get("total", 0), "mix": mix,
                       "guidelines": style.guidelines if style else "",
                       "subjects": [s.name for s in subjects if s.pk in subject_set]}}})
        for sid in subject_set:
            edges.append({"data": {"id": f"ps{key}-{sid}", "source": f"p{key}", "target": f"s{sid}", "kind": "teaches"}})
    for c in kept.values():
        profs = sorted(prof_by_concept[c.pk].items(), key=lambda kv: -kv[1])[:5]
        nodes.append({"data": {
            "id": f"c{c.pk}", "label": c.name, "kind": "concept", "questions": c.q_count, "docs": c.doc_count,
            "size": 20 + min(c.q_count, 12) * 4,
            "detail": {"title": c.name, "kind": "개념", "subject": c.subject.name, "description": c.description,
                       "question_count": c.q_count, "doc_count": c.doc_count,
                       "lectures": docs_by_concept.get(c.pk, []), "sections": sections_by_concept.get(c.pk, []),
                       "questions": questions_by_concept.get(c.pk, []),
                       "professors": [{"name": _prof_label(prof_names.get(k, k)), "count": n} for k, n in profs]}}})
        edges.append({"data": {"id": f"sc{c.pk}", "source": f"s{c.subject_id}", "target": f"c{c.pk}", "kind": "has"}})
    for (a, b), weight in sorted(cooc.items(), key=lambda kv: -kv[1])[:MAX_EDGES]:
        edges.append({"data": {"id": f"cc{a}-{b}", "source": f"c{a}", "target": f"c{b}", "kind": "related", "weight": weight}})
    meta = {"subjects": len(subjects), "concepts": len(kept), "professors": len(prof_subjects),
            "questions": ExamQuestion.objects.filter(concepts__in=kept).distinct().count(),
            "hidden_concepts": max(0, len(concepts) - len(kept))}
    return {"nodes": nodes, "edges": edges, "meta": meta}


def overview(subject_name=""):
    """서버에서 바로 그리는 구조 보기: 과목 → 개념별 출제 횟수·수업 자료 수 막대. 교수·유형 통계도 함께."""
    from django.db.models import Count

    subjects = Subject.objects.all()
    if subject_name:
        subjects = subjects.filter(name=subject_name)
    out = []
    labels = dict(ExamQuestion.QType.choices)
    for s in subjects.order_by("name"):
        rows = list(s.concepts.annotate(doc_count=Count("document_concepts", distinct=True),
                                        q_count=Count("exam_questions", distinct=True)).order_by("-q_count", "-doc_count", "order"))
        if not rows and not s.documents.exists():
            continue
        top = max([r.q_count for r in rows] + [1])
        stats = exam_stats("", s.name)
        out.append({
            "name": s.name,
            "professors": sorted({p for p in PersonalDocument.objects.filter(topics=s).exclude(professor="")
                                  .values_list("professor", flat=True)}),
            "lecture_docs": PersonalDocument.objects.filter(topics=s, document_type=PersonalDocument.DocumentType.LECTURE).count(),
            "exam_docs": PersonalDocument.objects.filter(topics=s, document_type=PersonalDocument.DocumentType.EXAM).count(),
            "question_total": stats["total"],
            "types": [(labels.get(t, t), n) for t, n in sorted(stats["type_counts"].items(), key=lambda kv: -kv[1])],
            "concepts": [{"name": r.name, "docs": r.doc_count, "questions": r.q_count,
                          "bar": round(r.q_count / top * 100) if r.q_count else 0} for r in rows],
        })
    return out
