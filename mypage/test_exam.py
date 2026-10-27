import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from accounts import credits
from core import ai as core_ai
from core.testing import use_up
from course import ai as course_ai
from course import studio, topics
from course.models import Course, CourseCategory

from . import exam
from .models import ExamStyle, MockExam, PersonalDocument, ProcessingStatus, Subject

User = get_user_model()
LECTURE, EXAM = PersonalDocument.DocumentType.LECTURE, PersonalDocument.DocumentType.EXAM

STYLE_JSON = {"mix": {"mc": 0.6, "short": 0.4}, "difficulty": "보기가 길다", "traits": ["함정 보기"],
              "guidelines": "- 객관식 위주로 낸다\n- 보기는 길게 쓴다"}


def make_doc(user, title="d", document_type=LECTURE, professor="", topics_=(), text="본문", summary="요약", **kw):
    doc = PersonalDocument.objects.create(user=user, title=title, document_type=document_type, professor=professor,
                                          extracted_text=text, summary=summary, summary_status=ProcessingStatus.DONE, **kw)
    for name in topics_:
        doc.topics.add(Subject.objects.get_or_create(name=name)[0])
    return doc


class ProfessorStyleTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_professor_name_variants_are_one_professor(self):
        self.assertEqual(exam.professor_key("김 교수님"), exam.professor_key("김교수"))
        self.assertEqual(exam.professor_key("김교수"), exam.professor_key("김"))
        self.assertNotEqual(exam.professor_key("김"), exam.professor_key("이"))

    def test_style_is_shared_across_subjects_of_the_same_professor_and_not_rebuilt_when_unchanged(self):
        make_doc(self.user, "DB 족보", EXAM, "김 교수님", ["데이터베이스"], text="1. 다음 중 옳은 것은?")
        make_doc(self.user, "OS 족보", EXAM, "김교수", ["운영체제"], text="2. 다음 중 옳지 않은 것은?")
        make_doc(self.user, "이교수 족보", EXAM, "이교수", ["운영체제"], text="OX 문제")
        with patch("core.ai.complete_json", return_value=STYLE_JSON) as ai:
            style = exam.refresh_style(professor="김 교수님")
            exam.refresh_style(professor="김교수")                       # 족보가 그대로면 AI를 다시 부르지 않는다
        self.assertEqual(ai.call_count, 1)
        self.assertEqual(style.doc_count, 2)                              # 다른 과목의 족보도 한 스타일로 묶인다
        prompt = ai.call_args.args[1][1]["content"]
        self.assertIn("DB 족보", prompt)
        self.assertIn("OS 족보", prompt)
        self.assertNotIn("이교수 족보", prompt)
        self.assertIsNone(ai.call_args.kwargs.get("user"))                # 시스템 작업이라 크레딧을 받지 않는다
        self.assertEqual(exam.style_for("김 교수", "아무과목"), style)

    def test_style_falls_back_to_subject_when_professor_unknown(self):
        make_doc(self.user, "족보", EXAM, "", ["알고리즘"])
        with patch("core.ai.complete_json", return_value=STYLE_JSON):
            exam.refresh_style(subject="알고리즘")
        self.assertEqual(exam.style_for("", "알고리즘").key, "s:알고리즘")
        self.assertEqual(exam.style_for("박교수", "알고리즘").key, "s:알고리즘")
        self.assertIsNone(exam.style_for("박교수", "다른과목"))

    def test_style_removed_when_exam_docs_are_gone(self):
        doc = make_doc(self.user, "족보", EXAM, "김교수")
        with patch("core.ai.complete_json", return_value=STYLE_JSON):
            exam.refresh_style(professor="김교수")
        doc.delete()
        exam.refresh_style(professor="김교수")
        self.assertFalse(ExamStyle.objects.exists())


class CourseUsesExamStyleTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        self.lecture = make_doc(self.user, "DB 강의", LECTURE, "김교수", ["데이터베이스"], summary="정규화 요약")
        self.exam = make_doc(self.user, "DB 족보", EXAM, "김교수", ["데이터베이스"], summary="유형 요약")
        ExamStyle.objects.create(key="p:김", label="김교수 교수님", guidelines="- 객관식 위주", source_hash="h1", doc_count=1)

    def test_exam_docs_do_not_become_course_material(self):
        self.assertEqual([d["id"] for d in studio.eligible_docs("데이터베이스")], [self.lecture.pk])

    def test_course_generation_ignores_the_exam_style(self):
        # 강의는 올라온 수업 자료만으로 만든다. 교수님 족보 스타일은 내 자료 문제 생성과 모의 출제에만 쓴다
        outline = {"title": "t", "description": "d", "chapters": [{"title": "c", "summary": "", "doc_ids": [self.lecture.pk]}]}
        sets = [{"title": "s", "cards": [{"title": "c", "body": "b"}], "questions": []}]
        with patch.object(course_ai, "generate_outline", return_value=outline), \
                patch.object(course_ai, "generate_chapter", return_value=sets) as chapter:
            draft = studio.build_draft("데이터베이스")
            self.assertIsNotNone(draft)
            self.assertEqual(chapter.call_args.kwargs.get("style", ""), "")
            self.assertIsNone(studio.build_draft("데이터베이스"))        # 같은 입력이면 다시 만들지 않는다
            ExamStyle.objects.update(source_hash="h2")
            self.assertIsNone(studio.build_draft("데이터베이스"))        # 스타일이 바뀌어도 강의는 다시 만들지 않는다

    def test_exam_upload_refreshes_style_and_rebuilds_related_courses(self):
        self.exam.summary = "요약"
        self.exam.save()
        with patch.object(topics, "classify_document", return_value=["데이터베이스"]), \
                patch("mypage.exam.refresh_style") as refresh, patch("course.studio.build_draft") as build:
            topics.after_summary(self.exam.pk)
        refresh.assert_called_once_with(professor="김교수")
        build.assert_called_once_with("데이터베이스")


class ClassifyWithTypedInfoTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_typed_course_name_is_the_topic_and_professor_is_found_by_ai(self):
        doc = make_doc(self.user, course_name="자료구조", text="담당교수 박정수\n트리")
        with patch("core.ai.complete_json", return_value={"topics": [{"name": "AI가 지은 이름"}], "professor": "박정수"}) as ai:
            self.assertEqual(topics.classify_document(doc), ["자료구조"])     # 입력한 과목 이름이 우선
        doc.refresh_from_db()
        self.assertEqual(doc.professor, "박정수")
        self.assertFalse(Subject.objects.filter(name="AI가 지은 이름").exists())
        self.assertEqual(ai.call_count, 1)

    def test_no_ai_when_both_typed(self):
        doc = make_doc(self.user, course_name="자료구조", professor="박정수")
        with patch("core.ai.complete_json") as ai:
            self.assertEqual(topics.classify_document(doc), ["자료구조"])
        ai.assert_not_called()

    def test_blank_professor_stays_blank_when_ai_finds_none(self):
        doc = make_doc(self.user)
        with patch("core.ai.complete_json", return_value={"topics": [{"name": "운영체제"}], "professor": ""}):
            topics.classify_document(doc)
        doc.refresh_from_db()
        self.assertEqual(doc.professor, "")


class UploadAndEditTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="up", password="pw")
        self.client.force_login(self.user)

    def upload(self, **extra):
        data = {"title": "", "file": SimpleUploadedFile("note.txt", ("본문 " * 50).encode()),
                "document_type": "exam", "course_name": "운영체제", "professor": "김교수", **extra}
        with patch("mypage.views.threading.Thread") as thread:
            res = self.client.post("/mypage/", data)
        return res, thread

    def test_upload_saves_type_course_and_professor(self):
        self.upload()
        doc = PersonalDocument.objects.get()
        self.assertEqual((doc.document_type, doc.course_name, doc.professor), ("exam", "운영체제", "김"))   # 직함은 뗀다

    @override_settings(AI_CREDIT_COSTS={"summary": 3, "ocr": 1}, AI_WEEKLY_LIMIT_POINTS=10)
    def test_upload_without_enough_quota_for_whole_document_waits(self):
        use_up(self.user, 6)                                                  # 남은 4: 1조각(3)은 되지만 전체는 모자란다
        text = "\n\n".join("가" * 11000 for _ in range(3))
        with patch("mypage.views.extract_text", return_value=text):
            res, thread = self.upload()
        doc = PersonalDocument.objects.get()
        self.assertEqual(doc.summary_status, ProcessingStatus.PENDING)
        self.assertEqual(doc.extracted_text, text)
        thread.assert_not_called()                                            # AI를 부르지 않았다
        self.assertContains(self.client.get("/mypage/"), "요약 대기")

    @override_settings(AI_CREDIT_COSTS={"summary": 3, "ocr": 1}, AI_WEEKLY_LIMIT_POINTS=10)
    def test_image_needs_ocr_plus_summary_quota(self):
        use_up(self.user, 7)                                                  # 남은 3: OCR 1 + 요약 3 = 4 필요
        with patch("mypage.views.extract_text") as extract:
            res, thread = self.upload(file=SimpleUploadedFile("scan.png", b"x" * 100))
        extract.assert_not_called()
        self.assertFalse(PersonalDocument.objects.exists())

    def test_ocr_cost_follows_file_size(self):
        with override_settings(AI_CREDIT_COSTS={"ocr": 2}):
            self.assertEqual(core_ai.ocr_cost(100), 2)                        # 최소 1MB 분
            self.assertEqual(core_ai.ocr_cost(1_000_000), 2)
            self.assertEqual(core_ai.ocr_cost(1_000_001), 4)                  # 1MB 올림
            self.assertEqual(core_ai.ocr_cost(5_500_000), 12)
        with override_settings(AI_CREDIT_COSTS={"ocr": 0}):
            self.assertEqual(core_ai.ocr_cost(5_000_000), 0)

    def test_info_fields_are_required_and_cannot_be_edited_after_upload(self):
        for missing in ("document_type", "course_name", "professor"):
            data = {"title": "", "file": SimpleUploadedFile("note.txt", b"x" * 100), "document_type": "lecture",
                    "course_name": "운영체제", "professor": "김교수"}
            data.pop(missing)
            res = self.client.post("/mypage/", data, follow=True)
            self.assertContains(res, "모두 입력해주세요")
        self.assertFalse(PersonalDocument.objects.exists())
        doc = make_doc(self.user)
        from django.urls import Resolver404, resolve
        with self.assertRaises(Resolver404):                                          # 올린 뒤 수정 화면은 없다
            resolve(f"/mypage/{doc.pk}/edit/")

    def test_upload_form_has_required_fields_and_confirm_dialog(self):
        html = self.client.get("/mypage/").content.decode()
        self.assertIn('name="document_type"', html)                         # 항상 하나가 선택돼 있는 목록
        for name in ("course_name", "professor"):
            self.assertRegex(html, rf'name="{name}"[^>]*required')
        self.assertIn('id="upload-confirm"', html)                          # 올리기 전 한 번 더 확인
        self.assertIn("올린 뒤에는", html)


@override_settings(AI_CREDIT_COSTS={"mock_exam": 5})
class MockExamTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="taker", password="pw")
        self.client.force_login(self.user)
        category = CourseCategory.objects.create(title="AI 자동 생성")
        self.course = Course.objects.create(code="운영체제", title="운영체제", category=category, instructor=self.user)
        self.doc = make_doc(self.user, "OS 강의", LECTURE, "김교수", ["운영체제"], summary="프로세스는 실행 중인 프로그램이다", course_name="운영체제")
        ExamStyle.objects.create(key="p:김", label="김교수 교수님", guidelines="- 객관식 위주", source_hash="h", doc_count=2)

    QUESTIONS = {"title": "OS 모의고사", "questions": (
        [{"type": "ox", "q": f"OX {i}", "answer": i % 2 == 0, "explanation": "e"} for i in range(3)]
        + [{"type": "mc", "q": f"MC {i}", "options": ["a", "b", "c", "d"], "answer": 1, "explanation": "e"} for i in range(4)]
        + [{"type": "short", "q": f"SH {i}", "answers": ["프로세스"], "explanation": "e"} for i in range(3)])}

    def test_create_charges_credits_and_uses_style(self):
        credits.grant(self.user, 7, "test")
        with patch("core.ai.complete_json", return_value=self.QUESTIONS) as ai:
            res = self.client.post("/mypage/mock/create/", {"ids": [self.doc.pk]})
        self.assertEqual(MockExam.objects.count(), 1)
        mock = MockExam.objects.get()
        self.assertEqual((mock.style_label, len(mock.questions)), ("김교수 교수님", 10))
        self.assertIn("- 객관식 위주", ai.call_args.args[1][1]["content"])
        self.assertIn("프로세스는 실행 중인", ai.call_args.args[1][1]["content"])
        self.assertRedirects(res, mock.get_absolute_url())

    @override_settings(AI_WEEKLY_LIMIT_POINTS=100)
    def test_create_over_the_weekly_limit_is_blocked(self):
        use_up(self.user, 101)
        with patch("core.ai.complete_json") as ai:
            res = self.client.post("/mypage/mock/create/", {"ids": [self.doc.pk]}, follow=True)
        ai.assert_not_called()
        self.assertFalse(MockExam.objects.exists())
        self.assertContains(res, "이번 주 AI 사용 한도를 다 썼어요")

    def test_too_few_valid_questions_makes_no_exam(self):
        bad = {"title": "t", "questions": [{"type": "essay", "q": "서술"}, {"type": "ox", "q": "ok", "answer": True}]}
        with patch("core.ai.complete_json", return_value=bad):
            res = self.client.post("/mypage/mock/create/", {"ids": [self.doc.pk]}, follow=True)
        self.assertFalse(MockExam.objects.exists())
        self.assertContains(res, "쓸 만한 문제를 충분히 만들지 못했습니다")

    def test_take_and_grade_on_server(self):
        credits.grant(self.user, 5, "test")
        with patch("core.ai.complete_json", return_value=self.QUESTIONS):
            self.client.post("/mypage/mock/create/", {"ids": [self.doc.pk]})
        mock = MockExam.objects.get()
        page = self.client.get(mock.get_absolute_url())
        self.assertContains(page, "제출하고 채점하기")
        answers = {}
        for i, q in enumerate(mock.questions):
            if q["type"] == "ox":
                answers[f"a_{i}"] = "O" if q["answer"] else "X"                  # 맞게 제출
            elif q["type"] == "mc":
                answers[f"a_{i}"] = str(q["answer"])
            else:
                answers[f"a_{i}"] = "틀린 답" if i == len(mock.questions) - 1 else "프로세스"
        res = self.client.post(mock.get_absolute_url(), answers, follow=True)
        mock.refresh_from_db()
        self.assertEqual(sum(mock.results), 9)
        self.assertContains(res, "9 / 10점")
        self.client.post(mock.get_absolute_url(), {})                             # 다시 제출해도 점수가 바뀌지 않는다
        mock.refresh_from_db()
        self.assertEqual(sum(mock.results), 9)

    ESSAY_QUESTIONS = {"title": "t", "questions": (
        [{"type": "mc", "q": f"MC {i}", "options": ["a", "b", "c", "d"], "answer": 1, "explanation": "e"} for i in range(4)]
        + [{"type": "essay", "q": f"ES {i}", "answer": "프로세스는 실행 중인 프로그램이다", "explanation": ""} for i in range(2)]
        + [{"type": "essay", "q": "답 없음", "answer": ""}])}

    def make_exam(self):
        from . import exam as exam_module
        questions = [q for q in map(exam_module._normalize_mock_question, self.ESSAY_QUESTIONS["questions"]) if q]
        return MockExam.objects.create(user=self.user, course_code="운영체제", questions=questions)

    def test_essay_without_model_answer_is_dropped_but_valid_essay_is_kept(self):
        mock = self.make_exam()
        self.assertEqual([q["type"] for q in mock.questions].count("essay"), 2)

    @override_settings(AI_CREDIT_COSTS={"mock_exam": 5, "grading": 2})
    def test_essay_is_graded_by_ai_only_for_answered_essays(self):
        mock = self.make_exam()
        page = self.client.get(mock.get_absolute_url())
        self.assertContains(page, "서술형 2문항")
        self.assertContains(page, "이번 주 AI 사용량이 늘어요")
        answers = {f"a_{i}": ("1" if q["type"] == "mc" else "") for i, q in enumerate(mock.questions)}
        answers["a_4"] = "프로세스는 실행 중인 프로그램"                             # 서술형 2개 중 하나만 답한다
        with patch("mypage.ai.grade_answer", return_value={"is_correct": True, "feedback": "핵심을 짚었어요"}) as grade:
            res = self.client.post(mock.get_absolute_url(), answers, follow=True)
        grade.assert_called_once()                                                  # 빈 답은 AI를 부르지 않는다
        mock.refresh_from_db()
        self.assertEqual(mock.feedback[4], "핵심을 짚었어요")
        self.assertEqual(mock.feedback[5], "답을 쓰지 않았습니다.")
        self.assertContains(res, "모범답안")
        self.assertContains(res, "핵심을 짚었어요")

    @override_settings(AI_CREDIT_COSTS={"mock_exam": 5, "grading": 2}, AI_WEEKLY_LIMIT_POINTS=100)
    def test_essay_grading_blocked_over_the_weekly_limit_and_answers_are_kept(self):
        use_up(self.user, 99)                                                      # 남은 1 < 채점 예상 2
        mock = self.make_exam()
        answers = {f"a_{i}": "" for i in range(len(mock.questions))}
        answers["a_4"] = "내가 쓴 긴 답안"
        with patch("mypage.ai.grade_answer") as grade:
            res = self.client.post(mock.get_absolute_url(), answers)
        grade.assert_not_called()
        self.assertContains(res, "서술형 채점을 할 수 없습니다")
        self.assertContains(res, "내가 쓴 긴 답안")                                  # 다시 쓰지 않아도 되게 답을 돌려준다
        mock.refresh_from_db()
        self.assertIsNone(mock.submitted_at)

    @override_settings(AI_CREDIT_COSTS={"mock_exam": 5, "grading": 2})
    def test_grading_failure_marks_wrong_and_keeps_going(self):
        credits.grant(self.user, 10, "test")
        mock = self.make_exam()
        answers = {f"a_{i}": "" for i in range(len(mock.questions))}
        answers["a_4"] = "답"
        with patch("mypage.ai.grade_answer", side_effect=RuntimeError("api down")):
            self.client.post(mock.get_absolute_url(), answers)
        mock.refresh_from_db()
        self.assertIsNotNone(mock.submitted_at)
        self.assertFalse(mock.results[4])
        self.assertIn("채점하지 못했습니다", mock.feedback[4])

    def test_others_cannot_open_my_exam(self):
        mock = MockExam.objects.create(user=self.user, course_code="운영체제", questions=[])
        other = User.objects.create_user(username="other", password="pw")
        self.client.force_login(other)
        self.assertEqual(self.client.get(mock.get_absolute_url()).status_code, 403)

    def test_course_page_no_longer_offers_mock_exam_or_style(self):
        response = self.client.get(f"/course/{self.course.slug}/")
        self.assertNotContains(response, "모의 출제")
        self.assertNotContains(response, "김교수 교수님")

    def test_personal_tab_offers_mock_exam_for_lecture_documents_only(self):
        make_doc(self.user, "OS 족보", EXAM, "김교수", ["운영체제"], summary="족보 요약")
        html = self.client.get("/mypage/").content.decode()
        self.assertIn('id="mock-toggle"', html)
        self.assertEqual(html.count('data-doc-type="lecture"'), 1)
        self.assertEqual(html.count('data-doc-type="exam"'), 1)             # 족보는 카드에 표시만 되고 모의 출제에서는 고를 수 없다 (화면에서 흐리게)

    def test_exam_documents_and_other_users_documents_cannot_be_sources(self):
        credits.grant(self.user, 10, "test")
        exam_doc = make_doc(self.user, "족보", EXAM, "김교수", ["운영체제"], summary="족보 요약")
        other = User.objects.create_user(username="o2", password="pw")
        foreign = make_doc(other, "남의 자료", LECTURE, "김교수", ["운영체제"], summary="남의 요약")
        with patch("core.ai.complete_json") as ai:
            res = self.client.post("/mypage/mock/create/", {"ids": [exam_doc.pk, foreign.pk]}, follow=True)
        ai.assert_not_called()
        self.assertFalse(MockExam.objects.exists())
        self.assertContains(res, "수업 자료를 하나 이상 골라주세요")

    def test_style_comes_from_the_selected_documents_professor(self):
        ExamStyle.objects.create(key="p:이", label="이교수 교수님", guidelines="- 서술형 위주", source_hash="h2", doc_count=1)
        lee = make_doc(self.user, "이교수 자료", LECTURE, "이교수", ["운영체제"], summary="스케줄링", course_name="운영체제")
        credits.grant(self.user, 10, "test")
        with patch("core.ai.complete_json", return_value=self.QUESTIONS) as ai:
            self.client.post("/mypage/mock/create/", {"ids": [lee.pk]})
        self.assertEqual(MockExam.objects.get().style_label, "이교수 교수님")
        self.assertIn("- 서술형 위주", ai.call_args.args[1][1]["content"])
        self.assertNotIn("- 객관식 위주", ai.call_args.args[1][1]["content"])


class ExamSummaryTests(TestCase):
    def test_exam_documents_use_the_exam_summary_prompt(self):
        from .ai import EXAM_SUMMARY_INSTRUCTIONS, SUMMARY_INSTRUCTIONS, generate_summary
        user = User.objects.create_user(username="s", password="pw")
        with patch("core.ai.complete", return_value="요약") as complete:
            generate_summary("1. 다음 중 옳은 것은?", user=user, kind="exam")
            generate_summary("본문", user=user)
        self.assertEqual(complete.call_args_list[0].args[1][0]["content"], EXAM_SUMMARY_INSTRUCTIONS)
        self.assertEqual(complete.call_args_list[1].args[1][0]["content"], SUMMARY_INSTRUCTIONS)
