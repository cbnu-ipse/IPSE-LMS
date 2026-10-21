import asyncio
import json
import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.db import close_old_connections
from django.utils import timezone

from . import gostop_engine, poker_engine, yacht_engine

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
_online_users = {}  # user_id -> {"user_id", "display_name", "picture_url", "count", "pages", "activity"}

# 접속자 목록에서 친구에게 보여 주는 활동. 페이지(?game=)로 어떤 게임 화면인지 알고, 방이 있는 게임(포커·고스톱·요트)은
# 실제로 자리에 앉아 있을 때만 '플레이 중'으로 본다. 아무것도 하지 않거나 방만 둘러보면 '로비'.
LOBBY_LABEL = "로비"
GAME_LABELS = {
    "poker": "포커", "gostop": "고스톱", "yacht": "요트 다이스", "highlow": "하이로우", "apple_game": "마지막 잎새",
    "slot_machine": "학점 캡슐 슬롯머신", "memory_match": "카드 매칭", "number_speed": "넘버 스피드",
    "pattern_recall": "패턴 리콜", "trick_or_treat": "트릭 오어 트릿",
}
ROOM_GAMES = {"poker", "gostop", "yacht"}   # 앉아야 플레이 중 (그 외는 화면을 열고 있으면 플레이 중)
ACTIVITY_REFRESH_SECONDS = 5                # 앉고 일어남을 이 주기로 반영한다
ACTIVITY_MIN_INTERVAL = 3.0                 # 여러 접속이 있어도 DB 조회는 이 간격 이상으로만
FRIEND_REFRESH_TICKS = 12                   # 친구 목록 갱신 주기 (틱 단위 = 약 1분)
_activity_checked = 0.0
_activity_lock = None


def _presence_payload(friend_ids=frozenset()):
    """접속자 목록. 활동(무엇을 하는 중인지)은 친구에게만 보낸다."""
    users = []
    for u in sorted(_online_users.values(), key=lambda u: u["display_name"].lower()):
        item = {k: v for k, v in u.items() if k not in ("count", "pages", "activity")}
        if u["user_id"] in friend_ids:
            item["activity"] = u.get("activity") or LOBBY_LABEL
        users.append(item)
    return json.dumps({"type": "presence", "users": users}, ensure_ascii=False)


def _page_slug(query_string):
    """?game=<slug>. 모르는 값이면 로비로 본다."""
    for part in (query_string or b"").decode("utf-8", "ignore").split("&"):
        key, _, value = part.partition("=")
        if key == "game" and (value in GAME_LABELS):
            return value
    return "lobby"


def _seated_games(user_ids):
    """방에 앉아 있는 사용자 {user_id: 게임 이름} (포커 홀덤/블랙잭, 맞고/고스톱, 요트)."""
    from .models import GostopSeat, PokerSeat, YachtSeat

    seated = {}
    for uid, game_type in (PokerSeat.objects.filter(user_id__in=user_ids)
                           .values_list("user_id", "table__game_type")):
        seated[uid] = "블랙잭" if game_type == "blackjack" else "포커"
    for uid, mode in GostopSeat.objects.filter(user_id__in=user_ids).values_list("user_id", "room__mode"):
        seated[uid] = "맞고" if mode == "matgo" else "고스톱"
    for uid in YachtSeat.objects.filter(user_id__in=user_ids).values_list("user_id", flat=True):
        seated[uid] = "요트 다이스"
    return seated


def _activity_of(entry, seated):
    if seated:
        return seated
    for slug in entry.get("pages", []):          # 앉지 않았으면 열려 있는 아케이드 게임 화면
        if slug in GAME_LABELS and slug not in ROOM_GAMES:
            return GAME_LABELS[slug]
    return LOBBY_LABEL


@database_sync_to_async
def _load_friend_ids(user_id):
    from django.db.models import Q

    from accounts.models import Friendship

    rows = (Friendship.objects.filter(status="accepted").filter(Q(from_user_id=user_id) | Q(to_user_id=user_id))
            .values_list("from_user_id", "to_user_id"))
    return {b if a == user_id else a for a, b in rows}


async def _refresh_activity(force=False):
    """접속자들의 활동을 다시 계산하고 바뀐 게 있으면 접속자 목록을 다시 보낸다."""
    global _activity_checked, _activity_lock
    if _activity_lock is None:
        _activity_lock = asyncio.Lock()
    async with _activity_lock:
        if not force and time.monotonic() - _activity_checked < ACTIVITY_MIN_INTERVAL:
            return
        _activity_checked = time.monotonic()
        ids = list(_online_users)
        if not ids:
            return
        seated = await database_sync_to_async(_seated_games)(ids)
        changed = False
        for uid, entry in list(_online_users.items()):
            label = _activity_of(entry, seated.get(uid))
            if entry.get("activity") != label:
                entry["activity"] = label
                changed = True
    if changed:
        await get_channel_layer().group_send(PRESENCE_GROUP, {"type": "presence_update"})


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
            entry = _online_users[user.id] = {"user_id": user.id, **info, "count": 0, "pages": [], "activity": LOBBY_LABEL}
        entry["count"] += 1  # 같은 유저가 탭을 여러 개 열어도 한 명으로 센다
        self.page = _page_slug(self.scope.get("query_string", b""))
        entry["pages"].append(self.page)
        self.presence_counted = True
        self.friend_ids = frozenset()
        self._ticker = None

        if b"presence=1" in self.scope.get("query_string", b""):
            self.friend_ids = frozenset(await _load_friend_ids(user.id))
            await self.channel_layer.group_add(PRESENCE_GROUP, self.channel_name)
            if not is_new_user:  # 새 유저면 아래 브로드캐스트로 받는다
                await self.send(text_data=_presence_payload(self.friend_ids))
            self._ticker = asyncio.ensure_future(self._activity_ticker(user.id))
        if is_new_user:
            await self.channel_layer.group_send(PRESENCE_GROUP, {"type": "presence_update"})
        await _refresh_activity(force=True)   # 이미 방에 앉아 있거나 아케이드 게임을 열었으면 바로 반영

    async def _activity_ticker(self, user_id):
        """이 접속이 살아 있는 동안 주기적으로 활동(앉음/일어남)과 친구 목록을 갱신한다."""
        ticks = 0
        try:
            while True:
                await asyncio.sleep(ACTIVITY_REFRESH_SECONDS)
                ticks += 1
                if ticks % FRIEND_REFRESH_TICKS == 0:
                    self.friend_ids = frozenset(await _load_friend_ids(user_id))
                await _refresh_activity()
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("lobby activity ticker failed")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(LOBBY_GROUP, self.channel_name)
        await self.channel_layer.group_discard(PRESENCE_GROUP, self.channel_name)
        if getattr(self, "_ticker", None):
            self._ticker.cancel()
        if not getattr(self, "presence_counted", False):
            return
        user_id = self.scope["user"].id
        entry = _online_users.get(user_id)
        if entry:
            if getattr(self, "page", None) in entry["pages"]:
                entry["pages"].remove(self.page)
            entry["count"] -= 1
            if entry["count"] <= 0:
                del _online_users[user_id]
                await self.channel_layer.group_send(PRESENCE_GROUP, {"type": "presence_update"})

    async def presence_update(self, event):
        await self.send(text_data=_presence_payload(getattr(self, "friend_ids", frozenset())))

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
                "user_id": chat_info.get("user_id"),
                "full_name": chat_info.get("full_name", ""),
                "card_picture": chat_info.get("card_picture", ""),
                "is_graduate": chat_info.get("is_graduate", False),
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
                    "user_id": event.get("user_id"),
                    "full_name": event.get("full_name", ""),
                    "card_picture": event.get("card_picture", ""),
                    "is_graduate": event.get("is_graduate", False),
                    "created_at": event["created_at"],
                },
                ensure_ascii=False,
            )
        )

    @database_sync_to_async
    def _save_message(self, user, message):
        from .models import LobbyChatMessage
        saved = LobbyChatMessage.objects.create(user=user, message=message)
        # DB 시각은 UTC — 실시간 메시지 시각도 이전 기록(템플릿 |time)처럼 한국 시간으로 보낸다
        saved.created_at = timezone.localtime(saved.created_at)
        return saved

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

        # 프로필 카드(채팅 이름·사진 클릭)용
        return {"display_name": display_name, "picture_url": picture_url, "user_id": u.pk,
                "full_name": u.get_full_name, "card_picture": u.get_picture(), "is_graduate": u.is_graduate}


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
# 나가기/뒤로가기 등 페이지를 떠나면서 끊긴 연결(클라이언트가 pagehide 때 "page_leave"를
# 보냄)은 곧바로 일어나기/퇴장 처리한다. 새로고침도 pagehide를 보내지만 보통 이 시간
# 안에 다시 접속하므로 자리가 유지된다. (포커·고스톱 공통)
PAGE_LEAVE_GRACE_SECONDS = 3
_disconnect_grace_tasks = {}  # user_id -> asyncio.Task


class _Spectators:
    """관전자 목록 (프로세스 메모리, 연결 단위). {방 id: {채널 이름: 관전자 정보}}
    워치독과 마찬가지로 단일 프로세스 전제 — 서버가 재시작되면 관전자는 다시 들어오면 된다."""

    def __init__(self):
        self.rooms = {}

    def room_of(self, channel):
        return next((rid for rid, d in self.rooms.items() if channel in d), None)

    def set(self, channel, room_id, info=None):
        """관전 방을 바꾼다 (None이면 관전 종료). 목록이 바뀌었으면 True."""
        if self.room_of(channel) == room_id:
            return False
        for rid, d in list(self.rooms.items()):
            if d.pop(channel, None) is not None and not d:
                del self.rooms[rid]
        if room_id is not None:
            self.rooms.setdefault(room_id, {})[channel] = info
        return True

    def snapshot(self):
        out = {}
        for rid, d in self.rooms.items():
            by_user = {v["user_id"]: v for v in d.values()}  # 탭 여러 개로 봐도 한 명
            out[rid] = list(by_user.values())
        return out


def _spectator_info(user):
    return {"user_id": user.id, "display_name": user.display_name, "picture": user.get_picture()}


_poker_spectators = _Spectators()
_gostop_spectators = _Spectators()


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


async def _schedule_disconnect_grace(user, seconds=None):
    """연결이 끊긴 유저를 유예 시간 뒤에도 재접속하지 않으면 자리에서 내보낸다.
    (같은 유저가 여러 탭을 열어둔 경우는 드문 예외로 두고 신경 쓰지 않는다.)"""
    try:
        await asyncio.sleep(POKER_DISCONNECT_GRACE_SECONDS if seconds is None else seconds)
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
                # AI가 생각하는 동안(최대 약 1초) 공용 동기 스레드를 붙잡으면 모든 접속자의 요청이 밀린다 —
                # 별도 스레드에서 처리한다 (DB 정합성은 방/테이블 행 잠금으로 보장)
                await database_sync_to_async(poker_engine.process_due_deadlines, thread_sensitive=False)()
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
    """포커 방(여러 개) 실시간 WebSocket 컨슈머.
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
        if _poker_spectators.set(self.channel_name, None):
            await _broadcast_poker_state()
        user = self.scope.get("user")
        if user and user.is_authenticated and user.id not in _disconnect_grace_tasks:
            seconds = PAGE_LEAVE_GRACE_SECONDS if getattr(self, "page_left", False) else None
            _disconnect_grace_tasks[user.id] = asyncio.create_task(_schedule_disconnect_grace(user, seconds))

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

        if msg_type == "page_leave":
            self.page_left = True
            return
        if msg_type in ("watch", "unwatch"):
            room_id = data.get("table_id") if msg_type == "watch" else None
            info = await database_sync_to_async(_spectator_info)(user) if room_id is not None else None
            try:
                room_id = int(room_id) if room_id is not None else None
            except (TypeError, ValueError):
                return
            _poker_spectators.set(self.channel_name, room_id, info)
            await _broadcast_poker_state()
            return
        if msg_type == "create":
            handler = lambda: poker_engine.create_table(user, data.get("tier"), data.get("capacity", 6),
                                                         data.get("game_type", "holdem"))
        elif msg_type == "join":
            handler = lambda: poker_engine.join_table(user, data.get("table_id"))
        elif msg_type == "add_bot":
            handler = lambda: poker_engine.add_bot(user)
        elif msg_type == "stand":
            handler = lambda: poker_engine.stand_up(user)
        elif msg_type == "action":
            handler = lambda: poker_engine.player_action(user, data.get("action"), data.get("amount", 0))
        elif msg_type == "bj_bet":
            handler = lambda: poker_engine.blackjack_bet(user, data.get("amount", 0))
        elif msg_type == "bj_action":
            handler = lambda: poker_engine.blackjack_action(user, data.get("action"))
        elif msg_type == "buy_chips":
            handler = lambda: poker_engine.buy_chips(user, data.get("leaves", 0))
        elif msg_type == "cash_out_chips":
            handler = lambda: poker_engine.cash_out_chips(user, data.get("chips", 0))
        elif msg_type == "emoji":
            handler = lambda: poker_engine.send_emoji(user, data.get("emoji"))
        elif msg_type == "reveal":
            handler = lambda: poker_engine.reveal_hand(user)
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
            await self.channel_layer.group_send(POKER_GROUP, {
                "type": "emoji_broadcast", "table_id": result[0], "seat_number": result[1], "emoji": data.get("emoji"),
            })
        else:
            await _broadcast_poker_state()

    async def broadcast_state(self, event):
        await self._send_state()

    async def emoji_broadcast(self, event):
        await self.send(text_data=json.dumps(
            {"type": "emoji_reaction", "table_id": event.get("table_id"), "seat_number": event["seat_number"],
             "emoji": event["emoji"]},
            ensure_ascii=False,
        ))

    async def _send_state(self):
        watch = _poker_spectators.room_of(self.channel_name)
        state = await database_sync_to_async(poker_engine.get_state_for)(
            self.scope["user"], watch, _poker_spectators.snapshot())
        table = state.get("table")
        if watch is not None and (not table or not table.get("spectating")):
            # 관전하던 방이 없어졌거나 그 방에 앉았으면 관전 종료
            _poker_spectators.set(self.channel_name, None)
            await _broadcast_poker_state()
        await self.send(text_data=json.dumps(state, ensure_ascii=False))



# ─────────────────────────────────────────────────────────────────────────────
# 고스톱(맞고 2인 / 고스톱 3인) — 방 목록과 내 방 상태를 하나의 소켓/그룹으로 보낸다. 상태가 바뀌면
# 그룹 전체에 신호만 보내고 각 연결이 자기 시점(get_state_for)으로 다시 만든다.
# ponytail: 모든 방 변경이 맞고 페이지 접속자 전원에게 재조회를 일으킨다 —
# 동아리 규모에선 충분, 접속자가 많아지면 방별 그룹 + 목록 그룹으로 나눌 것.
# 워치독/재접속 유예는 포커와 같은 단일 프로세스 asyncio 태스크 방식.
# ─────────────────────────────────────────────────────────────────────────────

GOSTOP_GROUP = "gostop"
GOSTOP_DISCONNECT_GRACE_SECONDS = 20
_gostop_watchdog_task = None
_gostop_disconnect_tasks = {}  # user_id -> asyncio.Task


async def _broadcast_gostop_state():
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        await channel_layer.group_send(GOSTOP_GROUP, {"type": "broadcast_state"})


def _ensure_gostop_watchdog():
    global _gostop_watchdog_task
    if _gostop_watchdog_task is None or _gostop_watchdog_task.done():
        _gostop_watchdog_task = asyncio.create_task(_gostop_watchdog_loop())


async def _gostop_watchdog_loop():
    global _gostop_watchdog_task
    try:
        while True:
            try:
                deadline = await database_sync_to_async(gostop_engine.next_deadline_at)()
                if deadline is None:
                    return
                wait = (deadline - timezone.now()).total_seconds()
                if wait > 0:
                    await asyncio.sleep(min(wait, 2))
                    continue
                await database_sync_to_async(gostop_engine.process_due_deadlines, thread_sensitive=False)()  # AI 계산이 다른 요청을 막지 않게
                await _broadcast_gostop_state()
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("gostop watchdog tick failed, retrying")
                await database_sync_to_async(close_old_connections)()
                await asyncio.sleep(POKER_WATCHDOG_ERROR_RETRY_SECONDS)
    finally:
        _gostop_watchdog_task = None


async def _gostop_disconnect_grace(user, seconds=None):
    """유예 시간 안에 재접속하지 않으면 방에서 내보낸다 (진행 중이면 자리 비움 + 판 끝나고 퇴장)."""
    try:
        await asyncio.sleep(GOSTOP_DISCONNECT_GRACE_SECONDS if seconds is None else seconds)
        ok, _ = await database_sync_to_async(gostop_engine.leave_room)(user, away=True)
        if ok:
            await _broadcast_gostop_state()
    except asyncio.CancelledError:
        pass
    finally:
        _gostop_disconnect_tasks.pop(user.id, None)


class GostopConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return
        task = _gostop_disconnect_tasks.pop(user.id, None)
        if task and not task.done():
            task.cancel()
        await self.channel_layer.group_add(GOSTOP_GROUP, self.channel_name)
        await self.accept()
        _ensure_gostop_watchdog()
        back, _ = await database_sync_to_async(gostop_engine.mark_back)(user)
        if back:
            await _broadcast_gostop_state()
        else:
            await self._send_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(GOSTOP_GROUP, self.channel_name)
        if _gostop_spectators.set(self.channel_name, None):
            await _broadcast_gostop_state()
        user = self.scope.get("user")
        if user and user.is_authenticated and user.id not in _gostop_disconnect_tasks:
            seconds = PAGE_LEAVE_GRACE_SECONDS if getattr(self, "page_left", False) else None
            _gostop_disconnect_tasks[user.id] = asyncio.create_task(_gostop_disconnect_grace(user, seconds))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return
        user = self.scope["user"]
        msg_type = data.get("type")
        _ensure_gostop_watchdog()

        if msg_type == "__ping__":
            await self.send(text_data=json.dumps({"type": "pong"}))
            return
        if msg_type == "page_leave":
            self.page_left = True
            return

        if msg_type in ("watch", "unwatch"):
            room_id = data.get("room_id") if msg_type == "watch" else None
            info = await database_sync_to_async(_spectator_info)(user) if room_id is not None else None
            try:
                room_id = int(room_id) if room_id is not None else None
            except (TypeError, ValueError):
                return
            _gostop_spectators.set(self.channel_name, room_id, info)
            await _broadcast_gostop_state()
            return
        handlers = {
            "create": lambda: gostop_engine.create_room(user, data.get("mode"), data.get("tier") or "intermediate"),
            "join": lambda: gostop_engine.join_room(user, data.get("room_id")),
            "leave": lambda: gostop_engine.leave_room(user),
            "add_bots": lambda: gostop_engine.add_bots(user),
            "cancel_leave": lambda: gostop_engine.cancel_leave(user),
            "play": lambda: gostop_engine.play(user, data.get("card"), data.get("target"), data.get("mode")),
            "choose": lambda: gostop_engine.choose_flip(user, data.get("target")),
            "go_stop": lambda: gostop_engine.declare(user, data.get("go")),
            "buy_chips": lambda: poker_engine.buy_chips(user, data.get("leaves", 0)),
            "cash_out_chips": lambda: poker_engine.cash_out_chips(user, data.get("chips", 0)),
        }
        handler = handlers.get(msg_type)
        if handler is None:
            return
        try:
            ok, result = await database_sync_to_async(handler)()
        except Exception:
            logger.exception("gostop action failed: type=%s user=%s", msg_type, getattr(user, "id", None))
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
            await _broadcast_gostop_state()

    async def broadcast_state(self, event):
        await self._send_state()

    async def _send_state(self):
        watch = _gostop_spectators.room_of(self.channel_name)
        state = await database_sync_to_async(gostop_engine.get_state_for)(
            self.scope["user"], watch, _gostop_spectators.snapshot())
        room = state.get("room")
        if watch is not None and (not room or not room.get("spectating")):
            _gostop_spectators.set(self.channel_name, None)
            await _broadcast_gostop_state()
        await self.send(text_data=json.dumps(state, ensure_ascii=False))


# ─────────────────────────────────────────────────────────────────────────────
# 요트 다이스 — 고스톱과 같은 구조 (방 목록 + 내 방 상태를 한 소켓/그룹, 신호만 보내고
# 각 연결이 자기 시점으로 다시 만든다). 워치독/재접속 유예도 단일 프로세스 asyncio 태스크.
# ─────────────────────────────────────────────────────────────────────────────

YACHT_GROUP = "yacht"
YACHT_DISCONNECT_GRACE_SECONDS = 20
_yacht_watchdog_task = None
_yacht_disconnect_tasks = {}  # user_id -> asyncio.Task


async def _broadcast_yacht_state():
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        await channel_layer.group_send(YACHT_GROUP, {"type": "broadcast_state"})


def _ensure_yacht_watchdog():
    global _yacht_watchdog_task
    if _yacht_watchdog_task is None or _yacht_watchdog_task.done():
        _yacht_watchdog_task = asyncio.create_task(_yacht_watchdog_loop())


async def _yacht_watchdog_loop():
    global _yacht_watchdog_task
    try:
        while True:
            try:
                deadline = await database_sync_to_async(yacht_engine.next_deadline_at)()
                if deadline is None:
                    return
                wait = (deadline - timezone.now()).total_seconds()
                if wait > 0:
                    await asyncio.sleep(min(wait, 2))
                    continue
                await database_sync_to_async(yacht_engine.process_due_deadlines, thread_sensitive=False)()  # AI 계산이 다른 요청을 막지 않게
                await _broadcast_yacht_state()
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("yacht watchdog tick failed, retrying")
                await database_sync_to_async(close_old_connections)()
                await asyncio.sleep(POKER_WATCHDOG_ERROR_RETRY_SECONDS)
    finally:
        _yacht_watchdog_task = None


async def _yacht_disconnect_grace(user, seconds=None):
    """유예 시간 안에 재접속하지 않으면 방에서 내보낸다 (판 중이면 대신 두기 + 판 끝나고 퇴장)."""
    try:
        await asyncio.sleep(YACHT_DISCONNECT_GRACE_SECONDS if seconds is None else seconds)
        ok, _ = await database_sync_to_async(yacht_engine.leave_room)(user, away=True)
        if ok:
            await _broadcast_yacht_state()
    except asyncio.CancelledError:
        pass
    finally:
        _yacht_disconnect_tasks.pop(user.id, None)


class YachtConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return
        task = _yacht_disconnect_tasks.pop(user.id, None)
        if task and not task.done():
            task.cancel()
        await self.channel_layer.group_add(YACHT_GROUP, self.channel_name)
        await self.accept()
        _ensure_yacht_watchdog()
        back, _ = await database_sync_to_async(yacht_engine.mark_back)(user)
        if back:
            await _broadcast_yacht_state()
        else:
            await self._send_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(YACHT_GROUP, self.channel_name)
        user = self.scope.get("user")
        if user and user.is_authenticated and user.id not in _yacht_disconnect_tasks:
            seconds = PAGE_LEAVE_GRACE_SECONDS if getattr(self, "page_left", False) else None
            _yacht_disconnect_tasks[user.id] = asyncio.create_task(_yacht_disconnect_grace(user, seconds))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return
        user = self.scope["user"]
        msg_type = data.get("type")
        _ensure_yacht_watchdog()
        if msg_type == "__ping__":
            await self.send(text_data=json.dumps({"type": "pong"}))
            return
        if msg_type == "page_leave":
            self.page_left = True
            return
        handlers = {
            "create": lambda: yacht_engine.create_room(user, data.get("capacity"), data.get("stake")),
            "join": lambda: yacht_engine.join_room(user, data.get("room_id")),
            "leave": lambda: yacht_engine.leave_room(user),
            "cancel_leave": lambda: yacht_engine.cancel_leave(user),
            "add_bots": lambda: yacht_engine.add_bots(user),
            "roll": lambda: yacht_engine.roll(user, data.get("held")),
            "score": lambda: yacht_engine.score(user, data.get("category")),
            "buy_chips": lambda: poker_engine.buy_chips(user, data.get("leaves", 0)),
            "cash_out_chips": lambda: poker_engine.cash_out_chips(user, data.get("chips", 0)),
        }
        handler = handlers.get(msg_type)
        if handler is None:
            return
        try:
            ok, result = await database_sync_to_async(handler)()
        except Exception:
            logger.exception("yacht action failed: type=%s user=%s", msg_type, getattr(user, "id", None))
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
            await _broadcast_yacht_state()

    async def broadcast_state(self, event):
        await self._send_state()

    async def _send_state(self):
        state = await database_sync_to_async(yacht_engine.get_state_for)(self.scope["user"])
        await self.send(text_data=json.dumps(state, ensure_ascii=False))
