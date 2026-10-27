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
require(process.argv[2]);
console.log(JSON.stringify(window.renderMarkdown(process.argv[3])));
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
