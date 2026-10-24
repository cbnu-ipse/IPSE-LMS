"""Gemini를 Google Cloud(Agent Platform = 예전 Vertex AI)의 네이티브 API로 부르는 어댑터.

AI Studio의 OpenAI 호환 주소는 Gemini API 선불 크레딧이 있어야 하지만, Agent Platform은 Cloud 무료 체험 크레딧으로
쓸 수 있다. 그런데 Agent Platform의 OpenAI 호환 주소는 API 키를 받지 않고 OAuth 토큰만 받으므로, API 키로 부를 수 있는
네이티브 REST(`publishers/google/models/<모델>:generateContent?key=`)를 직접 부르고, core/ai.py가 쓰는 OpenAI 응답
모양(choices[0].message, tool_calls, usage)으로 바꿔 돌려준다. 새 패키지 없이 표준 라이브러리만 쓴다.

메시지 변환: system → systemInstruction, assistant → model, tool 결과 → functionResponse(연속된 도구 결과는 한 턴으로).
Gemini 3의 함수 호출은 'thought signature'를 다음 요청에 그대로 돌려줘야 하므로 도구 호출마다 보관해 두었다가 되돌려 보낸다.
"""
import json
import urllib.error
import urllib.request
from types import SimpleNamespace

ENDPOINT = "https://aiplatform.googleapis.com/v1/publishers/google/models/{model}:generateContent"
TIMEOUT = 120


class VertexError(Exception):
    def __init__(self, status, message):
        super().__init__(f"Vertex {status}: {message}")
        self.status = status


def _tool_name_by_id(messages):
    names = {}
    for m in messages:
        for call in m.get("tool_calls") or []:
            names[call["id"]] = call["function"]["name"]
    return names


def to_contents(messages):
    """OpenAI 형식 messages → (systemInstruction 또는 None, Gemini contents)."""
    system_parts, contents = [], []
    names = _tool_name_by_id(messages)
    pending_responses = []

    def flush():
        if pending_responses:
            contents.append({"role": "user", "parts": list(pending_responses)})
            pending_responses.clear()

    for m in messages:
        role = m.get("role")
        if role == "tool":
            raw = m.get("content")
            try:
                payload = json.loads(raw) if isinstance(raw, str) else raw
            except ValueError:
                payload = raw
            pending_responses.append({"functionResponse": {
                "name": names.get(m.get("tool_call_id"), "tool"),
                "response": payload if isinstance(payload, dict) else {"result": payload}}})
            continue
        flush()
        if role == "system":
            system_parts.append({"text": str(m.get("content") or "")})
        elif role == "assistant":
            parts = []
            if m.get("content"):
                parts.append({"text": m["content"]})
            for call in m.get("tool_calls") or []:
                part = {"functionCall": {"name": call["function"]["name"],
                                         "args": json.loads(call["function"].get("arguments") or "{}")}}
                if call.get("thought_signature"):
                    part["thoughtSignature"] = call["thought_signature"]
                parts.append(part)
            if parts:
                contents.append({"role": "model", "parts": parts})
        else:
            contents.append({"role": "user", "parts": [{"text": str(m.get("content") or "")}]})
    flush()
    system = {"parts": system_parts} if system_parts else None
    return system, contents


def to_tools(tools):
    """OpenAI 도구 정의 → Gemini functionDeclarations (JSON Schema는 그대로 전달)."""
    if not tools:
        return None
    return [{"functionDeclarations": [{
        "name": t["function"]["name"], "description": t["function"].get("description", ""),
        "parametersJsonSchema": t["function"].get("parameters") or {"type": "object", "properties": {}},
    } for t in tools]}]


class _Message:
    def __init__(self, content, tool_calls):
        self.role, self.content, self.tool_calls = "assistant", content, tool_calls

    def model_dump(self, exclude_none=False):
        data = {"role": "assistant", "content": self.content}
        if self.tool_calls:
            data["tool_calls"] = [{"id": c.id, "type": "function", "thought_signature": c.thought_signature,
                                   "function": {"name": c.function.name, "arguments": c.function.arguments}}
                                  for c in self.tool_calls]
        return {k: v for k, v in data.items() if v is not None} if exclude_none else data


def to_response(data):
    """Gemini 응답 → OpenAI 응답 모양 (core/ai.py와 assistant가 읽는 필드만)."""
    candidates = data.get("candidates") or []
    parts = ((candidates[0].get("content") or {}).get("parts") or []) if candidates else []
    text, calls = [], []
    for part in parts:
        if part.get("thought"):
            continue                                              # 생각 요약은 답변에 넣지 않는다
        if "text" in part:
            text.append(part["text"])
        elif "functionCall" in part:
            fc = part["functionCall"]
            calls.append(SimpleNamespace(
                id=f"call_{len(calls)}_{fc['name']}", type="function", thought_signature=part.get("thoughtSignature"),
                function=SimpleNamespace(name=fc["name"], arguments=json.dumps(fc.get("args") or {}, ensure_ascii=False))))
    usage = data.get("usageMetadata") or {}
    message = _Message("".join(text) or None, calls or None)
    return SimpleNamespace(
        choices=[SimpleNamespace(message=message, finish_reason=(candidates[0].get("finishReason") if candidates else None))],
        usage=SimpleNamespace(
            prompt_tokens=usage.get("promptTokenCount", 0),
            completion_tokens=(usage.get("candidatesTokenCount", 0) or 0) + (usage.get("thoughtsTokenCount", 0) or 0),
            prompt_tokens_details=SimpleNamespace(cached_tokens=usage.get("cachedContentTokenCount", 0))))


def generate(api_key, model, messages, *, max_tokens, json_mode=False, tools=None):
    system, contents = to_contents(messages)
    body = {"contents": contents, "generationConfig": {"maxOutputTokens": max_tokens}}
    if system:
        body["systemInstruction"] = system
    if json_mode:
        body["generationConfig"]["responseMimeType"] = "application/json"
    declared = to_tools(tools)
    if declared:
        body["tools"] = declared
    request = urllib.request.Request(
        ENDPOINT.format(model=model), data=json.dumps(body, ensure_ascii=False).encode("utf-8"), method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as resp:
            return to_response(json.load(resp))
    except urllib.error.HTTPError as exc:
        try:
            err = json.load(exc)
            err = (err[0] if isinstance(err, list) else err).get("error", {})
            message = f"{err.get('status', '')} {err.get('message', '')}".strip()
        except Exception:
            message = ""
        raise VertexError(exc.code, message[:300]) from None
