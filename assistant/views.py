import json
import logging

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from .ai import answer
from .models import ChatSession

logger = logging.getLogger(__name__)


@login_required
@require_POST
def chat_message_view(request):
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "잘못된 요청입니다."}, status=400)

    user_message = (body.get("message") or "").strip()
    if not user_message:
        return JsonResponse({"error": "메시지를 입력해주세요."}, status=400)

    try:
        reply = answer(request.user, user_message, current_path=body.get("current_path", ""))
    except Exception:
        logger.exception("어시스턴트 응답 생성 실패 (user=%s)", request.user.pk)
        return JsonResponse({"error": "답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}, status=500)

    return JsonResponse({"reply": reply})


@login_required
@require_GET
def chat_history_view(request):
    session = ChatSession.objects.filter(user=request.user).first()
    messages = session.messages.all() if session else []
    return JsonResponse({
        "messages": [{"id": m.pk, "role": m.role, "content": m.content} for m in messages],
    })
