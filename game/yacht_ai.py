"""
요트 다이스 AI.

- 최대 난이도(AI 플레이어): 이번 차례 남은 굴림을 기대값으로 끝까지 계산(expectimax)한다.
    * 차례 끝 가치 V0(주사위) = 빈칸 중 max(점수 + 윗칸 보너스 진척 보정 - 그 칸의 기대 점수)
      "그 칸의 기대 점수"(par)는 그 칸만 노리고 3번 굴렸을 때의 평균 — 지금 낮은 점수로 칸을
      써버리면 나중에 그만큼 잃는다는 기회비용이다.
    * 남길 주사위(5개 중 부분집합) 각각에 대해 나머지를 굴렸을 때의 기대값을 정확히 계산해
      가장 좋은 쪽을 고르고, 지금 적는 게 더 나으면 바로 적는다.
- 중간 난이도: 가장 많이 나온 눈(또는 4개 연속)을 남기고, 지금 가장 높은 점수가 나오는 칸에 적는다.
  내다보기 없음.
- 쉬움: 한 번만 다시 굴려 보고, 가끔 아무 칸에나 적는다.
방 단계(초보/중수/고수)에 따라 AI 플레이어와 자리 비운 사람 대신 두기 모두 쉬움/보통/어려움을 쓴다 (act_for).
주사위 결과는 서버가 굴리므로 AI는 미래 주사위를 알 수 없다.
"""
import random
from collections import Counter
from functools import lru_cache
from itertools import combinations, combinations_with_replacement
from math import factorial

from .yacht_engine import CATEGORIES, UPPER, YACHT_BONUS, YACHT_BONUS_LINE, score_of

# 윗칸 보너스 진척 가중치 (눈 × 3 기준보다 1점 더/덜 적을 때의 가치, 보너스 확정 시 가산)
BONUS_WEIGHT = 3.5   # 200판 비교로 고름: 평균 186점, 보너스 62%
BONUS_LOCK = .8
EASY_CARELESS = .2  # 쉬움: 이 확률로 아무 빈 칸에나 적는다


# ── 주사위 조합 확률 ───────────────────────────────────────────────────────────

@lru_cache(maxsize=None)
def _outcomes(k):
    """주사위 k개를 굴렸을 때 나오는 (정렬된 눈 튜플, 확률) 목록."""
    res = []
    for combo in combinations_with_replacement(range(1, 7), k):
        ways = factorial(k)
        for c in Counter(combo).values():
            ways //= factorial(c)
        res.append((combo, ways / 6 ** k))
    return tuple(res)


ALL_HANDS = [h for h, _ in _outcomes(5)]
ALL_KEEPS = [k for n in range(6) for k in combinations_with_replacement(range(1, 7), n)]


def _sub_keeps(dice):
    return {tuple(sorted(c)) for n in range(6) for c in combinations(dice, n)}


def _merge(keep, roll):
    return tuple(sorted(keep + roll))


def _expectimax(v0):
    """v0(정렬된 주사위 5개) → 차례 끝 가치. 굴림이 r번 남았을 때 남길 주사위별 기대값 테이블을 만든다."""
    e1 = {k: sum(p * v0[_merge(k, o)] for o, p in _outcomes(5 - len(k))) for k in ALL_KEEPS}
    v1 = {h: max([v0[h]] + [e1[k] for k in _sub_keeps(h)]) for h in ALL_HANDS}
    e2 = {k: sum(p * v1[_merge(k, o)] for o, p in _outcomes(5 - len(k))) for k in ALL_KEEPS}
    return e1, e2


@lru_cache(maxsize=None)
def _par(cat):
    """그 칸만 노리고 3번 굴렸을 때의 평균 점수 (기회비용 기준)."""
    v0 = {h: score_of(cat, h) for h in ALL_HANDS}
    e1, e2 = _expectimax(v0)
    v1 = {h: max([v0[h]] + [e1[k] for k in _sub_keeps(h)]) for h in ALL_HANDS}
    v2 = {h: max([v1[h]] + [e2[k] for k in _sub_keeps(h)]) for h in ALL_HANDS}
    return sum(p * v2[h] for h, p in _outcomes(5))


def _cat_value(card, cat, dice):
    pts = score_of(cat, dice)
    value = pts - _par(cat)
    if cat in UPPER:
        upper = sum(card.get(c, 0) for c in UPPER)
        open_upper = [c for c in UPPER if c not in card and c != cat]
        best_rest = sum(5 * (UPPER.index(c) + 1) for c in open_upper)
        if upper < YACHT_BONUS_LINE <= upper + pts + best_rest:
            # 보너스가 아직 가능하면 기준(눈 × 3)보다 많이/적게 적는 만큼 보너스 진척으로 본다
            face = UPPER.index(cat) + 1
            value += (pts - 3 * face) * (YACHT_BONUS / YACHT_BONUS_LINE) * BONUS_WEIGHT
            if upper + pts >= YACHT_BONUS_LINE:
                value += YACHT_BONUS * BONUS_LOCK  # 이 칸으로 보너스 확정
    return value


def _best_category(card, dice):
    return max((c for c in CATEGORIES if c not in card), key=lambda c: _cat_value(card, c, dice))


def _held_for(dice, keep):
    """남길 눈 멀티셋을 주사위 위치(held 목록)로."""
    need = Counter(keep)
    held = []
    for d in dice:
        if need[d] > 0:
            held.append(True)
            need[d] -= 1
        else:
            held.append(False)
    return held


def hard_action(st, side):
    card = st["cards"][side]
    if st["rolls"] == 0:
        return ("roll", None)
    dice = tuple(sorted(st["dice"]))
    open_cats = [c for c in CATEGORIES if c not in card]
    v0 = {h: max(_cat_value(card, c, h) for c in open_cats) for h in ALL_HANDS}
    if st["rolls"] < 3:
        e1, e2 = _expectimax(v0)
        table = e2 if st["rolls"] == 1 else e1
        keep = max(_sub_keeps(dice), key=lambda k: table[k])
        if table[keep] > v0[dice] + 1e-9 and len(keep) < 5:
            return ("roll", _held_for(st["dice"], keep))
    return ("score", _best_category(card, dice))


def medium_action(st, side):
    card = st["cards"][side]
    if st["rolls"] == 0:
        return ("roll", None)
    dice = st["dice"]
    open_cats = [c for c in CATEGORIES if c not in card]
    best = max(open_cats, key=lambda c: score_of(c, dice))
    if st["rolls"] < 3 and score_of(best, dice) < 20:
        faces = set(dice)
        for run in ({2, 3, 4, 5}, {1, 2, 3, 4}, {3, 4, 5, 6}):
            if run <= faces and ("small_straight" in open_cats or "large_straight" in open_cats):
                return ("roll", _held_for(dice, sorted(run)))
        face, _ = max(Counter(dice).items(), key=lambda kv: (kv[1], kv[0]))
        held = [d == face for d in dice]
        if not all(held):
            return ("roll", held)
    return ("score", best)


def easy_action(st, side, rng=None):
    """쉬움: 한 번만 다시 굴려 보고(가장 많이 나온 눈만 남김), 지금 점수가 가장 높은 칸에 적는다.
    가끔은 생각 없이 아무 빈 칸에나 적는다."""
    rng = rng or random.Random()
    card = st["cards"][side]
    if st["rolls"] == 0:
        return ("roll", None)
    dice = st["dice"]
    open_cats = [c for c in CATEGORIES if c not in card]
    best = max(open_cats, key=lambda c: score_of(c, dice))
    if st["rolls"] == 1 and score_of(best, dice) < 15:
        face, _ = max(Counter(dice).items(), key=lambda kv: (kv[1], kv[0]))
        held = [d == face for d in dice]
        if not all(held):
            return ("roll", held)
    if rng.random() < EASY_CARELESS:
        return ("score", rng.choice(open_cats))
    return ("score", best)


LEVEL_ACTIONS = {"easy": easy_action, "normal": medium_action, "hard": hard_action}


def act_for(level, st, side):
    """방 단계의 난이도로 한 수 (초보=쉬움, 중수=보통, 고수=어려움)."""
    return LEVEL_ACTIONS.get(level, medium_action)(st, side)
