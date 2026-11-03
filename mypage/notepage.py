"""
'시험 5분 전 속성 노트'를 타이핑한 A4 문서 모양의 PNG로 그린다 (Pillow만 사용, 새 패키지 없음).

글꼴은 static/fonts/Pretendard-Regular.otf · Pretendard-Bold.otf (SIL OFL, 라이선스 파일 같은 폴더). 한글뿐 아니라 그리스 문자·화살표·수학
기호·첨자까지 들어 있어 글자를 바꿔 쓰지 않는다. 첨자(<sub>/<sup>)와 평균 막대(x̄)만 직접 그린다.
모양: 굵은 제목(형광펜 띠) · 번호 칩이 달린 소제목 · 글머리 목록 · 굵은 빨간 글씨 · 노란 형광펜 · '마지막 체크' 상자 · 쪽 번호.
빈 곳이 남지 않게, 같은 쪽 수로 끝나는 가장 큰 글씨 크기를 골라 한 쪽을 알차게 채운다 (짧은 노트는 글씨가 커지고, 긴 노트는 작아지다가
그래도 넘치면 내용을 버리지 않고 다음 쪽에 이어 쓴다).

입력은 normalize_note()를 거친 dict: {"title", "sections": [{"heading", "points": [...]}], "memo": [...]}.
문장 안에서 쓸 수 있는 서식: **빨간 굵은 글씨**, ==형광펜==, $수식$ (아래 latex_to_markup이 간단한 것만 바꾼다).
"""
import io
import os
import re
import unicodedata
from datetime import date

from django.conf import settings
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = os.path.join(str(settings.BASE_DIR), "static", "fonts")
FONT_REGULAR = os.path.join(FONT_DIR, "Pretendard-Regular.otf")
FONT_BOLD = os.path.join(FONT_DIR, "Pretendard-Bold.otf")

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
MARK = (255, 236, 99)             # 형광펜
GRAY = (107, 114, 128)
RULE = (229, 231, 235)
BOX_BG, BOX_LINE = (255, 247, 237), (251, 146, 60)

TITLE_SIZE, HEAD_SIZE, BODY_SIZE, SMALL_SIZE = 60, 36, 29, 22
LINE_RATIO = 1.52                 # 본문 줄 간격 (글씨 크기 대비)

_SUB = dict(zip("₀₁₂₃₄₅₆₇₈₉", "0123456789"))
_SUP = dict(zip("⁰¹²³⁴⁵⁶⁷⁸⁹", "0123456789"))
# LaTeX 명령 → 글꼴에 있는 실제 기호
_LATEX_WORDS = {
    "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε", "varepsilon": "ε", "zeta": "ζ", "eta": "η", "theta": "θ",
    "lambda": "λ", "mu": "μ", "nu": "ν", "xi": "ξ", "pi": "π", "rho": "ρ", "sigma": "σ", "tau": "τ", "phi": "φ", "varphi": "φ",
    "chi": "χ", "psi": "ψ", "omega": "ω", "Gamma": "Γ", "Delta": "Δ", "Theta": "Θ", "Lambda": "Λ", "Pi": "Π", "Sigma": "Σ",
    "Phi": "Φ", "Psi": "Ψ", "Omega": "Ω", "sum": "Σ", "prod": "Π", "int": "∫", "infty": "∞", "partial": "∂", "nabla": "∇",
    "le": "≤", "leq": "≤", "ge": "≥", "geq": "≥", "ne": "≠", "neq": "≠", "approx": "≈", "equiv": "≡", "propto": "∝",
    "pm": "±", "mp": "∓", "times": "×", "cdot": "·", "div": "÷", "to": "→", "rightarrow": "→", "leftarrow": "←",
    "Rightarrow": "⇒", "Leftarrow": "⇐", "leftrightarrow": "↔", "therefore": "∴", "because": "∵",
    "ldots": "…", "cdots": "…", "dots": "…", "in": "∈", "notin": "∉", "subset": "⊂", "supset": "⊃", "cup": "∪", "cap": "∩",
    "forall": "∀", "exists": "∃", "prime": "′",
    "log": "log", "ln": "ln", "exp": "exp", "min": "min", "max": "max", "det": "det", "sin": "sin", "cos": "cos", "tan": "tan",
    "lim": "lim", "Pr": "P", "quad": " ", "qquad": " ", "left": "", "right": "", "hat": "", "tilde": "", "text": "",
    "mathrm": "", "mathbf": "",
}

_GREEK = {"alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta", "lambda", "mu", "nu", "xi", "pi", "rho",
          "sigma", "tau", "phi", "varphi", "chi", "psi", "omega", "Gamma", "Delta", "Theta", "Lambda", "Pi", "Sigma", "Phi", "Psi", "Omega"}
_font_cache = {}
_glyph_cache = {}
_BLACKBOARD = {"R": "ℝ", "N": "ℕ", "Z": "ℤ", "Q": "ℚ", "C": "ℂ"}      # \mathbb{R} 등: 글꼴에 없으면 그냥 문자로


def font(size, bold=False):
    key = (size, bold)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)
    return _font_cache[key]


def has_glyph(ch):
    """글꼴에 이 글자가 있는가. 없는 글자는 '없음 표시(notdef)'라는 네모로 그려지므로, 그 그림과 같으면 없는 것으로 본다."""
    if ch not in _glyph_cache:
        f = font(BODY_SIZE)
        _glyph_cache[ch] = ch.isspace() or bytes(f.getmask(ch)) != bytes(f.getmask("\uFFFF"))
    return _glyph_cache[ch]


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
        elif has_glyph(ch):
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
                out.append("".join(_BLACKBOARD.get(c, c) if has_glyph(_BLACKBOARD.get(c, c)) else c for c in a))
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
_TAGS = r"(</?(?:b|m|sub|sup|bar)>)"


def to_markup(text):
    """노트 문장 → 태그 문자열: $수식$, **강조**, ==형광펜== 을 <b>/<m>/<sub>/<sup>/<bar>로, 쓸 수 없는 글자는 뺀다."""
    text = _MATH.sub(lambda m: latex_to_markup((m.group(1) or m.group(2)).strip()), str(text or ""))
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"==(.+?)==", r"<m>\1</m>", text)
    text = text.replace("`", "")
    parts = re.split(_TAGS, text)                      # 태그를 보존한 채 글자만 안전하게 걸러낸다
    return "".join(p if re.fullmatch(_TAGS, p) else safe_text(p) for p in parts)


def parse_segments(markup):
    """태그 문자열 → [(글, {스타일})]. 스타일: b(굵은 빨간 글씨) m(형광펜) sub sup bar."""
    segs, active = [], set()
    for token in re.split(_TAGS, markup):
        m = re.fullmatch(r"<(/?)(b|m|sub|sup|bar)>", token)
        if m:
            (active.discard if m.group(1) else active.add)(m.group(2))
        elif token:
            segs.append((token, frozenset(active)))
    return segs


# ── 배치 ────────────────────────────────────────────────────────────────────

def _style_font(size, style):
    if "sub" in style or "sup" in style:
        size = max(int(size * 0.64), 10)
    return font(size, bold="b" in style)


def _words(segs):
    """세그먼트를 단어(공백 기준) 단위로 쪼갠다: [(글, 스타일, 뒤에 공백 있음)]."""
    out = []
    for text, style in segs:
        for piece in re.split(r"(\s+)", text):
            if not piece:
                continue
            if piece.isspace():
                if out:
                    out[-1] = (out[-1][0], out[-1][1], True)
                continue
            out.append((piece, style, False))
    return out

def _wrap(segs, size, x0, x1):
    """너비에 맞춰 줄바꿈: 줄마다 [(글, 스타일, x, 단어 뒤 공백 너비)]. 한 줄보다 긴 단어는 글자 단위로 자른다."""
    lines, line, x = [], [], x0
    for text, style, spaced in _words(segs):
        f = _style_font(size, style)
        while f.getlength(text) > x1 - x0 and len(text) > 1:       # 너무 긴 단어(URL·긴 식 등)
            cut = len(text) - 1
            while cut > 1 and f.getlength(text[:cut]) > x1 - x:
                cut -= 1
            if line and x + f.getlength(text[:cut]) > x1:
                lines.append(line)
                line, x = [], x0
            line.append((text[:cut], style, x, 0))
            lines.append(line)
            line, x, text = [], x0, text[cut:]
        gap = font(size).getlength(" ") if spaced else 0
        w = f.getlength(text)
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

    def text_block(self, markup, size, x0, color=TEXT, indent=0, bullet=None):
        lines = _wrap(parse_segments(markup), size, x0 + indent, WIDTH - MARGIN_X)
        self.need(len(lines) * self.lh)
        for n, line in enumerate(lines):
            if n == 0 and bullet:
                self.ops.append(("bullet", x0, self.y, size, bullet))
            for text, style, x, gap in line:
                self.ops.append(("word", x, self.y, size, text, style, color, gap))
            self.y += self.lh
        return len(lines)

    def gap(self, pixels):
        self.y += int(pixels * self.k)


def _fit_heading(markup, size):
    """소제목이 번호 칩 옆 한 줄에 들어가도록 필요하면 글씨를 줄인다."""
    avail = WIDTH - 2 * MARGIN_X - int(size * 1.6)
    segs = parse_segments(markup)
    while size > 20 and sum(_style_font(size, st | {"b"}).getlength(t) for t, st in segs) > avail:
        size -= 1
    return size


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

    head = sz(HEAD_SIZE)
    for number, section in enumerate(note.get("sections", []), 1):
        lay.need(int(head * 1.9) + lay.lh * 2)          # 소제목만 쪽 끝에 홀로 남지 않게 첫 줄과 함께 넘긴다
        markup = to_markup(section.get("heading", ""))
        lay.ops.append(("heading", MARGIN_X, lay.y, _fit_heading(markup, head), markup, number))
        lay.y += int(head * 1.55)
        for point in section.get("points", []):
            lay.text_block(to_markup(point), sz(BODY_SIZE), MARGIN_X + int(6 * k), indent=int(34 * k), bullet="dot")
        lay.gap(20)

    memo = note.get("memo") or []
    if memo:
        pad = int(22 * k)
        text_x = MARGIN_X + pad + int(38 * k)
        lines = sum(len(_wrap(parse_segments(to_markup(item)), sz(BODY_SIZE), text_x, WIDTH - MARGIN_X)) for item in memo)
        lay.need(int(head * 1.5) + lines * lay.lh + 2 * pad + pad // 2)          # 상자가 쪽 사이에서 갈라지지 않게 통째로 넘긴다
        top = lay.y
        lay.y += pad
        lay.ops.append(("memo_title", MARGIN_X + pad, lay.y, head - 2, "마지막 체크!"))
        lay.y += int(head * 1.5)
        for item in memo:
            lay.text_block(to_markup(item), sz(BODY_SIZE), MARGIN_X + pad, indent=int(38 * k), bullet="check")
        lay.y += pad // 2
        lay.ops.append(("box", MARGIN_X, top, WIDTH - MARGIN_X, lay.y))
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
    f = _style_font(size, style)
    base = _baseline(y, size)
    if "sub" in style:
        base += size * 0.2
    elif "sup" in style:
        base -= size * 0.34
    width = f.getlength(text)
    if "m" in style:
        d.rounded_rectangle([x - 3, base - size * 0.7, x + width + gap + 1, base + size * 0.24], radius=max(int(size * 0.12), 3), fill=MARK)
    d.text((x, base), text, font=f, fill=RED if "b" in style else color, anchor="ls")
    if "bar" in style:
        d.line([(x + 2, base - size * 0.82), (x + width - 2, base - size * 0.82)], fill=color, width=max(size // 16, 2))


def _paint(ops, k):
    canvas = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))
    d = ImageDraw.Draw(canvas)
    # 형광펜 띠가 글자 뒤로 가도록 띠가 있는 단어를 먼저 그린 뒤 나머지를 그린다
    ordered = sorted(ops, key=lambda op: 0 if op[0] == "box" or (op[0] == "title") else 1)
    for op in ordered:
        kind = op[0]
        if kind == "box":
            _, x0, y0, x1, y1 = op
            d.rounded_rectangle([x0, y0, x1, y1], radius=int(16 * k), fill=BOX_BG, outline=BOX_LINE, width=3)
        elif kind == "title":
            _, y, size, line = op
            if not line:
                continue
            x_end = max(x + _style_font(size, frozenset({"b"})).getlength(t) for t, _, x, _ in line)
            base = _baseline(y, size)
            d.rounded_rectangle([MARGIN_X - 6, base - size * 0.34, x_end + 8, base + size * 0.2], radius=8, fill=MARK)       # 제목 형광펜 띠
            for text, style, x, _ in line:
                d.text((x, base), text, font=_style_font(size, frozenset({"b"})), fill=INK, anchor="ls")
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
                    d.text((wx, y + chip / 2), text, font=_style_font(size, style), fill=INK, anchor="lm")
            d.line([(x, y + chip + int(size * 0.28)), (WIDTH - MARGIN_X, y + chip + int(size * 0.28))], fill=RULE, width=2)
        elif kind == "word":
            _draw_word(d, *op[1:])
        elif kind == "bullet":
            _, x, y, size, shape = op
            cy = _baseline(y, size) - size * 0.3
            if shape == "check":
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
