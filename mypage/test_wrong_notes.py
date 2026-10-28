import json
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from . import exam, wrongnotes
from .models import GeneratedQuestion, MockExam, PersonalDocument, ProcessingStatus, WrongNote

User = get_user_model()

QUESTIONS = [
    {"type": "ox", "q": "OX 문제", "answer": True, "explanation": "해설 하나"},
    {"type": "mc", "q": "객관식 문제", "options": ["가", "나", "다", "라"], "answer": 2, "explanation": ""},
    {"type": "short", "q": "단답 문제", "answers": ["프로세스", "process"], "explanation": ""},
    {"type": "essay", "q": "서술 문제", "answer": "모범답안 내용", "explanation": ""},
]


def make_exam(user, subject="분산시스템", **kw):
    return MockExam.objects.create(user=user, course_code=subject, title=f"{subject} 모의고사", questions=QUESTIONS, **kw)


class RecordOnGradingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="rg", password="pw")
        self.client.force_login(self.user)
        self.exam = make_exam(self.user)

    def submit(self, data):
        with patch("mypage.ai.grade_answer", return_value={"is_correct": True, "feedback": "ok"}) as grade:
            self.client.post(self.exam.get_absolute_url(), data)
        self.exam.refresh_from_db()
        return grade

    def test_wrong_answers_are_recorded_with_wrong_count_one(self):
        self.submit({"a_0": "X", "a_1": "2", "a_2": "process", "a_3": "내 서술"})     # ox 틀림, mc 맞음, 단답 맞음, 서술 맞음(AI)
        notes = WrongNote.objects.filter(user=self.user)
        self.assertEqual([n.index for n in notes], [0])
        note = notes.get()
        self.assertEqual((note.wrong_count, note.correct_count, note.reason, note.source), (1, 0, "wrong", "mock"))
        self.assertEqual(note.question["q"], "OX 문제")                           # 문제 내용을 함께 저장한다
        self.assertEqual((note.source_title, note.subject), ("분산시스템 모의고사", "분산시스템"))

    def test_unsure_marks_the_question_wrong_skips_ai_grading_and_records_unknown(self):
        grade = self.submit({"a_0": "O", "u_0": "1", "a_1": "2", "a_3": "서술 답", "u_3": "1"})
        grade.assert_not_called()                                                 # 모르겠음 서술형은 AI를 부르지 않는다
        self.assertEqual(self.exam.results, [False, True, False, False])
        self.assertEqual(self.exam.answers[0], None)                              # 같이 쓴 답은 채점하지 않는다
        self.assertEqual({n.index: n.reason for n in WrongNote.objects.filter(user=self.user)}, {0: "unknown", 2: "wrong", 3: "unknown"})
        res = self.client.get(self.exam.get_absolute_url())
        self.assertContains(res, "모르겠음으로 표시했어요")
        self.assertContains(res, "내 답</b> · <span class=\"mq-plain\">모르겠음")

    def test_exam_page_has_an_unsure_toggle_on_every_question_before_grading(self):
        html = self.client.get(self.exam.get_absolute_url()).content.decode()
        self.assertEqual(html.count('name="u_'), 4)

    def test_grading_twice_does_not_duplicate_notes(self):
        self.submit({"a_0": "X"})
        self.client.post(self.exam.get_absolute_url(), {"a_0": "X"})               # 이미 채점됨
        self.assertEqual(WrongNote.objects.filter(user=self.user, index=0).count(), 1)


class QuizRecordTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="qz", password="pw")
        self.client.force_login(self.user)
        self.doc = PersonalDocument.objects.create(user=self.user, title="OS 자료", file="a.txt", course_name="운영체제", summary_status=ProcessingStatus.DONE)

    def question(self, kind, **kw):
        return GeneratedQuestion.objects.create(document=self.doc, question_type=kind, status=ProcessingStatus.DONE, **kw)

    def answer(self, q, data):
        with patch("core.ai._client") as client:
            res = self.client.post(f"/mypage/{self.doc.pk}/answer/{q.pk}/", data, HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        client.assert_not_called()
        return res

    def test_a_wrong_quiz_answer_goes_to_the_notebook_with_a_converted_snapshot(self):
        q = self.question("mc", question_text="객관식", options=["a", "b", "c", "d"], answer="1", feedback="해설")
        self.assertTrue(self.answer(q, {"user_answer": "3"}).json()["ok"])
        note = WrongNote.objects.get(user=self.user)
        self.assertEqual((note.source, note.source_id, note.reason, note.wrong_count), ("quiz", q.pk, "wrong", 1))
        self.assertEqual(note.question, {"type": "mc", "q": "객관식", "options": ["a", "b", "c", "d"], "answer": 1, "explanation": "해설"})
        self.assertEqual(note.subject, "운영체제")

    def test_a_correct_answer_is_not_recorded(self):
        q = self.question("ox", question_text="OX", answer="O", feedback="해설")
        self.answer(q, {"user_answer": "O"})
        self.assertFalse(WrongNote.objects.exists())

    def test_unknown_button_counts_wrong_without_grading_and_records_unknown(self):
        q = self.question("essay", question_text="서술", answer="모범")
        data = self.answer(q, {"unknown": "1"}).json()
        self.assertEqual((data["ok"], data["is_correct"], data["user_answer"]), (True, False, "모르겠음"))
        q.refresh_from_db()
        self.assertEqual((q.is_correct, q.user_answer), (False, "모르겠음"))
        self.assertEqual(WrongNote.objects.get().reason, "unknown")

    def test_unknown_on_a_short_answer_question(self):
        q = self.question("short", question_text="단답", answer="JOIN | 조인")
        self.answer(q, {"unknown": "1"})
        note = WrongNote.objects.get()
        self.assertEqual(note.question["answers"], ["JOIN", "조인"])

    def test_quiz_forms_have_an_unknown_button(self):
        for kind, extra in (("ox", {"answer": "O"}), ("mc", {"options": ["a", "b"], "answer": "0"}), ("short", {"answer": "x"}), ("essay", {"answer": "x"})):
            GeneratedQuestion.objects.filter(document=self.doc).delete()
            self.question(kind, question_text="문제", **extra)
            html = self.client.get(f"/mypage/{self.doc.pk}/?panel=quiz").content.decode()
            self.assertIn('name="unknown"', html, kind)


class SyncTests(TestCase):
    def test_old_wrong_answers_are_filled_in_once_and_removed_ones_stay_removed(self):
        user = User.objects.create_user(username="sy", password="pw")
        e = make_exam(user, answers=["X", 2, "process", "내 서술"], results=[False, True, True, True], feedback=["", "", "", ""],
                      submitted_at=timezone.now())
        doc = PersonalDocument.objects.create(user=user, title="자료", file="a.txt", course_name="과목", summary_status=ProcessingStatus.DONE)
        GeneratedQuestion.objects.create(document=doc, question_type="ox", question_text="퀴즈", answer="O", user_answer="X", is_correct=False, feedback="e",
                                         status=ProcessingStatus.DONE)
        wrongnotes.sync(user)
        wrongnotes.sync(user)                                                      # 두 번 불러도 하나씩
        self.assertEqual(WrongNote.objects.filter(user=user).count(), 2)
        note = WrongNote.objects.get(user=user, source="mock", source_id=e.pk)
        note.is_removed = True
        note.save()
        wrongnotes.sync(user)
        self.assertEqual(WrongNote.objects.filter(user=user, source="mock").count(), 1)
        self.assertTrue(WrongNote.objects.get(user=user, source="mock").is_removed)    # 제거한 문제는 다시 살아나지 않는다


class AttemptTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="at", password="pw")

    def note(self, index):
        return WrongNote.objects.create(user=self.user, source="mock", source_id=1, index=index, source_title="t", question=QUESTIONS[index], wrong_count=1)

    def test_objective_questions_are_graded_by_the_server_and_counts_accumulate(self):
        n = self.note(1)                                                           # 객관식 정답 2
        r = wrongnotes.attempt(n, answer="2")
        self.assertEqual((r["correct"], r["correct_count"], r["wrong_count"], r["correct_text"]), (True, 1, 1, "3. 다"))
        r = wrongnotes.attempt(n, answer="0")
        self.assertEqual((r["correct"], r["correct_count"], r["wrong_count"]), (False, 1, 2))
        n.refresh_from_db()
        self.assertEqual((n.last_result, n.last_answer, n.is_removed), (False, "0", False))      # 맞혀도 틀려도 사라지지 않는다

    def test_short_and_ox_answers(self):
        self.assertTrue(wrongnotes.attempt(self.note(2), answer=" Process ")["correct"])            # 대소문자·공백 무시
        self.assertFalse(wrongnotes.attempt(self.note(0), answer="X")["correct"])
        self.assertTrue(wrongnotes.attempt(WrongNote.objects.get(index=0), answer="O")["correct"])

    def test_unknown_counts_as_wrong(self):
        n = self.note(0)
        r = wrongnotes.attempt(n, unknown=True)
        self.assertEqual((r["correct"], r["wrong_count"], r["correct_count"]), (False, 2, 0))
        n.refresh_from_db()
        self.assertEqual(n.last_answer, "모르겠음")

    def test_essay_shows_the_model_answer_first_then_counts_the_self_grade(self):
        n = self.note(3)
        first = wrongnotes.attempt(n, answer="내 서술")
        self.assertEqual((first["graded"], first["needs_self_grade"], first["correct_text"]), (False, True, "모범답안 내용"))
        n.refresh_from_db()
        self.assertEqual((n.correct_count, n.wrong_count), (0, 1))                  # 아직 세지 않는다
        done = wrongnotes.attempt(n, answer="내 서술", self_correct=True)
        self.assertEqual((done["graded"], done["correct"], done["correct_count"]), (True, True, 1))
        self.assertEqual(wrongnotes.attempt(n, answer="x", self_correct=False)["wrong_count"], 2)

    def test_empty_answers_are_rejected(self):
        with self.assertRaises(ValueError):
            wrongnotes.attempt(self.note(2), answer="  ")


class WrongNoteViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="vw", password="pw")
        self.other = User.objects.create_user(username="vo", password="pw")
        self.client.force_login(self.user)

    def post(self, url, data=None):
        return self.client.post(url, data=json.dumps(data or {}), content_type="application/json")

    def make(self, user=None, subject="분산시스템", index=1, **kw):
        return WrongNote.objects.create(user=user or self.user, source="mock", source_id=index, index=index, source_title="시험", subject=subject,
                                        question=QUESTIONS[index], wrong_count=1, **kw)

    def test_page_lists_my_notes_with_counts_filters_and_sorting(self):
        a = self.make(subject="분산시스템", index=0)
        b = self.make(subject="운영체제", index=1, correct_count=2)
        WrongNote.objects.filter(pk=a.pk).update(wrong_count=4)
        self.make(user=self.other, subject="남의과목", index=2)
        html = self.client.get("/mypage/wrong/").content.decode()
        self.assertIn("오답노트", html)
        self.assertNotIn("남의과목", html)
        self.assertIn("맞은 횟수", html)
        self.assertIn("틀린 횟수", html)
        self.assertEqual(html.count('class="wn-card'), 2)
        wrong_first = self.client.get("/mypage/wrong/?sort=wrong").content.decode()
        self.assertLess(wrong_first.index("OX 문제"), wrong_first.index("객관식 문제"))      # 4번 틀린 문제가 먼저
        filtered = self.client.get("/mypage/wrong/?subject=운영체제").content.decode()
        self.assertEqual(filtered.count('class="wn-card'), 1)
        self.assertIn(f'data-id="{b.pk}"', filtered)

    def test_answer_endpoint_grades_without_ai_and_updates_counts(self):
        n = self.make(index=1)
        with patch("core.ai._client") as client, patch("mypage.ai.grade_answer") as grade:
            data = self.post(f"/mypage/wrong/{n.pk}/answer/", {"answer": "2"}).json()
        client.assert_not_called()
        grade.assert_not_called()
        self.assertEqual((data["ok"], data["correct"], data["correct_count"], data["wrong_count"], data["correct_text"]), (True, True, 1, 1, "3. 다"))
        self.assertEqual(self.post(f"/mypage/wrong/{n.pk}/answer/", {"unknown": True}).json()["wrong_count"], 2)

    def test_answer_endpoint_validation_and_ownership(self):
        n = self.make(index=2)
        self.assertEqual(self.post(f"/mypage/wrong/{n.pk}/answer/", {"answer": ""}).status_code, 400)
        theirs = self.make(user=self.other, index=0)
        self.assertEqual(self.post(f"/mypage/wrong/{theirs.pk}/answer/", {"answer": "O"}).status_code, 404)
        self.assertEqual(self.post(f"/mypage/wrong/{theirs.pk}/remove/").status_code, 404)
        self.assertEqual(self.client.get(f"/mypage/wrong/{n.pk}/answer/").status_code, 405)

    def test_essay_two_step_flow_over_http(self):
        n = self.make(index=3)
        first = self.post(f"/mypage/wrong/{n.pk}/answer/", {"answer": "내 서술"}).json()
        self.assertEqual((first["needs_self_grade"], first["correct_text"]), (True, "모범답안 내용"))
        done = self.post(f"/mypage/wrong/{n.pk}/answer/", {"answer": "내 서술", "self_correct": True}).json()
        self.assertEqual((done["correct"], done["correct_count"]), (True, 1))

    def test_user_can_remove_a_note_and_it_stays_gone(self):
        n = self.make(index=1)
        self.assertTrue(self.post(f"/mypage/wrong/{n.pk}/remove/").json()["ok"])
        self.assertNotIn(f'data-id="{n.pk}"', self.client.get("/mypage/wrong/").content.decode())
        self.assertEqual(self.post(f"/mypage/wrong/{n.pk}/answer/", {"answer": "2"}).status_code, 404)   # 제거된 문제는 풀 수 없다
        n.refresh_from_db()
        self.assertTrue(n.is_removed)                                              # 지우지 않고 표시만 해 다시 담기지 않게 한다

    def test_correct_answers_never_remove_a_note(self):
        n = self.make(index=1)
        for _ in range(3):
            self.post(f"/mypage/wrong/{n.pk}/answer/", {"answer": "2"})
        n.refresh_from_db()
        self.assertEqual((n.correct_count, n.is_removed), (3, False))
        self.assertIn(f'data-id="{n.pk}"', self.client.get("/mypage/wrong/").content.decode())

    def test_page_opens_by_syncing_old_results_and_never_calls_the_ai(self):
        make_exam(self.user, answers=["X", 2, "x", "y"], results=[False, True, False, True], feedback=["", "", "", ""], submitted_at=timezone.now())
        with patch("core.ai._client") as client:
            html = self.client.get("/mypage/wrong/").content.decode()
        client.assert_not_called()
        self.assertEqual(html.count('class="wn-card'), 2)

    def test_page_has_the_interactive_controls(self):
        self.make(index=0)
        self.make(index=1)
        self.make(index=2)
        self.make(index=3)
        html = self.client.get("/mypage/wrong/").content.decode()
        for marker in ("wn-submit", "wn-unknown", "wn-remove", 'type="radio"', "<textarea", 'type="text"', "js/exam-render.js"):
            self.assertIn(marker, html)

    def test_empty_state_and_login(self):
        self.assertIn("아직 오답노트에 담긴 문제가 없어요", self.client.get("/mypage/wrong/").content.decode())
        self.client.logout()
        self.assertEqual(self.client.get("/mypage/wrong/").status_code, 302)
