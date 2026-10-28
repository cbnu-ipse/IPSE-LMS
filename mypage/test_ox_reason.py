import importlib
from unittest.mock import patch

from django.apps import apps as global_apps
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase

from . import ai, exam
from .models import GeneratedQuestion, MockExam, PersonalDocument, ProcessingStatus, WrongNote

User = get_user_model()

SCREENSHOT = ('다음 명제의 참/거짓을 판별하고, 거짓인 경우 판단 이유를 설명하시오.\n\n'
              '"임의의 n차 정방행렬 A와 B에 대하여 곱셈의 교환법칙 AB = BA가 항상 성립한다."')


class StripTests(SimpleTestCase):
    def test_the_reason_request_sentence_is_removed_and_the_statement_stays(self):
        self.assertEqual(ai.strip_reason_request(SCREENSHOT), '"임의의 n차 정방행렬 A와 B에 대하여 곱셈의 교환법칙 AB = BA가 항상 성립한다."')
        self.assertEqual(ai.strip_reason_request("프로세스는 실행 중인 프로그램이다. 참/거짓을 판단하고 그 이유를 설명하시오."), "프로세스는 실행 중인 프로그램이다.")
        self.assertEqual(ai.strip_reason_request("TCP는 연결 지향이다. 이유를 쓰시오."), "TCP는 연결 지향이다.")

    def test_nothing_left_means_none(self):
        self.assertIsNone(ai.strip_reason_request("거짓인 경우 이유를 설명하시오."))

    def test_plain_statements_with_the_word_explanation_are_not_touched(self):
        for text in ("다음 설명은 옳다: 페이징은 외부 단편화가 없다.", "교수님의 설명에 따르면 TLB는 캐시이다.", "이 기술은 널리 쓰인다."):
            self.assertFalse(ai.REASON_REQUEST.search(text), text)


class MockNormalizeTests(SimpleTestCase):
    def test_an_ox_question_loses_the_reason_request_and_stays_ox(self):
        q = exam._normalize_mock_question({"type": "ox", "q": SCREENSHOT, "answer": False, "explanation": "교환법칙은 일반적으로 성립하지 않는다."})
        self.assertEqual(q["type"], "ox")
        self.assertNotIn("설명하시오", q["q"])
        self.assertIn("AB = BA", q["q"])
        self.assertIs(q["answer"], False)

    def test_if_no_statement_is_left_it_becomes_an_essay_with_the_verdict_and_the_explanation(self):
        q = exam._normalize_mock_question({"type": "ox", "q": "참인지 거짓인지 판단하고 이유를 설명하시오.", "answer": False, "explanation": "근거 문장"})
        self.assertEqual((q["type"], q["answer"]), ("essay", "거짓. 근거 문장"))
        self.assertIsNone(exam._normalize_mock_question({"type": "ox", "q": "참인지 거짓인지 판단하고 이유를 설명하시오.", "answer": False}))   # 해설도 없으면 버린다

    def test_the_prompt_forbids_reason_requests_in_ox_questions(self):
        self.assertIn("OX 문제는 참/거짓만 고르는 문제입니다", exam.MOCK_SYSTEM)


class QuizTests(TestCase):
    def generate(self, question):
        with patch("core.ai.complete_json", return_value={"question": question, "answer": "X", "explanation": "근거"}) as call:
            return ai.generate_one_question("자료 본문 " * 20, "ox", rng=__import__("random").Random(1)), call

    def test_quiz_ox_questions_are_cleaned_too_and_prompted_not_to_ask_for_reasons(self):
        result, call = self.generate(SCREENSHOT)
        self.assertNotIn("설명하시오", result["question"])
        self.assertIn("OX 문제는 참/거짓만 고르는 문제입니다", call.call_args.args[1][0]["content"])

    def test_a_quiz_ox_question_that_is_only_a_reason_request_is_rejected(self):
        with self.assertRaises(ValueError):
            self.generate("거짓인 경우 이유를 설명하시오.")


class MigrationTests(TestCase):
    def test_existing_unsubmitted_exams_wrong_notes_and_quiz_questions_are_cleaned(self):
        user = User.objects.create_user(username="m", password="pw")
        open_exam = MockExam.objects.create(user=user, course_code="선형대수", title="t", questions=[
            {"type": "ox", "q": SCREENSHOT, "answer": False, "explanation": "e"}, {"type": "ox", "q": "평서문이다.", "answer": True, "explanation": ""}])
        graded = MockExam.objects.create(user=user, course_code="선형대수", title="t2", submitted_at="2026-01-01T00:00:00Z", questions=[
            {"type": "ox", "q": SCREENSHOT, "answer": False, "explanation": "e"}])
        note = WrongNote.objects.create(user=user, source="mock", source_id=open_exam.pk, index=0, question={"type": "ox", "q": SCREENSHOT, "answer": False})
        doc = PersonalDocument.objects.create(user=user, title="d", file="a.txt", summary_status=ProcessingStatus.DONE)
        quiz = GeneratedQuestion.objects.create(document=doc, question_type="ox", question_text=SCREENSHOT, answer="X")
        importlib.import_module("mypage.migrations.0023_strip_ox_reason_requests").strip(global_apps, None)
        for obj in (open_exam, graded, note, quiz):
            obj.refresh_from_db()
        self.assertNotIn("설명하시오", open_exam.questions[0]["q"])
        self.assertEqual(open_exam.questions[1]["q"], "평서문이다.")
        self.assertIn("설명하시오", graded.questions[0]["q"])                         # 이미 채점한 시험은 그대로
        self.assertNotIn("설명하시오", note.question["q"])
        self.assertNotIn("설명하시오", quiz.question_text)
