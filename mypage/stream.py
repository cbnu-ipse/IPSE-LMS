"""
요약이 만들어지는 대로 화면에 보여 주기 위한 전달 통로 (글자 단위 스트리밍).

백그라운드 요약 작업(views._generate_summary_bg)이 AI에게서 글자 조각을 받을 때마다 SummaryPublisher.push()로 넘기면,
- 지금까지 만든 글자를 이 프로세스 메모리(_live)에 쌓아 두고 (화면을 늦게 연 사람·새로고침한 사람이 처음부터 따라잡는 스냅샷),
- 0.25초 안팎으로 모아 채널 층(Redis)의 그룹 `summary-<자료 id>`로 보낸다 (조각마다 보내면 서버가 힘들다).
각 메시지에는 번호(seq)가 있어 화면은 중복·누락을 알아챈다. DB에는 끝났을 때 한 번만 저장한다 (views).
채널 층이 없거나 메모리가 다른 프로세스에 있으면 화면은 예전처럼 상태를 확인하는 방식으로 돌아간다.
"""
import threading
import time

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

FLUSH_SECONDS = 0.25
FLUSH_CHARS = 120

_live = {}                      # 자료 id → {"text": 지금까지 만든 글자, "seq": 마지막으로 보낸 번호}
_lock = threading.Lock()


def group_name(document_id):
    return f"summary-{document_id}"


def snapshot(document_id):
    """지금 만들고 있는 요약의 (글자, 번호). 만드는 중이 아니면 None."""
    with _lock:
        state = _live.get(document_id)
        return (state["text"], state["seq"]) if state else None


def _send(document_id, payload):
    layer = get_channel_layer()
    if layer is None:
        return
    try:
        async_to_sync(layer.group_send)(group_name(document_id), {"type": "summary.event", "payload": payload})
    except Exception:       # 전달이 안 돼도 요약 자체는 계속된다 (화면은 상태 확인으로 대신한다)
        pass


class SummaryPublisher:
    def __init__(self, document_id):
        self.document_id = document_id
        self._buffer = []
        self._last = time.monotonic()
        with _lock:
            _live[document_id] = {"text": "", "seq": 0}

    def push(self, text):
        if not text:
            return
        self._buffer.append(text)
        if time.monotonic() - self._last >= FLUSH_SECONDS or sum(map(len, self._buffer)) >= FLUSH_CHARS:
            self.flush()

    def flush(self):
        if not self._buffer:
            return
        chunk, self._buffer = "".join(self._buffer), []
        self._last = time.monotonic()
        with _lock:
            state = _live.get(self.document_id)
            if state is None:
                return
            state["text"] += chunk
            state["seq"] += 1
            seq = state["seq"]
        _send(self.document_id, {"type": "delta", "seq": seq, "text": chunk})

    def finish(self, status):
        """끝났다고 알린다 (status: done | failed). 화면은 이때 저장된 요약을 새로 읽는다."""
        self.flush()
        with _lock:
            _live.pop(self.document_id, None)
        _send(self.document_id, {"type": "done", "status": status})
