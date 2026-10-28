from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from . import exam
from .models import GeneratedQuestion, MockExam, PersonalDocument, ProcessingStatus

User = get_user_model()
LONG = "[Lamport 시퀀스] 프로세스 $P_1, P_2, P_3$으로 구성된 분산 시스템에서 " + "긴 시나리오 문장입니다. " * 60 + "(2) $P_1$과 $P_2$가 서로에게 ACK 메시지를 보낼 때의 상태를 쓰시오."


class QuestionTextTests(TestCase):
    def test_long_scenarios_are_no_longer_cut_at_500_characters_and_newlines_are_kept(self):
        text = "다음 코드를 보시오.\n\n```text\nLine 1: receive(request)\nLine 2: if (myts < ts_j)\n```\n(1) 오류를 설명하시오.\n(2) 수정하시오."
        q = exam._normalize_mock_question({"type": "essay", "q": text, "answer": "모범답안"})
        self.assertEqual(q["q"], text)                                              # 줄바꿈·코드 블록 그대로
        self.assertGreater(len(LONG), 500)
        long_q = exam._normalize_mock_question({"type": "essay", "q": LONG, "answer": "답"})
        self.assertTrue(long_q["q"].endswith("상태를 쓰시오."))                       # 끝까지 보인다 (예전에는 500자에서 잘림)

    def test_blank_lines_and_trailing_spaces_are_tidied(self):
        q = exam._normalize_mock_question({"type": "short", "q": "a  \n\n\n\n b", "answers": ["x"]})
        self.assertEqual(q["q"], "a\n\n b")

    def test_each_type_is_still_validated(self):
        self.assertIsNone(exam._normalize_mock_question({"type": "mc", "q": "q", "options": ["a"], "answer": 0}))
        self.assertIsNone(exam._normalize_mock_question({"type": "mc", "q": "q", "options": ["a", "b"], "answer": True}))
        self.assertIsNone(exam._normalize_mock_question({"type": "short", "q": "q", "answers": []}))
        self.assertIsNone(exam._normalize_mock_question({"type": "essay", "q": "q", "answer": ""}))
        self.assertIsNone(exam._normalize_mock_question({"type": "ox", "q": "  "}))
        self.assertTrue(exam._normalize_mock_question({"type": "ox", "q": "q", "answer": "참"})["answer"])

    def test_prompt_asks_for_readable_markdown(self):
        for hint in ("마크다운", "``` 블록", "$...$", "소문항", "굵게"):
            self.assertIn(hint, exam.MOCK_SYSTEM)


class ExamPageRenderTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="rd", password="pw")
        self.client.force_login(self.user)
        self.exam = MockExam.objects.create(user=self.user, course_code="분산시스템", title="분산 모의고사", questions=[
            {"type": "short", "q": "Coterie $C$ 에서 $Q_i \\cap Q_j \\neq \\emptyset$ 인 성질은?", "answers": ["교집합"], "explanation": ""},
            {"type": "mc", "q": "고르시오", "options": ["`REQUEST(1, P1)` 메시지", "b", "c", "d"], "answer": 0, "explanation": "해설 $x$"},
            {"type": "essay", "q": "코드:\n```text\nLine 1: x\n```\n설명하시오", "answer": "모범", "explanation": ""}])

    def test_question_text_is_rendered_as_markdown_and_math_not_a_bold_blob(self):
        html = self.client.get(self.exam.get_absolute_url()).content.decode()
        self.assertEqual(html.count("data-md>"), 3)                                 # 문제 본문 3개를 마크다운으로 그린다
        self.assertIn("data-md-inline>", html)                                      # 보기·해설도
        self.assertIn("window.renderMarkdown", html)
        self.assertIn("window.renderMath", html)
        self.assertNotIn('class="text-sm font-bold text-slate-800 mb-3"', html)     # 문제 전체를 굵게 하던 예전 마크업은 없다
        self.assertIn("Coterie $C$", html)                                          # 수식 원문은 그대로 전달 (KaTeX가 그린다)
        self.assertIn("```text", html)

    def test_page_is_printable(self):
        html = self.client.get(self.exam.get_absolute_url()).content.decode()
        self.assertIn("window.print()", html)
        self.assertIn("@media print", html)

    def test_results_view_keeps_saved_grading_and_links_to_wrong_notes(self):
        self.client.post(self.exam.get_absolute_url(), {"a_0": "교집합", "a_1": "0", "a_2": ""})
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.results, [True, True, False])
        html = self.client.get(self.exam.get_absolute_url()).content.decode()
        self.assertIn("오답노트", html)
        self.assertIn("2 / 3점", html)


class WrongNotesTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="wn", password="pw")
        self.other = User.objects.create_user(username="wo", password="pw")
        self.client.force_login(self.user)

    def submitted_exam(self, user, subject="분산시스템", ago=0):
        e = MockExam.objects.create(
            user=user, course_code=subject, title=f"{subject} 모의고사", questions=[
                {"type": "ox", "q": "OX 문제", "answer": True, "explanation": "해설 하나"},
                {"type": "mc", "q": "객관식 문제", "options": ["가", "나", "다", "라"], "answer": 2, "explanation": ""},
                {"type": "essay", "q": "서술 문제", "answer": "모범답안 내용", "explanation": ""}],
            answers=[False, 1, "내 서술"], results=[False, False, True], feedback=["", "", "좋아요"],
            submitted_at=timezone.now() - timedelta(days=ago))
        return e

    def test_only_my_wrong_questions_are_collected_from_submitted_exams(self):
        mine = self.submitted_exam(self.user)
        self.submitted_exam(self.other)                                              # 남의 모의고사는 안 보인다
        MockExam.objects.create(user=self.user, course_code="x", title="안 푼 시험", questions=[{"type": "ox", "q": "안 푼", "answer": True}])
        items = exam.wrong_answers(self.user)
        self.assertEqual([it["question"] for it in items], ["OX 문제", "객관식 문제"])   # 맞힌 서술형·안 푼 시험은 제외
        self.assertEqual(items[1]["my_answer"], "2. 나")
        self.assertEqual(items[1]["correct"], "3. 다")
        self.assertEqual(items[0]["link"], mine.get_absolute_url())

    def test_wrong_document_quiz_answers_are_included_too(self):
        doc = PersonalDocument.objects.create(user=self.user, title="OS 자료", file="a.txt", course_name="운영체제", summary_status=ProcessingStatus.DONE)
        GeneratedQuestion.objects.create(document=doc, question_type="mc", question_text="퀴즈 객관식", options=["a", "b", "c", "d"], answer="1",
                                         user_answer="3", is_correct=False, feedback="해설", status=ProcessingStatus.DONE)
        GeneratedQuestion.objects.create(document=doc, question_type="ox", question_text="맞힌 문제", answer="O", user_answer="O", is_correct=True)
        items = exam.wrong_answers(self.user)
        self.assertEqual([(it["source"], it["question"], it["my_answer"], it["correct"]) for it in items],
                         [("자료 퀴즈", "퀴즈 객관식", "4. d", "2. b")])

    def test_page_lists_filters_by_subject_and_hides_other_users(self):
        self.submitted_exam(self.user, "분산시스템")
        self.submitted_exam(self.user, "운영체제", ago=1)
        self.submitted_exam(self.other, "남의과목")
        html = self.client.get("/mypage/wrong/").content.decode()
        self.assertIn("오답노트", html)
        self.assertEqual(html.count("OX 문제"), 2)
        self.assertNotIn("남의과목", html)
        filtered = self.client.get("/mypage/wrong/?subject=운영체제").content.decode()
        self.assertEqual(filtered.count("OX 문제"), 1)
        self.assertIn("정답·해설 보기", filtered)                                       # 정답은 눌러서 확인 (스스로 풀어 보기)

    def test_page_never_calls_the_ai_and_requires_login(self):
        from unittest.mock import patch

        self.submitted_exam(self.user)
        with patch("core.ai._client") as client:
            self.client.get("/mypage/wrong/")
        client.assert_not_called()
        self.client.logout()
        self.assertEqual(self.client.get("/mypage/wrong/").status_code, 302)

    def test_empty_state_message(self):
        self.assertIn("아직 틀린 문제가 없어요", self.client.get("/mypage/wrong/").content.decode())


class StaleMockTests(TestCase):
    def test_a_mock_exam_stuck_generating_is_marked_failed(self):
        user = User.objects.create_user(username="st", password="pw")
        self.client.force_login(user)
        doc = PersonalDocument.objects.create(user=user, title="m", file="", document_type=PersonalDocument.DocumentType.MOCK,
                                              summary_status=ProcessingStatus.PROCESSING)
        PersonalDocument.objects.filter(pk=doc.pk).update(uploaded_at=timezone.now() - timedelta(minutes=30))
        self.client.get("/mypage/")
        doc.refresh_from_db()
        self.assertEqual(doc.summary_status, ProcessingStatus.FAILED)
