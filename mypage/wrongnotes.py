"""
오답노트: 틀렸거나 '모르겠음'으로 넘긴 문제를 모아 두고 다시 풀게 한다.

- 담기: 모의고사를 채점할 때(grade_mock_exam)와 자료 퀴즈에서 틀리거나 '모르겠음'을 눌렀을 때(views.submit_answer_view) record()로 담는다.
  예전에 푼 것은 sync()가 처음 열 때 한 번 채워 준다 (이미 있는 문제는 건드리지 않고, 사용자가 제거한 문제는 다시 만들지 않는다).
- 다시 풀기: attempt()가 ox/mc/단답은 서버가 채점하고(AI 없음), 서술형은 모범답안을 보고 스스로 맞았는지 고르게 한다 (AI 재채점 없음).
  맞든 틀리든 횟수만 올라가고 문제는 사라지지 않는다. 사라지게 하려면 사용자가 직접 제거한다.
"""
from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import GeneratedQuestion, MockExam, WrongNote

UNKNOWN_ANSWER = "모르겠음"


def snapshot_from_quiz(q):
    """자료 퀴즈 문제(GeneratedQuestion)를 모의고사 문제와 같은 모양으로 옮긴다."""
    kind = q.question_type
    base = {"type": kind, "q": q.question_text, "explanation": q.feedback if kind in ("ox", "mc") else ""}
    if kind == "ox":
        return {**base, "answer": q.answer.strip().upper() == "O"}
    if kind == "mc":
        try:
            answer = int(q.answer)
        except (TypeError, ValueError):
            answer = 0
        return {**base, "options": list(q.options or []), "answer": answer}
    if kind == "short":
        return {**base, "answers": [a.strip() for a in q.answer.split("|") if a.strip()] or [q.answer.strip()]}
    return {**base, "answer": q.answer}


def record(user, source, source_id, index, title, subject, question, reason=WrongNote.Reason.WRONG):
    """오답노트에 담는다 (이미 있으면 그대로). 새로 담긴 문제는 틀린 횟수 1로 시작한다."""
    try:
        with transaction.atomic():
            note, created = WrongNote.objects.get_or_create(
                user=user, source=source, source_id=source_id, index=index,
                defaults={"source_title": title[:200], "subject": subject[:100], "question": question, "reason": reason, "wrong_count": 1})
    except IntegrityError:
        return None
    return note


def sync(user):
    """예전에 푼 모의고사·자료 퀴즈의 오답을 오답노트에 채운다 (이미 있는 것은 그대로)."""
    from .exam import exam_rows

    for exam in MockExam.objects.filter(user=user, submitted_at__isnull=False):
        for row in exam_rows(exam):
            if not row["correct"]:
                reason = WrongNote.Reason.UNKNOWN if UNKNOWN_ANSWER in (row.get("note") or "") else WrongNote.Reason.WRONG
                record(user, WrongNote.Source.MOCK, exam.pk, row["index"], exam.title, exam.course_code, row["q"], reason)
    for q in GeneratedQuestion.objects.filter(document__user=user, document__is_deleted=False, is_correct=False).select_related("document"):
        reason = WrongNote.Reason.UNKNOWN if q.user_answer == UNKNOWN_ANSWER else WrongNote.Reason.WRONG
        record(user, WrongNote.Source.QUIZ, q.pk, 0, q.document.title, q.document.course_name, snapshot_from_quiz(q), reason)


def correct_text(q):
    """정답을 글로: ox → O/X, 객관식 → '번호. 보기', 단답 → 정답 모음, 서술형 → 모범답안."""
    kind = q.get("type")
    if kind == "ox":
        return "O" if q.get("answer") else "X"
    if kind == "mc":
        options, answer = q.get("options") or [], q.get("answer")
        return f"{answer + 1}. {options[answer]}" if isinstance(answer, int) and 0 <= answer < len(options) else ""
    if kind == "short":
        return " / ".join(q.get("answers") or [])
    return str(q.get("answer") or "")


def _check(q, raw):
    """ox/mc/단답 채점 (서버, AI 없음). 답이 비었거나 형식이 틀리면 None(채점 불가)."""
    from course.studio import grade_question

    raw = str(raw or "").strip()
    if not raw:
        return None
    kind = q.get("type")
    if kind == "ox":
        value = {"O": True, "X": False}.get(raw.upper())
    elif kind == "mc":
        value = int(raw) if raw.isdigit() else None
    else:
        value = raw
    return None if value is None else bool(grade_question(q, value))


def attempt(note, answer=None, unknown=False, self_correct=None):
    """오답노트 문제를 다시 푼 결과를 기록한다. 돌려주는 값: dict(
      graded: 채점이 끝났는지, correct: 맞았는지, needs_self_grade: 서술형이라 스스로 맞았는지 골라야 하는지,
      correct_text, explanation, correct_count, wrong_count).
    - 모르겠음: 틀린 것으로 센다.  - 서술형: answer만 보내면 모범답안을 보여 주고(채점 보류), self_correct(True/False)를 보내면 센다."""
    q = note.question
    kind = q.get("type")
    payload = {"correct_text": correct_text(q), "explanation": q.get("explanation") or ""}

    def finish(ok, shown):
        now = timezone.now()
        field = "correct_count" if ok else "wrong_count"
        WrongNote.objects.filter(pk=note.pk).update(**{field: models_f(field)}, last_result=ok, last_answer=str(shown)[:2000], last_attempt_at=now)
        note.refresh_from_db()
        return {**payload, "graded": True, "correct": ok, "needs_self_grade": False,
                "correct_count": note.correct_count, "wrong_count": note.wrong_count}

    if unknown:
        return finish(False, UNKNOWN_ANSWER)
    if kind == "essay":
        if self_correct is None:
            WrongNote.objects.filter(pk=note.pk).update(last_answer=str(answer or "")[:2000])
            return {**payload, "graded": False, "correct": None, "needs_self_grade": True,
                    "correct_count": note.correct_count, "wrong_count": note.wrong_count}
        return finish(bool(self_correct), answer or note.last_answer)
    ok = _check(q, answer)
    if ok is None:
        raise ValueError("답을 입력해주세요.")
    return finish(ok, answer)


def models_f(name):
    from django.db.models import F

    return F(name) + 1
