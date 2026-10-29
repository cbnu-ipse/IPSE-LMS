from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from .models import MockExam, WrongNote

User = get_user_model()


def make_exam(user):
    questions = [
        {"type": "short", "q": "고유 문제 하나", "answers": ["정답"], "explanation": ""},
        {"type": "essay", "q": "고유 문제 둘", "answer": "모범답안", "explanation": ""},
    ]
    return MockExam.objects.create(
        user=user, course_code="선형대수", title="t", questions=questions, answers=["오답", "내 서술"], results=[False, True],
        feedback=["", "좋아요."], submitted_at=timezone.now())


class SelfMarkTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="m", password="pw")
        self.client.force_login(self.user)
        self.exam = make_exam(self.user)
        WrongNote.objects.create(user=self.user, source="mock", source_id=self.exam.pk, index=0, question=self.exam.questions[0], wrong_count=1)

    def mark(self, index, value, exam=None):
        return self.client.post(reverse("mypage:mock_mark", args=[(exam or self.exam).pk, index]), {"correct": value})

    def test_mark_correct_updates_score_and_removes_wrong_note(self):
        res = self.mark(0, "1")
        self.assertEqual(res.json(), {"ok": True, "correct": True, "score": 2, "total": 2})
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.results, [True, True])
        self.assertIn("직접 맞아요로 바꿨어요.", self.exam.feedback[0])
        self.assertFalse(WrongNote.objects.filter(source_id=self.exam.pk, index=0).exists())

    def test_mark_wrong_adds_wrong_note_and_marker_is_not_duplicated(self):
        self.mark(1, "0")
        self.mark(1, "1")
        self.mark(1, "0")
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.results, [False, False])
        self.assertEqual(self.exam.feedback[1].count("직접"), 1)
        self.assertTrue(WrongNote.objects.filter(source_id=self.exam.pk, index=1).exists())

    def test_same_value_adds_no_marker(self):
        self.mark(0, "0")
        self.exam.refresh_from_db()
        self.assertNotIn("직접", self.exam.feedback[0])

    def test_rejects_other_user_unsubmitted_bad_index_and_bad_value(self):
        self.assertEqual(self.mark(5, "1").status_code, 400)
        self.assertEqual(self.mark(0, "maybe").status_code, 400)
        draft = MockExam.objects.create(user=self.user, course_code="x", title="d", questions=self.exam.questions)
        self.assertEqual(self.mark(0, "1", draft).status_code, 400)
        other = User.objects.create_user(username="o", password="pw")
        self.client.force_login(other)
        self.assertEqual(self.mark(0, "1").status_code, 404)

    def test_page_shows_mark_buttons_math_answer_and_preview(self):
        res = self.client.get(self.exam.get_absolute_url())
        self.assertContains(res, 'class="mark-btn')
        self.assertContains(res, "data-wrap")
        draft = MockExam.objects.create(user=self.user, course_code="x", title="d", questions=self.exam.questions)
        self.assertContains(self.client.get(draft.get_absolute_url()), "math-preview")
