import random
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from core.models import AIUsage
from core.testing import use_up

from . import ai, views
from .models import ExamStyle, GeneratedQuestion, PersonalDocument, ProcessingStatus

User = get_user_model()
LECTURE, EXAM = PersonalDocument.DocumentType.LECTURE, PersonalDocument.DocumentType.EXAM


def make_doc(user, document_type=LECTURE, **kw):
    return PersonalDocument.objects.create(user=user, title="자료", file="a.txt", extracted_text="프로세스는 실행 중인 프로그램이다. " * 20,
                                           summary="요약", summary_status=ProcessingStatus.DONE, document_type=document_type, **kw)


class MultipleChoiceGenerationTests(TestCase):
    def test_options_are_cleaned_shuffled_and_the_answer_index_follows_the_correct_option(self):
        options, answer = ai._shuffle_options(["1. 정답", "② 오답1", "오답2", "D) 오답3"], random.Random(1))
        self.assertEqual(sorted(options), ["오답1", "오답2", "오답3", "정답"])        # 번호·기호는 뗀다
        self.assertEqual(options[int(answer)], "정답")
        positions = {ai._shuffle_options(["정답", "a", "b", "c"], random.Random(i))[1] for i in range(40)}
        self.assertEqual(positions, {"0", "1", "2", "3"})                          # 정답이 늘 같은 자리에 오지 않는다

    def test_fewer_than_four_distinct_options_is_an_error(self):
        for bad in (["a", "a", "b", "c"], ["a", "b", "c"], None, []):
            with self.assertRaises(ValueError):
                ai._shuffle_options(bad)

    def test_generate_one_question_returns_options_answer_and_explanation(self):
        data = {"question": "프로세스란?", "options": ["실행 중인 프로그램", "저장된 파일", "네트워크 장치", "입력 장치"], "explanation": "실행 중인 프로그램이다"}
        with patch("core.ai.complete_json", return_value=data) as call:
            q = ai.generate_one_question("본문", "mc", user=None, rng=random.Random(3))
        self.assertEqual(q["options"][int(q["answer"])], "실행 중인 프로그램")
        self.assertEqual(q["explanation"], "실행 중인 프로그램이다")
        self.assertIn("객관식", call.call_args.args[1][1]["content"])
        self.assertIn("첫 번째가 정답", call.call_args.args[1][0]["content"])


class MultipleChoiceQuizTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="mc", password="pw")
        self.client.force_login(self.user)
        self.doc = make_doc(self.user)
        self.q = GeneratedQuestion.objects.create(
            document=self.doc, question_type="mc", question_text="프로세스란?", options=["a", "b", "c", "d"], answer="2",
            feedback="c가 맞다", status=ProcessingStatus.DONE)

    def submit(self, value, ajax=True):
        headers = {"HTTP_X_REQUESTED_WITH": "XMLHttpRequest"} if ajax else {}
        with patch("core.ai._client") as client:
            res = self.client.post(f"/mypage/{self.doc.pk}/answer/{self.q.pk}/", {"user_answer": value}, **headers)
        client.assert_not_called()                                          # 객관식 채점은 AI를 부르지 않는다
        return res

    def test_correct_and_wrong_answers_are_graded_by_the_server_with_the_stored_explanation(self):
        d = self.submit("2").json()
        self.assertEqual((d["is_correct"], d["feedback"], d["answer"], d["user_answer"]), (True, "c가 맞다", "3. c", "3. c"))
        self.q.refresh_from_db()
        self.assertTrue(self.q.is_correct)
        wrong = GeneratedQuestion.objects.create(document=self.doc, question_type="mc", question_text="q2", options=["a", "b", "c", "d"],
                                                 answer="0", status=ProcessingStatus.DONE)
        with patch("core.ai._client"):
            d = self.client.post(f"/mypage/{self.doc.pk}/answer/{wrong.pk}/", {"user_answer": "3"},
                                 HTTP_X_REQUESTED_WITH="XMLHttpRequest").json()
        self.assertEqual((d["is_correct"], d["user_answer"], d["answer"]), (False, "4. d", "1. a"))

    def test_invalid_option_numbers_are_rejected(self):
        for value in ("9", "x", "-1"):
            self.assertEqual(self.submit(value).status_code, 400)
        self.q.refresh_from_db()
        self.assertIsNone(self.q.is_correct)

    def test_quiz_page_shows_the_four_options_as_buttons_and_the_answer_as_text(self):
        html = self.client.get(f"/mypage/{self.doc.pk}/?panel=quiz").content.decode()
        for n, option in enumerate("abcd"):
            self.assertIn(f'name="user_answer" value="{n}"', html)
        self.assertIn("객관식", html)
        self.submit("1")
        html = self.client.get(f"/mypage/{self.doc.pk}/?panel=quiz").content.decode()
        self.assertIn("제출한 답: 2. b", html)
        self.assertIn("정답: 3. c", html)

    def test_type_choice_offers_multiple_choice(self):
        html = self.client.get(f"/mypage/{self.doc.pk}/?panel=quiz").content.decode()
        self.assertIn('<option value="mc">객관식</option>', html)

    def test_generation_stores_options_and_explanation(self):
        question = GeneratedQuestion.objects.create(document=self.doc, question_type="mc", status=ProcessingStatus.PROCESSING)
        fake = {"question": "문제?", "answer": "1", "explanation": "해설", "options": ["w", "x", "y", "z"]}
        with patch("mypage.views.generate_one_question", return_value=fake):
            views._make_question(question.pk, "본문", "mc", [], self.user, 0, "")
        question.refresh_from_db()
        self.assertEqual((question.status, question.options, question.answer, question.feedback),
                         (ProcessingStatus.DONE, ["w", "x", "y", "z"], "1", "해설"))


class DefaultQuestionsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="dq", password="pw")

    @staticmethod
    def fake(extra=None):
        calls = []

        def generate(text, question_type, existing_questions=(), user=None, index=0, rng=None, style=""):
            calls.append({"type": question_type, "existing": list(existing_questions), "index": index, "style": style})
            q = {"question": f"{question_type} 문제 {len(calls)}", "answer": "O" if question_type == "ox" else "답",
                 "explanation": "해설", "options": []}
            if question_type == "mc":
                q.update(options=["a", "b", "c", "d"], answer="1")
            return {**q, **(extra or {})}

        return generate, calls

    def test_lecture_upload_gets_five_default_questions_ox2_mc1_short1_essay1(self):
        doc = make_doc(self.user)
        generate, calls = self.fake()
        with patch("mypage.views.generate_one_question", side_effect=generate):
            views._make_default_questions(doc.pk)
        questions = list(doc.questions.order_by("pk"))
        self.assertEqual([q.question_type for q in questions], ["ox", "ox", "mc", "short", "essay"])
        self.assertTrue(all(q.status == ProcessingStatus.DONE for q in questions))
        self.assertEqual(questions[2].options, ["a", "b", "c", "d"])
        self.assertEqual(len(calls[3]["existing"]), 3)      # 이미 만든 문제 3개를 알려 줘 겹치지 않게 한다
        self.assertTrue(calls[3]["existing"][0].startswith("ox 문제 1"))
        self.assertEqual([c["index"] for c in calls], [0, 1, 2, 3, 4])                       # 자료의 다른 구간에서

    def test_exam_documents_and_documents_that_already_have_questions_are_skipped(self):
        generate, calls = self.fake()
        with patch("mypage.views.generate_one_question", side_effect=generate):
            views._make_default_questions(make_doc(self.user, EXAM).pk)
            doc = make_doc(self.user)
            GeneratedQuestion.objects.create(document=doc, question_type="ox", question_text="이미 있음", answer="O")
            views._make_default_questions(doc.pk)
        self.assertEqual(calls, [])

    @override_settings(AI_CREDIT_COSTS={"question": 7}, AI_WEEKLY_LIMIT_POINTS=100)
    def test_it_stops_when_the_weekly_limit_is_used_up(self):
        doc = make_doc(self.user)
        use_up(self.user, 85)                                                                # 남은 15: 한 문제(7)씩 두 번까지
        generate, calls = self.fake()

        def generate_and_use(*args, **kwargs):
            result = generate(*args, **kwargs)
            use_up(self.user, 7)                                                              # 실제 호출처럼 사용량이 쌓인다
            return result

        with patch("mypage.views.generate_one_question", side_effect=generate_and_use):
            views._make_default_questions(doc.pk)
        self.assertEqual(doc.questions.count(), 2)

    def test_one_failed_question_does_not_stop_the_rest(self):
        doc = make_doc(self.user)
        generate, calls = self.fake()

        def flaky(*args, **kwargs):
            if len(calls) == 1:
                calls.append("boom")
                raise RuntimeError("api down")
            return generate(*args, **kwargs)

        with patch("mypage.views.generate_one_question", side_effect=flaky):
            views._make_default_questions(doc.pk)
        statuses = [q.status for q in doc.questions.order_by("pk")]
        self.assertEqual(len(statuses), 5)
        self.assertEqual(statuses.count(ProcessingStatus.FAILED), 1)
        self.assertEqual(statuses.count(ProcessingStatus.DONE), 4)

    def test_style_of_the_documents_professor_is_applied(self):
        ExamStyle.objects.create(key="p:김", label="김교수 교수님", guidelines="- 함정 보기를 넣는다", source_hash="h", doc_count=1)
        doc = make_doc(self.user, professor="김교수")
        generate, calls = self.fake()
        with patch("mypage.views.generate_one_question", side_effect=generate):
            views._make_default_questions(doc.pk)
        self.assertTrue(all("함정 보기" in c["style"] for c in calls))

    def test_summary_background_job_creates_the_questions_after_the_summary(self):
        doc = make_doc(self.user)
        PersonalDocument.objects.filter(pk=doc.pk).update(summary="", summary_status=ProcessingStatus.PROCESSING)
        order = []
        with patch("mypage.views.generate_summary", side_effect=lambda *a, **k: order.append("summary") or "새 요약"), \
                patch("mypage.views._make_default_questions", side_effect=lambda pk: order.append("questions")), \
                patch("mypage.views._classify_and_build", side_effect=lambda pk: order.append("classify")):
            views._generate_summary_bg(doc.pk)
        self.assertEqual(order, ["summary", "questions", "classify"])
        doc.refresh_from_db()
        self.assertEqual((doc.summary, doc.summary_status), ("새 요약", ProcessingStatus.DONE))

    def test_a_failure_while_making_questions_does_not_break_the_summary_or_classification(self):
        doc = make_doc(self.user)
        PersonalDocument.objects.filter(pk=doc.pk).update(summary="", summary_status=ProcessingStatus.PROCESSING)
        with patch("mypage.views.generate_summary", return_value="새 요약"), \
                patch("mypage.views._make_default_questions", side_effect=RuntimeError("boom")), \
                patch("mypage.views._classify_and_build") as classify:
            views._generate_summary_bg(doc.pk)
        classify.assert_called_once()
        doc.refresh_from_db()
        self.assertEqual(doc.summary_status, ProcessingStatus.DONE)


@override_settings(AI_CREDIT_COSTS={"summary": 1, "question": 7}, AI_WEEKLY_LIMIT_POINTS=100)
class EstimateIncludesQuestionsTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.user = User.objects.create_user(username="est2", password="pw")
        self.client.force_login(self.user)

    def estimate(self, document_type):
        from django.core.files.uploadedfile import SimpleUploadedFile
        with patch("mypage.views.extract_text", return_value="가" * 3000):
            return self.client.post("/mypage/estimate/", {"file": SimpleUploadedFile("a.txt", b"x"), "document_type": document_type}).json()

    def test_lecture_estimate_adds_five_questions_and_exam_estimate_does_not(self):
        lecture, exam = self.estimate("lecture"), self.estimate("exam")
        self.assertEqual((lecture["questions"], lecture["est_label"]), (5, "36"))     # 요약 1 + 문제 5 × 7 = 36점
        self.assertEqual((exam["questions"], exam["est_label"]), (0, "1.0"))
