import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

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
        from django.conf import settings as django_settings
        try:
            u = User.objects.get(pk=user.pk)
            display_name = u.display_name
        except Exception:
            display_name = user.username
        try:
            picture_url = user.get_picture()
        except Exception:
            picture_url = django_settings.MEDIA_URL + "default.png"
        return {"display_name": display_name, "picture_url": picture_url}

