"""
블랙잭 규칙 계산과 AI(기본 전략) — DB와 무관한 순수 함수.

규칙: 6덱, 딜러 소프트 17 스탠드(S17), 블랙잭 3:2, 처음 두 장에서 더블다운, 같은 숫자 두 장이면 스플릿 1회
(스플릿 후 더블 가능, 에이스 스플릿은 한 장씩만 받고 끝), 보험·서렌더 없음.
카드는 포커와 같은 표기 ("AS", "TH" …).

AI(AI 플레이어, 시간초과한 사람 대신 두기)는 위 규칙의 기본 전략표(수학적으로 기대값이 가장 높은 판단)를 따른다.
"""
import random

DECKS = 6
RANKS = "23456789TJQKA"
SUITS = "SHDC"


def new_shoe(rng=None):
    shoe = [r + s for r in RANKS for s in SUITS] * DECKS
    (rng or random.SystemRandom()).shuffle(shoe)
    return shoe


def card_value(card):
    r = card[0]
    if r == "A":
        return 11
    if r in "TJQK":
        return 10
    return int(r)


def hand_total(cards):
    """(합계, 소프트 여부). 에이스는 버스트하지 않는 한 11로 센다."""
    total = sum(card_value(c) for c in cards)
    aces = sum(1 for c in cards if c[0] == "A")
    while total > 21 and aces:
        total -= 10
        aces -= 1
    return total, aces > 0


def is_blackjack(cards, from_split=False):
    return len(cards) == 2 and not from_split and hand_total(cards)[0] == 21


def can_split(hand, n_hands):
    """같은 숫자 두 장(10·J·Q·K는 모두 10으로 같음), 스플릿은 한 번만."""
    c = hand["cards"]
    return len(c) == 2 and n_hands == 1 and card_value(c[0]) == card_value(c[1])


def can_double(hand):
    return len(hand["cards"]) == 2 and not hand.get("split_aces")


def dealer_should_hit(cards):
    total, _ = hand_total(cards)
    return total < 17  # 소프트 17 포함 17 이상이면 스탠드


# ── 기본 전략 (6덱, S17, 스플릿 후 더블 허용, 서렌더 없음) ──────────────────────

def _up(dealer_up):
    v = card_value(dealer_up)
    return 11 if v == 11 else v  # 2~10, 에이스 = 11


def basic_strategy(hand, dealer_up, n_hands, can_afford_extra=True):
    """기본 전략 판단: "hit" / "stand" / "double" / "split"."""
    cards = hand["cards"]
    up = _up(dealer_up)
    double_ok = can_double(hand) and can_afford_extra
    if can_split(hand, n_hands) and can_afford_extra:
        v = card_value(cards[0])
        split = {
            11: True, 8: True, 10: False, 5: False,
            9: up in (2, 3, 4, 5, 6, 8, 9),
            7: 2 <= up <= 7,
            6: 2 <= up <= 6,
            4: up in (5, 6),
            3: 2 <= up <= 7,
            2: 2 <= up <= 7,
        }[v]
        if split:
            return "split"
    total, soft = hand_total(cards)
    if soft and len(cards) >= 2:
        if total >= 19:
            return "stand"
        if total == 18:
            if 3 <= up <= 6:
                return "double" if double_ok else "stand"
            return "stand" if up in (2, 7, 8) else "hit"
        if total == 17:
            return "double" if double_ok and 3 <= up <= 6 else "hit"
        if total in (15, 16):
            return "double" if double_ok and 4 <= up <= 6 else "hit"
        if total in (13, 14):
            return "double" if double_ok and 5 <= up <= 6 else "hit"
        return "hit"
    if total >= 17:
        return "stand"
    if 13 <= total <= 16:
        return "stand" if up <= 6 else "hit"
    if total == 12:
        return "stand" if 4 <= up <= 6 else "hit"
    if total == 11:
        return "double" if double_ok and up != 11 else "hit"
    if total == 10:
        return "double" if double_ok and up <= 9 else "hit"
    if total == 9:
        return "double" if double_ok and 3 <= up <= 6 else "hit"
    return "hit"


def settle_hand(hand, dealer_cards):
    """플레이어 패 하나의 결과: ("blackjack" | "win" | "push" | "lose" | "bust", 돌려받을 칩).
    돌려받을 칩은 건 칩을 포함한다 (이기면 2배, 블랙잭이면 2.5배, 비기면 원금)."""
    bet = hand["bet"]
    p_total, _ = hand_total(hand["cards"])
    d_total, _ = hand_total(dealer_cards)
    player_bj = is_blackjack(hand["cards"], hand.get("from_split"))
    dealer_bj = is_blackjack(dealer_cards)
    if p_total > 21:
        return "bust", 0
    if player_bj and not dealer_bj:
        return "blackjack", bet + bet * 3 // 2
    if dealer_bj and not player_bj:
        return "lose", 0
    if player_bj and dealer_bj:
        return "push", bet
    if d_total > 21 or p_total > d_total:
        return "win", bet * 2
    if p_total == d_total:
        return "push", bet
    return "lose", 0
