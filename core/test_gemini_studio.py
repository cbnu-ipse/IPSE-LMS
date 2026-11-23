from types import SimpleNamespace
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from . import ai
from .models import AIUsage

User = get_user_model()
STUDIO = {**settings.AI_PROVIDERS, "gemini": {"key": "k", "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/"}}


def _usage(prompt, completion, total=None, cached=0):
    return SimpleNamespace(prompt_tokens=prompt, completion_tokens=completion, total_tokens=total if total is not None else prompt + completion,
                           prompt_tokens_details=SimpleNamespace(cached_tokens=cached))


def _response(text, finish="stop", usage=None):
    message = SimpleNamespace(content=text, tool_calls=None)
    return SimpleNamespace(choices=[SimpleNamespace(message=message, finish_reason=finish)], usage=usage or _usage(1, 1))


class _Completions:
    def __init__(self, handler):
        self.calls, self.handler = [], handler

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return self.handler(len(self.calls), kwargs)


def _client(handler):
    completions = _Completions(handler)
    return SimpleNamespace(chat=SimpleNamespace(completions=completions)), completions


def _chunk(text=None, usage=None):
    return SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))] if text is not None else [], usage=usage)


class DefaultBackendTests(TestCase):
    def test_gemini_defaults_to_the_gemini_api_not_vertex(self):
        """GEMINI_BACKEND를 적지 않으면 Gemini API(AI Studio 키)의 OpenAI 호환 주소를 쓴다."""
        from decouple import config

        if config("GEMINI_BACKEND", default="").strip():
            self.skipTest("로컬 환경에 GEMINI_BACKEND가 직접 적혀 있음")
        gemini = settings.AI_PROVIDERS["gemini"]
        self.assertEqual(gemini["base_url"], "https://generativelanguage.googleapis.com/v1beta/openai/")
        self.assertNotIn("native", gemini)


@override_settings(AI_PROVIDERS=STUDIO, AI_TASK_PROVIDERS={**settings.AI_TASK_PROVIDERS, "question": "gemini", "summary": "gemini"},
                   AI_MODELS={**settings.AI_MODELS, "question": "gemini-3.6-flash", "summary": "gemini-3.5-flash-lite"},
                   AI_BLOCK_NETWORK=False, AI_THINKING_ALLOWANCE=2000)
class GeminiApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_output_limit_has_room_for_thinking(self):
        client, completions = _client(lambda n, kw: _response("{}"))
        with patch("core.ai._client", return_value=client):
            ai.complete_json("question", [{"role": "user", "content": "x"}])
        self.assertEqual(completions.calls[0]["max_tokens"], ai.MAX_OUTPUT_TOKENS["question"] + 2000)
        self.assertNotIn("max_completion_tokens", completions.calls[0])

    def test_cut_off_json_is_retried_with_a_bigger_limit_and_charged_once(self):
        client, completions = _client(lambda n, kw: _response('{"q": "잘' if n == 1 else '{"q": "ok"}', "length" if n == 1 else "stop"))
        with patch("core.ai._client", return_value=client), patch("core.ai._charge", return_value=0) as charge:
            self.assertEqual(ai.complete_json("question", [{"role": "user", "content": "x"}]), {"q": "ok"})
        limits = [c["max_tokens"] for c in completions.calls]
        self.assertEqual(limits[1], limits[0] * 4)
        charge.assert_called_once()

    def test_hidden_thinking_tokens_are_counted_as_output(self):
        """Gemini API는 생각 토큰을 completion이 아니라 total에만 넣는다 (실측: prompt 28, completion 16, total 524)."""
        client, _ = _client(lambda n, kw: _response("{}", usage=_usage(28, 16, total=524)))
        with patch("core.ai._client", return_value=client):
            ai.chat("question", [{"role": "user", "content": "x"}], user=self.user)
        row = AIUsage.objects.get(user=self.user)
        self.assertEqual((row.prompt_tokens, row.completion_tokens), (28, 496))

    def test_streaming_delivers_pieces_and_records_real_usage(self):
        final = _usage(10, 40, total=90)
        client, completions = _client(lambda n, kw: iter([_chunk("요"), _chunk("약"), _chunk(None, usage=final)]))
        pieces = []
        with patch("core.ai._client", return_value=client):
            text = ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user, on_delta=pieces.append)
        self.assertEqual((text, pieces), ("요약", ["요", "약"]))
        sent = completions.calls[0]
        self.assertTrue(sent["stream"])
        self.assertEqual(sent["stream_options"], {"include_usage": True})
        self.assertEqual(sent["max_tokens"], ai.MAX_OUTPUT_TOKENS["summary"] + 2000)
        self.assertEqual(sent["model"], "gemini-3.5-flash-lite")
        row = AIUsage.objects.get(user=self.user)
        self.assertEqual((row.model, row.prompt_tokens, row.completion_tokens), ("gemini-3.5-flash-lite", 10, 80))

    def test_stream_error_midway_records_nothing(self):
        def broken():
            yield _chunk("가")
            raise ConnectionResetError("끊김")

        client, _ = _client(lambda n, kw: broken())
        with patch("core.ai._client", return_value=client):
            with self.assertRaises(ConnectionResetError):
                ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user)
        self.assertFalse(AIUsage.objects.filter(user=self.user).exists())

    def test_opening_the_stream_retries_transient_errors(self):
        class Busy(Exception):
            status_code = 503

        def handler(n, kw):
            if n == 1:
                raise Busy("busy")
            return iter([_chunk("ok")])

        client, completions = _client(handler)
        with patch("core.ai._client", return_value=client), patch("core.ai.time.sleep"):
            self.assertEqual(ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user), "ok")
        self.assertEqual(len(completions.calls), 2)


@override_settings(AI_BLOCK_NETWORK=False)
class OpenAIStillWorksTests(TestCase):
    def test_openai_uses_max_completion_tokens_without_thinking_headroom_and_streams(self):
        with override_settings(AI_TASK_PROVIDERS={**settings.AI_TASK_PROVIDERS, "summary": "openai"},
                               AI_PROVIDERS={**settings.AI_PROVIDERS, "openai": {"key": "k", "base_url": None}}):
            client, completions = _client(lambda n, kw: iter([_chunk("a", usage=_usage(1, 1))]))
            with patch("core.ai._client", return_value=client):
                self.assertEqual(ai.stream_complete("summary", [{"role": "user", "content": "x"}]), "a")
        self.assertEqual(completions.calls[0]["max_completion_tokens"], ai.MAX_OUTPUT_TOKENS["summary"])
        self.assertNotIn("max_tokens", completions.calls[0])
