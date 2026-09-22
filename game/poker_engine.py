"""
온라인 포커 (텍사스 홀덤, 6인 고정 테이블 1개) 상태머신.

테이블은 싱글턴(PokerTable.get_solo())이고, 모든 상태 변경 함수는
`transaction.atomic()` + `select_for_update()` 로 테이블 전체를 잠그고 동작한다.
동시 접속자가 많지 않은 클럽 내부 서비스라 테이블 단위 글로벌 락으로 충분하다.
# ponytail: 글로벌 락 — 여러 포커 테이블을 운영하게 되면 테이블별 락으로 세분화할 것.

빈 자리는 별도 대기열 없이, 먼저 "앉기"를 누른 사람이 그대로 앉는다(요청 시점에
select_for_update로 자리를 잠그므로 동시 클릭이 와도 한 명만 성공한다).

공개 함수(뷰/컨슈머에서 호출):
    get_state_for(user)         — 접속자 시점의 테이블 상태 스냅샷
    sit_down(user, seat_number) — 착석. 칩 지갑에서 바이인만큼 차감해 스택으로
                                   옮긴다. 지갑 잔액이 바이인 미만이면 착석 불가.
    stand_up(user)              — 퇴장 (남은 칩 → 개인 칩 지갑으로 보관)
    buy_chips(user, leaves)     — 낙엽을 칩으로 전환해 칩 지갑에 채운다. 자리에
                                   앉아있는 동안은 불가 — 일어난 뒤에만 가능.
    cash_out_chips(user, chips) — 칩 지갑을 낙엽으로 환전. 자리에 앉아있는 동안은
                                   불가 — 일어난 뒤에만 가능.
    player_action(user, action, amount) — fold/check/call/bet/raise
    send_emoji(user, emoji)     — 착석 중인 좌석 위에 띄울 이모티콘 반응 (좌석 번호 반환)
    next_deadline_at()          — 다음에 깨어나야 할 시각 (워치독용)
    process_due_deadlines()     — 마감시각이 지난 턴/다음 핸드를 처리 (워치독용)
"""
import random
from datetime import timedelta
from itertools import combinations

from django.db import transaction
from django.utils import timezone

from accounts.models import User
from .models import (
    PokerTable, PokerSeat, PokerHandLog, PokerChipWallet,
    POKER_SEATS, POKER_SMALL_BLIND, POKER_BIG_BLIND, POKER_BUY_IN,
    POKER_BUY_IN_LEAVES, POKER_CHIPS_PER_LEAF,
)

POKER_TURN_TIMEOUT = 15          # 턴당 제한시간(초)
POKER_RESULT_DISPLAY_SECONDS = 5  # 결과를 중앙에 띄워두는 시간(초) — 프론트 renderCenterMsg와 동일해야 함
POKER_NEXT_HAND_DELAY = POKER_RESULT_DISPLAY_SECONDS + 5  # 핸드 종료 후 다음 핸드까지 대기(초):
                                                           # 결과 표시 5초 + 실제로 보이는 카운트다운 5초
POKER_MAX_TIMEOUTS = 4           # 연속 시간초과 이 횟수에 도달하면 강제 폴드 + 퇴장 예약 (15초 * 4 ≈ 1분)

POKER_EMOJI_CHOICES = {"👍", "😂", "😮", "😡", "🔥", "❤️"}  # 이모티콘 반응 화이트리스트


# ── 카드 / 핸드 평가 ─────────────────────────────────────────────────────────

RANKS = "23456789TJQKA"
SUITS = "SHDC"
RANK_VALUES = {r: i for i, r in enumerate(RANKS, start=2)}
FULL_DECK = [r + s for r in RANKS for s in SUITS]

CATEGORY_NAMES = {
    8: "스트레이트 플러시", 7: "포카드", 6: "풀하우스", 5: "플러시",
    4: "스트레이트", 3: "트리플", 2: "투페어", 1: "원페어", 0: "하이카드",
}


def _evaluate_5(cards):
    """5장 카드의 순위를 비교 가능한 튜플로 반환한다 (클수록 강함)."""
    ranks = sorted((RANK_VALUES[c[0]] for c in cards), reverse=True)
    suits = [c[1] for c in cards]
    is_flush = len(set(suits)) == 1

    counts = {}
    for r in ranks:
        counts[r] = counts.get(r, 0) + 1
    unique_ranks = sorted(counts, reverse=True)

    is_straight = False
    straight_high = None
    if len(unique_ranks) == 5:
        if unique_ranks[0] - unique_ranks[4] == 4:
            is_straight, straight_high = True, unique_ranks[0]
        elif unique_ranks == [14, 5, 4, 3, 2]:  # A-2-3-4-5 (휠)
            is_straight, straight_high = True, 5

    counts_sorted = sorted(counts.items(), key=lambda kv: (-kv[1], -kv[0]))
    pattern = [c for _, c in counts_sorted]

    if is_straight and is_flush:
        return (8, straight_high)
    if pattern == [4, 1]:
        return (7, counts_sorted[0][0], counts_sorted[1][0])
    if pattern == [3, 2]:
        return (6, counts_sorted[0][0], counts_sorted[1][0])
    if is_flush:
        return (5, *ranks)
    if is_straight:
        return (4, straight_high)
    if pattern == [3, 1, 1]:
        kickers = sorted((counts_sorted[1][0], counts_sorted[2][0]), reverse=True)
        return (3, counts_sorted[0][0], *kickers)
    if pattern == [2, 2, 1]:
        pairs = sorted((counts_sorted[0][0], counts_sorted[1][0]), reverse=True)
        return (2, *pairs, counts_sorted[2][0])
    if pattern == [2, 1, 1, 1]:
        kickers = sorted((counts_sorted[1][0], counts_sorted[2][0], counts_sorted[3][0]), reverse=True)
        return (1, counts_sorted[0][0], *kickers)
    return (0, *ranks)


def evaluate_best_of_7(cards):
    """7장(홀카드 2 + 커뮤니티 5) 중 최고의 5장 조합 순위를 반환한다."""
    return max(_evaluate_5(c) for c in combinations(cards, 5))


# ── 좌석 순회 헬퍼 ────────────────────────────────────────────────────────────

def _next_seat(seats_by_number, from_seat, statuses):
    for offset in range(1, POKER_SEATS + 1):
        n = (from_seat + offset) % POKER_SEATS
        seat = seats_by_number.get(n)
        if seat and seat.status in statuses:
            return seat
    return None


def _cycle_next(numbers, current):
    idx = numbers.index(current)
    return numbers[(idx + 1) % len(numbers)]


def _rotate_dealer(eligible_numbers, prev_dealer):
    if prev_dealer is None or prev_dealer not in eligible_numbers:
        base = prev_dealer if prev_dealer is not None else -1
        return min(eligible_numbers, key=lambda n: (n - base - 1) % POKER_SEATS)
    return _cycle_next(eligible_numbers, prev_dealer)


def _order_from_dealer(seat_list, dealer_seat):
    d = dealer_seat if dealer_seat is not None else 0
    return sorted(seat_list, key=lambda s: (s.seat_number - d - 1) % POKER_SEATS)


# ── 사이드팟 ─────────────────────────────────────────────────────────────────

def _build_side_pots(in_hand_seats):
    """올인이 섞여도 정확히 정산되도록 사이드팟을 계산한다.
    in_hand_seats: 이번 핸드에 딜된 좌석(폴드 포함) 목록."""
    contributions = [(s, s.contributed_total) for s in in_hand_seats if s.contributed_total > 0]
    if not contributions:
        return []
    levels = sorted(set(c for _, c in contributions))
    pots = []
    prev = 0
    for level in levels:
        slice_amount = 0
        eligible = []
        for s, c in contributions:
            slice_amount += max(0, min(c, level) - prev)
            if c >= level and s.status != "folded":
                eligible.append(s)
        if slice_amount > 0 and eligible:
            pots.append({"amount": slice_amount, "eligible": eligible})
        prev = level
    return pots


# ── 좌석 입/퇴장 ──────────────────────────────────────────────────────────────
# 별도 관전 대기열 없이, 빈 자리에 먼저 "앉기"를 누른 사람이 그대로 앉는다.

def _vacate_seat(seat, table):
    """자리를 비우고 남은 칩을 개인 칩 지갑으로 옮긴다 (강제 환급 없음 —
    앉아있지 않아도 cash_out_chips로 언제든 낙엽으로 환전할 수 있다)."""
    if seat.stack > 0 and seat.user_id:
        wallet, _ = PokerChipWallet.objects.select_for_update().get_or_create(user_id=seat.user_id)
        wallet.chips += seat.stack
        wallet.save(update_fields=["chips"])
    seat.user = None
    seat.stack = 0
    seat.current_bet = 0
    seat.contributed_total = 0
    seat.status = "empty"
    seat.hole_cards = []
    seat.has_acted_this_street = False
    seat.consecutive_timeouts = 0
    seat.leaving_after_hand = False
    seat.joined_at = None
    seat.save()


def _maybe_reset_empty_table(table):
    """모든 자리가 비면 새 게임처럼 초기화한다 (핸드 번호/결과 배너 등이 남아
    다음에 앉는 사람에게 이전 게임 흔적으로 보이지 않도록)."""
    if PokerSeat.objects.filter(table=table, user__isnull=False).exists():
        return
    table.status = "waiting"
    table.round = "preflop"
    table.dealer_seat = None
    table.current_turn_seat = None
    table.turn_deadline = None
    table.next_hand_at = None
    table.pot = 0
    table.current_bet = 0
    table.community_cards = []
    table.deck = []
    table.hand_number = 0
    table.last_result = {}
    table.save()


def sit_down(user, seat_number):
    with transaction.atomic():
        table = PokerTable.objects.select_for_update().get(pk=1)
        seats_by_number = {
            s.seat_number: s
            for s in PokerSeat.objects.select_for_update().filter(table=table)
        }
        if any(s.user_id == user.id for s in seats_by_number.values()):
            return False, "이미 테이블에 앉아있습니다."
        seat = seats_by_number.get(seat_number)
        if seat is None or seat.user_id:
            return False, "이미 다른 사람이 앉은 자리입니다."

        wallet = PokerChipWallet.objects.select_for_update().filter(user=user).first()
        if not wallet or wallet.chips < POKER_BUY_IN:
            return False, f"칩이 부족합니다. 먼저 낙엽을 칩으로 충전해주세요. (필요 칩: {POKER_BUY_IN})"
        wallet.chips -= POKER_BUY_IN
        wallet.save(update_fields=["chips"])

        seat.user = user
        seat.stack = POKER_BUY_IN
        seat.status = "out" if table.status == "playing" else "active"
        seat.current_bet = 0
        seat.contributed_total = 0
        seat.hole_cards = []
        seat.has_acted_this_street = False
        seat.consecutive_timeouts = 0
        seat.leaving_after_hand = False
        seat.joined_at = timezone.now()
        seat.save()

        if table.status == "waiting":
            eligible = sum(1 for s in seats_by_number.values() if s.user_id and s.stack > 0)
            if eligible >= 2 and table.next_hand_at is None:
                table.next_hand_at = timezone.now() + timedelta(seconds=POKER_NEXT_HAND_DELAY)
                table.save()
    return True, None


def stand_up(user):
    with transaction.atomic():
        table = PokerTable.objects.select_for_update().get(pk=1)
        seats_by_number = {
            s.seat_number: s
            for s in PokerSeat.objects.select_for_update().filter(table=table).select_related("user")
        }
        seat = next((s for s in seats_by_number.values() if s.user_id == user.id), None)
        if not seat:
            return False, "테이블에 앉아있지 않습니다."

        if seat.status in ("active", "all_in") and table.status == "playing":
            # 핸드 진행 중이면 즉시 자리를 비우지 않고, 이번 핸드가 끝난 뒤 퇴장 처리한다
            # (남의 팟 정산이 걸려있는 상태에서 바로 빼면 사이드팟 계산이 깨짐)
            seat.leaving_after_hand = True
            if table.current_turn_seat == seat.seat_number:
                try:
                    _apply_action_locked(table, seats_by_number, seat, "fold", 0)
                except ValueError:
                    pass
                _resolve_turn(table, seats_by_number, seat.seat_number)
            else:
                seat.save()
        else:
            _vacate_seat(seat, table)
            _maybe_reset_empty_table(table)
    return True, None


def buy_chips(user, leaves_amount):
    """낙엽을 칩으로 전환해 칩 지갑에 채운다. 자리에 앉아있는 동안은 충전할 수
    없다 — 일어난 뒤 지갑을 채우고, 그 지갑 칩을 가지고 앉는 흐름이다."""
    try:
        leaves_amount = int(leaves_amount)
    except (TypeError, ValueError):
        return False, "충전할 낙엽 수가 올바르지 않습니다."
    if leaves_amount <= 0:
        return False, "충전할 낙엽 수가 올바르지 않습니다."
    with transaction.atomic():
        table = PokerTable.objects.select_for_update().get(pk=1)
        seat = PokerSeat.objects.select_for_update().filter(table=table, user=user).first()
        if seat:
            return False, "자리에 앉아있는 동안은 충전할 수 없습니다. 일어난 후 충전해주세요."
        user_db = User.objects.select_for_update().get(id=user.id)
        if user_db.leaves < leaves_amount:
            return False, "낙엽이 부족합니다."
        user_db.adjust_leaves(-leaves_amount, "POKER_BUYIN", "포커 칩 충전")
        wallet, _ = PokerChipWallet.objects.select_for_update().get_or_create(user=user_db)
        wallet.chips += leaves_amount * POKER_CHIPS_PER_LEAF
        wallet.save(update_fields=["chips"])
    return True, None


def cash_out_chips(user, chips_amount):
    """칩 지갑의 칩을 낙엽으로 환전한다(100칩 = 1낙엽). 좌석에 앉아있는 동안은
    환전할 수 없다 — 게임 중에 스택을 빼돌리는 것을 막기 위함. 일어나면 남은
    스택이 지갑으로 옮겨지므로(_vacate_seat) 그 이후 언제든 환전할 수 있다.
    베팅/레이즈는 100칩 단위로 강제되지 않으므로 지갑 잔액이 100의 배수가
    아닐 수 있다 — 요청 금액을 100단위로 내림해 환전하고 나머지는 지갑에 남긴다."""
    try:
        chips_amount = int(chips_amount)
    except (TypeError, ValueError):
        return False, "환전할 칩 수가 올바르지 않습니다."
    if chips_amount <= 0:
        return False, "환전할 칩 수가 올바르지 않습니다."
    with transaction.atomic():
        table = PokerTable.objects.select_for_update().get(pk=1)
        seat = PokerSeat.objects.select_for_update().filter(table=table, user=user).first()
        if seat:
            return False, "자리에 앉아있는 동안은 환전할 수 없습니다. 일어난 후 환전해주세요."
        wallet = PokerChipWallet.objects.select_for_update().filter(user=user).first()
        if not wallet or chips_amount > wallet.chips:
            return False, "보유 칩보다 많이 환전할 수 없습니다."
        leaves_gained = chips_amount // POKER_CHIPS_PER_LEAF
        if leaves_gained <= 0:
            return False, f"최소 {POKER_CHIPS_PER_LEAF}칩부터 환전할 수 있습니다."
        wallet.chips -= leaves_gained * POKER_CHIPS_PER_LEAF
        wallet.save(update_fields=["chips"])
        user.adjust_leaves(leaves_gained, "POKER_CASHOUT", "포커 칩 환전")
    return True, None


# ── 베팅 액션 / 턴 진행 ───────────────────────────────────────────────────────

def _apply_action_locked(table, seats_by_number, seat, action, amount):
    if table.status != "playing" or seat.status != "active" or table.current_turn_seat != seat.seat_number:
        raise ValueError("지금은 액션을 할 수 없습니다.")

    if action == "fold":
        seat.status = "folded"
        seat.has_acted_this_street = True

    elif action == "check":
        if seat.current_bet != table.current_bet:
            raise ValueError("콜해야 할 금액이 있어 체크할 수 없습니다.")
        seat.has_acted_this_street = True

    elif action == "call":
        to_call = table.current_bet - seat.current_bet
        if to_call <= 0:
            raise ValueError("콜할 금액이 없습니다. 체크를 사용하세요.")
        pay = min(to_call, seat.stack)
        seat.stack -= pay
        seat.current_bet += pay
        seat.contributed_total += pay
        table.pot += pay
        if seat.stack == 0:
            seat.status = "all_in"
        seat.has_acted_this_street = True

    elif action == "bet":
        if table.current_bet != 0:
            raise ValueError("이미 베팅이 있어 베팅할 수 없습니다. 레이즈를 사용하세요.")
        if amount <= 0 or amount > seat.stack:
            raise ValueError("베팅 금액이 올바르지 않습니다.")
        if amount < min(POKER_BIG_BLIND, seat.stack):
            raise ValueError(f"최소 베팅은 {POKER_BIG_BLIND} 칩입니다.")
        seat.stack -= amount
        seat.current_bet = amount
        seat.contributed_total += amount
        table.pot += amount
        table.current_bet = amount
        table.min_raise = amount
        if seat.stack == 0:
            seat.status = "all_in"
        for other in seats_by_number.values():
            if other is not seat and other.status == "active":
                other.has_acted_this_street = False
                other.save()
        seat.has_acted_this_street = True

    elif action == "raise":
        if table.current_bet == 0:
            raise ValueError("아직 베팅이 없어 레이즈할 수 없습니다. 베팅을 사용하세요.")
        to_put = amount - seat.current_bet
        if to_put <= 0 or to_put > seat.stack:
            raise ValueError("레이즈 금액이 올바르지 않습니다.")
        min_total = table.current_bet + table.min_raise
        is_all_in = to_put == seat.stack
        if amount < min_total and not is_all_in:
            raise ValueError(f"최소 레이즈 금액은 {min_total} 칩입니다.")
        raise_size = amount - table.current_bet
        seat.stack -= to_put
        seat.current_bet = amount
        seat.contributed_total += to_put
        table.pot += to_put
        table.current_bet = amount
        # ponytail: "미달 올인 레이즈는 재오픈 안 됨" 같은 정식 룰은 생략, 단순화해서 항상 재오픈
        if raise_size >= table.min_raise:
            table.min_raise = raise_size
        if seat.stack == 0:
            seat.status = "all_in"
        for other in seats_by_number.values():
            if other is not seat and other.status == "active":
                other.has_acted_this_street = False
                other.save()
        seat.has_acted_this_street = True

    else:
        raise ValueError("알 수 없는 액션입니다.")

    seat.save()
    table.save()


def _next_street(table, seats_by_number):
    """다음 스트리트로 진행. 리버 이후면 쇼다운(True)을 반환한다."""
    for s in seats_by_number.values():
        if s.status in ("active", "all_in"):
            s.current_bet = 0
            s.has_acted_this_street = False
            s.save()
    table.current_bet = 0
    table.min_raise = POKER_BIG_BLIND

    if table.round == "preflop":
        table.round = "flop"
        table.community_cards = table.community_cards + _draw(table, 3)
    elif table.round == "flop":
        table.round = "turn"
        table.community_cards = table.community_cards + _draw(table, 1)
    elif table.round == "turn":
        table.round = "river"
        table.community_cards = table.community_cards + _draw(table, 1)
    else:
        table.round = "showdown"
        table.save()
        return True

    table.save()
    return False


def _draw(table, n):
    cards = table.deck[:n]
    table.deck = table.deck[n:]
    return cards


def _resolve_turn(table, seats_by_number, search_from):
    """search_from 다음 자리부터 액션할 사람을 찾는다. 라운드가 끝났으면 다음
    스트리트로 진행하고(전원 올인이면 쇼다운까지 재귀적으로 계속 진행), 남은
    사람이 1명이면 핸드를 종료한다."""
    in_hand = [s for s in seats_by_number.values() if s.status in ("active", "all_in", "folded")]
    non_folded = [s for s in in_hand if s.status != "folded"]
    if len(non_folded) <= 1:
        _finish_hand(table, seats_by_number)
        return

    actionable = [s for s in non_folded if s.status == "active"]
    round_complete = len(actionable) == 0 or all(
        s.has_acted_this_street and s.current_bet == table.current_bet for s in actionable
    )
    if not round_complete:
        nxt = _next_seat(seats_by_number, search_from, {"active"})
        table.current_turn_seat = nxt.seat_number
        table.turn_deadline = timezone.now() + timedelta(seconds=POKER_TURN_TIMEOUT)
        table.save()
        return

    reached_showdown = _next_street(table, seats_by_number)
    if reached_showdown:
        _finish_hand(table, seats_by_number)
    else:
        _resolve_turn(table, seats_by_number, table.dealer_seat)


def _finish_hand(table, seats_by_number):
    table.round = "showdown"
    table.current_turn_seat = None
    table.turn_deadline = None

    in_hand = [s for s in seats_by_number.values() if s.status in ("active", "all_in", "folded")]
    non_folded = [s for s in in_hand if s.status != "folded"]
    total_pot = sum(s.contributed_total for s in in_hand)
    winners_info = []

    if len(non_folded) == 1:
        winner = non_folded[0]
        winner.stack += total_pot
        winner.save(update_fields=["stack"])
        winners_info.append({
            "username": winner.user.username,
            "display_name": winner.user.display_name,
            "seat_number": winner.seat_number,
            "amount": total_pot,
            "hand_desc": None,
        })
    else:
        pots = _build_side_pots(in_hand)
        hand_values = {s.id: evaluate_best_of_7(s.hole_cards + table.community_cards) for s in non_folded}
        for pot_info in pots:
            eligible = pot_info["eligible"]
            best = max(hand_values[s.id] for s in eligible)
            pot_winners = [s for s in eligible if hand_values[s.id] == best]
            ordered = _order_from_dealer(pot_winners, table.dealer_seat)
            share, remainder = divmod(pot_info["amount"], len(ordered))
            for i, s in enumerate(ordered):
                amt = share + (1 if i < remainder else 0)
                s.stack += amt
                row = next((w for w in winners_info if w["seat_number"] == s.seat_number), None)
                desc = CATEGORY_NAMES[hand_values[s.id][0]]
                if row:
                    row["amount"] += amt
                else:
                    winners_info.append({
                        "username": s.user.username,
                        "display_name": s.user.display_name,
                        "seat_number": s.seat_number,
                        "amount": amt,
                        "hand_desc": desc,
                    })
        for s in non_folded:
            s.save(update_fields=["stack"])

    PokerHandLog.objects.create(
        table=table, hand_number=table.hand_number, pot=total_pot,
        community_cards=table.community_cards, winners=winners_info,
    )
    table.pot = 0
    table.last_result = {"hand_number": table.hand_number, "pot": total_pot, "winners": winners_info}

    for s in list(seats_by_number.values()):
        if s.user_id and (s.stack <= 0 or s.leaving_after_hand):
            _vacate_seat(s, table)
        elif s.status in ("active", "all_in", "folded"):
            s.status = "out"
            s.current_bet = 0
            s.contributed_total = 0
            s.hole_cards = []
            s.has_acted_this_street = False
            s.save()

    remaining = PokerSeat.objects.filter(table=table, user__isnull=False, stack__gt=0).count()
    if remaining >= 2:
        # ponytail: status를 "waiting"으로 바꿔야 next_deadline_at()/process_due_deadlines()가
        # next_hand_at을 인식한다 — playing 상태로 남아있으면 워치독이 절대 깨어나지 않아
        # "카운트다운은 뜨는데 다음 핸드가 시작을 안 함" 버그의 실제 원인이었다.
        table.status = "waiting"
        table.next_hand_at = timezone.now() + timedelta(seconds=POKER_NEXT_HAND_DELAY)
        table.save()
    elif remaining == 1:
        table.status = "waiting"
        table.next_hand_at = None
        table.save()
    else:
        _maybe_reset_empty_table(table)


def player_action(user, action, amount=0):
    try:
        amount = int(amount)
    except (TypeError, ValueError):
        amount = 0
    with transaction.atomic():
        table = PokerTable.objects.select_for_update().get(pk=1)
        seats_by_number = {
            s.seat_number: s
            for s in PokerSeat.objects.select_for_update().filter(table=table).select_related("user")
        }
        seat = next((s for s in seats_by_number.values() if s.user_id == user.id), None)
        if not seat:
            return False, "테이블에 앉아있지 않습니다."
        try:
            _apply_action_locked(table, seats_by_number, seat, (action or "").lower(), amount)
        except ValueError as exc:
            return False, str(exc)
        seat.consecutive_timeouts = 0
        seat.save(update_fields=["consecutive_timeouts"])
        _resolve_turn(table, seats_by_number, seat.seat_number)
    return True, None


def send_emoji(user, emoji):
    """착석 중인 좌석 위에 띄울 이모티콘 반응. 성공하면 좌석 번호를 반환해
    컨슈머가 그 좌석 위로 말풍선을 브로드캐스트할 수 있게 한다."""
    if emoji not in POKER_EMOJI_CHOICES:
        return False, "지원하지 않는 이모티콘입니다."
    seat = PokerSeat.objects.filter(table_id=1, user=user).first()
    if not seat:
        return False, "테이블에 앉아있지 않습니다."
    return True, seat.seat_number


def _post_blind(seat, amount, table):
    actual = min(amount, seat.stack)
    seat.stack -= actual
    seat.current_bet = actual
    seat.contributed_total = actual
    seat.has_acted_this_street = True
    if seat.stack == 0:
        seat.status = "all_in"
    table.pot += actual


def _deal_new_hand(table):
    seats_by_number = {
        s.seat_number: s
        for s in PokerSeat.objects.select_for_update().filter(table=table).select_related("user")
    }
    for s in list(seats_by_number.values()):
        if s.user_id and (s.stack <= 0 or s.leaving_after_hand):
            _vacate_seat(s, table)

    eligible = [s for n, s in sorted(seats_by_number.items()) if s.user_id and s.stack > 0]
    if len(eligible) < 2:
        if any(s.user_id for s in seats_by_number.values()):
            table.status = "waiting"
            table.next_hand_at = None
            table.current_turn_seat = None
            table.turn_deadline = None
            table.save()
        else:
            _maybe_reset_empty_table(table)
        return

    eligible_numbers = sorted(s.seat_number for s in eligible)
    dealer_num = _rotate_dealer(eligible_numbers, table.dealer_seat)

    deck = list(FULL_DECK)
    random.SystemRandom().shuffle(deck)
    for s in eligible:
        s.status = "active"
        s.current_bet = 0
        s.contributed_total = 0
        s.has_acted_this_street = False
        s.hole_cards = [deck.pop(), deck.pop()]

    table.hand_number += 1
    table.status = "playing"
    table.round = "preflop"
    table.dealer_seat = dealer_num
    table.community_cards = []
    table.pot = 0
    table.min_raise = POKER_BIG_BLIND
    table.last_result = {}
    table.next_hand_at = None

    if len(eligible_numbers) == 2:
        sb_num = dealer_num
        bb_num = eligible_numbers[0] if eligible_numbers[1] == dealer_num else eligible_numbers[1]
    else:
        sb_num = _cycle_next(eligible_numbers, dealer_num)
        bb_num = _cycle_next(eligible_numbers, sb_num)

    sb_seat = seats_by_number[sb_num]
    bb_seat = seats_by_number[bb_num]
    _post_blind(sb_seat, POKER_SMALL_BLIND, table)
    _post_blind(bb_seat, POKER_BIG_BLIND, table)
    # 블라인드는 강제 납부일 뿐 자발적 액션이 아니므로, 두 좌석 모두 아직
    # 이번 스트리트에서 "액션한 적 없음" 상태여야 한다. (베팅액 불일치로 항상
    # 가려져 실전 버그로 드러난 적은 없지만, round_complete 판정 상 정확한 값이 아니었다.)
    sb_seat.has_acted_this_street = False
    bb_seat.has_acted_this_street = False

    table.current_bet = bb_seat.current_bet
    table.deck = deck

    for s in seats_by_number.values():
        s.save()
    table.save()

    _resolve_turn(table, seats_by_number, bb_num)


def _handle_turn_timeout(table, seats_by_number, seat):
    seat.consecutive_timeouts += 1
    force_leave = seat.consecutive_timeouts >= POKER_MAX_TIMEOUTS
    action = "fold" if (force_leave or seat.current_bet != table.current_bet) else "check"
    try:
        _apply_action_locked(table, seats_by_number, seat, action, 0)
    except ValueError:
        pass
    if force_leave:
        seat.leaving_after_hand = True
        seat.save(update_fields=["leaving_after_hand"])
    _resolve_turn(table, seats_by_number, seat.seat_number)


# ── 워치독(턴 제한시간 / 다음 핸드 시작) ──────────────────────────────────────

def next_deadline_at():
    """다음에 깨어나야 할 가장 이른 시각. 없으면 None."""
    table = PokerTable.get_solo()
    candidates = []
    if table.status == "playing" and table.turn_deadline:
        candidates.append(table.turn_deadline)
    if table.status == "waiting" and table.next_hand_at:
        candidates.append(table.next_hand_at)
    return min(candidates) if candidates else None


def process_due_deadlines():
    """마감시각이 지난 항목들을 처리한다. 여러 개가 동시에 지났어도 전부 처리."""
    now = timezone.now()
    with transaction.atomic():
        table = PokerTable.objects.select_for_update().get(pk=1)
        seats_by_number = {
            s.seat_number: s
            for s in PokerSeat.objects.select_for_update().filter(table=table).select_related("user")
        }

        if table.status == "playing" and table.turn_deadline and now >= table.turn_deadline:
            seat = seats_by_number.get(table.current_turn_seat)
            if seat and seat.status == "active":
                _handle_turn_timeout(table, seats_by_number, seat)
            else:
                # 턴을 가진 좌석이 (관리자가 자리를 강제로 비우는 등) 도중에
                # active가 아니게 되면 아무도 액션할 수 없는데 turn_deadline만
                # 과거에 남아 게임이 영원히 멈춘다 — 다음 액션 가능한 사람에게
                # 턴을 넘겨 복구한다.
                _resolve_turn(table, seats_by_number, table.current_turn_seat)

        if table.status == "waiting" and table.next_hand_at and now >= table.next_hand_at:
            _deal_new_hand(table)


def get_state_for(user):
    table = PokerTable.get_solo()
    seats = list(table.seats.select_related("user", "user__student").order_by("seat_number"))
    my_seat = next((s for s in seats if s.user_id == getattr(user, "id", None)), None)
    now = timezone.now()

    def seat_view(s):
        if not s.user_id:
            return {"seat_number": s.seat_number, "empty": True}
        is_owner = my_seat is not None and my_seat.seat_number == s.seat_number
        revealed_at_showdown = table.round == "showdown" and s.status in ("active", "all_in")
        if is_owner or revealed_at_showdown:
            hole_cards = s.hole_cards
        elif s.status in ("active", "all_in", "folded"):
            hole_cards = ["??", "??"]
        else:
            hole_cards = []
        return {
            "seat_number": s.seat_number,
            "empty": False,
            "username": s.user.username,
            "display_name": s.user.display_name,
            "picture": s.user.get_picture(),
            "stack": s.stack,
            "current_bet": s.current_bet,
            "status": s.status,
            "is_dealer": table.dealer_seat == s.seat_number,
            "is_turn": table.current_turn_seat == s.seat_number,
            "hole_cards": hole_cards,
            "is_me": is_owner,
        }

    turn_seconds_left = None
    if table.turn_deadline:
        turn_seconds_left = max(0, round((table.turn_deadline - now).total_seconds()))
    next_hand_seconds_left = None
    if table.next_hand_at:
        next_hand_seconds_left = max(0, round((table.next_hand_at - now).total_seconds()))

    to_call = 0
    can_check = False
    min_raise_to = None
    if my_seat and my_seat.status == "active" and table.current_turn_seat == my_seat.seat_number:
        to_call = max(0, table.current_bet - my_seat.current_bet)
        can_check = to_call == 0
        if table.current_bet > 0:
            min_raise_to = table.current_bet + table.min_raise

    is_authed = bool(getattr(user, "is_authenticated", False))
    wallet_chips = None
    my_leaves = None
    if is_authed:
        wallet = PokerChipWallet.objects.filter(user_id=user.id).first()
        wallet_chips = wallet.chips if wallet else 0
        # ponytail: WS 스코프의 user는 연결 시점에 캐시되어 leaves가 갱신되지
        # 않으므로(adjust_leaves는 F()로 DB만 갱신), 매번 DB에서 새로 읽는다.
        my_leaves = User.objects.filter(id=user.id).values_list("leaves", flat=True).first()

    return {
        "type": "state",
        "table_status": table.status,
        "round": table.round,
        "hand_number": table.hand_number,
        "pot": table.pot,
        "current_bet": table.current_bet,
        "community_cards": table.community_cards,
        "seats": [seat_view(s) for s in seats],
        "dealer_seat": table.dealer_seat,
        "turn_seat": table.current_turn_seat,
        "turn_seconds_left": turn_seconds_left,
        "next_hand_seconds_left": next_hand_seconds_left,
        "last_result": table.last_result,
        "my_seat_number": my_seat.seat_number if my_seat else None,
        "my_stack": my_seat.stack if my_seat else None,
        "to_call": to_call,
        "can_check": can_check,
        "min_bet": POKER_BIG_BLIND,
        "min_raise_to": min_raise_to,
        "buy_in_leaves": POKER_BUY_IN_LEAVES,
        "buy_in_chips": POKER_BUY_IN,
        "chips_per_leaf": POKER_CHIPS_PER_LEAF,
        "small_blind": POKER_SMALL_BLIND,
        "big_blind": POKER_BIG_BLIND,
        "my_leaves": my_leaves,
        "my_wallet_chips": wallet_chips,
        "open_seats": sum(1 for s in seats if not s.user_id),
    }
