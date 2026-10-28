from django import template

from core import usage

register = template.Library()


@register.filter
def cost_label(points):
    """예상 사용량 점수를 화면 글로: '약 11% · 33점' (이번 주 한도 대비 %, 1% 미만이면 '1% 미만'). 0이거나 없으면 빈 문자열."""
    try:
        points = float(points or 0)
    except (TypeError, ValueError):
        return ""
    if points <= 0:
        return ""
    label = usage.percent_label(points)
    pct = "1% 미만" if label == "<1" else f"약 {label}%"
    shown = int(points) if points == int(points) else round(points, 1)
    return f"{pct} · {shown}점"
