def treat_event(request):
    """할로윈 사탕 이벤트 진행 여부와 마감 시각 (상단 바 사탕 표시, 할로윈 테마·배너용)."""
    from .treats import TREAT_EVENT_END, event_active
    return {"treat_event_active": event_active(), "treat_event_end": TREAT_EVENT_END}
