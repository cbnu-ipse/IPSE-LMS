"""
포커 AI — 몬테카를로 승률 + 팟 오즈 기반 베팅.

AI 차례마다:
  1. 승률(equity): 아직 폴드하지 않은 상대들의 홀카드와 남은 공동 카드를 모르는 카드에서
     무작위로 채워 끝까지 비교하기를 시간 예산만큼 반복한다 (상대 카드는 보지 않음).
  2. 결정:
     - 콜할 금액이 없으면: 강하면 팟 크기에 비례해 벳(가끔 슬로플레이로 체크), 약하면 체크,
       가끔 블러핑 벳.
     - 콜할 금액이 있으면: 승률 < 팟 오즈(콜 금액 / 콜 후 팟)면 폴드, 아주 강하면 레이즈,
       그 사이면 콜. 큰 베팅을 받을수록 상대 패가 강하다고 보고 요구 승률을 조금 올린다.
     - 무작위를 섞어 같은 상황에서도 늘 같은 선택을 하지 않는다 (읽히지 않도록).

난이도(방 단계: 초보=쉬움, 중수=보통, 고수=어려움 — AI 플레이어와 시간초과한 사람 대신 두기 모두):
  - 어려움: 위 그대로.
  - 보통: 승률을 대충만 계산하고(오차가 섞임), 팟 오즈를 덜 따지며 레이즈·블러핑을 덜 한다.
  - 쉬움: 웬만하면 따라가는(콜) 수동적인 플레이. 아주 강할 때만 올리고, 판단 오차가 크다.
"""
import random
import time

from .poker_engine import FULL_DECK, blinds, evaluate_best_of_7

AI_TIME_BUDGET = 0.4   # 승률 계산에 쓰는 시간(초)
# 난이도별 (승률 계산 시간, 승률 오차 표준편차)
LEVEL_EQUITY = {"hard": (None, 0.0), "normal": (0.08, 0.08), "easy": (0.0, 0.15)}
MAX_SIMS = 1500


def equity(hole, board, n_opp, budget=None, rng=None, max_sims=MAX_SIMS, min_sims=30):
    """상대 n_opp명을 상대로 이 핸드를 끝까지 갔을 때 이길 확률 (비기면 반)."""
    budget = AI_TIME_BUDGET if budget is None else budget
    rng = rng or random.Random()
    if n_opp <= 0:
        return 1.0
    deck = [c for c in FULL_DECK if c not in hole and c not in board]
    need = 5 - len(board)
    draw = n_opp * 2 + need
    wins = sims = 0
    deadline = time.monotonic() + budget
    while sims < max_sims and (sims < min_sims or time.monotonic() < deadline):
        cards = rng.sample(deck, draw)
        full_board = board + cards[n_opp * 2:]
        mine = evaluate_best_of_7(hole + full_board)
        best = max(evaluate_best_of_7(cards[i * 2:i * 2 + 2] + full_board) for i in range(n_opp))
        wins += 1 if mine > best else .5 if mine == best else 0
        sims += 1
    return wins / sims


def decide(table, seats_by_number, seat, budget=None, rng=None, level="hard"):
    """(action, amount). amount는 bet이면 베팅액, raise면 '올릴 총액'(엔진과 같은 의미)."""
    rng = rng or random.Random()
    others = [s for s in seats_by_number.values()
              if s is not seat and s.user_id and s.status in ("active", "all_in")]
    level_budget, noise = LEVEL_EQUITY.get(level, LEVEL_EQUITY["hard"])
    e = equity(seat.hole_cards, table.community_cards, len(others),
               budget if budget is not None else level_budget, rng)
    if noise:
        e = min(1.0, max(0.0, e + rng.gauss(0, noise)))
    if level == "easy":
        return _decide_easy(table, seat, e, rng)
    if level == "normal":
        return _decide_normal(table, seat, e, rng)
    pot = table.pot
    to_call = max(0, table.current_bet - seat.current_bet)
    max_total = seat.current_bet + seat.stack   # 올인하면 도달하는 총액
    r = rng.random()
    BB = blinds(table)[1]
    raise_to = _raiser(table, seat)

    if to_call == 0:
        if e >= .72 or (e >= .55 and r < .55):
            if e >= .85 and r < .15:
                return ("check", 0)  # 슬로플레이
            return raise_to(table.current_bet + max(BB * 2, pot * (.45 + .6 * (e - .5))))
        if e < .35 and r < .1:
            return raise_to(table.current_bet + max(BB * 2, pot * .5))  # 블러핑
        return ("check", 0)

    pot_odds = to_call / (pot + to_call)
    # 팟 대비 큰 베팅을 받을수록 상대 레인지가 강하다고 보고 요구 승률을 올린다
    pressure = min(1.0, to_call / max(pot, 1)) * .08
    if e < pot_odds + pressure:
        if to_call <= BB and r < .3:
            return ("call", 0)  # 싼 콜은 가끔 따라간다
        return ("fold", 0)
    if max_total > table.current_bet and (e >= .78 or (e >= .63 and r < .3) or (e >= pot_odds + .2 and r < .08)):
        return raise_to(table.current_bet + max(table.min_raise, pot * (.6 + .5 * (e - .5))))
    return ("call", 0)


def _raiser(table, seat):
    """목표 총액 → 엔진에 맞는 ("bet", 금액) 또는 ("raise", 총액)."""
    bb = blinds(table)[1]
    max_total = seat.current_bet + seat.stack

    def raise_to(target):
        min_total = table.current_bet + table.min_raise
        total = min(max(int(target), min_total), max_total)
        if table.current_bet == 0:
            return ("bet", max(min(total, seat.stack), min(bb, seat.stack)))
        return ("raise", total)
    return raise_to


def _decide_normal(table, seat, e, rng):
    """보통: 기본 흐름은 같지만 덜 공격적이고, 팟 오즈를 느슨하게 본다."""
    bb = blinds(table)[1]
    pot = table.pot
    to_call = max(0, table.current_bet - seat.current_bet)
    raise_to = _raiser(table, seat)
    r = rng.random()
    if to_call == 0:
        if e >= .75 and r < .6:
            return raise_to(table.current_bet + max(bb * 2, pot * .5))
        if e < .3 and r < .05:
            return raise_to(table.current_bet + max(bb * 2, pot * .4))
        return ("check", 0)
    pot_odds = to_call / (pot + to_call)
    if e < pot_odds - .05:
        return ("call", 0) if to_call <= bb * 2 and r < .35 else ("fold", 0)
    if seat.current_bet + seat.stack > table.current_bet and e >= .82 and r < .5:
        return raise_to(table.current_bet + max(table.min_raise, pot * .6))
    return ("call", 0)


def _decide_easy(table, seat, e, rng):
    """쉬움: 웬만하면 콜(체크)하고, 아주 강할 때만 가끔 올린다. 큰 베팅에만 접는다."""
    bb = blinds(table)[1]
    pot = table.pot
    to_call = max(0, table.current_bet - seat.current_bet)
    raise_to = _raiser(table, seat)
    r = rng.random()
    if to_call == 0:
        if e >= .85 and r < .4:
            return raise_to(table.current_bet + max(bb * 2, pot * .4))
        return ("check", 0)
    if e < .25 and to_call > max(bb * 4, pot * .5) and r < .7:
        return ("fold", 0)
    if e < .15 and r < .4:
        return ("fold", 0)
    return ("call", 0)
