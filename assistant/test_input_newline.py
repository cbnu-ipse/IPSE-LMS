from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()


class ChatInputTests(TestCase):
    """어시스턴트 입력칸: 여러 줄(textarea)이고 Enter는 보내기, Shift+Enter는 줄바꿈이다."""

    def test_the_input_is_a_textarea(self):
        user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(user)
        html = self.client.get("/mypage/").content.decode()
        self.assertIn('<textarea id="assistant-chat-input"', html)
        self.assertNotIn('<input id="assistant-chat-input"', html)
        self.assertIn("Shift+Enter 줄바꿈", html)

    def test_enter_sends_but_shift_enter_and_ime_composition_do_not(self):
        js = (Path(settings.BASE_DIR) / "static" / "js" / "assistant-chat.js").read_text(encoding="utf-8")
        self.assertIn("e.shiftKey", js)
        self.assertIn("e.isComposing", js)          # 한글 조합 중 Enter는 글자 확정이지 보내기가 아니다
        self.assertIn("form.requestSubmit()", js)
        self.assertIn("bubble.style.whiteSpace = 'pre-wrap'", js)   # 보낸 줄바꿈이 내 말풍선에도 보인다

    def test_touch_devices_use_enter_for_a_new_line_and_send_with_the_button(self):
        js = (Path(settings.BASE_DIR) / "static" / "js" / "assistant-chat.js").read_text(encoding="utf-8")
        self.assertIn("(hover: none) and (pointer: coarse)", js)
        self.assertIn("if (touchKeyboard || e.key !== 'Enter'", js)
