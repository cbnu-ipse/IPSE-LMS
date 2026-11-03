"""노트 그림에서 함께 쓰는 글꼴과 기호 표 (notepage: 문서 배치, mathbox: 수식 조판)."""
import os

from django.conf import settings
from PIL import ImageFont

FONT_DIR = os.path.join(str(settings.BASE_DIR), "static", "fonts")
FONT_REGULAR = os.path.join(FONT_DIR, "Pretendard-Regular.otf")
FONT_BOLD = os.path.join(FONT_DIR, "Pretendard-Bold.otf")

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
    "log": "log", "ln": "ln", "exp": "exp", "min": "min", "max": "max", "det": "det", "sin": "sin", "cos": "cos", "tan": "tan",
    "lim": "lim", "Pr": "P", "quad": " ", "qquad": " ", "left": "", "right": "", "hat": "", "tilde": "", "text": "",
    "mathrm": "", "mathbf": "",
}
GREEK = {"alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta", "lambda", "mu", "nu", "xi", "pi", "rho",
         "sigma", "tau", "phi", "varphi", "chi", "psi", "omega", "Gamma", "Delta", "Theta", "Lambda", "Pi", "Sigma", "Phi", "Psi", "Omega"}
BLACKBOARD = {"R": "ℝ", "N": "ℕ", "Z": "ℤ", "Q": "ℚ", "C": "ℂ"}      # \mathbb{R} 등: 글꼴에 없으면 그냥 문자로

_font_cache = {}
_glyph_cache = {}


def font(size, bold=False):
    key = (size, bold)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)
    return _font_cache[key]


def has_glyph(ch):
    """글꼴에 이 글자가 있는가. 없는 글자는 '없음 표시(notdef)'라는 네모로 그려지므로, 그 그림과 같으면 없는 것으로 본다."""
    if ch not in _glyph_cache:
        f = font(29)
        _glyph_cache[ch] = ch.isspace() or bytes(f.getmask(ch)) != bytes(f.getmask("￿"))
    return _glyph_cache[ch]
