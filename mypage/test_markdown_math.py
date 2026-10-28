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

    def test_summary_prompt_does_not_tell_the_model_to_backtick_math(self):
        self.assertIn("수식을 백틱(`)으로 한 번 더 감싸지 마세요", ai.SUMMARY_INSTRUCTIONS)
        self.assertNotIn("코드·수식·고유 표기는", ai.SUMMARY_INSTRUCTIONS)


class SummaryColumnCenteringTests(SimpleTestCase):
    def test_centering_rule_outranks_markdown_lite_margins(self):
        """fab.html이 markdown-lite.css를 본문에서 한 번 더 불러 학습 화면의 <style>보다 뒤에 온다. 특이도가 같으면 .md-h 등의
        margin 단축 속성이 margin auto를 덮어 요약이 왼쪽으로 붙으므로, 가운데 정렬 규칙은 클래스 하나보다 특이도가 높아야 한다."""
        html = (Path(settings.BASE_DIR) / "templates" / "mypage" / "preview.html").read_text(encoding="utf-8")
        self.assertIn("div.ms-sum-center > * { max-width: 40rem; margin-left: auto; margin-right: auto; }", html)
        self.assertNotIn("\n    .ms-sum-center > * {", html)
        fab = (Path(settings.BASE_DIR) / "templates" / "assistant" / "fab.html").read_text(encoding="utf-8")
        self.assertIn("markdown-lite.css", fab)                      # 이 두 번째 로드가 문제의 원인이었다
