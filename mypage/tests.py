from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import GeneratedQuestion, PersonalDocument, ProcessingStatus
from .views import _generate_question_bg, _generate_summary_bg

User = get_user_model()


class BackgroundProcessingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pw")
        self.document = PersonalDocument.objects.create(
            user=self.user, title="doc", extracted_text="본문", summary_status=ProcessingStatus.PROCESSING,
        )

    def test_generate_summary_bg_marks_done_on_success(self):
        with patch("mypage.views.generate_summary", return_value="요약본"):
            _generate_summary_bg(self.document.pk)
        self.document.refresh_from_db()
        self.assertEqual(self.document.summary_status, ProcessingStatus.DONE)
        self.assertEqual(self.document.summary, "요약본")

    def test_generate_summary_bg_marks_failed_on_error(self):
        with patch("mypage.views.generate_summary", side_effect=RuntimeError("boom")):
            _generate_summary_bg(self.document.pk)
        self.document.refresh_from_db()
        self.assertEqual(self.document.summary_status, ProcessingStatus.FAILED)

    def test_generate_question_bg_marks_done_on_success(self):
        question = GeneratedQuestion.objects.create(
            document=self.document, question_type="ox", status=ProcessingStatus.PROCESSING,
        )
        with patch("mypage.views.generate_one_question", return_value={"question": "Q", "answer": "O"}):
            _generate_question_bg(question.pk, self.document.extracted_text, "ox", [])
        question.refresh_from_db()
        self.assertEqual(question.status, ProcessingStatus.DONE)
        self.assertEqual(question.question_text, "Q")

    def test_generate_question_bg_marks_failed_on_error(self):
        question = GeneratedQuestion.objects.create(
            document=self.document, question_type="ox", status=ProcessingStatus.PROCESSING,
        )
        with patch("mypage.views.generate_one_question", side_effect=RuntimeError("boom")):
            _generate_question_bg(question.pk, self.document.extracted_text, "ox", [])
        question.refresh_from_db()
        self.assertEqual(question.status, ProcessingStatus.FAILED)
