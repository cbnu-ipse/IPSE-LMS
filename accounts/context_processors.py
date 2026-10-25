def currency_grants(request):
    """재화 지급 권한 여부(상단 '재화 지급' 버튼)와, 접속했을 때 한 번 보여 줄 받은 지급 내역."""
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return {}
    from . import grants
    return {"can_grant_currency": grants.can_grant(user), "pending_currency_grants": grants.pending_for(user)}


def treat_event(request):
    """할로윈 사탕 이벤트 진행 여부와 마감 시각 (상단 바 사탕 표시, 할로윈 테마·배너용)."""
    from .treats import TREAT_EVENT_END, event_active
    return {"treat_event_active": event_active(), "treat_event_end": TREAT_EVENT_END}
