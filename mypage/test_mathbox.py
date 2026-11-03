import random

from django.test import TestCase
from PIL import Image, ImageDraw

from . import cram, mathbox, notepage


def atoms(tex):
    return mathbox.parse_chunks(tex)


def kinds(tex):
    """수식 덩어리 안 상자들의 종류 이름 (구조 확인용)."""
    names = []

    def walk(box):
        names.append(type(box).__name__)
        for attr in ("items", "base", "sup", "sub", "num", "den", "body", "inner", "over", "under", "index"):
            child = getattr(box, attr, None)
            for c in (child if isinstance(child, list) else [child]):
                if isinstance(c, mathbox.Box):
                    walk(c)
        for row in getattr(box, "rows", []):
            for cell in row:
                walk(cell)

    for atom in atoms(tex):
        walk(atom.box)
    return names


class StructureTests(TestCase):
    def test_fraction_matrix_root_scripts_and_limits_are_recognised(self):
        self.assertIn("Frac", kinds(r"\frac{1}{2}"))
        self.assertIn("Matrix", kinds(r"\begin{bmatrix} a & b \\ c & d \end{bmatrix}"))
        self.assertIn("Radical", kinds(r"\sqrt{x}"))
        self.assertIn("Script", kinds(r"x^2"))
        self.assertIn("Limits", kinds(r"\sum_{i=1}^{n} x_i"))
        self.assertIn("Delimited", kinds(r"\left( \frac{a}{b} \right)"))
        self.assertIn("Over", kinds(r"\bar{x}"))

    def test_matrix_shape_comes_from_rows_and_columns(self):
        box = atoms(r"\begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix}")[0].box
        matrix = next(i for i in box.items if isinstance(i, mathbox.Matrix))
        self.assertEqual([len(r) for r in matrix.rows], [3, 3])
        self.assertEqual((matrix.left, matrix.right), ("(", ")"))

    def test_environments_pick_their_own_brackets(self):
        for env, delims in (("bmatrix", ("[", "]")), ("vmatrix", ("|", "|")), ("Vmatrix", ("‖", "‖")), ("Bmatrix", ("{", "}")), ("matrix", ("", "")), ("cases", ("{", ""))):
            box = atoms(rf"\begin{{{env}}} a & b \\ c & d \end{{{env}}}")[0].box
            matrix = next(i for i in box.items if isinstance(i, mathbox.Matrix))
            self.assertEqual((matrix.left, matrix.right), delims, env)

    def test_binary_operators_get_space_but_a_leading_minus_is_a_sign(self):
        def width(tex):
            return sum(atom.metrics(30)[0] for atom in atoms(tex))          # 덩어리는 연산자 뒤에서 나뉘므로 모두 합친다

        binary = width("a-b") - width("ab")                                  # 빼기 기호 + 양옆 여백
        sign = width("-ab") - width("ab")                                    # 부호: 여백 없이 기호만
        self.assertGreater(binary, sign + 8)

    def test_long_formula_is_split_after_relations_and_operators(self):
        self.assertGreater(len(atoms(r"a=b+c+d=e")), 2)
        self.assertEqual(len(atoms(r"\frac{a+b+c}{d}")), 1)               # 분수 안은 나누지 않는다


class MetricsTests(TestCase):
    def test_fraction_is_taller_than_a_line_of_text_and_matrix_grows_with_rows(self):
        text_h = sum(atoms("x")[0].metrics(30)[1:])
        frac_h = sum(atoms(r"\frac{1}{2}")[0].metrics(30)[1:])
        two = sum(atoms(r"\begin{bmatrix} a \\ b \end{bmatrix}")[0].metrics(30)[1:])
        three = sum(atoms(r"\begin{bmatrix} a \\ b \\ c \end{bmatrix}")[0].metrics(30)[1:])
        self.assertGreater(frac_h, text_h * 1.5)
        self.assertGreater(three, two + 20)

    def test_nested_fractions_are_taller_than_a_single_one(self):
        one = sum(atoms(r"\frac{1}{2}")[0].metrics(30)[1:])
        nested = sum(atoms(r"\frac{\frac{1}{2}}{\frac{3}{4}}")[0].metrics(30)[1:])
        self.assertGreater(nested, one * 1.4)

    def test_wide_formula_is_shrunk_to_fit_but_not_below_a_floor(self):
        atom = atoms(r"\begin{bmatrix} " + " & ".join("a_{%d}" % i for i in range(12)) + r" \end{bmatrix}")[0]
        fitted = atom.fit(30, 400)
        self.assertLess(fitted, 30)
        self.assertGreaterEqual(fitted, 30 * 0.55 - 1)
        self.assertEqual(atoms("x")[0].fit(30, 400), 30)                   # 넉넉하면 그대로

    def test_scripts_and_limits_stay_around_the_base(self):
        base = atoms("x")[0].metrics(30)
        sup = atoms("x^2")[0].metrics(30)
        self.assertGreater(sup[0], base[0])
        self.assertGreater(sup[1], base[1])
        sub = atoms("x_i")[0].metrics(30)
        self.assertGreater(sub[2], base[2])


class RobustnessTests(TestCase):
    def draw_all(self, tex):
        found = atoms(tex)
        image = Image.new("RGB", (900, 300), "white")
        d = ImageDraw.Draw(image)
        x = 10
        for atom in found:
            w, a, dsc = atom.metrics(30)
            atom.draw(d, x, 150, 30, (0, 0, 0))
            x += w
        return found

    def test_malformed_input_never_raises(self):
        for tex in (r"\frac{1}{", r"\frac", r"\begin{bmatrix} 1 & 2", r"}{", r"\left( x", r"\right)", r"\end{pmatrix}", r"^", r"_2", r"x^",
                    r"\sqrt[", r"\begin{unknown} a \end{unknown}", r"\\ & \\", "", "   ", r"\undefined{x}", r"{{{{{{", r"x^{y^{z^{w}}}}", r"\text{",
                    r"\begin{array}{cc} 1 & 2 \\ 3 & 4 \end{array}", "한글 수식 $", "😀 \\frac{😀}{😀}"):
            self.draw_all(tex)

    def test_random_token_soup_terminates_and_draws(self):
        tokens = [r"\frac", "{", "}", "^", "_", r"\begin{bmatrix}", r"\end{bmatrix}", "&", r"\\", "x", "1", "+", "=", r"\left(", r"\right)",
                  r"\sqrt", r"\sum", r"\text{a}", " ", r"\alpha", r"\bar", r"\mathbb{R}", ",", r"\{", r"\,"]
        rng = random.Random(7)
        for _ in range(250):
            self.draw_all("".join(rng.choice(tokens) for _ in range(rng.randint(1, 30))))

    def test_deep_nesting_is_cut_off_instead_of_hanging(self):
        deep = r"\frac{1}{" * 40 + "x" + "}" * 40
        self.draw_all(deep)                                               # 예외 없이 끝나면 된다 (글자로 대신 쓰는 것도 허용)

    def test_empty_delimiter_draws_nothing(self):
        image = Image.new("RGB", (100, 100), "white")
        before = image.tobytes()
        d = ImageDraw.Draw(image)
        mathbox._draw_delim(d, "", 10, 10, 90, 20, (0, 0, 0), 2)
        self.assertEqual(image.tobytes(), before)                         # 빈 문자열이 "[" 안에 들어 있다고 판정돼 괄호가 그려지던 문제

    def test_cases_has_a_left_brace_only(self):
        image = Image.new("RGB", (500, 200), "white")
        d = ImageDraw.Draw(image)
        atom = atoms(r"\begin{cases} x & 1 \\ y & 2 \end{cases}")[0]
        w = atom.metrics(30)[0]
        atom.draw(d, 20, 100, 30, (0, 0, 0))
        right_edge = image.crop((int(20 + w) - 6, 0, int(20 + w) + 6, 200)).convert("L").getextrema()
        self.assertEqual(right_edge[0], 255)                              # 오른쪽 끝에는 아무것도 그려지지 않는다


class NoteIntegrationTests(TestCase):
    def test_rich_markup_keeps_math_as_atoms_not_text(self):
        markup = notepage.to_rich(r"평균은 $\bar{x}=\frac{1}{n}\sum_{i=1}^{n} x_i$ 이다")
        segs = notepage.parse_segments(markup)
        math = [t for t, _ in segs if isinstance(t, mathbox.MathAtom)]
        self.assertGreaterEqual(len(math), 1)
        self.assertNotIn("frac", "".join(t for t, _ in segs if isinstance(t, str)))
        self.assertEqual("".join(t for t, _ in segs if isinstance(t, str)).split(), ["평균은", "이다"])

    def test_unparseable_math_falls_back_to_text_and_text_path_is_unchanged(self):
        from unittest.mock import patch

        with patch("mypage.mathbox.parse_chunks", return_value=[]):
            segs = notepage.parse_segments(notepage.to_rich(r"$\frac{1}{2}$"))
        self.assertTrue(all(isinstance(t, str) for t, _ in segs))
        self.assertIn("(1)/(2)", "".join(t for t, _ in segs))
        self.assertIn("(1)/(2)", notepage.to_markup(r"$\frac{1}{2}$"))        # 제목 등 글자 경로는 그대로

    def test_styles_wrap_math_atoms(self):
        segs = notepage.parse_segments(notepage.to_rich(r"**$x^2$** ==$\frac{a}{b}$=="))
        styled = {(type(t).__name__, tuple(sorted(s))) for t, s in segs}
        self.assertIn(("MathAtom", ("b",)), styled)
        self.assertIn(("MathAtom", ("m",)), styled)

    def test_tall_formulas_make_their_line_taller_than_plain_lines(self):
        def height(point):
            lay = notepage._Layout(1.0)
            before = lay.y
            lay.text_block(notepage.to_rich(point), notepage.BODY_SIZE, notepage.MARGIN_X)
            return lay.y - before

        plain = height("평균은 n으로 나눈다")
        fraction = height(r"평균은 $\frac{1}{n}\sum_{i=1}^{n} x_i$ 이다")
        matrix = height(r"행렬 $\begin{bmatrix} 1 & 2 \\ 3 & 4 \\ 5 & 6 \end{bmatrix}$ 이다")
        self.assertGreater(fraction, plain)
        self.assertGreater(matrix, fraction)

    def test_math_ops_stay_inside_the_page_and_margins(self):
        note = cram.normalize_note({"title": "수식 노트", "memo": [r"기억: $\frac{a}{b}=\frac{c}{d}$"] * 3, "sections": [
            {"heading": f"수식{i}", "points": [r"$\begin{bmatrix} a & b & c \\ d & e & f \end{bmatrix}\begin{pmatrix} x \\ y \\ z \end{pmatrix}=\frac{\sum_{i=1}^{n}(x_i-\bar{x})^2}{n-1}$" + " 설명" * 8] * 4}
            for i in range(6)]})
        for k in (notepage.MIN_SCALE, 1.0, notepage.MAX_SCALE):
            lay = notepage._layout(note, k, None)
            self.assertTrue(any(op[0] == "math" for page in lay.pages for op in page))
            for page in lay.pages:
                for op in page:
                    if op[0] == "math":
                        _, x, base, size, atom, _style, _color, _gap = op
                        width, asc, dsc = atom.metrics(size)
                        self.assertLessEqual(x + width, notepage.WIDTH - notepage.MARGIN_X + 1)
                        self.assertLess(base + dsc, notepage.HEIGHT)
                        self.assertGreater(base - asc, 0)

    def test_long_formula_wraps_across_lines_without_overflowing(self):
        # 노트 항목의 글자 제한(140자)과 상관없이 배치 엔진에 직접 긴 식을 넣어 본다
        terms = "+".join(rf"\frac{{a_{{{i}}}+b_{{{i}}}}}{{c_{{{i}}}}}" for i in range(1, 15))
        lay = notepage._Layout(1.0)
        lay.text_block(notepage.to_rich(f"긴 식: ${terms}$ 이다"), notepage.BODY_SIZE, notepage.MARGIN_X)
        maths = [op for op in lay.ops if op[0] == "math"]
        self.assertGreater(len({round(op[2]) for op in maths}), 1)         # 여러 줄로 나뉘었다
        for _, x, _base, size, atom, *_ in maths:
            self.assertLessEqual(x + atom.metrics(size)[0], notepage.WIDTH - notepage.MARGIN_X + 1)

    def test_one_unbreakable_wide_formula_is_shrunk_to_the_line(self):
        wide = r"\begin{bmatrix} " + " & ".join(f"a_{{{i}}}" for i in range(24)) + r" \end{bmatrix}"
        lay = notepage._Layout(1.0)
        lay.text_block(notepage.to_rich(f"행렬 ${wide}$"), notepage.BODY_SIZE, notepage.MARGIN_X)
        (_, x, _base, size, atom, *_), = [op for op in lay.ops if op[0] == "math"]
        self.assertLess(size, notepage.BODY_SIZE)                            # 글씨를 줄여서 맞췄다
        self.assertLessEqual(x + atom.metrics(size)[0], notepage.WIDTH - notepage.MARGIN_X + 1)

    def test_a_note_with_fractions_and_matrices_renders_to_a_png_page(self):
        note = cram.normalize_note({"title": "행렬", "sections": [{"heading": "역행렬", "points": [
            r"$A^{-1}=\frac{1}{ad-bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}$", r"$s^2=\frac{1}{n-1}\sum_{i=1}^{n}(x_i-\bar{x})^2$"]}], "memo": [r"$\frac{a}{b}$"]})
        pages = notepage.render_notes(note)
        self.assertTrue(pages[0].startswith(b"\x89PNG"))
        image = Image.open(__import__("io").BytesIO(pages[0])).convert("RGB")
        dark = sum(1 for px in image.getdata() if px[0] < 80 and px[1] < 80 and px[2] < 80)
        self.assertGreater(dark, 2000)                                    # 글자·수식이 실제로 그려졌다


class ItalicAndSymbolTests(TestCase):
    def draw_pixels(self, tex):
        atom = atoms(tex)[0]
        image = Image.new("RGB", (400, 120), "white")
        atom.draw(ImageDraw.Draw(image), 10, 80, 40, (0, 0, 0))
        return sum(1 for px in image.getdata() if px[0] < 128)

    def test_variables_are_italic_but_digits_function_names_and_text_are_upright(self):
        from .notefont import italic_char

        def boxes(tex):
            return [b for b in atoms(tex)[0].box.items if isinstance(b, mathbox.Text)]

        (xy,) = boxes("xy")
        self.assertTrue(xy.italic)
        self.assertEqual(xy._shown(), italic_char("x") + italic_char("y"))
        self.assertFalse(boxes("12")[0].italic)
        self.assertFalse(boxes(r"\det")[0].italic)
        self.assertFalse(boxes(r"\text{rank}")[0].italic)
        self.assertTrue(boxes(r"\lambda")[0].italic)                       # 소문자 그리스 문자는 기울임
        self.assertFalse(boxes(r"\Delta")[0].italic)                       # 대문자는 세움
        self.assertFalse(boxes("가나")[0].italic)                           # 한글은 세움

    def test_italic_letters_use_real_math_italic_glyphs(self):
        from .notefont import can_draw, italic_char

        self.assertEqual(italic_char("x"), "𝑥")
        self.assertEqual(italic_char("h"), "ℎ")
        self.assertEqual(italic_char("μ"), "𝜇")
        for ch in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZαβγδεζηθικλμνξοπρςστυφχψω":
            self.assertTrue(can_draw(italic_char(ch)), ch)

    def test_symbols_missing_from_the_text_font_still_draw_via_the_math_font(self):
        from .notefont import has_glyph, can_draw

        for ch in "∇⊕⊗∧∨≅⌊⌋⟨⟩⋮⋱∥ℝℕ∮∝⊥":
            self.assertFalse(has_glyph(ch), ch)                           # 본 글꼴에는 없고
            self.assertTrue(can_draw(ch), ch)                             # 수학 글꼴로 그릴 수 있다
            self.assertGreater(self.draw_pixels(ch), 20, ch)

    def test_latex_symbol_names_are_not_leaked_as_words(self):
        for name in ("oplus", "otimes", "wedge", "vee", "cong", "parallel", "mapsto", "implies", "iff", "oint", "iint", "lfloor", "rceil", "langle",
                     "vdots", "ddots", "hbar", "ell", "aleph", "propto", "perp", "bigoplus"):
            self.assertGreater(self.draw_pixels("\\" + name), 10, name)
            text = "".join(b.text for b in atoms("\\" + name)[0].box.items if isinstance(b, mathbox.Text))     # Op도 Text의 한 종류
            self.assertTrue(text, name)
            self.assertNotEqual(text, name, f"\\{name}이 이름 그대로 글자로 나왔다")


class MoreLatexTests(TestCase):
    def test_new_constructs_are_recognised(self):
        self.assertIn("Under", kinds(r"\underline{abc}"))
        self.assertIn("Brace", kinds(r"\overbrace{a+b}^{2}"))
        self.assertIn("Brace", kinds(r"\underbrace{a+b}_{2}"))
        self.assertIn("Arrow", kinds(r"A\xrightarrow[b]{a}B"))
        self.assertIn("Slashed", kinds(r"x\not\in S"))
        self.assertIn("Strike", kinds(r"\cancel{x}"))
        self.assertIn("Boxed", kinds(r"\boxed{x}"))
        self.assertIn("Fence", kinds(r"\bigl( x \bigr)"))
        self.assertIn("Over", kinds(r"\dot{x}"))
        self.assertIn("Over", kinds(r"\overrightarrow{AB}"))
        self.assertIn("Limits", kinds(r"\overset{a}{=}"))
        self.assertIn("Matrix", kinds(r"\sum_{\substack{i<n \\ i\ne j}} a"))

    def test_brace_label_attaches_from_scripts(self):
        brace = next(b for b in atoms(r"\overbrace{a+b+c}^{3}")[0].box.items if isinstance(b, mathbox.Brace))
        self.assertIsNotNone(brace.label)
        self.assertTrue(brace.over)

    def test_infix_choose_over_and_binom_make_fractions(self):
        self.assertIn("Frac", kinds(r"{n \choose k}"))
        self.assertIn("Frac", kinds(r"a \over b"))
        self.assertIn("Frac", kinds(r"\binom{n}{k}"))

    def test_not_equal_is_a_single_relation_symbol(self):
        text = "".join(b.text for atom in atoms(r"a\not=b") for b in atom.box.items if isinstance(b, mathbox.Text))
        self.assertIn("≠", text)

    def test_array_columns_alignment_and_rules(self):
        box = atoms(r"\begin{array}{c|rl} 1 & 22 & 3 \\ \hline 4 & 5 & 666 \end{array}")[0].box
        matrix = next(i for i in box.items if isinstance(i, mathbox.Matrix))
        self.assertEqual(matrix.col_aligns, ["c", "r", "l"])
        self.assertEqual(matrix.vlines, {1})
        self.assertEqual(matrix.hlines, {1})
        self.assertEqual([len(r) for r in matrix.rows], [3, 3])

    def test_aligned_environment_pairs_right_and_left_columns(self):
        box = atoms(r"\begin{aligned} a&=b \\ c&=d \end{aligned}")[0].box
        matrix = next(i for i in box.items if isinstance(i, mathbox.Matrix))
        self.assertTrue(matrix.pairs)
        self.assertEqual((matrix._align(0), matrix._align(1)), ("r", "l"))

    def test_spaces_and_ignored_commands_do_not_leak(self):
        for tex in (r"a\hspace{1em}b", r"x\tag{1}", r"\displaystyle x", r"\phantom{abc}x", r"a\,b\;c\quad d", r"\mathop{lim}"):
            self.assertTrue(atoms(tex), tex)
            leaked = "".join(b.text for a in atoms(tex) for b in a.box.items if isinstance(b, mathbox.Text))
            for word in ("hspace", "tag", "displaystyle", "phantom", "mathop"):
                self.assertNotIn(word, leaked)

    def test_every_new_box_draws_without_error(self):
        image = Image.new("RGB", (900, 200), "white")
        d = ImageDraw.Draw(image)
        for tex in (r"\underbrace{a+b}_{n}", r"\overbrace{a}^{m}", r"\xrightarrow[x]{y}", r"\xleftarrow{f}", r"x\not\in S", r"\cancel{x}\bcancel{y}\xcancel{z}",
                    r"\boxed{x^2}", r"\Bigl[\frac{a}{b}\Bigr]", r"\check{a}\breve{a}\acute{a}\grave{a}\ddot{a}", r"\overleftarrow{AB}",
                    r"\begin{array}{c|c} a & b \\ \hline c & d \end{array}"):
            for atom in atoms(tex):
                atom.draw(d, 10, 100, 30, (0, 0, 0))


class PlainNotationTests(TestCase):
    def test_plain_notation_becomes_latex(self):
        cases = {
            "a/b": r"\frac{a}{b}",
            "1/2 + x/(n-1)": r"\frac{1}{2} + \frac{x}{n-1}",
            "sqrt(b^2-4ac)/(2a)": r"\frac{\sqrt{b^2-4ac}}{2a}",
            "x_bar = (x_1+x_2)/n": r"\bar{x} = \frac{x_1+x_2}{n}",
            "[[a, b], [c, d]]": r"\begin{bmatrix} a & b \\ c & d \end{bmatrix}",
            "P(A|B) = P(B|A)P(A)/P(B)": r"P(A|B) = \frac{P(B|A)P(A)}{P(B)}",
        }
        for plain, latex in cases.items():
            self.assertEqual(mathbox.to_latex(plain), latex, plain)

    def test_plain_words_become_symbols_and_existing_latex_is_left_alone(self):
        self.assertIn(r"\mu", mathbox.to_latex("mu +- 2 sigma"))
        self.assertIn(r"\pm", mathbox.to_latex("mu +- 2 sigma"))
        self.assertIn(r"\sum", mathbox.to_latex("sum_{i=1}^n x_i"))
        self.assertIn(r"\to", mathbox.to_latex("n->inf"))
        self.assertIn(r"\infty", mathbox.to_latex("n->inf"))
        self.assertEqual(mathbox.to_latex(r"\frac{1}{2}x/y"), r"\frac{1}{2}x/y")        # 백슬래시가 있으면 LaTeX로 쓴 것
        self.assertEqual(mathbox.to_latex("summary of x"), "summary of x")             # 단어의 일부는 바꾸지 않는다

    def test_plain_forms_render_as_real_fractions_and_matrices(self):
        self.assertIn("Frac", kinds("a/b"))
        self.assertIn("Matrix", kinds("[[1, 2], [3, 4]]"))
        self.assertIn("Limits", kinds("sum_{i=1}^n x_i"))
        self.assertIn("Radical", kinds("sqrt(x)"))

    def test_bare_greek_names_and_matrices_outside_dollar_signs_are_wrapped(self):
        wrapped = mathbox.wrap_bare_math("구간은 mu ± 2 sigma 이고 $\\mu$ 와 $x_{mu}$ 그리고 [[1,2],[3,4]]")
        self.assertIn("$\\mu$ ± 2 $\\sigma$", wrapped)
        self.assertIn("$x_{mu}$", wrapped)                                 # 이미 수식 안에 있는 것은 건드리지 않는다
        self.assertIn(r"$\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}$", wrapped)
        self.assertEqual(mathbox.wrap_bare_math("sigma가 아닌 summary와 musical"), "$\\sigma$가 아닌 summary와 musical")

    def test_note_text_view_gets_latex_for_old_plain_notes(self):
        md = "- 분산 $s^2=1/(n-1)$\n- 행렬 [[1,2],[3,4]]"
        out = mathbox.latexify_markdown(md)
        self.assertIn(r"\frac{1}{n-1}", out)
        self.assertIn(r"\begin{bmatrix}", out)
        self.assertNotIn("[[", out)

    def test_fraction_operand_scan_keeps_backslash_commands_together(self):
        self.assertEqual(mathbox.to_latex("sqrt(x)/y"), r"\frac{\sqrt{x}}{y}")
        self.assertEqual(mathbox.to_latex("mu/sigma"), r"\frac{\mu }{\sigma }")


class BrokenEscapeRepairTests(TestCase):
    """AI가 JSON 이스케이프를 어긋나게 쓴 LaTeX(행 구분 \\\\가 \\ 하나로 줄거나 \\end가 깨진 것)도 행렬로 읽는다. 실제 Gemini 응답에서 나온 형태."""

    CASES = {
        "정상": (r"\begin{bmatrix} a & b \\ c & d \end{bmatrix}", 2),
        "행 구분이 하나로 줄어듦": (r"\begin{bmatrix} a & b \ c & d \end{bmatrix}", 2),
        "end의 백슬래시가 빠짐": (r"\begin{bmatrix} a & b \\ c & d end{bmatrix}", 2),
        "행 구분 뒤 end가 깨짐": (r"\begin{bmatrix} a & b \\ c & d \\ end{bmatrix}", 2),
        "begin·end 모두 빠짐": (r"begin{pmatrix} 1 & 2 \ 3 & 4 end{pmatrix}", 2),
        "명령이 든 칸": (r"\begin{bmatrix} \alpha & \beta \ \gamma & \delta \end{bmatrix}", 2),
        "cases": (r"\begin{cases} x & x>0 \ -x & x<0 \end{cases}", 2),
        "세 행": (r"\begin{bmatrix} a & b \ c & d \ e & f \end{bmatrix}", 3),
    }

    def rows(self, tex):
        return [len(m.rows) for a in atoms(tex) for m in a.box.items if isinstance(m, mathbox.Matrix)]

    def test_every_broken_form_still_becomes_a_matrix_with_the_right_rows(self):
        for label, (tex, want) in self.CASES.items():
            self.assertEqual(self.rows(tex), [want], label)

    def test_repair_leaves_correct_latex_and_non_matrix_text_alone(self):
        for tex in (r"\begin{bmatrix} a & b \\ c & d \end{bmatrix}", r"x \cdot y \frac{1}{2}", r"a \ b", r"\alpha \beta", "plain text"):
            self.assertEqual(mathbox.repair_latex(tex), tex, tex)

    def test_the_text_view_gets_the_repaired_latex_too(self):
        out = mathbox.latexify_markdown(r"- 행렬 $A = \begin{bmatrix} a & b \ c & d \end{bmatrix}$")
        self.assertIn(r"a & b \\ c & d", out)

    def test_a_real_gemini_style_note_round_trips_through_storage(self):
        # 모델이 행 구분을 \로 줄여 쓴 응답 → 저장된 글 → 다시 읽어 그리기까지 행렬이 유지된다
        note = cram.normalize_note({"title": "t", "sections": [{"heading": "h", "points": [r"행렬 $A=\begin{bmatrix} a & b \ c & d \end{bmatrix}$", "점 둘"]}], "memo": []})
        again = cram.parse_note_markdown(cram.note_markdown(note))
        segs = [s for p in again["sections"][0]["points"] for s, _ in notepage.parse_segments(notepage.to_rich(p)) if isinstance(s, mathbox.MathAtom)]
        self.assertEqual([len(m.rows) for a in segs for m in a.box.items if isinstance(m, mathbox.Matrix)], [2])


class DoubledBackslashTests(TestCase):
    def test_commands_with_a_doubled_backslash_are_read_as_commands(self):
        self.assertEqual(mathbox.repair_latex(r"a \\rightarrow b \\frac{1}{2}"), r"a \rightarrow b \frac{1}{2}")
        self.assertEqual(notepage.latex_to_markup(mathbox.repair_latex(r"a \\rightarrow b")), "a → b")
        self.assertEqual(mathbox.latexify_markdown(r"- 상하이 $\\rightarrow$ 연통제"), r"- 상하이 $\rightarrow$ 연통제")

    def test_matrix_row_separators_and_plain_double_backslashes_are_left_alone(self):
        matrix = r"\begin{bmatrix}a&b\\c&d\end{bmatrix}"
        self.assertEqual(mathbox.repair_latex(matrix), matrix)
        self.assertEqual(mathbox.repair_latex(r"x \\ y"), r"x \\ y")


class CommandPrefixTests(TestCase):
    def test_rightarrow_is_an_arrow_not_a_closing_delimiter_plus_letters(self):
        for tex in (r"\rightarrow", r"a \rightarrow b", r"x \Rightarrow y \rightarrow z"):
            text = "".join(getattr(i, "text", "") for a in mathbox.parse_chunks(tex) for i in a.box.items)
            self.assertIn("→", text)
            self.assertNotIn("rightarrow", text)

    def test_left_right_pairs_still_close(self):
        atoms = mathbox.parse_chunks(r"\left( \frac{a}{b} \right) \rightarrow x")
        self.assertTrue(any(isinstance(i, mathbox.Delimited) for a in atoms for i in a.box.items))
