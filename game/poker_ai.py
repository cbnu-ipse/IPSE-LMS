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

난이도는 방 단계와 상관없이 하나다 (AI 플레이어, 시간초과한 사람 대신 두기 모두).
쉬움·보통 버전을 여러 플레이 스타일(콜만 하는 사람, 좋은 패만 하는 사람, 막 올리는 사람,
승률을 따지는 사람, 아무렇게나 두는 사람)과 1:1 시뮬레이션해 보니 패를 가려 두는 사람에게
꾸준히 칩을 잃어(하우스 칩이 빠져나감) 이 버전 하나로 통일했다.
"""
import random
import time

from .poker_engine import FULL_DECK, blinds, evaluate_best_of_7

AI_TIME_BUDGET = 0.1   # 승률 계산에 쓰는 시간(초) — 시뮬레이션으로 강도를 맞춘 값 (길수록 더 세진다)
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


def decide(table, seats_by_number, seat, budget=None, rng=None):
    """(action, amount). amount는 bet이면 베팅액, raise면 '올릴 총액'(엔진과 같은 의미)."""
    rng = rng or random.Random()
    others = [s for s in seats_by_number.values()
              if s is not seat and s.user_id and s.status in ("active", "all_in")]
    e = equity(seat.hole_cards, table.community_cards, len(others), budget, rng)
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
