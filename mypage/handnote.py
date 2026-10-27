"""
'시험 5분 전 속성 노트'를 손글씨처럼 그려 PNG로 만든다 (Pillow만 사용, 새 패키지 없음).

글꼴은 static/fonts/NanumPenScript-Regular.ttf (SIL OFL, 라이선스 파일 같은 폴더). 이 글꼴에 없는 글자(그리스 문자·화살표·첨자 등)는
알파벳 이름이나 기호로 바꿔 쓰고(mu, sigma, ->, <=), 첨자·평균 막대(x̄)는 직접 그린다.
손글씨 느낌: 단어마다 위치·기울기를 조금씩 흔들고, 공책 줄과 여백선, 형광펜 띠, 삐뚤빼뚤한 밑줄·상자를 그린다.
결과 그림은 노트 내용에 따라 높이가 늘어나는 한 장짜리 이미지다.

입력은 normalize_note()를 거친 dict: {"title", "sections": [{"heading", "points": [...]}], "memo": [...]}.
문장 안에서 쓸 수 있는 서식: **빨간 펜 강조**, ==형광펜==, $수식$ (아래 latex_to_markup이 간단한 것만 바꾼다).
"""
import io
import os
import random
import re
import zlib
from datetime import date

from django.conf import settings
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = os.path.join(str(settings.BASE_DIR), "static", "fonts", "NanumPenScript-Regular.ttf")

WIDTH = 1240
HEIGHT = 1754                     # A4 세로 (150dpi): 1240 x 1754. 내용이 많으면 글씨를 줄여 이 한 장에 모두 넣는다
MIN_SCALE = 0.38
MARGIN_LEFT = 170                 # 빨간 여백선 오른쪽에서 글이 시작한다
MARGIN_RIGHT = 90
LINE_H = 70                       # 공책 한 줄
TOP = 150
PAPER = (253, 250, 241)
RULE = (196, 217, 238)
MARGIN_LINE = (228, 120, 120)
INK = (28, 38, 108)               # 파란 볼펜
RED = (200, 36, 36)               # 빨간 펜
MARK = (255, 232, 70)             # 형광펜
GRAY = (120, 120, 130)

TITLE_SIZE, HEAD_SIZE, BODY_SIZE, SMALL_SIZE = 104, 74, 60, 40

# 글꼴에 없는 글자를 바꿔 쓸 표
CHAR_MAP = {
    "→": "->", "←": "<-", "⇒": "=>", "↔": "<->", "≤": "<=", "≥": ">=", "≠": "!=", "≈": "~", "±": "+-", "∴": "so",
    "∵": "because", "∞": "inf", "√": "root", "Σ": "sum", "∑": "sum", "Π": "prod", "∫": "int", "∂": "d", "°": "deg",
    "·": ".", "•": "-", "…": "...", "—": "-", "–": "-", "ㆍ": ".", "★": "*", "☆": "*", "✓": "v", "✔": "v", "※": "*",
    "①": "(1)", "②": "(2)", "③": "(3)", "④": "(4)", "⑤": "(5)", "⑥": "(6)", "⑦": "(7)", "⑧": "(8)", "⑨": "(9)",
    "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon", "θ": "theta", "λ": "lambda", "μ": "mu",
    "π": "pi", "ρ": "rho", "σ": "sigma", "τ": "tau", "φ": "phi", "χ": "chi", "ψ": "psi", "ω": "omega",
    "Δ": "Delta", "Ω": "Omega", "Θ": "Theta", "Φ": "Phi",
}
_SUB = dict(zip("₀₁₂₃₄₅₆₇₈₉", "0123456789"))
_SUP = dict(zip("⁰¹²³⁴⁵⁶⁷⁸⁹", "0123456789"))
_LATEX_WORDS = {
    "mu": "mu", "sigma": "sigma", "alpha": "alpha", "beta": "beta", "gamma": "gamma", "delta": "delta", "theta": "theta",
    "lambda": "lambda", "pi": "pi", "rho": "rho", "chi": "chi", "epsilon": "epsilon", "tau": "tau", "phi": "phi",
    "omega": "omega", "Sigma": "sum", "sum": "sum", "prod": "prod", "int": "int", "infty": "inf", "le": "<=", "leq": "<=",
    "ge": ">=", "geq": ">=", "ne": "!=", "neq": "!=", "approx": "~", "pm": "+-", "times": "x", "cdot": ".", "div": "÷",
    "to": "->", "rightarrow": "->", "Rightarrow": "=>", "therefore": "so", "ldots": "...", "cdots": "...", "dots": "...",
    "log": "log", "ln": "ln", "exp": "exp", "min": "min", "max": "max", "Pr": "P", "hat": "", "tilde": "", "text": "",
    "mathrm": "", "left": "", "right": "", "quad": " ", "qquad": " ",
}

_font_cache = {}
_glyph_cache = {}


def font(size):
    if size not in _font_cache:
        _font_cache[size] = ImageFont.truetype(FONT_PATH, size)
    return _font_cache[size]


def has_glyph(ch, f=None):
    if ch in _glyph_cache:
        return _glyph_cache[ch]
    ok = ch.isspace() or font(BODY_SIZE).getmask(ch).getbbox() is not None
    _glyph_cache[ch] = ok
    return ok


def safe_text(text):
    """글꼴에 없는 글자는 바꿔 쓰거나(CHAR_MAP) 뺀다."""
    out = []
    for ch in text:
        if has_glyph(ch):
            out.append(ch)
        elif ch in CHAR_MAP:
            out.append(CHAR_MAP[ch])
        elif ch in _SUB:
            out.append(f"<sub>{_SUB[ch]}</sub>")
        elif ch in _SUP:
            out.append(f"<sup>{_SUP[ch]}</sup>")
        elif ch == "̄":                              # x̄ 의 결합 막대 → 앞 글자에 막대
            if out:
                last = out.pop()
                out.append(f"<bar>{last}</bar>")
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


def latex_to_markup(tex):
    """간단한 LaTeX를 손글씨로 쓸 수 있는 글(첨자는 <sub>/<sup>, 막대는 <bar>)로. 복잡한 식은 최대한 읽히게만 바꾼다."""
    s, out, i = tex, [], 0
    while i < len(s):
        c = s[i]
        if c == "\\":
            m = re.match(r"\\([A-Za-z]+)", s[i:])
            if not m:
                out.append(s[i + 1:i + 2] if i + 1 < len(s) else "")
                i += 2
                continue
            name, i = m.group(1), i + len(m.group(0))
            if name in ("bar", "overline"):
                arg, i = _brace_arg(s, i)
                out.append(f"<bar>{latex_to_markup(arg)}</bar>")
            elif name == "frac":
                a, i = _brace_arg(s, i)
                b, i = _brace_arg(s, i)
                out.append(f"({latex_to_markup(a)})/({latex_to_markup(b)})")
            elif name == "sqrt":
                a, i = _brace_arg(s, i)
                out.append(f"root({latex_to_markup(a)})")
            elif name in ("hat", "tilde", "text", "mathrm", "mathbf"):
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


def to_markup(text):
    """노트 문장 → 태그 문자열: $수식$, **강조**, ==형광펜== 을 <b>/<m>/<sub>/<sup>/<bar>로, 쓸 수 없는 글자는 바꿔 쓴다."""
    text = _MATH.sub(lambda m: latex_to_markup((m.group(1) or m.group(2)).strip()), str(text or ""))
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"==(.+?)==", r"<m>\1</m>", text)
    text = text.replace("`", "")
    # 태그를 보존한 채 글자만 안전하게 바꾼다
    parts = re.split(r"(</?(?:b|m|sub|sup|bar)>)", text)
    return "".join(p if re.fullmatch(r"</?(?:b|m|sub|sup|bar)>", p) else safe_text(p) for p in parts)


def parse_segments(markup):
    """태그 문자열 → [(글, {스타일})]. 스타일: b(빨간 펜) m(형광펜) sub sup bar."""
    segs, active = [], set()
    for token in re.split(r"(</?(?:b|m|sub|sup|bar)>)", markup):
        m = re.fullmatch(r"<(/?)(b|m|sub|sup|bar)>", token)
        if m:
            (active.discard if m.group(1) else active.add)(m.group(2))
        elif token:
            segs.append((token, frozenset(active)))
    # 태그 속 safe_text가 만든 <sub>/<bar>가 한 번 더 들어 있을 수 있어 평탄화하지 않고 그대로 둔다 (중첩은 가장 안쪽 스타일만 쓴다)
    return segs


# ── 배치 ────────────────────────────────────────────────────────────────────

class _Layout:
    """그릴 것들을 먼저 배치(높이 계산)한 뒤 한 번에 그린다."""

    def __init__(self, rng, k=1.0):
        self.rng = rng
        self.k = k                        # 글씨·줄 간격 배율 (1이 기본, 작을수록 촘촘)
        self.lh = int(LINE_H * k)
        self.ops = []
        self.y = int(TOP * k)

    def words(self, segs):
        """세그먼트를 단어(공백 기준) 단위로 쪼갠다: [(글, 스타일, 공백 앞붙임 여부)]."""
        out = []
        for text, style in segs:
            for k, piece in enumerate(re.split(r"(\s+)", text)):
                if not piece:
                    continue
                if piece.isspace():
                    if out:
                        out[-1] = (out[-1][0], out[-1][1], True)
                    continue
                out.append((piece, style, False))
        return out

    def wrap(self, segs, size, x0, x1):
        """너비에 맞춰 줄바꿈: 줄마다 [(글, 스타일, x)]."""
        f = font(size)
        lines, line, x = [], [], x0
        for text, style, spaced in self.words(segs):
            sub = "sub" in style or "sup" in style
            fw = font(int(size * 0.62)) if sub else f
            w = fw.getlength(text)
            gap = f.getlength(" ") * 0.9 if spaced else 0
            if line and x + w > x1:
                lines.append(line)
                line, x = [], x0
            line.append((text, style, x))
            x += w + gap
        if line:
            lines.append(line)
        return lines

    def text_block(self, markup, size, x0, color=INK, indent=0, rows_per_line=1, bullet=None):
        x1 = WIDTH - MARGIN_RIGHT
        lines = self.wrap(parse_segments(markup), size, x0 + indent, x1)
        for n, line in enumerate(lines):
            if n == 0 and bullet:
                self.ops.append(("bullet", x0, self.y, size, bullet))
            for text, style, x in line:
                self.ops.append(("word", x, self.y, size, text, style, color))
            self.y += self.lh * rows_per_line
        return len(lines)

    def gap(self, rows=0.5):
        self.y += int(self.lh * rows)


def _rng_for(note):
    seed = zlib.crc32((note.get("title", "") + "|".join(s.get("heading", "") for s in note.get("sections", []))).encode())
    return random.Random(seed)


def _wobble_line(draw, x0, y, x1, color, rng, width=4, amp=3.0):
    """손으로 그은 듯 살짝 휘어진 선."""
    pts, x = [], x0
    while x <= x1:
        pts.append((x, y + rng.uniform(-amp, amp) * 0.5 + (x - x0) * rng.uniform(-0.004, 0.004)))
        x += 26
    pts.append((x1, y + rng.uniform(-amp, amp) * 0.5))
    draw.line(pts, fill=color, width=width, joint="curve")


def _star(draw, cx, cy, r, color):
    import math
    pts = []
    for k in range(10):
        ang = -math.pi / 2 + k * math.pi / 5
        rad = r if k % 2 == 0 else r * 0.45
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    draw.polygon(pts, outline=color, width=4)


def _draw_word(canvas, rng, x, y, size, text, style, color):
    """단어 하나를 투명 판에 쓰고 살짝 돌려 붙인다 (형광펜·첨자·막대 포함)."""
    sub = "sub" in style or "sup" in style
    fsize = int(size * 0.62) if sub else size
    f = font(fsize)
    w = int(f.getlength(text)) + 8
    h = int(fsize * 1.5)
    pad = 12
    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ink = RED if "b" in style else color
    if "m" in style:
        d.rounded_rectangle([pad - 4, pad + int(fsize * 0.28), pad + w, pad + int(fsize * 1.02)], radius=8, fill=MARK + (150,))
    d.text((pad, pad), text, font=f, fill=ink + (255,))
    if "bar" in style:
        yb = pad + int(fsize * 0.14)
        d.line([(pad + 2, yb), (pad + w - 6, yb)], fill=ink + (255,), width=3)
    angle = rng.uniform(-1.6, 1.6)
    layer = layer.rotate(angle, resample=Image.BICUBIC, expand=True)
    dy = rng.uniform(-3, 3)
    if "sub" in style:
        dy += size * 0.18
    elif "sup" in style:
        dy -= size * 0.28
    canvas.alpha_composite(layer, (int(x - pad - 4), int(y + dy - pad + (size - fsize) * 0.1)))


def _layout(note, rng, k, today):
    """배율 k로 노트를 배치한다 (그리기 전에 높이만 알아내는 용도로도 쓴다)."""
    lay = _Layout(rng, k)

    def sz(v):
        return max(int(v * k), 12)

    title_markup = to_markup(note.get("title") or "시험 5분 전 노트")
    lay.ops.append(("title", MARGIN_LEFT, lay.y, sz(TITLE_SIZE), title_markup))
    lay.y += int(lay.lh * 2.1)
    lay.ops.append(("date", WIDTH - MARGIN_RIGHT, int(TOP * k) - int(60 * k), sz(SMALL_SIZE),
                    (today or date.today()).strftime("%Y.%m.%d")))

    for si, section in enumerate(note.get("sections", []), 1):
        lay.gap(0.3)
        lay.ops.append(("heading", MARGIN_LEFT - 8, lay.y, sz(HEAD_SIZE), to_markup(section.get("heading", "")), si))
        lay.y += int(lay.lh * 1.3)
        for point in section.get("points", []):
            lay.text_block(to_markup(point), sz(BODY_SIZE), MARGIN_LEFT + int(20 * k), indent=int(44 * k) + 6, bullet="dash")
        lay.gap(0.15)

    memo = note.get("memo") or []
    if memo:
        lay.gap(0.4)
        top = lay.y
        lay.ops.append(("memo_title", MARGIN_LEFT + 10, lay.y + int(8 * k), sz(HEAD_SIZE - 6), "마지막 체크!"))
        lay.y += int(lay.lh * 1.4)
        for item in memo:
            lay.text_block(to_markup(item), sz(BODY_SIZE), MARGIN_LEFT + int(36 * k), indent=int(56 * k) + 6, bullet="check", color=INK)
        lay.ops.append(("box", MARGIN_LEFT - 8, top - 6, WIDTH - MARGIN_RIGHT + 10, lay.y + 6))
    return lay


def render_note(note, today=None):
    """노트 dict → A4 한 장(1240x1754) PNG 바이트. 내용이 넘치면 글씨를 줄여 모두 그 안에 넣는다."""
    rng = _rng_for(note)
    note = {**note, "sections": [{**s, "points": list(s.get("points", []))} for s in note.get("sections", [])]}
    k = 1.0
    while True:
        lay = _layout(note, rng, k, today)
        if lay.y + int(70 * k) <= HEIGHT:
            break
        if k > MIN_SCALE:
            k = max(round(k - 0.03, 2), MIN_SCALE)
        else:                      # 가장 작은 글씨로도 넘치는 (비정상적으로 긴) 노트는 가장 긴 항목의 마지막 줄부터 덜어낸다
            longest = max(note["sections"], key=lambda sec: len(sec["points"]), default=None)
            if not longest or len(longest["points"]) <= 1:
                break
            longest["points"].pop()
    height = HEIGHT
    canvas = Image.new("RGBA", (WIDTH, height), PAPER + (255,))
    d = ImageDraw.Draw(canvas)
    # 종이 결(아주 옅은 얼룩) + 공책 줄 + 여백선
    for _ in range(900):
        x, y = rng.randrange(WIDTH), rng.randrange(height)
        shade = rng.randint(-5, 3)
        d.point((x, y), fill=(PAPER[0] + shade, PAPER[1] + shade, PAPER[2] + shade, 255))
    y = int(TOP * k) + lay.lh - int(18 * k)
    while y < height - 40:
        d.line([(60, y), (WIDTH - 60, y)], fill=RULE + (255,), width=2)
        y += lay.lh
    d.line([(MARGIN_LEFT - 34, 0), (MARGIN_LEFT - 34, height)], fill=MARGIN_LINE + (255,), width=3)
    for hole in range(3):                                                   # 공책 구멍
        cy = int(height * (0.2 + 0.3 * hole))
        d.ellipse([34, cy - 20, 74, cy + 20], fill=(232, 228, 216, 255), outline=(206, 200, 186, 255), width=2)

    for op in lay.ops:
        kind = op[0]
        if kind == "title":
            _, x, y, size, markup = op
            x_end = x
            for text, style, wx in lay.wrap(parse_segments(markup), size, x, WIDTH - MARGIN_RIGHT)[0]:
                _draw_word(canvas, rng, wx, y, size, text, style | {"b"}, RED)
                x_end = max(x_end, wx + font(size).getlength(text))
            _wobble_line(d, x - 6, y + size * 1.12, x_end + 12, RED + (255,), rng, width=5)
            _wobble_line(d, x + 10, y + size * 1.12 + 11, x_end - 6, RED + (255,), rng, width=3)
        elif kind == "date":
            _, xr, y, size, text = op
            _draw_word(canvas, rng, xr - font(size).getlength(text), y, size, text, frozenset(), GRAY)
        elif kind == "heading":
            _, x, y, size, markup, number = op
            segs = parse_segments(markup)
            width = sum(font(size).getlength(t) for t, _ in segs) + 100
            band_w = min(width, WIDTH - MARGIN_RIGHT - x)
            u = size / HEAD_SIZE
            d.rounded_rectangle([x + 54 * u, y + 22 * u, x + 54 * u + band_w - 40 * u, y + size * 1.02], radius=10, fill=MARK + (170,))
            _star(d, x + 28 * u, y + size * 0.62, 20 * u, RED + (255,))
            cx = x + 64 * u
            for text, style, wx in lay.wrap(segs, size, cx, WIDTH - MARGIN_RIGHT)[0]:
                _draw_word(canvas, rng, wx, y, size, text, style, INK)
        elif kind == "word":
            _, x, y, size, text, style, color = op
            _draw_word(canvas, rng, x, y, size, text, style, color)
        elif kind == "bullet":
            _, x, y, size, shape = op
            cy = y + size * 0.62
            if shape == "check":
                u = size / BODY_SIZE
                d.line([(x + 2 * u, cy), (x + 13 * u, cy + 12 * u), (x + 32 * u, cy - 14 * u)], fill=RED + (255,), width=max(int(5 * u), 2), joint="curve")
            else:
                u = size / BODY_SIZE
                _wobble_line(d, x + 4 * u, cy, x + 30 * u, INK + (255,), rng, width=max(int(5 * u), 2), amp=2 * u)
        elif kind == "memo_title":
            _, x, y, size, text = op
            _draw_word(canvas, rng, x, y, size, text, frozenset({"b"}), RED)
        elif kind == "box":
            _, x0, y0, x1, y1 = op
            for off in (0, 4):
                _wobble_line(d, x0, y0 + off, x1, RED + (255,), rng, width=4)
                _wobble_line(d, x0, y1 - off, x1, RED + (255,), rng, width=4)
                d.line([(x0 + rng.uniform(-3, 3), y0), (x0 + rng.uniform(-3, 3), y1)], fill=RED + (255,), width=4)
                d.line([(x1 + rng.uniform(-3, 3), y0), (x1 + rng.uniform(-3, 3), y1)], fill=RED + (255,), width=4)

    out = io.BytesIO()
    canvas.convert("RGB").save(out, "PNG", optimize=True)
    return out.getvalue()
