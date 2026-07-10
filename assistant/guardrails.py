"""프롬프트 인젝션/탈옥 시도를 걸러내는 경량 정규식 가드레일.

의존성 없는 정규식 매칭만 사용한다(참고: after_noon/study/15_AIguardrail의
GuardrailEngine.check_prompt_injection). PII 마스킹, 출력 스캐닝 등은
이 어시스턴트의 사용 범위(judge 섹션 학습 데이터 조회) 밖이라 이식하지 않았다.
"""

import re

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


def detect_prompt_injection(text):
    """프롬프트 인젝션/탈옥 시도로 보이는 문구가 있으면 True."""
    return bool(_INJECTION_RE.search(text or ""))
