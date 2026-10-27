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
import random
import re
from collections import Counter

from django.conf import settings

from core import ai as core_ai

MARKITDOWN_EXTENSIONS = (".pdf", ".docx", ".pptx")
SUMMARY_CHUNK_CHARS = settings.AI_LIMIT_SUMMARY_CHUNK_CHARS   # 요약 크레딧 단위: 글자 수가 이만큼 늘 때마다 AI_COST_SUMMARY (4,000자당 1크레딧)
SUMMARY_WINDOW_CHARS = settings.AI_LIMIT_SUMMARY_WINDOW_CHARS # 요약 AI를 한 번 부를 때 넣는 본문 길이 (이보다 긴 자료는 나눠 모두 요약한다). 비용 단위와 따로 둬서 문맥은 넓게, 비용은 세밀하게
SUMMARY_MAX_CHUNKS = 30       # 한 자료에서 요약하는 크레딧 단위 수 상한 (4,000자씩 = 약 12만 자)
LEGACY_SUMMARY_CHARS = 12000  # 예전에는 앞 12,000자만 요약했다: 이보다 긴 자료의 옛 요약은 뒷부분이 빠졌을 수 있다
SUMMARY_INPUT_CHARS = SUMMARY_WINDOW_CHARS   # 예전 이름 (이 길이를 넘는 자료는 앞부분만 요약되던 시절의 기준)
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


PDF_PAGE_CHARS = 2500       # 요약과 위치를 맞출 때 쓰는 페이지당 글자 수 (화면으로 보내는 양을 줄인다)
PDF_MAX_PAGES = 400


def pdf_page_texts(document):
    """PDF 원문의 페이지별 글 (요약 조각이 원문 몇 쪽인지 맞추는 데 쓴다). 읽지 못하면 빈 목록. 문서당 하루 캐시."""
    from django.core.cache import cache

    key = f"pdfpages:{document.pk}:{document.content_hash or document.uploaded_at.timestamp()}"
    pages = cache.get(key)
    if pages is None:
        try:
            from pypdf import PdfReader

            with document.file.open("rb") as fh:
                reader = PdfReader(fh)
                pages = [(page.extract_text() or "")[:PDF_PAGE_CHARS] for page in reader.pages[:PDF_MAX_PAGES]]
        except Exception:
            pages = []
        cache.set(key, pages, 86400)
    return pages


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


IMAGE_MAX_SIDE = 2400


def prepare_image(raw, name=""):
    """글자를 읽기 전에 사진을 정리한다: 휴대폰 사진의 회전(EXIF)을 바로잡고, 너무 큰 사진은 줄이고(요청 크기·토큰 절약),
    투명 배경은 흰색으로 채워 JPEG로 만든다. 읽지 못하면 원본 그대로. (바이트, 확장자) 반환."""
    mime = "jpeg" if name.lower().endswith((".jpg", ".jpeg")) else "png"
    try:
        from PIL import Image, ImageOps

        image = ImageOps.exif_transpose(Image.open(io.BytesIO(raw)))
        if image.mode in ("RGBA", "LA", "P"):
            image = image.convert("RGBA")
            background = Image.new("RGB", image.size, "white")
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode != "RGB":
            image = image.convert("RGB")
        image.thumbnail((IMAGE_MAX_SIDE, IMAGE_MAX_SIDE))
        out = io.BytesIO()
        image.save(out, "JPEG", quality=88)
        return out.getvalue(), "jpeg"
    except Exception:
        return raw, mime


OCR_PROMPT = (
    "이 이미지에 있는 글자를 빠짐없이 마크다운으로 그대로 옮겨 적어라. 시험지·문제지라면 문제 번호, 보기(①②③ 등), 배점, "
    "빈칸, 표를 원래대로 유지하고 정답은 지어내지 마라. 읽을 수 없는 부분은 [판독 불가]로 표시한다. 설명은 붙이지 마라."
)


def _extract_image(raw, name, user=None):
    import base64

    prepared, mime = prepare_image(raw, name)
    b64 = base64.b64encode(prepared).decode()
    return core_ai.complete("ocr", [{
        "role": "user",
        "content": [
            {"type": "text", "text": OCR_PROMPT},
            {"type": "image_url", "image_url": {"url": f"data:image/{mime};base64,{b64}"}},
        ],
    }], user=user, cost=core_ai.ocr_cost(len(raw)))      # 이미지는 (원본) 크기로 크레딧을 받는다


SUMMARY_INSTRUCTIONS = (
    "학생이 올린 학습 자료를 요약합니다. 복습에 바로 쓸 수 있게 마크다운 서식을 적극 활용해 구조화하세요.\n"
    "구조 (가장 중요: 학생은 한 화면에 한 조각씩 넘겨 가며 읽으므로 잘게 쪼갭니다)\n"
    "- 큰 주제마다 `## 제목`, 그 안의 세부 주제는 `### 부제목`으로 나눕니다. 제목은 짧은 명사구로.\n"
    "- 조각 하나(제목 + 그 아래 내용)는 공백 포함 350자 안팎, 목록은 5개 이내로 끝냅니다. 길어지면 `###`를 더 만들어 나눕니다. "
    "한 `##` 아래 `###`는 여러 개여도 좋습니다. 제목만 있고 내용이 없는 조각은 만들지 않습니다.\n"
    "- 조각마다 모양을 달리해 한눈에 구분되게 합니다: 어떤 건 한 줄 정의(`> `)+핵심 목록, 어떤 건 표, 어떤 건 번호 절차.\n"
    "- 설명은 짧은 문장과 목록(`-`, 하위는 앞에 공백 2칸)으로. 순서·절차는 `1.` 번호 목록.\n"
    "- 비교할 대상이 둘 이상이면 표(`| 구분 | 내용 |` + `|---|---|`)로 정리합니다.\n"
    "- 정의·법칙은 `> ` 인용 한 줄로 따로 눈에 띄게.\n"
    "- 수식은 LaTeX를 `$...$`로 감쌉니다 (예: $\\bar{x}$, $Q_3 - Q_1$). 수식을 백틱(`)으로 한 번 더 감싸지 마세요. 금액·일반 글에는 `$`를 쓰지 않습니다.\n"
    "강조 (적재적소에, 남발하지 않기)\n"
    "- 핵심 용어·개념은 **굵게**.\n"
    "- 꼭 외워야 할 핵심 한 구절은 ==형광펜==.\n"
    "- 헷갈리기 쉬운 부분·주의할 점은 ~물결 밑줄~ (앞뒤를 띄어 쓰고, 연도·범위 표기의 `~`와 섞이지 않게).\n"
    "- 코드·함수 이름·고유 표기는 `인라인 코드`. 수식은 코드가 아니라 위의 $...$ 로만 씁니다.\n"
    "내용\n"
    "- 자료에 있는 정의·예시·수치는 빠뜨리지 말되 같은 말을 되풀이하지 않습니다.\n"
    "- 자료에 없는 내용은 덧붙이지 않습니다. 요약문만 출력합니다."
)


# 족보(기출·모의고사)는 내용을 외우는 용도가 아니라 '무엇이 어떤 모양으로 나오는지' 보는 자료다
EXAM_SUMMARY_INSTRUCTIONS = (
    "학생이 올린 족보(기출문제·모의고사)를 요약합니다. 마크다운으로 구조화하세요.\n"
    "- `## 출제 범위`: 어떤 단원·개념이 몇 문항쯤 나왔는지 짧은 목록으로.\n"
    "- `## 문제 유형`: OX·객관식·단답·서술·계산·코드 등 어떤 유형이 어떤 비중으로 나왔는지, 문제 문장의 특징(예: 보기를 고르는 방식, 길이, 난이도).\n"
    "- `## 자주 나오는 포인트`: 반복해서 묻는 개념이나 함정.\n"
    "문제와 정답을 그대로 옮기지 말고 위 세 가지를 짧게 정리하며, 자료에 없는 내용은 덧붙이지 않습니다. 요약문만 출력합니다."
)


def summary_chunk_count(text):
    """이 본문을 요약할 때 드는 크레딧 단위 수 (글자 수 / SUMMARY_CHUNK_CHARS 올림, AI를 부르지 않고 센다). 사전 확인·비용 표시에 쓴다."""
    if not text.strip():
        return 0
    return max(1, min(-(-sum(len(c) for c in split_for_summary(text)) // SUMMARY_CHUNK_CHARS), SUMMARY_MAX_CHUNKS))


def _window_charges(windows):
    """윈도우(AI 한 번 호출)마다 받을 크레딧 단위. 누적 글자 수의 올림 차이로 나눠, 합이 summary_chunk_count와 같다."""
    out, cum, prev = [], 0, 0
    for w in windows:
        cum += len(w)
        units = -(-cum // SUMMARY_CHUNK_CHARS)
        out.append(units - prev)
        prev = units
    return out


SUMMARY_MAX_CHARS = SUMMARY_MAX_CHUNKS * SUMMARY_CHUNK_CHARS    # 자료 하나로 요약할 수 있는 글자 수 (약 12만 자)


def summary_too_long(text):
    """요약 조각 수가 한도를 넘는 자료인가. 이런 자료는 앞부분만 요약되므로 요약하지 않고 쪼개서 올리게 한다."""
    return sum(len(c) for c in split_for_summary(text)) > SUMMARY_MAX_CHARS


def too_long_message(total_chars):
    return (f"글자가 {total_chars:,}자예요. 한 자료는 약 {SUMMARY_MAX_CHARS:,}자(요약 {SUMMARY_MAX_CHUNKS}조각)까지만 올릴 수 있어요. "
            f"PDF를 장별로 쪼개서 {SUMMARY_MAX_CHARS:,}자 이하로 맞춰 올려주세요.")


def split_for_summary(text, chunk_chars=SUMMARY_WINDOW_CHARS):
    """본문을 chunk_chars 안팎의 조각으로 나눈다. 빈 줄(문단·슬라이드 경계)에서 자르고, 한 문단이 너무 길면 줄 단위로,
    그래도 길면 글자 수로 자른다. 내용은 하나도 버리지 않는다."""
    blocks = []
    for para in re.split(r"\n\s*\n", text.strip()):
        while len(para) > chunk_chars:
            cut = para.rfind("\n", 0, chunk_chars)
            cut = cut if cut > chunk_chars // 2 else chunk_chars
            blocks.append(para[:cut])
            para = para[cut:].lstrip("\n")
        if para.strip():
            blocks.append(para)
    chunks, current = [], ""
    for block in blocks:
        if current and len(current) + len(block) + 2 > chunk_chars:
            chunks.append(current)
            current = block
        else:
            current = f"{current}\n\n{block}" if current else block
    if current:
        chunks.append(current)
    if len(chunks) > 1 and len(chunks[-1]) < chunk_chars // 6:   # 아주 짧은 꼬리는 따로 부르지 않고 앞 조각에 붙인다
        tail = chunks.pop()
        chunks[-1] = f"{chunks[-1]}\n\n{tail}"
    return chunks


def generate_summary(extracted_text, user=None, kind="lecture", on_text=None):
    """업로드된 문서 본문을 구조화된 요약으로 반환한다. 본문이 없으면 호출 없이 빈 문자열.
    긴 자료는 12,000자 안팎으로 나눠 요약해 이어 붙인다 (예전에는 앞 12,000자만 넣어 뒷부분이 통째로 빠졌다). 크레딧은 호출 크기와 상관없이 글자 수 4,000자당 1로 세밀하게 받는다.
    on_text(글자 조각)을 주면 요약이 만들어지는 대로 넘긴다 (화면에 바로 보여 주는 스트리밍). 모자라면 낼 수 있는 곳까지만 요약한다."""
    if not extracted_text.strip():
        return ""
    chunks = split_for_summary(extracted_text)
    charges = _window_charges(chunks)
    remaining = core_ai.affordable_units(user, "summary")      # 낼 수 있는 크레딧 단위 수 (제한 없으면 None)
    if remaining is not None and charges[0] > remaining:
        core_ai.require_quota(user, charges[0] * core_ai.cost_for("summary"))    # 첫 부분도 못 내면 부족하다는 안내와 함께 중단
    parts, paid = [], 0
    for i, (chunk, units) in enumerate(zip(chunks, charges)):
        if remaining is not None:
            if units > remaining:
                break                                         # 크레딧으로 낼 수 있는 곳까지만 요약한다
            remaining -= units
        try:
            if on_text and parts:
                on_text("\n\n")                                   # 앞 부분 요약과 이어 붙이는 빈 줄
            parts.append(_summarize_chunk(chunk, i, len(chunks), user, kind, cost=units * core_ai.cost_for("summary"), on_text=on_text))
        except Exception:
            core_ai.refund(user, "summary", paid * core_ai.cost_for("summary"))   # 앞 조각에 낸 크레딧도 돌려준다
            raise
        paid += units
    return "\n\n".join(p for p in parts if p.strip())


def _summarize_chunk(chunk, i, total, user, kind="lecture", cost=None, on_text=None):
    system = EXAM_SUMMARY_INSTRUCTIONS if kind == "exam" else SUMMARY_INSTRUCTIONS
    if total > 1:
        system += (f"\n\n이 자료는 길어서 {total}조각으로 나눈 {i + 1}번째 조각입니다. 이 조각에 있는 내용만 빠짐없이 요약하고, "
                   "전체 요약인 것처럼 서두나 맺음말을 쓰지 마세요.")
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": core_ai.untrusted("자료", chunk)},
    ]
    if on_text:
        return core_ai.stream_complete("summary", messages, user=user, cost=cost, on_delta=on_text)
    return core_ai.complete("summary", messages, user=user, cost=cost)


QUESTION_TYPE_LABELS = {"ox": "OX(참/거짓)", "short": "단답형", "essay": "서술형"}


def generate_one_question(extracted_text, question_type, existing_questions=(), user=None, index=0, rng=None, style=""):
    """문서 본문을 근거로 지정된 유형(ox/short/essay)의 문제를 1개 만든다.
    반환: {"question", "answer", "explanation"} — explanation은 OX 해설(틀렸을 때 보여줌, 다시 부르지 않음).
    문서 본문을 시스템 메시지에 고정해 같은 문서로 여러 문제를 만들 때 프롬프트 캐시가 적용되게 한다."""
    system = (
        "학생이 올린 학습 자료만 근거로 복습 문제를 1개 만듭니다. 자료에 없는 내용은 묻지 않습니다.\n"
        'JSON으로만 답하세요: {"question": "...", "answer": "...", "explanation": "..."}\n'
        "- OX 문제의 answer는 O 또는 X, explanation은 정답 근거를 한두 문장으로.\n"
        "- 단답형은 하나의 답(단어나 짧은 구)만 묻습니다. '~를 여섯 개 쓰시오'처럼 여러 개를 나열하게 하는 문제는 만들지 마세요. "
        "같은 답을 가리키는 다른 표현만 ' | '로 구분해 answer에 씁니다 (예: 'JOIN | 조인'). 서술형은 모범답안.\n"
        "- 문제 문장에 'OX로 답하시오', '단답으로 쓰시오' 같은 답변 방식 안내는 붙이지 마세요 (화면에 입력 방법이 있습니다).\n"
        + (f"- 교수님 족보에서 배운 출제 스타일이 있습니다. 문제 문장·난이도·묻는 방식을 이에 맞추되, 족보의 문제를 그대로 베끼지 마세요:\n{style}\n" if style else "")
        + "\n" + core_ai.untrusted("자료", question_window(extracted_text, index))
    )
    request = f"{QUESTION_TYPE_LABELS[question_type]} 문제 1개를 만들어주세요."
    if existing_questions:
        request += ("\n이미 만든 문제들입니다. 같은 내용을 묻거나 표현만 바꾼 문제는 만들지 말고, "
                    "자료의 다른 부분에서 새 문제를 만드세요:\n" + "\n".join(f"- {q}" for q in existing_questions))
    # OX는 정답(O/X)을 코드가 먼저 정해 모델에 알려 준다 — 그냥 두면 자료 문장을 그대로 옮긴 '참' 진술만 만들어 늘 O가 정답이 된다
    target = (rng or random).choice(["O", "X"]) if question_type == "ox" else None
    if target == "O":
        request += "\n이번 문제의 정답은 O입니다: 자료의 내용과 일치하는 참인 진술로 만드세요."
    elif target == "X":
        request += ("\n이번 문제의 정답은 X입니다: 자료의 사실 하나(숫자·용어·조건·방향·주체 등)를 그럴듯하게 바꿔 "
                    "거짓인 진술로 만들고, explanation에 올바른 사실을 쓰세요.")
    messages = [{"role": "system", "content": system}, {"role": "user", "content": request}]
    data = core_ai.complete_json("question", messages, user=user)
    if target and str(data.get("answer", "")).strip().upper() != target:   # 모델이 정해 준 정답을 따르지 않으면 한 번 더
        messages[1] = {"role": "user", "content": request + f"\n(반드시 answer는 {target}이어야 합니다. 다시 만들어 주세요.)"}
        data = core_ai.complete_json("question", messages, user=user)
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
    return re.sub(r"[\s.,!?'\"()\[\]{}·`~/|\-]+", "", (text or "").lower())


def _word_tokens(text):
    """글자 비교용 단어 목록 (공백·쉼표·슬래시·중점으로 나눔, 소문자, 문장부호 제거)."""
    return [t for t in (re.sub(r"[.!?'\"()\[\]{}`~\-]+", "", w).lower()
                        for w in re.split(r"[\s,/|·;]+", text or "")) if t]


def matches_short_answer(correct_answer, user_answer):
    """AI 없이 바로 정답으로 볼 수 있는 경우: ① 공백·문장부호만 다른 같은 답, ② ' | '로 적어 둔 대안 표현 중 하나.
    (' / '는 항목 구분일 수도 있어서 대안으로 취급하지 않는다 — 예: 'Ut / Re / Mi'에서 'Ut'만 써도 정답이 되면 안 된다.)"""
    target = _normalize_answer(user_answer)
    if not target:
        return False
    correct = correct_answer or ""
    if target == _normalize_answer(correct):
        return True
    return "|" in correct and any(target == _normalize_answer(a) for a in re.split(r"\s*\|\s*", correct))


def answer_diff(correct_answer, user_answer):
    """(학생 답에만 있는 단어, 모범답안에만 있는 단어) — AI 채점이 틀린 부분을 지어내지 않고 그대로 인용하게 한다."""
    correct, given = _word_tokens(correct_answer), _word_tokens(user_answer)
    return [w for w in given if w not in correct], [w for w in correct if w not in given]


GRADING_SYSTEM = (
    "학생 답안을 채점합니다.\n"
    "- 표현이 달라도 핵심 내용이 모범답안과 같으면 정답입니다. 한두 글자 오타·띄어쓰기·대소문자 차이는 정답으로 인정하되 "
    "피드백에 올바른 표기를 알려 주세요.\n"
    "- 모범답안의 ' | '는 같은 답의 다른 표현입니다. ' / '나 쉼표는 항목 구분일 수도, 대안 표현일 수도 있으니 문제를 보고 판단하세요. "
    "문제가 여러 항목을 쓰라고 했다면 모든 항목이 맞아야 정답이고, 하나만 고르라고 했다면 하나만 맞아도 정답입니다.\n"
    "- 사용자 메시지의 '차이'는 프로그램이 계산한 값입니다. 피드백에서 틀린 부분을 말할 때는 이 값을 그대로 인용하고, "
    "학생이 쓰지 않은 내용을 쓴 것처럼 말하지 마세요. 정답이면 feedback은 비워도 됩니다.\n"
    'JSON으로만 답하세요: {"is_correct": true/false, "feedback": "한두 문장"}'
)


def grade_answer(question_text, correct_answer, user_answer, user=None, question_type="essay"):
    """단답형/서술형 채점. 단답형이 정답과 글자 그대로 같으면 AI를 부르지 않는다."""
    if question_type == "short" and matches_short_answer(correct_answer, user_answer):
        return {"is_correct": True, "feedback": ""}
    diff = ""
    if question_type == "short":
        extra, missing = answer_diff(correct_answer, user_answer)
        diff = (f"차이 — 학생 답에만 있는 단어: {', '.join(extra) or '없음'} / "
                f"모범답안에만 있는 단어: {', '.join(missing) or '없음'}\n")
    data = core_ai.complete_json("grading", [
        {"role": "system", "content": GRADING_SYSTEM},
        {"role": "user", "content": f"문제: {question_text}\n모범답안: {correct_answer}\n{diff}"
                                    + core_ai.untrusted("학생답안", user_answer)},
    ], user=user)
    return {"is_correct": bool(data.get("is_correct")), "feedback": data.get("feedback", "")}
