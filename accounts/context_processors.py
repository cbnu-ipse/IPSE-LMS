def treat_event(request):
    """할로윈 사탕 이벤트 진행 여부 (상단 바 사탕 표시용)."""
    from .treats import event_active
    return {"treat_event_active": event_active()}
