import asyncio
import json
import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.db import close_old_connections
from django.utils import timezone

from . import poker_engine

logger = logging.getLogger(__name__)

LOBBY_GROUP = "lobby_chat"
MAX_MESSAGE_LENGTH = 300  # 메시지 최대 길이 (글자)
SPAM_COOLDOWN_SECONDS = 1.0  # 스팸 방지 쿨타임 (초)


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

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(LOBBY_GROUP, self.channel_name)

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

        ok, result = await database_sync_to_async(handler)()
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

