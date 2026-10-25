"""장기 방 상태머신 (칩 없이 승패만 기록). 규칙은 game/janggi_rules.py, AI는 game/janggi_ai.py.

흐름: 둘이 모이면 판이 시작된다 → 상차림 단계(각자 마·상 배치 4가지 중 하나를 고른다, 20초, 안 고르면 기본)
→ 초(먼저 두는 쪽)부터 번갈아 둔다. 판마다 초/한을 바꾼다 (첫 판은 무작위).
승패: 상대가 둘 수 있는 수가 없으면(외통수) 승, 기권·시간 초과(한 수 90초)·판 중 퇴장은 패.
무승부: 같은 국면이 세 번 나오거나 400수에 이르면.
랭킹(승 수) 반영 조건 (JanggiMatch.ranked): 사람끼리, 20수 이상, 같은 두 사람이 24시간에 5판까지.

공개 함수: create_room / join_room / leave_room / add_bot / choose_setup / move / resign /
          next_deadline_at / process_due_deadlines / get_state_for
"""
import random
from datetime import timedelta

from django.db import transaction
from django.db.models import Min, Q
from django.utils import timezone

from accounts.models import User
from . import janggi_rules as rules
from .bots import free_bot
from .models import JanggiMatch, JanggiRoom, JanggiSeat

SETUP_TIMEOUT = 20
TURN_TIMEOUT = 90
BOT_STEP = 1
START_DELAY = 3
NEXT_GAME_DELAY = 10
MIN_RANKED_MOVES = 20
PAIR_DAILY_RANKED_CAP = 5
MOVE_CAP = 400
REPETITION_LIMIT = 3
_rng = random.SystemRandom()


def side_of_seat(st, seat):
    return rules.CHO if seat == st["cho"] else rules.HAN


def new_state(cho_seat, bots=()):
    return {"phase": "setup", "cho": cho_seat, "setup": [None, None], "board": None, "turn": cho_seat, "moves": [],
            "last": None, "bots": list(bots), "check": False, "positions": {}}


def _begin_play(st):
    """상차림이 정해지면 판을 만든다 (고르지 않은 쪽은 기본 배치)."""
    cho_idx = st["setup"][st["cho"]] or 0
    han_idx = st["setup"][1 - st["cho"]] or 0
    st["board"] = rules.new_board(cho_idx, han_idx)
    st["phase"] = "play"
    st["turn"] = st["cho"]
    st["positions"] = {rules.position_key(st["board"], st["turn"]): 1}


def apply_move(st, seat, fx, fy, tx, ty):
    """수를 둔다. 판이 끝나면 {"winner": seat|None, "reason"}, 아니면 None. 잘못된 수는 ValueError."""
    if st["phase"] != "play":
        raise ValueError("아직 상차림 단계입니다.")
    if st["turn"] != seat:
        raise ValueError("내 차례가 아닙니다.")
    board = st["board"]
    if not (isinstance(fx, int) and isinstance(fy, int) and isinstance(tx, int) and isinstance(ty, int)) \
            or not (rules.inb(fx, fy) and rules.inb(tx, ty)):
        raise ValueError("판 밖입니다.")
    piece = board[fy][fx]
    side = side_of_seat(st, seat)
    if not piece or rules.side_of(piece) != side:
        raise ValueError("내 말이 아닙니다.")
    if (tx, ty) not in rules.legal_moves_for(board, fx, fy):
        raise ValueError("둘 수 없는 수입니다 (장군을 받게 되거나 규칙에 맞지 않습니다).")
    st["board"], captured = rules.apply_move(board, fx, fy, tx, ty)
    st["moves"].append([fx, fy, tx, ty, captured])
    st["last"] = [fx, fy, tx, ty]
    opp = 1 - side
    st["check"] = rules.in_check(st["board"], opp)
    if not rules.all_legal_moves(st["board"], opp):
        return {"winner": seat, "reason": "checkmate" if st["check"] else "stalemate"}
    st["turn"] = 1 - seat
    key = rules.position_key(st["board"], st["turn"])
    st["positions"][key] = st["positions"].get(key, 0) + 1
    if st["positions"][key] >= REPETITION_LIMIT or len(st["moves"]) >= MOVE_CAP:
        return {"winner": None, "reason": "draw"}
    return None


# ── 방 ────────────────────────────────────────────────────────────────────────

def _seats(room):
    return list(JanggiSeat.objects.select_for_update(of=("self",)).filter(room=room).select_related("user").order_by("seat"))


def _lock_my_room(user):
    seat = JanggiSeat.objects.filter(user=user).first()
    if not seat:
        return None, None
    room = JanggiRoom.objects.select_for_update().filter(pk=seat.room_id).first()
    seat = JanggiSeat.objects.select_for_update().filter(pk=seat.pk).select_related("user").first()
    if not room or not seat:
        return None, None
    return room, seat


def create_room(user):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if JanggiSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        room = JanggiRoom.objects.create()
        JanggiSeat.objects.create(room=room, user=user, seat=0)
    return True, room.id


def _schedule_if_full(room):
    if JanggiSeat.objects.filter(room=room).count() == 2 and room.status == "waiting":
        room.next_game_at = timezone.now() + timedelta(seconds=START_DELAY)
        room.save()


def join_room(user, room_id):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if JanggiSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        room = JanggiRoom.objects.select_for_update().filter(pk=room_id).first()
        if not room:
            return False, "입장할 수 없는 방입니다."
        count = JanggiSeat.objects.filter(room=room).count()
        if count >= 2:
            bot = JanggiSeat.objects.filter(room=room, user__is_bot=True).select_related("user").first()
            if not bot:
                return False, "방이 가득 찼습니다."
            if room.status == "playing":
                return False, "AI와 대국 중입니다. 판이 끝난 뒤 다시 입장해주세요."
            _remove_seat(room, bot)
            count -= 1
        JanggiSeat.objects.create(room=room, user=user, seat=count)
        _schedule_if_full(room)
    return True, room.id


def add_bot(user):
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room:
            return False, "참여 중인 방이 없습니다."
        if room.status != "waiting":
            return False, "대기 중일 때만 AI를 부를 수 있습니다."
        if JanggiSeat.objects.filter(room=room).count() >= 2:
            return False, "빈자리가 없습니다."
        JanggiSeat.objects.create(room=room, user=free_bot(), seat=1)
        _schedule_if_full(room)
    return True, None


def _remove_seat(room, seat):
    removed = seat.seat
    seat.delete()
    for s in JanggiSeat.objects.filter(room=room, seat__gt=removed).order_by("seat"):
        s.seat -= 1
        s.save(update_fields=["seat"])
    if not JanggiSeat.objects.filter(room=room, user__is_bot=False).exists():
        JanggiSeat.objects.filter(room=room).delete()
        room.delete()
        return False
    room.status = "waiting"
    room.state = {}
    room.turn_deadline = None
    room.next_game_at = None
    room.save()
    return True


def leave_room(user, away=False):
    """퇴장. 판 중이면 기권패로 처리한 뒤 나간다."""
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room:
            return False, "참여 중인 방이 없습니다."
        if room.status == "playing":
            _end_game(room, winner=1 - seat.seat, reason="leave")
            seat = JanggiSeat.objects.select_for_update().filter(pk=seat.pk).select_related("user").first()
        if seat:
            _remove_seat(room, seat)
    return True, None


# ── 판 진행 ───────────────────────────────────────────────────────────────────

def _deadline(st, now=None):
    now = now or timezone.now()
    if st["phase"] == "setup":
        return now + timedelta(seconds=SETUP_TIMEOUT)
    return now + timedelta(seconds=BOT_STEP if st["turn"] in st["bots"] else TURN_TIMEOUT)


def _start_game(room):
    seats = _seats(room)
    if len(seats) < 2:
        room.next_game_at = None
        room.save(update_fields=["next_game_at"])
        return
    nxt = (room.last_result or {}).get("next_cho")
    cho = nxt if nxt in (0, 1) else _rng.choice([0, 1])
    st = new_state(cho, [s.seat for s in seats if s.user.is_bot])
    for side in st["bots"]:                           # AI는 상차림을 바로 무작위로 고른다
        st["setup"][side] = _rng.randrange(len(rules.SETUPS))
    if all(c is not None for c in st["setup"]):
        _begin_play(st)
    room.state = st
    room.status = "playing"
    room.next_game_at = None
    room.last_result = {}
    room.turn_deadline = _deadline(st)
    room.save()


def _ranked(cho_user, han_user, moves, winner_user):
    if cho_user.is_bot or han_user.is_bot or moves < MIN_RANKED_MOVES or winner_user is None:
        return False
    since = timezone.now() - timedelta(hours=24)
    repeats = JanggiMatch.objects.filter(ranked=True, ended_at__gte=since).filter(
        Q(cho=cho_user, han=han_user) | Q(cho=han_user, han=cho_user)).count()
    return repeats < PAIR_DAILY_RANKED_CAP


def _end_game(room, winner, reason):
    """winner: 이긴 쪽 seat (무승부면 None)."""
    st = room.state
    seats = _seats(room)
    by_seat = {s.seat: s.user for s in seats}
    cho_user, han_user = by_seat[st["cho"]], by_seat[1 - st["cho"]]
    winner_user = by_seat.get(winner) if winner is not None else None
    moves = len(st.get("moves", []))
    ranked = _ranked(cho_user, han_user, moves, winner_user)
    JanggiMatch.objects.create(cho=cho_user, han=han_user, winner=winner_user, reason=reason, moves=moves,
                               ranked=ranked, vs_bot=cho_user.is_bot or han_user.is_bot)
    room.last_result = {
        "winner_seat": winner, "winner": winner_user.display_name if winner_user else None, "reason": reason,
        "moves": moves, "ranked": ranked, "next_cho": 1 - st["cho"], "cho": st["cho"],
        "board": st.get("board"), "last": st.get("last"),
    }
    room.state = {}
    room.status = "waiting"
    room.turn_deadline = None
    room.next_game_at = timezone.now() + timedelta(seconds=NEXT_GAME_DELAY)
    room.save()


def _finish_or_continue(room, st, outcome):
    room.state = st
    if outcome:
        _end_game(room, outcome["winner"], outcome["reason"])
    else:
        room.turn_deadline = _deadline(st)
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
        if isinstance(outcome, dict) and outcome.get("end"):
            _end_game(room, outcome["winner"], outcome["reason"])
        else:
            _finish_or_continue(room, st, outcome)
    return True, None


def move(user, fx, fy, tx, ty):
    def do(st, seat):
        try:
            args = [int(v) for v in (fx, fy, tx, ty)]
        except (TypeError, ValueError):
            raise ValueError("잘못된 위치입니다.")
        return apply_move(st, seat, *args)
    return _act(user, do)


def choose_setup(user, index):
    def do(st, seat):
        if st["phase"] != "setup":
            raise ValueError("상차림은 판이 시작될 때만 고를 수 있습니다.")
        try:
            idx = int(index)
        except (TypeError, ValueError):
            raise ValueError("잘못된 상차림입니다.")
        if not 0 <= idx < len(rules.SETUPS):
            raise ValueError("잘못된 상차림입니다.")
        st["setup"][seat] = idx
        if all(c is not None for c in st["setup"]):
            _begin_play(st)
        return None
    return _act(user, do)


def resign(user):
    return _act(user, lambda st, seat: {"end": True, "winner": 1 - seat, "reason": "resign"})


# ── 워치독 ───────────────────────────────────────────────────────────────────

def next_deadline_at():
    agg = JanggiRoom.objects.aggregate(
        turn=Min("turn_deadline", filter=Q(status="playing")),
        nxt=Min("next_game_at", filter=Q(status="waiting")),
    )
    candidates = [d for d in agg.values() if d]
    return min(candidates) if candidates else None


def process_due_deadlines():
    from . import janggi_ai
    now = timezone.now()
    due_ids = list(JanggiRoom.objects.filter(
        Q(status="playing", turn_deadline__lte=now) | Q(status="waiting", next_game_at__lte=now)
    ).values_list("id", flat=True))
    for room_id in due_ids:
        with transaction.atomic():
            room = JanggiRoom.objects.select_for_update().filter(pk=room_id).first()
            if not room:
                continue
            if room.status == "playing" and room.turn_deadline and room.turn_deadline <= now:
                st = room.state
                if st["phase"] == "setup":                       # 상차림을 못 고른 사람은 기본 배치
                    for i, c in enumerate(st["setup"]):
                        if c is None:
                            st["setup"][i] = 0
                    _begin_play(st)
                    _finish_or_continue(room, st, None)
                elif st["turn"] in st["bots"]:
                    side = side_of_seat(st, st["turn"])
                    choice = janggi_ai.choose_move(st["board"], side)
                    outcome = apply_move(st, st["turn"], *choice) if choice else {"winner": 1 - st["turn"], "reason": "stalemate"}
                    _finish_or_continue(room, st, outcome)
                else:                                            # 사람이 제한시간 안에 두지 못함 → 시간 초과 패
                    _end_game(room, winner=1 - st["turn"], reason="timeout")
            elif room.status == "waiting" and room.next_game_at and room.next_game_at <= now:
                _start_game(room)
    return bool(due_ids)


# ── 상태 스냅샷 ───────────────────────────────────────────────────────────────

def _player_view(u):
    return {"user_id": u.id, "display_name": u.display_name, "picture": u.get_picture(), "is_bot": u.is_bot}


def record_of(user_id):
    wins = JanggiMatch.objects.filter(ranked=True, winner_id=user_id).count()
    games = JanggiMatch.objects.filter(ranked=True).filter(Q(cho_id=user_id) | Q(han_id=user_id)).count()
    return {"wins": wins, "losses": max(0, games - wins), "games": games}


def _captured(st):
    """지금까지 잡힌 말: {"cho": [한이 잡은 초의 말], "han": [...]} (표시용)."""
    out = {"c": [], "h": []}
    for m in st["moves"]:
        if m[4]:
            out[m[4][0]].append(m[4][1])
    return out


def get_state_for(user):
    rooms = list(JanggiRoom.objects.prefetch_related("seats__user").order_by("created_at"))
    my_seat = JanggiSeat.objects.filter(user_id=user.id).first()
    my_room = next((r for r in rooms if my_seat and r.id == my_seat.room_id), None)
    room_view = None
    if my_room:
        seats = sorted(my_room.seats.all(), key=lambda s: s.seat)
        st = my_room.state or {}
        game = None
        if st:
            turn_left = None
            if my_room.status == "playing" and my_room.turn_deadline:
                turn_left = max(0, round((my_room.turn_deadline - timezone.now()).total_seconds()))
            my_turn = my_room.status == "playing" and st["phase"] == "play" and st["turn"] == my_seat.seat
            legal = {}
            if my_turn:
                side = side_of_seat(st, my_seat.seat)
                legal = {f"{x},{y}": [list(t) for t in targets]
                         for (x, y), targets in rules.all_legal_moves(st["board"], side).items()}
            game = {
                "phase": st["phase"], "cho": st["cho"], "turn": st["turn"], "board": st["board"], "last": st["last"],
                "check": st["check"], "my_turn": my_turn, "legal": legal, "moves": len(st["moves"]),
                "turn_seconds_left": turn_left, "setups": rules.SETUPS,
                "my_setup": st["setup"][my_seat.seat], "opponent_ready": st["setup"][1 - my_seat.seat] is not None,
                "captured": _captured(st) if st["phase"] == "play" else {"c": [], "h": []},
            }
        next_left = None
        if my_room.next_game_at:
            next_left = max(0, round((my_room.next_game_at - timezone.now()).total_seconds()))
        room_view = {
            "id": my_room.id, "status": my_room.status, "me": my_seat.seat,
            "seats": [dict(_player_view(s.user), side=s.seat) for s in seats],
            "next_game_seconds_left": next_left, "last_result": my_room.last_result or {}, "game": game,
        }
    return {
        "type": "state",
        "rooms": [{
            "id": r.id, "status": r.status,
            "players": [_player_view(s.user) for s in sorted(r.seats.all(), key=lambda s: s.seat)],
        } for r in rooms],
        "room": room_view,
        "record": record_of(user.id),
    }
