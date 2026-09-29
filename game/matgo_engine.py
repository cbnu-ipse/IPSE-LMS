"""
맞고(2인 고스톱) 규칙 엔진 + 방 상태머신.

앞부분은 DB와 무관한 순수 규칙 함수(state dict를 직접 변경), 뒷부분은 방/칩을
다루는 DB 함수다. 판 진행 상태는 MatgoRoom.state 하나에 JSON으로 저장한다.
모든 DB 상태 변경은 `transaction.atomic()` + 방 행 `select_for_update()`로 방 단위로 잠근다.

카드는 0~47 정수 id. month = id // 4 + 1, 월 안에서의 종류는 CARDS 표를 따른다.
플레이어는 side 0(방장) / 1(상대) 로 부르고, state의 리스트 필드는 side로 인덱싱한다.

규칙 요약 (표준 맞고):
    - 손패 10장씩, 바닥 8장, 더미 20장. 바닥에 같은 월 4장이 깔리면 다시 섞는다.
    - 7점 이상 나면 고/스톱. 1·2고 +1·+2점, 3고부터 (점수+고 횟수) × 2^(고-2).
    - 피박(패자 피 7장 이하)·광박·멍박(승자 열끗 7장 이상)·흔들기·폭탄 각 ×2.
    - 뻑/따닥/쪽/쓸/뻑 먹기(자뻑은 2장)/폭탄 시 상대 피를 가져온다.
    - 총통(손패 같은 월 4장)·3뻑은 즉시 10점 승리. 나가리는 다음 판 ×2 누적.
    - 국진(9월 열끗)은 열끗/쌍피 중 유리한 쪽을 자동 선택한다.

공개 함수(뷰/컨슈머에서 호출):
    create_room(user) / join_room(user, room_id) / leave_room(user)
    play(user, card, target, mode) / choose_flip(user, target) / declare(user, go)
    next_deadline_at() / process_due_deadlines()   — 워치독용
    get_state_for(user)                             — 접속자 시점 상태 스냅샷
"""
import random
from datetime import timedelta

from django.db import transaction
from django.db.models import Min, Q
from django.utils import timezone

from accounts.models import User
from .models import (
    MatgoRoom, MatgoGameLog, PokerChipWallet,
    MATGO_BUY_IN, MATGO_CHIPS_PER_POINT, POKER_CHIPS_PER_LEAF,
)

MATGO_TURN_TIMEOUT = 20       # 턴(또는 고/스톱, 뒤집은 패 선택)당 제한시간(초)
MATGO_MAX_TIMEOUTS = 3        # 연속 시간초과 이 횟수면 기권 처리 후 퇴장
MATGO_START_DELAY = 3         # 두 명이 모이고 첫 판 시작까지(초)
MATGO_NEXT_GAME_DELAY = 8     # 판 종료 후 결과를 보여주고 다음 판까지(초)
MATGO_WIN_SCORE = 7           # 날 수 있는 최소 점수
MATGO_PIBAK_MAX = 7           # 패자 피가 이 장수 이하면 피박
MATGO_MEONGBAK_MIN = 7        # 승자 열끗이 이 장수 이상이면 멍박
MATGO_SPECIAL_WIN_POINTS = 10  # 총통·3뻑 즉시 승리 점수


# ── 카드 ─────────────────────────────────────────────────────────────────────

def _c(k, t=None, **flags):
    return {"k": k, "t": t, **flags}

# 월별 4장: k = g(광) y(열끗) t(띠) p(피) pp(쌍피), t = 띠 종류(hong/cheong/cho, 비띠는 None)
_MONTHS = [
    [_c("g"), _c("t", "hong"), _c("p"), _c("p")],                         # 1 송학
    [_c("y", godori=True), _c("t", "hong"), _c("p"), _c("p")],            # 2 매조
    [_c("g"), _c("t", "hong"), _c("p"), _c("p")],                         # 3 벚꽃
    [_c("y", godori=True), _c("t", "cho"), _c("p"), _c("p")],             # 4 흑싸리
    [_c("y"), _c("t", "cho"), _c("p"), _c("p")],                          # 5 난초
    [_c("y"), _c("t", "cheong"), _c("p"), _c("p")],                       # 6 모란
    [_c("y"), _c("t", "cho"), _c("p"), _c("p")],                          # 7 홍싸리
    [_c("g"), _c("y", godori=True), _c("p"), _c("p")],                    # 8 공산
    [_c("y", gukjin=True), _c("t", "cheong"), _c("p"), _c("p")],          # 9 국진
    [_c("y"), _c("t", "cheong"), _c("p"), _c("p")],                       # 10 단풍
    [_c("g"), _c("pp"), _c("p"), _c("p")],                                # 11 오동
    [_c("g", bi=True), _c("y"), _c("t"), _c("pp")],                       # 12 비
]
CARDS = [dict(card, id=m * 4 + i, m=m + 1) for m, month in enumerate(_MONTHS) for i, card in enumerate(month)]
_KIND_VALUE = {"g": 5, "y": 4, "t": 3, "pp": 2, "p": 1}


def month(card):
    return card // 4 + 1


def _signature(card):
    c = CARDS[card]
    return (c["k"], c["t"], c.get("godori"), c.get("gukjin"), c.get("bi"))


def _best_of(options):
    return max(options, key=lambda c: _KIND_VALUE[CARDS[c]["k"]])


# ── 점수 ─────────────────────────────────────────────────────────────────────

def score_breakdown(captured, gukjin_as_pi=False):
    cards = [CARDS[c] for c in captured]
    gwang = [c for c in cards if c["k"] == "g"]
    yeol = [c for c in cards if c["k"] == "y" and not (c.get("gukjin") and gukjin_as_pi)]
    tti = [c for c in cards if c["k"] == "t"]
    pi_count = sum(
        1 if c["k"] == "p" else 2 if c["k"] == "pp" or (c.get("gukjin") and gukjin_as_pi) else 0
        for c in cards
    )

    gc = len(gwang)
    if gc == 5:
        gwang_pts = 15
    elif gc == 4:
        gwang_pts = 4
    elif gc == 3:
        gwang_pts = 2 if any(c.get("bi") for c in gwang) else 3
    else:
        gwang_pts = 0
    yeol_pts = max(0, len(yeol) - 4) + (5 if sum(1 for c in yeol if c.get("godori")) == 3 else 0)
    tti_pts = max(0, len(tti) - 4) + sum(
        3 for kind in ("hong", "cheong", "cho") if sum(1 for c in tti if c["t"] == kind) == 3
    )
    pi_pts = max(0, pi_count - 9)
    return {
        "total": gwang_pts + yeol_pts + tti_pts + pi_pts,
        "gwang_pts": gwang_pts, "yeol_pts": yeol_pts, "tti_pts": tti_pts, "pi_pts": pi_pts,
        "gwang_count": gc, "yeol_count": len(yeol), "pi_count": pi_count,
    }


def best_score(captured):
    return max(score_breakdown(captured, o)["total"] for o in (False, True))


def settle(st, winner, reason):
    """승자가 받을 점수(나가리 배수 제외)와 내역."""
    if reason in ("chongtong", "3ppeok"):
        return MATGO_SPECIAL_WIN_POINTS, {"reason": reason}
    loser = 1 - winner
    go = st["go"][winner]

    def pay(w_opt, l_opt):
        sc = score_breakdown(st["captured"][winner], w_opt)
        lsc = score_breakdown(st["captured"][loser], l_opt)
        pts = sc["total"] + go
        if go >= 3:
            pts *= 2 ** (go - 2)
        baks = []
        if sc["pi_pts"] > 0 and lsc["pi_count"] <= MATGO_PIBAK_MAX:
            baks.append("피박")
        if sc["gwang_pts"] > 0 and lsc["gwang_count"] == 0:
            baks.append("광박")
        if sc["yeol_count"] >= MATGO_MEONGBAK_MIN:
            baks.append("멍박")
        pts *= 2 ** (len(baks) + st["shakes"][winner])
        return pts, {"reason": reason, "base": sc["total"], "go": go, "baks": baks, "shakes": st["shakes"][winner]}

    # 승자는 자기에게 유리한 국진 선택, 패자는 그 선택에 대해 가장 적게 내는 선택
    points, detail = max(
        (min((pay(w, l) for l in (False, True)), key=lambda r: r[0]) for w in (False, True)),
        key=lambda r: r[0],
    )
    if reason == "forfeit":
        points = max(points, MATGO_WIN_SCORE)
    return points, detail


# ── 판 진행 (순수 함수: state dict를 직접 변경) ───────────────────────────────

def new_game(first, rng=random):
    """(state, outcome) 반환. outcome은 총통이면 승리 dict, 아니면 None."""
    while True:
        deck = list(range(48))
        rng.shuffle(deck)
        floor = deck[20:28]
        if all(sum(1 for c in floor if month(c) == m) < 4 for m in range(1, 13)):
            break
    st = {
        "hands": [sorted(deck[0:10]), sorted(deck[10:20])],
        "floor": floor,
        "pile": deck[28:48],
        "captured": [[], []],
        "bombs": [0, 0],
        "turn": first,
        "phase": "play",
        "pending": None,
        "go": [0, 0],
        "go_score": [0, 0],
        "shakes": [0, 0],
        "shaken": [[], []],
        "ppeok": [0, 0],
        "ppeok_months": {},
        "timeouts": [0, 0],
        "events": [],
        "last_play": None,
    }
    for side in (first, 1 - first):
        hand = st["hands"][side]
        if any(sum(1 for c in hand if month(c) == m) == 4 for m in range(1, 13)):
            st["phase"] = "over"
            return st, {"winner": side, "reason": "chongtong"}
    return st, None


def _capture(st, s, cards):
    for c in cards:
        if c in st["floor"]:
            st["floor"].remove(c)
    st["captured"][s].extend(cards)


def _steal_pi(st, s, n):
    opp = st["captured"][1 - s]
    for _ in range(n):
        victim = next((c for c in opp if CARDS[c]["k"] == "p"), None)
        if victim is None:
            victim = next((c for c in opp if CARDS[c]["k"] == "pp"), None)
        if victim is None:
            return
        opp.remove(victim)
        st["captured"][s].append(victim)


def _take_stack(st, s, m, events):
    """바닥에 3장 쌓인 월을 4번째 패로 먹을 때 — 뻑이었으면 상대 피를 가져온다."""
    owner = st["ppeok_months"].pop(str(m), None)
    if owner is None:
        return 0
    events.append("자뻑" if owner == s else "뻑 먹기")
    return 2 if owner == s else 1


def _check_turn(st, s):
    if st["phase"] != "play" and st["phase"] != "choose_flip" and st["phase"] != "go_stop":
        raise ValueError("진행 중인 판이 아닙니다.")
    if st["turn"] != s:
        raise ValueError("내 차례가 아닙니다.")


def play_card(st, s, card, target=None, mode=None):
    """손패 한 장(또는 폭탄 후 받은 'bomb')을 낸다. 반환값은 판 종료 outcome 또는 None."""
    _check_turn(st, s)
    if st["phase"] != "play":
        raise ValueError("지금은 패를 낼 수 없습니다.")
    hand = st["hands"][s]
    floor = st["floor"]
    events = []
    steals = 0

    # ── 검증 (여기까지는 state를 건드리지 않는다) ──
    if card == "bomb":
        if st["bombs"][s] <= 0:
            raise ValueError("낼 수 있는 폭탄 패가 없습니다.")
        m = None
    else:
        try:
            card = int(card)
        except (TypeError, ValueError):
            raise ValueError("잘못된 패입니다.")
        if card not in hand:
            raise ValueError("손에 없는 패입니다.")
        m = month(card)
        floor_m = [c for c in floor if month(c) == m]
        same = [c for c in hand if month(c) == m]
        if mode == "bomb" and not (len(same) >= 3 and len(floor_m) == 1):
            raise ValueError("폭탄을 할 수 없는 패입니다.")
        if mode == "shake" and not (len(same) >= 3 and m not in st["shaken"][s]):
            raise ValueError("흔들 수 없는 패입니다.")
        if mode not in (None, "bomb", "shake"):
            raise ValueError("잘못된 요청입니다.")
        if mode != "bomb" and len(floor_m) == 2:
            if target is not None:
                try:
                    target = int(target)
                except (TypeError, ValueError):
                    target = None
            if target not in floor_m:
                if _signature(floor_m[0]) != _signature(floor_m[1]):
                    raise ValueError("먹을 패를 선택해주세요.")
                target = floor_m[0]

    # ── 손패 내기 ──
    hand_case = None
    if card == "bomb":
        st["bombs"][s] -= 1
    elif mode == "bomb":
        for c in same:
            hand.remove(c)
        _capture(st, s, same + floor_m)
        st["bombs"][s] += 2
        st["shakes"][s] += 1
        steals += 1
        events.append("폭탄")
    else:
        if mode == "shake":
            st["shakes"][s] += 1
            st["shaken"][s].append(m)
            events.append("흔들기")
        hand.remove(card)
        n = len(floor_m)
        if n == 0:
            floor.append(card)
            hand_case = ("alone",)
        elif n == 1:
            hand_case = ("pair", floor_m[0])
        elif n == 2:
            hand_case = ("pair2", target, next(c for c in floor_m if c != target))
        else:
            hand_case = ("four", floor_m)

    # ── 더미 뒤집기 ──
    flip = st["pile"].pop(0) if st["pile"] else None
    st["last_play"] = {"side": s, "card": card, "flip": flip}
    if flip is not None and hand_case and month(flip) == m:
        if hand_case[0] == "alone":
            _capture(st, s, [card, flip])
            steals += 1
            events.append("쪽")
        elif hand_case[0] == "pair":
            floor.extend([card, flip])
            st["ppeok_months"][str(m)] = s
            st["ppeok"][s] += 1
            events.append("뻑")
            if st["ppeok"][s] >= 3:
                st["events"] = events + ["3뻑"]
                st["phase"] = "over"
                return {"winner": s, "reason": "3ppeok"}
        elif hand_case[0] == "pair2":
            _capture(st, s, [card, hand_case[1], hand_case[2], flip])
            steals += 1
            events.append("따닥")
        return _finish_turn(st, s, steals, events)

    if hand_case:
        if hand_case[0] in ("pair", "pair2"):
            _capture(st, s, [card, hand_case[1]])
        elif hand_case[0] == "four":
            _capture(st, s, [card] + hand_case[1])
            steals += _take_stack(st, s, m, events)
    if flip is not None:
        floor_n = [c for c in floor if month(c) == month(flip)]
        if not floor_n:
            floor.append(flip)
        elif len(floor_n) == 1:
            _capture(st, s, [flip, floor_n[0]])
        elif len(floor_n) == 2:
            if _signature(floor_n[0]) == _signature(floor_n[1]):
                _capture(st, s, [flip, floor_n[0]])
            else:
                st["phase"] = "choose_flip"
                st["pending"] = {"card": flip, "options": floor_n, "steals": steals, "events": events}
                return None
        else:
            _capture(st, s, [flip] + floor_n)
            steals += _take_stack(st, s, month(flip), events)
    return _finish_turn(st, s, steals, events)


def choose_flip_card(st, s, target):
    """뒤집은 패가 바닥 두 장과 맞을 때 먹을 패를 고른다."""
    _check_turn(st, s)
    if st["phase"] != "choose_flip":
        raise ValueError("선택할 패가 없습니다.")
    pending = st["pending"]
    try:
        target = int(target)
    except (TypeError, ValueError):
        target = None
    if target not in pending["options"]:
        raise ValueError("잘못된 선택입니다.")
    st["phase"] = "play"
    st["pending"] = None
    _capture(st, s, [pending["card"], target])
    return _finish_turn(st, s, pending["steals"], pending["events"])


def _finish_turn(st, s, steals, events):
    last = not any(st["hands"]) and not any(st["bombs"])
    if not st["floor"] and not last:
        steals += 1
        events.append("쓸")
    _steal_pi(st, s, steals)
    st["events"] = events
    score = best_score(st["captured"][s])
    if score >= MATGO_WIN_SCORE and score > st["go_score"][s]:
        if last:
            st["phase"] = "over"
            return {"winner": s, "reason": "stop"}
        st["phase"] = "go_stop"
        return None
    if last:
        st["phase"] = "over"
        return {"winner": None, "reason": "nagari"}
    st["phase"] = "play"
    st["turn"] = 1 - s
    return None


def declare_go_stop(st, s, go):
    _check_turn(st, s)
    if st["phase"] != "go_stop":
        raise ValueError("고/스톱을 선택할 때가 아닙니다.")
    if not go:
        st["phase"] = "over"
        return {"winner": s, "reason": "stop"}
    st["go"][s] += 1
    st["go_score"][s] = best_score(st["captured"][s])
    st["events"] = [f"{st['go'][s]}고"]
    st["phase"] = "play"
    st["turn"] = 1 - s
    return None


def auto_act(st, s):
    """시간초과 시 대신 둔다: 바닥과 맞는 패 우선, 고/스톱은 스톱."""
    if st["phase"] == "go_stop":
        return declare_go_stop(st, s, False)
    if st["phase"] == "choose_flip":
        return choose_flip_card(st, s, _best_of(st["pending"]["options"]))
    hand = st["hands"][s]
    if not hand:
        return play_card(st, s, "bomb")
    floor_months = {month(c) for c in st["floor"]}
    card = next((c for c in hand if month(c) in floor_months), hand[0])
    floor_m = [c for c in st["floor"] if month(c) == month(card)]
    return play_card(st, s, card, target=_best_of(floor_m) if floor_m else None)


# ── 방 / 칩 (DB) ─────────────────────────────────────────────────────────────

def _user_room(user, lock=False):
    qs = MatgoRoom.objects.filter(Q(host=user) | Q(guest=user))
    if lock:
        qs = qs.select_for_update(of=("self",))
    return qs.first()


def _side_of(room, user_id):
    if room.host_id == user_id:
        return 0
    if room.guest_id == user_id:
        return 1
    return None


def _take_buy_in(user):
    wallet = PokerChipWallet.objects.select_for_update().filter(user=user).first()
    if not wallet or wallet.chips < MATGO_BUY_IN:
        return False
    wallet.chips -= MATGO_BUY_IN
    wallet.save(update_fields=["chips"])
    return True


def _refund(user_id, chips):
    if chips <= 0:
        return
    wallet, _ = PokerChipWallet.objects.select_for_update().get_or_create(user_id=user_id)
    wallet.chips += chips
    wallet.save(update_fields=["chips"])


def _need_buy_in_msg():
    return f"칩 지갑에 {MATGO_BUY_IN:,}칩({MATGO_BUY_IN // POKER_CHIPS_PER_LEAF}낙엽)이 있어야 입장할 수 있습니다."


def create_room(user):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)  # 같은 유저의 동시 입장 직렬화
        if _user_room(user):
            return False, "이미 참여 중인 방이 있습니다."
        if not _take_buy_in(user):
            return False, _need_buy_in_msg()
        room = MatgoRoom.objects.create(host=user, host_stack=MATGO_BUY_IN)
    return True, room.id


def join_room(user, room_id):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if _user_room(user):
            return False, "이미 참여 중인 방이 있습니다."
        room = MatgoRoom.objects.select_for_update().filter(pk=room_id).first()
        if not room or not room.host_id or room.guest_id:
            return False, "입장할 수 없는 방입니다."
        if not _take_buy_in(user):
            return False, _need_buy_in_msg()
        room.guest = user
        room.guest_stack = MATGO_BUY_IN
        room.next_first = random.randint(0, 1)
        room.carry_multiplier = 1
        room.next_game_at = timezone.now() + timedelta(seconds=MATGO_START_DELAY)
        room.save()
    return True, room.id


def _remove_player(room, side):
    """스택을 지갑으로 돌려주고 자리를 비운다. 방장이 나가면 상대가 방장이 된다."""
    stacks = [room.host_stack, room.guest_stack]
    ids = [room.host_id, room.guest_id]
    _refund(ids[side], stacks[side])
    ids[side], stacks[side] = None, 0
    if ids[0] is None:
        ids, stacks = [ids[1], None], [stacks[1], 0]
    if ids[0] is None:
        room.delete()
        return
    room.host_id, room.guest_id = ids
    room.host_stack, room.guest_stack = stacks[0], stacks[1] or 0
    room.status = "waiting"
    room.state = {}
    room.turn_deadline = None
    room.next_game_at = None
    room.carry_multiplier = 1
    room.save()


def leave_room(user):
    """퇴장. 판 진행 중이면 기권 처리(상대 승리) 후 나간다."""
    with transaction.atomic():
        room = _user_room(user, lock=True)
        if not room:
            return False, "참여 중인 방이 없습니다."
        side = _side_of(room, user.id)
        if room.status == "playing":
            _end_game(room, {"winner": 1 - side, "reason": "forfeit"})
        _remove_player(room, side)
    return True, None


def _players(room):
    return [room.host, room.guest]


def _end_game(room, outcome):
    st = room.state
    st["phase"] = "over"
    players = _players(room)
    now = timezone.now()
    if outcome["winner"] is None:
        room.carry_multiplier = min(room.carry_multiplier * 2, 64)
        room.last_result = {"nagari": True, "carry": room.carry_multiplier}
        MatgoGameLog.objects.create(room_number=room.pk, detail={"reason": "nagari"})
    else:
        w = outcome["winner"]
        points, detail = settle(st, w, outcome["reason"])
        points *= room.carry_multiplier
        detail["carry"] = room.carry_multiplier
        stacks = [room.host_stack, room.guest_stack]
        chips = min(points * MATGO_CHIPS_PER_POINT, stacks[1 - w])
        stacks[w] += chips
        stacks[1 - w] -= chips
        room.host_stack, room.guest_stack = stacks
        room.carry_multiplier = 1
        room.next_first = w
        room.last_result = {
            "nagari": False, "winner_side": w,
            "winner_name": players[w].display_name, "loser_name": players[1 - w].display_name,
            "points": points, "chips": chips, **detail,
        }
        MatgoGameLog.objects.create(
            room_number=room.pk, winner=players[w], loser=players[1 - w],
            points=points, chips=chips, detail=detail,
        )
    room.status = "waiting"
    room.turn_deadline = None
    room.next_game_at = now + timedelta(seconds=MATGO_NEXT_GAME_DELAY)
    room.state = st
    room.save()


def _start_game(room):
    # 칩을 다 잃은 사람은 다음 판 전에 내보낸다 (다시 입장하면 새로 바이인)
    for side, stack in ((1, room.guest_stack), (0, room.host_stack)):
        if stack == 0:
            _remove_player(room, side)
            return
    st, outcome = new_game(room.next_first)
    room.state = st
    room.status = "playing"
    room.next_game_at = None
    room.last_result = {}
    room.turn_deadline = timezone.now() + timedelta(seconds=MATGO_TURN_TIMEOUT)
    room.save()
    if outcome:
        _end_game(room, outcome)


def _act(user, fn):
    with transaction.atomic():
        room = _user_room(user, lock=True)
        if not room or room.status != "playing":
            return False, "진행 중인 판이 없습니다."
        side = _side_of(room, user.id)
        st = room.state
        try:
            outcome = fn(st, side)
        except ValueError as e:
            return False, str(e)
        st["timeouts"][side] = 0
        room.state = st
        if outcome:
            _end_game(room, outcome)
        else:
            room.turn_deadline = timezone.now() + timedelta(seconds=MATGO_TURN_TIMEOUT)
            room.save()
    return True, None


def play(user, card, target=None, mode=None):
    return _act(user, lambda st, s: play_card(st, s, card, target, mode))


def choose_flip(user, target):
    return _act(user, lambda st, s: choose_flip_card(st, s, target))


def declare(user, go):
    return _act(user, lambda st, s: declare_go_stop(st, s, bool(go)))


# ── 워치독 ───────────────────────────────────────────────────────────────────

def next_deadline_at():
    agg = MatgoRoom.objects.aggregate(
        turn=Min("turn_deadline", filter=Q(status="playing")),
        nxt=Min("next_game_at", filter=Q(status="waiting")),
    )
    candidates = [d for d in agg.values() if d]
    return min(candidates) if candidates else None


def process_due_deadlines():
    now = timezone.now()
    due_ids = list(MatgoRoom.objects.filter(
        Q(status="playing", turn_deadline__lte=now) | Q(status="waiting", next_game_at__lte=now)
    ).values_list("id", flat=True))
    for room_id in due_ids:
        with transaction.atomic():
            room = MatgoRoom.objects.select_for_update().filter(pk=room_id).first()
            if not room:
                continue
            if room.status == "playing" and room.turn_deadline and room.turn_deadline <= now:
                st = room.state
                side = st["turn"]
                st["timeouts"][side] += 1
                if st["timeouts"][side] >= MATGO_MAX_TIMEOUTS:
                    _end_game(room, {"winner": 1 - side, "reason": "forfeit"})
                    _remove_player(room, side)
                    continue
                outcome = auto_act(st, side)
                room.state = st
                if outcome:
                    _end_game(room, outcome)
                else:
                    room.turn_deadline = now + timedelta(seconds=MATGO_TURN_TIMEOUT)
                    room.save()
            elif room.status == "waiting" and room.next_game_at and room.next_game_at <= now:
                if room.host_id and room.guest_id:
                    _start_game(room)
                else:
                    room.next_game_at = None
                    room.save(update_fields=["next_game_at"])
    return bool(due_ids)


# ── 상태 스냅샷 ───────────────────────────────────────────────────────────────

def _player_view(u):
    if not u:
        return None
    return {"user_id": u.id, "display_name": u.display_name, "picture": u.get_picture()}


def _game_view(room, st, me):
    opp = 1 - me
    now = timezone.now()
    turn_left = None
    if room.status == "playing" and room.turn_deadline:
        turn_left = max(0, round((room.turn_deadline - now).total_seconds()))
    over = st.get("phase") == "over"
    pending = st.get("pending")
    return {
        "phase": st["phase"],
        "my_turn": st["turn"] == me and not over,
        "floor": st["floor"],
        "pile_count": len(st["pile"]),
        "my_hand": st["hands"][me],
        "my_bombs": st["bombs"][me],
        # 판이 끝나면 상대 손패도 공개
        "opp_hand": st["hands"][opp] if over else None,
        "opp_hand_count": len(st["hands"][opp]) + st["bombs"][opp],
        "captured": [st["captured"][me], st["captured"][opp]],
        "scores": [best_score(st["captured"][me]), best_score(st["captured"][opp])],
        "go": [st["go"][me], st["go"][opp]],
        "shakes": [st["shakes"][me], st["shakes"][opp]],
        "ppeok": [st["ppeok"][me], st["ppeok"][opp]],
        "shaken": st["shaken"][me],
        "pending_options": pending["options"] if pending and st["turn"] == me else None,
        "pending_card": pending["card"] if pending else None,
        "events": st["events"],
        "last_play": dict(st["last_play"], mine=st["last_play"]["side"] == me) if st.get("last_play") else None,
        "turn_seconds_left": turn_left,
    }


def get_state_for(user):
    rooms = list(MatgoRoom.objects.select_related("host", "guest").order_by("created_at"))
    my_room = next((r for r in rooms if user.id in (r.host_id, r.guest_id)), None)
    wallet = PokerChipWallet.objects.filter(user_id=user.id).values_list("chips", flat=True).first()
    # ponytail: WS 스코프의 user.leaves는 연결 시점 값이라 매번 DB에서 읽는다 (포커와 동일)
    my_leaves = User.objects.filter(id=user.id).values_list("leaves", flat=True).first()

    room_view = None
    if my_room:
        me = _side_of(my_room, user.id)
        players = _players(my_room)
        stacks = [my_room.host_stack, my_room.guest_stack]
        next_left = None
        if my_room.next_game_at:
            next_left = max(0, round((my_room.next_game_at - timezone.now()).total_seconds()))
        last = dict(my_room.last_result)
        if "winner_side" in last:
            last["i_won"] = last["winner_side"] == me
        room_view = {
            "id": my_room.id,
            "status": my_room.status,
            "me": _player_view(players[me]),
            "opp": _player_view(players[1 - me]),
            "my_stack": stacks[me],
            "opp_stack": stacks[1 - me],
            "carry_multiplier": my_room.carry_multiplier,
            "next_game_seconds_left": next_left,
            "last_result": last,
            "game": _game_view(my_room, my_room.state, me) if my_room.state else None,
        }

    return {
        "type": "state",
        "rooms": [
            {"id": r.id, "status": r.status, "host": _player_view(r.host), "guest": _player_view(r.guest)}
            for r in rooms
        ],
        "room": room_view,
        "wallet_chips": wallet or 0,
        "my_leaves": my_leaves,
        "buy_in": MATGO_BUY_IN,
        "chips_per_point": MATGO_CHIPS_PER_POINT,
        "chips_per_leaf": POKER_CHIPS_PER_LEAF,
    }
