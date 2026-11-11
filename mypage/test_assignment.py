import shutil
import tempfile
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse

from course.models import CourseDraft
from course.topics import after_summary
from mypage import ai, cram, exam, views
from mypage.models import PersonalDocument, ProcessingStatus

from .test_exam import make_doc

User = get_user_model()
ASSIGNMENT = PersonalDocument.DocumentType.ASSIGNMENT
HOMEWORK = "\n".join(f"{i}번. 문제 {i}: {i}+{i + 2}를 구하고 과정을 쓰시오. (조건 {i * 7})" for i in range(1, 7))


class SolutionAiTests(TestCase):
    def test_solution_uses_its_own_task_and_instructions(self):
        with patch("core.ai.complete", return_value="## 1번\n**답:** 5") as complete:
            out = ai.generate_solution(HOMEWORK, user=None)
        self.assertEqual(out, "## 1번\n**답:** 5")
        task, messages = complete.call_args.args[0], complete.call_args.args[1]
        self.assertEqual(task, "assignment")
        self.assertIn("문항", messages[0]["content"])
        self.assertIn("1+3", messages[1]["content"])

    def test_empty_text_makes_no_call(self):
        with patch("core.ai.complete") as complete:
            self.assertEqual(ai.generate_solution("  \n", user=None), "")
        complete.assert_not_called()

    def test_the_task_has_a_model_cost_and_token_limit(self):
        from django.conf import settings

        from core import ai as core_ai
        self.assertIn("assignment", settings.AI_MODELS)
        self.assertIn("assignment", settings.AI_CREDIT_COSTS)
        self.assertGreater(core_ai.MAX_OUTPUT_TOKENS["assignment"], core_ai.MAX_OUTPUT_TOKENS["summary"])

    def test_too_long_assignments_are_flagged(self):
        self.assertFalse(ai.assignment_too_long("a" * ai.ASSIGNMENT_MAX_CHARS))
        self.assertTrue(ai.assignment_too_long("a" * (ai.ASSIGNMENT_MAX_CHARS + 1)))


class AssignmentPipelineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_background_job_writes_a_solution_not_a_summary(self):
        doc = make_doc(self.user, "hw", document_type=ASSIGNMENT, text=HOMEWORK, summary="")
        PersonalDocument.objects.filter(pk=doc.pk).update(summary_status=ProcessingStatus.PROCESSING)
        with patch.object(views, "generate_solution", return_value="## 1번\n**답:** 5") as solve, \
                patch.object(views, "generate_summary") as summarize, patch.object(views, "SummaryPublisher"):
            views._generate_summary_bg(doc.pk)
        doc.refresh_from_db()
        self.assertEqual((doc.summary, doc.summary_status), ("## 1번\n**답:** 5", ProcessingStatus.DONE))
        solve.assert_called_once()
        summarize.assert_not_called()

    def test_failed_solution_marks_the_document_failed(self):
        doc = make_doc(self.user, "hw", document_type=ASSIGNMENT, text=HOMEWORK, summary="")
        with patch.object(views, "generate_solution", side_effect=RuntimeError("boom")), patch.object(views, "SummaryPublisher"):
            views._generate_summary_bg(doc.pk)
        doc.refresh_from_db()
        self.assertEqual(doc.summary_status, ProcessingStatus.FAILED)

    def test_other_features_never_see_assignments(self):
        doc = make_doc(self.user, "hw", document_type=ASSIGNMENT, text=HOMEWORK, summary="## 1번\n답", professor="김교수",
                       topics_=())
        self.assertFalse(cram.usable(doc))                  # 요약 노트의 재료가 아니다
        self.assertFalse(exam.usable_for_mock(doc))         # 모의 출제의 재료가 아니다
        with patch("core.ai.chat") as chat:
            self.assertEqual(after_summary(doc.pk), [])     # 주제 분류·개념 태그·출제 스타일 없음
        chat.assert_not_called()
        doc.refresh_from_db()
        self.assertEqual(doc.topics.count(), 0)
        self.assertEqual(CourseDraft.objects.count(), 0)

    def test_resummarize_rules_for_assignment(self):
        done = make_doc(self.user, "hw", document_type=ASSIGNMENT, text="가" * 20000, summary="## 1번\n답")
        self.assertFalse(views._can_resummarize(done))      # 긴 본문이어도 이미 있는 풀이를 다시 만들 수 있게 열지 않는다
        failed = make_doc(self.user, "hw2", document_type=ASSIGNMENT, text=HOMEWORK, summary="")
        PersonalDocument.objects.filter(pk=failed.pk).update(summary_status=ProcessingStatus.FAILED)
        failed.refresh_from_db()
        self.assertTrue(views._can_resummarize(failed))


class AssignmentUploadTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        self.user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(self.user)

    def upload(self, text=HOMEWORK, doc_type="assignment"):
        data = {"file": SimpleUploadedFile("hw.txt", text.encode()), "document_type": doc_type, "title": "과제1",
                "course_name": "자료구조", "professor": "김교수"}
        with override_settings(MEDIA_ROOT=self.media), patch.object(views.threading, "Thread") as thread:
            response = self.client.post(reverse("mypage:document_list"), data)
        return response, thread

    def test_upload_saves_data_and_starts_only_the_solution(self):
        response, thread = self.upload()
        self.assertEqual(response.status_code, 302)
        doc = PersonalDocument.objects.get()
        self.assertEqual((doc.document_type, doc.summary_status, doc.is_course_material),
                         (ASSIGNMENT, ProcessingStatus.PROCESSING, False))
        self.assertIn("1+3", doc.extracted_text)                    # 데이터는 저장된다
        self.assertTrue(doc.file)
        targets = [c.kwargs.get("target") for c in thread.call_args_list]
        self.assertEqual(targets, [views._generate_summary_bg])     # 분류·강의 초안 스레드는 없다
        self.assertEqual(doc.suggested_type, "")                    # 족보/수업 자료 짐작에도 넣지 않는다

    def test_too_long_assignment_is_refused(self):
        response, thread = self.upload(" ".join(f"문항{i}번 설명" for i in range(ai.ASSIGNMENT_MAX_CHARS // 6 + 50)))
        self.assertEqual(PersonalDocument.objects.count(), 0)
        thread.assert_not_called()

    def test_lecture_upload_is_unchanged(self):
        response, thread = self.upload(doc_type="lecture")
        doc = PersonalDocument.objects.get()
        self.assertTrue(doc.is_course_material)
        self.assertEqual(doc.document_type, PersonalDocument.DocumentType.LECTURE)

    def test_list_offers_the_assignment_type_and_estimate_knows_its_cost(self):
        html = self.client.get(reverse("mypage:document_list")).content.decode()
        self.assertIn('data-type="assignment"', html)
        with override_settings(MEDIA_ROOT=self.media):
            res = self.client.post(reverse("mypage:upload_estimate"), {"file": SimpleUploadedFile("hw.txt", HOMEWORK.encode())})
        body = res.json()
        self.assertTrue(body["ok"])
        self.assertIn("assignment_label", body)
        self.assertFalse(body["assignment_too_long"])

    def test_study_screen_calls_it_a_solution(self):
        doc = make_doc(self.user, "hw", document_type=ASSIGNMENT, text=HOMEWORK, summary="## 1번\n**답:** 5")
        with override_settings(MEDIA_ROOT=self.media):
            html = self.client.get(doc.get_absolute_url()).content.decode()
        self.assertIn("풀이", html)
