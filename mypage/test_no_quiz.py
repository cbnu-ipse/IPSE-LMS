from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from . import ai
from .models import GeneratedQuestion, PersonalDocument, ProcessingStatus
from .test_exam import make_doc

User = get_user_model()
DT = PersonalDocument.DocumentType


class NoQuizTests(TestCase):
    """족보는 '분석', 과제는 '풀이'만 보여 주고 퀴즈 탭·퀴즈 만들기는 없다. 수업 자료는 그대로다."""

    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(self.user)

    def page(self, doc, panel=""):
        return self.client.get(doc.get_absolute_url() + panel).content.decode()

    def test_exam_shows_analysis_and_no_quiz_tab(self):
        doc = make_doc(self.user, "족보", document_type=DT.EXAM, summary="## 출제 범위\n- 스케줄링")
        html = self.page(doc)
        self.assertNotIn("?panel=quiz", html)
        self.assertIn('id="panel-title"', html)
        self.assertRegex(html, r'id="panel-title">\s*<i[^>]*></i>분석')
        self.assertNotIn("퀴즈", html.split('id="panel-title"')[1].split("</div>")[0])

    def test_assignment_shows_solution_and_no_quiz_tab(self):
        doc = make_doc(self.user, "과제", document_type=DT.ASSIGNMENT, summary="## 1번\n**답:** 5")
        html = self.page(doc)
        self.assertNotIn("?panel=quiz", html)
        self.assertRegex(html, r'id="panel-title">\s*<i[^>]*></i>풀이')

    def test_lecture_keeps_both_tabs(self):
        doc = make_doc(self.user, "수업", document_type=DT.LECTURE, summary="## a\n내용")
        html = self.page(doc)
        self.assertIn("?panel=summary", html)
        self.assertIn("?panel=quiz", html)
        self.assertNotIn('id="panel-title"', html)

    def test_asking_for_the_quiz_panel_falls_back_to_the_summary_panel(self):
        for doc_type in (DT.EXAM, DT.ASSIGNMENT):
            doc = make_doc(self.user, "x", document_type=doc_type, summary="## a\n내용")
            res = self.client.get(doc.get_absolute_url() + "?panel=quiz")
            self.assertEqual(res.context["active_panel"], "summary")
            self.assertFalse(res.context["has_quiz"])

    def test_quiz_cannot_be_generated_for_exam_or_assignment(self):
        for doc_type in (DT.EXAM, DT.ASSIGNMENT):
            doc = make_doc(self.user, "x", document_type=doc_type)
            with patch("mypage.views.threading.Thread") as thread:
                res = self.client.post(reverse("mypage:generate_question", args=[doc.pk]), {"question_type": "ox"})
            self.assertEqual(res.status_code, 302)
            self.assertEqual(doc.questions.count(), 0)
            thread.assert_not_called()

    def test_old_quiz_answers_on_exam_documents_are_refused(self):
        doc = make_doc(self.user, "x", document_type=DT.EXAM)
        q = GeneratedQuestion.objects.create(document=doc, question_type="ox", question_text="q", answer="O",
                                             status=ProcessingStatus.DONE)
        res = self.client.post(reverse("mypage:submit_answer", args=[doc.pk, q.pk]), {"answer": "O"})
        self.assertEqual(res.status_code, 400)

    def test_status_wording_follows_the_kind(self):
        doc = make_doc(self.user, "x", document_type=DT.EXAM, summary="")
        PersonalDocument.objects.filter(pk=doc.pk).update(summary_status=ProcessingStatus.FAILED)
        self.assertIn("분석을 생성하지 못했습니다", self.page(doc))
        doc2 = make_doc(self.user, "y", document_type=DT.ASSIGNMENT, summary="")
        PersonalDocument.objects.filter(pk=doc2.pk).update(summary_status=ProcessingStatus.FAILED)
        self.assertIn("풀이를 생성하지 못했습니다", self.page(doc2))


class ExamAnalysisPromptTests(TestCase):
    def test_prompt_asks_for_scope_style_and_study_advice(self):
        text = ai.EXAM_SUMMARY_INSTRUCTIONS
        for heading in ("## 출제 범위", "## 출제 스타일", "## 자주 나오는 포인트", "## 이렇게 공부해보세요"):
            self.assertIn(heading, text)

    def test_a_long_exam_is_analysed_in_one_call_not_one_per_12000_chars(self):
        body = "\n\n".join(f"{i}. 다음 중 {i}번째 개념으로 옳은 것을 고르시오. 보기 ①가 ②나 ③다 ④라" * 3 for i in range(1, 260))
        self.assertGreater(len(body), ai.SUMMARY_WINDOW_CHARS * 2)
        self.assertLess(len(body), ai.EXAM_WINDOW_CHARS)
        with patch("core.ai.complete", return_value="## 출제 범위\n- a") as complete:
            ai.generate_summary(body, user=None, kind="exam")
        self.assertEqual(complete.call_count, 1)
        with patch("core.ai.complete", return_value="## a\n- b") as complete:
            ai.generate_summary(body, user=None, kind="lecture")
        self.assertGreater(complete.call_count, 1)                 # 수업 자료는 예전처럼 12,000자씩
