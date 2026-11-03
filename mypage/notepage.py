"""
'시험 5분 전 속성 노트'를 타이핑한 A4 문서 모양의 PNG로 그린다 (Pillow만 사용, 새 패키지 없음).

글꼴은 static/fonts/Pretendard-Regular.otf · Pretendard-Bold.otf (SIL OFL, 라이선스 파일 같은 폴더). 한글뿐 아니라 그리스 문자·화살표·수학
기호·첨자까지 들어 있어 글자를 바꿔 쓰지 않는다. $수식$은 mathbox가 분수·행렬·제곱근·합 기호 등을 실제 모양으로 조판해 본문 줄에 끼워 넣고
(to_rich), 해석하지 못한 수식만 글자(to_markup)로 대신 쓴다. 제목·소제목은 글자로만 쓴다.
모양: 굵은 제목(형광펜 띠) · '한눈에 보기' 차례 · 번호 칩이 달린 소제목 · 섹션 형식(글머리 목록 / 비교표 / 가지치기 / 번호 순서, 세부 항목) ·
굵은 빨간 글씨 · 노란·하늘색 형광펜(맨 아래 범례) · '마지막 체크' 상자 · 쪽 번호.
빈 곳이 남지 않게, 같은 쪽 수로 끝나는 가장 큰 글씨 크기를 골라 한 쪽을 알차게 채운다 (짧은 노트는 글씨가 커지고, 긴 노트는 작아지다가
그래도 넘치면 내용을 버리지 않고 다음 쪽에 이어 쓴다).

입력은 normalize_note()를 거친 dict: {"title", "sections": [{"heading", "kind", "points", "subs"(+ 표는 "columns", "rows")}], "memo": [...]}.
문장 안에서 쓸 수 있는 서식: **빨간 굵은 글씨**, ==노란 형광펜==, ++하늘색 형광펜++, $수식$ (아래 latex_to_markup이 간단한 것만 바꾼다).
"""
import io
import logging
import re
import unicodedata
from datetime import date

from PIL import Image, ImageDraw

from . import mathbox

logger = logging.getLogger(__name__)

from .notefont import BLACKBOARD as _BLACKBOARD, GREEK as _GREEK, LATEX_WORDS as _LATEX_WORDS, SUB as _SUB, SUP as _SUP, can_draw, draw_text, font, has_glyph, text_length  # noqa: F401

WIDTH = 1240
HEIGHT = 1754                     # A4 세로 (150dpi): 1240 x 1754
MARGIN_X = 88
TOP = 100
BOTTOM = 110                      # 아래쪽(쪽 번호 자리 포함)
MIN_SCALE = 0.8                   # 이보다 작아지기 전에 다음 쪽으로 이어 쓴다
MAX_SCALE = 1.25                  # 짧은 노트는 글씨를 이만큼까지 키워 쪽을 채운다

INK = (17, 24, 39)                # 제목·소제목
TEXT = (31, 41, 55)               # 본문
ACCENT = (234, 88, 12)            # 번호 칩·글머리 (사이트 기본 주황)
RED = (185, 28, 28)               # **굵은 빨간 글씨**
MARK = (255, 236, 99)             # 노란 형광펜 (외울 용어·숫자)
CYAN = (186, 230, 253)            # 하늘색 형광펜 (정의·공식)
GRAY = (107, 114, 128)
RULE = (229, 231, 235)
BOX_BG, BOX_LINE = (255, 247, 237), (251, 146, 60)
OUTLINE_BG = (249, 250, 251)
TABLE_HEAD, TABLE_FIRST, TABLE_LINE = (255, 237, 213), (255, 250, 245), (214, 211, 209)

TITLE_SIZE, HEAD_SIZE, BODY_SIZE, SMALL_SIZE = 60, 36, 29, 22
LINE_RATIO = 1.52                 # 본문 줄 간격 (글씨 크기 대비)

_BLACKBOARD = {"R": "ℝ", "N": "ℕ", "Z": "ℤ", "Q": "ℚ", "C": "ℂ"}      # \mathbb{R} 등: 글꼴에 없으면 그냥 문자로


def safe_text(text):
    """글꼴에 없는 글자(이모지 등)는 뺀다. x̄ 의 결합 막대는 앞 글자 위에 직접 막대를 그리도록 <bar>로 바꾼다."""
    out = []
    for ch in unicodedata.normalize("NFC", text):
        script = unicodedata.decomposition(ch)
        if ch == "̄":
            if out:
                out.append(f"<bar>{out.pop()}</bar>")
        elif unicodedata.combining(ch):
            continue
        elif script.startswith(("<super>", "<sub>")) and len(script.split()) == 2:      # x², Aᵀ, xᵢ 같은 첨자 글자는 직접 그리는 첨자로 (글꼴에 없는 것도 있다)
            tag = "sup" if script.startswith("<super>") else "sub"
            out.append(f"<{tag}>{chr(int(script.split()[1], 16))}</{tag}>")
        elif can_draw(ch):                                # 본 글꼴에 없어도 수학 글꼴에 있으면 그린다
            out.append(ch)
    return "".join(out)


# ── 수식·서식 → 간단한 태그 ──────────────────────────────────────────────────

def _brace_arg(s, i):
    """s[i]가 '{'이면 짝이 맞는 '}'까지의 안쪽과 다음 위치를, 아니면 한 글자를 돌려준다."""
    if i < len(s) and s[i] == "{":
        depth, j = 0, i
        while j < len(s):
            depth += (s[j] == "{") - (s[j] == "}")
            if depth == 0:
                return s[i + 1:j], j + 1
            j += 1
        return s[i + 1:], len(s)
    return (s[i:i + 1], i + 1)


def _flatten_environments(tex):
    """\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} 같은 환경은 [a b; c d] 한 줄로 바꾼다."""
    def flat(m):
        rows = [" ".join(r.split()) for r in re.split(r"\\\\", m.group(1).replace("&", " "))]
        return "[" + "; ".join(r for r in rows if r) + "]"

    tex = re.sub(r"\\begin\{[A-Za-z*]+\}(?:\{[^}]*\})?([\s\S]*?)\\end\{[A-Za-z*]+\}", flat, tex)
    return tex.replace("\\\\", "; ").replace("&", " ")


def latex_to_markup(tex):
    """간단한 LaTeX를 글(첨자는 <sub>/<sup>, 막대는 <bar>)로. 복잡한 식은 최대한 읽히게만 바꾼다."""
    s, out, i = _flatten_environments(tex), [], 0
    while i < len(s):
        c = s[i]
        if c == "\\":
            m = re.match(r"\\([A-Za-z]+)", s[i:])
            if not m:
                out.append(s[i + 1:i + 2] if i + 1 < len(s) else "")
                i += 2
                continue
            name, i = m.group(1), i + len(m.group(0))
            if name in _GREEK and re.match(r" +[A-Za-z0-9]", s[i:]):      # LaTeX에서 명령어 뒤 띄어쓰기는 무시된다 (\lambda v → λv). 연산자 앞은 그대로 둔다
                i += len(s[i:]) - len(s[i:].lstrip(" "))
            if name in ("bar", "overline"):
                arg, i = _brace_arg(s, i)
                out.append(f"<bar>{latex_to_markup(arg)}</bar>")
            elif name == "frac":
                a, i = _brace_arg(s, i)
                b, i = _brace_arg(s, i)
                out.append(f"({latex_to_markup(a)})/({latex_to_markup(b)})")
            elif name == "sqrt":
                a, i = _brace_arg(s, i)
                out.append(f"√({latex_to_markup(a)})")
            elif name == "mathbb":
                a, i = _brace_arg(s, i)
                out.append("".join(_BLACKBOARD.get(c, c) if can_draw(_BLACKBOARD.get(c, c)) else c for c in a))
            elif name in ("hat", "tilde", "text", "mathrm", "mathbf", "mathit", "mathcal", "mathsf", "boldsymbol", "operatorname"):
                a, i = _brace_arg(s, i)
                out.append(latex_to_markup(a))
            else:
                out.append(_LATEX_WORDS.get(name, name))
            continue
        if c in "_^":
            arg, i = _brace_arg(s, i + 1)
            tag = "sub" if c == "_" else "sup"
            out.append(f"<{tag}>{latex_to_markup(arg)}</{tag}>")
            continue
        if c in "{}":
            i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


_MATH = re.compile(r"\$\$([\s\S]+?)\$\$|\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)")
_TAGS = r"(</?(?:b|m|c|s|sub|sup|bar)>)"
_CYAN = re.compile(r"(?<![\w+])\+\+(?=\S)(.+?)(?<=\S)\+\+(?![\w+])")      # ++하늘색 형광펜++ ("C++ 와 C++" 같은 글은 건드리지 않는다)


def to_markup(text):
    """노트 문장 → 태그 문자열: $수식$, **강조**, ==형광펜== 을 <b>/<m>/<sub>/<sup>/<bar>로, 쓸 수 없는 글자는 뺀다."""
    text = _MATH.sub(lambda m: latex_to_markup((m.group(1) or m.group(2)).strip()), str(text or ""))
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"==(.+?)==", r"<m>\1</m>", text)
    text = _CYAN.sub(r"<c>\1</c>", text)
    text = text.replace("`", "")
    parts = re.split(_TAGS, text)                      # 태그를 보존한 채 글자만 안전하게 걸러낸다
    return "".join(p if re.fullmatch(_TAGS, p) else safe_text(p) for p in parts)


class Markup(str):
    """태그 문자열 + 그 안에 끼워 넣은 수식 덩어리 표(math: 번호 → MathAtom). 수식 자리는 \x01번호\x02로 적혀 있다."""
    math = {}


_SLOT = re.compile(r"\x01(\d+)\x02")


def to_rich(text):
    """노트 문장 → Markup: to_markup과 같지만 $수식$을 글자로 풀지 않고 분수·행렬 등을 그릴 수 있는 수식 덩어리(mathbox)로 둔다.
    해석하지 못한 수식은 이전처럼 글자로 쓴다."""
    registry, count = {}, [0]

    def slot(m):
        tex = (m.group(1) or m.group(2)).strip()
        atoms = mathbox.parse_chunks(tex)
        if not atoms:
            return latex_to_markup(tex)                       # 글자로 대신 쓴다
        ids = []
        for atom in atoms:
            count[0] += 1
            registry[count[0]] = atom
            ids.append(f"\x01{count[0]}\x02")
        return "".join(ids)

    text = _MATH.sub(slot, mathbox.wrap_bare_math(str(text or "")))      # $ 없이 쓴 [[행렬]]·그리스 문자 이름도 수식으로
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"==(.+?)==", r"<m>\1</m>", text)
    text = _CYAN.sub(r"<c>\1</c>", text)
    text = text.replace("`", "")
    out = []
    for part in re.split(_TAGS, text):                      # 태그와 수식 자리는 두고 나머지 글자만 걸러낸다
        if re.fullmatch(_TAGS, part):
            out.append(part)
        else:
            out.append("".join(p if k % 2 else safe_text(p) for k, p in enumerate(re.split(r"(\x01\d+\x02)", part))))
    markup = Markup("".join(out))
    markup.math = registry
    return markup


def parse_segments(markup):
    """태그 문자열 → [(글 또는 수식 덩어리, {스타일})]. 스타일: b(굵은 빨간 글씨) m(노란 형광펜) c(하늘색 형광펜) s(굵은 검은 글씨) sub sup bar."""
    registry = getattr(markup, "math", {})
    segs, active = [], set()
    for token in re.split(_TAGS, markup):
        m = re.fullmatch(r"<(/?)(b|m|c|s|sub|sup|bar)>", token)
        if m:
            (active.discard if m.group(1) else active.add)(m.group(2))
        elif token:
            for k, piece in enumerate(re.split(r"\x01(\d+)\x02", token)):
                if k % 2:
                    segs.append((registry[int(piece)], frozenset(active)))
                elif piece:
                    segs.append((piece, frozenset(active)))
    return segs


# ── 배치 ────────────────────────────────────────────────────────────────────

def _style_size(size, style):
    return max(int(size * 0.64), 10) if ("sub" in style or "sup" in style) else size


def _bold(style):
    return "b" in style or "s" in style


def _style_font(size, style):
    return font(_style_size(size, style), bold=_bold(style))


def _style_len(text, size, style):
    """글(본 글꼴에 없는 기호는 수학 글꼴로)의 너비."""
    return text_length(text, _style_size(size, style), bold=_bold(style))


def _words(segs):
    """세그먼트를 단어(공백 기준) 단위로 쪼갠다: [(글, 스타일, 뒤에 공백 있음)]."""
    out = []
    for text, style in segs:
        if isinstance(text, mathbox.MathAtom):               # 수식 덩어리는 쪼갤 수 없는 한 단어
            out.append((text, style, False))
            continue
        for piece in re.split(r"(\s+)", text):
            if not piece:
                continue
            if piece.isspace():
                if out:
                    out[-1] = (out[-1][0], out[-1][1], True)
                continue
            out.append((piece, style, False))
    return out

class PlacedMath:
    """줄에 놓인 수식 덩어리와 (너무 넓으면 줄인) 글씨 크기."""

    def __init__(self, atom, size):
        self.atom, self.size = atom, size

    def metrics(self):
        return self.atom.metrics(self.size)


def _wrap(segs, size, x0, x1):
    """너비에 맞춰 줄바꿈: 줄마다 [(글, 스타일, x, 단어 뒤 공백 너비)]. 한 줄보다 긴 단어는 글자 단위로 자른다."""
    lines, line, x = [], [], x0
    for text, style, spaced in _words(segs):
        if isinstance(text, mathbox.MathAtom):
            eff = text.fit(size, x1 - x0)
            w, gap = text.metrics(eff)[0], (font(size).getlength(" ") if spaced else 0)
            if line and x + w > x1:
                lines.append(line)
                line, x = [], x0
            line.append((PlacedMath(text, eff), style, x, gap))
            x += w + gap
            continue
        while _style_len(text, size, style) > x1 - x0 and len(text) > 1:       # 너무 긴 단어(URL·긴 식 등)
            cut = len(text) - 1
            while cut > 1 and _style_len(text[:cut], size, style) > x1 - x:
                cut -= 1
            if line and x + _style_len(text[:cut], size, style) > x1:
                lines.append(line)
                line, x = [], x0
            line.append((text[:cut], style, x, 0))
            lines.append(line)
            line, x, text = [], x0, text[cut:]
        gap = font(size).getlength(" ") if spaced else 0
        w = _style_len(text, size, style)
        if line and x + w > x1:
            lines.append(line)
            line, x = [], x0
        line.append((text, style, x, gap))
        x += w + gap
    if line:
        lines.append(line)
    return lines


class _Layout:
    """그릴 것들을 먼저 배치(높이 계산)한 뒤 한 번에 그린다. 배율 k는 글씨·간격을 함께 키우고 줄인다."""

    def __init__(self, k=1.0):
        self.k = k
        self.top = int(TOP * k)
        self.pages = [[]]                 # 쪽마다 그릴 것들. 넘치면 다음 쪽으로 이어 쓴다
        self.y = self.top
        self.bottom = HEIGHT - int(BOTTOM * k)
        self.lh = int(BODY_SIZE * LINE_RATIO * k)
        self.first_mid = 0

    def sz(self, value):
        return max(int(value * self.k), 12)

    @property
    def ops(self):
        return self.pages[-1]

    def need(self, height):
        """height만큼 더 쓸 자리가 이 쪽에 없으면 다음 쪽으로 넘어간다 (쪽 맨 위에서는 넘기지 않는다)."""
        if self.y + height > self.bottom and self.y > self.top + self.lh:
            self.pages.append([])
            self.y = self.top + self.lh

    def block(self, markup, size, x0, indent=0, x1=None):
        """문단을 줄들로 배치하고 줄마다 위·아래로 더 필요한 높이를 계산한다 (분수·행렬처럼 키가 큰 수식이 있는 줄은 간격이 넓어진다)."""
        lines = _wrap(parse_segments(markup), size, x0 + indent, x1 or WIDTH - MARGIN_X)
        ascent = font(size).getmetrics()[0]
        free_below = self.lh - ascent - 0.10 * size
        out = []
        for line in lines:
            up = down = 0.0
            for text, _style, _x, _gap in line:
                if isinstance(text, PlacedMath):
                    _w, asc, dsc = text.metrics()
                    up, down = max(up, asc + 0.05 * size - ascent), max(down, dsc - free_below)
            out.append((line, int(up), int(down)))
        return out, sum(self.lh + up + down for _line, up, down in out)

    def text_block(self, markup, size, x0, color=TEXT, indent=0, bullet=None, x1=None):
        lines, height = self.block(markup, size, x0, indent, x1)
        self.need(height)
        ascent = font(size).getmetrics()[0]
        for n, (line, up, down) in enumerate(lines):
            y = self.y + up
            if n == 0:
                self.first_mid = y + ascent - 0.3 * size          # 첫 줄의 가운데 높이 (글머리·가지 선이 여기에 닿는다)
            if n == 0 and bullet:
                self.ops.append(("bullet", x0, y, size, bullet))
            for text, style, x, gap in line:
                if isinstance(text, PlacedMath):
                    self.ops.append(("math", x, y + ascent, text.size, text.atom, style, color, gap))
                else:
                    self.ops.append(("word", x, y, size, text, style, color, gap))
            self.y += self.lh + up + down
        return len(lines)

    def gap(self, pixels):
        self.y += int(pixels * self.k)


def _fit_heading(markup, size):
    """소제목이 번호 칩 옆 한 줄에 들어가도록 필요하면 글씨를 줄인다."""
    avail = WIDTH - 2 * MARGIN_X - int(size * 1.6)
    segs = parse_segments(markup)
    while size > 20 and sum(_style_len(t, size, st | {"b"}) for t, st in segs) > avail:
        size -= 1
    return size


def _sub_size(lay):
    return lay.sz(BODY_SIZE - 2)


def _bullets(lay, section):
    """글머리 목록 (세부 항목은 한 칸 들여 쓴 짧은 줄 글머리)."""
    k, size = lay.k, lay.sz(BODY_SIZE)
    for point, subs in zip(section["points"], section.get("subs") or [[]] * len(section["points"])):
        lay.text_block(to_rich(point), size, MARGIN_X + int(6 * k), indent=int(34 * k), bullet="dot")
        for sub in subs:
            lay.text_block(to_rich(sub), _sub_size(lay), MARGIN_X + int(44 * k), indent=int(28 * k), bullet="dash")


def _item_height(lay, point, subs, x0, indent, sub_x0, sub_indent):
    height = lay.block(to_rich(point), lay.sz(BODY_SIZE), x0, indent)[1]
    return height + sum(lay.block(to_rich(t), _sub_size(lay), sub_x0, sub_indent)[1] for t in subs)


def _branches(lay, section, steps):
    """순서(번호 칩을 세로선으로 잇는다) 또는 가지치기(소제목에서 뻗은 가지 선). 한 항목(세부 포함)은 쪽 사이에서 갈라지지 않는다."""
    k, size = lay.k, lay.sz(BODY_SIZE)
    points, all_subs = section["points"], section.get("subs") or [[]] * len(section["points"])
    r = size * 0.55
    line_x = MARGIN_X + (int(6 * k) + r if steps else int(16 * k))
    x0, indent = (MARGIN_X + int(6 * k), int(52 * k)) if steps else (line_x + int(34 * k), 0)
    sub_x0, sub_indent = (MARGIN_X + int(60 * k), int(26 * k)) if steps else (x0 + int(10 * k) + int(26 * k), 0)
    for n, (point, subs) in enumerate(zip(points, all_subs)):
        last = n == len(points) - 1
        lay.need(_item_height(lay, point, subs, x0, indent, sub_x0, sub_indent))
        top = lay.y
        lay.text_block(to_rich(point), size, x0, indent=indent, bullet=("num", n + 1) if steps else None)
        mid = lay.first_mid
        if not steps:
            lay.ops.append(("hline", line_x, line_x + int(24 * k), mid, ACCENT))
        sub_line_x = x0 + int(10 * k)
        for j, sub in enumerate(subs):
            sub_top = lay.y
            lay.text_block(to_rich(sub), _sub_size(lay), sub_x0, indent=sub_indent, bullet="dash" if steps else None)
            if not steps:
                sub_mid = lay.first_mid
                lay.ops.append(("hline", sub_line_x, sub_line_x + int(18 * k), sub_mid, GRAY))
                lay.ops.append(("vline", sub_line_x, sub_top, sub_mid if j == len(subs) - 1 else lay.y, GRAY))
        bottom = lay.y
        start = top if (n or not steps) else mid
        lay.ops.append(("vline", line_x, start, mid if last else bottom, ACCENT if not steps else (253, 186, 116)))


def _table(lay, section):
    """비교표: 머리글 칸은 연한 주황, 첫 열은 굵게. 열 너비는 글 길이에 비례하고 행은 쪽 사이에서 갈라지지 않는다 (쪽이 바뀌면 머리글을 다시 쓴다)."""
    k, size = lay.k, lay.sz(BODY_SIZE - 3)
    columns, rows = section["columns"], section["rows"]
    total = WIDTH - 2 * MARGIN_X
    weights = [min(max(max(len(str(c)) for c in [columns[i]] + [r[i] for r in rows]), 8), 34) for i in range(len(columns))]
    floor = int(120 * k)
    widths = [max(int(total * w / sum(weights)), floor) for w in weights]
    widths[-1] += total - sum(widths)
    pad_x, pad_y = int(14 * k), int(9 * k)

    def cell_markup(text, strong):
        rich = to_rich(text)
        if not strong:
            return rich
        wrapped = Markup(f"<s>{rich}</s>")
        wrapped.math = rich.math
        return wrapped

    def draw_row(cells, header=False):
        xs = [MARGIN_X + sum(widths[:i]) for i in range(len(cells))]
        marks = [cell_markup(c, header or i == 0) for i, c in enumerate(cells)]
        heights = [lay.block(m, size, xs[i] + pad_x, 0, xs[i] + widths[i] - pad_x)[1] for i, m in enumerate(marks)]
        row_h = max(max(heights), lay.lh) + 2 * pad_y
        top = lay.y
        for i, m in enumerate(marks):
            fill = TABLE_HEAD if header else (TABLE_FIRST if i == 0 else (255, 255, 255))
            lay.ops.append(("rect", xs[i], top, xs[i] + widths[i], top + row_h, fill, TABLE_LINE))
            lay.y = top + pad_y
            lay.text_block(m, size, xs[i] + pad_x, x1=xs[i] + widths[i] - pad_x)
        lay.y = top + row_h

    def row_height(cells):
        xs = [MARGIN_X + sum(widths[:i]) for i in range(len(cells))]
        return max(max(lay.block(cell_markup(c, i == 0), size, xs[i] + pad_x, 0, xs[i] + widths[i] - pad_x)[1] for i, c in enumerate(cells)), lay.lh) + 2 * pad_y

    lay.need(row_height(columns) + row_height(rows[0]))          # 머리글만 쪽 끝에 홀로 남지 않게
    draw_row(columns, header=True)
    for row in rows:
        before = len(lay.pages)
        lay.need(row_height(row))
        if len(lay.pages) > before:                              # 쪽이 바뀌었으면 새 쪽 맨 위에 머리글을 다시 쓴다
            draw_row(columns, header=True)
        draw_row(row)


def _outline(lay, note):
    """'한눈에 보기': 섹션이 3개 이상이면 맨 위에 차례(번호·소제목 — 강조한 핵심어 몇 개)를 상자로 둔다. 핵심어는 글 속 강조 표시에서 뽑는다."""
    sections = note.get("sections", [])
    if len(sections) < 3:
        return
    k, size, head = lay.k, lay.sz(BODY_SIZE - 1), lay.sz(HEAD_SIZE)
    pad = int(20 * k)
    rows = []
    for n, section in enumerate(sections, 1):
        keys = _keywords(section)
        text = f"<s>{n}  {to_markup(section['heading'])}</s>" + (f"  —  {' · '.join(keys)}" if keys else "")
        rows.append(text)
    height = sum(lay.block(t, size, MARGIN_X + pad, 0, WIDTH - MARGIN_X - pad)[1] for t in rows)
    lay.need(int(head * 1.2) + height + 2 * pad)
    top = lay.y
    lay.y += pad
    lay.ops.append(("memo_title", MARGIN_X + pad, lay.y, lay.sz(HEAD_SIZE - 6), "한눈에 보기"))
    lay.y += int(lay.sz(HEAD_SIZE - 6) * 1.35)
    for t in rows:
        lay.text_block(t, size, MARGIN_X + pad, x1=WIDTH - MARGIN_X - pad)
    lay.y += pad // 2
    lay.ops.append(("box", MARGIN_X, top, WIDTH - MARGIN_X, lay.y, OUTLINE_BG, RULE))
    lay.gap(24)


_EMPHASIS = re.compile(r"\*\*(.+?)\*\*|==(.+?)==|" + _CYAN.pattern)


def _keywords(section, limit=3):
    """섹션 글에서 강조 표시(**, ==, ++)한 짧은 말을 순서대로 뽑는다 (수식·너무 긴 말은 건너뛴다)."""
    texts = list(section.get("points", [])) + [c for row in section.get("rows", []) for c in row]
    found = []
    for text in texts:
        for m in _EMPHASIS.finditer(text):
            word = next(g for g in m.groups() if g).strip()
            if "$" in word or not 1 < len(word) <= 14 or word in found:
                continue
            found.append(word)
    return [re.sub(_TAGS, "", to_markup(w)) for w in found[:limit]]


def _legend(lay, note):
    """서식 색의 뜻을 노트 맨 아래 작은 줄로 알려 준다 (실제로 쓴 색만)."""
    text = " ".join(section_strings(note))
    items = [(kind, label) for kind, found, label in (("red", "**" in text, "꼭 나오는 핵심"), ("mark", "==" in text, "외울 용어·숫자"), ("cyan", bool(_CYAN.search(text)), "정의·공식")) if found]
    if not items:
        return
    size = max(int(SMALL_SIZE * lay.k), 14)
    lay.need(size * 2)
    lay.gap(10)
    lay.ops.append(("legend", MARGIN_X, lay.y, size, items))
    lay.y += int(size * 1.8)


def section_strings(note):
    out = [note.get("title") or ""] + list(note.get("memo") or [])
    for s in note.get("sections", []):
        out += s.get("points", []) + [t for sub in s.get("subs", []) for t in sub] + list(s.get("columns", [])) + [c for r in s.get("rows", []) for c in r]
    return out


def _layout(note, k, today):
    """배율 k로 노트를 배치한다 (그리기 전에 쪽 수만 알아내는 용도로도 쓴다)."""
    lay = _Layout(k)
    sz = lay.sz
    lay.ops.append(("brand", MARGIN_X, lay.y, sz(SMALL_SIZE), "시험 5분 전 속성 노트"))
    lay.ops.append(("date", WIDTH - MARGIN_X, lay.y, sz(SMALL_SIZE), (today or date.today()).strftime("%Y.%m.%d")))
    lay.y += int(sz(SMALL_SIZE) * 1.9)

    title_size = sz(TITLE_SIZE)
    title_segs = [(t, st | {"b"}) for t, st in parse_segments(to_markup(note.get("title") or "시험 5분 전 노트"))]      # 제목은 굵은 글씨 너비로 줄바꿈
    title_lines = _wrap(title_segs, title_size, MARGIN_X, WIDTH - MARGIN_X)
    for line in title_lines:
        lay.ops.append(("title", lay.y, title_size, line))
        lay.y += int(title_size * 1.3)
    lay.ops.append(("rule", lay.y, 3, INK))
    lay.y += int(26 * k)

    _outline(lay, note)
    head = sz(HEAD_SIZE)
    for number, section in enumerate(note.get("sections", []), 1):
        lay.need(int(head * 1.9) + lay.lh * 2)          # 소제목만 쪽 끝에 홀로 남지 않게 첫 줄과 함께 넘긴다
        markup = to_markup(section.get("heading", ""))
        lay.ops.append(("heading", MARGIN_X, lay.y, _fit_heading(markup, head), markup, number))
        lay.y += int(head * 1.55)
        kind = section.get("kind", "list")
        if kind == "table":
            _table(lay, section)
        elif kind == "steps":
            _branches(lay, section, steps=True)
        elif kind == "tree":
            _branches(lay, section, steps=False)
        else:
            _bullets(lay, section)
        lay.gap(20)

    memo = note.get("memo") or []
    if memo:
        pad = int(22 * k)
        text_height = sum(lay.block(to_rich(item), sz(BODY_SIZE), MARGIN_X + pad, int(38 * k))[1] for item in memo)
        lay.need(int(head * 1.5) + text_height + 2 * pad + pad // 2)          # 상자가 쪽 사이에서 갈라지지 않게 통째로 넘긴다
        top = lay.y
        lay.y += pad
        lay.ops.append(("memo_title", MARGIN_X + pad, lay.y, head - 2, "마지막 체크!"))
        lay.y += int(head * 1.5)
        for item in memo:
            lay.text_block(to_rich(item), sz(BODY_SIZE), MARGIN_X + pad, indent=int(38 * k), bullet="check")
        lay.y += pad // 2
        lay.ops.append(("box", MARGIN_X, top, WIDTH - MARGIN_X, lay.y))
    _legend(lay, note)
    return lay


def render_notes(note, today=None):
    """노트 dict → A4(1240x1754) PNG 바이트 목록. 같은 쪽 수로 끝나는 가장 큰 글씨(MIN_SCALE~MAX_SCALE)를 쓰고,
    그래도 넘치면 내용을 버리지 않고 다음 쪽에 이어 쓴다."""
    fewest = len(_layout(note, MIN_SCALE, today).pages)
    lay = None
    for cand in range(int(MAX_SCALE * 100), int(MIN_SCALE * 100) - 1, -2):
        trial = _layout(note, cand / 100, today)
        if len(trial.pages) <= fewest:
            lay = trial
            break
    if lay is None:
        lay = _layout(note, MIN_SCALE, today)
    total, k = len(lay.pages), lay.k
    small = max(int(SMALL_SIZE * k), 14)
    for n, ops in enumerate(lay.pages):
        if n:
            ops.append(("word", MARGIN_X, int(TOP * k) - small - 6, small, f"{safe_text(note.get('title') or '')} (이어서)", frozenset(), GRAY, 0))
        ops.append(("footer", n + 1, total, small))
    return [_paint(ops, k) for ops in lay.pages]


# ── 그리기 ──────────────────────────────────────────────────────────────────

def _baseline(y, size):
    return y + font(size).getmetrics()[0]


def _draw_word(d, x, y, size, text, style, color, gap):
    """단어 하나를 그린다 (형광펜 띠·첨자·막대 포함). 기준선을 맞춰 크기가 다른 글자(첨자)도 한 줄에 어울린다."""
    fsize = _style_size(size, style)
    base = _baseline(y, size)
    if "sub" in style:
        base += size * 0.2
    elif "sup" in style:
        base -= size * 0.34
    width = text_length(text, fsize, bold=_bold(style))
    if "m" in style or "c" in style:
        d.rounded_rectangle([x - 3, base - size * 0.7, x + width + gap + 1, base + size * 0.24], radius=max(int(size * 0.12), 3), fill=MARK if "m" in style else CYAN)
    draw_text(d, x, base, text, fsize, RED if "b" in style else (INK if "s" in style else color), bold=_bold(style))
    if "bar" in style:
        d.line([(x + 2, base - size * 0.82), (x + width - 2, base - size * 0.82)], fill=color, width=max(size // 16, 2))


def _paint(ops, k):
    canvas = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))
    d = ImageDraw.Draw(canvas)
    # 형광펜 띠가 글자 뒤로 가도록 띠가 있는 단어를 먼저 그린 뒤 나머지를 그린다
    ordered = sorted(ops, key=lambda op: 0 if op[0] in ("box", "title", "rect", "vline", "hline") else 1)
    for op in ordered:
        kind = op[0]
        if kind == "box":
            x0, y0, x1, y1 = op[1:5]
            fill, line = op[5:7] if len(op) > 5 else (BOX_BG, BOX_LINE)
            d.rounded_rectangle([x0, y0, x1, y1], radius=int(16 * k), fill=fill, outline=line, width=3)
        elif kind == "rect":
            _, x0, y0, x1, y1, fill, line = op
            d.rectangle([x0, y0, x1, y1], fill=fill, outline=line, width=2)
        elif kind == "vline":
            _, x, y0, y1, color = op
            d.line([(x, y0), (x, y1)], fill=color, width=max(int(3 * k), 2))
        elif kind == "hline":
            _, x0, x1, y, color = op
            d.line([(x0, y), (x1, y)], fill=color, width=max(int(3 * k), 2))
        elif kind == "legend":
            _, x, y, size, items = op
            base = _baseline(y, size)
            for name, label in items:
                if name == "red":
                    x += draw_text(d, x, base, "가나", size, RED, bold=True) + 8
                else:
                    d.rounded_rectangle([x, base - size * 0.78, x + size * 1.5, base + size * 0.2], radius=4, fill=MARK if name == "mark" else CYAN)
                    x += size * 1.5 + 8
                x += draw_text(d, x, base, label, size, GRAY) + size * 1.4
        elif kind == "title":
            _, y, size, line = op
            if not line:
                continue
            x_end = max(x + _style_len(t, size, frozenset({"b"})) for t, _, x, _ in line)
            base = _baseline(y, size)
            d.rounded_rectangle([MARGIN_X - 6, base - size * 0.34, x_end + 8, base + size * 0.2], radius=8, fill=MARK)       # 제목 형광펜 띠
            for text, style, x, _ in line:
                draw_text(d, x, base, text, size, INK, bold=True)
        elif kind == "brand":
            _, x, y, size, text = op
            d.text((x, _baseline(y, size)), text, font=font(size, bold=True), fill=ACCENT, anchor="ls")
        elif kind == "date":
            _, xr, y, size, text = op
            d.text((xr, _baseline(y, size)), text, font=font(size), fill=GRAY, anchor="rs")
        elif kind == "rule":
            _, y, width, color = op
            d.line([(MARGIN_X, y), (WIDTH - MARGIN_X, y)], fill=color, width=width)
        elif kind == "heading":
            _, x, y, size, markup, number = op
            chip = int(size * 1.12)
            d.rounded_rectangle([x, y, x + chip, y + chip], radius=int(chip * 0.26), fill=ACCENT)
            d.text((x + chip / 2, y + chip / 2), str(number), font=font(int(size * 0.78), bold=True), fill=(255, 255, 255), anchor="mm")
            cx = x + chip + int(size * 0.4)
            for line in _wrap([(t, st | {"b"}) for t, st in parse_segments(markup)], size, cx, WIDTH - MARGIN_X)[:1]:
                for text, style, wx, gap in line:
                    draw_text(d, wx, y + chip / 2 + size * 0.3, text, _style_size(size, style), INK, bold=True)
            d.line([(x, y + chip + int(size * 0.28)), (WIDTH - MARGIN_X, y + chip + int(size * 0.28))], fill=RULE, width=2)
        elif kind == "word":
            _draw_word(d, *op[1:])
        elif kind == "math":
            _, x, base, size, atom, style, color, gap = op
            width, asc, dsc = atom.metrics(size)
            if "m" in style or "c" in style:
                d.rounded_rectangle([x - 3, base - asc - 3, x + width + gap + 1, base + dsc + 3], radius=6, fill=MARK if "m" in style else CYAN)
            try:
                atom.draw(d, x, base, size, RED if "b" in style else (INK if "s" in style else color))
            except Exception:                                 # 그리다 실패한 수식 하나 때문에 노트 전체가 실패하지 않게
                logger.exception("수식 그리기 실패")
        elif kind == "bullet":
            _, x, y, size, shape = op
            cy = _baseline(y, size) - size * 0.3
            if isinstance(shape, tuple):                            # 순서: 번호가 든 주황 동그라미
                r = size * 0.55
                d.ellipse([x, cy - r, x + 2 * r, cy + r], fill=ACCENT)
                d.text((x + r, cy), str(shape[1]), font=font(int(size * 0.7), bold=True), fill=(255, 255, 255), anchor="mm")
            elif shape == "dash":
                d.line([(x + 4, cy), (x + 4 + size * 0.34, cy)], fill=ACCENT, width=max(int(size * 0.09), 2))
            elif shape == "check":
                d.text((x, cy), "✓", font=font(int(size * 1.02), bold=True), fill=RED, anchor="lm")
            else:
                r = max(size * 0.1, 3)
                d.ellipse([x + 4, cy - r, x + 4 + 2 * r, cy + r], fill=ACCENT)
        elif kind == "memo_title":
            _, x, y, size, text = op
            d.text((x, y + size * 0.55), text, font=font(size, bold=True), fill=(194, 65, 12), anchor="lm")
        elif kind == "footer":
            _, n, total, size = op
            y = HEIGHT - int(BOTTOM * k) + int(34 * k)
            d.line([(MARGIN_X, y - 14), (WIDTH - MARGIN_X, y - 14)], fill=RULE, width=2)
            d.text((MARGIN_X, y), "IPSE LMS · 속성 노트", font=font(size), fill=GRAY, anchor="lm")
            if total > 1:
                d.text((WIDTH - MARGIN_X, y), f"{n} / {total}", font=font(size, bold=True), fill=GRAY, anchor="rm")

    out = io.BytesIO()
    canvas.save(out, "PNG", optimize=True)
    return out.getvalue()
