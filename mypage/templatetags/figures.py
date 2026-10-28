from django import template

from mypage.figure import data_uri

register = template.Library()


@register.filter
def figure_src(question):
    """문제 dict의 figure를 <img src>용 data URI로 (그림이 없으면 빈 문자열)."""
    return data_uri((question or {}).get("figure")) if isinstance(question, dict) else ""
