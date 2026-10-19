"""
포커 방에서 하는 블랙잭 — 방을 만들 때 게임 종류를 "블랙잭"으로 고르면 이 모듈이 판을 진행한다.

방·좌석·칩 지갑·입퇴장·AI 호출·워치독은 포커와 같은 것을 쓰고 (poker_engine), 딜러는 하우스(HouseBank)다.
규칙 계산과 AI 판단(기본 전략)은 game/blackjack.py.

한 판의 흐름 (table.bj_state["phase"]):
  betting  — BJ_BET_SECONDS 동안 배팅 (빅블라인드의 1~50배). AI는 최소 금액. 다 걸면 바로 다음으로.
             시간 안에 안 건 사람은 이번 판을 쉬고, 연속 POKER_MAX_TIMEOUTS번 쉬면 퇴장.
  playing  — 두 장씩 나눠준 뒤 (딜러가 A·10 카드를 보이면 블랙잭인지 먼저 확인), 자리 순서대로
             히트/스탠드/더블/스플릿. 시간초과하면 기본 전략으로 대신 둔다.
  result   — 딜러가 16 이하면 히트, 17 이상 스탠드 (소프트 17 포함). 하우스와 정산하고 결과를 보여준 뒤 다음 판.

판에 건 칩은 좌석의 contributed_total에도 적어 두어, 사람이 모두 나가 방이 지워질 때
poker_engine._close_if_no_humans가 그대로 돌려준다. 이 모듈의 함수는 모두 방이 잠긴 상태에서 부른다.
"""
from datetime import timedelta

from django.utils import timezone

from . import blackjack as bj
from .models import HouseBank, PokerHandLog

BJ_BET_SECONDS = 12          # 배팅 시간(초)
BJ_RESULT_SECONDS = 6        # 결과를 보여주는 시간(초)
BJ_NEXT_ROUND_DELAY = BJ_RESULT_SECONDS + 3
BJ_MAX_BET_MULTIPLIER = 50   # 최대 배팅 = 빅블라인드 × 50 (초보 1,000 · 중수 10,000 · 고수 100,000)
BJ_RESHUFFLE_AT = 52         # 슈에 이만큼 안 남으면 새로 섞는다


def bet_limits(table):
    bb = table.tier_config["bb"]
    return bb, bb * BJ_MAX_BET_MULTIPLIER


def _pe():
    from . import poker_engine
    return poker_engine


def _st(table):
    if not isinstance(table.bj_state, dict):
        table.bj_state = {}
    return table.bj_state


def _draw(st):
    if not st.get("shoe"):
        st["shoe"] = bj.new_shoe()
    return st["shoe"].pop()


def _bettors(st):
    return sorted(int(n) for n in st.get("seats", {}))


def _all_bet(st, seats_by_number):
    return all(str(n) in st["seats"] for n, s in seats_by_number.items()
               if s.user_id and not s.leaving_after_hand)


# ── 판 시작 / 배팅 ───────────────────────────────────────────────────────────

def start_betting(table, seats_by_number):
    pe = _pe()
    min_bet, _ = bet_limits(table)
    for s in seats_by_number.values():
        if s.user_id and (s.stack < min_bet or s.leaving_after_hand):
            _vacate_with_bet(s, table)
    if pe._close_if_no_humans(table, seats_by_number):
        return
    players = [s for n, s in sorted(seats_by_number.items()) if s.user_id]
    if not players:
        table.status = "waiting"
        table.next_hand_at = None
        table.save()
        return
    old = _st(table)
    shoe = old.get("shoe") or []
    reshuffled = len(shoe) < BJ_RESHUFFLE_AT
    if reshuffled:
        shoe = bj.new_shoe()
    table.bj_state = {"phase": "betting", "shoe": shoe, "dealer": [], "seats": {}, "reshuffled": reshuffled}
    table.hand_number += 1
    table.status = "playing"
    table.current_turn_seat = None
    table.turn_deadline = timezone.now() + timedelta(seconds=BJ_BET_SECONDS)
    table.next_hand_at = None
    for s in players:
        s.status = "out"
        s.current_bet = s.contributed_total = 0
        s.hole_cards = []
        if s.user.is_bot:
            _place_bet(table, s, min_bet)
        s.save()
    table.save()


def _place_bet(table, seat, amount):
    st = _st(table)
    seat.stack -= amount
    seat.current_bet = seat.contributed_total = amount
    seat.status = "active"
    st["seats"][str(seat.seat_number)] = {"hands": [{"cards": [], "bet": amount}], "active": 0}


def place_bet(table, seats_by_number, seat, amount):
    """사람이 배팅한다. 잘못된 요청이면 ValueError."""
    st = _st(table)
    if table.status != "playing" or st.get("phase") != "betting":
        raise ValueError("지금은 배팅 시간이 아닙니다.")
    if str(seat.seat_number) in st["seats"]:
        raise ValueError("이미 배팅했습니다.")
    try:
        amount = int(amount)
    except (TypeError, ValueError):
        raise ValueError("배팅 금액이 올바르지 않습니다.")
    min_bet, max_bet = bet_limits(table)
    if not min_bet <= amount <= max_bet:
        raise ValueError(f"배팅은 {min_bet:,}~{max_bet:,}칩 사이로 해주세요.")
    if amount > seat.stack:
        raise ValueError("가진 칩보다 많이 걸 수 없습니다.")
    _place_bet(table, seat, amount)
    seat.consecutive_timeouts = 0
    seat.save()
    table.save()
    if _all_bet(st, seats_by_number):
        _deal(table, seats_by_number)


# ── 카드 나누기 / 차례 ───────────────────────────────────────────────────────

def _deal(table, seats_by_number):
    st = _st(table)
    order = _bettors(st)
    if not order:
        # 아무도 안 걸었으면 잠시 뒤 다시 배팅을 받는다
        st["phase"] = "idle"
        table.status = "waiting"
        table.turn_deadline = None
        table.current_turn_seat = None
        table.next_hand_at = timezone.now() + timedelta(seconds=_pe().POKER_FIRST_HAND_DELAY)
        table.save()
        return
    st["phase"] = "playing"
    for _ in range(2):
        for n in order:
            st["seats"][str(n)]["hands"][0]["cards"].append(_draw(st))
        st["dealer"].append(_draw(st))
    for n in order:
        hand = st["seats"][str(n)]["hands"][0]
        if bj.is_blackjack(hand["cards"]):
            hand["done"] = True
    # 딜러 확인(peek): A나 10을 보이고 있고 블랙잭이면 바로 끝낸다
    if bj.card_value(st["dealer"][0]) >= 10 and bj.is_blackjack(st["dealer"]):
        _finish(table, seats_by_number)
        return
    _advance(table, seats_by_number)


def _advance(table, seats_by_number):
    """아직 안 끝난 첫 패에 차례를 준다. 모두 끝났으면 딜러 차례 → 정산."""
    st = _st(table)
    pe = _pe()
    for n in _bettors(st):
        sd = st["seats"][str(n)]
        for i, hand in enumerate(sd["hands"]):
            if not hand.get("done"):
                sd["active"] = i
                seat = seats_by_number[n]
                auto = seat.user_id and (seat.user.is_bot or seat.leaving_after_hand)
                table.current_turn_seat = n
                table.turn_deadline = timezone.now() + timedelta(
                    seconds=pe.POKER_BOT_THINK if auto else pe.POKER_TURN_TIMEOUT)
                table.save()
                return
    _finish(table, seats_by_number)


def _current_hand(table, seat):
    st = _st(table)
    if table.status != "playing" or st.get("phase") != "playing" or table.current_turn_seat != seat.seat_number:
        raise ValueError("지금은 내 차례가 아닙니다.")
    sd = st["seats"][str(seat.seat_number)]
    return st, sd, sd["hands"][sd["active"]]


def allowed_actions(table, seat):
    try:
        _, sd, hand = _current_hand(table, seat)
    except (ValueError, KeyError):
        return []
    out = ["hit", "stand"]
    if bj.can_double(hand) and seat.stack >= hand["bet"]:
        out.append("double")
    if bj.can_split(hand, len(sd["hands"])) and seat.stack >= hand["bet"]:
        out.append("split")
    return out


def apply_action(table, seats_by_number, seat, action):
    st, sd, hand = _current_hand(table, seat)
    if action not in allowed_actions(table, seat):
        raise ValueError("지금 할 수 없는 선택입니다.")
    if action == "hit":
        hand["cards"].append(_draw(st))
        if bj.hand_total(hand["cards"])[0] >= 21:
            hand["done"] = True
    elif action == "stand":
        hand["done"] = True
    elif action == "double":
        seat.stack -= hand["bet"]
        seat.contributed_total += hand["bet"]
        hand["bet"] *= 2
        hand["doubled"] = True
        hand["cards"].append(_draw(st))
        hand["done"] = True
    elif action == "split":
        seat.stack -= hand["bet"]
        seat.contributed_total += hand["bet"]
        aces = hand["cards"][0][0] == "A"
        new_hands = []
        for card in hand["cards"]:
            h = {"cards": [card, _draw(st)], "bet": hand["bet"], "from_split": True}
            if aces:
                h["split_aces"] = True
                h["done"] = True  # 에이스를 나누면 한 장씩만 받는다
            elif bj.hand_total(h["cards"])[0] == 21:
                h["done"] = True
            new_hands.append(h)
        sd["hands"] = new_hands
        sd["active"] = 0
    seat.current_bet = seat.contributed_total
    seat.save()
    table.save()
    _advance(table, seats_by_number)


def ai_step(table, seats_by_number, seat):
    """AI(또는 시간초과·퇴장 예약한 사람 대신)가 기본 전략대로 한 수 둔다."""
    st, sd, hand = _current_hand(table, seat)
    action = bj.basic_strategy(hand, st["dealer"][0], len(sd["hands"]), seat.stack >= hand["bet"])
    if action not in allowed_actions(table, seat):
        action = "hit" if action == "double" else "stand"
    apply_action(table, seats_by_number, seat, action)


# ── 딜러 / 정산 ──────────────────────────────────────────────────────────────

def _finish(table, seats_by_number):
    st = _st(table)
    dealer = st["dealer"]
    hands = [h for n in _bettors(st) for h in st["seats"][str(n)]["hands"]]
    live = any(bj.hand_total(h["cards"])[0] <= 21 and not bj.is_blackjack(h["cards"], h.get("from_split"))
               for h in hands)
    if live and not bj.is_blackjack(dealer):
        while bj.dealer_should_hit(dealer):
            dealer.append(_draw(st))
    house = HouseBank.locked()
    winners = []
    total_bet = 0
    for n in _bettors(st):
        seat = seats_by_number.get(n)
        sd = st["seats"][str(n)]
        payout = 0
        for h in sd["hands"]:
            outcome, paid = bj.settle_hand(h, dealer)
            h["outcome"], h["payout"] = outcome, paid
            payout += paid
        bet = sum(h["bet"] for h in sd["hands"])
        total_bet += bet
        sd["net"] = payout - bet
        house.chips -= sd["net"]
        if seat and seat.user_id:
            seat.stack += payout
            seat.contributed_total = seat.current_bet = 0
            seat.status = "out"
            seat.save()
            winners.append({"username": seat.user.username, "amount": sd["net"], "seat_number": n,
                            "hand_desc": " / ".join(h["outcome"] for h in sd["hands"])})
    house.save(update_fields=["chips"])
    st["phase"] = "result"
    table.status = "waiting"
    table.current_turn_seat = None
    table.turn_deadline = None
    table.next_hand_at = timezone.now() + timedelta(seconds=BJ_NEXT_ROUND_DELAY)
    table.save()
    PokerHandLog.objects.create(table=table, hand_number=table.hand_number, pot=total_bet,
                                community_cards=dealer, winners=winners)


# ── 워치독 / 퇴장 ────────────────────────────────────────────────────────────

def on_due(table, seats_by_number, now):
    pe = _pe()
    st = _st(table)
    if table.status == "playing" and table.turn_deadline and now >= table.turn_deadline:
        if st.get("phase") == "betting":
            for n, s in seats_by_number.items():
                if s.user_id and not s.user.is_bot and str(n) not in st["seats"] and not s.leaving_after_hand:
                    s.consecutive_timeouts += 1
                    if s.consecutive_timeouts >= pe.POKER_MAX_TIMEOUTS:
                        s.leaving_after_hand = True
                    s.save(update_fields=["consecutive_timeouts", "leaving_after_hand"])
            _deal(table, seats_by_number)
        elif st.get("phase") == "playing":
            seat = seats_by_number.get(table.current_turn_seat)
            if not seat or not seat.user_id or str(seat.seat_number) not in st["seats"]:
                _advance(table, seats_by_number)
                return
            if not seat.user.is_bot and not seat.leaving_after_hand:
                seat.consecutive_timeouts += 1
                if seat.consecutive_timeouts >= pe.POKER_MAX_TIMEOUTS:
                    seat.leaving_after_hand = True
                seat.save(update_fields=["consecutive_timeouts", "leaving_after_hand"])
            ai_step(table, seats_by_number, seat)
    if table.pk and table.status == "waiting" and table.next_hand_at and now >= table.next_hand_at:
        start_betting(table, seats_by_number)


def _vacate_with_bet(seat, table):
    """배팅만 하고 카드를 받기 전이면 건 칩을 돌려주고 자리를 비운다."""
    seat.stack += seat.contributed_total
    seat.contributed_total = seat.current_bet = 0
    _st(table).get("seats", {}).pop(str(seat.seat_number), None)
    _pe()._vacate_seat(seat, table)


def stand_up(table, seats_by_number, seat):
    pe = _pe()
    st = _st(table)
    in_round = table.status == "playing" and st.get("phase") == "playing" and str(seat.seat_number) in st["seats"]
    if not in_round:
        _vacate_with_bet(seat, table)
        if pe._close_if_no_humans(table, seats_by_number):
            return
        table.save()
        if table.status == "playing" and st.get("phase") == "betting" and _all_bet(st, seats_by_number):
            _deal(table, seats_by_number)
        return
    # 카드를 받은 판이면 판이 끝난 뒤 나간다 — 그동안 남은 패는 기본 전략으로 마저 둔다
    seat.leaving_after_hand = True
    seat.save(update_fields=["leaving_after_hand"])
    while (table.status == "playing" and st.get("phase") == "playing"
           and table.current_turn_seat == seat.seat_number):
        ai_step(table, seats_by_number, seat)


# ── 화면 상태 ────────────────────────────────────────────────────────────────

def _hand_view(h):
    total, soft = bj.hand_total(h["cards"])
    return {"cards": h["cards"], "bet": h["bet"], "total": total, "soft": soft and total < 21,
            "blackjack": bj.is_blackjack(h["cards"], h.get("from_split")), "doubled": bool(h.get("doubled")),
            "done": bool(h.get("done")), "outcome": h.get("outcome"), "payout": h.get("payout")}


def state_view(table, seats, my_seat, now):
    st = table.bj_state or {}
    phase = st.get("phase") or "idle"
    dealer = st.get("dealer", [])
    hidden = phase == "playing"  # 딜러 두 번째 카드는 플레이어 차례가 끝날 때까지 뒷면
    shown = dealer[:1] if hidden else dealer
    dealer_total = bj.hand_total(shown)[0] if shown else None
    seats_st = st.get("seats", {})

    def seat_view(s):
        if not s.user_id:
            return {"seat_number": s.seat_number, "empty": True}
        sd = seats_st.get(str(s.seat_number))
        return {
            "seat_number": s.seat_number, "empty": False,
            "username": s.user.username, "display_name": s.user.display_name, "picture": s.user.get_picture(),
            "is_bot": s.user.is_bot, "is_me": bool(my_seat and my_seat.seat_number == s.seat_number),
            "stack": s.stack, "is_turn": table.current_turn_seat == s.seat_number and phase == "playing",
            "leaving": s.leaving_after_hand,
            "bet_placed": sd is not None,
            "hands": [_hand_view(h) for h in sd["hands"]] if sd and phase != "betting" else [],
            "bet": sum(h["bet"] for h in sd["hands"]) if sd else 0,
            "active_hand": sd.get("active", 0) if sd else 0,
            "net": sd.get("net") if sd else None,
        }

    seconds = lambda dt: max(0, round((dt - now).total_seconds())) if dt else None
    min_bet, max_bet = bet_limits(table)
    my_sd = seats_st.get(str(my_seat.seat_number)) if my_seat else None
    return {
        "game_type": "blackjack",
        "table_status": table.status,
        "phase": phase,
        "hand_number": table.hand_number,
        "dealer_cards": shown,
        "dealer_hidden": len(dealer) - len(shown),
        "dealer_total": dealer_total,
        "dealer_blackjack": not hidden and bj.is_blackjack(dealer),
        "seats": [seat_view(s) for s in seats],
        "turn_seat": table.current_turn_seat if phase == "playing" else None,
        "turn_seconds_left": seconds(table.turn_deadline) if phase == "playing" else None,
        "bet_seconds_left": seconds(table.turn_deadline) if phase == "betting" else None,
        "next_hand_seconds_left": seconds(table.next_hand_at),
        "my_seat_number": my_seat.seat_number if my_seat else None,
        "my_stack": my_seat.stack if my_seat else None,
        "my_bet_placed": my_sd is not None,
        "can_bet": bool(my_seat and phase == "betting" and table.status == "playing" and my_sd is None
                        and my_seat.stack >= min_bet),
        "my_actions": allowed_actions(table, my_seat) if my_seat else [],
        "min_bet": min_bet,
        "max_bet": max_bet,
        "bj_result_seconds": BJ_RESULT_SECONDS,
        "reshuffled": bool(st.get("reshuffled")) and phase == "betting",
        "open_seats": sum(1 for s in seats if not s.user_id),
    }
