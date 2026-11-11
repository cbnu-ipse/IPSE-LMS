from pathlib import Path
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase

from mypage import cram
from mypage.folders import MAX_FOLDER_DEPTH
from mypage.forms import MAX_UPLOAD_SIZE
from mypage.views import MAX_QUESTIONS

from . import ai
from .guide import GUIDE_PATH, guide_prompt, site_guide

User = get_user_model()
BASE = Path(settings.BASE_DIR)


def source(path):
    return (BASE / path).read_text(encoding="utf-8")


class GuidePromptTests(TestCase):
    def test_the_guide_is_in_every_system_prompt(self):
        prompt = ai._build_system_prompt("", "/mypage/")
        self.assertIn("[IPSE LMS 사용 안내]", prompt)
        self.assertIn("원문 닫기", prompt)
        self.assertIn("어디를 누르면 되는지", prompt)

    def test_data_questions_still_go_to_the_tools(self):
        self.assertIn("tool로 조회", guide_prompt())

    def test_the_model_is_told_not_to_invent_features(self):
        self.assertIn("지어내지 말고", guide_prompt())

    def test_a_how_to_question_reaches_the_model_with_the_guide(self):
        user = User.objects.create_user(username="u", password="pw")
        seen = {}

        def fake_chat(task, messages, **kwargs):
            seen["system"] = messages[0]["content"]
            message = type("M", (), {"content": "오른쪽 위 '원문 열기'를 누르세요.", "tool_calls": None})()
            return type("R", (), {"choices": [type("C", (), {"message": message})()]})()

        with patch("assistant.ai.core_ai.chat", side_effect=fake_chat):
            reply = ai.answer(user, "원문 안보이는데 어떻게 켜?", current_path="/mypage/1/")
        self.assertIn("원문 열기", reply)
        self.assertIn("원문 열기", seen["system"])               # 안내가 같이 갔다

    def test_the_guide_file_exists_and_is_not_huge(self):
        self.assertTrue(GUIDE_PATH.exists())
        self.assertLess(len(site_guide()), 4500)                  # 모든 대화에 붙으므로 길이를 지킨다


class GuideMatchesTheScreensTests(TestCase):
    """안내에 적은 버튼·메뉴 이름과 숫자가 실제 화면과 같은지 지킨다. 화면을 바꾸면 site_guide.md도 고쳐야 한다."""

    def test_labels_in_the_guide_exist_on_the_screens(self):
        checks = {
            "templates/mypage/preview.html": ["원문 닫기", "원문 열기", "원문 보기", "학습 보기", "요약 다시 만들기", "퀴즈"],
            "templates/mypage/list.html": ["자료 올리기", "폴더 만들기", "요약 노트 만들기", "오답노트", "모의고사", "요약 대기"],
            "templates/mypage/note.html": ["PDF 저장", "게시판에 올리기", "글로 보기"],
            "templates/mypage/mock_exam.html": ["제출하고 채점하기", "인쇄·PDF", "이 문제 버리기"],
            "templates/assistant/fab.html": ["새 대화", "화면 내용 함께 보내기", "스크린샷도 첨부"],
            "templates/base.html": ["IPSE 놀이터", "잎새 커뮤니티", "IPSE Judge (학습)", "이번 주 AI 사용량", "강의 생성", "모집 관리"],
            "mypage/forms.py": ["새 폴더 이름"],
        }
        guide = site_guide()
        for path, labels in checks.items():
            text = source(path)
            for label in labels:
                self.assertIn(label, text, f"{path}에 '{label}'이 없습니다 — 화면을 바꿨다면 site_guide.md도 고치세요")
                self.assertIn(label.split(" · ")[0], guide, f"site_guide.md에 '{label}'이 없습니다")

    def test_numbers_in_the_guide_match_the_code(self):
        guide = site_guide()
        self.assertIn(f"최대 {MAX_UPLOAD_SIZE // (1024 * 1024)}MB", guide)
        self.assertIn(f"최대 {MAX_QUESTIONS}개", guide)
        self.assertIn(f"최대 {MAX_FOLDER_DEPTH}단계", guide)
        self.assertIn(f"최대 {cram.MAX_SOURCES}개", guide)
        self.assertIn(f"최대 {ai.MAX_SESSIONS}개 보관", guide)

    def test_the_pptx_answer_matches_the_preview(self):
        # 원문 칸은 PDF=iframe, 이미지=img, 그 밖에는 추출한 글자(pre)다 — 안내도 그렇게 말해야 한다
        template = source("templates/mypage/preview.html")
        self.assertIn("{% if is_pdf %}", template)
        self.assertIn("{% elif is_image %}", template)
        self.assertIn("<pre>", template)
        self.assertIn("글자만 뽑은 텍스트", site_guide())
