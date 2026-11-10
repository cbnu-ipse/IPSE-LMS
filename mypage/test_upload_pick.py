import re

from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()


class UploadPickWindowTests(TestCase):
    """자료 올리기: 카드에는 파일 선택만 있고, 구분·과목·교수 입력은 파일을 고르면 뜨는 창에 있다."""

    def setUp(self):
        self.user = User.objects.create_user("picker", password="pw")
        self.client.force_login(self.user)
        self.html = self.client.get("/mypage/").content.decode()

    def test_the_card_has_only_the_file_picker_and_the_window_holds_the_rest(self):
        card = self.html[self.html.index('data-ml="upload"'):self.html.index('id="upload-pick"')]
        self.assertIn('name="file"', card)
        for name in ("title", "document_type", "course_name", "professor"):
            self.assertNotIn(f'name="{name}"', card)
        window = self.html[self.html.index('id="upload-pick"'):self.html.index('id="upload-confirm"')]
        for name in ("title", "document_type", "course_name", "professor"):
            self.assertIn(f'name="{name}"', window)
            tag = re.search(rf'<[^>]*name="{name}"[^>]*>', window).group(0)
            self.assertIn('form="upload-form"', tag)                       # 창은 폼 밖에 있지만 같은 폼으로 올라간다
        self.assertIn('id="upload-submit"', window)

    def test_the_phone_button_opens_the_file_picker_directly(self):
        self.assertRegex(self.html, r'<label for="id_file" id="ml-upload-open"')

    def test_the_window_sits_above_the_assistant_button_and_below_the_confirm_dialog(self):
        self.assertIn(".up-overlay { position: fixed; inset: 0; z-index: 55;", self.html)
        self.assertIn('id="upload-confirm" style="z-index: 56"', self.html)

    def test_nothing_in_the_window_advertises_style_learning(self):
        self.assertNotIn("출제 스타일", self.html)
