"""
고스톱/맞고 AI — 몬테카를로 (결정화 + 롤아웃).

AI가 둘 차례마다:
  1. 후보 수를 모두 뽑는다 (낼 패 × 바닥 두 장 중 고를 패 × 흔들기/폭탄, 뒤집은 패 선택, 고/스톱).
  2. AI가 모르는 카드(상대 손패 + 더미)를 무작위로 다시 섞어 가능한 판 하나를 만들고(결정화),
     모든 후보를 같은 판에서 한 번씩 끝까지 빠르게 진행(롤아웃)해 AI 기준 점수 손익을 잰다.
     같은 판으로 후보를 비교해야(공통 난수) 적은 시뮬레이션으로도 차이가 잘 드러난다.
  3. 시간 예산 동안 2를 반복하고 평균 손익이 가장 높은 수를 고른다.

정보는 공정하다: 롤아웃 전에 상대 손패와 더미를 섞으므로 실제 배치를 들여다보지 않는다.
롤아웃은 탐욕 정책(바로 먹을 수 있는 가장 값진 패)으로 양쪽 모두를 대신 둔다.
"""
import random
import time

from . import gostop_engine as eng

AI_TIME_BUDGET = 0.8  # 한 번 둘 때 생각하는 시간(초)


def _card_value(c):
    card = eng.CARDS[c]
    k = card["k"]
    if k == "g":
        return 20
    if k == "y":
        return 14 if card.get("godori") else 9
    if k == "t":
        return 9 if card["t"] else 6
    if k in ("pp", "bonus"):
        return 8 + card.get("pi", 2)
    return 4


def _clone(o):
    if isinstance(o, list):
        return [_clone(x) for x in o]
    if isinstance(o, dict):
        return {k: _clone(v) for k, v in o.items()}
    return o


def candidates(st, s):
    ph = st["phase"]
    if ph == "go_stop":
        return [("go", True), ("go", False)]
    if ph == "choose_flip":
        return [("choose", t) for t in st["pending"]["options"]]
    hand = st["hands"][s]
    bonus = next((c for c in hand if eng.is_bonus(c)), None)
    if bonus is not None:  # 보너스패는 공짜(피 뺏고 한 장 보충)라 항상 먼저 낸다
        return [("play", bonus, None, None)]
    cands = []
    for c in hand:
        m = eng.month(c)
        floor_m = [f for f in st["floor"] if eng.month(f) == m]
        same = [x for x in hand if eng.month(x) == m]
        targets = [None]
        if len(floor_m) == 2 and eng._signature(floor_m[0]) != eng._signature(floor_m[1]):
            targets = floor_m
        for t in targets:
            cands.append(("play", c, t, None))
        if len(same) >= 3 and len(floor_m) == 1:
            cands.append(("play", c, None, "bomb"))
        if len(same) >= 3 and m not in st["shaken"][s]:
            for t in targets:
                cands.append(("play", c, t, "shake"))
    if st["bombs"][s]:
        cands.append(("play", "bomb", None, None))
    return cands


def apply(st, s, cand):
    if cand[0] == "go":
        return eng.declare_go_stop(st, s, cand[1])
    if cand[0] == "choose":
        return eng.choose_flip_card(st, s, cand[1])
    _, c, t, mode = cand
    return eng.play_card(st, s, c, target=t, mode=mode)


def _policy(st, s):
    """롤아웃용 빠른 탐욕 정책."""
    ph = st["phase"]
    if ph == "go_stop":
        n = len(st["hands"])
        threat = max(eng.best_score(st["captured"][o]) for o in range(n) if o != s)
        left = len(st["hands"][s]) + st["bombs"][s]
        return ("go", left >= 3 and threat <= st["win_score"] // 2)
    if ph == "choose_flip":
        return ("choose", max(st["pending"]["options"], key=_card_value))
    hand = st["hands"][s]
    if not hand:
        return ("play", "bomb", None, None)
    best = None
    for c in hand:
        if eng.is_bonus(c):
            return ("play", c, None, None)
        floor_m = [f for f in st["floor"] if eng.month(f) == eng.month(c)]
        t = None
        if not floor_m:
            v = -_card_value(c) * .5  # 먹을 게 없으면 덜 아까운 패를 버린다
        elif len(floor_m) == 2:
            t = max(floor_m, key=_card_value)
            v = _card_value(c) + _card_value(t)
        else:
            v = _card_value(c) + sum(_card_value(f) for f in floor_m) + (6 if len(floor_m) == 3 else 0)
        if best is None or v > best[0]:
            best = (v, c, t)
    return ("play", best[1], best[2], None)


def _value(st, outcome, me):
    """판이 끝났을 때 AI(me) 기준 점수 손익. 첫뻑 등 보너스 정산 포함."""
    n = len(st["hands"])
    v = 0.0
    if outcome and outcome.get("winner") is not None:
        w = outcome["winner"]
        payments, _ = eng.settle(st, w, outcome["reason"])
        if w == me:
            v += sum(p["points"] for p in payments)
        else:
            v -= sum(p["points"] for p in payments if p["side"] == me)
    for b in st.get("bonus_pay", []):
        v += b["points"] * (n - 1) if b["side"] == me else -b["points"]
    return v


def _rollout(st, outcome, me):
    steps = 0
    while outcome is None and steps < 120:
        s = st["turn"]
        try:
            outcome = apply(st, s, _policy(st, s))
        except ValueError:
            outcome = eng.auto_act(st, s)
        steps += 1
    return _value(st, outcome, me)


def _determinize(st, me, rng):
    """AI가 모르는 카드(상대 손패 + 더미)를 섞어 다시 나눈 판."""
    sim = _clone(st)
    n = len(sim["hands"])
    pool = list(sim["pile"])
    for o in range(n):
        if o != me:
            pool += sim["hands"][o]
    # 정렬한 뒤 섞는다: 실제 더미 순서·상대 손패 배치가 결과에 전혀 영향을 주지 않게 해서
    # "AI는 숨은 카드를 보지 않는다"를 테스트로 증명할 수 있게 한다
    pool.sort()
    rng.shuffle(pool)
    i = 0
    for o in range(n):
        if o == me:
            continue
        k = len(sim["hands"][o])
        sim["hands"][o] = sorted(pool[i:i + k])
        i += k
    sim["pile"] = pool[i:]
    return sim


def choose(st, me, budget=None, rng=None):
    budget = AI_TIME_BUDGET if budget is None else budget
    rng = rng or random.Random()
    cands = candidates(st, me)
    if len(cands) == 1:
        return cands[0]
    totals = [0.0] * len(cands)
    rounds = 0
    deadline = time.monotonic() + budget
    while rounds == 0 or time.monotonic() < deadline:
        base = _determinize(st, me, rng)
        for k, cand in enumerate(cands):
            sim = _clone(base)
            try:
                out = apply(sim, me, cand)
            except ValueError:
                totals[k] = float("-inf")
                continue
            totals[k] += _rollout(sim, out, me)
        rounds += 1
    return cands[max(range(len(cands)), key=lambda k: totals[k])]


def act(st, me, budget=None, rng=None):
    """AI 차례를 둔다. 반환값은 엔진과 같은 판 종료 outcome 또는 None."""
    return apply(st, me, choose(st, me, budget, rng))
