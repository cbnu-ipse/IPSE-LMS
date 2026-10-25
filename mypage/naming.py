"""과목·교수·개념 이름을 같은 것끼리 묶기 위한 정규화. 사람이 적은 이름은 공백·표기가 조금씩 다르다 ('운영체제', '운영 체제', 'OS')."""
import re
from difflib import SequenceMatcher

_PUNCT = re.compile(r"[\s·•\-_()\[\]{}<>.,:;/\\'\"`~!?]+")
# 이름 끝에 붙어도 같은 것으로 보는 말 ('운영체제론' = '운영체제')
_SOFT_SUFFIXES = ("개론", "입문", "원론", "론")


def name_key(name):
    """공백·구두점을 없애고 소문자로 맞춘 비교용 키."""
    return _PUNCT.sub("", str(name or "")).lower()


def professor_key(name):
    """'김 교수님', '김교수', '김' 처럼 달리 적어도 같은 교수님으로 묶는다."""
    n = re.sub(r"\s+", "", name or "")
    n = re.sub(r"(교수님|교수|님)$", "", n)
    return n.lower()


def _strip_soft(key):
    for suffix in _SOFT_SUFFIXES:
        if key.endswith(suffix) and len(key) > len(suffix) + 1:
            return key[: -len(suffix)]
    return key


def same_name(a, b):
    """자동으로 같은 것으로 묶어도 되는 이름인가: 키가 같거나 '~론/개론/입문'만 다른 경우."""
    ka, kb = name_key(a), name_key(b)
    return bool(ka) and bool(kb) and (ka == kb or _strip_soft(ka) == _strip_soft(kb))


def similarity(a, b):
    ka, kb = name_key(a), name_key(b)
    if not ka or not kb:
        return 0.0
    if ka in kb or kb in ka:
        return max(0.75, SequenceMatcher(None, ka, kb).ratio())
    return SequenceMatcher(None, ka, kb).ratio()


def similar_names(name, candidates, limit=3, threshold=0.7):
    """같은 것은 아니지만 비슷한 이름 (사람에게 '혹시 이 과목인가요?'로 보여 줄 후보)."""
    scored = [(similarity(name, c), c) for c in candidates if not same_name(name, c)]
    return [c for s, c in sorted(scored, reverse=True) if s >= threshold][:limit]
