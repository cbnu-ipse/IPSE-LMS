"""
고스톱 규칙 엔진 + 방 상태머신. 방마다 맞고(2인) 또는 고스톱(3인) 모드.

앞부분은 DB와 무관한 순수 규칙 함수(state dict를 직접 변경), 뒷부분은 방/칩을
다루는 DB 함수다. 판 진행 상태는 GostopRoom.state 하나에 JSON으로 저장한다.
모든 DB 상태 변경은 `transaction.atomic()` + 방 행 `select_for_update()`로 방 단위로 잠근다.

카드는 0~47 정수 id. month = id // 4 + 1, 월 안에서의 종류는 CARDS 표를 따른다.
플레이어는 side(= 좌석 번호, 0이 방장)로 부르고, state의 리스트 필드는 side로 인덱싱한다.
차례는 side 0 → 1 → 2 → 0 순서로 돈다.

규칙 요약:
    - 맞고: 손패 10장, 바닥 8장, 7점 나기, 피박은 패자 피 7장 이하.
      고스톱(3인): 손패 7장, 바닥 6장, 3점 나기, 피박은 패자 피 5장 이하.
      바닥에 같은 월 4장이 깔리면 다시 섞는다.
    - 1·2고 +1·+2점, 3고부터 (점수+고 횟수) × 2^(고-2).
    - 피박·광박·멍박(승자 열끗 7장 이상)은 패자별로, 흔들기·폭탄은 승자 기준으로 각 ×2.
    - 고박: 고를 불렀던 사람이 지면 다른 패자 몫까지 혼자 낸다 (3인에서만 의미 있음).
    - 뻑/따닥/쪽/쓸/뻑 먹기(자뻑은 2장)/폭탄 시 다른 모든 사람에게서 피를 가져온다.
    - 총통(손패 같은 월 4장)·3뻑은 즉시 10점 승리. 나가리는 다음 판 ×2 누적.
    - 국진(9월 열끗)은 열끗/쌍피 중 유리한 쪽을 자동 선택한다.

공개 함수(뷰/컨슈머에서 호출):
    create_room(user, mode) / join_room(user, room_id) / leave_room(user)
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
    GostopRoom, GostopSeat, GostopGameLog, PokerChipWallet,
    GOSTOP_BUY_IN, GOSTOP_CHIPS_PER_POINT, POKER_CHIPS_PER_LEAF,
)

GOSTOP_TURN_TIMEOUT = 20       # 턴(또는 고/스톱, 뒤집은 패 선택)당 제한시간(초)
GOSTOP_MAX_TIMEOUTS = 3        # 연속 시간초과 이 횟수면 기권 처리 후 퇴장
GOSTOP_START_DELAY = 3         # 인원이 다 차고 첫 판 시작까지(초)
GOSTOP_NEXT_GAME_DELAY = 8     # 판 종료 후 결과를 보여주고 다음 판까지(초)
GOSTOP_MEONGBAK_MIN = 7        # 승자 열끗이 이 장수 이상이면 멍박
GOSTOP_SPECIAL_WIN_POINTS = 10  # 총통·3뻑 즉시 승리 점수

MODES = {
    "matgo": {"label": "맞고", "players": 2, "hand": 10, "floor": 8, "win_score": 7, "pibak_max": 7},
    "gostop": {"label": "고스톱", "players": 3, "hand": 7, "floor": 6, "win_score": 3, "pibak_max": 5},
}


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


def _pay(st, w, l, w_opt, l_opt):
    """승자 w가 패자 l에게서 받을 점수(나가리 배수 제외)와 적용된 박."""
    sc = score_breakdown(st["captured"][w], w_opt)
    lsc = score_breakdown(st["captured"][l], l_opt)
    go = st["go"][w]
    pts = sc["total"] + go
    if go >= 3:
        pts *= 2 ** (go - 2)
    baks = []
    if sc["pi_pts"] > 0 and lsc["pi_count"] <= st["pibak_max"]:
        baks.append("피박")
    if sc["gwang_pts"] > 0 and lsc["gwang_count"] == 0:
        baks.append("광박")
    if sc["yeol_count"] >= GOSTOP_MEONGBAK_MIN:
        baks.append("멍박")
    return pts * 2 ** (len(baks) + st["shakes"][w]), baks


def _best_pays(st, w, losers):
    """승자는 자기에게 유리한 국진 선택, 각 패자는 그 선택에 대해 가장 적게 내는 선택."""
    def for_option(w_opt):
        return {l: min((_pay(st, w, l, w_opt, l_opt) for l_opt in (False, True)), key=lambda r: r[0]) for l in losers}
    return max((for_option(o) for o in (False, True)), key=lambda d: sum(p for p, _ in d.values()))


def settle(st, winner, reason):
    """승리 시 지불 목록 [{side, points, baks, gobak}]과 공통 내역. 점수에 나가리 배수는 제외."""
    n = len(st["hands"])
    losers = [l for l in range(n) if l != winner]
    if reason in ("chongtong", "3ppeok"):
        pays = {l: (GOSTOP_SPECIAL_WIN_POINTS, []) for l in losers}
        detail = {"reason": reason}
    else:
        pays = _best_pays(st, winner, losers)
        detail = {
            "reason": reason, "base": best_score(st["captured"][winner]),
            "go": st["go"][winner], "shakes": st["shakes"][winner],
        }
    payments = [{"side": l, "points": pays[l][0], "baks": pays[l][1], "gobak": False} for l in losers]
    goers = [l for l in losers if st["go"][l] > 0]
    if goers and len(losers) > 1 and reason == "stop":
        payer = st.get("last_go") if st.get("last_go") in goers else goers[0]
        total = sum(p["points"] for p in payments)
        for p in payments:
            p["points"], p["gobak"] = (total, True) if p["side"] == payer else (0, False)
    return payments, detail


def forfeit_payments(st, forfeiter):
    """기권: 기권자 혼자, 남은 사람 각자에게 그 시점에 났다고 치고(최소 난 점수) 낸다."""
    n = len(st["hands"])
    result = []
    for w in range(n):
        if w == forfeiter:
            continue
        pts, baks = _best_pays(st, w, [forfeiter])[forfeiter]
        result.append({"side": w, "points": max(pts, st["win_score"]), "baks": baks})
    return result


# ── 판 진행 (순수 함수: state dict를 직접 변경) ───────────────────────────────

def new_game(mode, first, rng=random):
    """(state, outcome) 반환. outcome은 총통이면 승리 dict, 아니면 None."""
    cfg = MODES[mode]
    n, h, f = cfg["players"], cfg["hand"], cfg["floor"]
    while True:
        deck = list(range(48))
        rng.shuffle(deck)
        floor = deck[n * h:n * h + f]
        if all(sum(1 for c in floor if month(c) == m) < 4 for m in range(1, 13)):
            break
    st = {
        "win_score": cfg["win_score"],
        "pibak_max": cfg["pibak_max"],
        "hands": [sorted(deck[i * h:(i + 1) * h]) for i in range(n)],
        "floor": floor,
        "pile": deck[n * h + f:],
        "captured": [[] for _ in range(n)],
        "bombs": [0] * n,
        "turn": first,
        "phase": "play",
        "pending": None,
        "go": [0] * n,
        "go_score": [0] * n,
        "last_go": None,
        "shakes": [0] * n,
        "shaken": [[] for _ in range(n)],
        "ppeok": [0] * n,
        "ppeok_months": {},
        "timeouts": [0] * n,
        "events": [],
        "last_play": None,
    }
    for i in range(n):
        side = (first + i) % n
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
    """다른 모든 사람에게서 피를 n장씩 가져온다 (없으면 쌍피, 그것도 없으면 못 가져옴)."""
    for other in range(len(st["hands"])):
        if other == s:
            continue
        opp = st["captured"][other]
        for _ in range(n):
            victim = next((c for c in opp if CARDS[c]["k"] == "p"), None)
            if victim is None:
                victim = next((c for c in opp if CARDS[c]["k"] == "pp"), None)
            if victim is None:
                break
            opp.remove(victim)
            st["captured"][s].append(victim)


def _take_stack(st, s, m, events):
    """바닥에 3장 쌓인 월을 4번째 패로 먹을 때 — 뻑이었으면 피를 가져온다."""
    owner = st["ppeok_months"].pop(str(m), None)
    if owner is None:
        return 0
    events.append("자뻑" if owner == s else "뻑 먹기")
    return 2 if owner == s else 1


def _check_turn(st, s):
    if st["phase"] not in ("play", "choose_flip", "go_stop"):
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
    if score >= st["win_score"] and score > st["go_score"][s]:
        if last:
            st["phase"] = "over"
            return {"winner": s, "reason": "stop"}
        st["phase"] = "go_stop"
        return None
    if last:
        st["phase"] = "over"
        return {"winner": None, "reason": "nagari"}
    st["phase"] = "play"
    st["turn"] = (s + 1) % len(st["hands"])
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
    st["last_go"] = s
    st["events"] = [f"{st['go'][s]}고"]
    st["phase"] = "play"
    st["turn"] = (s + 1) % len(st["hands"])
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

def _capacity(room):
    return MODES[room.mode]["players"]


def _seats(room):
    return list(GostopSeat.objects.select_for_update(of=("self",)).filter(room=room).select_related("user").order_by("seat"))


def _lock_my_room(user):
    """(room, seat) — 방 행을 먼저 잠그고 좌석을 다시 읽는다. 없으면 (None, None)."""
    seat = GostopSeat.objects.filter(user=user).first()
    if not seat:
        return None, None
    room = GostopRoom.objects.select_for_update().filter(pk=seat.room_id).first()
    seat = GostopSeat.objects.select_for_update().filter(pk=seat.pk).first()
    if not room or not seat:
        return None, None
    return room, seat


def _take_buy_in(user):
    wallet = PokerChipWallet.objects.select_for_update().filter(user=user).first()
    if not wallet or wallet.chips < GOSTOP_BUY_IN:
        return False
    wallet.chips -= GOSTOP_BUY_IN
    wallet.save(update_fields=["chips"])
    return True


def _refund(user_id, chips):
    if chips <= 0:
        return
    wallet, _ = PokerChipWallet.objects.select_for_update().get_or_create(user_id=user_id)
    wallet.chips += chips
    wallet.save(update_fields=["chips"])


def _need_buy_in_msg():
    return f"칩 지갑에 {GOSTOP_BUY_IN:,}칩({GOSTOP_BUY_IN // POKER_CHIPS_PER_LEAF}낙엽)이 있어야 입장할 수 있습니다."


def create_room(user, mode):
    if mode not in MODES:
        return False, "잘못된 게임 종류입니다."
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)  # 같은 유저의 동시 입장 직렬화
        if GostopSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        if not _take_buy_in(user):
            return False, _need_buy_in_msg()
        room = GostopRoom.objects.create(mode=mode)
        GostopSeat.objects.create(room=room, user=user, seat=0, stack=GOSTOP_BUY_IN)
    return True, room.id


def join_room(user, room_id):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if GostopSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        room = GostopRoom.objects.select_for_update().filter(pk=room_id).first()
        if not room:
            return False, "입장할 수 없는 방입니다."
        count = GostopSeat.objects.filter(room=room).count()
        if count >= _capacity(room):
            return False, "방이 가득 찼습니다."
        if not _take_buy_in(user):
            return False, _need_buy_in_msg()
        GostopSeat.objects.create(room=room, user=user, seat=count, stack=GOSTOP_BUY_IN)
        if count + 1 == _capacity(room):
            room.next_first = random.randrange(_capacity(room))
            room.carry_multiplier = 1
            room.next_game_at = timezone.now() + timedelta(seconds=GOSTOP_START_DELAY)
            room.save()
    return True, room.id


def _remove_seat(room, seat):
    """스택을 지갑으로 돌려주고 좌석을 비운 뒤 번호를 앞으로 당긴다. 방이 비면 삭제하고 False."""
    _refund(seat.user_id, seat.stack)
    removed = seat.seat
    seat.delete()
    # 오름차순으로 한 칸씩 당기면 unique(room, seat) 충돌이 없다
    for s in GostopSeat.objects.filter(room=room, seat__gt=removed).order_by("seat"):
        s.seat -= 1
        s.save(update_fields=["seat"])
    if not GostopSeat.objects.filter(room=room).exists():
        room.delete()
        return False
    room.status = "waiting"
    room.state = {}
    room.turn_deadline = None
    room.next_game_at = None
    room.carry_multiplier = 1
    room.next_first = 0
    room.save()
    return True


def leave_room(user):
    """퇴장. 판 진행 중이면 기권 처리 후 나간다."""
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room:
            return False, "참여 중인 방이 없습니다."
        if room.status == "playing":
            _end_game(room, {"forfeit": seat.seat})
            seat.refresh_from_db()
        _remove_seat(room, seat)
    return True, None


def _end_game(room, outcome):
    st = room.state
    st["phase"] = "over"
    seats = _seats(room)
    names = [s.user.display_name for s in seats]
    carry = room.carry_multiplier
    now = timezone.now()

    if outcome.get("winner") is None and "forfeit" not in outcome:
        room.carry_multiplier = min(carry * 2, 64)
        room.last_result = {"nagari": True, "carry": room.carry_multiplier}
        GostopGameLog.objects.create(room_number=room.pk, mode=room.mode, detail={"reason": "nagari"})
    else:
        if "forfeit" in outcome:
            f = outcome["forfeit"]
            transfers = [(f, p["side"], p["points"] * carry, p["baks"], False) for p in forfeit_payments(st, f)]
            detail = {"reason": "forfeit", "forfeit_side": f, "forfeit_name": names[f]}
            winner = transfers[0][1] if len(transfers) == 1 else None  # 3인 기권은 받는 사람이 둘이라 기록상 승자 없음
        else:
            winner = outcome["winner"]
            payments, detail = settle(st, winner, outcome["reason"])
            transfers = [(p["side"], winner, p["points"] * carry, p["baks"], p["gobak"]) for p in payments]
            detail.update(winner_side=winner, winner_name=names[winner])
            room.next_first = winner
        rows = []
        for payer, receiver, points, baks, gobak in transfers:
            chips = min(points * GOSTOP_CHIPS_PER_POINT, seats[payer].stack)
            seats[payer].stack -= chips
            seats[receiver].stack += chips
            rows.append({
                "from_side": payer, "from_name": names[payer], "to_side": receiver, "to_name": names[receiver],
                "points": points, "chips": chips, "baks": baks, "gobak": gobak,
            })
        for s in seats:
            s.save(update_fields=["stack"])
        room.carry_multiplier = 1
        room.last_result = dict(detail, nagari=False, carry=carry, transfers=rows)
        GostopGameLog.objects.create(
            room_number=room.pk, mode=room.mode, winner=seats[winner].user if winner is not None else None,
            chips=sum(r["chips"] for r in rows), detail=room.last_result,
        )
    room.status = "waiting"
    room.turn_deadline = None
    room.next_game_at = now + timedelta(seconds=GOSTOP_NEXT_GAME_DELAY)
    room.state = st
    room.save()


def _start_game(room):
    # 칩을 다 잃은 사람은 다음 판 전에 내보낸다 (다시 입장하면 새로 바이인)
    while True:
        busted = GostopSeat.objects.select_for_update().filter(room=room, stack=0).first()
        if not busted:
            break
        if not _remove_seat(room, busted):
            return
    seats = _seats(room)
    if len(seats) < _capacity(room):
        room.next_game_at = None
        room.save(update_fields=["next_game_at"])
        return
    st, outcome = new_game(room.mode, room.next_first % len(seats))
    room.state = st
    room.status = "playing"
    room.next_game_at = None
    room.last_result = {}
    room.turn_deadline = timezone.now() + timedelta(seconds=GOSTOP_TURN_TIMEOUT)
    room.save()
    if outcome:
        _end_game(room, outcome)


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
        room.state = st
        if outcome:
            _end_game(room, outcome)
        else:
            room.turn_deadline = timezone.now() + timedelta(seconds=GOSTOP_TURN_TIMEOUT)
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
    agg = GostopRoom.objects.aggregate(
        turn=Min("turn_deadline", filter=Q(status="playing")),
        nxt=Min("next_game_at", filter=Q(status="waiting")),
    )
    candidates = [d for d in agg.values() if d]
    return min(candidates) if candidates else None


def process_due_deadlines():
    now = timezone.now()
    due_ids = list(GostopRoom.objects.filter(
        Q(status="playing", turn_deadline__lte=now) | Q(status="waiting", next_game_at__lte=now)
    ).values_list("id", flat=True))
    for room_id in due_ids:
        with transaction.atomic():
            room = GostopRoom.objects.select_for_update().filter(pk=room_id).first()
            if not room:
                continue
            if room.status == "playing" and room.turn_deadline and room.turn_deadline <= now:
                st = room.state
                side = st["turn"]
                st["timeouts"][side] += 1
                if st["timeouts"][side] >= GOSTOP_MAX_TIMEOUTS:
                    _end_game(room, {"forfeit": side})
                    _remove_seat(room, GostopSeat.objects.select_for_update().get(room=room, seat=side))
                    continue
                outcome = auto_act(st, side)
                room.state = st
                if outcome:
                    _end_game(room, outcome)
                else:
                    room.turn_deadline = now + timedelta(seconds=GOSTOP_TURN_TIMEOUT)
                    room.save()
            elif room.status == "waiting" and room.next_game_at and room.next_game_at <= now:
                _start_game(room)
    return bool(due_ids)


# ── 상태 스냅샷 ───────────────────────────────────────────────────────────────

def _player_view(u):
    return {"user_id": u.id, "display_name": u.display_name, "picture": u.get_picture()}


def _game_view(room, st, me):
    now = timezone.now()
    turn_left = None
    if room.status == "playing" and room.turn_deadline:
        turn_left = max(0, round((room.turn_deadline - now).total_seconds()))
    over = st.get("phase") == "over"
    pending = st.get("pending")
    mine = st["turn"] == me
    return {
        "phase": st["phase"],
        "turn": st["turn"],
        "my_turn": mine and not over,
        "win_score": st["win_score"],
        "floor": st["floor"],
        "pile_count": len(st["pile"]),
        "my_hand": st["hands"][me],
        "my_bombs": st["bombs"][me],
        # 판이 끝나면 모두의 손패 공개
        "hands": st["hands"] if over else None,
        "hand_counts": [len(h) + b for h, b in zip(st["hands"], st["bombs"])],
        "captured": st["captured"],
        "scores": [best_score(c) for c in st["captured"]],
        "go": st["go"],
        "shakes": st["shakes"],
        "ppeok": st["ppeok"],
        "shaken": st["shaken"][me],
        "pending_options": pending["options"] if pending and mine else None,
        "pending_card": pending["card"] if pending else None,
        "events": st["events"],
        "last_play": st["last_play"],
        "turn_seconds_left": turn_left,
    }


def get_state_for(user):
    rooms = list(GostopRoom.objects.prefetch_related("seats__user").order_by("created_at"))
    my_seat = GostopSeat.objects.filter(user_id=user.id).first()
    wallet = PokerChipWallet.objects.filter(user_id=user.id).values_list("chips", flat=True).first()
    # ponytail: WS 스코프의 user.leaves는 연결 시점 값이라 매번 DB에서 읽는다 (포커와 동일)
    my_leaves = User.objects.filter(id=user.id).values_list("leaves", flat=True).first()

    room_view = None
    my_room = next((r for r in rooms if my_seat and r.id == my_seat.room_id), None)
    if my_room:
        me = my_seat.seat
        seats = sorted(my_room.seats.all(), key=lambda s: s.seat)
        next_left = None
        if my_room.next_game_at:
            next_left = max(0, round((my_room.next_game_at - timezone.now()).total_seconds()))
        last = dict(my_room.last_result)
        if last.get("transfers") is not None:
            last["my_net"] = sum(
                t["chips"] if t["to_side"] == me else -t["chips"] if t["from_side"] == me else 0
                for t in last["transfers"]
            )
        room_view = {
            "id": my_room.id,
            "mode": my_room.mode,
            "mode_label": MODES[my_room.mode]["label"],
            "capacity": _capacity(my_room),
            "status": my_room.status,
            "me": me,
            "seats": [dict(_player_view(s.user), side=s.seat, stack=s.stack) for s in seats],
            "carry_multiplier": my_room.carry_multiplier,
            "next_game_seconds_left": next_left,
            "last_result": last,
            "game": _game_view(my_room, my_room.state, me) if my_room.state else None,
        }

    return {
        "type": "state",
        "rooms": [
            {
                "id": r.id, "mode": r.mode, "mode_label": MODES[r.mode]["label"],
                "capacity": _capacity(r), "status": r.status,
                "players": [_player_view(s.user) for s in sorted(r.seats.all(), key=lambda s: s.seat)],
            }
            for r in rooms
        ],
        "room": room_view,
        "wallet_chips": wallet or 0,
        "my_leaves": my_leaves,
        "buy_in": GOSTOP_BUY_IN,
        "chips_per_point": GOSTOP_CHIPS_PER_POINT,
        "chips_per_leaf": POKER_CHIPS_PER_LEAF,
    }
