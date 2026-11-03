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
