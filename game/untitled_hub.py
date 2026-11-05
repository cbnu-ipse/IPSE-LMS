"""[무제]: 방 관리, 게임 시계, 상태 방송 (Daphne 한 프로세스 안의 메모리). 이동·경찰과 도둑 규칙은 untitled_world.

방은 DB에 저장하지 않는다 (서버가 다시 시작되면 사라진다). 위치는 화면이 보내고 서버가 검증한다.
0.1초마다 방마다 규칙을 한 번 돌리고(잡기·구출·승패), 바뀐 것이 있으면 일어난 일과 함께 방 그룹으로 보낸다.
"""
import asyncio
import logging
import time

from channels.layers import get_channel_layer

from . import untitled_world as world

logger = logging.getLogger(__name__)

TICK_SECONDS = 0.1
ABANDONED_ROOM_KEEP_SECONDS = 30     # 모두 나간 방을 남겨 두는 시간 (새로고침 복귀용)

ROOMS = {}          # 방 코드 → world.Room
USER_ROOM = {}      # 사용자 id → 방 코드
_loop_task = None


def group_name(code):
    return f"untitled_{code}"


def room_of(uid):
    return ROOMS.get(USER_ROOM.get(uid))


def create_room(uid, name):
    leave(uid)
    room = world.Room(world.new_code(ROOMS), uid)
    room.add(uid, name)
    ROOMS[room.code] = room
    USER_ROOM[uid] = room.code
    return room


def join_room(uid, name, code):
    code = str(code or "").strip().upper()
    room = ROOMS.get(code)
    if room is None:
        return False, "그 코드의 방이 없어요. 코드를 다시 확인해 주세요."
    if USER_ROOM.get(uid) != code:
        ok, message = room.add(uid, name)
        if not ok:
            return False, message
        leave(uid)
        USER_ROOM[uid] = code
    else:
        room.players[uid].connected = True
    room.idle_since = None
    room.dirty = True
    return True, room


def leave(uid):
    """방을 떠난다. 방에 아무도 없으면 방도 지운다."""
    code = USER_ROOM.pop(uid, None)
    room = ROOMS.get(code)
    if room is None:
        return None
    room.remove(uid)
    if not room.players:
        ROOMS.pop(code, None)
    return room


def disconnect(uid):
    """연결이 끊겼다. 캐릭터는 잠시 남겨 두고(새로고침 복귀), 모두 끊기면 방을 정리할 시계를 건다."""
    room = room_of(uid)
    if room is None:
        return None
    player = room.players.get(uid)
    if player is not None:
        player.connected = False
        player.moving = False
        room.dirty = True
    if not any(p.connected for p in room.players.values()):
        room.idle_since = time.monotonic()
    return room


async def broadcast(room):
    room.dirty = False
    state = room.snapshot()
    state["events"] = room.take_events()
    await get_channel_layer().group_send(group_name(room.code), {"type": "untitled.state", "state": state})


def ensure_loop():
    global _loop_task
    if _loop_task is None or _loop_task.done():
        _loop_task = asyncio.get_running_loop().create_task(_run())


async def _run():
    while ROOMS:
        await asyncio.sleep(TICK_SECONDS)
        now = time.monotonic()
        for room in list(ROOMS.values()):
            try:
                room.update(now)
                if room.dirty:
                    await broadcast(room)
                if room.idle_since is not None and now - room.idle_since > ABANDONED_ROOM_KEEP_SECONDS:
                    for uid in list(room.players):
                        if USER_ROOM.get(uid) == room.code:
                            USER_ROOM.pop(uid, None)
                    ROOMS.pop(room.code, None)
            except Exception:
                logger.exception("untitled tick failed: room=%s", room.code)
