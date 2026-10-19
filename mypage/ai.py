"""
mypage 자료 처리: 본문 추출(markitdown → 마크다운), 요약, 복습 문제 생성, 채점.
AI 호출은 모두 core.ai를 거친다 (작업별 모델·사용량 제한·사용 기록).

토큰 절감:
- pdf/docx/pptx는 markitdown으로 표·제목 구조를 살린 마크다운으로 바꾸고, clean_markdown()으로
  반복되는 머리글·꼬리글, 쪽 번호, 이미지 자리표시, 군더더기 공백을 지운다.
- 문제 생성은 문서 본문을 시스템 메시지(매번 같은 앞부분)에 두어 OpenAI 프롬프트 캐시를 탄다.
- OX 해설은 문제를 만들 때 같이 받아 두고, 틀렸을 때 다시 부르지 않는다.
- 단답형은 정답과 글자가 같으면 AI를 부르지 않고 바로 정답 처리한다.
"""
import io
import re
from collections import Counter

from core import ai as core_ai

MARKITDOWN_EXTENSIONS = (".pdf", ".docx", ".pptx")
SUMMARY_INPUT_CHARS = 12000   # 요약에 넣는 본문 길이 상한
QUESTION_INPUT_CHARS = 8000   # 문제 생성에 넣는 본문 길이 상한


def extract_text(file_obj, filename, user=None):
    """다양한 형식의 파일 객체에서 본문을 뽑아 정리된 마크다운/텍스트로 돌려준다. 실패하면 빈 문자열."""
    name = filename.lower()
    try:
        raw = file_obj.read()
        if name.endswith(MARKITDOWN_EXTENSIONS):
            text = _markitdown(raw, name) or _legacy_extract(io.BytesIO(raw), name)
        elif name.endswith((".jpg", ".jpeg", ".png")):
            return _extract_image(raw, name, user)
        else:
            text = _legacy_extract(io.BytesIO(raw), name)
    except Exception:
        return ""
    return clean_markdown(text)


def _markitdown(raw, name):
    """markitdown으로 마크다운 변환. 실패하면 빈 문자열 (기존 추출기로 대신한다)."""
    try:
        from markitdown import MarkItDown, StreamInfo

        result = MarkItDown(enable_plugins=False).convert_stream(
            io.BytesIO(raw), stream_info=StreamInfo(extension="." + name.rsplit(".", 1)[-1]))
        return result.markdown or ""
    except Exception:
        return ""


def _legacy_extract(f, name):
    if name.endswith(".pdf"):
        return _extract_pdf(f)
    if name.endswith(".docx") or name.endswith(".doc"):
        return _extract_docx(f)
    if name.endswith(".pptx") or name.endswith(".ppt"):
        return _extract_pptx(f)
    if name.endswith(".txt") or name.endswith(".md"):
        return _extract_plain_text(f)
    if name.endswith(".rtf"):
        return _extract_rtf(f)
    if name.endswith(".hwpx"):
        return _extract_hwpx(f)
    if name.endswith(".hwp"):
        return _extract_hwp(f)
    return ""


_PAGE_NUMBER = re.compile(r"^\s*(-\s*)?(\d{1,4}|page\s*\d+|\d+\s*/\s*\d+|\d+\s*쪽)(\s*-)?\s*$", re.IGNORECASE)
_IMAGE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
_TABLE_PAD = re.compile(r" *\| *")
_ZERO_WIDTH = re.compile("[\u200b-\u200f\u2060\ufeff]")


def clean_markdown(text):
    """같은 뜻을 더 적은 토큰으로: 반복 머리글·꼬리글(3번 이상 나오는 짧은 줄), 쪽 번호, 이미지 자리표시,
    표 칸의 공백 채움, 줄 끝 공백, 연속 빈 줄을 지운다. 내용 줄은 건드리지 않는다."""
    if not text:
        return ""
    text = _ZERO_WIDTH.sub("", text.replace("\r\n", "\n").replace("\r", "\n"))
    lines = [line.rstrip() for line in text.split("\n")]
    short = Counter(line.strip() for line in lines if 0 < len(line.strip()) <= 60)
    repeated = {line for line, n in short.items() if n >= 3 and not line.startswith(("|", "-", "*", "#"))}
    out = []
    for line in lines:
        stripped = line.strip()
        if stripped in repeated or _PAGE_NUMBER.match(stripped):
            continue
        line = _IMAGE.sub("", line)
        if stripped.startswith("|"):
            line = _TABLE_PAD.sub("|", line).replace("|---", "|-").replace("---|", "-|")
        if not line.strip():
            if out and not out[-1]:
                continue
            line = ""
        out.append(line)
    return "\n".join(out).strip()


def _extract_pdf(f):
    from pypdf import PdfReader

    reader = PdfReader(f)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_docx(f):
    import docx

    document = docx.Document(f)
    return "\n".join(p.text for p in document.paragraphs)


def _extract_pptx(f):
    from pptx import Presentation

    prs = Presentation(f)
    lines = []
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                lines.append(shape.text_frame.text)
    return "\n".join(lines)


def _extract_plain_text(f):
    return f.read().decode("utf-8", errors="ignore")


def _extract_rtf(f):
    from striprtf.striprtf import rtf_to_text

    raw = f.read()
    for encoding in ("utf-8", "cp949", "latin-1"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        text = raw.decode("utf-8", errors="ignore")
    return rtf_to_text(text)


def _extract_hwpx(f):
    import zipfile
    import xml.etree.ElementTree as ET

    texts = []
    with zipfile.ZipFile(f) as zf:
        for name in zf.namelist():
            if name.startswith("Contents/section") and name.endswith(".xml"):
                data = zf.read(name)
                # Uploaded files are untrusted: refuse DTDs (entity expansion / external entities)
                if b"<!DOCTYPE" in data.upper():
                    raise ValueError("hwpx section contains a DTD")
                texts.append("".join(ET.fromstring(data).itertext()))
    return "\n".join(texts)


def _extract_hwp(f):
    """HWP는 OLE의 PrvText(미리보기 텍스트) 스트림만 읽는다. 전체 본문이 아닌 미리보기 수준의 텍스트임."""
    import olefile

    with olefile.OleFileIO(f) as ole:
        raw = ole.openstream("PrvText").read()
    return raw.decode("utf-16-le", errors="ignore")


def _extract_image(raw, name, user=None):
    import base64

    b64 = base64.b64encode(raw).decode()
    mime = "jpeg" if name.endswith((".jpg", ".jpeg")) else "png"
    return core_ai.complete("ocr", [{
        "role": "user",
        "content": [
            {"type": "text", "text": "이 이미지에 있는 글자와 핵심 내용을 마크다운으로 그대로 옮겨 적어라. 설명은 붙이지 마라."},
            {"type": "image_url", "image_url": {"url": f"data:image/{mime};base64,{b64}"}},
        ],
    }], user=user, counts_as_request=False)


SUMMARY_INSTRUCTIONS = (
    "학생이 올린 학습 자료를 요약합니다. 복습에 바로 쓸 수 있게 구조화하세요.\n"
    "- 소제목(##)으로 나누고 필요하면 ###로 한 번 더 나눕니다.\n"
    "- 핵심 개념·정의·중요 용어는 **볼드**로 표시합니다.\n"
    "- 자료에 있는 정의·예시·수치는 빠뜨리지 말되, 같은 말을 되풀이하지 말고 짧은 문장·목록으로 씁니다.\n"
    "- 자료에 없는 내용은 덧붙이지 않습니다. 요약문만 출력합니다."
)


def generate_summary(extracted_text, user=None):
    """업로드된 문서 본문을 구조화된 요약으로 반환한다. 본문이 없으면 호출 없이 빈 문자열."""
    if not extracted_text.strip():
        return ""
    return core_ai.complete("summary", [
        {"role": "system", "content": SUMMARY_INSTRUCTIONS},
        {"role": "user", "content": core_ai.untrusted("자료", extracted_text[:SUMMARY_INPUT_CHARS])},
    ], user=user)


QUESTION_TYPE_LABELS = {"ox": "OX(참/거짓)", "short": "단답형", "essay": "서술형"}


def generate_one_question(extracted_text, question_type, existing_questions=(), user=None, index=0):
    """문서 본문을 근거로 지정된 유형(ox/short/essay)의 문제를 1개 만든다.
    반환: {"question", "answer", "explanation"} — explanation은 OX 해설(틀렸을 때 보여줌, 다시 부르지 않음).
    문서 본문을 시스템 메시지에 고정해 같은 문서로 여러 문제를 만들 때 프롬프트 캐시가 적용되게 한다."""
    system = (
        "학생이 올린 학습 자료만 근거로 복습 문제를 1개 만듭니다. 자료에 없는 내용은 묻지 않습니다.\n"
        'JSON으로만 답하세요: {"question": "...", "answer": "...", "explanation": "..."}\n'
        "- OX 문제의 answer는 O 또는 X, explanation은 정답 근거를 한두 문장으로.\n"
        "- 단답형의 answer는 짧은 정답(여러 표현이 맞으면 ' / '로 구분), 서술형은 모범답안.\n"
        "- 문제 문장에 'OX로 답하시오', '단답으로 쓰시오' 같은 답변 방식 안내는 붙이지 마세요 (화면에 입력 방법이 있습니다).\n\n"
        + core_ai.untrusted("자료", question_window(extracted_text, index))
    )
    request = f"{QUESTION_TYPE_LABELS[question_type]} 문제 1개를 만들어주세요."
    if existing_questions:
        request += ("\n이미 만든 문제들입니다. 같은 내용을 묻거나 표현만 바꾼 문제는 만들지 말고, "
                    "자료의 다른 부분에서 새 문제를 만드세요:\n" + "\n".join(f"- {q}" for q in existing_questions))
    data = core_ai.complete_json("question", [
        {"role": "system", "content": system},
        {"role": "user", "content": request},
    ], user=user)
    return {
        "question": clean_question_text(data.get("question", "")),
        "answer": data.get("answer", ""),
        "explanation": data.get("explanation", "") if question_type == "ox" else "",
    }


# 문제 끝에 붙은 답변 방식 지시 ("OX로 답하시오.", "O/X 중에서 고르시오." 등) — 화면에 이미 O/X 버튼이 있다
_ANSWER_INSTRUCTION = re.compile(
    r"[\s,.]*[(\[]?\s*(?:OX|O\s*/\s*X|O\s*,\s*X|O\s*또는\s*X|참\s*/\s*거짓|참\s*또는\s*거짓)"
    r"\s*(?:문제)?\s*(?:중에서|중|으로|로|를|만)?\s*(?:답|고르|선택|판단|표시|응답)\w*\s*(?:하시오|하세요|하라|오|시오|십시오)?"
    r"[.\s!]*[)\]]?\s*$")


def clean_question_text(text):
    """문제 문장 끝의 'OX로 답하시오.' 같은 답변 방식 지시를 떼어 낸다 (문장이 남으면 마침표를 붙인다)."""
    text = (text or "").strip()
    cleaned = _ANSWER_INSTRUCTION.sub("", text).strip()
    if not cleaned:
        return text
    return cleaned if cleaned[-1] in ".?!。" else cleaned + "."


def _normalize_for_compare(text):
    return re.sub(r"[\s.,!?'\"()\[\]{}·`~\-]+", "", clean_question_text(text).lower())


def is_duplicate_question(text, others, threshold=0.82):
    """이미 있는 문제와 같거나 거의 같은 문장인지 (공백·문장부호 무시, 유사도 threshold 이상)."""
    from difflib import SequenceMatcher

    target = _normalize_for_compare(text)
    if not target:
        return True
    for other in others:
        o = _normalize_for_compare(other)
        if o and (o == target or SequenceMatcher(None, o, target).ratio() >= threshold):
            return True
    return False


def question_window(text, index):
    """긴 문서는 앞부분만 넣으면 매번 같은 문제가 나오므로, 문제를 만들 때마다 문서의 다른 구간을 준다.
    index번째 문제 → index % (구간 수)번째 구간 (구간 크기 QUESTION_INPUT_CHARS, 문단 경계에 맞춰 자름)."""
    size = QUESTION_INPUT_CHARS
    if len(text) <= size:
        return text
    count = -(-len(text) // size)
    start = (index % count) * size
    chunk = text[start:start + size]
    # 구간 앞이 문장 중간이면 다음 줄바꿈부터 시작
    if start and "\n" in chunk[:300]:
        chunk = chunk.split("\n", 1)[1]
    return chunk


def _normalize_answer(text):
    return re.sub(r"[\s.,!?'\"()\[\]{}·`~-]+", "", (text or "").lower())


def matches_short_answer(correct_answer, user_answer):
    """정답(' / '로 여러 표현 가능)과 공백·문장부호만 다르면 같은 답으로 본다."""
    target = _normalize_answer(user_answer)
    return bool(target) and any(target == _normalize_answer(a) for a in re.split(r"\s*/\s*", correct_answer or ""))


def grade_answer(question_text, correct_answer, user_answer, user=None, question_type="essay"):
    """단답형/서술형 채점. 단답형이 정답과 글자 그대로 같으면 AI를 부르지 않는다."""
    if question_type == "short" and matches_short_answer(correct_answer, user_answer):
        return {"is_correct": True, "feedback": ""}
    data = core_ai.complete_json("grading", [
        {"role": "system", "content": (
            "학생 답안을 채점합니다. 문장이 달라도 핵심 내용이 모범답안과 맞으면 정답으로 관대하게 처리하세요.\n"
            'JSON으로만 답하세요: {"is_correct": true/false, "feedback": "한두 문장 피드백"}')},
        {"role": "user", "content": f"문제: {question_text}\n모범답안: {correct_answer}\n"
                                    + core_ai.untrusted("학생답안", user_answer)},
    ], user=user)
    return {"is_correct": bool(data.get("is_correct")), "feedback": data.get("feedback", "")}
