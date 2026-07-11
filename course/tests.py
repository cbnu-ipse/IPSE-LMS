from django.contrib.auth import get_user_model
from django.test import TestCase

from mypage.models import Subject

from .models import Lesson
from .services import sync_course_from_draft

User = get_user_model()


class SyncCourseFromDraftTests(TestCase):
    def setUp(self):
        User.objects.create_superuser(username="admin", password="pw", email="a@a.com")
        self.draft = {
            "title": "자료구조",
            "description": "스택/큐/트리 개요",
            "units": [
                {
                    "title": "1단원",
                    "lessons": [{"title": "스택과 큐", "content": "## 스택\n\n스택은 ..."}],
                }
            ],
        }

    def test_lesson_content_uses_content_key(self):
        course, created, lesson_count = sync_course_from_draft("CS101", self.draft)

        self.assertTrue(created)
        self.assertEqual(lesson_count, 1)
        lesson = Lesson.objects.get(course=course)
        self.assertEqual(lesson.content, "## 스택\n\n스택은 ...")

    def test_title_uses_subject_code_and_name_when_code_present(self):
        Subject.objects.create(name="자료구조", code="CS101")

        course, _, _ = sync_course_from_draft("자료구조", self.draft)

        self.assertEqual(course.title, "CS101(자료구조)")

    def test_title_falls_back_to_subject_code_arg_when_no_code(self):
        Subject.objects.create(name="자료구조")

        course, _, _ = sync_course_from_draft("자료구조", self.draft)

        self.assertEqual(course.title, "자료구조")
