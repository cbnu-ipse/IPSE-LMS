from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from mypage.models import PersonalDocument, ProcessingStatus, Subject

from . import topics
from .models import Course, CourseCategory

User = get_user_model()


class TopicsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="uploader", password="pw")
        Subject.objects.update_or_create(name="운영체제", defaults={"description": "프로세스, 스케줄링, 메모리"})

    def doc(self, title="정규화 노트", summary="함수 종속과 정규화 요약", content_hash=""):
        return PersonalDocument.objects.create(user=self.user, title=title, summary=summary, content_hash=content_hash,
                                               summary_status=ProcessingStatus.DONE)

    def test_classify_new_topic_creates_subject_with_description(self):
        d = self.doc()
        with patch("core.ai.complete_json", return_value={"topics": [{"name": "데이터베이스",
                                                                     "description": "관계 모델, SQL, 정규화"}]}) as ai:
            self.assertEqual(topics.classify_document(d), ["데이터베이스"])
        prompt = ai.call_args.args[1][1]["content"]
        self.assertIn("운영체제: 프로세스", prompt)  # 기존 주제를 보고 고른다
        d.refresh_from_db()
        self.assertEqual((d.subject_code, d.is_course_material), ("데이터베이스", True))
        self.assertEqual([t.name for t in d.topics.all()], ["데이터베이스"])
        self.assertEqual(Subject.objects.get(name="데이터베이스").description, "관계 모델, SQL, 정규화")

    def test_existing_topic_keeps_its_description_and_nothing_is_filtered_out(self):
        d = self.doc(title="동아리 회비 공지", summary="회비 납부 안내")
        with patch("core.ai.complete_json", return_value={"usable": False, "topics": [{"name": "운영체제", "description": "덮어쓰면 안 됨"}]}):
            topics.classify_document(d)
        d.refresh_from_db()
        self.assertTrue(d.is_course_material)  # 어떤 자료든 강의에 쓰인다 (AI가 usable=false라 해도 무시)
        self.assertEqual(Subject.objects.get(name="운영체제").description, "프로세스, 스케줄링, 메모리")

    def test_same_file_reuses_classification_without_ai(self):
        first = self.doc(content_hash="abc")
        first.topics.add(Subject.objects.get(name="운영체제"))
        again = self.doc(content_hash="abc")
        with patch("core.ai.complete_json") as ai:
            self.assertEqual(topics.classify_document(again), ["운영체제"])
        ai.assert_not_called()

    def test_after_summary_classifies_but_does_not_build_a_course_draft(self):
        d = self.doc()
        with patch.object(topics, "classify_document", return_value=["운영체제"]), \
                patch("course.studio.build_draft") as build, patch("core.ai.complete_json") as ai:
            self.assertEqual(topics.after_summary(d.pk), ["운영체제"])
        build.assert_not_called()          # 업로드마다 강의 초안을 다시 쓰지 않는다 (하루 한 번 일괄 또는 강의자 버튼)
        ai.assert_not_called()

    def test_daily_batch_builds_drafts_for_every_topic_and_survives_a_failure(self):
        from io import StringIO

        from django.core.management import call_command
        from mypage.models import Subject

        for name in ("데이터베이스", "운영체제", "네트워크"):
            Subject.objects.get_or_create(name=name)
        calls = []

        def fake(name, **kwargs):
            calls.append(name)
            if name == "운영체제":
                raise RuntimeError("api down")
            return type("D", (), {"pk": 7})() if name == "데이터베이스" else None

        out = StringIO()
        with patch("course.studio.build_draft", side_effect=fake):
            call_command("build_course_drafts", stdout=out, stderr=StringIO())
        self.assertEqual(sorted(calls), sorted(Subject.objects.values_list("name", flat=True)))
        skipped = len(calls) - 2
        self.assertIn(f"만듦 1 · 건너뜀(자료 없음/그대로) {skipped} · 실패 1", out.getvalue())

    def test_daily_batch_can_target_one_topic(self):
        from io import StringIO

        from django.core.management import call_command

        with patch("course.studio.build_draft", return_value=None) as build:
            call_command("build_course_drafts", "--topic", "운영체제", stdout=StringIO())
        build.assert_called_once_with("운영체제")

    def test_daily_batch_is_scheduled_in_the_container_crontab(self):
        import os

        from django.conf import settings

        text = open(os.path.join(settings.BASE_DIR, "docker", "crontab"), encoding="utf-8").read()
        self.assertIn("python manage.py build_course_drafts", text)

    def test_one_material_can_create_a_new_course_and_join_an_existing_one(self):
        d = self.doc()
        reply = {"topics": [{"name": "운영체제"}, {"name": "스케줄링 심화", "description": "RR, MLFQ"},
                            {"name": "운영체제"}, {"name": "넷째"}, {"name": "다섯째"}]}
        with patch("core.ai.complete_json", return_value=reply):
            names = topics.classify_document(d)
        self.assertEqual(names, ["운영체제", "스케줄링 심화", "넷째"])    # 중복 제거, 최대 3개
        self.assertEqual({t.name for t in d.topics.all()}, set(names))
        d.refresh_from_db()
        self.assertEqual(d.subject_code, "운영체제")                      # 대표 주제 = 첫 번째
        with patch.object(topics, "classify_document", return_value=names), \
                patch("course.studio.build_draft") as build:
            self.assertEqual(topics.after_summary(d.pk), names)
        build.assert_not_called()
