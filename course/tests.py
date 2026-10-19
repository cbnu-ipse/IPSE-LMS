from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from mypage.models import Subject

from .models import Course, CourseCategory, CourseDraft, Lesson
from .services import queue_legacy_draft
from .studio import course_title

User = get_user_model()


class LegacyDraftTests(TestCase):
    """예전 형식 초안(review_queue.json)은 바로 게시하지 않고 검토 대기 초안이 된다."""

    def setUp(self):
        self.draft = {
            "title": "자료구조",
            "description": "스택/큐/트리 개요",
            "units": [{"title": "1단원", "lessons": [{"title": "스택과 큐", "content": "## 스택\n\n스택은 ...\n---\n## 큐"}]}],
        }

    def test_queued_as_pending_draft_not_published(self):
        created, draft = queue_legacy_draft("CS101", self.draft)
        self.assertTrue(created)
        self.assertEqual(draft.status, CourseDraft.Status.PENDING)
        self.assertFalse(Course.objects.exists())
        cards = draft.content["chapters"][0]["sets"][0]["cards"]
        self.assertEqual([c["body"] for c in cards], ["## 스택\n\n스택은 ...", "## 큐"])
        self.assertFalse(queue_legacy_draft("CS101", self.draft)[0])  # 같은 내용은 한 번만

    def test_title_uses_subject_code_and_name_when_code_present(self):
        Subject.objects.create(name="자료구조", code="CS101")
        self.assertEqual(course_title("자료구조"), "CS101(자료구조)")

    def test_title_falls_back_to_subject_code_arg_when_no_code(self):
        Subject.objects.create(name="자료구조")
        self.assertEqual(course_title("자료구조"), "자료구조")


class CourseListCardTests(TestCase):
    def test_card_hides_category_badge_and_instructor_status(self):
        instructor = User.objects.create_user(username="lecturer", password="pw", is_lecturer=True)
        category = CourseCategory.objects.get_or_create(title="AI 자동 생성")[0]
        Course.objects.create(code="CS999", title="테스트 강의", category=category, instructor=instructor)
        student = User.objects.create_user(username="student", password="pw", is_student=True)
        self.client.force_login(student)

        response = self.client.get(reverse("course_list"))

        self.assertContains(response, "테스트 강의")
        self.assertNotContains(response, "보유 중")
        self.assertNotContains(response, "학습 완료")
