"""
노트 그림용 수식 조판: 간단한 LaTeX를 분수·행렬·제곱근·첨자·괄호·합 기호 같은 '상자'로 해석해 크기를 재고 Pillow로 그린다 (새 패키지 없음).

상자마다 metrics(size) → (폭, 기준선 위 높이, 기준선 아래 높이)와 draw(d, x, 기준선, size, 색)를 가진다. 본문 줄에는 수식 한 덩어리(MathAtom)로
끼워 넣고, 키가 큰 수식이 있는 줄은 notepage가 줄 간격을 늘린다. 한 수식이 한 줄보다 길면 등호·연산자 뒤에서 여러 덩어리로 나눠(chunks)
줄바꿈할 수 있게 하고, 그래도 넘치는 덩어리는 글씨를 줄여 맞춘다 (fit).

지원: \\frac \\dfrac \\tfrac, \\sqrt[n]{}, \\bar \\overline \\hat \\tilde \\vec, 위·아래 첨자(^ _), \\sum \\prod \\lim의 위·아래 한계,
\\left … \\right 크기가 맞는 괄호, \\begin{bmatrix|pmatrix|vmatrix|Vmatrix|Bmatrix|matrix|cases|array|aligned}, \\text{} \\mathrm{} \\mathbf{} \\mathbb{},
그리스 문자·연산자·화살표 기호. 해석하지 못하는 부분은 명령 이름을 그대로 글자로 쓰고, 어떤 입력에도 예외를 내지 않는다.
"""
import re

from .notefont import BLACKBOARD, GREEK, LATEX_WORDS, can_draw, draw_text, font, italic_char, text_length

ASC, DESC = 0.80, 0.22          # 글자 상자의 기준선 위·아래 높이 (글씨 크기 대비)
AXIS = 0.30                     # 분수 막대·행렬 가운데가 기준선보다 올라가는 높이
SCRIPT = 0.70                   # 첨자 글씨 배율
FRAC_SCALE = 0.84               # 분수의 분자·분모 글씨 배율
MAX_DEPTH = 8                   # 중첩 깊이 상한 (분수 안의 분수 안의 …)
MAX_STEPS = 4000                # 해석기가 무한히 돌지 않게 하는 상한

_RELATIONS = set("=<>≤≥≠≈≡∼→←⇒⇐⇔↔∈∉∋⊂⊃⊆⊇∝≪≫∥∦⊥≅≃≺≻≼≽≐⟶⟵⟷⟹⟸⟺↦↪↑↓↕↗↘≰≱≢≉≇≁⊄⊈≲≳≍⊨⊢⊣≮≯")
_BINARY = set("+-−±∓×·÷*∘∪∩∖⊕⊗⊖⊙∧∨∙⋆∗†‡")
_OPEN, _CLOSE = set("([⌊⌈⟨"), set(")]⌋⌉⟩")
_BIGOPS = {"sum", "prod", "bigcup", "bigcap", "bigoplus", "bigotimes", "bigvee", "bigwedge", "coprod"}
_LIMIT_OPS = {"sum", "prod", "lim", "max", "min", "limsup", "liminf"} | _BIGOPS
_FUNCS = {"det", "sin", "cos", "tan", "log", "ln", "exp", "lim", "max", "min", "limsup", "liminf", "gcd", "dim", "rank", "tr", "arg", "sup", "inf", "Pr"}
_ENV_DELIMS = {"bmatrix": ("[", "]"), "pmatrix": ("(", ")"), "vmatrix": ("|", "|"), "Vmatrix": ("‖", "‖"), "Bmatrix": ("{", "}"),
               "matrix": ("", ""), "smallmatrix": ("", ""), "cases": ("{", ""), "array": ("", ""), "aligned": ("", ""), "align": ("", ""),
               "gathered": ("", ""), "split": ("", ""), "eqnarray": ("", ""), "alignat": ("", ""), "multline": ("", ""), "gather": ("", "")}
_LEFT_ALIGN = {"cases"}
_DELIM_NAMES = {"langle": "⟨", "rangle": "⟩", "lvert": "|", "rvert": "|", "lVert": "‖", "rVert": "‖", "lfloor": "⌊", "rfloor": "⌋",
                "lceil": "⌈", "rceil": "⌉", "{": "{", "}": "}", "|": "‖", "vert": "|", "Vert": "‖"}
_ACCENT_GLYPH = {"hat": "^", "tilde": "~", "vec": "→", "check": "ˇ", "breve": "˘", "acute": "´", "grave": "`"}
_BIG = {"big": 1.2, "Big": 1.8, "bigg": 2.4, "Bigg": 3.0}          # \bigl( \Bigr) 같은 고정 크기 괄호 (글씨 크기 배율)
_ALIGNED = {"aligned", "align", "split", "eqnarray", "alignat", "gathered", "multline"}


def _px(value):
    return max(int(round(value)), 8)


def _thick(size):
    return max(int(size / 15), 2)


def _bez(p0, p1, p2, n=10):
    """2차 베지에 곡선 위의 점들 (중괄호를 그리는 데 쓴다)."""
    pts = []
    for k in range(n + 1):
        t = k / n
        pts.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
                    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]))
    return pts


# ── 상자 ────────────────────────────────────────────────────────────────────

class Box:
    def metrics(self, size):
        raise NotImplementedError

    def draw(self, d, x, base, size, color):
        raise NotImplementedError


class Text(Box):
    """글자 상자. italic이면 영문·그리스 소문자를 수학용 기울임꼴 글자(𝑥 𝛼 …)로 그린다 (변수는 기울이고 숫자·함수 이름·글은 세운다)."""

    def __init__(self, text, bold=False, kind="ord", italic=False):
        self.text, self.bold, self.kind, self.italic = text, bold, kind, italic

    def _shown(self):
        return "".join(italic_char(c) for c in self.text) if self.italic else self.text

    def metrics(self, size):
        return text_length(self._shown(), _px(size), self.bold, force_math=self.italic), size * ASC, size * DESC

    def draw(self, d, x, base, size, color):
        draw_text(d, x, base, self._shown(), _px(size), color, self.bold, force_math=self.italic)


class Op(Text):
    """\\sum \\prod \\lim 처럼 첨자가 위·아래에 놓이는 기호."""

    def __init__(self, text, name):
        super().__init__(text, kind="op")
        self.name, self.limits = name, name in _LIMIT_OPS

    def metrics(self, size):
        w, a, dsc = super().metrics(size)
        if self.name in _BIGOPS:
            return w * 1.2, size * 0.95, size * 0.3                      # 큰 기호
        return w, a, dsc

    def draw(self, d, x, base, size, color):
        if self.name in _BIGOPS:
            draw_text(d, x + size * 0.04, base + size * 0.12, self.text, _px(size * 1.35), color)
        else:
            super().draw(d, x, base, size, color)


class Space(Box):
    def __init__(self, em):
        self.em = em

    def metrics(self, size):
        return self.em * size, 0, 0

    def draw(self, d, x, base, size, color):
        pass


class Row(Box):
    def __init__(self, items):
        self.items = items

    def metrics(self, size):
        w = a = dsc = 0
        for item in self.items:
            iw, ia, idsc = item.metrics(size)
            w, a, dsc = w + iw, max(a, ia), max(dsc, idsc)
        return w, a, dsc

    def draw(self, d, x, base, size, color):
        for item in self.items:
            item.draw(d, x, base, size, color)
            x += item.metrics(size)[0]


class Script(Box):
    def __init__(self, base, sup=None, sub=None):
        self.base, self.sup, self.sub = base, sup, sub

    def _layout(self, size):
        bw, ba, bd = self.base.metrics(size)
        ss = size * SCRIPT
        sw, sa, sd = self.sup.metrics(ss) if self.sup else (0, 0, 0)
        uw, ua, ud = self.sub.metrics(ss) if self.sub else (0, 0, 0)
        raise_ = max(0.38 * size, ba - 0.65 * sa) if self.sup else 0
        drop = max(0.20 * size, bd + 0.25 * ss) if self.sub else 0
        return bw, ba, bd, ss, sw, sa, sd, uw, ua, ud, raise_, drop

    def metrics(self, size):
        bw, ba, bd, ss, sw, sa, sd, uw, ua, ud, raise_, drop = self._layout(size)
        return bw + max(sw, uw) + 0.05 * size, max(ba, raise_ + sa), max(bd, drop + ud)

    def draw(self, d, x, base, size, color):
        bw, ba, bd, ss, sw, sa, sd, uw, ua, ud, raise_, drop = self._layout(size)
        self.base.draw(d, x, base, size, color)
        if self.sup:
            self.sup.draw(d, x + bw + 0.02 * size, base - raise_, ss, color)
        if self.sub:
            self.sub.draw(d, x + bw + 0.02 * size, base + drop, ss, color)


class Limits(Box):
    """Σ 아래·위에 놓이는 한계 (합·곱·극한)."""

    def __init__(self, base, over=None, under=None):
        self.base, self.over, self.under = base, over, under

    def _layout(self, size):
        bw, ba, bd = self.base.metrics(size)
        ss = size * SCRIPT
        ow, oa, od = self.over.metrics(ss) if self.over else (0, 0, 0)
        uw, ua, ud = self.under.metrics(ss) if self.under else (0, 0, 0)
        return bw, ba, bd, ss, ow, oa, od, uw, ua, ud, max(bw, ow, uw)

    def metrics(self, size):
        bw, ba, bd, ss, ow, oa, od, uw, ua, ud, width = self._layout(size)
        gap = 0.10 * size
        return width, ba + ((gap + od + oa) if self.over else 0), bd + ((gap + ua + ud) if self.under else 0)

    def draw(self, d, x, base, size, color):
        bw, ba, bd, ss, ow, oa, od, uw, ua, ud, width = self._layout(size)
        gap = 0.10 * size
        self.base.draw(d, x + (width - bw) / 2, base, size, color)
        if self.over:
            self.over.draw(d, x + (width - ow) / 2, base - ba - gap - od, ss, color)
        if self.under:
            self.under.draw(d, x + (width - uw) / 2, base + bd + gap + ua, ss, color)


class Frac(Box):
    def __init__(self, num, den):
        self.num, self.den = num, den

    def _layout(self, size):
        s2 = max(size * FRAC_SCALE, 8)
        nw, na, nd = self.num.metrics(s2)
        dw, da, dd = self.den.metrics(s2)
        pad, gap = 0.14 * size, 0.13 * size
        return s2, nw, na, nd, dw, da, dd, pad, gap, max(nw, dw) + 2 * pad

    def metrics(self, size):
        s2, nw, na, nd, dw, da, dd, pad, gap, width = self._layout(size)
        return width, AXIS * size + gap + nd + na, max(gap + da + dd - AXIS * size, size * DESC)

    def draw(self, d, x, base, size, color):
        s2, nw, na, nd, dw, da, dd, pad, gap, width = self._layout(size)
        bar = base - AXIS * size
        d.line([(x + pad * 0.5, bar), (x + width - pad * 0.5, bar)], fill=color, width=_thick(size))
        self.num.draw(d, x + (width - nw) / 2, bar - gap - nd, s2, color)
        self.den.draw(d, x + (width - dw) / 2, bar + gap + da, s2, color)


class Radical(Box):
    def __init__(self, body, index=None):
        self.body, self.index = body, index

    def metrics(self, size):
        bw, ba, bd = self.body.metrics(size)
        iw = self.index.metrics(size * 0.55)[0] if self.index else 0
        return max(iw - 0.2 * size, 0) + bw + 0.62 * size, ba + 0.2 * size, bd

    def draw(self, d, x, base, size, color):
        bw, ba, bd = self.body.metrics(size)
        lead = max((self.index.metrics(size * 0.55)[0] if self.index else 0) - 0.2 * size, 0)
        x0, top, bot = x + lead, base - ba - 0.2 * size, base + bd
        h = bot - top
        pts = [(x0, bot - 0.38 * h), (x0 + 0.10 * size, bot - 0.30 * h), (x0 + 0.26 * size, bot), (x0 + 0.46 * size, top),
               (x0 + 0.62 * size + bw, top)]
        d.line(pts, fill=color, width=_thick(size), joint="curve")
        if self.index:
            self.index.draw(d, x, top + h * 0.4, size * 0.55, color)
        self.body.draw(d, x0 + 0.56 * size, base, size, color)


class Over(Box):
    """평균 막대(x̄)·모자(x̂)·물결(x̃)·벡터(v⃗)·점(ẋ ẍ)·긴 화살표(AB⃗)."""

    def __init__(self, body, kind):
        self.body, self.kind = body, kind

    def metrics(self, size):
        bw, ba, bd = self.body.metrics(size)
        return bw, ba + 0.20 * size, bd

    def draw(self, d, x, base, size, color):
        bw, ba, bd = self.body.metrics(size)
        self.body.draw(d, x, base, size, color)
        y, th = base - ba - 0.08 * size, _thick(size)
        if self.kind == "bar":
            d.line([(x + 0.04 * size, y), (x + bw - 0.04 * size, y)], fill=color, width=th)
        elif self.kind in ("dot", "ddot"):
            r = max(size * 0.045, 1.5)
            for k in range(1 if self.kind == "dot" else 2):
                cx = x + bw / 2 + (k - (0 if self.kind == "dot" else 0.5)) * size * 0.2
                d.ellipse([cx - r, y - r, cx + r, y + r], fill=color)
        elif self.kind in ("rarrow", "larrow"):
            right = self.kind == "rarrow"
            x0, x1 = (x + 0.04 * size, x + bw - 0.04 * size)
            d.line([(x0, y), (x1, y)], fill=color, width=th)
            tip, back = (x1, x1 - 0.14 * size) if right else (x0, x0 + 0.14 * size)
            d.line([(back, y - 0.08 * size), (tip, y), (back, y + 0.08 * size)], fill=color, width=th, joint="curve")
        else:
            glyph = _ACCENT_GLYPH.get(self.kind, "^")
            small = _px(size * 0.7)
            gw = text_length(glyph, small)
            draw_text(d, x + (bw - gw) / 2, y + 0.18 * size, glyph, small, color)


class Under(Box):
    """밑줄."""

    def __init__(self, body):
        self.body = body

    def metrics(self, size):
        bw, ba, bd = self.body.metrics(size)
        return bw, ba, bd + 0.16 * size

    def draw(self, d, x, base, size, color):
        bw, ba, bd = self.body.metrics(size)
        self.body.draw(d, x, base, size, color)
        y = base + bd + 0.07 * size
        d.line([(x, y), (x + bw, y)], fill=color, width=_thick(size))


class Brace(Box):
    """\\overbrace{…}^{설명} · \\underbrace{…}_{설명}: 가로 중괄호와 설명 글."""

    def __init__(self, body, over, label=None):
        self.body, self.over, self.label = body, over, label

    def _parts(self, size):
        bw, ba, bd = self.body.metrics(size)
        ss = size * SCRIPT
        lw, la, ld = self.label.metrics(ss) if self.label else (0, 0, 0)
        return bw, ba, bd, ss, lw, la, ld

    def metrics(self, size):
        bw, ba, bd, ss, lw, la, ld = self._parts(size)
        extra = 0.30 * size + ((la + ld + 0.08 * size) if self.label else 0)
        return max(bw, lw), ba + (extra if self.over else 0), bd + (0 if self.over else extra)

    def draw(self, d, x, base, size, color):
        bw, ba, bd, ss, lw, la, ld = self._parts(size)
        width = max(bw, lw)
        self.body.draw(d, x + (width - bw) / 2, base, size, color)
        h, th = 0.17 * size, _thick(size)
        sign = -1 if self.over else 1
        y0 = (base - ba - 0.07 * size) if self.over else (base + bd + 0.07 * size)    # 중괄호 끝이 닿는 선
        k, xs, xe, xc = min(0.2 * size, bw / 4), x + (width - bw) / 2, x + (width + bw) / 2, x + width / 2
        pts = (_bez((xs, y0), (xs, y0 + sign * h / 2), (xs + k, y0 + sign * h / 2)) + [(xc - k, y0 + sign * h / 2)]
               + _bez((xc - k, y0 + sign * h / 2), (xc, y0 + sign * h / 2), (xc, y0 + sign * h))
               + _bez((xc, y0 + sign * h), (xc, y0 + sign * h / 2), (xc + k, y0 + sign * h / 2)) + [(xe - k, y0 + sign * h / 2)]
               + _bez((xe - k, y0 + sign * h / 2), (xe, y0 + sign * h / 2), (xe, y0)))
        d.line(pts, fill=color, width=th, joint="curve")
        if self.label:
            ly = (y0 + sign * (h + 0.06 * size + ld)) if self.over else (y0 + h + 0.06 * size + la)
            self.label.draw(d, x + (width - lw) / 2, ly, ss, color)


class Arrow(Box):
    """\\xrightarrow[아래]{위} 같은 글자가 붙은 긴 화살표."""

    def __init__(self, over, under, direction="r"):
        self.over, self.under, self.direction = over, under, direction

    def _parts(self, size):
        ss = size * SCRIPT
        ow, oa, od = self.over.metrics(ss) if self.over else (0, 0, 0)
        uw, ua, ud = self.under.metrics(ss) if self.under else (0, 0, 0)
        return ss, ow, oa, od, uw, ua, ud, max(max(ow, uw) + 0.6 * size, 1.5 * size)

    def metrics(self, size):
        ss, ow, oa, od, uw, ua, ud, width = self._parts(size)
        return width, AXIS * size + 0.10 * size + ((oa + od) if self.over else 0), max(0.05 * size, ((ua + ud + 0.10 * size - AXIS * size) if self.under else 0))

    def draw(self, d, x, base, size, color):
        ss, ow, oa, od, uw, ua, ud, width = self._parts(size)
        y, th = base - AXIS * size, _thick(size)
        d.line([(x + 0.05 * size, y), (x + width - 0.05 * size, y)], fill=color, width=th)
        for tip, back in (((x + width - 0.05 * size, x + width - 0.2 * size),) if "r" in self.direction.lower() else ()) + (
                ((x + 0.05 * size, x + 0.2 * size),) if "l" in self.direction.lower() else ()):
            d.line([(back, y - 0.09 * size), (tip, y), (back, y + 0.09 * size)], fill=color, width=th, joint="curve")
        if self.over:
            self.over.draw(d, x + (width - ow) / 2, y - 0.10 * size - od, ss, color)
        if self.under:
            self.under.draw(d, x + (width - uw) / 2, y + 0.10 * size + ua, ss, color)


class Slashed(Box):
    """\\not\\in 처럼 기호를 빗금으로 지운 모양."""

    def __init__(self, body):
        self.body = body

    def metrics(self, size):
        return self.body.metrics(size)

    def draw(self, d, x, base, size, color):
        bw, ba, bd = self.body.metrics(size)
        self.body.draw(d, x, base, size, color)
        d.line([(x + 0.12 * bw, base + 0.15 * size), (x + 0.88 * bw, base - ba - 0.02 * size)], fill=color, width=_thick(size))


class Strike(Box):
    """\\cancel{} \\bcancel{} \\xcancel{}: 취소선."""

    def __init__(self, body, kind):
        self.body, self.kind = body, kind

    def metrics(self, size):
        return self.body.metrics(size)

    def draw(self, d, x, base, size, color):
        bw, ba, bd = self.body.metrics(size)
        self.body.draw(d, x, base, size, color)
        top, bot, th = base - ba, base + bd, _thick(size)
        if self.kind in ("cancel", "xcancel"):
            d.line([(x, bot), (x + bw, top)], fill=color, width=th)
        if self.kind in ("bcancel", "xcancel"):
            d.line([(x, top), (x + bw, bot)], fill=color, width=th)


class Boxed(Box):
    def __init__(self, body):
        self.body = body

    def metrics(self, size):
        bw, ba, bd = self.body.metrics(size)
        return bw + 0.4 * size, ba + 0.2 * size, bd + 0.2 * size

    def draw(self, d, x, base, size, color):
        bw, ba, bd = self.body.metrics(size)
        d.rectangle([x + 0.03 * size, base - ba - 0.17 * size, x + bw + 0.37 * size, base + bd + 0.17 * size], outline=color, width=_thick(size))
        self.body.draw(d, x + 0.2 * size, base, size, color)


class Phantom(Box):
    """\\phantom{x}: 글자 자리만 차지하고 그리지 않는다."""

    def __init__(self, body):
        self.body = body

    def metrics(self, size):
        return self.body.metrics(size)

    def draw(self, d, x, base, size, color):
        pass


class Fence(Box):
    """\\bigl( \\Bigr] 같은 고정 크기 괄호."""

    def __init__(self, ch, scale):
        self.ch, self.scale = ch, scale

    def metrics(self, size):
        h = self.scale * size
        return _delim_width(self.ch, size) + 0.05 * size, AXIS * size + h / 2, max(h / 2 - AXIS * size, size * DESC)

    def draw(self, d, x, base, size, color):
        h = self.scale * size
        _draw_delim(d, self.ch, x + 0.02 * size, base - AXIS * size - h / 2, base - AXIS * size + h / 2, _delim_width(self.ch, size), color, _thick(size))


def _draw_delim(d, ch, x, y0, y1, w, color, th):
    """키에 맞춰 늘린 괄호를 그린다 (폭 w인 칸의 왼쪽이 x)."""
    if not ch:                                   # 빈 문자열은 모든 문자열 "안에" 들어 있다고 판정되므로 먼저 거른다
        return
    h, mid = y1 - y0, (y0 + y1) / 2
    if ch == "(":
        d.arc([x + 0.25 * w, y0, x + 1.75 * w, y1], 90, 270, fill=color, width=th)
    elif ch == ")":
        d.arc([x - 0.75 * w, y0, x + 0.75 * w, y1], 270, 90, fill=color, width=th)
    elif ch in "[⌈⌊":
        xv = x + 0.3 * w
        d.line([(xv, y0), (xv, y1)], fill=color, width=th)
        if ch != "⌊":
            d.line([(xv, y0), (x + 0.9 * w, y0)], fill=color, width=th)
        if ch != "⌈":
            d.line([(xv, y1), (x + 0.9 * w, y1)], fill=color, width=th)
    elif ch in "]⌉⌋":
        xv = x + 0.7 * w
        d.line([(xv, y0), (xv, y1)], fill=color, width=th)
        if ch != "⌋":
            d.line([(x + 0.1 * w, y0), (xv, y0)], fill=color, width=th)
        if ch != "⌉":
            d.line([(x + 0.1 * w, y1), (xv, y1)], fill=color, width=th)
    elif ch == "|":
        d.line([(x + w / 2, y0), (x + w / 2, y1)], fill=color, width=th)
    elif ch == "‖":
        d.line([(x + w * 0.32, y0), (x + w * 0.32, y1)], fill=color, width=th)
        d.line([(x + w * 0.68, y0), (x + w * 0.68, y1)], fill=color, width=th)
    elif ch in "{}":
        k = 0.14 * h
        pts = (_bez((x + w, y0), (x + 0.55 * w, y0), (x + 0.55 * w, y0 + k)) + [(x + 0.55 * w, mid - k)]
               + _bez((x + 0.55 * w, mid - k), (x + 0.55 * w, mid), (x + 0.05 * w, mid))
               + _bez((x + 0.05 * w, mid), (x + 0.55 * w, mid), (x + 0.55 * w, mid + k)) + [(x + 0.55 * w, y1 - k)]
               + _bez((x + 0.55 * w, y1 - k), (x + 0.55 * w, y1), (x + w, y1)))
        if ch == "}":
            pts = [(2 * x + w - px, py) for px, py in pts]
        d.line(pts, fill=color, width=th, joint="curve")
    elif ch in "⟨⟩":
        a, b = (x + 0.85 * w, x + 0.2 * w) if ch == "⟨" else (x + 0.15 * w, x + 0.8 * w)
        d.line([(a, y0), (b, mid), (a, y1)], fill=color, width=th, joint="curve")


def _delim_width(ch, size):
    return size * (0.40 if ch in "{}" else 0.34 if ch else 0)


class Delimited(Box):
    """\\left( … \\right) : 안의 키에 맞춰 괄호를 늘린다. 한 줄 높이면 글꼴의 괄호를 그대로 쓴다."""

    def __init__(self, inner, left, right):
        self.inner, self.left, self.right = inner, left, right

    def _plain(self, size):
        _, a, dsc = self.inner.metrics(size)
        return a + dsc <= size * (ASC + DESC) * 1.25

    def metrics(self, size):
        w, a, dsc = self.inner.metrics(size)
        if self._plain(size):
            return w + sum(text_length(c, _px(size)) for c in (self.left, self.right) if c), max(a, size * ASC), max(dsc, size * DESC)
        pad = 0.07 * size
        return w + _delim_width(self.left, size) + _delim_width(self.right, size) + 0.12 * size, a + pad, dsc + pad

    def draw(self, d, x, base, size, color):
        w, a, dsc = self.inner.metrics(size)
        if self._plain(size):
            if self.left:
                x += draw_text(d, x, base, self.left, _px(size), color)
            self.inner.draw(d, x, base, size, color)
            if self.right:
                draw_text(d, x + w, base, self.right, _px(size), color)
            return
        pad, th = 0.07 * size, _thick(size)
        lw, rw = _delim_width(self.left, size), _delim_width(self.right, size)
        y0, y1 = base - a - pad, base + dsc + pad
        _draw_delim(d, self.left, x, y0, y1, lw, color, th)
        self.inner.draw(d, x + lw + 0.06 * size, base, size, color)
        _draw_delim(d, self.right, x + lw + 0.06 * size + w + 0.06 * size, y0, y1, rw, color, th)


class Matrix(Box):
    """행렬·cases·array·정렬 환경. col_aligns: 열마다 c/l/r, vlines: 열 사이 세로선(경계 번호), hlines: 행 사이 가로선(경계 번호),
    pairs: aligned처럼 (오른쪽 정렬 | 왼쪽 정렬) 짝을 이루는 열."""

    def __init__(self, rows, left="", right="", align="c", col_aligns=None, vlines=(), hlines=(), pairs=False):
        self.rows, self.left, self.right, self.align = rows, left, right, align
        self.col_aligns, self.vlines, self.hlines, self.pairs = col_aligns, set(vlines), set(hlines), pairs

    def _align(self, j):
        if self.pairs:
            return "r" if j % 2 == 0 else "l"
        if self.col_aligns and j < len(self.col_aligns):
            return self.col_aligns[j]
        return self.align

    def _gap(self, j, size):
        """열 j와 j+1 사이 간격."""
        if self.pairs:
            return 0.12 * size if j % 2 == 0 else 1.8 * size
        return 0.95 * size

    def _layout(self, size):
        cells = [[c.metrics(size) for c in row] for row in self.rows]
        cols = max((len(r) for r in cells), default=0)
        widths = [max((r[j][0] for r in cells if j < len(r)), default=0) for j in range(cols)]
        rows = [(max((m[1] for m in r), default=size * ASC), max((m[2] for m in r), default=size * DESC)) for r in cells]
        row_gap = 0.40 * size
        height = sum(a + dsc for a, dsc in rows) + row_gap * max(len(rows) - 1, 0)
        width = sum(widths) + sum(self._gap(j, size) for j in range(cols - 1))
        return cells, widths, rows, row_gap, height, width

    def metrics(self, size):
        cells, widths, rows, row_gap, height, width = self._layout(size)
        lw, rw = _delim_width(self.left, size), _delim_width(self.right, size)
        gap = 0.18 * size
        total = width + lw + rw + (gap if self.left else 0) + (gap if self.right else 0)
        return total, AXIS * size + height / 2 + 0.07 * size, max(height / 2 - AXIS * size, size * DESC) + 0.07 * size

    def draw(self, d, x, base, size, color):
        cells, widths, rows, row_gap, height, width = self._layout(size)
        lw, rw = _delim_width(self.left, size), _delim_width(self.right, size)
        gap = 0.18 * size
        top = base - AXIS * size - height / 2
        th = _thick(size)
        _draw_delim(d, self.left, x, top - 0.05 * size, top + height + 0.05 * size, lw, color, th)
        cx = x + lw + (gap if self.left else 0)
        starts, px = [], cx
        for j, w in enumerate(widths):
            starts.append(px)
            px += w + (self._gap(j, size) if j < len(widths) - 1 else 0)
        y, row_tops = top, []
        for r, row in enumerate(self.rows):
            asc, dsc = rows[r]
            row_tops.append(y)
            for j, cell in enumerate(row):
                cw, how = cells[r][j][0], self._align(j)
                off = (widths[j] - cw) / 2 if how == "c" else (widths[j] - cw if how == "r" else 0)
                cell.draw(d, starts[j] + off, y + asc, size, color)
            y += asc + dsc + row_gap
        for i in self.hlines:                         # 행 사이(또는 맨 위·아래) 가로선
            yy = top - 0.08 * size if i <= 0 else (top + height + 0.08 * size if i >= len(self.rows) else row_tops[i] - row_gap / 2)
            d.line([(cx - 0.1 * size, yy), (cx + width + 0.1 * size, yy)], fill=color, width=max(th - 1, 1))
        for j in self.vlines:                         # 열 사이 세로선
            xx = cx - 0.1 * size if j <= 0 else (cx + width + 0.1 * size if j >= len(widths) else starts[j] - self._gap(j - 1, size) / 2)
            d.line([(xx, top - 0.05 * size), (xx, top + height + 0.05 * size)], fill=color, width=max(th - 1, 1))
        right_x = cx + width + (gap if self.right else 0)
        _draw_delim(d, self.right, right_x, top - 0.05 * size, top + height + 0.05 * size, rw, color, th)


# ── LaTeX 해석 ──────────────────────────────────────────────────────────────

class _Parser:
    def __init__(self, s):
        self.s, self.i, self.steps = s, 0, 0

    def _tick(self):
        self.steps += 1
        if self.steps > MAX_STEPS:
            raise ValueError("수식이 너무 복잡하다")

    def _peek(self, text):
        """지금 자리가 text로 시작하는가. 글자로 된 명령(\\right, \\end …)은 뒤에 글자가 이어지지 않아야 한다 (\\rightarrow, \\endash 를 \\right, \\end로 읽지 않게)."""
        if not self.s.startswith(text, self.i):
            return False
        after = self.s[self.i + len(text):self.i + len(text) + 1]
        return not (text[-1].isalpha() and after.isalpha())

    def _skip_spaces(self):
        while self.i < len(self.s) and self.s[self.i].isspace():
            self.i += 1

    def _name(self):
        m = re.match(r"[A-Za-z]+", self.s[self.i:])
        name = m.group(0) if m else ""
        self.i += len(name)
        return name

    def _group(self, depth):
        """다음 인자 하나: {…} 묶음이면 그 안을, 아니면 글자(또는 명령) 하나를 상자로."""
        self._skip_spaces()
        if self.i >= len(self.s):
            return Row([])
        if self.s[self.i] == "{":
            self.i += 1
            row = self.row(depth + 1)
            if self._peek("}"):
                self.i += 1
            return row
        if self.s[self.i] == "\\":
            items, kinds = [], []
            self._command(items, kinds, depth + 1)
            return Row(items)
        ch = self.s[self.i]
        self.i += 1
        return Row([_letter(ch) if can_draw(ch) else Space(0)])

    def _raw_group(self):
        """{…} 안의 글을 해석하지 않고 그대로 (\\text{} 같은 것)."""
        self._skip_spaces()
        if not self._peek("{"):
            ch = self.s[self.i:self.i + 1]
            self.i += 1
            return ch
        depth, j = 0, self.i
        while j < len(self.s):
            depth += (self.s[j] == "{") - (self.s[j] == "}")
            j += 1
            if depth == 0:
                break
        raw = self.s[self.i + 1:j - 1]
        self.i = j
        return raw

    def _delim_token(self):
        self._skip_spaces()
        if self.i >= len(self.s):
            return ""
        ch = self.s[self.i]
        if ch == "\\":
            self.i += 1
            name = self._name()
            if name:
                return _DELIM_NAMES.get(name, "")
            token = self.s[self.i:self.i + 1]
            self.i += 1
            return _DELIM_NAMES.get(token, token)
        self.i += 1
        return "" if ch == "." else ch

    # 한 줄의 상자들. }, &, \\, \end, \right 를 만나면 멈춘다 (소비하지 않는다)
    def row_items(self, depth=0):
        if depth > MAX_DEPTH:
            raise ValueError("수식이 너무 깊다")
        items, kinds = [], []
        while self.i < len(self.s):
            self._tick()
            c = self.s[self.i]
            if c in "}&" or self._peek("\\\\") or self._peek("\\end") or self._peek("\\right"):
                break
            if c.isspace():
                if items and self.s[self.i - 1:self.i].isalpha() and re.match(r"\s+[가-힣]", self.s[self.i:]):
                    items.append(Space(0.3)), kinds.append("space")       # 수식 속 한글 단어 사이 띄어쓰기
                self.i += 1
            elif c == "{":
                self.i += 1
                inner = self.row(depth + 1)
                if self._peek("}"):
                    self.i += 1
                items.append(inner), kinds.append("ord")
            elif c in "^_":
                self.i += 1
                self._script(c, items, kinds, depth)
            elif c == "\\":
                self._command(items, kinds, depth)
            else:
                self._char(c, items, kinds)
        return items, kinds

    def row(self, depth=0):
        return Row(_merge(self.row_items(depth)[0]))

    def _prev_kind(self, kinds):
        for k in reversed(kinds):
            if k != "space":
                return k
        return "start"

    def _char(self, c, items, kinds):
        self.i += 1
        if not can_draw(c):
            return
        if c in _RELATIONS or c in _BINARY:
            rel = c in _RELATIONS
            binary = rel or self._prev_kind(kinds) in ("ord", "close")        # 앞에 식이 없으면 +, - 는 부호
            if binary:
                em = 0.28 if rel else 0.22
                items.append(Space(em)), kinds.append("space")
                items.append(Text(c, kind="rel" if rel else "bin")), kinds.append("rel" if rel else "bin")
                items.append(Space(em)), kinds.append("space")
            else:
                items.append(Text(c)), kinds.append("bin")
        elif c in ",;":
            items.append(Text(c)), kinds.append("punct")
            items.append(Space(0.18)), kinds.append("space")
        else:
            items.append(_letter(c)), kinds.append("open" if c in _OPEN else "close" if c in _CLOSE else "ord")

    def _script(self, mark, items, kinds, depth):
        arg = self._group(depth)
        base = items.pop() if items else Text("")
        if kinds:
            kinds.pop()
        kinds.append("ord")
        sup, sub = (arg, None) if mark == "^" else (None, arg)
        if isinstance(base, Brace) and base.label is None:
            base.label = arg
            items.append(base)
        elif isinstance(base, Limits):
            base.over, base.under = base.over or sup, base.under or sub
            items.append(base)
        elif isinstance(base, Op) and base.limits:
            items.append(Limits(base, sup, sub))
        elif isinstance(base, Script) and ((mark == "^" and base.sup is None) or (mark == "_" and base.sub is None)):
            base.sup, base.sub = base.sup or sup, base.sub or sub
            items.append(base)
        else:
            items.append(Script(base, sup, sub))

    def _command(self, items, kinds, depth):
        self.i += 1                                   # '\'
        if self.i >= len(self.s):
            return
        name = self._name()
        if not name:                                  # \{ \} \, \; \: \! \| \% …
            ch = self.s[self.i]
            self.i += 1
            if ch in ",;: ":
                items.append(Space(0.2 if ch == "," else 0.28)), kinds.append("space")
            elif ch == "!":
                pass
            elif ch in "{}":
                items.append(Text(ch)), kinds.append("open" if ch == "{" else "close")
            elif ch == "|":
                items.append(Text("‖")), kinds.append("ord")
            elif can_draw(ch):
                items.append(Text(ch)), kinds.append("ord")
            return
        if name in ("frac", "dfrac", "tfrac", "cfrac"):
            num, den = self._group(depth), self._group(depth)
            items.append(Frac(num, den)), kinds.append("ord")
        elif name == "binom":
            num, den = self._group(depth), self._group(depth)
            items.append(Delimited(Frac(num, den), "(", ")")), kinds.append("ord")
        elif name == "sqrt":
            index = None
            self._skip_spaces()
            if self._peek("["):
                end = self.s.find("]", self.i)
                if end > 0:
                    sub = _Parser(self.s[self.i + 1:end])
                    index = sub.row(depth + 1)
                    self.i = end + 1
            items.append(Radical(self._group(depth), index)), kinds.append("ord")
        elif name in ("bar", "overline"):
            items.append(Over(self._group(depth), "bar")), kinds.append("ord")
        elif name in ("hat", "widehat", "tilde", "widetilde", "vec"):
            items.append(Over(self._group(depth), name.replace("wide", ""))), kinds.append("ord")
        elif name in ("text", "mathrm", "mathbf", "mathit", "mathsf", "mathcal", "textbf", "textrm", "textit", "boldsymbol", "operatorname", "mbox"):
            raw = "".join(c for c in self._raw_group() if can_draw(c))
            items.append(Text(raw, bold=name in ("mathbf", "textbf", "boldsymbol"))), kinds.append("ord")
        elif name == "mathbb":
            raw = self._raw_group()
            items.append(Text("".join(BLACKBOARD.get(c, c) if can_draw(BLACKBOARD.get(c, c)) else c for c in raw))), kinds.append("ord")
        elif name in ("dot", "ddot", "check", "breve", "acute", "grave"):
            items.append(Over(self._group(depth), name)), kinds.append("ord")
        elif name in ("overrightarrow", "overleftarrow"):
            items.append(Over(self._group(depth), "rarrow" if name == "overrightarrow" else "larrow")), kinds.append("ord")
        elif name == "underline":
            items.append(Under(self._group(depth))), kinds.append("ord")
        elif name in ("overbrace", "underbrace"):
            items.append(Brace(self._group(depth), name == "overbrace")), kinds.append("ord")
        elif name in ("xrightarrow", "xleftarrow", "xRightarrow", "xLeftarrow", "xleftrightarrow", "xmapsto", "xhookrightarrow"):
            under = None
            self._skip_spaces()
            if self._peek("["):
                end = self.s.find("]", self.i)
                if end > 0:
                    under = _Parser(self.s[self.i + 1:end]).row(depth + 1)
                    self.i = end + 1
            direction = "lr" if "leftright" in name else "l" if "left" in name.lower() else "r"
            items.append(Arrow(self._group(depth), under, direction)), kinds.append("rel")
        elif name in ("overset", "stackrel"):
            top, base = self._group(depth), self._group(depth)
            items.append(Limits(base, top, None)), kinds.append("rel" if name == "stackrel" else "ord")
        elif name == "underset":
            under, base = self._group(depth), self._group(depth)
            items.append(Limits(base, None, under)), kinds.append("ord")
        elif name == "not":
            self._skip_spaces()
            nxt = self.s[self.i:self.i + 1]
            composed = {"=": "≠", "<": "≮", ">": "≯"}.get(nxt)
            if composed and can_draw(composed):
                self.i += 1
                items.append(Space(0.28)), items.append(Text(composed, kind="rel")), items.append(Space(0.28))
                kinds.extend(["space", "rel", "space"])
            else:
                items.append(Slashed(self._group(depth))), kinds.append("rel")
        elif name in ("cancel", "bcancel", "xcancel"):
            items.append(Strike(self._group(depth), name)), kinds.append("ord")
        elif name == "boxed":
            items.append(Boxed(self._group(depth))), kinds.append("ord")
        elif name in ("phantom", "hphantom", "vphantom"):
            items.append(Phantom(self._group(depth))), kinds.append("space")
        elif name in _BIG or name[:-1] in _BIG and name[-1] in "lrm":
            base_name = name if name in _BIG else name[:-1]
            token = self._delim_token()
            if token:
                items.append(Fence(token, _BIG[base_name])), kinds.append("open" if name.endswith("l") else "close" if name.endswith("r") else "ord")
        elif name == "pmod":
            items.extend([Space(0.45), Text("(mod"), Space(0.25), self._group(depth), Text(")")]), kinds.extend(["space", "ord", "space", "ord", "close"])
        elif name in ("bmod", "mod"):
            items.extend([Space(0.3), Text("mod"), Space(0.25)]), kinds.extend(["space", "ord", "space"])
        elif name == "substack":
            items.append(self._substack(depth)), kinds.append("ord")
        elif name in ("tag", "label", "hspace", "vspace", "hskip", "kern", "mskip", "mspace"):
            raw = self._raw_group()
            if name in ("hspace", "hskip", "kern", "mskip", "mspace"):
                m = re.match(r"\s*(-?[0-9.]+)\s*(em|ex|pt|mu|cm|mm)?", raw)
                if m:
                    value = float(m.group(1)) if m.group(1) not in ("-", ".") else 0
                    em = {"em": value, "ex": value / 2, "pt": value / 10, "mu": value / 18, "cm": value * 2.8, "mm": value * 0.28}.get(m.group(2) or "em", value)
                    items.append(Space(max(min(em, 4), 0))), kinds.append("space")
        elif name in ("hline", "hdashline", "nonumber", "notag", "mathstrut", "relax", "middle", "mathop", "mathrel", "mathbin", "mathord", "mathpunct"):
            if name in ("mathop", "mathrel", "mathbin", "mathord", "mathpunct"):
                items.append(self._group(depth)), kinds.append("ord")
        elif name in ("over", "choose", "atop"):                     # n \choose k, a \over b : 앞의 식 전체가 분자
            num = Row(_merge(items))
            items.clear()
            kinds.clear()
            den = self.row(depth)
            frac = Frac(num, den) if name != "atop" else Frac(num, den)
            items.append(Delimited(frac, "(", ")") if name == "choose" else frac), kinds.append("ord")
        elif name in ("limits", "nolimits"):
            if items and isinstance(items[-1], Op):
                items[-1].limits = name == "limits"
        elif name == "left":
            left = self._delim_token()
            inner = self.row(depth + 1)
            right = ""
            if self._peek("\\right"):
                self.i += len("\\right")
                right = self._delim_token()
            items.append(Delimited(inner, left, right)), kinds.append("close")
        elif name == "begin":
            items.append(self._environment(depth)), kinds.append("ord")
        elif name in _BIGOPS:
            items.append(Op(LATEX_WORDS.get(name, name), name)), kinds.append("op")
        elif name in _FUNCS:
            items.append(Op(name, name) if name in _LIMIT_OPS else Text(name)), kinds.append("ord")
            self._skip_spaces()
            if not (self._peek("(") or self._peek("_") or self._peek("^")):
                items.append(Space(0.14)), kinds.append("space")
        elif name in ("quad", "qquad"):
            items.append(Space(1.0 if name == "quad" else 2.0)), kinds.append("space")
        elif name in ("left", "right", "limits", "nolimits", "displaystyle", "textstyle", "scriptstyle"):
            pass
        elif name in LATEX_WORDS:
            symbol = LATEX_WORDS[name]
            if name in GREEK and re.match(r" +[A-Za-z0-9]", self.s[self.i:]):
                self._skip_spaces()
            kind = "rel" if symbol in _RELATIONS else "bin" if symbol in _BINARY else "open" if symbol in _OPEN else "close" if symbol in _CLOSE else "ord"
            if kind in ("rel", "bin"):
                em = 0.28 if kind == "rel" else 0.22
                items.append(Space(em)), kinds.append("space")
                items.append(Text(symbol, kind=kind)), kinds.append(kind)
                items.append(Space(em)), kinds.append("space")
            elif symbol in "∫∬∭∮":
                items.append(Op(symbol, "int")), kinds.append("ord")
            else:
                items.append(Text(symbol, italic=name in GREEK and symbol.islower()) if all(can_draw(c) for c in symbol) else Text(name)), kinds.append("ord")
        else:
            items.append(Text(name)), kinds.append("ord")

    def _substack(self, depth):
        """\\substack{a \\\\ b}: 합 기호 아래에 여러 줄 조건."""
        self._skip_spaces()
        if self._peek("{"):
            self.i += 1
        rows = []
        while self.i < len(self.s):
            self._tick()
            rows.append([self.row(depth + 1)])
            if self._peek("\\\\"):
                self.i += 2
            else:
                break
        if self._peek("}"):
            self.i += 1
        return Matrix(rows, "", "", "c")

    def _environment(self, depth):
        env = self._raw_group().strip().rstrip("*")
        col_aligns, vlines = None, set()
        if env == "array":
            spec = self._raw_group()                  # {c|cc} : 열 정렬과 세로선
            col_aligns, col = [], 0
            for ch in spec:
                if ch in "clr":
                    col_aligns.append(ch)
                    col += 1
                elif ch == "|":
                    vlines.add(col)
        rows, cur, hlines = [], [], set()
        while self.i < len(self.s):
            self._tick()
            if not cur:                               # 줄 맨 앞의 \\hline
                self._skip_spaces()
                while self._peek("\\hline") or self._peek("\\hdashline"):
                    self.i += len("\\hline") if self._peek("\\hline") else len("\\hdashline")
                    hlines.add(len(rows))
                    self._skip_spaces()
            cell = self.row(depth + 1)
            cur.append(cell)
            if self._peek("&"):
                self.i += 1
            elif self._peek("\\\\"):
                self.i += 2
                rows.append(cur)
                cur = []
            else:
                break
        if cur and any(c.items for c in cur):
            rows.append(cur)
        if self._peek("\\end"):                       # \\end{env}
            self.i += len("\\end")
            self._raw_group()
        left, right = _ENV_DELIMS.get(env, ("", ""))
        rows = [r for r in rows if r]
        return Matrix(rows, left, right, align="l" if env in _LEFT_ALIGN else "c", col_aligns=col_aligns, vlines=vlines, hlines=hlines,
                      pairs=env in _ALIGNED)


def _letter(ch):
    """영문·그리스 소문자 한 글자는 기울인 변수로, 나머지(숫자·기호·한글)는 세운 글자로."""
    variable = ("a" <= ch.lower() <= "z" and ch.isascii()) or 0x3B1 <= ord(ch) <= 0x3C9
    return Text(ch, italic=variable)


def _merge(items):
    """이웃한 같은 모양의 글자 상자를 하나로 합친다 (글자 사이 간격이 자연스럽게)."""
    out = []
    for item in items:
        prev = out[-1] if out else None
        if type(item) is Text and type(prev) is Text and prev.bold == item.bold and prev.italic == item.italic and prev.kind == item.kind == "ord":
            out[-1] = Text(prev.text + item.text, prev.bold, "ord", prev.italic)
        else:
            out.append(item)
    return out


# ── 본문 줄에 끼워 넣는 수식 덩어리 ─────────────────────────────────────────

class MathAtom:
    """본문 줄 속의 수식 한 덩어리 (줄바꿈할 수 없는 단위)."""

    def __init__(self, box):
        self.box = box

    def metrics(self, size):
        return self.box.metrics(size)

    def fit(self, size, avail):
        """덩어리가 한 줄(avail)보다 넓으면 글씨를 줄여 맞춘다 (너무 작아지지는 않게)."""
        low = size * 0.55
        while self.box.metrics(size)[0] > avail and size > low:
            size *= 0.94
        return size

    def draw(self, d, x, base, size, color):
        self.box.draw(d, x, base, size, color)


def _split_chunks(items, kinds):
    """최상위에서 등호·연산자·쉼표 뒤(그 뒤의 여백까지)에서 끊어 여러 덩어리로 나눈다 (긴 식이 줄바꿈되도록)."""
    chunks, cur = [], []
    for k, item in enumerate(items):
        cur.append(item)
        if kinds[k] == "space" and k > 0 and kinds[k - 1] in ("rel", "bin", "punct") and not (k + 1 < len(kinds) and kinds[k + 1] == "space"):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


# ── 간이 표기 → LaTeX ───────────────────────────────────────────────────────
# AI가 JSON이 깨지지 않게 백슬래시 없이 쓴 수식($a/b$, $mu$, $sum_{i=1}^n$, [[a, b], [c, d]])도 분수·행렬·기호로 그리려고 LaTeX로 바꿔 준다.
# 이미 LaTeX 명령(백슬래시)이 들어 있는 수식은 그대로 둔다.

_PLAIN_WORDS = sorted(list(GREEK) + ["sum", "prod", "partial", "nabla", "sin", "cos", "tan", "log", "ln", "exp", "det", "lim", "max", "min"],
                      key=len, reverse=True)
_PLAIN_WORD_RE = re.compile(r"(?<![A-Za-z\\])(" + "|".join(_PLAIN_WORDS) + r")(?![A-Za-z])")
_PLAIN_SYMBOLS = (("<->", r"\leftrightarrow "), ("<=>", r"\Leftrightarrow "), ("=>", r"\Rightarrow "), ("->", r"\to "), ("<=", r"\le "),
                  (">=", r"\ge "), ("!=", r"\ne "), ("+-", r"\pm "), ("~=", r"\approx "))
_MATRIX_RE = re.compile(r"\[\s*\[(.+?)\]\s*\]")


def _match_forward(s, i):
    """s[i]가 여는 괄호일 때 짝이 맞는 닫는 괄호의 위치 (없으면 -1)."""
    pair = {"(": ")", "[": "]", "{": "}"}[s[i]]
    depth = 0
    for j in range(i, len(s)):
        depth += (s[j] == s[i]) - (s[j] == pair)
        if depth == 0:
            return j
    return -1


def _match_backward(s, i):
    """s[i]가 닫는 괄호일 때 짝이 맞는 여는 괄호의 위치 (없으면 -1)."""
    opener = {")": "(", "]": "[", "}": "{"}[s[i]]
    depth = 0
    for j in range(i, -1, -1):
        depth += (s[j] == s[i]) - (s[j] == opener)
        if depth == 0:
            return j
    return -1


def _convert_matrices(s):
    """[[a, b], [c, d]] → \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}."""
    def repl(m):
        rows = re.split(r"\]\s*,\s*\[", m.group(1))
        body = [" & ".join(cell.strip() for cell in _top_level_split(row)) for row in rows]
        return r"\begin{bmatrix} " + r" \\ ".join(body) + r" \end{bmatrix}"

    return _MATRIX_RE.sub(repl, s)


def _top_level_split(text):
    parts, depth, cur = [], 0, ""
    for ch in text:
        depth += ch in "([{" ; depth -= ch in ")]}"
        if ch == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    return parts + [cur]


def _convert_calls(s, name, command):
    """sqrt(x) → \\sqrt{x}, bar(x) → \\bar{x} …"""
    pattern = re.compile(r"(?<![A-Za-z\\])" + name + r"\s*(?=[({])")
    pos = 0
    for _ in range(40):
        m = pattern.search(s, pos)
        if not m:
            break
        end = _match_forward(s, m.end())
        if end < 0:
            pos = m.end()
            continue
        s = s[:m.start()] + command + "{" + s[m.end() + 1:end] + "}" + s[end + 1:]
        pos = m.start() + len(command) + 1
    return s


def _left_operand(s, end):
    i = end
    while i > 0 and s[i - 1] == " ":
        i -= 1
    stop = i
    while i > 0:
        c = s[i - 1]
        if c in ")]}":
            j = _match_backward(s, i - 1)
            if j < 0:
                break
            i = j
        elif c.isalnum() or c in "._^'":
            i -= 1
            if i > 0 and s[i - 1] == "\\" and not s[i].isdigit():       # \sqrt, \mu 같은 명령은 백슬래시까지 한 덩어리
                i -= 1
        else:
            break
    return i, stop


def _right_operand(s, start):
    i = start
    while i < len(s) and s[i] == " ":
        i += 1
    first = i
    while i < len(s):
        c = s[i]
        if c in "([{":
            j = _match_forward(s, i)
            if j < 0:
                break
            i = j + 1
        elif c.isalnum() or c in "._^'":
            i += 1
        else:
            break
    return first, i


def _unwrap(text):
    if text.startswith("(") and text.endswith(")") and _match_forward(text, 0) == len(text) - 1:
        return text[1:-1]
    return text


def _convert_fractions(s):
    """a/b → \\frac{a}{b}: 양쪽 피연산자는 글자·숫자·첨자 묶음이나 괄호 묶음 하나."""
    pos = 0
    for _ in range(40):
        k = s.find("/", pos)
        if k < 0:
            break
        li, stop = _left_operand(s, k)
        rs, re_ = _right_operand(s, k + 1)
        if li == stop or rs == re_:
            pos = k + 1
            continue
        new = r"\frac{" + _unwrap(s[li:stop]) + "}{" + _unwrap(s[rs:re_]) + "}"
        s = s[:li] + new + s[re_:]
        pos = li + len(new)
    return s


_ENV_NAMES = "|".join(sorted(_ENV_DELIMS, key=len, reverse=True))
_LOST_BEGIN_END = re.compile(r"(?<![A-Za-z\\])(begin|end)\{(" + _ENV_NAMES + r")\*?\}")


_COMMAND_WORDS = sorted(set(LATEX_WORDS) | {"frac", "dfrac", "tfrac", "sqrt", "bar", "vec", "overline", "underline", "mathbb", "mathcal", "binom", "mathrm", "mathbf"},
                        key=len, reverse=True)
_DOUBLED_COMMAND = re.compile(r"\\\\(" + "|".join(_COMMAND_WORDS) + r")(?![A-Za-z])")


def repair_latex(tex):
    """AI가 JSON 이스케이프를 어긋나게 쓴 LaTeX를 고친다.
    - 백슬래시가 빠진 \\begin{…}·\\end{…} (end{bmatrix} → \\end{bmatrix})
    - 행렬 환경 안에서 하나만 남은 행 구분: `a & b \\ c & d`의 `\\` 하나를 `\\\\`로 (뒤에 공백이 오고 앞뒤에 다른 백슬래시가 없는 것만)"""
    s = _LOST_BEGIN_END.sub(lambda m: "\\" + m.group(0), tex)
    if "\\begin{" not in s:
        return _DOUBLED_COMMAND.sub(r"\\\1", s)           # 백슬래시를 두 번 써 버린 명령 ($\\rightarrow$ → $\rightarrow$). 행렬 안의 행 구분(\\)과 헷갈리지 않게 행렬이 없을 때만
    out, depth, i = [], 0, 0
    while i < len(s):
        if s.startswith("\\begin{", i):
            depth += 1
        elif s.startswith("\\end{", i):
            depth = max(depth - 1, 0)
        lone = (s[i] == "\\" and depth and (i == 0 or s[i - 1] != "\\") and i + 1 < len(s) and s[i + 1] == " "
                and not s.startswith("\\\\", i))
        out.append("\\\\" if lone else s[i])
        i += 1
    return "".join(out)


def to_latex(tex):
    """간이 표기를 LaTeX로. 백슬래시가 이미 있으면 LaTeX로 쓴 것이라 (이스케이프만 고쳐) 그대로 돌려준다."""
    s = repair_latex(str(tex or ""))
    if "\\" in s:
        return s
    s = _convert_matrices(s)
    for plain, latex in _PLAIN_SYMBOLS:
        s = s.replace(plain, latex)
    for name, command in (("sqrt", r"\sqrt"), ("bar", r"\bar"), ("hat", r"\hat"), ("tilde", r"\tilde"), ("vec", r"\vec")):
        s = _convert_calls(s, name, command)
    s = re.sub(r"\b([A-Za-z])_(bar|hat|tilde)\b", lambda m: "\\%s{%s}" % (m.group(2), m.group(1)), s)
    s = re.sub(r"(?<![A-Za-z\\])(?:inf|infinity)(?![A-Za-z])", r"\\infty ", s)
    s = _convert_fractions(s)
    return _PLAIN_WORD_RE.sub(lambda m: "\\" + m.group(1) + " ", s)


def latexify_markdown(text):
    """노트 마크다운 속 $수식$을 모두 LaTeX로 바꾼다 (KaTeX로 그리는 글 화면용). 수식 밖의 [[행렬]]도 수식으로 감싼다."""
    pieces, last = [], 0
    for m in _MATH_SPAN.finditer(text):
        pieces.append(_wrap_bare_matrices(text[last:m.start()]))
        inner = m.group(1) if m.group(1) is not None else m.group(2)
        pieces.append("$$" + to_latex(inner.strip()) + "$$" if m.group(1) is not None else "$" + to_latex(inner.strip()) + "$")
        last = m.end()
    pieces.append(_wrap_bare_matrices(text[last:]))
    return "".join(pieces)


_MATH_SPAN = re.compile(r"\$\$([\s\S]+?)\$\$|\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)")


_BARE_GREEK = re.compile(r"(?<![A-Za-z\\])(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|sigma|tau|phi|omega|rho|chi|psi|eta|zeta|kappa|nu|xi|"
                         r"Delta|Sigma|Omega|Gamma|Lambda|Theta|Phi|Psi)(?![A-Za-z])")


def _wrap_bare_matrices(text):
    """수식 밖의 [[행렬]]과 그리스 문자 이름(mu, sigma …)을 $…$ 수식으로 감싼다 (AI가 $ 없이 쓴 경우)."""
    text = _MATRIX_RE.sub(lambda m: "$" + _convert_matrices(m.group(0)) + "$", text)
    return _BARE_GREEK.sub(lambda m: "$\\" + m.group(1) + "$", text)


def wrap_bare_math(text):
    """$…$ 밖의 글에서만 _wrap_bare_matrices를 적용한다."""
    pieces, last = [], 0
    for m in _MATH_SPAN.finditer(text):
        pieces.append(_wrap_bare_matrices(text[last:m.start()]))
        pieces.append(m.group(0))
        last = m.end()
    pieces.append(_wrap_bare_matrices(text[last:]))
    return "".join(pieces)


def parse_chunks(tex):
    """LaTeX → [MathAtom]. 해석에 실패하면 빈 목록 (호출한 쪽이 글자로 대신 쓴다)."""
    try:
        parser = _Parser(to_latex(tex))
        items, kinds = parser.row_items(0)
        while parser.i < len(parser.s):                   # 짝이 안 맞는 } 같은 것은 건너뛰고 계속 읽는다
            parser.i += 1
            more_items, more_kinds = parser.row_items(0)
            items, kinds = items + more_items, kinds + more_kinds
        atoms = [MathAtom(Row(_merge(part))) for part in _split_chunks(items, kinds) if part]
        for atom in atoms:                                # 크기를 재어 보아 이상한 상자는 미리 걸러낸다
            width, asc, dsc = atom.metrics(29)
            if not all(0 <= v < 5000 for v in (width, asc, dsc)):
                return []
        return atoms
    except Exception:                                    # 어떤 수식이든 노트 전체를 망치지 않는다
        return []
