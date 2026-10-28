import json
import logging

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET, require_POST

from core.ai import AIQuotaExceeded

from .ai import MAX_SESSIONS, TITLE_CHARS, answer, auto_title, latest_session, new_session
from .models import ChatSession

logger = logging.getLogger(__name__)


def _session_payload(session):
    return {"id": session.pk, "title": session.title or "새 대화", "updated_at": session.updated_at.isoformat()}


def _owned_session(request, session_id):
    return get_object_or_404(ChatSession, pk=session_id, user=request.user)


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

    session = None
    if body.get("session_id") not in (None, ""):
        try:
            session = _owned_session(request, int(body["session_id"]))
        except (TypeError, ValueError):
            return JsonResponse({"error": "잘못된 대화입니다."}, status=400)

    try:
        reply = answer(request.user, user_message, current_path=body.get("current_path", ""),
                       page_context=body.get("page_context"), session=session)
    except AIQuotaExceeded as exc:
        return JsonResponse({"error": str(exc)}, status=429)
    except Exception:
        logger.exception("어시스턴트 응답 생성 실패 (user=%s)", request.user.pk)
        return JsonResponse({"error": "답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}, status=500)

    session = session or latest_session(request.user)
    return JsonResponse({"reply": reply, "session": _session_payload(session)})


@login_required
@require_GET
def chat_history_view(request):
    """한 대화의 메시지. ?session=<id>가 없으면 가장 최근 대화."""
    raw = request.GET.get("session")
    if raw:
        try:
            session = _owned_session(request, int(raw))
        except ValueError:
            return JsonResponse({"error": "잘못된 대화입니다."}, status=400)
    else:
        session = latest_session(request.user)
    messages = session.messages.all() if session else []
    return JsonResponse({
        "session": _session_payload(session) if session else None,
        "messages": [{"id": m.pk, "role": m.role, "content": m.content} for m in messages],
    })


@login_required
@require_GET
def session_list_view(request):
    sessions = ChatSession.objects.filter(user=request.user).order_by("-updated_at", "-id")[:MAX_SESSIONS]
    return JsonResponse({"sessions": [_session_payload(s) for s in sessions]})


@login_required
@require_POST
def session_create_view(request):
    return JsonResponse({"session": _session_payload(new_session(request.user))})


@login_required
@require_POST
def session_rename_view(request, session_id):
    session = _owned_session(request, session_id)
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "잘못된 요청입니다."}, status=400)
    title = auto_title(body.get("title"))
    if not title:
        return JsonResponse({"error": "제목을 입력해주세요."}, status=400)
    session.title = title
    session.save(update_fields=["title"])
    return JsonResponse({"session": _session_payload(session)})


@login_required
@require_POST
def session_delete_view(request, session_id):
    _owned_session(request, session_id).delete()
    return JsonResponse({"ok": True})
