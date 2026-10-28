import importlib
from unittest.mock import patch

from django.apps import apps as global_apps
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase

from community.models import CommunityPost

from . import exam
from .models import ExamStyle, MockExam, PersonalDocument, ProcessingStatus, SharedMaterial
from .titles import clean_title

User = get_user_model()
FALLBACK = "선형대수학 모의고사"
NAMES = ["정태은 교수님", "정태은"]


class CleanTitleTests(SimpleTestCase):
    def test_style_and_professor_wording_is_removed_from_titles(self):
        cases = {
            "선형대수학 중간고사 모의고사 (정태은 교수님 스타일)": "선형대수학 중간고사 모의고사",
            "선형대수학 모의고사 - 정태은 교수님 스타일": FALLBACK,
            "정태은 교수님이 낼 법한 선형대수 모의고사": FALLBACK,
            "운영체제 중간 대비 [김교수 출제 방식 반영]": "운영체제 중간 대비",
            "(교수님 스타일)": FALLBACK,
            "": FALLBACK,
            "선형대수학 1~3장 모의고사": "선형대수학 1~3장 모의고사",
            "벡터공간 모의고사": "벡터공간 모의고사",
        }
        for title, want in cases.items():
            self.assertEqual(clean_title(title, FALLBACK, NAMES), want, title)

    def test_a_title_that_mentions_the_professor_name_falls_back_even_without_the_word_style(self):
        self.assertEqual(clean_title("정태은 선형대수 모의고사", FALLBACK, NAMES), FALLBACK)


class GenerationTests(TestCase):
    SUMMARY = "행렬의 곱셈은 교환법칙이 일반적으로 성립하지 않는다. 가역행렬의 행렬식은 0이 아니다."

    def setUp(self):
        self.user = User.objects.create_user(username="t", password="pw")
        self.doc = PersonalDocument.objects.create(user=self.user, title="선형대수 강의", file="a.txt", extracted_text=self.SUMMARY, summary=self.SUMMARY,
                                                   summary_status=ProcessingStatus.DONE, document_type="lecture", course_name="선형대수학", professor="정태은")
        ExamStyle.objects.create(key="p:정태은", label="정태은 교수님", guidelines="- 개념 이해 위주", source_hash="h", doc_count=1)

    def questions(self):
        return [{"type": "ox", "q": f"문제 {i}", "answer": True, "explanation": "e", "source": "행렬의 곱셈은 교환법칙이 일반적으로 성립하지 않는다"} for i in range(6)]

    def test_the_professor_name_is_not_sent_in_the_prompt_and_a_leaky_title_is_cleaned(self):
        data = {"title": "선형대수학 중간고사 모의고사 (정태은 교수님 스타일)", "questions": self.questions()}
        with patch("core.ai.complete_json", return_value=data) as ai:
            mock = exam.generate_mock_exam(self.user, [self.doc])
        prompt = ai.call_args.args[1][1]["content"]
        self.assertIn("출제 스타일:\n- 개념 이해 위주", prompt)
        self.assertNotIn("정태은", prompt)
        self.assertEqual(mock.title, "선형대수학 중간고사 모의고사")
        self.assertIn("교수·강사 이름이나 '스타일'", ai.call_args.args[1][0]["content"])

    def test_a_title_made_only_of_style_wording_becomes_the_default_title(self):
        with patch("core.ai.complete_json", return_value={"title": "정태은 교수님 스타일", "questions": self.questions()}):
            mock = exam.generate_mock_exam(self.user, [self.doc])
        self.assertEqual(mock.title, "선형대수 강의 모의고사")


class MigrationTests(TestCase):
    def test_existing_titles_cards_and_board_posts_are_cleaned(self):
        user = User.objects.create_user(username="m", password="pw")
        old = "선형대수학 중간고사 모의고사 (정태은 교수님 스타일)"
        doc = PersonalDocument.objects.create(user=user, title=old, file="", document_type="mock", professor="정태은", course_name="선형대수학",
                                              summary_status=ProcessingStatus.DONE)
        mock = MockExam.objects.create(user=user, document=doc, course_code="선형대수학", title=old, style_label="정태은 교수님",
                                       questions=[{"type": "ox", "q": "q", "answer": True, "explanation": ""}])
        post = CommunityPost.objects.create(title=f"[모의고사] {old}", content=f"{old}\n\n모의고사 1문항", author=user, category="free")
        shared = SharedMaterial.objects.create(post=post, author=user, kind="mock", title=old, source_key=f"mock:{mock.pk}", payload={})
        importlib.import_module("mypage.migrations.0024_clean_mock_titles").clean(global_apps, None)
        for obj in (doc, mock, post, shared):
            obj.refresh_from_db()
        new = "선형대수학 중간고사 모의고사"
        self.assertEqual((mock.title, doc.title, shared.title, post.title), (new, new, new, f"[모의고사] {new}"))
        self.assertTrue(post.content.startswith(new))
        self.assertNotIn("스타일", post.content)
