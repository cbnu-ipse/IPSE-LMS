"""
족보(기출·모의고사)에서 교수님 출제 스타일을 배워 문제에 반영한다.

- 족보(PersonalDocument.document_type == EXAM)를 교수 이름으로 묶는다. 같은 교수님이면 과목이 달라도 한 스타일을 공유하고,
  교수 이름이 없는 족보는 과목(주제) 단위로 묶는다 (ExamStyle.key: "p:<교수>" / "s:<과목>").
- refresh_style: 묶음의 족보 본문을 AI가 한 번 읽고 문제를 만들 때 쓰는 지시문(guidelines)과 유형 비율을 뽑아 저장한다.
  족보가 그대로면 다시 부르지 않는다 (source_hash). 시스템 작업이라 크레딧을 받지 않는다.
- style_for: 강의(과목·교수)에 맞는 스타일. 강의 챕터의 확인 문제(course/studio.py)와 자료별 문제 생성에 지시문이 들어간다.
- generate_mock_exam: 고른 수업 자료들의 요약 + 그 자료의 교수님 스타일(+ 족보 예시)로 모의 출제. 문제는 ox/mc/short라 서버가 채점한다.
"""
import hashlib
import json
import logging
import re
from collections import Counter

from core import ai as core_ai

from .models import Concept, ExamQuestion, ExamStyle, MockExam, PersonalDocument
from .naming import professor_key  # noqa: F401 (다른 모듈이 mypage.exam에서 가져다 쓴다)
from .ontology import exam_questions_for, exam_stats

logger = logging.getLogger(__name__)

EXAM_DOC_CHARS = 6000       # 족보 하나에서 읽는 길이
EXAM_TOTAL_CHARS = 24000    # 스타일을 뽑을 때 읽는 족보 전체 길이
EXAMPLE_CHARS = 3600        # 모의 출제에 예시로 보여 주는 족보 길이
MATERIAL_CHARS = 14000      # 모의 출제에 넣는 수업 자료 요약 길이
MOCK_QUESTIONS = 10
MIN_VALID_QUESTIONS = 5

STYLE_SYSTEM = (
    "대학 시험 족보(기출문제)를 읽고 이 교수님의 출제 스타일을 분석합니다. 다른 과목에도 적용할 수 있게 "
    "과목 내용이 아니라 '출제 방식'을 뽑아내세요. 문제를 그대로 옮겨 적지 마세요.\n"
    '- mix: 문제 유형 비율 {"ox": 0~1, "mc": 0~1, "short": 0~1, "essay": 0~1} (합이 1 근처). 서술형·계산형은 essay.\n'
    "- difficulty: 난이도와 문제 길이 특징 한 문장.\n"
    "- traits: 문제 문장·보기·함정의 특징 3~6개 (예: '보기에 \"모두 고르시오\"가 자주 나온다', '정의를 그대로 묻기보다 예시에 적용시킨다').\n"
    "- guidelines: 이 교수님 스타일로 문제를 만들 때 따를 지시문. 줄마다 '- '로 시작하는 6~10줄, 문제 문장 톤·유형 비중·보기 구성·난이도를 구체적으로.\n"
    'JSON으로만 답하세요: {"mix": {...}, "difficulty": "...", "traits": ["..."], "guidelines": "- ...\\n- ..."}'
)

MOCK_SYSTEM = (
    "대학 시험 출제 위원입니다. 주어진 수업 자료 요약을 범위로 모의고사를 냅니다.\n"
    f"- 문항은 {MOCK_QUESTIONS}개. 자료에 있는 내용만 묻습니다.\n"
    "- 유형은 ox, mc(객관식), short(단답), essay(서술형)를 씁니다. 계산형·코드형도 풀이나 설명을 쓰게 하는 essay로 냅니다.\n"
    "- 출제 스타일이 주어지면 유형 비율·문제 문장·보기 구성·난이도를 그에 맞춥니다. 예시 족보의 문제는 베끼지 말고 방식만 따릅니다. "
    "스타일이 없으면 OX 2, 객관식 4, 단답 2, 서술형 2개 정도로 섞습니다.\n"
    "- 정답이 한쪽으로 쏠리지 않게 합니다 (OX는 O/X를 섞고, 객관식 정답 번호도 골고루).\n"
    "- 형식:\n"
    '  OX: {"type": "ox", "q": "...", "answer": false, "explanation": "..."}\n'
    '  객관식: {"type": "mc", "q": "...", "options": ["...", "...", "...", "..."], "answer": 2, "explanation": "..."} (answer는 0부터)\n'
    '  단답: {"type": "short", "q": "...", "answers": ["정답", "다른 표현"], "explanation": "..."}\n'
    '  서술형: {"type": "essay", "q": "...", "answer": "채점 기준이 되는 모범답안(핵심 요소 포함, 3~6문장)", "explanation": "..."}\n'
    'JSON으로만 답하세요: {"title": "...", "questions": [...]}'
)


def style_key(professor="", subject=""):
    pk = professor_key(professor)
    if pk:
        return f"p:{pk}"
    return f"s:{subject}" if subject else ""


def exam_docs(professor="", subject=""):
    """스타일의 근거가 되는 족보. 교수 이름이 있으면 과목과 상관없이 그 교수님 족보 전부, 없으면 그 과목의 족보."""
    qs = PersonalDocument.objects.filter(document_type=PersonalDocument.DocumentType.EXAM).exclude(extracted_text="")
    pk = professor_key(professor)
    if pk:
        return [d for d in qs.exclude(professor="").order_by("id") if professor_key(d.professor) == pk]
    if subject:
        return list(qs.filter(topics__name=subject).distinct().order_by("id"))
    return []


def _sha(*parts):
    return hashlib.sha256(json.dumps(parts, ensure_ascii=False).encode()).hexdigest()


def refresh_style(professor="", subject=""):
    """묶음의 스타일을 (족보가 바뀌었을 때만) 다시 뽑는다. 족보가 없으면 스타일도 지운다. ExamStyle 또는 None."""
    key = style_key(professor, subject)
    if not key:
        return None
    docs = exam_docs(professor, subject)
    if not docs:
        ExamStyle.objects.filter(key=key).delete()
        return None
    source_hash = _sha([(d.pk, d.content_hash or len(d.extracted_text)) for d in docs])
    existing = ExamStyle.objects.filter(key=key).first()
    if existing and existing.source_hash == source_hash:
        return existing
    material = "\n\n".join(f"## 족보 {i}: {d.title}\n{d.extracted_text[:EXAM_DOC_CHARS]}"
                           for i, d in enumerate(docs, 1))[:EXAM_TOTAL_CHARS]
    data = core_ai.complete_json("exam_style", [
        {"role": "system", "content": STYLE_SYSTEM},
        {"role": "user", "content": core_ai.untrusted("족보", material)},
    ])
    guidelines = str(data.get("guidelines") or "").strip()[:2000]
    if not guidelines:
        return existing
    label = (f"{docs[0].professor.strip()} 교수님" if professor_key(professor) else subject)[:100]
    profile = {"mix": data.get("mix") if isinstance(data.get("mix"), dict) else {},
               "difficulty": str(data.get("difficulty") or "")[:300],
               "traits": [str(t)[:200] for t in (data.get("traits") or [])[:6]]}
    style, _ = ExamStyle.objects.update_or_create(
        key=key, defaults={"label": label, "guidelines": guidelines, "profile": profile,
                           "source_hash": source_hash, "doc_count": len(docs)})
    return style


def style_for(professor="", subject=""):
    """강의(과목·교수)에 맞는 스타일: 그 교수님 스타일이 있으면 그것, 없으면 과목 스타일."""
    keys = [k for k in (style_key(professor), style_key("", subject)) if k]
    for key in keys:
        style = ExamStyle.objects.filter(key=key).first()
        if style:
            return style
    return None


def topic_professor(subject):
    """주제(과목)의 자료에 가장 많이 적힌 교수 이름. 없으면 빈 문자열."""
    names = (PersonalDocument.objects.filter(topics__name=subject).exclude(professor="")
             .values_list("professor", flat=True))
    counts = Counter(professor_key(n) for n in names if professor_key(n))
    if not counts:
        return ""
    top = counts.most_common(1)[0][0]
    return next(n.strip() for n in names if professor_key(n) == top)


def style_for_topic(subject):
    return style_for(topic_professor(subject), subject)


def style_prompt(style, professor="", subject=""):
    """프롬프트에 넣을 출제 지시문: AI가 족보에서 뽑은 스타일 + 문제 단위 분석에서 센 유형 비율·자주 나온 개념.
    스타일도 분석도 없으면 빈 문자열."""
    from .models import ExamQuestion
    from .ontology import exam_stats

    parts = [style.guidelines] if style and style.guidelines else []
    stats = exam_stats(professor, subject)
    if stats["total"]:
        labels = dict(ExamQuestion.QType.choices)
        mix = ", ".join(f"{labels.get(t, t)} {round(v * 100)}%"
                        for t, v in sorted(stats["type_mix"].items(), key=lambda kv: -kv[1]))
        parts.append(f"- 문항 유형 비율(족보 {stats['total']}문항을 센 결과): {mix}")
    if stats["concepts"]:
        parts.append("- 족보에서 자주 나온 개념(많이 나온 순): " + ", ".join(f"{n}({c}회)" for n, c in stats["concepts"][:8]))
    return "\n".join(parts)


def style_signature(style, professor="", subject=""):
    """스타일이나 족보 분석이 바뀌었는지 알아보는 값 (강의 초안·챕터를 다시 만들지 판단)."""
    from .ontology import exam_stats

    stats = exam_stats(professor, subject)
    return _sha([style.source_hash if style else "", stats["total"], sorted(stats["type_counts"].items()), stats["concepts"]])


def professor_topics(professor):
    """이 교수님의 수업 자료가 속한 주제(과목) 이름들 — 스타일이 바뀌면 이 강의들의 확인 문제도 달라진다."""
    key = professor_key(professor)
    if not key:
        return set()
    names = set()
    for doc in PersonalDocument.objects.exclude(professor="").filter(document_type=PersonalDocument.DocumentType.LECTURE):
        if professor_key(doc.professor) == key:
            names.update(doc.topics.values_list("name", flat=True))
    return names


def refresh_for(professors=(), subjects=()):
    """교수·과목 묶음 스타일을 모두 새로 고친다 (자료 구분·교수·과목이 바뀐 뒤 불러서 오래된 스타일을 정리)."""
    seen = set()
    for professor in professors:
        if professor_key(professor) and style_key(professor) not in seen:
            seen.add(style_key(professor))
            refresh_style(professor=professor)
    for subject in subjects:
        if subject and style_key("", subject) not in seen:
            seen.add(style_key("", subject))
            refresh_style(subject=subject)


def _normalize_mock_question(q):
    """ox/mc/short는 강의 문제와 같은 규칙, essay는 모범답안이 있어야 한다."""
    from course import ai as course_ai

    if isinstance(q, dict) and q.get("type") == "essay":
        text, answer = str(q.get("q") or "").strip()[:500], str(q.get("answer") or "").strip()[:1500]
        if not text or not answer:
            return None
        return {"type": "essay", "q": text, "answer": answer, "explanation": str(q.get("explanation") or "").strip()[:400]}
    return course_ai.normalize_question(q)


def essay_count(exam, raw_answers=None):
    """서술형 문항 수 (raw_answers를 주면 답을 쓴 문항만) — 채점 사용량을 미리 확인할 때 쓴다."""
    return sum(1 for i, q in enumerate(exam.questions)
               if q["type"] == "essay" and (raw_answers is None or (raw_answers.get(str(i)) or "").strip()))


def type_plan(stats, total=MOCK_QUESTIONS):
    """족보에서 센 유형 비율을 모의고사 문항 수로 옮긴다 (가장 큰 나머지 방식). 모의고사에 없는 유형(계산·코드)은 서술형, 기타는 단답.
    족보 분석이 3문항 미만이면 빈 dict (AI가 알아서 섞는다)."""
    if stats["total"] < 3:
        return {}
    shares = Counter()
    for qtype, n in stats["type_counts"].items():
        shares[{"calc": "essay", "code": "essay", "other": "short"}.get(qtype, qtype)] += n
    exact = {t: total * n / sum(shares.values()) for t, n in shares.items()}
    plan = {t: int(v) for t, v in exact.items()}
    for t in sorted(exact, key=lambda k: exact[k] - plan[k], reverse=True)[: total - sum(plan.values())]:
        plan[t] += 1
    return plan


def covered_concepts(doc_ids):
    """수업 자료들이 다루는 개념 이름 (개념 태그가 있을 때)."""
    names = (Concept.objects.filter(document_concepts__document_id__in=doc_ids).distinct().order_by("order", "id")
             .values_list("name", flat=True))
    return list(names)[:30]


def usable_for_mock(document):
    """모의 출제의 재료로 쓸 수 있는 자료: 수업 자료(족보·노트는 아님)이고 요약이나 본문이 있어야 한다."""
    return (document.document_type == PersonalDocument.DocumentType.LECTURE
            and bool(document.summary.strip() or document.extracted_text.strip()))


def _most_common(values):
    counts = Counter(v for v in values if v)
    return counts.most_common(1)[0][0] if counts else ""


def generate_mock_exam(user, documents):
    """고른 수업 자료들로 모의 출제를 만든다 (쓸 만한 문제가 모자라면 ValueError). MockExam을 돌려준다.
    출제 스타일은 고른 자료에 적힌 교수님(없으면 과목)의 족보에서 배운 것을 쓴다."""
    from course import ai as course_ai

    documents = [d for d in documents if usable_for_mock(d)]
    if not documents:
        raise ValueError("모의 출제에 쓸 수업 자료가 없습니다. 요약이 끝난 수업 자료를 골라주세요.")
    subject = _most_common(d.course_name for d in documents)
    professor = _most_common(d.professor for d in documents)
    style = style_for(professor, subject)
    stats = exam_stats(professor, subject)
    examples = ""
    if stats["total"]:      # 족보를 문제 단위로 분석해 뒀으면 문제 요약을 예시로 쓴다 (원문을 통째로 넣는 것보다 짧고 정확하다)
        labels = dict(ExamQuestion.QType.choices)
        rows = exam_questions_for(professor, subject)[:12]
        examples = "\n".join(f"- [{labels.get(q.qtype, q.qtype)}] {q.text}" for q in rows)
    elif style:
        examples = "\n\n".join(d.extracted_text[:EXAMPLE_CHARS // 3] for d in exam_docs(professor, subject)[:3])[:EXAMPLE_CHARS]
    per = max(MATERIAL_CHARS // len(documents), 1500)
    material = "\n\n".join(f"## {d.title}\n{(d.summary.strip() or d.extracted_text.strip())[:per]}" for d in documents)[:MATERIAL_CHARS]
    request = f"과목: {subject or documents[0].title}\n"
    if style:
        request += f"출제 스타일({style.label}):\n{style.guidelines}\n"
    plan = type_plan(stats)
    if plan:
        labels = {"ox": "OX", "mc": "객관식", "short": "단답", "essay": "서술형"}
        request += "문항 구성(정확히 이대로): " + ", ".join(f"{labels[t]} {n}개" for t, n in plan.items() if n) + "\n"
    if stats["concepts"]:
        request += ("개념별 출제 비중(족보에서 자주 나온 순, 앞쪽 개념을 더 많이 묻고 수업 자료의 다른 개념도 1~2문항 섞기): "
                    + ", ".join(f"{n}({c}회)" for n, c in stats["concepts"][:8]) + "\n")
    covered = covered_concepts([d.id for d in documents])
    if covered:
        request += "수업 자료가 다루는 개념: " + ", ".join(covered) + "\n"
    request += "\n" + core_ai.untrusted("수업자료", material)
    if examples:
        request += "\n\n" + core_ai.untrusted("족보예시", examples)
    data = core_ai.complete_json("mock_exam", [
        {"role": "system", "content": MOCK_SYSTEM},
        {"role": "user", "content": request},
    ], user=user)
    questions = [q for q in map(_normalize_mock_question, (data.get("questions") or [])[:MOCK_QUESTIONS * 2]) if q]
    questions = questions[:MOCK_QUESTIONS]
    if len(questions) < MIN_VALID_QUESTIONS:
        core_ai.refund(user, "mock_exam", core_ai.cost_for("mock_exam"))
        raise ValueError("AI가 쓸 만한 문제를 충분히 만들지 못했습니다. 잠시 후 다시 시도해주세요.")
    course_ai.shuffle_choices([{"questions": questions}])
    title = documents[0].title if len(documents) == 1 else (subject or "여러 자료")
    return MockExam.objects.create(
        user=user, course_code=subject, title=str(data.get("title") or f"{title} 모의고사")[:200],
        style_label=style.label if style else "", questions=questions)


def grade_mock_exam(exam, raw_answers):
    """제출한 답({인덱스: 문자열})을 채점해 저장한다. ox/mc/short는 서버가, 서술형은 AI가 채점한다 (답을 쓴 서술형마다
    AI 채점이라 사용량이 든다. 채점이 실패하면 오답 처리한다). 문항별 정오 리스트를 돌려준다."""
    from course.studio import grade_question
    from django.utils import timezone

    from .ai import grade_answer

    answers, results, feedback = [], [], []
    for i, q in enumerate(exam.questions):
        raw = raw_answers.get(str(i), "")
        note = ""
        if q["type"] == "essay":
            value = raw.strip()
            ok = False
            if not value:
                note = "답을 쓰지 않았습니다."
            else:
                try:
                    graded = grade_answer(q["q"], q["answer"], value, user=exam.user, question_type="essay")
                    ok, note = graded["is_correct"], graded["feedback"]
                except core_ai.AIQuotaExceeded:
                    note = "이번 주 AI 사용 한도가 모자라 채점하지 못했습니다."
                except Exception:
                    logger.exception("모의 출제 %s 서술형 채점 실패", exam.pk)
                    note = "채점하지 못했습니다."
        else:
            if q["type"] == "ox":
                value = {"O": True, "X": False}.get(raw.strip().upper())
            elif q["type"] == "mc":
                value = int(raw) if raw.strip().isdigit() else None
            else:
                value = raw.strip()
            ok = bool(value is not None and grade_question(q, value))
        answers.append(value)
        results.append(ok)
        feedback.append(note)
    exam.answers, exam.results, exam.feedback, exam.submitted_at = answers, results, feedback, timezone.now()
    exam.save(update_fields=["answers", "results", "feedback", "submitted_at"])
    return results
