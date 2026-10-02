"""
요트 다이스 규칙 엔진 + 방 상태머신 (세계의 아소비 대전 51 규칙).

규칙:
    - 12라운드. 차례마다 주사위 5개를 최대 3번 굴리고(굴릴 때마다 남길 주사위 선택),
      비어 있는 족보 칸 하나에 점수를 적는다.
    - 윗칸(1~6): 그 눈의 합. 윗칸 합이 63점 이상이면 보너스 35점.
    - 초이스: 주사위 합 / 포커(같은 눈 4개 이상): 주사위 합 / 풀하우스(3+2, 요트 포함): 주사위 합
    - S.스트레이트(4개 연속): 15 / L.스트레이트(5개 연속): 30 / 요트(5개 같음): 50
판돈: 판 시작 때 각자 참가비(사람은 칩 지갑, AI는 하우스 계좌)를 내고, 1등이 판돈을 가져간다(동점이면 나눔).
주사위는 서버가 굴린다 (SystemRandom).

판 진행 상태는 YachtRoom.state JSON, 모든 DB 변경은 방 행 select_for_update()로 잠근다.
차례: 사람 30초. 시간초과면 중간 난이도 AI가 대신 두고, 2번 연속이면 자리 비움 + 판 끝나고 퇴장.
AI 플레이어(직접 추가)는 최대 난이도 AI (game/yacht_ai.py).

공개 함수: create_room / join_room / leave_room / cancel_leave / mark_back / add_bots /
          roll / score / next_deadline_at / process_due_deadlines / get_state_for
"""
import random
from collections import Counter
from datetime import timedelta

from django.db import transaction
from django.db.models import Min, Q
from django.utils import timezone

from accounts.models import User
from .bots import free_bot
from .models import (
    HouseBank, PokerChipWallet, YachtGameLog, YachtRoom, YachtSeat, YACHT_STAKES, YACHT_STAKE_TIERS,
    TIER_AI_LEVEL, TIER_LABELS,
)

YACHT_TURN_TIMEOUT = 30       # 사람 차례 (굴리기/적기 한 번마다) 제한시간(초)
YACHT_AWAY_STEP = 2           # 자리 비운 사람을 대신 두는 간격(초)
YACHT_BOT_STEP = 1            # AI 플레이어가 한 번 두는 간격(초)
YACHT_MAX_TIMEOUTS = 2        # 연속 시간초과 이 횟수면 자리 비움 + 판 끝나고 퇴장
YACHT_START_DELAY = 3
YACHT_NEXT_GAME_DELAY = 10
YACHT_ROUNDS = 12
YACHT_BONUS_LINE, YACHT_BONUS = 63, 35

CATEGORIES = [
    "ones", "twos", "threes", "fours", "fives", "sixes",
    "choice", "four_kind", "full_house", "small_straight", "large_straight", "yacht",
]
UPPER = CATEGORIES[:6]
CATEGORY_LABELS = {
    "ones": "에이스", "twos": "듀스", "threes": "트레이", "fours": "포", "fives": "파이브", "sixes": "식스",
    "choice": "초이스", "four_kind": "포커", "full_house": "풀하우스",
    "small_straight": "S.스트레이트", "large_straight": "L.스트레이트", "yacht": "요트",
}
_rng = random.SystemRandom()


# ── 점수 (순수 함수) ──────────────────────────────────────────────────────────

def score_of(cat, dice):
    counts = Counter(dice)
    if cat in UPPER:
        face = UPPER.index(cat) + 1
        return face * counts[face]
    total = sum(dice)
    top = max(counts.values())
    faces = set(dice)
    if cat == "choice":
        return total
    if cat == "four_kind":
        return total if top >= 4 else 0
    if cat == "full_house":
        return total if sorted(counts.values()) in ([2, 3], [5]) else 0
    if cat == "small_straight":
        return 15 if any(run <= faces for run in ({1, 2, 3, 4}, {2, 3, 4, 5}, {3, 4, 5, 6})) else 0
    if cat == "large_straight":
        return 30 if faces in ({1, 2, 3, 4, 5}, {2, 3, 4, 5, 6}) else 0
    if cat == "yacht":
        return 50 if top == 5 else 0
    raise ValueError("알 수 없는 족보입니다.")


def card_totals(card):
    upper = sum(card.get(c, 0) for c in UPPER)
    bonus = YACHT_BONUS if upper >= YACHT_BONUS_LINE else 0
    return {"upper": upper, "bonus": bonus, "total": upper + bonus + sum(card.get(c, 0) for c in CATEGORIES[6:])}


# 칸마다 낼 수 있는 최고 점수 (풀하우스는 요트도 인정하므로 6×5)
MAX_SCORE = {
    "ones": 5, "twos": 10, "threes": 15, "fours": 20, "fives": 25, "sixes": 30,
    "choice": 30, "four_kind": 30, "full_house": 30, "small_straight": 15, "large_straight": 30, "yacht": 50,
}


def max_possible_total(card):
    """남은 칸을 모두 최고점으로 채웠을 때의 총점 (아직 못 받은 보너스도 가능하면 포함)."""
    t = card_totals(card)
    open_cats = [c for c in CATEGORIES if c not in card]
    upper_max = t["upper"] + sum(MAX_SCORE[c] for c in open_cats if c in UPPER)
    bonus = YACHT_BONUS if upper_max >= YACHT_BONUS_LINE else 0
    lower = sum(card.get(c, 0) for c in CATEGORIES[6:]) + sum(MAX_SCORE[c] for c in open_cats if c not in UPPER)
    return upper_max + bonus + lower


def decided_leader(cards):
    """역전 불가능해진 1등의 좌석 번호. 아직 뒤집힐 수 있으면 None.
    (지금 점수는 줄지 않으므로 1등의 현재 점수가 다른 모두의 최대 가능 점수보다 크면 확정)"""
    if len(cards) < 2:
        return None
    totals = [card_totals(c)["total"] for c in cards]
    leader = max(range(len(cards)), key=lambda i: totals[i])
    if all(max_possible_total(cards[i]) < totals[leader] for i in range(len(cards)) if i != leader):
        return leader
    return None


# ── 판 진행 (순수 함수: state dict를 직접 변경) ───────────────────────────────

def new_game(n, first):
    return {
        "round": 1, "turn": first, "first": first, "phase": "play",
        "dice": [], "held": [False] * 5, "rolls": 0,
        "cards": [{} for _ in range(n)],
        "timeouts": [0] * n, "away": [], "leaving": [], "bots": [],
        "last": None,
    }


def roll_dice(st, s, held=None, rng=None):
    if st["phase"] != "play" or st["turn"] != s:
        raise ValueError("내 차례가 아닙니다.")
    if st["rolls"] >= 3:
        raise ValueError("이번 차례에는 더 굴릴 수 없습니다.")
    rng = rng or _rng
    if st["rolls"] == 0:
        held = [False] * 5
    else:
        held = [bool(h) for h in (held or [])][:5] + [False] * (5 - len(held or []))
        if all(held):
            raise ValueError("굴릴 주사위를 하나 이상 남겨두지 마세요.")
    dice = st["dice"] or [1] * 5
    st["dice"] = [d if held[i] else rng.randint(1, 6) for i, d in enumerate(dice)]
    st["held"] = held
    st["rolls"] += 1
    return None


def score_category(st, s, cat):
    """칸에 점수를 적고 차례를 넘긴다. 반환값은 판이 끝났으면 {"over": True}."""
    if st["phase"] != "play" or st["turn"] != s:
        raise ValueError("내 차례가 아닙니다.")
    if st["rolls"] == 0:
        raise ValueError("먼저 주사위를 굴려주세요.")
    if cat not in CATEGORIES or cat in st["cards"][s]:
        raise ValueError("적을 수 없는 칸입니다.")
    pts = score_of(cat, st["dice"])
    st["cards"][s][cat] = pts
    st["last"] = {"side": s, "cat": cat, "score": pts, "dice": st["dice"]}
    n = len(st["cards"])
    st["turn"] = (s + 1) % n
    if st["turn"] == st["first"]:
        st["round"] += 1
    st["dice"], st["held"], st["rolls"] = [], [False] * 5, 0
    if st["round"] > YACHT_ROUNDS:
        st["phase"] = "over"
        return {"over": True}
    if decided_leader(st["cards"]) is not None:
        # 남은 칸을 모두 최고점으로 채워도 1등을 따라잡을(동점 포함) 사람이 없으면 조기 종료
        st["phase"] = "over"
        st["early_end"] = True
        return {"over": True}
    return None


def apply_action(st, s, action):
    kind, arg = action
    if kind == "roll":
        return roll_dice(st, s, arg)
    return score_category(st, s, arg)


# ── 방 / 칩 (DB) ─────────────────────────────────────────────────────────────

def _seats(room):
    return list(YachtSeat.objects.select_for_update(of=("self",)).filter(room=room).select_related("user").order_by("seat"))


def _lock_my_room(user):
    seat = YachtSeat.objects.filter(user=user).first()
    if not seat:
        return None, None
    room = YachtRoom.objects.select_for_update().filter(pk=seat.room_id).first()
    seat = YachtSeat.objects.select_for_update().filter(pk=seat.pk).select_related("user").first()
    if not room or not seat:
        return None, None
    return room, seat


def _wallet_chips(user):
    return PokerChipWallet.objects.filter(user=user).values_list("chips", flat=True).first() or 0


def _pay(user, chips):
    """칩을 받는다: 사람은 칩 지갑, AI는 하우스 계좌."""
    if chips <= 0:
        return
    if user.is_bot:
        house = HouseBank.locked()
        house.chips += chips
        house.save(update_fields=["chips"])
    else:
        wallet, _ = PokerChipWallet.objects.select_for_update().get_or_create(user=user)
        wallet.chips += chips
        wallet.save(update_fields=["chips"])


def _charge(user, chips):
    """참가비를 낸다. 모자라면 False."""
    if user.is_bot:
        house = HouseBank.locked()
        if house.chips < chips:
            return False
        house.chips -= chips
        house.save(update_fields=["chips"])
        return True
    wallet = PokerChipWallet.objects.select_for_update().filter(user=user).first()
    if not wallet or wallet.chips < chips:
        return False
    wallet.chips -= chips
    wallet.save(update_fields=["chips"])
    return True


def create_room(user, capacity, stake):
    try:
        capacity, stake = int(capacity), int(stake)
    except (TypeError, ValueError):
        return False, "잘못된 요청입니다."
    if capacity not in (2, 3, 4) or stake not in YACHT_STAKES:
        return False, "인원(2~4)과 참가비를 다시 골라주세요."
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if YachtSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        if _wallet_chips(user) < stake:
            return False, f"칩 지갑에 참가비 {stake:,}칩이 있어야 합니다."
        room = YachtRoom.objects.create(capacity=capacity, stake=stake)
        YachtSeat.objects.create(room=room, user=user, seat=0)
    return True, room.id


def join_room(user, room_id):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if YachtSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        room = YachtRoom.objects.select_for_update().filter(pk=room_id).first()
        if not room:
            return False, "입장할 수 없는 방입니다."
        if _wallet_chips(user) < room.stake:
            return False, f"칩 지갑에 참가비 {room.stake:,}칩이 있어야 합니다."
        count = YachtSeat.objects.filter(room=room).count()
        if count >= room.capacity:
            # AI가 앉아 있으면 사람에게 자리를 비켜준다 (판 중이면 판이 끝난 뒤)
            bot = YachtSeat.objects.filter(room=room, user__is_bot=True).select_related("user").order_by("-seat").first()
            if not bot:
                return False, "방이 가득 찼습니다."
            if room.status == "playing":
                if bot.seat not in room.state["leaving"]:
                    room.state["leaving"].append(bot.seat)
                    room.save(update_fields=["state"])
                return False, "판이 끝나면 AI가 자리를 비켜줍니다. 판이 끝난 뒤 다시 입장해주세요."
            _remove_seat(room, bot)
            count -= 1
        YachtSeat.objects.create(room=room, user=user, seat=count)
        _schedule_if_full(room)
    return True, room.id


def _schedule_if_full(room):
    if YachtSeat.objects.filter(room=room).count() == room.capacity and room.status == "waiting":
        room.next_game_at = timezone.now() + timedelta(seconds=YACHT_START_DELAY)
        room.save()


def add_bots(user):
    """빈자리를 최대 난이도 AI로 채운다."""
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room:
            return False, "참여 중인 방이 없습니다."
        if room.status != "waiting":
            return False, "대기 중일 때만 AI를 부를 수 있습니다."
        count = YachtSeat.objects.filter(room=room).count()
        if count >= room.capacity:
            return False, "빈자리가 없습니다."
        if HouseBank.locked().chips < room.stake * (room.capacity - count):
            return False, "하우스 칩이 부족해 AI를 부를 수 없습니다."
        for i in range(count, room.capacity):
            YachtSeat.objects.create(room=room, user=free_bot(), seat=i)
        _schedule_if_full(room)
    return True, None


def _remove_seat(room, seat):
    """좌석을 비우고 번호를 당긴다. 사람이 아무도 없으면 AI도 정리하고 방을 지운 뒤 False."""
    removed = seat.seat
    seat.delete()
    for s in YachtSeat.objects.filter(room=room, seat__gt=removed).order_by("seat"):
        s.seat -= 1
        s.save(update_fields=["seat"])
    if not YachtSeat.objects.filter(room=room, user__is_bot=False).exists():
        YachtSeat.objects.filter(room=room).delete()
        room.delete()
        return False
    room.status = "waiting"
    room.state = {}
    room.turn_deadline = None
    room.next_game_at = None
    room.save()
    return True


def leave_room(user, away=False):
    """퇴장. 판 중이면 판이 끝난 뒤 퇴장 예약(토글) + 자리 비움(대신 두기), 아니면 바로."""
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room:
            return False, "참여 중인 방이 없습니다."
        if room.status != "playing":
            _remove_seat(room, seat)
            return True, None
        st = room.state
        if away:
            if seat.seat not in st["leaving"]:
                st["leaving"].append(seat.seat)
            if seat.seat not in st["away"]:
                st["away"].append(seat.seat)
        elif seat.seat in st["leaving"]:
            st["leaving"].remove(seat.seat)
            if seat.seat in st["away"]:
                st["away"].remove(seat.seat)
        else:
            st["leaving"].append(seat.seat)
            st["away"].append(seat.seat)  # 나가기로 했으니 남은 차례는 대신 둔다
        room.save(update_fields=["state"])
        if st["turn"] == seat.seat:
            room.turn_deadline = _deadline(st)
            room.save(update_fields=["turn_deadline"])
    return True, None


def cancel_leave(user):
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room:
            return False, "참여 중인 방이 없습니다."
        st = room.state or {}
        for key in ("leaving", "away"):
            if seat.seat in st.get(key, []):
                st[key].remove(seat.seat)
        room.save(update_fields=["state"])
    return True, None


def mark_back(user):
    """재접속: 끊김으로 걸린 자리 비움/퇴장 예약을 푼다."""
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room or room.status != "playing" or seat.seat not in room.state.get("away", []):
            return False, None
        for key in ("leaving", "away"):
            if seat.seat in room.state[key]:
                room.state[key].remove(seat.seat)
        room.state["timeouts"][seat.seat] = 0
        room.save(update_fields=["state"])
    return True, None


def _deadline(st, now=None):
    now = now or timezone.now()
    side = st["turn"]
    if side in st["bots"]:
        return now + timedelta(seconds=YACHT_BOT_STEP)
    if side in st["away"]:
        return now + timedelta(seconds=YACHT_AWAY_STEP)
    return now + timedelta(seconds=YACHT_TURN_TIMEOUT)


def _start_game(room):
    # 퇴장 예약자는 지난 판 결과를 다 본 이 시점에 나간다 (뒷자리부터)
    for side in sorted((room.state or {}).get("leaving", []), reverse=True):
        seat = YachtSeat.objects.select_for_update().filter(room=room, seat=side).first()
        if seat and not _remove_seat(room, seat):
            return
    seats = _seats(room)
    if len(seats) < room.capacity:
        room.next_game_at = None
        room.save(update_fields=["next_game_at"])
        return
    # 참가비: 못 내는 사람은 내보내고 기다린다 (이미 걷은 칩은 돌려준다)
    paid = []
    for s in seats:
        if not _charge(s.user, room.stake):
            for p in paid:
                _pay(p.user, room.stake)
            _remove_seat(room, s)
            return
        paid.append(s)
    first = (room.last_result or {}).get("next_first", 0) % len(seats)
    st = new_game(len(seats), first)
    st["bots"] = [s.seat for s in seats if s.user.is_bot]
    room.state = st
    room.pot = room.stake * len(seats)
    room.status = "playing"
    room.next_game_at = None
    room.last_result = {}
    room.turn_deadline = _deadline(st)
    room.save()


def _end_game(room):
    st = room.state
    seats = _seats(room)
    totals = [card_totals(c) for c in st["cards"]]
    best = max(t["total"] for t in totals)
    winners = [i for i, t in enumerate(totals) if t["total"] == best]
    share, remainder = divmod(room.pot, len(winners))
    for k, w in enumerate(winners):
        _pay(seats[w].user, share + (remainder if k == 0 else 0))
    rows = [{
        "side": i, "user_id": seats[i].user_id, "name": seats[i].user.display_name,
        "is_bot": seats[i].user.is_bot, **totals[i],
        "won": (share + (remainder if winners and i == winners[0] else 0)) if i in winners else 0,
    } for i in range(len(seats))]
    room.last_result = {
        "rows": rows, "pot": room.pot, "stake": room.stake, "winners": [seats[w].user.display_name for w in winners],
        "next_first": (st["first"] + 1) % len(seats),
        "early_end": bool(st.get("early_end")), "round": min(st["round"], YACHT_ROUNDS),
    }
    YachtGameLog.objects.create(room_number=room.pk, pot=room.pot, detail=room.last_result)
    room.pot = 0
    room.status = "waiting"
    room.turn_deadline = None
    room.next_game_at = timezone.now() + timedelta(seconds=YACHT_NEXT_GAME_DELAY)
    room.save()


def _act(user, fn):
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room or room.status != "playing":
            return False, "진행 중인 판이 없습니다."
        st = room.state
        try:
            outcome = fn(st, seat.seat)
        except ValueError as e:
            return False, str(e)
        st["timeouts"][seat.seat] = 0
        if seat.seat in st["away"] and seat.seat not in st["leaving"]:
            st["away"].remove(seat.seat)
        room.state = st
        if outcome:
            _end_game(room)
        else:
            room.turn_deadline = _deadline(st)
            room.save()
    return True, None


def roll(user, held=None):
    return _act(user, lambda st, s: roll_dice(st, s, held))


def score(user, cat):
    return _act(user, lambda st, s: score_category(st, s, cat))


# ── 워치독 ───────────────────────────────────────────────────────────────────

def next_deadline_at():
    agg = YachtRoom.objects.aggregate(
        turn=Min("turn_deadline", filter=Q(status="playing")),
        nxt=Min("next_game_at", filter=Q(status="waiting")),
    )
    candidates = [d for d in agg.values() if d]
    return min(candidates) if candidates else None


def process_due_deadlines():
    from . import yacht_ai
    now = timezone.now()
    due_ids = list(YachtRoom.objects.filter(
        Q(status="playing", turn_deadline__lte=now) | Q(status="waiting", next_game_at__lte=now)
    ).values_list("id", flat=True))
    for room_id in due_ids:
        with transaction.atomic():
            room = YachtRoom.objects.select_for_update().filter(pk=room_id).first()
            if not room:
                continue
            if room.status == "playing" and room.turn_deadline and room.turn_deadline <= now:
                st = room.state
                side = st["turn"]
                level = TIER_AI_LEVEL[YACHT_STAKE_TIERS.get(room.stake, "intermediate")]
                if side in st["bots"]:
                    action = yacht_ai.act_for(level, st, side)
                else:
                    # 사람이 시간초과/자리 비움이면 방 단계 난이도의 AI가 한 수씩 대신 둔다
                    if side not in st["away"]:
                        st["timeouts"][side] += 1
                        if st["timeouts"][side] >= YACHT_MAX_TIMEOUTS:
                            st["away"].append(side)
                            if side not in st["leaving"]:
                                st["leaving"].append(side)
                    action = yacht_ai.act_for(level, st, side)
                outcome = apply_action(st, side, action)
                room.state = st
                if outcome:
                    _end_game(room)
                else:
                    room.turn_deadline = _deadline(st, now)
                    room.save()
            elif room.status == "waiting" and room.next_game_at and room.next_game_at <= now:
                _start_game(room)
    return bool(due_ids)


# ── 상태 스냅샷 ───────────────────────────────────────────────────────────────

def _player_view(u):
    return {"user_id": u.id, "display_name": u.display_name, "picture": u.get_picture(), "is_bot": u.is_bot}


def get_state_for(user):
    rooms = list(YachtRoom.objects.prefetch_related("seats__user").order_by("created_at"))
    my_seat = YachtSeat.objects.filter(user_id=user.id).first()
    my_room = next((r for r in rooms if my_seat and r.id == my_seat.room_id), None)
    room_view = None
    if my_room:
        seats = sorted(my_room.seats.all(), key=lambda s: s.seat)
        st = my_room.state or {}
        game = None
        if st:
            now = timezone.now()
            turn_left = None
            if my_room.status == "playing" and my_room.turn_deadline:
                turn_left = max(0, round((my_room.turn_deadline - now).total_seconds()))
            turn_card = st["cards"][st["turn"]] if st["phase"] == "play" else {}
            game = {
                "phase": st["phase"], "round": min(st["round"], YACHT_ROUNDS), "turn": st["turn"],
                "my_turn": st["phase"] == "play" and st["turn"] == my_seat.seat and my_room.status == "playing",
                "dice": st["dice"], "held": st["held"], "rolls": st["rolls"],
                "cards": st["cards"], "totals": [card_totals(c) for c in st["cards"]],
                # 지금 주사위로 각 빈칸에 적으면 받을 점수 (차례인 사람 기준)
                "preview": {c: score_of(c, st["dice"]) for c in CATEGORIES if c not in turn_card} if st["dice"] else {},
                "away": st["away"], "leaving": st["leaving"], "last": st["last"],
                "turn_seconds_left": turn_left,
            }
        last = dict(my_room.last_result or {})
        if last.get("rows"):
            stake = last.get("stake", 0)
            mine = next((r for r in last["rows"] if r["user_id"] == user.id), None)
            last["my_net"] = (mine["won"] - stake) if mine else None
        next_left = None
        if my_room.next_game_at:
            next_left = max(0, round((my_room.next_game_at - timezone.now()).total_seconds()))
        room_view = {
            "id": my_room.id, "capacity": my_room.capacity, "stake": my_room.stake, "pot": my_room.pot,
            "tier_label": TIER_LABELS[YACHT_STAKE_TIERS.get(my_room.stake, "intermediate")],
            "status": my_room.status, "me": my_seat.seat,
            "seats": [dict(_player_view(s.user), side=s.seat) for s in seats],
            "next_game_seconds_left": next_left, "last_result": last, "game": game,
        }
    wallet = PokerChipWallet.objects.filter(user_id=user.id).values_list("chips", flat=True).first()
    my_leaves = User.objects.filter(id=user.id).values_list("leaves", flat=True).first()
    return {
        "type": "state",
        "rooms": [{
            "id": r.id, "capacity": r.capacity, "stake": r.stake, "status": r.status,
            "tier_label": TIER_LABELS[YACHT_STAKE_TIERS.get(r.stake, "intermediate")],
            "players": [_player_view(s.user) for s in sorted(r.seats.all(), key=lambda s: s.seat)],
        } for r in rooms],
        "room": room_view,
        "wallet_chips": wallet or 0,
        "my_leaves": my_leaves,
        "stakes": list(YACHT_STAKES),
        "stake_labels": {str(k): TIER_LABELS[v] for k, v in YACHT_STAKE_TIERS.items()},
        "categories": [{"key": c, "label": CATEGORY_LABELS[c]} for c in CATEGORIES],
    }
