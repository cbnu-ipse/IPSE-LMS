from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from . import stream
from .models import PersonalDocument, ProcessingStatus


class SummaryStreamConsumer(AsyncJsonWebsocketConsumer):
    """학습 화면이 요약이 만들어지는 대로 받아 보는 연결. 자료 주인만 연결할 수 있다."""

    async def connect(self):
        self.document_id = int(self.scope["url_route"]["kwargs"]["pk"])
        user = self.scope.get("user")
        status = await self._owned_status(user) if user and user.is_authenticated else None
        if status is None:
            await self.close(code=4403)
            return
        self.group = stream.group_name(self.document_id)
        await self.channel_layer.group_add(self.group, self.channel_name)     # 스냅샷을 읽기 전에 먼저 들어가 그 사이 조각을 놓치지 않는다
        await self.accept()
        await self._send_snapshot(status)

    async def disconnect(self, code):
        if getattr(self, "group", None):
            await self.channel_layer.group_discard(self.group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content.get("type") == "sync":          # 화면이 번호가 건너뛴 걸 알아챘을 때 처음부터 다시 받는다
            await self._send_snapshot(await self._owned_status(self.scope["user"]))

    async def summary_event(self, event):
        await self.send_json(event["payload"])

    async def _send_snapshot(self, status):
        if status != ProcessingStatus.PROCESSING:
            await self.send_json({"type": "done", "status": status})
            return
        text, seq = stream.snapshot(self.document_id) or ("", 0)
        await self.send_json({"type": "snapshot", "seq": seq, "text": text})

    @database_sync_to_async
    def _owned_status(self, user):
        return (PersonalDocument.objects.filter(pk=self.document_id, user=user, is_deleted=False)
                .values_list("summary_status", flat=True).first())
