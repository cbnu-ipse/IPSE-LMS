"""오목 규칙 엔진 + 방 상태머신 (칩 없이 승패만 기록).

규칙: 15×15 판, 흑이 먼저 두고 번갈아 한 수씩. 가로·세로·대각선으로 같은 색 5개 이상(자유룰)을 먼저 이으면 승.
판이 꽉 차면 무승부. 판마다 흑/백을 바꾼다 (첫 판은 무작위).
차례: 60초 안에 두지 않으면 시간 초과 패. 기권하거나 판 중에 나가면 패 (연결이 끊긴 채 유예를 넘겨도 같다).
AI(방장이 부르는 연습 상대)는 game/gomoku_ai.py. AI와의 대국은 기록만 하고 랭킹에는 넣지 않는다.

랭킹(승 수) 집계 조건 (GomokuMatch.ranked): 사람끼리 두었고, 9수 이상 두었고, 같은 두 사람이 24시간 안에 이미
5판 이상 랭킹에 반영하지 않았을 것 — 일부러 져 주거나 일찍 끝내서 승 수를 올리는 것을 막는다.

판 진행 상태는 GomokuRoom.state JSON, 모든 DB 변경은 방 행 select_for_update()로 잠근다.

공개 함수: create_room / join_room / leave_room / add_bot / place / resign /
          next_deadline_at / process_due_deadlines / get_state_for
"""
import random
from datetime import timedelta

from django.db import transaction
from django.db.models import Count, Min, Q
from django.utils import timezone

from accounts.models import User
from .bots import free_bot
from .models import GomokuMatch, GomokuRoom, GomokuSeat

SIZE = 15
TURN_TIMEOUT = 60            # 사람 차례 제한시간(초)
BOT_STEP = 1                 # AI가 한 수 두는 간격(초)
START_DELAY = 3              # 둘이 모이면 판이 시작되기까지(초)
NEXT_GAME_DELAY = 8          # 판이 끝나고 다음 판이 시작되기까지(초)
MIN_RANKED_MOVES = 9         # 이보다 일찍 끝난 판은 랭킹에 넣지 않는다 (5목이 가장 빨리 나는 판이 9수)
PAIR_DAILY_RANKED_CAP = 5    # 같은 두 사람의 랭킹 반영 판 수 상한(24시간)
_rng = random.SystemRandom()
DIRS = ((1, 0), (0, 1), (1, 1), (1, -1))


# ── 규칙 (순수 함수) ──────────────────────────────────────────────────────────

def new_board():
    return [[0] * SIZE for _ in range(SIZE)]


def new_game(black_side, bots=()):
    return {"board": new_board(), "black": black_side, "turn": black_side, "moves": [], "last": None,
            "bots": list(bots), "win_line": None}


def color_of(st, side):
    """흑 = 1, 백 = 2."""
    return 1 if side == st["black"] else 2


def find_five(board, x, y):
    """(x, y)의 돌을 지나는 5개 이상 연속 줄의 칸 목록 (없으면 None)."""
    color = board[y][x]
    if not color:
        return None
    for dx, dy in DIRS:
        line = [(x, y)]
        for sign in (1, -1):
            cx, cy = x + dx * sign, y + dy * sign
            while 0 <= cx < SIZE and 0 <= cy < SIZE and board[cy][cx] == color:
                line.append((cx, cy))
                cx, cy = cx + dx * sign, cy + dy * sign
        if len(line) >= 5:
            return sorted(line)
    return None


def place_stone(st, side, x, y):
    """돌을 둔다. 판이 끝나면 {"winner": side|None, "reason", "line"}, 아니면 None. 잘못된 수는 ValueError."""
    if st["turn"] != side:
        raise ValueError("내 차례가 아닙니다.")
    if not (isinstance(x, int) and isinstance(y, int)) or not (0 <= x < SIZE and 0 <= y < SIZE):
        raise ValueError("판 밖입니다.")
    if st["board"][y][x]:
        raise ValueError("이미 돌이 있는 자리입니다.")
    st["board"][y][x] = color_of(st, side)
    st["moves"].append([x, y, side])
    st["last"] = [x, y]
    line = find_five(st["board"], x, y)
    if line:
        st["win_line"] = [list(c) for c in line]
        return {"winner": side, "reason": "five", "line": st["win_line"]}
    if len(st["moves"]) >= SIZE * SIZE:
        return {"winner": None, "reason": "draw", "line": None}
    st["turn"] = 1 - side
    return None


# ── 방 ────────────────────────────────────────────────────────────────────────

def _seats(room):
    return list(GomokuSeat.objects.select_for_update(of=("self",)).filter(room=room).select_related("user").order_by("seat"))


def _lock_my_room(user):
    seat = GomokuSeat.objects.filter(user=user).first()
    if not seat:
        return None, None
    room = GomokuRoom.objects.select_for_update().filter(pk=seat.room_id).first()
    seat = GomokuSeat.objects.select_for_update().filter(pk=seat.pk).select_related("user").first()
    if not room or not seat:
        return None, None
    return room, seat


def create_room(user):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if GomokuSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        room = GomokuRoom.objects.create()
        GomokuSeat.objects.create(room=room, user=user, seat=0)
    return True, room.id


def _schedule_if_full(room):
    if GomokuSeat.objects.filter(room=room).count() == 2 and room.status == "waiting":
        room.next_game_at = timezone.now() + timedelta(seconds=START_DELAY)
        room.save()


def join_room(user, room_id):
    with transaction.atomic():
        User.objects.select_for_update().get(id=user.id)
        if GomokuSeat.objects.filter(user=user).exists():
            return False, "이미 참여 중인 방이 있습니다."
        room = GomokuRoom.objects.select_for_update().filter(pk=room_id).first()
        if not room:
            return False, "입장할 수 없는 방입니다."
        count = GomokuSeat.objects.filter(room=room).count()
        if count >= 2:
            bot = GomokuSeat.objects.filter(room=room, user__is_bot=True).select_related("user").first()
            if not bot:
                return False, "방이 가득 찼습니다."
            if room.status == "playing":
                return False, "AI와 대국 중입니다. 판이 끝난 뒤 다시 입장해주세요."
            _remove_seat(room, bot)   # 대기 중이면 AI는 사람에게 자리를 비켜준다
            count -= 1
        GomokuSeat.objects.create(room=room, user=user, seat=count)
        _schedule_if_full(room)
    return True, room.id


def add_bot(user):
    """빈자리에 AI를 앉힌다 (연습 상대)."""
    with transaction.atomic():
        room, seat = _lock_my_room(user)
        if not room:
            return False, "참여 중인 방이 없습니다."
        if room.status != "waiting":
            return False, "대기 중일 때만 AI를 부를 수 있습니다."
        if GomokuSeat.objects.filter(room=room).count() >= 2:
            return False, "빈자리가 없습니다."
        GomokuSeat.objects.create(room=room, user=free_bot(), seat=1)
        _schedule_if_full(room)
    return True, None


def _remove_seat(room, seat):
    """좌석을 비운다. 사람이 아무도 없으면 AI도 정리하고 방을 지운 뒤 False."""
    removed = seat.seat
    seat.delete()
    for s in GomokuSeat.objects.filter(room=room, seat__gt=removed).order_by("seat"):
        s.seat -= 1
        s.save(update_fields=["seat"])
    if not GomokuSeat.objects.filter(room=room, user__is_bot=False).exists():
        GomokuSeat.objects.filter(room=room).delete()
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
            seat = GomokuSeat.objects.select_for_update().filter(pk=seat.pk).select_related("user").first()
        if seat:
            _remove_seat(room, seat)
    return True, None


# ── 판 진행 ───────────────────────────────────────────────────────────────────

def _deadline(st, now=None):
    now = now or timezone.now()
    return now + timedelta(seconds=BOT_STEP if st["turn"] in st["bots"] else TURN_TIMEOUT)


def _start_game(room):
    seats = _seats(room)
    if len(seats) < 2:
        room.next_game_at = None
        room.save(update_fields=["next_game_at"])
        return
    nxt = (room.last_result or {}).get("next_black")
    black = nxt if nxt in (0, 1) else _rng.choice([0, 1])
    st = new_game(black, [s.seat for s in seats if s.user.is_bot])
    room.state = st
    room.status = "playing"
    room.next_game_at = None
    room.last_result = {}
    room.turn_deadline = _deadline(st)
    room.save()


def _ranked(black_user, white_user, moves, winner_user):
    """이 판을 랭킹(승 수)에 넣을지. 사람끼리, 충분히 둔 판(9수 이상), 같은 상대와의 반복 상한."""
    if black_user.is_bot or white_user.is_bot or moves < MIN_RANKED_MOVES or winner_user is None:
        return False
    since = timezone.now() - timedelta(hours=24)
    repeats = GomokuMatch.objects.filter(ranked=True, ended_at__gte=since).filter(
        Q(black=black_user, white=white_user) | Q(black=white_user, white=black_user)).count()
    return repeats < PAIR_DAILY_RANKED_CAP


def _end_game(room, winner, reason, line=None):
    """winner: 이긴 쪽 side (무승부면 None). 기록을 남기고 방을 대기 상태로 돌린다."""
    st = room.state
    seats = _seats(room)
    by_side = {s.seat: s.user for s in seats}
    black_user, white_user = by_side[st["black"]], by_side[1 - st["black"]]
    winner_user = by_side.get(winner) if winner is not None else None
    moves = len(st["moves"])
    ranked = _ranked(black_user, white_user, moves, winner_user)
    GomokuMatch.objects.create(
        black=black_user, white=white_user, winner=winner_user, reason=reason, moves=moves, ranked=ranked,
        vs_bot=black_user.is_bot or white_user.is_bot)
    room.last_result = {
        "winner_side": winner, "winner": winner_user.display_name if winner_user else None, "reason": reason,
        "moves": moves, "line": line or st.get("win_line"), "ranked": ranked,
        "next_black": 1 - st["black"], "board": st["board"], "black": st["black"],
    }
    room.state = {}
    room.status = "waiting"
    room.turn_deadline = None
    room.next_game_at = timezone.now() + timedelta(seconds=NEXT_GAME_DELAY)
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
        if outcome and outcome.get("end"):
            _end_game(room, winner=outcome["winner"], reason=outcome["reason"])
        elif outcome:
            room.state = st
            _end_game(room, outcome["winner"], outcome["reason"], outcome.get("line"))
        else:
            room.state = st
            room.turn_deadline = _deadline(st)
            room.save()
    return True, None


def place(user, x, y):
    def move(st, side):
        try:
            x_, y_ = int(x), int(y)
        except (TypeError, ValueError):
            raise ValueError("잘못된 위치입니다.")
        return place_stone(st, side, x_, y_)
    return _act(user, move)


def resign(user):
    return _act(user, lambda st, side: {"end": True, "winner": 1 - side, "reason": "resign"})


# ── 워치독 ───────────────────────────────────────────────────────────────────

def next_deadline_at():
    agg = GomokuRoom.objects.aggregate(
        turn=Min("turn_deadline", filter=Q(status="playing")),
        nxt=Min("next_game_at", filter=Q(status="waiting")),
    )
    candidates = [d for d in agg.values() if d]
    return min(candidates) if candidates else None


def process_due_deadlines():
    from . import gomoku_ai
    now = timezone.now()
    due_ids = list(GomokuRoom.objects.filter(
        Q(status="playing", turn_deadline__lte=now) | Q(status="waiting", next_game_at__lte=now)
    ).values_list("id", flat=True))
    for room_id in due_ids:
        with transaction.atomic():
            room = GomokuRoom.objects.select_for_update().filter(pk=room_id).first()
            if not room:
                continue
            if room.status == "playing" and room.turn_deadline and room.turn_deadline <= now:
                st = room.state
                side = st["turn"]
                if side in st["bots"]:
                    move = gomoku_ai.choose_move(st["board"], color_of(st, side))
                    outcome = place_stone(st, side, *move) if move else {"winner": None, "reason": "draw", "line": None}
                    room.state = st
                    if outcome:
                        _end_game(room, outcome["winner"], outcome["reason"], outcome.get("line"))
                    else:
                        room.turn_deadline = _deadline(st, now)
                        room.save()
                else:                                   # 사람이 제한시간 안에 두지 못함 → 시간 초과 패
                    _end_game(room, winner=1 - side, reason="timeout")
            elif room.status == "waiting" and room.next_game_at and room.next_game_at <= now:
                _start_game(room)
    return bool(due_ids)


# ── 상태 스냅샷 ───────────────────────────────────────────────────────────────

def _player_view(u):
    return {"user_id": u.id, "display_name": u.display_name, "picture": u.get_picture(), "is_bot": u.is_bot}


def record_of(user_id):
    """랭킹에 반영된 내 전적."""
    wins = GomokuMatch.objects.filter(ranked=True, winner_id=user_id).count()
    games = GomokuMatch.objects.filter(ranked=True).filter(Q(black_id=user_id) | Q(white_id=user_id)).count()
    return {"wins": wins, "losses": max(0, games - wins), "games": games}


def get_state_for(user):
    rooms = list(GomokuRoom.objects.prefetch_related("seats__user").order_by("created_at"))
    my_seat = GomokuSeat.objects.filter(user_id=user.id).first()
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
            game = {
                "board": st["board"], "black": st["black"], "turn": st["turn"], "last": st["last"],
                "my_turn": st["turn"] == my_seat.seat and my_room.status == "playing",
                "moves": len(st["moves"]), "turn_seconds_left": turn_left,
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
        "type": "state", "size": SIZE,
        "rooms": [{
            "id": r.id, "status": r.status,
            "players": [_player_view(s.user) for s in sorted(r.seats.all(), key=lambda s: s.seat)],
        } for r in rooms],
        "room": room_view,
        "record": record_of(user.id),
    }
