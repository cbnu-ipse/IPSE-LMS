"""AI가 지은 모의고사 제목 정리: 교수님 이름이나 '출제 스타일'이 제목에 드러나지 않게 한다."""
import re

# (…교수님 스타일), [정태은 교수 출제 방식] 같은 괄호 덩어리
_BRACKETED = re.compile(r"\s*[(\[（［][^)\]）］]*(교수|스타일|출제\s*방식)[^)\]）］]*[)\]）］]")
_LEAK = re.compile(r"교수|스타일|출제\s*방식")


def clean_title(title, fallback, names=()):
    """제목에서 교수·스타일 표현을 뗀다. 괄호 덩어리는 떼고, 그래도 교수·스타일 말이나 교수 이름이 남으면 fallback을 쓴다."""
    text = " ".join(_BRACKETED.sub("", str(title or "")).split()).strip(" -–—:·,")
    if len(text) < 2 or _LEAK.search(text) or any(n and n.replace("교수님", "").replace("교수", "").strip() and n.replace("교수님", "").replace("교수", "").strip() in text for n in names):
        return fallback
    return text
