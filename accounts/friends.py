"""
친구 기능 (요청 → 수락).

놀이터 접속자 탭(static/js/friends.js)이 아래 JSON API를 쓴다.
    GET  /accounts/friends/          내 친구 / 받은 요청 / 보낸 요청
    POST /accounts/friends/request/  친구 요청 (상대가 먼저 요청했으면 바로 수락)
    POST /accounts/friends/respond/  받은 요청 수락/거절
    POST /accounts/friends/remove/   친구 삭제 또는 보낸 요청 취소
요청·수락 시 상대에게 사이트 알림 + 웹 푸시를 보낸다.
"""
import json

from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_POST

from .models import Friendship, Notification, User

FRIENDS_PAGE_LINK = "/game/?friends=1"


def user_view(u):
    """접속자 목록(presence)과 같은 모양: user_id / display_name / picture_url."""
    picture_url = ""
    try:
        if u.picture and u.picture.name and u.picture.name != "default.png":
            picture_url = u.picture.url
    except Exception:
        pass
    return {"user_id": u.id, "display_name": u.display_chat_name, "picture_url": picture_url}


def notify(recipient, sender, notification_type, message, link=""):
    """사이트 알림을 만들고 웹 푸시를 보낸다."""
    from .utils import send_web_push
    notification = Notification.objects.create(
        recipient=recipient, sender=sender, notification_type=notification_type, message=message, link=link,
    )
    send_web_push(notification)
    return notification


def are_friends(a, b):
    return Friendship.objects.filter(
        Q(from_user=a, to_user=b) | Q(from_user=b, to_user=a), status="accepted"
    ).exists()


def _target(request):
    """요청 본문의 user_id → (상대 User, 오류 메시지)."""
    try:
        user_id = int(json.loads(request.body or "{}").get("user_id"))
    except (TypeError, ValueError):
        return None, "잘못된 요청입니다."
    if user_id == request.user.id:
        return None, "자기 자신은 친구로 추가할 수 없습니다."
    target = User.objects.filter(pk=user_id, is_active=True, is_bot=False).select_related("student").first()
    if not target:
        return None, "존재하지 않는 사용자입니다."
    return target, None


def _lock_pair(a, b):
    """두 사람이 동시에 서로에게 요청하는 경우를 막으려고 id 순서대로 사용자 행을 잠근다."""
    list(User.objects.select_for_update().filter(pk__in=[a.id, b.id]).order_by("pk"))


def _error(message):
    return JsonResponse({"ok": False, "message": message}, status=400)


@login_required
def friends_api(request):
    me = request.user
    rows = Friendship.objects.filter(Q(from_user=me) | Q(to_user=me)).select_related(
        "from_user__student", "to_user__student"
    )
    friends, incoming, outgoing = [], [], []
    for f in rows:
        other = f.to_user if f.from_user_id == me.id else f.from_user
        if f.status == "accepted":
            friends.append(user_view(other))
        elif f.to_user_id == me.id:
            incoming.append(user_view(other))
        else:
            outgoing.append(user_view(other))
    key = lambda u: u["display_name"].lower()
    return JsonResponse({
        "friends": sorted(friends, key=key),
        "incoming": sorted(incoming, key=key),
        "outgoing": sorted(outgoing, key=key),
    })


def _accept(friendship, me):
    friendship.status = "accepted"
    friendship.accepted_at = timezone.now()
    friendship.save(update_fields=["status", "accepted_at"])
    notify(friendship.from_user, me, "friend_accept",
           f"{me.display_chat_name}님이 친구 요청을 수락했어요.", FRIENDS_PAGE_LINK)


@login_required
@require_POST
def friend_request_api(request):
    me = request.user
    target, err = _target(request)
    if err:
        return _error(err)
    with transaction.atomic():
        _lock_pair(me, target)
        existing = Friendship.between(me, target)
        if existing and existing.status == "accepted":
            return _error("이미 친구입니다.")
        if existing and existing.from_user_id == me.id:
            return _error("이미 친구 요청을 보냈습니다.")
        if existing:  # 상대가 먼저 요청했으면 바로 수락
            _accept(existing, me)
            return JsonResponse({"ok": True, "status": "accepted"})
        Friendship.objects.create(from_user=me, to_user=target)
        notify(target, me, "friend_request", f"{me.display_chat_name}님이 친구 요청을 보냈어요.", FRIENDS_PAGE_LINK)
    return JsonResponse({"ok": True, "status": "pending"})


@login_required
@require_POST
def friend_respond_api(request):
    me = request.user
    target, err = _target(request)
    if err:
        return _error(err)
    accept = bool(json.loads(request.body or "{}").get("accept"))
    with transaction.atomic():
        _lock_pair(me, target)
        pending = Friendship.objects.filter(from_user=target, to_user=me, status="pending").first()
        if not pending:
            return _error("받은 친구 요청이 없습니다.")
        if accept:
            _accept(pending, me)
        else:
            pending.delete()
    return JsonResponse({"ok": True, "status": "accepted" if accept else "declined"})


@login_required
@require_POST
def friend_remove_api(request):
    me = request.user
    target, err = _target(request)
    if err:
        return _error(err)
    with transaction.atomic():
        _lock_pair(me, target)
        # 받은 요청은 거절(respond)로 처리한다 — 여기서는 친구 삭제와 내가 보낸 요청 취소만
        deleted, _ = Friendship.objects.filter(
            Q(from_user=me, to_user=target) | Q(from_user=target, to_user=me, status="accepted")
        ).delete()
    if not deleted:
        return _error("친구가 아닙니다.")
    return JsonResponse({"ok": True})
