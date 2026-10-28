from django.contrib.auth import get_user_model
from django.template import Context, Template
from django.test import SimpleTestCase, TestCase, override_settings

from core.templatetags.cost import cost_label

from .models import MockExam, PersonalDocument, ProcessingStatus

User = get_user_model()
COSTS = {"chat": 2, "summary": 3, "question": 7, "grading": 3, "mock_exam": 30, "cram_note": 3}


@override_settings(AI_WEEKLY_LIMIT_POINTS=300)
class CostLabelTests(SimpleTestCase):
    def test_label_shows_percent_of_the_weekly_limit_and_points(self):
        self.assertEqual(cost_label(30), "약 10% · 30점")
        self.assertEqual(cost_label(2), "1% 미만 · 2점")
        self.assertEqual(cost_label(7.5), "약 2.5% · 7.5점")
        self.assertEqual((cost_label(0), cost_label(None), cost_label("x")), ("", "", ""))

    def test_include_prints_nothing_for_free_actions(self):
        render = lambda cost: Template("{% include 'includes/credit_cost.html' with cost=cost %}").render(Context({"cost": cost}))
        self.assertIn("약 10% · 30점", render(30))
        self.assertEqual(render(0).strip(), "")


@override_settings(AI_CREDIT_COSTS=COSTS, AI_WEEKLY_LIMIT_POINTS=300)
class CostShownOnActionsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="cost", password="pw")
        self.client.force_login(self.user)
        self.doc = PersonalDocument.objects.create(
            user=self.user, title="자료", file="a.txt", extracted_text="내용 " * 50, summary="요약", summary_status=ProcessingStatus.DONE,
            document_type=PersonalDocument.DocumentType.LECTURE)

    def test_document_page_shows_the_cost_of_generating_a_question(self):
        res = self.client.get(self.doc.get_absolute_url() + "?panel=quiz")
        self.assertContains(res, "새 문제 생성")
        self.assertContains(res, "약 2.3% · 7점")

    def test_list_page_shows_mock_exam_and_note_costs_in_the_selection_bar(self):
        res = self.client.get("/mypage/")
        self.assertContains(res, "모의고사 만들기 · 약 10% · 30점")
        self.assertContains(res, "노트 만들기 · 약 1.0% · 3점")

    def test_mock_exam_page_shows_the_ai_grading_cost_for_essays(self):
        exam = MockExam.objects.create(user=self.user, course_code="과목", title="모의", questions=[
            {"type": "ox", "q": "a", "answer": True, "explanation": ""},
            {"type": "essay", "q": "b", "answer": "c", "explanation": ""},
            {"type": "essay", "q": "d", "answer": "e", "explanation": ""}])
        res = self.client.get(exam.get_absolute_url())
        self.assertContains(res, "제출하고 채점하기")
        self.assertContains(res, "약 2.0% · 6점")                  # 서술형 2문항 × 3점
        self.assertContains(res, "서술형 2문항은 AI가 채점해요")


class ImageOriginalTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="img", password="pw")
        self.client.force_login(self.user)

    def make(self, name, **kw):
        return PersonalDocument.objects.create(user=self.user, title="스캔", file=name, extracted_text="OCR로 읽은 글자",
                                               summary="요약", summary_status=ProcessingStatus.DONE, **kw)

    def test_image_document_shows_the_original_image_instead_of_the_ocr_text(self):
        res = self.client.get(self.make("scan.png").get_absolute_url())
        self.assertContains(res, 'class="ms-img"')
        self.assertContains(res, "원본 이미지")
        self.assertNotContains(res, "<pre>OCR로 읽은 글자</pre>")

    def test_text_document_still_shows_its_text(self):
        res = self.client.get(self.make("note.txt").get_absolute_url())
        self.assertContains(res, "<pre>OCR로 읽은 글자</pre>")
        self.assertNotContains(res, 'class="ms-img"')
