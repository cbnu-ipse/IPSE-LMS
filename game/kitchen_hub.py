"""분식 대작전의 방 관리와 게임 시계 (Daphne 한 프로세스 안의 메모리). 게임 규칙은 kitchen_engine.

방과 진행 상황은 DB에 저장하지 않는다 (서버가 다시 시작되면 사라지고, 한 판이 3분이라 괜찮다).
시계는 방이 하나라도 진행 중일 때만 돈다. 상태는 방 그룹으로 보내 같은 방 사람들의 화면에 함께 그려진다.
"""
import asyncio
import logging
import random
import time

from channels.layers import get_channel_layer

from . import kitchen_engine as engine

logger = logging.getLogger(__name__)

TICK_SECONDS = 0.2
ABANDONED_ROOM_KEEP_SECONDS = 30     # 모두 나간 방을 남겨 두는 시간 (새로고침 복귀용)
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"      # 헷갈리는 글자(I, O, 0, 1)는 뺀다

ROOMS = {}          # 방 코드 → engine.Room
USER_ROOM = {}      # 사용자 id → 방 코드
_loop_task = None


def group_name(code):
    return f"kitchen_{code}"


def _new_code():
    for _ in range(100):
        code = "".join(random.choices(CODE_ALPHABET, k=4))
        if code not in ROOMS:
            return code
    raise RuntimeError("방 코드를 만들 수 없습니다.")


def room_of(uid):
    return ROOMS.get(USER_ROOM.get(uid))


def create_room(uid, name):
    leave(uid)
    room = engine.Room(_new_code(), uid)
    room.add_player(uid, name)
    ROOMS[room.code] = room
    USER_ROOM[uid] = room.code
    return True, room


def join_room(uid, name, code):
    code = str(code or "").strip().upper()
    room = ROOMS.get(code)
    if room is None:
        return False, "그 코드의 방이 없어요. 코드를 다시 확인해 주세요."
    if USER_ROOM.get(uid) != code:
        ok, message = room.add_player(uid, name)
        if not ok:
            return False, message
        leave(uid)
        USER_ROOM[uid] = code
    else:
        room.players[uid].connected = True
    room.idle_since = None
    return True, room


def leave(uid):
    """방을 떠난다 (진행 중이어도 캐릭터를 치운다). 방에 아무도 없으면 방도 지운다."""
    code = USER_ROOM.pop(uid, None)
    room = ROOMS.get(code)
    if room is None:
        return None
    room.remove_player(uid)
    if not room.players:
        ROOMS.pop(code, None)
    return room


def disconnect(uid):
    """연결이 끊겼다. 대기실이면 바로 나간 것으로, 진행 중이면 캐릭터는 남기고 접속만 끊김으로 표시한다."""
    room = room_of(uid)
    if room is None:
        return None
    if room.phase == "lobby":
        return leave(uid) or room
    player = room.players.get(uid)
    if player is not None:
        player.connected, player.dx, player.dy, player.chopping = False, 0, 0, False
    if not any(p.connected for p in room.players.values()):
        room.idle_since = time.monotonic()
    return room


async def broadcast(room, events=()):
    state = room.snapshot()
    state["events"] = list(events)
    await get_channel_layer().group_send(group_name(room.code), {"type": "kitchen.state", "state": state})


def ensure_loop():
    global _loop_task
    if _loop_task is None or _loop_task.done():
        _loop_task = asyncio.get_running_loop().create_task(_run())


async def _run():
    last = time.monotonic()
    while True:
        await asyncio.sleep(TICK_SECONDS)
        now = time.monotonic()
        dt, last = min(now - last, 0.5), now
        for room in list(ROOMS.values()):
            try:
                if room.phase == "playing":
                    await broadcast(room, room.step(dt))
                _forget_if_stale(room, now)
            except Exception:
                logger.exception("kitchen tick failed: room=%s", room.code)
        if not ROOMS:
            return


def _forget_if_stale(room, now):
    if room.idle_since is not None and now - room.idle_since > ABANDONED_ROOM_KEEP_SECONDS:
        for uid in list(room.players):
            if USER_ROOM.get(uid) == room.code:
                USER_ROOM.pop(uid, None)
        ROOMS.pop(room.code, None)
