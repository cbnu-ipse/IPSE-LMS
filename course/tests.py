from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Lesson
from .services import sync_course_from_draft

User = get_user_model()


class SyncCourseFromDraftTests(TestCase):
    def test_lesson_content_uses_content_key(self):
        User.objects.create_superuser(username="admin", password="pw", email="a@a.com")
        draft = {
            "title": "자료구조",
            "description": "스택/큐/트리 개요",
            "units": [
                {
                    "title": "1단원",
                    "lessons": [{"title": "스택과 큐", "content": "## 스택\n\n스택은 ..."}],
                }
            ],
        }

        course, created, lesson_count = sync_course_from_draft("CS101", draft)

        self.assertTrue(created)
        self.assertEqual(lesson_count, 1)
        lesson = Lesson.objects.get(course=course)
        self.assertEqual(lesson.content, "## 스택\n\n스택은 ...")
