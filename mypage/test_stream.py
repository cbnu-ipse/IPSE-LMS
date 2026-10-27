import json
from unittest.mock import patch

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, TransactionTestCase, override_settings

from accounts import credits
from core import ai as core_ai
from core import vertex
from core.models import AIUsage

from . import stream
from .ai import generate_summary
from .consumers import SummaryStreamConsumer
from .models import PersonalDocument, ProcessingStatus

User = get_user_model()


class _FakeResponse:
    """urlopen 응답처럼 줄(bytes)을 돌려주고 with로 닫히는 가짜."""

    def __init__(self, lines, fail_after=None):
        self.lines, self.fail_after, self.closed = lines, fail_after, False

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.closed = True

    def __iter__(self):
        for n, line in enumerate(self.lines):
            if self.fail_after is not None and n >= self.fail_after:
                raise ConnectionResetError("cut")
            yield line.encode() + b"\n"


def sse(text=None, usage=None, thought=False):
    cand = {"content": {"parts": [{"text": text, **({"thought": True} if thought else {})}]}} if text is not None else {}
    data = {"candidates": [cand]} if cand else {}
    if usage:
        data["usageMetadata"] = usage
    return "data: " + json.dumps(data, ensure_ascii=False)


class IterStreamTests(TestCase):
    def test_yields_answer_text_in_order_and_skips_thoughts_and_noise(self):
        usage = {}
        resp = _FakeResponse([": keepalive", sse("안녕"), "", sse("속마음", thought=True), sse("하세요", usage={"promptTokenCount": 7, "candidatesTokenCount": 3}),
                              "data: 깨진 줄"])
        self.assertEqual(list(vertex.iter_stream(resp, usage)), ["안녕", "하세요"])
        self.assertEqual(usage["promptTokenCount"], 7)
        self.assertTrue(resp.closed)


VERTEX = {"gemini": {"key": "test-key", "base_url": None, "native": "vertex"}}


@override_settings(AI_PROVIDERS={**settings.AI_PROVIDERS, **VERTEX}, AI_TASK_PROVIDERS={**settings.AI_TASK_PROVIDERS, "summary": "gemini"},
                   AI_BLOCK_NETWORK=False, AI_CREDIT_COSTS={"summary": 1})
class StreamCompleteTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        credits.grant(self.user, 10, "test")

    def test_streams_pieces_and_records_usage_once_without_spending_credits(self):
        pieces = []
        resp = _FakeResponse([sse("가"), sse("나", usage={"promptTokenCount": 5, "candidatesTokenCount": 2})])
        with patch("core.vertex.open_stream", return_value=resp):
            text = core_ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user, cost=3, on_delta=pieces.append)
        self.assertEqual((text, pieces), ("가나", ["가", "나"]))
        self.user.refresh_from_db()
        self.assertEqual(self.user.credits, 10)                                  # 크레딧은 그대로
        row = AIUsage.objects.get(user=self.user)                                # 사용량(토큰)이 한 번 기록된다
        self.assertEqual((row.prompt_tokens, row.completion_tokens), (5, 2))

    def test_failure_midway_records_no_usage_and_raises(self):
        resp = _FakeResponse([sse("가"), sse("나")], fail_after=1)
        with patch("core.vertex.open_stream", return_value=resp):
            with self.assertRaises(ConnectionResetError):
                core_ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user, cost=3)
        self.assertFalse(AIUsage.objects.filter(user=self.user).exists())

    def test_connection_open_errors_are_retried(self):
        resp = _FakeResponse([sse("ok")])
        calls = []

        def flaky(*args, **kwargs):
            calls.append(1)
            if len(calls) == 1:
                raise vertex.VertexError(503, "busy")
            return resp

        with patch("core.vertex.open_stream", side_effect=flaky), patch("core.ai.time.sleep"):
            self.assertEqual(core_ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user), "ok")
        self.assertEqual(len(calls), 2)

    def test_non_streaming_provider_still_delivers_whole_text_once(self):
        with override_settings(AI_PROVIDERS={**settings.AI_PROVIDERS, "gemini": {"key": "k", "base_url": "x"}}), \
                patch("core.ai.complete", return_value="전체 답") as complete:
            pieces = []
            self.assertEqual(core_ai.stream_complete("summary", [], user=self.user, on_delta=pieces.append), "전체 답")
        self.assertEqual(pieces, ["전체 답"])
        complete.assert_called_once()


class GenerateSummaryStreamingTests(TestCase):
    def test_on_text_receives_pieces_and_blank_line_between_windows(self):
        seen = []

        def fake(task, messages, *, user=None, cost=None, on_delta=None):
            on_delta("앞")
            on_delta("뒤")
            return "앞뒤"

        text = "\n\n".join("가" * 3000 for _ in range(5))             # 15,006자 = 윈도우 2개
        with patch("core.ai.stream_complete", side_effect=fake):
            result = generate_summary(text, user=None, on_text=seen.append)
        self.assertEqual(seen, ["앞", "뒤", "\n\n", "앞", "뒤"])
        self.assertEqual(result, "앞뒤\n\n앞뒤")

    def test_without_on_text_the_normal_call_is_used(self):
        with patch("core.ai.complete", return_value="요약") as complete, patch("core.ai.stream_complete") as streaming:
            self.assertEqual(generate_summary("짧은 자료", user=None), "요약")
        complete.assert_called_once()
        streaming.assert_not_called()


class PublisherTests(TestCase):
    def tearDown(self):
        stream._live.clear()

    def test_batches_pieces_numbers_messages_and_keeps_a_snapshot(self):
        sent = []
        with patch("mypage.stream._send", side_effect=lambda doc, payload: sent.append(payload)):
            pub = stream.SummaryPublisher(5)
            self.assertEqual(stream.snapshot(5), ("", 0))
            pub.push("가" * 10)
            self.assertEqual(sent, [])                                  # 조금씩 모아서 보낸다
            pub.push("나" * 200)                                         # 글자 수가 넘으면 바로 보낸다
            self.assertEqual([m["seq"] for m in sent], [1])
            pub.push("다")
            pub.finish("done")
        self.assertEqual([m["type"] for m in sent], ["delta", "delta", "done"])
        self.assertEqual("".join(m["text"] for m in sent if m["type"] == "delta"), "가" * 10 + "나" * 200 + "다")
        self.assertEqual([m["seq"] for m in sent if m["type"] == "delta"], [1, 2])
        self.assertIsNone(stream.snapshot(5))                           # 끝나면 메모리에서 지운다

    def test_a_late_viewer_can_catch_up_from_the_snapshot(self):
        with patch("mypage.stream._send"):
            pub = stream.SummaryPublisher(6)
            pub.push("x" * 300)
            self.assertEqual(stream.snapshot(6), ("x" * 300, 1))


class ConsumerTests(TransactionTestCase):
    def tearDown(self):
        stream._live.clear()

    async def _setup(self, status=ProcessingStatus.PROCESSING):
        owner = await database_sync_to_async(User.objects.create_user)(username="own", password="x")
        doc = await database_sync_to_async(PersonalDocument.objects.create)(user=owner, title="t", file="a.pdf", summary_status=status)
        return owner, doc

    def _comm(self, user, doc):
        comm = WebsocketCommunicator(SummaryStreamConsumer.as_asgi(), f"/ws/mypage/summary/{doc.pk}/")
        comm.scope["user"] = user
        comm.scope["url_route"] = {"kwargs": {"pk": str(doc.pk)}}
        return comm

    async def test_owner_gets_snapshot_then_live_pieces_then_done(self):
        owner, doc = await self._setup()
        pub = await sync_to_async(stream.SummaryPublisher, thread_sensitive=False)(doc.pk)
        await sync_to_async(pub.push, thread_sensitive=False)("처음" * 100)       # 연결 전에 이미 만든 글자
        comm = self._comm(owner, doc)
        connected, _ = await comm.connect()
        self.assertTrue(connected)
        snap = await comm.receive_json_from()
        self.assertEqual((snap["type"], snap["seq"], snap["text"]), ("snapshot", 1, "처음" * 100))
        await sync_to_async(pub.push, thread_sensitive=False)("뒤" * 200)
        delta = await comm.receive_json_from()
        self.assertEqual((delta["type"], delta["seq"], delta["text"]), ("delta", 2, "뒤" * 200))
        await sync_to_async(pub.finish, thread_sensitive=False)("done")
        self.assertEqual((await comm.receive_json_from())["type"], "done")
        await comm.disconnect()

    async def test_sync_request_resends_snapshot(self):
        owner, doc = await self._setup()
        pub = await sync_to_async(stream.SummaryPublisher, thread_sensitive=False)(doc.pk)
        await sync_to_async(pub.push, thread_sensitive=False)("가" * 200)
        comm = self._comm(owner, doc)
        await comm.connect()
        await comm.receive_json_from()
        await comm.send_json_to({"type": "sync"})
        again = await comm.receive_json_from()
        self.assertEqual((again["type"], again["text"]), ("snapshot", "가" * 200))
        await comm.disconnect()

    async def test_finished_document_just_says_done(self):
        owner, doc = await self._setup(status=ProcessingStatus.DONE)
        comm = self._comm(owner, doc)
        await comm.connect()
        self.assertEqual(await comm.receive_json_from(), {"type": "done", "status": "done"})
        await comm.disconnect()

    async def test_other_users_and_anonymous_are_rejected(self):
        owner, doc = await self._setup()
        other = await database_sync_to_async(User.objects.create_user)(username="oth", password="x")
        for who in (other, type("Anon", (), {"is_authenticated": False})()):
            comm = self._comm(who, doc)
            connected, _ = await comm.connect()
            self.assertFalse(connected)


class StudyPageStreamingMarkupTests(TestCase):
    def test_processing_page_has_chapter_bars_that_grow_with_headings(self):
        user = User.objects.create_user(username="v", password="pw")
        self.client.force_login(user)
        doc = PersonalDocument.objects.create(user=user, title="t", file="a.pdf", summary_status=ProcessingStatus.PROCESSING)
        html = self.client.get(f"/mypage/{doc.pk}/").content.decode()
        for marker in ('id="stream-tabs"', 'id="stream-content"', 'id="stream-nav"', "splitMarkdownPages(text)", "작성 중"):
            self.assertIn(marker, html)
