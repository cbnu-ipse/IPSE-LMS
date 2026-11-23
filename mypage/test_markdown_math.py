import shutil
import subprocess
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase

from . import ai

NODE = shutil.which("node")
SCRIPT = r"""
global.window = {}; global.document = { currentScript: null, createElement: () => ({}), head: { appendChild() {} } };
global.setTimeout = () => 0;
require(process.argv[1]);
console.log(JSON.stringify(window.renderMarkdown(process.argv[2])));
"""


class BacktickedMathTests(SimpleTestCase):
    def render(self, text):
        import json

        js = Path(settings.BASE_DIR) / "static" / "js" / "markdown-lite.js"
        out = subprocess.run([NODE, "-e", SCRIPT, str(js), text], capture_output=True, text=True, check=True)
        return json.loads(out.stdout)

    def test_math_wrapped_in_backticks_is_still_math_but_real_code_is_not(self):
        if not NODE:
            self.skipTest("node가 없어 건너뜁니다")
        html = self.render("화살표(`$\\vec{v}$`), 행렬(`[a b c]`), `np.matmul()`, 코드 `a=$x$ 와 $y$` 그대로")
        self.assertIn('data-tex="\\vec{v}"', html)
        self.assertEqual(html.count("md-math"), 1)
        self.assertIn('<code class="md-code">[a b c]</code>', html)
        self.assertIn("np.matmul()", html)
        self.assertIn('<code class="md-code">a=$x$ 와 $y$</code>', html)      # 수식 밖의 글이 섞인 코드는 그대로

    def test_math_backticked_without_dollars_is_drawn_as_math(self):
        """요약에 `v = c_1v_1 + c_2v_2 + \\cdots + c_n v_n`처럼 $ 없이 백틱으로만 감싼 식이 빨간 코드 글씨로 보였다."""
        if not NODE:
            self.skipTest("node가 없어 건너뜁니다")
        html = self.render("벡터 $v_1$에 대해, `v = c_1v_1 + c_2v_2 + \\cdots + c_n v_n`과 같이 표현한다. 또 `x_1 + x_2`, `a^2 + b^2 = c^2`, `O(n^2)`, `\\frac{1}{2}`")
        for tex in ("v = c_1v_1 + c_2v_2 + \\cdots + c_n v_n", "x_1 + x_2", "a^2 + b^2 = c^2", "O(n^2)", "\\frac{1}{2}"):
            self.assertIn(f'data-tex="{tex}"', html)
        self.assertNotIn("md-code", html)

    def test_function_notation_numbers_and_half_dollar_formulas_are_math(self):
        """요약에 `dim(V)`, `3`, `dim($\\mathbb{R}^3$)=3`, `dim({0})=0`가 코드 글씨로 보였다."""
        if not NODE:
            self.skipTest("node가 없어 건너뜁니다")
        html = self.render("차원(`dimension`)이라 하고 `dim(V)`로 표기한다. 차원은 `3`(`dim($\\mathbb{R}^3$)=3`), 영벡터공간은 `0`(`dim({0})=0`), `rank(A) + nullity(A) = n`")
        for tex in ("\\dim(V)", "3", "\\dim(\\mathbb{R}^3)=3", "0", "\\dim(\\{0\\})=0",
                    "\\operatorname{rank}(A) + \\operatorname{nullity}(A) = n"):
            self.assertIn(f'data-tex="{tex}"', html)
        self.assertIn('<code class="md-code">dimension</code>', html)          # 영어 용어는 코드 이름과 구별할 수 없어 그대로 둔다

    def test_subscript_braces_stay_grouping_braces(self):
        if not NODE:
            self.skipTest("node가 없어 건너뜁니다")
        self.assertIn('data-tex="x_{ij} + y^{2}"', self.render("`x_{ij} + y^{2}`"))

    def test_real_code_in_backticks_stays_code(self):
        if not NODE:
            self.skipTest("node가 없어 건너뜁니다")
        samples = ["max_len", "arr[i]", "__init__", "print(x_1)", 'name = "a_b"', "std::vector", "x => x_1", "a_b_c",
                   "for i in range(n)", "self.max_value", "return x_1", "np.matmul()", "x_1; y_2", "변수 x_1",
                   "max(a, b)", "len(arr)", "str(x)", "a=$x$ 와", "cost $5"]
        html = self.render(" ".join(f"`{c}`" for c in samples))
        self.assertNotIn("md-math", html)
        self.assertEqual(html.count('<code class="md-code">'), len(samples))

    def test_summary_prompt_does_not_tell_the_model_to_backtick_math(self):
        self.assertIn("수식을 백틱(`)으로 한 번 더 감싸지 마세요", ai.SUMMARY_INSTRUCTIONS)
        self.assertNotIn("코드·수식·고유 표기는", ai.SUMMARY_INSTRUCTIONS)
        self.assertNotIn("고유 표기는 `인라인 코드`", ai.SUMMARY_INSTRUCTIONS)        # 식을 '고유 표기'로 보고 코드로 감싸던 원인
        self.assertIn("프로그래밍 코드·함수 이름만 `인라인 코드`", ai.SUMMARY_INSTRUCTIONS)


class SummaryColumnCenteringTests(SimpleTestCase):
    def test_centering_rule_outranks_markdown_lite_margins(self):
        """fab.html이 markdown-lite.css를 본문에서 한 번 더 불러 학습 화면의 <style>보다 뒤에 온다. 특이도가 같으면 .md-h 등의
        margin 단축 속성이 margin auto를 덮어 요약이 왼쪽으로 붙으므로, 가운데 정렬 규칙은 클래스 하나보다 특이도가 높아야 한다."""
        html = (Path(settings.BASE_DIR) / "templates" / "mypage" / "preview.html").read_text(encoding="utf-8")
        self.assertIn("div.ms-sum-center > * { max-width: 40rem; margin-left: auto; margin-right: auto; }", html)
        self.assertNotIn("\n    .ms-sum-center > * {", html)
        fab = (Path(settings.BASE_DIR) / "templates" / "assistant" / "fab.html").read_text(encoding="utf-8")
        self.assertIn("markdown-lite.css", fab)                      # 이 두 번째 로드가 문제의 원인이었다
