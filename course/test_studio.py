import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from mypage.models import PersonalDocument, ProcessingStatus

from . import ai as course_ai
from . import markup, studio
from .models import Course, CourseDraft, Lesson, LessonQuizResult, UserCourseProgress

User = get_user_model()

SETS = [{
    "title": "조인 기초",
    "cards": [{"title": "JOIN", "body": "**JOIN**은 짝이 있는 행만 남긴다.\n- 짝 없는 행은 버림\n| a | b |\n|---|---|\n| 1 | 2 |"},
              {"title": "LEFT JOIN", "body": "왼쪽 행은 모두 남긴다. `COUNT(s.id)`"}],
    "questions": [
        {"type": "ox", "q": "JOIN은 짝 없는 행도 남긴다.", "answer": False, "explanation": "버린다."},
        {"type": "mc", "q": "왼쪽을 남기는 조인은?", "options": ["LEFT JOIN", "JOIN", "CROSS"], "answer": 0, "explanation": "LEFT"},
        {"type": "short", "q": "NULL을 세지 않는 집계는?", "answers": ["COUNT(열)", "count 열"], "explanation": "열을 셈"},
    ],
}]


def outline_for(docs, titles=("조인",)):
    ids = [d.pk for d in docs]
    return {"title": "DB", "description": "데이터베이스 기초",
            "chapters": [{"title": t, "summary": "", "doc_ids": ids} for t in titles]}


class StudioBase(TestCase):
    databases = {"default", "beta_judge"}  # 수업 화면이 랭킹 지표(judge DB)를 갱신한다

    def setUp(self):
        self.lecturer = User.objects.create_user(username="lec", password="pw", is_lecturer=True)
        self.lecturer2 = User.objects.create_user(username="lec2", password="pw", is_lecturer=True)
        self.student = User.objects.create_user(username="stu", password="pw", is_student=True)
        self.docs = [self.doc(i) for i in range(3)]

    def doc(self, i, summary=None):
        return PersonalDocument.objects.create(user=self.student, title=f"자료{i}", subject_code="DB101",
                                               summary=summary or f"요약 {i}", summary_status=ProcessingStatus.DONE)

    def build(self, titles=("조인",), sets=SETS):
        with patch.object(course_ai, "generate_outline", return_value=outline_for(self.docs, titles)) as outline, \
                patch.object(course_ai, "generate_chapter", return_value=sets) as chapter:
            draft = studio.build_draft("DB101")
        return draft, outline, chapter


class MarkupAndNormalizeTestCase(TestCase):
    def test_markup_escapes_html_and_renders_subset(self):
        html = markup.render("<script>alert(1)</script> **굵게** `a<b`\n- 항목\n  - 하위\n| x | y |\n|---|---|\n| 1 | 2 |\n```\nSELECT 1;\n```")
        self.assertNotIn("<script>", html)
        self.assertIn("&lt;script&gt;", html)
        self.assertIn("<strong>굵게</strong>", html)
        self.assertIn("<code>a&lt;b</code>", html)
        self.assertIn("<li class=lc-sub>하위</li>", html)
        self.assertIn("<th>x</th>", html)
        self.assertIn("<td>2</td>", html)
        self.assertIn('<pre class="lc-pre"><code>SELECT 1;</code></pre>', html)

    def test_normalize_drops_invalid_questions(self):
        sets = course_ai.normalize_sets([{
            "title": "세트", "cards": [{"title": "t", "body": "b"}, {"title": "빈 카드", "body": ""}],
            "questions": [
                {"type": "mc", "q": "보기 부족", "options": ["하나"], "answer": 0},
                {"type": "mc", "q": "정답 번호 범위 밖", "options": ["a", "b"], "answer": 5},
                {"type": "ox", "q": "문자열 정답", "answer": "O"},
                {"type": "short", "q": "정답 없음", "answers": []},
                {"type": "essay", "q": "지원 안 함"},
            ],
        }, {"title": "카드 없는 세트", "cards": []}])
        self.assertEqual(len(sets), 1)
        self.assertEqual(len(sets[0]["cards"]), 1)
        self.assertEqual(sets[0]["questions"], [{"type": "ox", "q": "문자열 정답", "answer": True, "explanation": ""}])


class BuildDraftTestCase(StudioBase):
    def test_no_course_material_no_ai(self):
        PersonalDocument.objects.update(is_course_material=False)  # AI가 강의 자료가 아니라고 본 자료
        draft, outline, _ = self.build()
        self.assertIsNone(draft)
        outline.assert_not_called()

    def test_draft_created_pending_without_publishing(self):
        draft, outline, chapter = self.build(titles=("조인", "집계"))
        self.assertEqual(draft.status, CourseDraft.Status.PENDING)
        self.assertEqual(len(draft.content["chapters"]), 2)
        self.assertEqual(chapter.call_count, 2)
        self.assertFalse(Course.objects.exists())

    def test_same_inputs_never_call_ai_again(self):
        self.build()
        draft, outline, chapter = self.build()
        self.assertIsNone(draft)
        outline.assert_not_called()
        chapter.assert_not_called()
        # 반려된 초안과 같은 입력이어도 다시 만들지 않는다
        CourseDraft.objects.update(status=CourseDraft.Status.REJECTED)
        self.assertIsNone(self.build()[0])

    def test_unchanged_chapters_are_reused_after_new_material(self):
        first, _, _ = self.build(titles=("조인",))
        studio.publish_draft(first.pk, self.lecturer)
        new_doc = self.doc(99, "새 자료 요약")
        outline = {"title": "DB", "description": "d", "chapters": [
            {"title": "조인", "summary": "", "doc_ids": [d.pk for d in self.docs]},   # 근거 그대로
            {"title": "인덱스", "summary": "", "doc_ids": [new_doc.pk]},              # 새 챕터
        ]}
        with patch.object(course_ai, "generate_outline", return_value=outline), \
                patch.object(course_ai, "generate_chapter", return_value=SETS) as chapter:
            second = studio.build_draft("DB101")
        self.assertEqual(chapter.call_count, 1)  # 새 챕터만 AI로
        self.assertEqual(chapter.call_args.args[1]["title"], "인덱스")
        self.assertEqual([c["reused"] for c in second.content["chapters"]], [True, False])
        self.assertEqual(second.course_id, Course.objects.get(code="DB101").pk)  # 게시된 강의를 바꾸는 초안

    def test_failure_marks_failed_and_allows_retry(self):
        with patch.object(course_ai, "generate_outline", side_effect=RuntimeError("api down")):
            self.assertIsNone(studio.build_draft("DB101"))
        failed = CourseDraft.objects.get()
        self.assertEqual((failed.status, failed.source_hash), (CourseDraft.Status.FAILED, ""))
        draft, _, _ = self.build()
        self.assertEqual(draft.status, CourseDraft.Status.PENDING)

    def test_concurrent_duplicate_is_skipped(self):
        draft, _, _ = self.build()
        CourseDraft.objects.filter(pk=draft.pk).update(status=CourseDraft.Status.GENERATING)
        self.assertIsNone(self.build()[0])  # 같은 입력으로 만드는 중이면 건너뛴다


class ReviewAndPublishTestCase(StudioBase):
    def test_lecturer_approves_without_ai_and_becomes_instructor(self):
        draft, _, _ = self.build()
        self.client.force_login(self.lecturer)
        with patch("core.ai._client") as client:
            res = self.client.post(reverse("course_studio_action", args=[draft.pk, "approve"]))
        client.assert_not_called()  # 게시할 때 AI를 다시 부르지 않는다
        course = Course.objects.get(code="DB101")
        self.assertRedirects(res, course.get_absolute_url(), fetch_redirect_response=False)
        self.assertEqual(course.instructor, self.lecturer)
        lesson = Lesson.objects.get(course=course)
        self.assertEqual((lesson.unit.title, lesson.title, len(lesson.cards), len(lesson.questions)),
                         ("조인", "조인 기초", 2, 3))
        self.assertIn("## JOIN", lesson.content)
        with self.assertRaises(ValueError):  # 두 번 눌러도 한 번만 게시
            studio.publish_draft(draft.pk, self.lecturer)

    def test_students_cannot_use_studio(self):
        draft, _, _ = self.build()
        self.client.force_login(self.student)
        self.assertEqual(self.client.get(reverse("course_studio")).status_code, 403)
        self.assertEqual(self.client.get(reverse("course_studio_preview", args=[draft.pk, 0, 0])).status_code, 403)
        self.assertEqual(self.client.post(reverse("course_studio_action", args=[draft.pk, "approve"])).status_code, 403)
        self.assertFalse(Course.objects.exists())

    def test_update_draft_only_instructor_can_approve_and_progress_is_kept(self):
        first, _, _ = self.build()
        course = studio.publish_draft(first.pk, self.lecturer)
        lesson = Lesson.objects.get(course=course)
        progress = UserCourseProgress.objects.create(user=self.student, course=course)
        progress.completed_lessons.add(lesson)

        self.docs.append(self.doc(50, "추가 자료"))  # 이 챕터의 근거 자료가 바뀌었다 → 챕터를 다시 만든다
        changed = [dict(SETS[0], cards=[{"title": "JOIN", "body": "고친 설명"}])]
        update, _, _ = self.build(sets=changed)
        self.assertTrue(update.is_update)
        self.assertFalse(studio.can_review(self.lecturer2, update))
        with self.assertRaises(PermissionError):
            studio.publish_draft(update.pk, self.lecturer2)
        self.assertEqual(Lesson.objects.get(pk=lesson.pk).cards[0]["body"], SETS[0]["cards"][0]["body"])  # 승인 전 그대로

        studio.publish_draft(update.pk, self.lecturer)
        lesson.refresh_from_db()
        self.assertEqual(lesson.cards[0]["body"], "고친 설명")
        self.assertIn(lesson, progress.completed_lessons.all())  # 같은 세트는 고쳐 써서 진도가 남는다

    def test_reject(self):
        draft, _, _ = self.build()
        self.client.force_login(self.lecturer)
        self.client.post(reverse("course_studio_action", args=[draft.pk, "reject"]), {"note": "내용 부족"})
        draft.refresh_from_db()
        self.assertEqual((draft.status, draft.review_note, draft.reviewed_by), ("rejected", "내용 부족", self.lecturer))
        self.assertFalse(Course.objects.exists())

    def test_edit_card_and_questions_before_approval(self):
        draft, _, _ = self.build()
        self.client.force_login(self.lecturer)
        url = lambda action: reverse("course_studio_action", args=[draft.pk, action])
        self.client.post(url("edit_card"), {"chapter": 0, "set": 0, "item": 1, "title": "왼쪽 조인", "body": "새 본문"})
        self.client.post(url("edit_question"), {"chapter": 0, "set": 0, "item": 1, "type": "mc", "q": "고친 문제",
                                                "options": "A\nB\nC", "answer": "2", "explanation": "B"})
        res = self.client.post(url("edit_question"), {"chapter": 0, "set": 0, "item": 0, "type": "mc", "q": "잘못",
                                                      "options": "A", "answer": "3"}, follow=True)
        self.assertContains(res, "문제 형식이 올바르지 않습니다")
        self.client.post(url("delete_question"), {"chapter": 0, "set": 0, "item": 2})
        draft.refresh_from_db()
        s = draft.content["chapters"][0]["sets"][0]
        self.assertEqual(s["cards"][1], {"title": "왼쪽 조인", "body": "새 본문"})
        self.assertEqual((s["questions"][1]["options"], s["questions"][1]["answer"]), (["A", "B", "C"], 1))
        self.assertEqual(len(s["questions"]), 2)

    def test_direct_lesson_edit_is_blocked_and_edit_draft_flow(self):
        draft, _, _ = self.build()
        course = studio.publish_draft(draft.pk, self.lecturer)
        lesson = Lesson.objects.get(course=course)
        self.client.force_login(self.lecturer)
        self.client.post(reverse("lesson_edit", args=[course.slug, lesson.pk]), {"title": "몰래", "content": "몰래 고침"})
        self.assertEqual(Lesson.objects.get(pk=lesson.pk).title, "조인 기초")

        res = self.client.post(reverse("course_studio_start_edit", args=[course.slug]))
        edit = CourseDraft.objects.get(created_by=self.lecturer)
        self.assertRedirects(res, reverse("course_studio_detail", args=[edit.pk]), fetch_redirect_response=False)
        self.assertEqual(studio.changed_chapters(edit), set())  # 아직 바뀐 게 없으면 승인 버튼이 꺼진다
        self.assertContains(self.client.get(reverse("course_studio_detail", args=[edit.pk])), "달라진 내용이 없습니다")
        studio.update_card(edit.pk, 0, 0, 0, "JOIN", "강의자가 직접 고침")
        self.assertEqual(studio.changed_chapters(edit.__class__.objects.get(pk=edit.pk)), {0})
        studio.publish_draft(edit.pk, self.lecturer)
        self.assertEqual(Lesson.objects.get(pk=lesson.pk).cards[0]["body"], "강의자가 직접 고침")


class LearnerTestCase(StudioBase):
    def setUp(self):
        super().setUp()
        draft, _, _ = self.build()
        self.course = studio.publish_draft(draft.pk, self.lecturer)
        self.lesson = Lesson.objects.get(course=self.course)
        self.client.force_login(self.student)

    def test_set_player_renders_cards_and_course_shows_chapters(self):
        res = self.client.get(self.lesson.get_absolute_url())
        self.assertContains(res, "<strong>JOIN</strong>")
        self.assertContains(res, "확인 문제")
        self.assertContains(res, 'id="questions-data"')
        page = self.client.get(self.course.get_absolute_url())
        self.assertContains(page, "1강</span>조인")
        self.assertContains(page, "조인 기초")

    def test_quiz_is_graded_on_server(self):
        url = reverse("lesson_quiz_submit", args=[self.course.slug, self.lesson.pk])
        res = self.client.post(url, data=json.dumps({"answers": [False, 1, "count(열)"]}),
                               content_type="application/json").json()
        self.assertEqual((res["results"], res["correct"], res["total"]), ([True, False, True], 2, 3))
        result = LessonQuizResult.objects.get(user=self.student, lesson=self.lesson)
        self.assertEqual((result.correct, result.wrong), (2, [1]))
        self.assertIn(self.lesson, UserCourseProgress.objects.get(user=self.student).completed_lessons.all())
        page = self.client.get(self.course.get_absolute_url())
        self.assertContains(page, "2/3")
        bad = self.client.post(url, data=json.dumps({"answers": "nope"}), content_type="application/json")
        self.assertEqual(bad.status_code, 400)

    def test_preview_for_lecturer_does_not_save(self):
        draft = CourseDraft.objects.get()
        self.client.force_login(self.lecturer)
        res = self.client.get(reverse("course_studio_preview", args=[draft.pk, 0, 0]))
        self.assertContains(res, "미리보기")
        self.assertNotContains(res, "/quiz/")  # 저장 주소가 없다

    def test_studio_tab_only_for_lecturers(self):
        self.assertNotContains(self.client.get(reverse("course_list")), "강의 생성")
        self.client.force_login(self.lecturer)
        self.assertContains(self.client.get(reverse("course_list")), "강의 생성")
        self.assertEqual(self.client.get(reverse("course_studio")).status_code, 200)


class TopicOverviewTestCase(StudioBase):
    def stage(self):
        topics, _ = studio.topic_overview()
        return {t["name"]: t["stage"] for t in topics}["DB101"]

    def test_stage_moves_from_waiting_to_pending_to_published(self):
        PersonalDocument.objects.filter(subject_code="DB101").update(is_course_material=True)
        self.assertEqual(self.stage(), "waiting")  # 자료는 있고 초안은 아직 없음 = 생성 직전
        CourseDraft.objects.create(subject_code="DB101", status=CourseDraft.Status.GENERATING, source_hash="g")
        self.assertEqual(self.stage(), "generating")
        CourseDraft.objects.all().delete()
        draft, _, _ = self.build()
        self.assertEqual(self.stage(), "pending")
        studio.publish_draft(draft.pk, self.lecturer)
        self.assertEqual(self.stage(), "published")

    def test_topic_page_shows_docs_summaries_and_chapter_sources(self):
        PersonalDocument.objects.filter(subject_code="DB101").update(is_course_material=True)
        self.build()
        self.client.force_login(self.lecturer)
        res = self.client.get(reverse("course_studio_topic"), {"name": "DB101"})
        self.assertContains(res, "자료0")
        self.assertContains(res, "요약 1")
        self.assertContains(res, "조인")           # 챕터 제목
        self.assertContains(res, "근거:")
        self.assertContains(self.client.get(reverse("course_studio")), "주제별 현황")

    def test_topic_page_is_lecturer_only(self):
        self.client.force_login(self.student)
        self.assertEqual(self.client.get(reverse("course_studio_topic"), {"name": "DB101"}).status_code, 403)
        self.assertEqual(self.client.post(reverse("course_studio_topic_build"), {"name": "DB101"}).status_code, 403)
