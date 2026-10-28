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

    def test_literal_backslash_n_becomes_a_real_newline_but_latex_commands_are_kept(self):
        q = exam._normalize_mock_question({"type": "short", "q": r"쓰시오.\nIn Flynn's taxonomy $a \neq b$, $\nu$, \nabla f\n(1) 다음", "answers": ["x"]})
        self.assertEqual(q["q"], "쓰시오.\nIn Flynn's taxonomy $a \\neq b$, $\\nu$, \\nabla f\n(1) 다음")
        opt = exam._normalize_mock_question({"type": "mc", "q": "q", "options": [r"한 줄\n두 줄", "b"], "answer": 0, "explanation": r"해설\n둘째 줄"})
        self.assertEqual((opt["options"][0], opt["explanation"]), ("한 줄\n두 줄", "해설\n둘째 줄"))

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
        self.assertIn("js/exam-render.js", html)                                    # 그리기는 공용 스크립트(줄바꿈 보존 + KaTeX)
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
