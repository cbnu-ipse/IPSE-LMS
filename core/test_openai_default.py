from types import SimpleNamespace
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from . import ai, usage
from .models import AIUsage

User = get_user_model()


class OpenAIDefaultTests(TestCase):
    """기본 모델은 OpenAI의 MYPAGE_CHAT_MODEL(gpt-5.4-mini)이고, 작업별 환경변수로 하나씩 바꿀 수 있다."""

    def test_every_task_defaults_to_openai_with_the_default_model(self):
        for task, default in settings.AI_TASK_DEFAULTS.items():
            self.assertEqual(default, ("openai", settings.MYPAGE_CHAT_MODEL), task)
            self.assertEqual(ai.route(task), ("openai", settings.MYPAGE_CHAT_MODEL), task)

    def test_the_default_model_is_priced_not_left_to_the_expensive_fallback(self):
        self.assertIn("gpt-5.4-mini", settings.AI_MODEL_PRICES)
        self.assertEqual(usage.price_for("gpt-5.4-mini"), (0.75, 4.50, 0.075))
        point = settings.AI_POINT_USD
        self.assertAlmostEqual(usage.points_for_tokens("gpt-5.4-mini", 1_000_000, 0, 0), 0.75 / point)
        self.assertAlmostEqual(usage.points_for_tokens("gpt-5.4-mini", 1_000_000, 1_000_000, 0), 0.075 / point)     # 전부 캐시
        self.assertAlmostEqual(usage.points_for_tokens("gpt-5.4-mini", 0, 0, 1_000_000), 4.50 / point)

    def test_switching_only_the_provider_picks_that_providers_default_model(self):
        """AI_PROVIDER_<작업>=gemini만 적어도 gpt 모델 이름이 Gemini로 가서 404가 나지 않는다."""
        gemini = {**settings.AI_PROVIDERS, "gemini": {"key": "k", "base_url": None, "native": "vertex"}}
        with override_settings(AI_PROVIDERS=gemini, AI_TASK_PROVIDERS={**settings.AI_TASK_PROVIDERS, "ocr": "gemini"}):
            self.assertEqual(ai.route("ocr"), ("gemini", "gemini-3.5-flash-lite"))
            self.assertEqual(ai.route("summary"), ("openai", settings.MYPAGE_CHAT_MODEL))
        with override_settings(AI_PROVIDERS=gemini, AI_TASK_PROVIDERS={**settings.AI_TASK_PROVIDERS, "ocr": "gemini"},
                               AI_MODELS={**settings.AI_MODELS, "ocr": "gemini-3.6-flash"}):
            self.assertEqual(ai.route("ocr"), ("gemini", "gemini-3.6-flash"))          # 직접 정한 모델은 그대로

    def test_a_task_can_still_be_pointed_at_another_provider(self):
        with override_settings(AI_TASK_PROVIDERS={**settings.AI_TASK_PROVIDERS, "assignment": "gemini"},
                               AI_PROVIDERS={**settings.AI_PROVIDERS, "gemini": {"key": "k", "base_url": None, "native": "vertex"}},
                               AI_MODELS={**settings.AI_MODELS, "assignment": "gemini-3.6-flash"}):
            self.assertEqual(ai.route("assignment"), ("gemini", "gemini-3.6-flash"))
            self.assertEqual(ai.route("summary"), ("openai", settings.MYPAGE_CHAT_MODEL))


def _chunk(text=None, usage=None):
    choices = [SimpleNamespace(delta=SimpleNamespace(content=text))] if text is not None else []
    return SimpleNamespace(choices=choices, usage=usage)


class _Completions:
    def __init__(self, handler):
        self.calls = []
        self.handler = handler

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return self.handler(len(self.calls), kwargs)


def _client(handler):
    completions = _Completions(handler)
    return SimpleNamespace(chat=SimpleNamespace(completions=completions)), completions


@override_settings(AI_BLOCK_NETWORK=False)
class OpenAIStreamTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_pieces_are_delivered_as_they_arrive_and_real_token_usage_is_recorded(self):
        final = SimpleNamespace(prompt_tokens=120, completion_tokens=33, prompt_tokens_details=SimpleNamespace(cached_tokens=100))
        client, completions = _client(lambda n, kw: iter([_chunk("요"), _chunk("약"), _chunk(None, usage=final)]))
        pieces = []
        with patch("core.ai._client", return_value=client):
            text = ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user, on_delta=pieces.append)
        self.assertEqual((text, pieces), ("요약", ["요", "약"]))
        sent = completions.calls[0]
        self.assertTrue(sent["stream"])
        self.assertEqual(sent["stream_options"], {"include_usage": True})              # 마지막 조각에 실제 토큰 수를 받는다
        self.assertEqual(sent["max_completion_tokens"], ai.MAX_OUTPUT_TOKENS["summary"])
        self.assertEqual(sent["model"], settings.MYPAGE_CHAT_MODEL)
        row = AIUsage.objects.get(user=self.user)
        self.assertEqual((row.model, row.prompt_tokens, row.cached_tokens, row.completion_tokens), (settings.MYPAGE_CHAT_MODEL, 120, 100, 33))

    def test_an_error_midway_records_nothing_and_raises(self):
        def broken():
            yield _chunk("가")
            raise ConnectionResetError("끊김")

        client, _ = _client(lambda n, kw: broken())
        with patch("core.ai._client", return_value=client):
            with self.assertRaises(ConnectionResetError):
                ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user)
        self.assertFalse(AIUsage.objects.filter(user=self.user).exists())

    def test_opening_the_stream_is_retried_on_a_transient_error(self):
        class Busy(Exception):
            status_code = 503

        def handler(n, kw):
            if n == 1:
                raise Busy("busy")
            return iter([_chunk("ok", usage=None)])

        client, completions = _client(handler)
        with patch("core.ai._client", return_value=client), patch("core.ai.time.sleep"):
            self.assertEqual(ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user), "ok")
        self.assertEqual(len(completions.calls), 2)

    def test_missing_usage_does_not_break_the_answer(self):
        client, _ = _client(lambda n, kw: iter([_chunk("답")]))
        with patch("core.ai._client", return_value=client):
            self.assertEqual(ai.stream_complete("summary", [{"role": "user", "content": "x"}], user=self.user), "답")


@override_settings(AI_BLOCK_NETWORK=False)
class OpenAITruncationTests(TestCase):
    """JSON 답이 출력 상한에서 잘리면(finish_reason=length) 상한을 크게 올려 한 번 더 부른다. 크레딧은 한 번만 받는다."""

    @staticmethod
    def _response(text, finish):
        message = SimpleNamespace(content=text, tool_calls=None)
        return SimpleNamespace(choices=[SimpleNamespace(message=message, finish_reason=finish)],
                               usage=SimpleNamespace(prompt_tokens=1, completion_tokens=1, prompt_tokens_details=SimpleNamespace(cached_tokens=0)))

    def test_cut_off_json_is_retried_with_a_bigger_limit(self):
        client, completions = _client(lambda n, kw: self._response('{"q": "잘림' if n == 1 else '{"q": "ok"}', "length" if n == 1 else "stop"))
        with patch("core.ai._client", return_value=client), patch("core.ai._charge", return_value=0) as charge:
            self.assertEqual(ai.complete_json("question", [{"role": "user", "content": "x"}]), {"q": "ok"})
        limits = [c["max_completion_tokens"] for c in completions.calls]
        self.assertEqual(len(limits), 2)
        self.assertEqual(limits[1], limits[0] * 4)
        charge.assert_called_once()

    def test_a_normal_answer_is_called_once(self):
        client, completions = _client(lambda n, kw: self._response('{"q": "ok"}', "stop"))
        with patch("core.ai._client", return_value=client):
            ai.complete_json("question", [{"role": "user", "content": "x"}])
        self.assertEqual(len(completions.calls), 1)
