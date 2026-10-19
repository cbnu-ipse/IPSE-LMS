"""프롬프트 인젝션/탈옥 시도와 민감 정보 노출을 막는 경량 가드레일.

입력: 정규식 매칭 전에 정규화한다 (NFKC 전각→반각, 보이지 않는 문자 제거, 글자 사이에 끼운 공백·기호
제거) — "ｉｇｎｏｒｅ", "i.g.n.o.r.e", "탈 옥" 같은 우회를 같은 패턴으로 잡는다.
출력: 답변에 시스템 프롬프트(카나리 문자열)가 새어 나오면 거부 메시지로 바꾸고, API 키·비밀값처럼
생긴 문자열은 가린다 (check_output).
의존성 없는 정규식만 사용한다(참고: after_noon/study/15_AIguardrail의 GuardrailEngine).
"""

import re
import secrets
import unicodedata

_PROMPT_INJECTION_PATTERNS = [
    r"ignore (all|any|the) (previous|prior) instructions",
    r"disregard (all|any|the) (previous|prior|above) (instructions|rules|guidelines)",
    r"reveal (your |the )?system prompt",
    r"you are now (dan|jailbroken|unrestricted|free from)",
    r"do anything now",
    r"\bdan mode\b",
    r"(이전|지금까지)\s*(의)?\s*(지시|명령|규칙|프롬프트).{0,10}(무시|잊)",
    r"시스템\s*프롬프트.{0,10}(공개|보여|알려|출력)",
    r"모든\s*(안전|보안)\s*(규칙|정책|가이드라인).{0,10}무시",
    r"탈옥",
    r"dan\s*모드",
    r"지금부터\s*너는.{0,15}(제한|규칙).{0,10}없",
]
_INJECTION_RE = re.compile("|".join(_PROMPT_INJECTION_PATTERNS), re.IGNORECASE)

REFUSAL_MESSAGE = "이전 지시를 무시해달라는 요청은 처리할 수 없습니다. 학습 관련 질문을 도와드릴게요."


_INVISIBLE = re.compile("[\u00ad\u200b-\u200f\u2060-\u2064\ufeff]")
# 글자 하나씩 사이에 끼운 공백·기호 (예: "i g n o r e", "탈.옥") — 2글자 이상 연속일 때만 붙인다
_SPACED = re.compile(r"(?<=\w)[\s.\-_*·]+(?=\w(?:[\s.\-_*·]+\w){1,})")


def normalize(text):
    text = unicodedata.normalize("NFKC", text or "")
    text = _INVISIBLE.sub("", text)
    return text


def _variants(text):
    base = normalize(text)
    yield base
    yield re.sub(r"\s+", " ", base)
    # 한 글자씩 띄워 쓴 우회: 1~2글자 토큰이 이어지면 붙여 본다
    tokens = re.split(r"[\s.\-_*·]+", base)
    yield "".join(tokens)


def detect_prompt_injection(text):
    """프롬프트 인젝션/탈옥 시도로 보이는 문구가 있으면 True."""
    return any(_INJECTION_RE.search(v) for v in _variants(text))


# ── 출력 검사 ───────────────────────────────────────────────────────────
_SECRET_PATTERNS = re.compile(
    r"(sk-[A-Za-z0-9_\-]{16,}"                    # OpenAI 등 API 키
    r"|(?:postgres(?:ql)?|redis|mysql)://\S+"     # 접속 URL (비밀번호 포함 가능)
    r"|(?:SECRET_KEY|API_KEY|PASSWORD)\s*[=:]\s*\S+)",
    re.IGNORECASE,
)
LEAK_MESSAGE = "죄송합니다. 그 내용은 알려드릴 수 없습니다. 학습 관련 질문을 도와드릴게요."


def new_canary():
    """시스템 프롬프트에 심어 두는 무작위 문자열. 답변에 나오면 시스템 프롬프트가 샌 것이다."""
    return f"cnry-{secrets.token_hex(6)}"


def check_output(text, canary=None):
    """(안전한 답변, 차단 여부). 시스템 프롬프트 유출이면 거부 메시지, 비밀값처럼 생긴 문자열은 가린다."""
    text = text or ""
    if canary and canary in text:
        return LEAK_MESSAGE, True
    return _SECRET_PATTERNS.sub("[가려짐]", text), False
