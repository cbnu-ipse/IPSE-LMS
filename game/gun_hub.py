"""총게임: 방 관리, 게임 시계, 상태 방송 (Daphne 한 프로세스 안의 메모리). 규칙은 gun_world (untitled_hub와 같은 구조, 방은 따로 둔다).

방은 DB에 저장하지 않는다 (서버가 다시 시작되면 사라진다). 위치는 화면이 보내고 서버가 검증한다.
0.1초마다 방마다 규칙을 한 번 돌리고(구매·라운드·승패), 바뀐 것이 있으면 일어난 일과 함께 방 그룹으로 보낸다.
"""
import asyncio
import logging
import time
from collections import deque

from channels.layers import get_channel_layer

from . import gun_world as world

logger = logging.getLogger(__name__)

TICK_SECONDS = 0.1
ABANDONED_ROOM_KEEP_SECONDS = 30     # 모두 나간 방을 남겨 두는 시간 (새로고침 복귀용)

ROOMS = {}          # 방 코드 → world.Room
USER_ROOM = {}      # 사용자 id → 방 코드
SOCKETS = {}        # 사용자 id → 지금 열려 있는 연결(채널 이름)들: 재접속하면 옛 연결이 늦게 닫혀도 새 연결을 오프라인으로 만들지 않는다
_recent = deque(maxlen=100)     # 최근 시계 100번(약 10초)의 (늦은 정도, 처리 시간) — 핑이 튈 때 서버 탓인지 가리는 데 쓴다
_loop_task = None


def group_name(code):
    return f"gun_{code}"


def room_of(uid):
    return ROOMS.get(USER_ROOM.get(uid))


def create_room(uid, name, room_name="", private=False, map_key=None):
    leave(uid)
    room = world.GunRoom(world.new_code(ROOMS), uid, room_name or f"{name}의 방", private, map_key or world.base.DEFAULT_MAP)
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
    if not room.humans():                                   # 사람이 아무도 없으면 봇만 남은 방도 지운다
        ROOMS.pop(code, None)
    return room


def list_rooms():
    """열린 방 목록 (비공개 방은 빼고, 사람이 있는 방만)."""
    rooms = [r.summary() for r in ROOMS.values() if not r.private and r.humans()]
    return sorted(rooms, key=lambda r: (r["phase"] != "lobby", -r["players"], r["name"]))


def attach(uid, channel):
    """새 연결이 열렸다."""
    SOCKETS.setdefault(uid, set()).add(channel)


def disconnect(uid, channel=None):
    """연결이 끊겼다. 같은 사람의 다른 연결이 아직 살아 있으면(재접속 직후 옛 연결이 늦게 닫힌 경우) 그대로 둔다.
    캐릭터는 잠시 남겨 두고(새로고침 복귀), 모두 끊기면 방을 정리할 시계를 건다."""
    socks = SOCKETS.get(uid)
    if socks is not None:
        socks.discard(channel)
        if socks:
            return room_of(uid)
        SOCKETS.pop(uid, None)
    room = room_of(uid)
    if room is None:
        return None
    player = room.players.get(uid)
    if player is not None:
        player.connected = False
        player.moving = False
        room.dirty = True
    if not any(p.connected for p in room.humans()):
        room.idle_since = time.monotonic()
    return room


def stats():
    """서버가 최근 10초 동안 얼마나 막혔는지(ms): lag은 시계가 제때 안 돈 정도(이벤트 루프가 막힌 시간), work는 한 번에 방들을 돌린 시간."""
    if not _recent:
        return {"lag": 0, "work": 0, "rooms": len(ROOMS)}
    return {"lag": round(max(l for l, _ in _recent) * 1000), "work": round(max(w for _, w in _recent) * 1000), "rooms": len(ROOMS)}


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
    last = time.monotonic()
    while ROOMS:
        await asyncio.sleep(TICK_SECONDS)
        now = time.monotonic()
        lag, last = max(0.0, now - last - TICK_SECONDS), now
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
                logger.exception("gun tick failed: room=%s", room.code)
        work = time.monotonic() - now
        _recent.append((lag, work))
        if lag > 0.5 or work > 0.3:
            logger.warning("gun tick slow: lag=%.0fms work=%.0fms rooms=%d", lag * 1000, work * 1000, len(ROOMS))
