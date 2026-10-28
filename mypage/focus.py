"""
모의고사·속성 노트를 만들 때 사용자가 적는 짧은 추가 요청(100자 이내, 예: "교수님이 프림 알고리즘은 꼭 나온다고 하셨어요").

보안 원칙: **사용자가 쓴 글은 AI 프롬프트에 절대 들어가지 않는다.** 글에서 '선택한 자료에 실제로 나오는 용어'만 뽑아(extract_terms)
그 용어만 전달한다. 그래서 어떤 지시문을 적어도 AI에는 닿지 않고, 전달되는 용어는 자료 본문의 글자 그대로라 새 지시를 담을 수 없다.
여러 겹으로 막는다:
 1. 한 줄·100자 이하·허용 글자(한글·영문·숫자·기본 문장부호)만. 줄바꿈·기호(`<>{}[]\\|#$&=*` 등)·보이지 않는 글자는 거절한다.
 2. 인젝션·탈옥·시스템 프롬프트·출력 형식 변경을 시도하는 표현은 거절한다 (assistant.guardrails + 여기의 추가 패턴, NFKC·띄어쓰기 우회도 잡는다).
 3. 자료에 없는 용어는 버리고, 하나도 못 찾으면 AI를 부르기 전에 안내하고 멈춘다.
 4. 뽑힌 용어는 최대 6개이고 AI에는 `untrusted` 구역 안의 '데이터'로만 건넨다. 결과(문제·노트)는 항상 서버가 형식·근거를 다시 검사한다.
"""
import re
import unicodedata

from assistant import guardrails

MAX_CHARS = 100
MAX_TERMS = 6
MAX_TERM_CHARS = 30

ALLOWED = re.compile(r"^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9 .,!?~·()%+\-/:'\"]+$")
# 한 글자씩 끼운 기호·공백을 걷어낸 뒤에도 잡도록 guardrails의 변형 검사를 함께 쓴다
_EXTRA_PATTERNS = [
    r"ignore|disregard|override|forget|bypass|jailbreak|system|assistant|developer|prompt|instruction|payload|role\s*play",
    r"프롬프트|시스템|지시문|지시\s*사항|명령|지침|규칙|역할|롤플레이|탈옥|무시|잊어|우회|덮어|대신\s*답|출력\s*형식|응답\s*형식|형식을\s*바꿔",
    r"json|스키마|코드\s*블록|마크다운|html|script|\bsql\b|\burl\b|http|www\.",
    r"정답\s*(은|을|를)?\s*(모두|전부|항상)|모든\s*(문제|문항|답)|전부\s*(o|x|정답)",
]
_EXTRA_RE = re.compile("|".join(_EXTRA_PATTERNS), re.IGNORECASE)

# 시험 이야기에 쓰이는 흔한 말 (용어로 뽑지 않는다)
_STOP_PREFIXES = (
    "교수", "시험", "나온", "나와", "나오", "했다", "했어", "하셨", "하신", "한다", "합니", "말씀", "꼭", "무조건", "반드시", "문제", "문항", "출제",
    "포함", "중요", "강조", "부분", "내용", "정도", "이번", "다음", "그리고", "그런", "이런", "저런", "또는", "관련", "대해", "대한", "위해", "때문",
    "있다", "있는", "없다", "같은", "같다", "많이", "자주", "특히", "넣어", "넣고", "내주", "내신", "낸다", "냈다", "알려", "들었", "들은", "공부",
)


class FocusError(ValueError):
    """사용자에게 그대로 보여줘도 되는 메시지."""


def _norm(text):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", text or "")).strip().lower()


def clean(raw):
    """입력 검사: (정리한 글, 없으면 빈 문자열). 쓸 수 없는 글이면 FocusError."""
    raw = raw if isinstance(raw, str) else ""
    if not raw.strip():
        return ""
    if len(raw) > MAX_CHARS * 3:                                   # 터무니없이 긴 입력은 정리하기 전에 거른다
        raise FocusError(f"추가 요청은 {MAX_CHARS}자 이내로 적어주세요.")
    if re.search(r"[\r\n\t\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", raw):
        raise FocusError("추가 요청은 줄바꿈 없이 한 줄로 적어주세요.")
    text = guardrails.normalize(raw)                               # 전각→반각, 보이지 않는 글자 제거
    text = re.sub(r" +", " ", text).strip()
    if len(text) > MAX_CHARS:
        raise FocusError(f"추가 요청은 {MAX_CHARS}자 이내로 적어주세요. (지금 {len(text)}자)")
    if not ALLOWED.match(text):
        raise FocusError("추가 요청에는 한글·영문·숫자와 기본 문장부호만 쓸 수 있어요.")
    if guardrails.detect_prompt_injection(text) or any(_EXTRA_RE.search(v) for v in guardrails._variants(text)):
        raise FocusError("추가 요청에 쓸 수 없는 표현이 있어요. 시험에 나온다고 들은 내용만 간단히 적어주세요.")
    return text


def _stems(token):
    """한국어 조사·어미가 붙은 말에서 뒤를 1~2글자 줄여 본 후보들 (긴 것부터)."""
    out = [token]
    if re.fullmatch(r"[가-힣]+", token):
        out += [token[:-n] for n in (1, 2) if len(token) - n >= 2]
    return out


def _is_stop(token):
    return any(token.startswith(p) for p in _STOP_PREFIXES) or len(token) < 2 and not token.isdigit()


def extract_terms(text, material):
    """text에서 material(자료 본문)에 실제로 나오는 용어만 뽑는다 (연속한 용어가 자료에도 붙어 있으면 한 용어로 합친다)."""
    haystack = _norm(material)
    tokens = re.findall(r"[가-힣]+|[A-Za-z][A-Za-z0-9+#.\-]*|\d+[가-힣A-Za-z]*", text)
    matched = []                         # 토큰마다 자료에서 찾은 말 (못 찾았거나 흔한 말이면 None)
    for token in tokens:
        found = None
        if not _is_stop(token):
            for stem in _stems(token):
                if len(stem) >= 2 and _norm(stem) in haystack:
                    found = stem
                    break
        matched.append(found)
    terms, i = [], 0
    while i < len(matched):
        if matched[i] is None:
            i += 1
            continue
        phrase, j = matched[i], i + 1
        while j < len(matched) and matched[j] is not None and _norm(f"{phrase} {matched[j]}") in haystack:
            phrase = f"{phrase} {matched[j]}"
            j += 1
        terms.append(phrase[:MAX_TERM_CHARS])
        i = j
    unique = []
    for term in terms:
        key = _norm(term)
        if any(key == _norm(u) or key in _norm(u) for u in unique):
            continue
        unique = [u for u in unique if _norm(u) not in key] + [term]
    return unique[:MAX_TERMS]


def parse(raw, material):
    """(용어 목록). 입력이 비면 []. 쓸 수 없거나 자료에서 용어를 하나도 못 찾으면 FocusError (AI를 부르기 전에 안내하려고)."""
    text = clean(raw)
    if not text:
        return []
    terms = extract_terms(text, material)
    if not terms:
        raise FocusError("입력한 내용을 선택한 자료에서 찾지 못했어요. 자료에 나오는 용어로 적어주세요. (선택한 자료에 있는 내용만 반영돼요)")
    return terms


def mentions(term, *texts):
    """어떤 글에든 term이 들어 있는가."""
    key = _norm(term)
    return any(key in _norm(t) for t in texts if t)
