import asyncio
import json
import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.db import close_old_connections
from django.utils import timezone

from . import matgo_engine, poker_engine

logger = logging.getLogger(__name__)

LOBBY_GROUP = "lobby_chat"
MAX_MESSAGE_LENGTH = 300  # 메시지 최대 길이 (글자)
SPAM_COOLDOWN_SECONDS = 1.0  # 스팸 방지 쿨타임 (초)

# 실시간 접속자 목록. 로비 채팅 소켓은 놀이터의 모든 게임 페이지가 연결하므로
# 이 소켓 연결 = 놀이터 접속으로 본다. 목록은 ?presence=1 로 연결한 페이지(접속자
# 탭이 있는 페이지)에만 보낸다 — 다른 페이지의 채팅 스크립트는 presence 메시지를
# 모르므로 채팅 메시지로 잘못 그리게 된다.
# ponytail: 프로세스 메모리 dict — 단일 daphne 프로세스 전제(포커 워치독과 동일).
# 멀티 워커로 확장하면 Redis 등 공유 저장소로 옮겨야 한다.
PRESENCE_GROUP = "lobby_presence"
_online_users = {}  # user_id -> {"user_id", "display_name", "picture_url", "count"}


def _presence_payload():
    users = sorted(
        ({k: v for k, v in u.items() if k != "count"} for u in _online_users.values()),
        key=lambda u: u["display_name"].lower(),
    )
    return json.dumps({"type": "presence", "users": users}, ensure_ascii=False)


class LobbyChatConsumer(AsyncWebsocketConsumer):
    """
    게임 로비 실시간 채팅 WebSocket 컨슈머.
    - 로그인한 사용자만 연결을 허용합니다.
    - 모든 연결된 클라이언트는 동일한 그룹(lobby_chat)에 속합니다.
    - 수신된 메시지는 DB에 저장되고 그룹 전체에 브로드캐스트됩니다.
    - 스팸 방지 기능이 포함되어 있어 쿨타임을 초과하는 경우 에러 피드백을 전송합니다.
    """

    async def connect(self):
        # 미로그인 사용자는 WebSocket 연결 거부
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        self.last_sent_time = 0.0
        await self.channel_layer.group_add(LOBBY_GROUP, self.channel_name)
        await self.accept()

        user = self.scope["user"]
        info = await self._get_user_chat_info(user)
        entry = _online_users.get(user.id)
        is_new_user = entry is None
        if is_new_user:
            entry = _online_users[user.id] = {"user_id": user.id, **info, "count": 0}
        entry["count"] += 1  # 같은 유저가 탭을 여러 개 열어도 한 명으로 센다
        self.presence_counted = True

        if b"presence=1" in self.scope.get("query_string", b""):
            await self.channel_layer.group_add(PRESENCE_GROUP, self.channel_name)
            if not is_new_user:  # 새 유저면 아래 브로드캐스트로 받는다
                await self.send(text_data=_presence_payload())
        if is_new_user:
            await self.channel_layer.group_send(PRESENCE_GROUP, {"type": "presence_update"})

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(LOBBY_GROUP, self.channel_name)
        await self.channel_layer.group_discard(PRESENCE_GROUP, self.channel_name)
        if not getattr(self, "presence_counted", False):
            return
        user_id = self.scope["user"].id
        entry = _online_users.get(user_id)
        if entry:
            entry["count"] -= 1
            if entry["count"] <= 0:
                del _online_users[user_id]
                await self.channel_layer.group_send(PRESENCE_GROUP, {"type": "presence_update"})

    async def presence_update(self, event):
        await self.send(text_data=_presence_payload())

    async def receive(self, text_data):
        """클라이언트로부터 메시지 수신 → DB 저장 → 그룹 브로드캐스트"""
        # 스팸 방지 검사
        current_time = time.time()
        if current_time - self.last_sent_time < SPAM_COOLDOWN_SECONDS:
            # 쿨타임 위반 시 경고 메시지 전달
            await self.send(
                text_data=json.dumps(
                    {
                        "error": "spam_blocked",
                        "message": "메시지 전송이 너무 빠릅니다. 잠시 후 다시 시도해주세요.",
                    },
                    ensure_ascii=False,
                )
            )
            return

        try:
            data = json.loads(text_data)
            message = data.get("message", "").strip()
        except (json.JSONDecodeError, KeyError):
            return

        if not message or len(message) > MAX_MESSAGE_LENGTH:
            return

        user = self.scope["user"]
        self.last_sent_time = current_time

        # DB 저장 (비동기 래퍼 사용)
        saved = await self._save_message(user, message)
        chat_info = await self._get_user_chat_info(user)

        # 그룹 전체에 브로드캐스트
        await self.channel_layer.group_send(
            LOBBY_GROUP,
            {
                "type": "chat_message",
                "message": message,
                "username": user.username,
                "display_name": chat_info["display_name"],
                "picture_url": chat_info["picture_url"],
                "created_at": saved.created_at.strftime("%H:%M"),
            },
        )

    async def chat_message(self, event):
        """그룹 이벤트 수신 → 연결된 클라이언트로 JSON 전송"""
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "username": event["username"],
                    "display_name": event["display_name"],
                    "picture_url": event["picture_url"],
                    "created_at": event["created_at"],
                },
                ensure_ascii=False,
            )
        )

    @database_sync_to_async
    def _save_message(self, user, message):
        from .models import LobbyChatMessage
        return LobbyChatMessage.objects.create(user=user, message=message)

    @database_sync_to_async
    def _get_user_chat_info(self, user):
        from accounts.models import User
        try:
            u = User.objects.select_related("student").get(pk=user.pk)
        except Exception:
            return {"display_name": user.username, "picture_url": ""}

        display_name = u.display_chat_name

        picture_url = ""
        try:
            if u.picture and u.picture.name and u.picture.name != "default.png":
                picture_url = u.picture.url
        except Exception:
            pass

        return {"display_name": display_name, "picture_url": picture_url}


# ── 포커 ──────────────────────────────────────────────────────────────────────

POKER_GROUP = "poker_table"

# ponytail: 단일 daphne 프로세스(entrypoint.sh에 -N 없음) 전제로, 워치독을
# 프로세스당 asyncio 태스크 1개만 돌린다. 멀티 워커로 확장하면 Celery beat 등
# 프로세스 독립적인 스케줄러로 옮겨야 한다.
_watchdog_task = None

# 워치독 루프 한 틱에서 예기치 못한 예외가 나면 그 자리에서 태스크 전체가
# 조용히 죽어버려서(아무 로그도 안 남고), 누군가 다시 메시지를 보내
# _ensure_poker_watchdog()를 트리거하기 전까지 턴 진행/다음 핸드 시작이
# 영원히 멈추는 사고가 있었다 — 예외를 로그로 남기고 삼킨 뒤 이 시간(초)
# 후 같은 루프에서 다시 시도한다.
POKER_WATCHDOG_ERROR_RETRY_SECONDS = 2

# 연결이 끊긴 뒤에도 이 시간(초) 안에 재접속하면 자리를 그대로 유지한다.
# (새로고침·짧은 네트워크 끊김 등은 흔하고, 클라이언트도 5초 후 자동 재접속을
# 시도하므로 그보다 넉넉하게 잡는다.) 그보다 오래 끊겨 있으면 자리에서
# 일어난 것으로 간주해 stand_up()을 그대로 재사용한다 — 핸드 진행 중이면
# stand_up() 자체가 즉시 비우지 않고 핸드 종료 후 퇴장을 예약하므로 안전하다.
POKER_DISCONNECT_GRACE_SECONDS = 20
_disconnect_grace_tasks = {}  # user_id -> asyncio.Task


async def _broadcast_poker_state():
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        await channel_layer.group_send(POKER_GROUP, {"type": "broadcast_state"})


def _ensure_poker_watchdog():
    global _watchdog_task
    if _watchdog_task is None or _watchdog_task.done():
        _watchdog_task = asyncio.create_task(_poker_watchdog_loop())


def _cancel_disconnect_grace(user_id):
    """재접속에 성공했으니 예약된 자동 퇴장을 취소한다."""
    task = _disconnect_grace_tasks.pop(user_id, None)
    if task and not task.done():
        task.cancel()


async def _schedule_disconnect_grace(user):
    """연결이 끊긴 유저를 유예 시간 뒤에도 재접속하지 않으면 자리에서 내보낸다.
    (같은 유저가 여러 탭을 열어둔 경우는 드문 예외로 두고 신경 쓰지 않는다.)"""
    try:
        await asyncio.sleep(POKER_DISCONNECT_GRACE_SECONDS)
        ok, _ = await database_sync_to_async(poker_engine.stand_up)(user)
        if ok:
            await _broadcast_poker_state()
    except asyncio.CancelledError:
        pass
    finally:
        _disconnect_grace_tasks.pop(user.id, None)


async def _poker_watchdog_loop():
    """턴 제한시간 / 다음 핸드 시작 시각을 감시하다가 처리한다.
    마감시각이 바뀔 수 있으므로 최대 2초마다 다시 확인한다."""
    global _watchdog_task
    try:
        while True:
            try:
                deadline = await database_sync_to_async(poker_engine.next_deadline_at)()
                if deadline is None:
                    return
                wait = (deadline - timezone.now()).total_seconds()
                if wait > 0:
                    await asyncio.sleep(min(wait, 2))
                    continue
                await database_sync_to_async(poker_engine.process_due_deadlines)()
                await _broadcast_poker_state()
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("poker watchdog tick failed, retrying")
                # 백그라운드 태스크라 일반 요청 사이클(request_started 시그널)을
                # 안 타서, DB 연결이 죽은 채로 남아있으면 재시도해도 매번 같은
                # 예외로 영원히 실패한다 — 죽은 연결을 강제로 버리고 다음 시도
                # 때 새로 연결하게 한다.
                await database_sync_to_async(close_old_connections)()
                await asyncio.sleep(POKER_WATCHDOG_ERROR_RETRY_SECONDS)
    finally:
        _watchdog_task = None


class PokerConsumer(AsyncWebsocketConsumer):
    """포커 테이블(고정 1개) 실시간 WebSocket 컨슈머.
    - 좌석마다 다른 정보(홀카드)가 보이므로 상태는 브로드캐스트 신호만 그룹으로
      보내고, 각 연결이 자기 시점으로 get_state_for()를 다시 만들어 전송한다.
    """

    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return
        _cancel_disconnect_grace(self.scope["user"].id)
        await self.channel_layer.group_add(POKER_GROUP, self.channel_name)
        await self.accept()
        _ensure_poker_watchdog()
        await self._send_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(POKER_GROUP, self.channel_name)
        user = self.scope.get("user")
        if user and user.is_authenticated and user.id not in _disconnect_grace_tasks:
            _disconnect_grace_tasks[user.id] = asyncio.create_task(_schedule_disconnect_grace(user))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        user = self.scope["user"]
        msg_type = data.get("type")

        # ponytail: 워치독은 단일 asyncio 태스크라 재기동(dev autoreload 등)으로
        # 죽으면 실제 게임 액션이 있어야만 다시 살아났다. 하트비트(__ping__)를
        # 포함해 모든 메시지에서 재기동을 시도해 다음 핸드/턴 마감이 방치되지
        # 않도록 한다.
        _ensure_poker_watchdog()

        if msg_type == "__ping__":
            # 클라이언트가 하트비트 응답으로 연결 생존을 확인한다 — 배포 등으로
            # 서버 컨테이너가 TCP FIN 없이 죽으면 브라우저는 소켓이 여전히
            # 열려있다고 착각해(readyState OPEN) 재접속을 시도하지 않는 "좀비
            # 연결"이 생긴다. pong이 계속 안 오면 클라이언트가 직접 끊고
            # 재접속하도록 신호를 준다.
            await self.send(text_data=json.dumps({"type": "pong"}))
            return

        if msg_type == "sit":
            handler = lambda: poker_engine.sit_down(user, data.get("seat_number"))
        elif msg_type == "stand":
            handler = lambda: poker_engine.stand_up(user)
        elif msg_type == "action":
            handler = lambda: poker_engine.player_action(user, data.get("action"), data.get("amount", 0))
        elif msg_type == "buy_chips":
            handler = lambda: poker_engine.buy_chips(user, data.get("leaves", 0))
        elif msg_type == "cash_out_chips":
            handler = lambda: poker_engine.cash_out_chips(user, data.get("chips", 0))
        elif msg_type == "emoji":
            handler = lambda: poker_engine.send_emoji(user, data.get("emoji"))
        else:
            return

        try:
            ok, result = await database_sync_to_async(handler)()
        except Exception:
            # ponytail: 여기서 잡지 않으면 예외가 그대로 올라가 소켓이 로그 한 줄 없이
            # 끊기고, 클라이언트는 5초 후 재접속만 반복해 "포커만 계속 안 됨"처럼 보인다.
            # 어떤 액션이 터졌는지 서버 로그에 남기고, 클라이언트에는 에러로 알려준다.
            logger.exception("poker action failed: type=%s user=%s", msg_type, getattr(user, "id", None))
            await database_sync_to_async(close_old_connections)()
            await self.send(text_data=json.dumps(
                {"type": "error", "message": "처리 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요."},
                ensure_ascii=False,
            ))
            return
        if not ok:
            await self.send(text_data=json.dumps({"type": "error", "message": result}, ensure_ascii=False))
        elif msg_type == "emoji":
            await self.channel_layer.group_send(
                POKER_GROUP, {"type": "emoji_broadcast", "seat_number": result, "emoji": data.get("emoji")}
            )
        else:
            await _broadcast_poker_state()

    async def broadcast_state(self, event):
        await self._send_state()

    async def emoji_broadcast(self, event):
        await self.send(text_data=json.dumps(
            {"type": "emoji_reaction", "seat_number": event["seat_number"], "emoji": event["emoji"]},
            ensure_ascii=False,
        ))

    async def _send_state(self):
        state = await database_sync_to_async(poker_engine.get_state_for)(self.scope["user"])
        await self.send(text_data=json.dumps(state, ensure_ascii=False))



# ─────────────────────────────────────────────────────────────────────────────
# 맞고 — 방 목록과 내 방 상태를 하나의 소켓/그룹으로 보낸다. 상태가 바뀌면
# 그룹 전체에 신호만 보내고 각 연결이 자기 시점(get_state_for)으로 다시 만든다.
# ponytail: 모든 방 변경이 맞고 페이지 접속자 전원에게 재조회를 일으킨다 —
# 동아리 규모에선 충분, 접속자가 많아지면 방별 그룹 + 목록 그룹으로 나눌 것.
# 워치독/재접속 유예는 포커와 같은 단일 프로세스 asyncio 태스크 방식.
# ─────────────────────────────────────────────────────────────────────────────

MATGO_GROUP = "matgo"
MATGO_DISCONNECT_GRACE_SECONDS = 20
_matgo_watchdog_task = None
_matgo_disconnect_tasks = {}  # user_id -> asyncio.Task


async def _broadcast_matgo_state():
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        await channel_layer.group_send(MATGO_GROUP, {"type": "broadcast_state"})


def _ensure_matgo_watchdog():
    global _matgo_watchdog_task
    if _matgo_watchdog_task is None or _matgo_watchdog_task.done():
        _matgo_watchdog_task = asyncio.create_task(_matgo_watchdog_loop())


async def _matgo_watchdog_loop():
    global _matgo_watchdog_task
    try:
        while True:
            try:
                deadline = await database_sync_to_async(matgo_engine.next_deadline_at)()
                if deadline is None:
                    return
                wait = (deadline - timezone.now()).total_seconds()
                if wait > 0:
                    await asyncio.sleep(min(wait, 2))
                    continue
                await database_sync_to_async(matgo_engine.process_due_deadlines)()
                await _broadcast_matgo_state()
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("matgo watchdog tick failed, retrying")
                await database_sync_to_async(close_old_connections)()
                await asyncio.sleep(POKER_WATCHDOG_ERROR_RETRY_SECONDS)
    finally:
        _matgo_watchdog_task = None


async def _matgo_disconnect_grace(user):
    """유예 시간 안에 재접속하지 않으면 방에서 내보낸다 (진행 중이면 기권)."""
    try:
        await asyncio.sleep(MATGO_DISCONNECT_GRACE_SECONDS)
        ok, _ = await database_sync_to_async(matgo_engine.leave_room)(user)
        if ok:
            await _broadcast_matgo_state()
    except asyncio.CancelledError:
        pass
    finally:
        _matgo_disconnect_tasks.pop(user.id, None)


class MatgoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return
        task = _matgo_disconnect_tasks.pop(user.id, None)
        if task and not task.done():
            task.cancel()
        await self.channel_layer.group_add(MATGO_GROUP, self.channel_name)
        await self.accept()
        _ensure_matgo_watchdog()
        await self._send_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(MATGO_GROUP, self.channel_name)
        user = self.scope.get("user")
        if user and user.is_authenticated and user.id not in _matgo_disconnect_tasks:
            _matgo_disconnect_tasks[user.id] = asyncio.create_task(_matgo_disconnect_grace(user))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return
        user = self.scope["user"]
        msg_type = data.get("type")
        _ensure_matgo_watchdog()

        if msg_type == "__ping__":
            await self.send(text_data=json.dumps({"type": "pong"}))
            return

        handlers = {
            "create": lambda: matgo_engine.create_room(user),
            "join": lambda: matgo_engine.join_room(user, data.get("room_id")),
            "leave": lambda: matgo_engine.leave_room(user),
            "play": lambda: matgo_engine.play(user, data.get("card"), data.get("target"), data.get("mode")),
            "choose": lambda: matgo_engine.choose_flip(user, data.get("target")),
            "go_stop": lambda: matgo_engine.declare(user, data.get("go")),
            "buy_chips": lambda: poker_engine.buy_chips(user, data.get("leaves", 0)),
            "cash_out_chips": lambda: poker_engine.cash_out_chips(user, data.get("chips", 0)),
        }
        handler = handlers.get(msg_type)
        if handler is None:
            return
        try:
            ok, result = await database_sync_to_async(handler)()
        except Exception:
            logger.exception("matgo action failed: type=%s user=%s", msg_type, getattr(user, "id", None))
            await database_sync_to_async(close_old_connections)()
            await self.send(text_data=json.dumps(
                {"type": "error", "message": "처리 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요."},
                ensure_ascii=False,
            ))
            return
        if not ok:
            await self.send(text_data=json.dumps({"type": "error", "message": result}, ensure_ascii=False))
            return
        if msg_type in ("buy_chips", "cash_out_chips"):
            await self._send_state()
        else:
            await _broadcast_matgo_state()

    async def broadcast_state(self, event):
        await self._send_state()

    async def _send_state(self):
        state = await database_sync_to_async(matgo_engine.get_state_for)(self.scope["user"])
        await self.send(text_data=json.dumps(state, ensure_ascii=False))
