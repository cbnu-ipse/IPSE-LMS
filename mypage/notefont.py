"""노트 그림에서 함께 쓰는 글꼴과 기호 표 (notepage: 문서 배치, mathbox: 수식 조판)."""
import os

from django.conf import settings
from PIL import ImageFont

FONT_DIR = os.path.join(str(settings.BASE_DIR), "static", "fonts")
FONT_REGULAR = os.path.join(FONT_DIR, "Pretendard-Regular.otf")
FONT_BOLD = os.path.join(FONT_DIR, "Pretendard-Bold.otf")
FONT_SERIF = os.path.join(FONT_DIR, "NanumMyeongjo-Regular.ttf")       # 요약 노트 본문 글꼴이 없거나 글자가 모자랄 때 쓰는 명조 (SIL OFL)
FONT_SERIF_BOLD = os.path.join(FONT_DIR, "NanumMyeongjo-Bold.ttf")
# 요약 노트 본문 글꼴: 이서윤체(흥국생명 서체)가 NOTE_FONT_PATH에 있으면 그것을, 없으면 나눔명조를 쓴다.
# 이서윤체는 OFL이 아니라 저장소에 올리지 않는다 (private_fonts/ 는 git 제외, 배포 때 서버에 둔다). 굵은체가 없어 굵게는 글씨를 덧그려 만든다.
HAND_SCALE = {"seoyun": {False: 1.16, True: 1.16}, "serif": {False: 1.12, True: 1.08}}      # 글꼴마다 같은 크기로도 달라 보이는 정도를 맞춘다
FONT_MATH = os.path.join(FONT_DIR, "NotoSansMath-Regular.ttf")      # 한글 글꼴에 없는 수학 기호와 수학용 기울임꼴(𝑥 𝛼 …)

SUB = dict(zip("₀₁₂₃₄₅₆₇₈₉", "0123456789"))
SUP = dict(zip("⁰¹²³⁴⁵⁶⁷⁸⁹", "0123456789"))
# LaTeX 명령 → 글꼴에 있는 실제 기호
LATEX_WORDS = {
    "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε", "varepsilon": "ε", "zeta": "ζ", "eta": "η", "theta": "θ",
    "lambda": "λ", "mu": "μ", "nu": "ν", "xi": "ξ", "pi": "π", "rho": "ρ", "sigma": "σ", "tau": "τ", "phi": "φ", "varphi": "φ",
    "chi": "χ", "psi": "ψ", "omega": "ω", "Gamma": "Γ", "Delta": "Δ", "Theta": "Θ", "Lambda": "Λ", "Pi": "Π", "Sigma": "Σ",
    "Phi": "Φ", "Psi": "Ψ", "Omega": "Ω", "sum": "Σ", "prod": "Π", "int": "∫", "infty": "∞", "partial": "∂", "nabla": "∇",
    "le": "≤", "leq": "≤", "ge": "≥", "geq": "≥", "ne": "≠", "neq": "≠", "approx": "≈", "equiv": "≡", "propto": "∝",
    "pm": "±", "mp": "∓", "times": "×", "cdot": "·", "div": "÷", "to": "→", "rightarrow": "→", "leftarrow": "←",
    "Rightarrow": "⇒", "Leftarrow": "⇐", "leftrightarrow": "↔", "Leftrightarrow": "⇔", "therefore": "∴", "because": "∵",
    "ldots": "…", "cdots": "…", "dots": "…", "in": "∈", "notin": "∉", "subset": "⊂", "supset": "⊃", "subseteq": "⊆",
    "supseteq": "⊇", "cup": "∪", "cap": "∩", "forall": "∀", "exists": "∃", "prime": "′", "angle": "∠", "perp": "⊥",
    "ni": "∋", "circ": "∘", "ll": "≪", "gg": "≫", "sim": "∼", "mid": "|", "emptyset": "∅", "setminus": "∖",
    "oplus": "⊕", "otimes": "⊗", "ominus": "⊖", "odot": "⊙", "wedge": "∧", "land": "∧", "vee": "∨", "lor": "∨", "neg": "¬", "lnot": "¬",
    "cong": "≅", "simeq": "≃", "prec": "≺", "succ": "≻", "preceq": "≼", "succeq": "≽", "parallel": "∥", "nparallel": "∦", "doteq": "≐",
    "mapsto": "↦", "longrightarrow": "⟶", "longleftarrow": "⟵", "longleftrightarrow": "⟷", "implies": "⟹", "impliedby": "⟸", "iff": "⟺",
    "hookrightarrow": "↪", "uparrow": "↑", "downarrow": "↓", "updownarrow": "↕", "gets": "←", "nearrow": "↗", "searrow": "↘",
    "bullet": "∙", "star": "⋆", "ast": "∗", "dagger": "†", "ddagger": "‡", "oint": "∮", "iint": "∬", "iiint": "∭", "bigoplus": "⨁",
    "bigotimes": "⨂", "bigcup": "⋃", "bigcap": "⋂", "bigvee": "⋁", "bigwedge": "⋀", "coprod": "∐", "vdots": "⋮", "ddots": "⋱",
    "lfloor": "⌊", "rfloor": "⌋", "lceil": "⌈", "rceil": "⌉", "langle": "⟨", "rangle": "⟩", "lbrace": "{", "rbrace": "}",
    "lbrack": "[", "rbrack": "]", "vert": "|", "Vert": "‖", "hbar": "ℏ", "ell": "ℓ", "aleph": "ℵ", "Re": "ℜ", "Im": "ℑ", "wp": "℘",
    "nsubseteq": "⊈", "nsubset": "⊄", "nleq": "≰", "ngeq": "≱", "nequiv": "≢", "napprox": "≉", "ncong": "≇", "nsim": "≁", "triangle": "△",
    "square": "□", "blacksquare": "■", "Box": "□", "top": "⊤", "bot": "⊥", "models": "⊨", "vdash": "⊢", "dashv": "⊣", "asymp": "≍",
    "lesssim": "≲", "gtrsim": "≳", "varnothing": "∅", "complement": "∁", "surd": "√", "checkmark": "✓", "degree": "°", "deg": "°",
    "log": "log", "ln": "ln", "exp": "exp", "min": "min", "max": "max", "det": "det", "sin": "sin", "cos": "cos", "tan": "tan",
    "lim": "lim", "Pr": "P", "quad": " ", "qquad": " ", "left": "", "right": "", "hat": "", "tilde": "", "text": "",
    "mathrm": "", "mathbf": "",
}
GREEK = {"alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta", "lambda", "mu", "nu", "xi", "pi", "rho",
         "sigma", "tau", "phi", "varphi", "chi", "psi", "omega", "Gamma", "Delta", "Theta", "Lambda", "Pi", "Sigma", "Phi", "Psi", "Omega"}
BLACKBOARD = {"R": "ℝ", "N": "ℕ", "Z": "ℤ", "Q": "ℚ", "C": "ℂ"}      # \mathbb{R} 등: 글꼴에 없으면 그냥 문자로

_font_cache = {}
_glyph_cache = {}
_math_glyph_cache = {}
_theme = "typed"                         # 지금 그리는 스타일: typed(타이핑한 A4) / hand(요약 노트). notepage가 그리는 동안만 바꾼다


def seoyun_path():
    """이서윤체 파일 위치 (NOTE_FONT_PATH 설정). 파일이 없으면 None."""
    path = getattr(settings, "NOTE_FONT_PATH", "") or ""
    return path if path and os.path.isfile(path) else None


def hand_family():
    return "seoyun" if seoyun_path() else "serif"


def set_theme(name):
    global _theme
    _theme = name


def base_font(size, bold=False):
    """Pretendard (손글씨 글꼴에 없는 글자의 대신 글꼴이자 타이핑 스타일의 본 글꼴)."""
    key = (size, bold, "base")
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)
    return _font_cache[key]


def serif_font(size, bold=False):
    """나눔명조: 요약 노트 본문 글꼴에 없는 글자를 채우는 글꼴 (한글 전체 지원)."""
    key = (size, bold, "serif")
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_SERIF_BOLD if bold else FONT_SERIF, size)
    return _font_cache[key]


def font(size, bold=False):
    if _theme != "hand":
        return base_font(size, bold)
    family = hand_family()
    key = (size, bold, "hand", family)
    if key not in _font_cache:
        scale = HAND_SCALE[family][bold]
        if family == "seoyun":
            _font_cache[key] = ImageFont.truetype(seoyun_path(), max(int(size * scale), 8))
        else:
            _font_cache[key] = serif_font(max(int(size * scale), 8), bold)
    return _font_cache[key]


def stroke(size, bold):
    """굵은체가 없는 글꼴(이서윤체)로 굵게 쓸 때 글씨를 덧그리는 두께(px). 그 밖에는 0."""
    return max(1, size // 40) if (bold and _theme == "hand" and hand_family() == "seoyun") else 0


def math_font(size):
    key = (size, "math")
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_MATH, size)
    return _font_cache[key]


def _has(fnt, ch):
    """글꼴에 이 글자가 있는가. 없는 글자는 '없음 표시(notdef)'라는 네모로 그려지므로, 그 그림과 같으면 없는 것으로 본다."""
    return bytes(fnt.getmask(ch)) != bytes(fnt.getmask("\uFFFF"))


def has_glyph(ch, bold=False):
    """지금 스타일의 본 글꼴에 있는 글자인가."""
    key = (ch, _theme, bold, hand_family() if _theme == "hand" else "")
    if key not in _glyph_cache:
        _glyph_cache[key] = ch.isspace() or _has(font(29, bold), ch)
    return _glyph_cache[key]


def has_serif_glyph(ch):
    key = (ch, "serif")
    if key not in _glyph_cache:
        _glyph_cache[key] = ch.isspace() or _has(serif_font(29), ch)
    return _glyph_cache[key]


def has_base_glyph(ch):
    key = (ch, "base")
    if key not in _glyph_cache:
        _glyph_cache[key] = ch.isspace() or _has(base_font(29), ch)
    return _glyph_cache[key]


def has_math_glyph(ch):
    if ch not in _math_glyph_cache:
        _math_glyph_cache[ch] = _has(math_font(29), ch)
    return _math_glyph_cache[ch]


def can_draw(ch):
    """어느 글꼴로든 그릴 수 있는 글자인가 (본 글꼴 → Pretendard → 수학 글꼴 순)."""
    return has_glyph(ch) or has_serif_glyph(ch) or has_base_glyph(ch) or has_math_glyph(ch)


def italic_char(ch):
    """영문·그리스 소문자를 수학용 기울임꼴 글자(𝑥, 𝛼 …)로 바꾼다. 해당 없으면 그대로."""
    cp = ord(ch)
    if ch == "h":
        return "ℎ"                                   # 𝘩 자리는 플랑크 상수 기호 ℎ가 맡는다
    if "a" <= ch <= "z":
        return chr(0x1D44E + cp - 97)
    if "A" <= ch <= "Z":
        return chr(0x1D434 + cp - 65)
    if 0x3B1 <= cp <= 0x3C9:                         # α … ω (ς 포함)
        return chr(0x1D6FC + cp - 0x3B1)
    return ch


_BASE_ONLY = "·•…—–"                    # 손글씨 글꼴에서는 비어 있거나 거의 안 보이는 부호는 Pretendard로 쓴다


def _face(ch, force_math, bold):
    if force_math:
        return "math"
    if ch in _BASE_ONLY and _theme == "hand" and has_base_glyph(ch):
        return "base"
    if has_glyph(ch, bold):
        return "main"
    if _theme == "hand" and has_serif_glyph(ch):
        return "serif"
    if has_base_glyph(ch):
        return "base"
    return "math" if has_math_glyph(ch) else "main"


def runs(text, force_math=False, bold=False):
    """글자를 (조각, 글꼴 종류) 묶음으로 나눈다: 본 글꼴에 있으면 본 글꼴, 없으면 Pretendard, 그것도 없으면 수학 글꼴."""
    out = []
    for ch in text:
        face = _face(ch, force_math, bold)
        if out and out[-1][1] == face:
            out[-1] = (out[-1][0] + ch, face)
        else:
            out.append((ch, face))
    return out


def _face_font(face, size, bold):
    if face == "math":
        return math_font(size)
    if face == "base":
        return base_font(size, bold)
    if face == "serif":
        return serif_font(max(int(size * HAND_SCALE["serif"][bold]), 8), bold)
    return font(size, bold)


def text_length(text, size, bold=False, force_math=False):
    return sum(_face_font(face, size, bold).getlength(t) + (2 * stroke(size, bold) * len(t) if face == "main" else 0)
               for t, face in runs(text, force_math, bold))


def draw_text(d, x, base, text, size, fill, bold=False, force_math=False):
    """기준선(base)에 글을 그린다 (글자마다 알맞은 글꼴로). 그린 글의 너비를 돌려준다."""
    start = x
    for t, face in runs(text, force_math, bold):
        f = _face_font(face, size, bold)
        sw = stroke(size, bold) if face == "main" else 0
        d.text((x, base), t, font=f, fill=fill, anchor="ls", stroke_width=sw, stroke_fill=fill)
        x += f.getlength(t) + 2 * sw * len(t)
    return x - start
