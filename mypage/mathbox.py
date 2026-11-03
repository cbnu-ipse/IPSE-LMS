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

from .notefont import BLACKBOARD, GREEK, LATEX_WORDS, font, has_glyph

ASC, DESC = 0.80, 0.22          # 글자 상자의 기준선 위·아래 높이 (글씨 크기 대비)
AXIS = 0.30                     # 분수 막대·행렬 가운데가 기준선보다 올라가는 높이
SCRIPT = 0.70                   # 첨자 글씨 배율
FRAC_SCALE = 0.84               # 분수의 분자·분모 글씨 배율
MAX_DEPTH = 8                   # 중첩 깊이 상한 (분수 안의 분수 안의 …)
MAX_STEPS = 4000                # 해석기가 무한히 돌지 않게 하는 상한

_RELATIONS = set("=<>≤≥≠≈≡∼→←⇒⇐⇔↔∈∉⊂⊃⊆⊇∝≪≫∥⊥")
_BINARY = set("+-−±∓×·÷*∘∪∩∖")
_OPEN, _CLOSE = set("(["), set(")]")
_LIMIT_OPS = {"sum", "prod", "lim", "max", "min", "limsup", "liminf", "bigcup", "bigcap"}
_FUNCS = {"det", "sin", "cos", "tan", "log", "ln", "exp", "lim", "max", "min", "limsup", "liminf", "gcd", "dim", "rank", "tr", "arg", "sup", "inf", "Pr"}
_ENV_DELIMS = {"bmatrix": ("[", "]"), "pmatrix": ("(", ")"), "vmatrix": ("|", "|"), "Vmatrix": ("‖", "‖"), "Bmatrix": ("{", "}"),
               "matrix": ("", ""), "smallmatrix": ("", ""), "cases": ("{", ""), "array": ("", ""), "aligned": ("", ""), "align": ("", ""),
               "gathered": ("", "")}
_LEFT_ALIGN = {"cases", "aligned", "align"}
_DELIM_NAMES = {"langle": "⟨", "rangle": "⟩", "lvert": "|", "rvert": "|", "lVert": "‖", "rVert": "‖", "lfloor": "⌊", "rfloor": "⌋",
                "lceil": "⌈", "rceil": "⌉", "{": "{", "}": "}", "|": "‖", "vert": "|", "Vert": "‖"}
_ACCENT_GLYPH = {"hat": "^", "tilde": "~", "vec": "→"}


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
    def __init__(self, text, bold=False, kind="ord"):
        self.text, self.bold, self.kind = text, bold, kind

    def metrics(self, size):
        return font(_px(size), self.bold).getlength(self.text), size * ASC, size * DESC

    def draw(self, d, x, base, size, color):
        d.text((x, base), self.text, font=font(_px(size), self.bold), fill=color, anchor="ls")


class Op(Text):
    """\\sum \\prod \\lim 처럼 첨자가 위·아래에 놓이는 기호."""

    def __init__(self, text, name):
        super().__init__(text, kind="op")
        self.name, self.limits = name, name in _LIMIT_OPS

    def metrics(self, size):
        w, a, dsc = super().metrics(size)
        if self.name in ("sum", "prod"):
            return w * 1.2, size * 0.95, size * 0.3                      # 큰 기호
        return w, a, dsc

    def draw(self, d, x, base, size, color):
        if self.name in ("sum", "prod"):
            big = _px(size * 1.35)
            d.text((x + size * 0.04, base + size * 0.12), self.text, font=font(big), fill=color, anchor="ls")
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
    """평균 막대(x̄)·모자(x̂)·물결(x̃)·벡터(v⃗)."""

    def __init__(self, body, kind):
        self.body, self.kind = body, kind

    def metrics(self, size):
        bw, ba, bd = self.body.metrics(size)
        return bw, ba + 0.20 * size, bd

    def draw(self, d, x, base, size, color):
        bw, ba, bd = self.body.metrics(size)
        self.body.draw(d, x, base, size, color)
        y = base - ba - 0.08 * size
        if self.kind == "bar":
            d.line([(x + 0.04 * size, y), (x + bw - 0.04 * size, y)], fill=color, width=_thick(size))
        else:
            glyph = _ACCENT_GLYPH.get(self.kind, "^")
            small = _px(size * 0.7)
            gw = font(small).getlength(glyph)
            d.text((x + (bw - gw) / 2, y + 0.18 * size), glyph, font=font(small), fill=color, anchor="ls")


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
            f = font(_px(size))
            return w + sum(f.getlength(c) for c in (self.left, self.right) if c), max(a, size * ASC), max(dsc, size * DESC)
        pad = 0.07 * size
        return w + _delim_width(self.left, size) + _delim_width(self.right, size) + 0.12 * size, a + pad, dsc + pad

    def draw(self, d, x, base, size, color):
        w, a, dsc = self.inner.metrics(size)
        if self._plain(size):
            f = font(_px(size))
            if self.left:
                d.text((x, base), self.left, font=f, fill=color, anchor="ls")
                x += f.getlength(self.left)
            self.inner.draw(d, x, base, size, color)
            if self.right:
                d.text((x + w, base), self.right, font=f, fill=color, anchor="ls")
            return
        pad, th = 0.07 * size, _thick(size)
        lw, rw = _delim_width(self.left, size), _delim_width(self.right, size)
        y0, y1 = base - a - pad, base + dsc + pad
        _draw_delim(d, self.left, x, y0, y1, lw, color, th)
        self.inner.draw(d, x + lw + 0.06 * size, base, size, color)
        _draw_delim(d, self.right, x + lw + 0.06 * size + w + 0.06 * size, y0, y1, rw, color, th)


class Matrix(Box):
    def __init__(self, rows, left="", right="", align="c"):
        self.rows, self.left, self.right, self.align = rows, left, right, align

    def _layout(self, size):
        cells = [[c.metrics(size) for c in row] for row in self.rows]
        cols = max((len(r) for r in cells), default=0)
        widths = [max((r[j][0] for r in cells if j < len(r)), default=0) for j in range(cols)]
        rows = [(max((m[1] for m in r), default=size * ASC), max((m[2] for m in r), default=size * DESC)) for r in cells]
        row_gap, col_gap = 0.40 * size, 0.95 * size
        height = sum(a + dsc for a, dsc in rows) + row_gap * max(len(rows) - 1, 0)
        width = sum(widths) + col_gap * max(cols - 1, 0)
        return cells, widths, rows, row_gap, col_gap, height, width

    def metrics(self, size):
        cells, widths, rows, row_gap, col_gap, height, width = self._layout(size)
        lw, rw = _delim_width(self.left, size), _delim_width(self.right, size)
        gap = 0.18 * size
        total = width + lw + rw + (gap if self.left else 0) + (gap if self.right else 0)
        return total, AXIS * size + height / 2 + 0.05 * size, max(height / 2 - AXIS * size, size * DESC) + 0.05 * size

    def draw(self, d, x, base, size, color):
        cells, widths, rows, row_gap, col_gap, height, width = self._layout(size)
        lw, rw = _delim_width(self.left, size), _delim_width(self.right, size)
        gap = 0.18 * size
        top = base - AXIS * size - height / 2
        th = _thick(size)
        _draw_delim(d, self.left, x, top - 0.05 * size, top + height + 0.05 * size, lw, color, th)
        cx = x + lw + (gap if self.left else 0)
        y = top
        for r, row in enumerate(self.rows):
            asc, dsc = rows[r]
            px = cx
            for j, cell in enumerate(row):
                cw = cells[r][j][0]
                off = (widths[j] - cw) / 2 if self.align == "c" else 0
                cell.draw(d, px + off, y + asc, size, color)
                px += widths[j] + col_gap
            y += asc + dsc + row_gap
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
        return self.s.startswith(text, self.i)

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
        return Row([Text(ch) if has_glyph(ch) else Space(0)])

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
        if not has_glyph(c):
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
            items.append(Text(c)), kinds.append("open" if c in _OPEN else "close" if c in _CLOSE else "ord")

    def _script(self, mark, items, kinds, depth):
        arg = self._group(depth)
        base = items.pop() if items else Text("")
        if kinds:
            kinds.pop()
        kinds.append("ord")
        sup, sub = (arg, None) if mark == "^" else (None, arg)
        if isinstance(base, Limits):
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
            elif has_glyph(ch):
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
            raw = "".join(c for c in self._raw_group() if has_glyph(c))
            items.append(Text(raw, bold=name in ("mathbf", "textbf", "boldsymbol"))), kinds.append("ord")
        elif name == "mathbb":
            raw = self._raw_group()
            items.append(Text("".join(BLACKBOARD.get(c, c) if has_glyph(BLACKBOARD.get(c, c)) else c for c in raw))), kinds.append("ord")
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
        elif name in _LIMIT_OPS and name in ("sum", "prod", "bigcup", "bigcap"):
            items.append(Op({"sum": "Σ", "prod": "Π", "bigcup": "⋃", "bigcap": "⋂"}.get(name, name), name)), kinds.append("op")
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
            kind = "rel" if symbol in _RELATIONS else "bin" if symbol in _BINARY else "ord"
            if kind in ("rel", "bin"):
                em = 0.28 if kind == "rel" else 0.22
                items.append(Space(em)), kinds.append("space")
                items.append(Text(symbol, kind=kind)), kinds.append(kind)
                items.append(Space(em)), kinds.append("space")
            elif symbol == "∫":
                items.append(Op("∫", "int")), kinds.append("ord")
            else:
                items.append(Text(symbol) if all(has_glyph(c) for c in symbol) else Text(name)), kinds.append("ord")
        else:
            items.append(Text(name)), kinds.append("ord")

    def _environment(self, depth):
        env = self._raw_group().strip()
        if env == "array":
            self._raw_group()                         # {cc|c} 같은 열 설명은 쓰지 않는다
        rows, cur = [], []
        while self.i < len(self.s):
            self._tick()
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
        if self._peek("\\end"):                       # \end{env}
            self.i += len("\\end")
            self._raw_group()
        left, right = _ENV_DELIMS.get(env, ("", ""))
        rows = [r for r in rows if r]
        return Matrix(rows, left, right, align="l" if env in _LEFT_ALIGN else "c")


def _merge(items):
    """이웃한 같은 모양의 글자 상자를 하나로 합친다 (글자 사이 간격이 자연스럽게)."""
    out = []
    for item in items:
        prev = out[-1] if out else None
        if type(item) is Text and type(prev) is Text and prev.bold == item.bold and prev.kind == item.kind == "ord":
            out[-1] = Text(prev.text + item.text, prev.bold)
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


def parse_chunks(tex):
    """LaTeX → [MathAtom]. 해석에 실패하면 빈 목록 (호출한 쪽이 글자로 대신 쓴다)."""
    try:
        parser = _Parser(str(tex or ""))
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
