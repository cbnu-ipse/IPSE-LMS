import json
import re

from django.conf import settings

from .guardrails import REFUSAL_MESSAGE, detect_prompt_injection
from .models import ChatMessage, ChatSession
from .tools import TOOLS_SPEC, dispatch_tool

RECENT_MESSAGE_LIMIT = 20
MAX_TOOL_ROUNDS = 3

_MYPAGE_DOCUMENT_PATH = re.compile(r"^/mypage/(\d+)/")


def _client():
    from openai import OpenAI

    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY가 설정되어 있지 않습니다. 운영 .env에 키를 추가한 뒤 다시 시도해주세요.")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _compact_summary(client, old_summary, old_messages):
    """오래된 대화를 기존 요약과 합쳐 하나의 짧은 요약으로 압축한다."""
    transcript = "\n".join(f"{m.role}: {m.content}" for m in old_messages)
    prompt = (
        "다음은 사용자와 어시스턴트의 이전 대화 요약과, 그 이후 오간 대화 내용입니다. "
        "둘을 하나의 짧은 요약으로 합쳐주세요. 사용자가 물어본 주제와 중요한 맥락만 남기고, "
        "5문장 이내로 간결하게 작성하세요. 요약문만 출력하세요.\n\n"
        f"--- 기존 요약 ---\n{old_summary or '(없음)'}\n\n"
        f"--- 추가 대화 ---\n{transcript}"
    )
    response = client.chat.completions.create(
        model=settings.ASSISTANT_CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()


def _build_context(client, session):
    """저장된 메시지가 RECENT_MESSAGE_LIMIT의 2배를 넘으면 오래된 절반을 요약으로 압축한다."""
    messages = list(session.messages.all())
    if len(messages) > RECENT_MESSAGE_LIMIT * 2:
        old, recent = messages[:-RECENT_MESSAGE_LIMIT], messages[-RECENT_MESSAGE_LIMIT:]
        session.summary = _compact_summary(client, session.summary, old)
        session.save(update_fields=["summary"])
        ChatMessage.objects.filter(pk__in=[m.pk for m in old]).delete()
        messages = recent
    return session.summary, messages


def _current_page_hint(current_path):
    match = _MYPAGE_DOCUMENT_PATH.match(current_path or "")
    if not match:
        return ""

    from mypage.models import PersonalDocument

    try:
        title = PersonalDocument.objects.get(pk=match.group(1)).title
    except PersonalDocument.DoesNotExist:
        return ""
    return f"\n사용자는 현재 '{title}' 자료 페이지를 보고 있습니다."


def _build_system_prompt(summary, current_path):
    prompt = (
        "당신은 IPSE LMS의 학습 도우미입니다. 사용자가 자신의 학습 자료, 강의 진행률, 퀴즈 응시 기록, "
        "대회 제출 이력, 문제 풀이 현황에 대해 물으면 제공된 tool을 호출해 실제 데이터를 조회한 뒤 "
        "답변하세요. 확인되지 않은 내용은 추측하지 말고 모른다고 답하세요."
    )
    if summary:
        prompt += f"\n\n이전 대화 요약:\n{summary}"
    prompt += _current_page_hint(current_path)
    return prompt


def answer(user, user_message, current_path=""):
    """사용자 메시지를 저장하고 LLM 응답(필요 시 tool 호출 포함)을 생성해 저장 후 반환한다."""
    session, _ = ChatSession.objects.get_or_create(user=user)
    ChatMessage.objects.create(session=session, role=ChatMessage.Role.USER, content=user_message)

    if detect_prompt_injection(user_message):
        ChatMessage.objects.create(session=session, role=ChatMessage.Role.ASSISTANT, content=REFUSAL_MESSAGE)
        return REFUSAL_MESSAGE

    client = _client()
    summary, history = _build_context(client, session)
    messages = [{"role": "system", "content": _build_system_prompt(summary, current_path)}]
    messages += [{"role": m.role, "content": m.content} for m in history]

    reply = "죄송합니다, 답변을 생성하지 못했습니다."
    for _ in range(MAX_TOOL_ROUNDS):
        response = client.chat.completions.create(
            model=settings.ASSISTANT_CHAT_MODEL,
            messages=messages,
            tools=TOOLS_SPEC,
        )
        message = response.choices[0].message
        if not message.tool_calls:
            reply = message.content or reply
            break

        messages.append(message.model_dump(exclude_none=True))
        for call in message.tool_calls:
            arguments = json.loads(call.function.arguments or "{}")
            result = dispatch_tool(user, call.function.name, arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })

    ChatMessage.objects.create(session=session, role=ChatMessage.Role.ASSISTANT, content=reply)
    return reply
