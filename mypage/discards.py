"""
모의고사에서 사용자가 버린 문제를 기록하고, 같은 사용자가 같은 과목의 모의고사를 다시 만들 때 '이런 문제는 내지 않는다'로 쓴다.

- 버릴 때 이유(범위 밖·너무 어려움·너무 쉬움·문제가 이상함·그냥 버림)를 고를 수 있다. 시험에서는 문제가 빠지고(번호가 당겨진다) 여기에 스냅샷이 남는다.
- 다음 출제 때 서버가 버린 기록을 보고 판단한다 (guidance). **버린 문제의 글은 프롬프트에 넣지 않는다** (토큰을 아끼려고 서버가 센 결과만 짧게 보낸다):
  · 이유별로 같은 이유가 2번 이상 쌓이면 그에 맞는 주의(범위 밖 → 자료 밖 금지 강화, 너무 어려움 → 난이도·개념 수 낮춤 …)를,
  · 한 유형이 버린 문제의 절반 이상(3개 이상)이면 그 유형을 신중히 내라는 주의를 덧붙인다.
- 새로 나온 문제가 버린 문제와 같은 문제(이미 만든 문제 중복 판정과 같은 기준)이면 서버가 그 문항을 걸러 낸다 (exclude_discarded).
- 기록은 사용자·과목별이다 (다른 사용자의 출제에는 영향이 없다 — 한 사람의 취향이나 장난이 모두의 시험을 바꾸지 않게).
"""
from .ai import is_duplicate_question
from .models import DiscardedQuestion

LOOKBACK = 40
KEEP_PER_USER = 300

REASON_ADVICE = {
    DiscardedQuestion.Reason.OUT_OF_SCOPE: "수업자료에 없는 개념·용어를 묻는 문제를 특히 조심하세요. 근거 문장이 확실한 내용만 묻습니다.",
    DiscardedQuestion.Reason.TOO_HARD: "난이도를 낮추세요: 한 문제에 한 가지 개념만 묻고, 계산 단계나 함정을 줄이고, 문장을 짧고 명확하게.",
    DiscardedQuestion.Reason.TOO_EASY: "정의를 그대로 묻는 쉬운 문제를 줄이고, 개념을 적용·비교·판단하게 하는 문제를 더 넣으세요.",
    DiscardedQuestion.Reason.WEIRD: "문장이 모호하거나 보기가 부실하거나 정답이 둘 이상으로 읽힐 수 있는 문제를 피하세요. 문장을 명확하게 쓰세요.",
}
TYPE_NAMES = {"ox": "OX", "mc": "객관식", "short": "단답", "essay": "서술형"}


def record(user, exam, question, reason, professor=""):
    reason = reason if reason in DiscardedQuestion.Reason.values else DiscardedQuestion.Reason.OTHER
    row = DiscardedQuestion.objects.create(user=user, course_code=exam.course_code[:50], professor=professor[:50], qtype=question.get("type", "")[:10],
                                           question=question, reason=reason)
    extra = DiscardedQuestion.objects.filter(user=user).order_by("-created_at", "-id").values_list("pk", flat=True)[KEEP_PER_USER:]
    if extra:
        DiscardedQuestion.objects.filter(pk__in=list(extra)).delete()
    return row


def recent(user, subject):
    if not subject:
        return []
    return list(DiscardedQuestion.objects.filter(user=user, course_code=subject)[:LOOKBACK])


def guidance(user, subject):
    """이번 출제 프롬프트에 붙일 짧은 주의 (서버가 버린 기록을 센 결과). 경향이 없으면 빈 문자열 — 버린 문제의 글은 보내지 않는다."""
    rows = recent(user, subject)
    if not rows:
        return ""
    lines = []
    reasons = {}
    for row in rows:
        reasons[row.reason] = reasons.get(row.reason, 0) + 1
    for reason, advice in REASON_ADVICE.items():
        if reasons.get(reason, 0) >= 2:
            lines.append(f"- {advice}")
    types = {}
    for row in rows:
        types[row.qtype] = types.get(row.qtype, 0) + 1
    for qtype, count in types.items():
        if count >= 3 and count * 2 >= len(rows) and qtype in TYPE_NAMES:
            lines.append(f"- {TYPE_NAMES[qtype]} 문제를 자주 버렸습니다. 이 유형은 더 신중하게, 잘 만든 문제만 내세요.")
    if not lines:
        return ""
    return "이 사용자가 이 과목의 모의고사에서 문제를 버린 경향입니다 (수업자료 범위와 다른 규칙은 그대로 지킵니다):\n" + "\n".join(lines)


def exclude_discarded(pairs, user, subject):
    """새로 나온 문항 [(정리한 문항, 근거)] 중 사용자가 버린 문제와 같은 문제를 걸러 낸다."""
    texts = [str(r.question.get("q") or "") for r in recent(user, subject)]
    if not texts:
        return pairs
    return [(q, src) for q, src in pairs if not is_duplicate_question(str(q.get("q") or ""), texts)]
