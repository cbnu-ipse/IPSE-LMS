import io
import json
import urllib.error
from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings

from . import ai, vertex

TOOLS = [{"type": "function", "function": {"name": "get_overview", "description": "d",
                                           "parameters": {"type": "object", "properties": {}}}}]


class ConversionTestCase(SimpleTestCase):
    def test_messages_become_system_instruction_and_alternating_contents(self):
        system, contents = vertex.to_contents([
            {"role": "system", "content": "규칙"}, {"role": "user", "content": "질문"},
            {"role": "assistant", "content": "답"}, {"role": "user", "content": "다음"}])
        self.assertEqual(system, {"parts": [{"text": "규칙"}]})
        self.assertEqual([c["role"] for c in contents], ["user", "model", "user"])
        self.assertEqual(contents[1]["parts"], [{"text": "답"}])

    def test_tool_round_trip_keeps_signature_and_groups_consecutive_results(self):
        messages = [
            {"role": "user", "content": "현황"},
            {"role": "assistant", "content": None, "tool_calls": [
                {"id": "c0", "type": "function", "thought_signature": "SIG0",
                 "function": {"name": "a", "arguments": '{"x": 1}'}},
                {"id": "c1", "type": "function", "thought_signature": None,
                 "function": {"name": "b", "arguments": "{}"}}]},
            {"role": "tool", "tool_call_id": "c0", "content": json.dumps({"ok": 1})},
            {"role": "tool", "tool_call_id": "c1", "content": "plain text"},
        ]
        _, contents = vertex.to_contents(messages)
        model_parts = contents[1]["parts"]
        self.assertEqual(model_parts[0]["functionCall"], {"name": "a", "args": {"x": 1}})
        self.assertEqual(model_parts[0]["thoughtSignature"], "SIG0")          # 서명을 그대로 돌려준다
        self.assertNotIn("thoughtSignature", model_parts[1])
        self.assertEqual(len(contents), 3)                                     # 도구 결과 둘은 한 턴
        responses = contents[2]["parts"]
        self.assertEqual(responses[0]["functionResponse"], {"name": "a", "response": {"ok": 1}})
        self.assertEqual(responses[1]["functionResponse"]["response"], {"result": "plain text"})

    def test_tools_are_declared_with_json_schema_passthrough(self):
        declared = vertex.to_tools(TOOLS)
        self.assertEqual(declared[0]["functionDeclarations"][0]["name"], "get_overview")
        self.assertEqual(declared[0]["functionDeclarations"][0]["parametersJsonSchema"], {"type": "object", "properties": {}})
        self.assertIsNone(vertex.to_tools(None))

    def test_response_maps_text_tool_calls_usage_and_skips_thought_parts(self):
        response = vertex.to_response({
            "candidates": [{"finishReason": "STOP", "content": {"parts": [
                {"text": "생각", "thought": True}, {"text": "안녕"},
                {"functionCall": {"name": "get_overview", "args": {"a": 1}}, "thoughtSignature": "S"}]}}],
            "usageMetadata": {"promptTokenCount": 10, "candidatesTokenCount": 3, "thoughtsTokenCount": 5,
                              "cachedContentTokenCount": 2}})
        message = response.choices[0].message
        self.assertEqual(message.content, "안녕")
        call = message.tool_calls[0]
        self.assertEqual((call.function.name, json.loads(call.function.arguments), call.thought_signature),
                         ("get_overview", {"a": 1}, "S"))
        self.assertEqual((response.usage.prompt_tokens, response.usage.completion_tokens,
                          response.usage.prompt_tokens_details.cached_tokens), (10, 8, 2))   # 생각 토큰도 출력으로 센다
        dumped = message.model_dump(exclude_none=True)
        self.assertEqual(dumped["tool_calls"][0]["thought_signature"], "S")                  # 다음 요청으로 되돌릴 수 있다

    def test_empty_candidates_do_not_crash(self):
        response = vertex.to_response({"usageMetadata": {}})
        self.assertIsNone(response.choices[0].message.content)
        self.assertIsNone(response.choices[0].message.tool_calls)


class _Resp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


class GenerateTestCase(SimpleTestCase):
    def test_request_has_key_header_json_mode_system_and_tools(self):
        seen = {}

        def fake_urlopen(request, timeout=None):
            seen["url"], seen["headers"], seen["body"] = request.full_url, dict(request.header_items()), json.loads(request.data)
            return _Resp(json.dumps({"candidates": [{"content": {"parts": [{"text": "{}"}]}}], "usageMetadata": {}}).encode())

        with patch.object(vertex.urllib.request, "urlopen", fake_urlopen):
            vertex.generate("KEY", "gemini-3.1-flash-lite", [{"role": "system", "content": "s"}, {"role": "user", "content": "u"}],
                            max_tokens=123, json_mode=True, tools=TOOLS)
        self.assertTrue(seen["url"].endswith("/publishers/google/models/gemini-3.1-flash-lite:generateContent"))
        self.assertNotIn("KEY", seen["url"])                                   # 키는 주소가 아니라 헤더로
        self.assertEqual(seen["headers"]["X-goog-api-key"], "KEY")
        self.assertEqual(seen["body"]["generationConfig"], {"maxOutputTokens": 123, "responseMimeType": "application/json"})
        self.assertEqual(seen["body"]["systemInstruction"], {"parts": [{"text": "s"}]})
        self.assertIn("tools", seen["body"])

    def test_http_errors_become_vertex_error_with_status_and_message(self):
        body = io.BytesIO(json.dumps({"error": {"status": "PERMISSION_DENIED", "message": "blocked"}}).encode())

        def boom(request, timeout=None):
            raise urllib.error.HTTPError(request.full_url, 403, "Forbidden", {}, body)

        with patch.object(vertex.urllib.request, "urlopen", boom):
            with self.assertRaises(vertex.VertexError) as ctx:
                vertex.generate("K", "m", [{"role": "user", "content": "u"}], max_tokens=10)
        self.assertEqual(ctx.exception.status, 403)
        self.assertIn("PERMISSION_DENIED", str(ctx.exception))


class RoutingTestCase(TestCase):
    PROVIDERS = {"openai": {"key": "o", "base_url": None}, "gemini": {"key": "g", "base_url": None, "native": "vertex"}}

    def test_native_provider_calls_vertex_with_tools_and_json_mode_and_records_usage(self):
        fake = vertex.to_response({"candidates": [{"content": {"parts": [{"text": "{\"a\": 1}"}]}}],
                                   "usageMetadata": {"promptTokenCount": 7, "candidatesTokenCount": 2}})
        with override_settings(AI_PROVIDERS=self.PROVIDERS, AI_TASK_PROVIDERS={"classify": "gemini"},
                               AI_MODELS={"classify": "gemini-3.1-flash-lite"}), \
                patch.object(ai, "_vertex_generate", return_value=fake) as gen, patch.object(ai, "_client") as openai_client:
            self.assertEqual(ai.complete_json("classify", [{"role": "user", "content": "x"}]), {"a": 1})
        args = gen.call_args.args
        self.assertEqual((args[0], args[2], args[3]), ("gemini-3.1-flash-lite", ai.MAX_OUTPUT_TOKENS["classify"], True))
        openai_client.assert_not_called()                                      # OpenAI 클라이언트는 쓰지 않는다
        from .models import AIUsage
        row = AIUsage.objects.get()
        self.assertEqual((row.model, row.prompt_tokens, row.completion_tokens), ("gemini-3.1-flash-lite", 7, 2))

    def test_studio_backend_keeps_openai_compatible_client(self):
        providers = {**self.PROVIDERS, "gemini": {"key": "g", "base_url": "https://g.example/v1/"}}
        with override_settings(AI_PROVIDERS=providers):
            self.assertIsNone(providers["gemini"].get("native"))


class VertexImageTests(TestCase):
    def test_image_parts_become_inline_data(self):
        messages = [{"role": "user", "content": [
            {"type": "text", "text": "글자를 옮겨 적어라"},
            {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,QUJDRA=="}}]}]
        _, contents = vertex.to_contents(messages)
        self.assertEqual(contents[0]["parts"], [{"text": "글자를 옮겨 적어라"},
                                                {"inlineData": {"mimeType": "image/jpeg", "data": "QUJDRA=="}}])

    def test_plain_text_and_unknown_parts(self):
        self.assertEqual(vertex.to_parts("안녕"), [{"text": "안녕"}])
        self.assertEqual(vertex.to_parts(None), [{"text": ""}])
        self.assertEqual(vertex.to_parts([{"type": "image_url", "image_url": {"url": "http://x/y.png"}}]), [{"text": ""}])
