from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from course import ai as course_ai
from course import studio, topics
from course.models import Course, CourseCategory

from . import exam, naming, ontology
from .models import (Concept, DocumentConcept, ExamQuestion, ExamStyle, PersonalDocument, Professor, ProcessingStatus,
                     Subject, SubjectAlias)

User = get_user_model()
LECTURE, EXAM = PersonalDocument.DocumentType.LECTURE, PersonalDocument.DocumentType.EXAM

SUMMARY = ("## 프로세스\n프로세스는 실행 중인 프로그램이다.\n\n## 스케줄링\nCPU 스케줄링 방식을 비교한다.\n\n"
           "## 페이징\n페이지 테이블로 주소를 변환한다.\n")


def make_doc(user, subject, title="d", document_type=LECTURE, professor="", summary=SUMMARY, text="본문", **kw):
    doc = PersonalDocument.objects.create(user=user, title=title, document_type=document_type, professor=professor,
                                          course_name=subject.name, extracted_text=text, summary=summary,
                                          summary_status=ProcessingStatus.DONE, subject_code=subject.name, **kw)
    doc.topics.add(subject)
    return doc


class NamingTests(TestCase):
    def test_keys_ignore_spacing_case_and_punctuation(self):
        self.assertEqual(naming.name_key("운영 체제"), naming.name_key("운영체제"))
        self.assertEqual(naming.name_key("C++ (기초)"), naming.name_key("c++기초"))

    def test_soft_suffix_is_same_but_variants_are_not(self):
        self.assertTrue(naming.same_name("운영체제론", "운영체제"))
        self.assertTrue(naming.same_name("데이터베이스 개론", "데이터베이스"))
        self.assertFalse(naming.same_name("객체지향프로그래밍", "객체지향프로그래밍실습"))   # 실습은 다른 과목
        self.assertFalse(naming.same_name("자료구조", "알고리즘"))

    def test_similar_names_suggest_but_do_not_merge(self):
        self.assertEqual(naming.similar_names("객체지향프로그래밍실습", ["객체지향프로그래밍", "운영체제"]), ["객체지향프로그래밍"])
        self.assertEqual(naming.similar_names("운영체제", ["운영 체제", "운영체제론"]), [])    # 같은 것은 후보가 아니다


class ResolveTests(TestCase):
    def test_subject_resolution(self):
        before = Subject.objects.count()
        arch, how = ontology.resolve_subject("컴퓨터구조")
        self.assertEqual(how, "new")
        self.assertEqual(ontology.resolve_subject("컴퓨터 구조"), (arch, "exact"))
        again, how = ontology.resolve_subject("컴퓨터구조론")
        self.assertEqual((again, how), (arch, "soft"))
        self.assertTrue(SubjectAlias.objects.filter(subject=arch).exists())        # 한 번 맞춘 표기는 기억한다
        self.assertEqual(ontology.resolve_subject("컴퓨터구조론")[1], "alias")
        self.assertEqual(ontology.resolve_subject("운영 체제")[1], "exact")           # 기본으로 들어 있는 과목
        other, how = ontology.resolve_subject("객체지향프로그래밍실습")
        self.assertEqual(how, "new")
        self.assertEqual(Subject.objects.count(), before + 2)

    def test_empty_subject_is_an_error(self):
        with self.assertRaises(ValueError):
            ontology.resolve_subject("   ")

    def test_professor_resolution_strips_titles(self):
        a = ontology.resolve_professor("김철수 교수님")
        self.assertEqual(a.name, "김철수")
        self.assertEqual(ontology.resolve_professor("김철수교수"), a)
        self.assertEqual(Professor.objects.count(), 1)
        self.assertIsNone(ontology.resolve_professor("  "))

    def test_concept_resolution_reuses_variants(self):
        subject = ontology.resolve_subject("컴퓨터구조")[0]
        paging = ontology.resolve_concept(subject, "페이징", "주소 변환")
        self.assertEqual(ontology.resolve_concept(subject, "페이 징"), paging)
        self.assertEqual(ontology.resolve_concept(subject, "페이징론"), paging)
        self.assertIsNone(ontology.resolve_concept(subject, "스케줄링", create=False))
        self.assertEqual(paging.description, "주소 변환")


class UploadResolveTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="up", password="pw")
        self.client.force_login(self.user)
        Subject.objects.get_or_create(name="운영체제")[0]

    def post(self, course="운영 체제", professor="김 교수님"):
        data = {"title": "", "file": SimpleUploadedFile("n.txt", ("본문 " * 40).encode()), "document_type": "lecture",
                "course_name": course, "professor": professor}
        with patch("mypage.views.threading.Thread"):
            return self.client.post("/mypage/", data, follow=True)

    def test_variant_names_join_existing_subject_and_professor(self):
        res = self.post()
        doc = PersonalDocument.objects.get()
        self.assertEqual((doc.course_name, doc.professor), ("운영체제", "김"))
        self.assertEqual(Subject.objects.filter(name__contains="운영").count(), 1)
        self.assertContains(res, "기존 과목 「운영체제」으로 묶었습니다")
        self.post(course="운영체제", professor="김교수님")
        self.assertEqual(Professor.objects.count(), 1)

    def test_new_subject_is_created_and_announced(self):
        res = self.post(course="컴퓨터 구조")
        self.assertTrue(Subject.objects.filter(name="컴퓨터 구조").exists())
        self.assertContains(res, "새 과목 「컴퓨터 구조」")

    def test_upload_page_offers_existing_names_for_choosing(self):
        ontology.resolve_professor("박정수")
        html = self.client.get("/mypage/").content.decode()
        self.assertIn('list="subject-options"', html)
        self.assertIn('<option value="운영체제">', html)
        self.assertIn('<option value="박정수">', html)
        self.assertIn("혹시 이", html)                                   # 확인 창의 '비슷한 이름' 안내


class TaggingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="t", password="pw")
        self.subject = Subject.objects.get_or_create(name="운영체제")[0]
        self.doc = make_doc(self.user, self.subject)

    def test_tag_document_creates_concepts_and_reuses_existing(self):
        existing = Concept.objects.create(subject=self.subject, name="프로세스", key="프로세스")
        answer = {"sections": [{"i": 0, "concepts": ["프로세스"]}, {"i": 1, "concepts": ["CPU 스케줄링", "cpu스케줄링"]},
                               {"i": 2, "concepts": ["페이징", "페이징"]}, {"i": 9, "concepts": ["없는 부분"]}],
                  "descriptions": {"페이징": "주소 변환 기법"}}
        with patch("core.ai.complete_json", return_value=answer) as ai:
            count = ontology.tag_document(self.doc)
        self.assertEqual(count, 3)
        self.assertEqual(Concept.objects.filter(subject=self.subject).count(), 3)       # 프로세스는 새로 만들지 않았다
        self.assertIn("프로세스", ai.call_args.args[1][1]["content"])                     # 기존 개념을 보여 준다
        self.doc.refresh_from_db()
        self.assertEqual([t["concepts"] for t in self.doc.concept_tags], [["프로세스"], ["CPU 스케줄링"], ["페이징"]])
        self.assertEqual(set(self.doc.concepts.values_list("name", flat=True)), {"프로세스", "CPU 스케줄링", "페이징"})
        self.assertEqual(Concept.objects.get(name="페이징").description, "주소 변환 기법")
        self.assertEqual(DocumentConcept.objects.filter(document=self.doc, concept=existing).count(), 1)

    def test_retagging_replaces_old_links(self):
        with patch("core.ai.complete_json", return_value={"sections": [{"i": 0, "concepts": ["프로세스"]}]}):
            ontology.tag_document(self.doc)
        with patch("core.ai.complete_json", return_value={"sections": [{"i": 1, "concepts": ["스케줄링"]}]}):
            ontology.tag_document(self.doc)
        self.assertEqual(list(self.doc.concepts.values_list("name", flat=True)), ["스케줄링"])

    def test_ai_failure_leaves_existing_tags(self):
        with patch("core.ai.complete_json", return_value={"sections": [{"i": 0, "concepts": ["프로세스"]}]}):
            ontology.tag_document(self.doc)
        with patch("core.ai.complete_json", side_effect=RuntimeError("api down")):
            with self.assertRaises(RuntimeError):
                ontology.tag_document(self.doc)
        self.assertEqual(self.doc.concepts.count(), 1)

    def test_summary_sections_and_text_for_concepts(self):
        self.assertEqual([t for t, _ in ontology.split_summary(SUMMARY)], ["프로세스", "스케줄링", "페이징"])
        tags = [{"section": "스케줄링", "concepts": ["CPU 스케줄링"]}, {"section": "페이징", "concepts": ["페이징"]}]
        text = ontology.text_for_concepts(SUMMARY, tags, ["페이징"])
        self.assertIn("페이지 테이블", text)
        self.assertNotIn("스케줄링", text)
        self.assertEqual(ontology.text_for_concepts(SUMMARY, [], ["페이징"]), "")


class ExamAnalysisTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="e", password="pw")
        self.os = Subject.objects.get_or_create(name="운영체제")[0]
        self.db = Subject.objects.get_or_create(name="데이터베이스")[0]

    ANSWER = {"questions": [
        {"number": 1, "text": "페이징의 주소 변환을 묻는다", "type": "객관식", "points": 5, "concepts": ["페이징"]},
        {"number": 2, "text": "스케줄링 알고리즘을 비교", "type": "서술형", "points": 10, "concepts": ["스케줄링", "프로세스"]},
        {"number": 3, "text": "빈칸 채우기", "type": "mystery", "points": "x", "concepts": []},
        {"text": "", "type": "ox"},
    ]}

    def test_analysis_stores_questions_with_normalised_types_and_concepts(self):
        doc = make_doc(self.user, self.os, "OS 족보", EXAM, "김", text="1. 다음 중...")
        with patch("core.ai.complete_json", return_value=self.ANSWER):
            self.assertEqual(ontology.analyze_exam(doc), 3)
        qs = list(ExamQuestion.objects.filter(document=doc))
        self.assertEqual([(q.qtype, q.points) for q in qs], [("mc", 5), ("essay", 10), ("other", None)])
        self.assertEqual(set(qs[1].concepts.values_list("name", flat=True)), {"스케줄링", "프로세스"})
        with patch("core.ai.complete_json", return_value={"questions": [self.ANSWER["questions"][0]]}):
            ontology.analyze_exam(doc)                                            # 다시 분석하면 바꿔 쓴다
        self.assertEqual(ExamQuestion.objects.filter(document=doc).count(), 1)

    def build_stats_fixture(self):
        os_doc = make_doc(self.user, self.os, "OS 족보", EXAM, "김 교수님", text="x")
        db_doc = make_doc(self.user, self.db, "DB 족보", EXAM, "김교수", text="y")
        other = make_doc(self.user, self.os, "이교수 족보", EXAM, "이", text="z")
        paging = ontology.resolve_concept(self.os, "페이징")
        sched = ontology.resolve_concept(self.os, "스케줄링")
        norm = ontology.resolve_concept(self.db, "정규화")
        for doc, rows in ((os_doc, [("mc", paging), ("mc", paging), ("essay", sched)]), (db_doc, [("essay", norm), ("short", norm)]),
                          (other, [("ox", sched)] * 4)):
            for i, (qtype, concept) in enumerate(rows, 1):
                ExamQuestion.objects.create(document=doc, number=i, text="q", qtype=qtype).concepts.add(concept)

    def test_stats_share_type_mix_across_subjects_but_count_concepts_per_subject(self):
        self.build_stats_fixture()
        stats = ontology.exam_stats("김 교수님", "운영체제")
        self.assertEqual(stats["total"], 5)                                      # 김 교수님의 OS+DB 족보 전부
        self.assertEqual(stats["type_counts"], {"mc": 2, "essay": 2, "short": 1})
        self.assertEqual(stats["concepts"], [("페이징", 2), ("스케줄링", 1)])        # 개념은 이 과목 것만, 이교수 문제는 제외
        self.assertEqual(stats["concept_scope"], "professor")
        self.assertEqual(ontology.exam_stats("김 교수님", "데이터베이스")["concepts"], [("정규화", 2)])

    def test_stats_fall_back_to_subject_when_professor_has_none(self):
        self.build_stats_fixture()
        stats = ontology.exam_stats("박교수", "운영체제")
        self.assertEqual(stats["total"], 0)
        self.assertEqual(stats["concepts"][0], ("스케줄링", 5))
        self.assertEqual(stats["concept_scope"], "subject")
        self.assertEqual(ontology.exam_stats("", "운영체제")["total"], 7)         # 교수 이름이 없으면 그 과목의 족보 전부

    def test_style_prompt_and_type_plan_use_the_counts(self):
        self.build_stats_fixture()
        style = ExamStyle.objects.create(key="p:김", label="김 교수님", guidelines="- 객관식 위주", source_hash="h")
        text = exam.style_prompt(style, "김 교수님", "운영체제")
        self.assertIn("- 객관식 위주", text)
        self.assertIn("객관식 40%", text)
        self.assertIn("페이징(2회)", text)
        plan = exam.type_plan(ontology.exam_stats("김 교수님", "운영체제"))
        self.assertEqual(sum(plan.values()), 10)
        self.assertEqual(plan, {"mc": 4, "essay": 4, "short": 2})
        self.assertEqual(exam.type_plan({"total": 2, "type_counts": {"mc": 2}}), {})      # 표본이 적으면 AI가 알아서
        self.assertEqual(exam.style_prompt(None, "박교수", "없는과목"), "")


class MockExamUsesAnalysisTests(TestCase):
    def test_prompt_has_plan_concept_weights_coverage_and_question_examples(self):
        user = User.objects.create_user(username="m", password="pw")
        os_ = Subject.objects.get_or_create(name="운영체제")[0]
        category = CourseCategory.objects.create(title="AI")
        course = Course.objects.create(code="운영체제", title="운영체제", category=category, instructor=user)
        lecture = make_doc(user, os_, "강의", LECTURE, "김")
        paging = ontology.resolve_concept(os_, "페이징")
        DocumentConcept.objects.create(document=lecture, concept=paging)
        ex = make_doc(user, os_, "족보", EXAM, "김", text="raw exam text")
        for i in range(4):
            ExamQuestion.objects.create(document=ex, number=i, text=f"페이징 문제 {i}", qtype="mc").concepts.add(paging)
        answer = {"title": "t", "questions": [{"type": "mc", "q": f"q{i}", "options": ["a", "b"], "answer": 0} for i in range(10)]}
        with patch("core.ai.complete_json", return_value=answer) as ai:
            mock = exam.generate_mock_exam(user, [lecture])
        prompt = ai.call_args.args[1][1]["content"]
        self.assertIn("객관식 10개", prompt)                       # 족보가 전부 객관식이라 문항 구성도 그렇다
        self.assertIn("페이징(4회)", prompt)
        self.assertIn("수업 자료가 다루는 개념: 페이징", prompt)
        self.assertIn("- [객관식] 페이징 문제 0", prompt)             # 원문 대신 분석된 문제 요약을 예시로
        self.assertNotIn("raw exam text", prompt)
        self.assertEqual(len(mock.questions), 10)


class ConceptEditingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="c", password="pw")
        self.os = Subject.objects.get_or_create(name="운영체제")[0]
        self.doc = make_doc(self.user, self.os)
        self.a = ontology.resolve_concept(self.os, "페이지 교체")
        self.b = ontology.resolve_concept(self.os, "페이징")
        DocumentConcept.objects.create(document=self.doc, concept=self.a)
        DocumentConcept.objects.create(document=self.doc, concept=self.b)
        PersonalDocument.objects.filter(pk=self.doc.pk).update(concept_tags=[{"section": "페이징", "concepts": ["페이지 교체", "페이징"]}])
        self.q = ExamQuestion.objects.create(document=self.doc, number=1, text="q", qtype="mc")
        self.q.concepts.add(self.a)

    def test_merge_moves_links_and_tags(self):
        ontology.merge_concepts(self.a, self.b)
        self.assertFalse(Concept.objects.filter(pk=self.a.pk).exists())
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.concept_tags, [{"section": "페이징", "concepts": ["페이징"]}])
        self.assertEqual(list(self.doc.concepts.values_list("name", flat=True)), ["페이징"])
        self.assertEqual(list(self.q.concepts.values_list("name", flat=True)), ["페이징"])

    def test_merge_rejects_other_subject(self):
        other = ontology.resolve_concept(Subject.objects.get_or_create(name="DB")[0], "정규화")
        with self.assertRaises(ValueError):
            ontology.merge_concepts(self.a, other)
        with self.assertRaises(ValueError):
            ontology.merge_concepts(self.a, self.a)

    def test_rename_updates_tags_and_collision_merges(self):
        ontology.rename_concept(self.a, "페이지 교체 알고리즘")
        self.doc.refresh_from_db()
        self.assertIn("페이지 교체 알고리즘", self.doc.concept_tags[0]["concepts"])
        result = ontology.rename_concept(Concept.objects.get(name="페이지 교체 알고리즘"), "페이징")      # 이미 있는 이름
        self.assertEqual(result.pk, self.b.pk)
        self.assertEqual(Concept.objects.filter(subject=self.os).count(), 1)

    def test_delete_removes_name_from_tags(self):
        ontology.delete_concept(self.a)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.concept_tags, [{"section": "페이징", "concepts": ["페이징"]}])


class ConceptOutlineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="o", password="pw")
        self.os = Subject.objects.get_or_create(name="운영체제")[0]
        self.d1 = make_doc(self.user, self.os, "강의1")
        self.d2 = make_doc(self.user, self.os, "강의2", summary="## 파일\n파일 시스템 내용\n")
        tags1 = [{"section": "프로세스", "concepts": ["프로세스"]}, {"section": "스케줄링", "concepts": ["스케줄링"]},
                 {"section": "페이징", "concepts": ["페이징"]}]
        PersonalDocument.objects.filter(pk=self.d1.pk).update(concept_tags=tags1)
        PersonalDocument.objects.filter(pk=self.d2.pk).update(concept_tags=[{"section": "파일", "concepts": ["파일시스템"]}])
        for doc, names in ((self.d1, ["프로세스", "스케줄링", "페이징"]), (self.d2, ["파일시스템"])):
            for n in names:
                DocumentConcept.objects.create(document=doc, concept=ontology.resolve_concept(self.os, n))

    def test_normalize_outline_uses_concepts_and_appends_leftovers(self):
        cmap = {"프로세스": [1], "스케줄링": [1], "페이징": [1], "파일시스템": [2]}
        data = {"chapters": [{"title": "CPU", "concepts": ["프로세스", "스케줄링", "없는개념"]},
                             {"title": "메모리", "concepts": ["페이징", "프로세스"]}]}      # 프로세스 중복·없는 개념은 버린다
        out = course_ai.normalize_outline(data, {1, 2}, cmap)
        self.assertEqual(out["chapters"][0]["concepts"], ["프로세스", "스케줄링"])
        self.assertEqual(out["chapters"][1]["concepts"], ["페이징", "파일시스템"])        # 빠진 개념은 마지막 챕터에
        self.assertEqual(out["chapters"][1]["doc_ids"], [1, 2])
        self.assertEqual(course_ai.normalize_outline({"chapters": [{"title": "a", "doc_ids": [1]}]}, {1, 2})["chapters"][0]["doc_ids"], [1])

    def test_build_draft_groups_by_concept_and_narrows_chapter_material(self):
        outline = {"title": "t", "description": "d", "chapters": [
            {"title": "메모리", "summary": "", "doc_ids": [self.d1.pk], "concepts": ["페이징"]},
            {"title": "나머지", "summary": "", "doc_ids": [self.d1.pk, self.d2.pk], "concepts": ["프로세스", "스케줄링", "파일시스템"]}]}
        sets = [{"title": "s", "cards": [{"title": "c", "body": "b"}], "questions": []}]
        with patch.object(course_ai, "generate_outline", return_value=outline) as gen, \
                patch.object(course_ai, "generate_chapter", return_value=sets) as chapter:
            draft = studio.build_draft("운영체제")
        self.assertEqual(set(gen.call_args.kwargs["concepts"]), {"프로세스", "스케줄링", "페이징", "파일시스템"})
        first_docs = chapter.call_args_list[0].args[2]
        self.assertIn("페이지 테이블", first_docs[0]["summary"])
        self.assertNotIn("스케줄링 방식", first_docs[0]["summary"])               # 페이징 챕터에는 페이징 부분만
        self.assertEqual(draft.content["chapters"][0]["concepts"], ["페이징"])

    def test_concept_change_creates_a_new_draft_but_without_concepts_old_behaviour_stays(self):
        outline = {"title": "t", "description": "d", "chapters": [{"title": "c", "summary": "", "doc_ids": [self.d1.pk]}]}
        sets = [{"title": "s", "cards": [{"title": "c", "body": "b"}], "questions": []}]
        with patch.object(course_ai, "generate_outline", return_value=outline), patch.object(course_ai, "generate_chapter", return_value=sets):
            first = studio.build_draft("운영체제")
            self.assertIsNone(studio.build_draft("운영체제"))
            ontology.rename_concept(Concept.objects.get(name="페이징"), "페이징 기법")
            second = studio.build_draft("운영체제")
        self.assertNotEqual(first.source_hash, second.source_hash)


class PipelineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="p", password="pw")
        self.os = Subject.objects.get_or_create(name="운영체제")[0]

    def test_after_summary_tags_lectures_and_analyses_exams_and_survives_failure(self):
        lecture = make_doc(self.user, self.os, "강의", LECTURE)
        paper = make_doc(self.user, self.os, "족보", EXAM, "김")
        with patch.object(topics, "classify_document", return_value=["운영체제"]), patch("course.studio.build_draft"), \
                patch("mypage.exam.refresh_for"), patch("mypage.ontology.tag_document") as tag, \
                patch("mypage.ontology.analyze_exam") as analyse:
            topics.after_summary(lecture.pk)
            topics.after_summary(paper.pk)
        tag.assert_called_once()
        analyse.assert_called_once()
        with patch.object(topics, "classify_document", return_value=["운영체제"]), patch("course.studio.build_draft") as build, \
                patch("mypage.ontology.tag_document", side_effect=RuntimeError("api down")):
            topics.after_summary(lecture.pk)
        build.assert_called_once_with("운영체제")                                  # 태그가 실패해도 강의 초안은 진행


class StudioConceptViewTests(TestCase):
    def setUp(self):
        self.lecturer = User.objects.create_user(username="lect", password="pw", is_lecturer=True)
        self.student = User.objects.create_user(username="stud", password="pw")
        self.os = Subject.objects.get_or_create(name="운영체제")[0]
        self.doc = make_doc(self.lecturer, self.os, professor="김")
        self.c1 = ontology.resolve_concept(self.os, "페이징")
        self.c2 = ontology.resolve_concept(self.os, "페이징 기법")
        paper = make_doc(self.lecturer, self.os, "족보", EXAM, "김")
        self.q = ExamQuestion.objects.create(document=paper, number=1, text="주소 변환", qtype="essay")
        self.q.concepts.add(self.c1)
        self.client.force_login(self.lecturer)

    def act(self, **data):
        return self.client.post("/course/studio/concepts/action/", {"subject": "운영체제", **data}, follow=True)

    def test_only_lecturers_can_open(self):
        self.client.force_login(self.student)
        self.assertEqual(self.client.get("/course/studio/concepts/").status_code, 403)
        self.assertEqual(self.client.post("/course/studio/concepts/action/", {"subject": "운영체제"}).status_code, 403)

    def test_pages_render_with_stats_and_questions(self):
        self.assertContains(self.client.get("/course/studio/concepts/"), "운영체제")
        page = self.client.get("/course/studio/concepts/?subject=운영체제")
        self.assertContains(page, "페이징")
        self.assertContains(page, "주소 변환")
        self.assertContains(page, "서술형")
        self.assertEqual(self.client.get("/course/studio/concepts/?subject=없음").status_code, 404)

    def test_actions(self):
        self.act(action="add", name="교착 상태")
        self.assertTrue(Concept.objects.filter(subject=self.os, name="교착 상태").exists())
        self.act(action="rename", concept=self.c2.pk, name="페이지 테이블")
        self.c2.refresh_from_db()
        self.assertEqual(self.c2.name, "페이지 테이블")
        res = self.act(action="merge", concept=self.c2.pk, target=self.c1.pk)
        self.assertContains(res, "합쳤습니다")
        self.assertFalse(Concept.objects.filter(pk=self.c2.pk).exists())
        self.act(action="tag_question", question=self.q.pk)
        self.assertEqual(self.q.concepts.count(), 0)
        self.act(action="tag_question", question=self.q.pk, concepts=[self.c1.pk])
        self.assertEqual(list(self.q.concepts.all()), [self.c1])
        self.act(action="delete", concept=self.c1.pk)
        self.assertFalse(Concept.objects.filter(pk=self.c1.pk).exists())
        self.assertEqual(self.client.post("/course/studio/concepts/action/", {"subject": "운영체제", "action": "nope"}).status_code, 404)

    def test_cannot_touch_another_subjects_concept(self):
        other = ontology.resolve_concept(Subject.objects.get_or_create(name="DB")[0], "정규화")
        res = self.client.post("/course/studio/concepts/action/", {"subject": "운영체제", "action": "delete", "concept": other.pk})
        self.assertEqual(res.status_code, 404)
        self.assertTrue(Concept.objects.filter(pk=other.pk).exists())


class CoursePageAndBackfillTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="r", password="pw")
        self.os = Subject.objects.get_or_create(name="운영체제")[0]

    def test_course_page_does_not_show_exam_style_or_frequent_concepts(self):
        category = CourseCategory.objects.create(title="AI")
        course = Course.objects.create(code="운영체제", title="운영체제", category=category, instructor=self.user)
        paper = make_doc(self.user, self.os, "족보", EXAM, "김")
        make_doc(self.user, self.os, "강의", LECTURE, "김")
        paging = ontology.resolve_concept(self.os, "페이징")
        for i in range(3):
            ExamQuestion.objects.create(document=paper, number=i, text="q", qtype="mc").concepts.add(paging)
        self.client.force_login(self.user)
        page = self.client.get(f"/course/{course.slug}/")
        self.assertNotContains(page, "족보에서 자주 나온 개념")
        self.assertNotContains(page, "모의 출제")

    def test_backfill_tags_untagged_documents_and_skips_tagged(self):
        legacy = PersonalDocument.objects.create(user=self.user, title="옛 자료", extracted_text="x", summary=SUMMARY,
                                                 summary_status=ProcessingStatus.DONE, professor="김 교수님")
        legacy.topics.add(self.os)
        tagged = make_doc(self.user, self.os, "이미")
        PersonalDocument.objects.filter(pk=tagged.pk).update(concept_tags=[{"section": "a", "concepts": ["b"]}])
        out = StringIO()
        with patch("core.ai.complete_json", return_value={"sections": [{"i": 0, "concepts": ["프로세스"]}]}) as ai:
            call_command("backfill_ontology", stdout=out)
        self.assertEqual(ai.call_count, 1)                                          # 태그가 이미 있는 자료는 건너뛴다
        legacy.refresh_from_db()
        self.assertEqual(legacy.course_name, "운영체제")                              # 옛 자료의 과목 이름도 채운다
        self.assertTrue(Professor.objects.filter(key="김").exists())
        self.assertIn("완료 1개, 건너뜀 1개", out.getvalue())


class OntologyMapTests(TestCase):
    def setUp(self):
        self.lecturer = User.objects.create_user(username="map", password="pw", is_lecturer=True)
        self.student = User.objects.create_user(username="mapstud", password="pw")
        self.os = Subject.objects.get_or_create(name="운영체제")[0]
        self.lecture = make_doc(self.lecturer, self.os, "OS 강의", LECTURE, "김철수")
        self.paper = make_doc(self.lecturer, self.os, "OS 중간 족보", EXAM, "김철수")
        Professor.objects.get_or_create(key="김철수", defaults={"name": "김철수"})
        self.paging = ontology.resolve_concept(self.os, "페이징", "주소 변환")
        self.sched = ontology.resolve_concept(self.os, "스케줄링")
        DocumentConcept.objects.create(document=self.lecture, concept=self.paging)
        DocumentConcept.objects.create(document=self.lecture, concept=self.sched)
        PersonalDocument.objects.filter(pk=self.lecture.pk).update(
            concept_tags=[{"section": "페이징", "concepts": ["페이징", "스케줄링"]}])
        for i in range(3):
            ExamQuestion.objects.create(document=self.paper, number=i, text=f"페이징 문제 {i}", qtype="essay", points=10).concepts.add(self.paging)
        self.client.force_login(self.lecturer)

    def test_graph_data_links_professor_subject_and_concepts_with_details(self):
        data = ontology.graph_data("운영체제")
        nodes = {n["data"]["id"]: n["data"] for n in data["nodes"]}
        kinds = sorted({n["kind"] for n in nodes.values()})
        self.assertEqual(kinds, ["concept", "professor", "subject"])
        paging = nodes[f"c{self.paging.pk}"]
        self.assertEqual((paging["questions"], paging["docs"]), (3, 1))
        self.assertGreater(paging["size"], nodes[f"c{self.sched.pk}"]["size"])             # 자주 출제된 개념이 더 크다
        detail = paging["detail"]
        self.assertEqual(detail["professors"], [{"name": "김철수 교수님", "count": 3}])
        self.assertEqual(detail["questions"][0]["type"], "서술형")
        self.assertIn("OS 강의 › 페이징", detail["sections"])
        self.assertEqual(detail["lectures"], ["OS 강의"])
        pairs = {(e["data"]["source"], e["data"]["target"], e["data"]["kind"]) for e in data["edges"]}
        self.assertIn((f"s{self.os.pk}", f"c{self.paging.pk}", "has"), pairs)
        self.assertIn(("p김철수", f"s{self.os.pk}", "teaches"), pairs)
        related = [e["data"] for e in data["edges"] if e["data"]["kind"] == "related"]
        self.assertEqual(len(related), 1)                                                   # 페이징—스케줄링은 같은 요약 부분에 함께 나왔다
        self.assertEqual(data["meta"]["questions"], 3)
        prof = nodes["p김철수"]["detail"]
        self.assertEqual(prof["total"], 3)
        self.assertEqual(prof["subjects"], ["운영체제"])

    def test_graph_caps_concepts_per_subject(self):
        for i in range(8):
            ontology.resolve_concept(self.os, f"개념{i}")
        data = ontology.graph_data("운영체제", per_subject=4)
        self.assertEqual(data["meta"]["concepts"], 4)
        self.assertEqual(data["meta"]["hidden_concepts"], 6)
        kept = {n["data"]["label"] for n in data["nodes"] if n["data"]["kind"] == "concept"}
        self.assertIn("페이징", kept)                                                        # 출제된 개념이 우선

    def test_overview_bars(self):
        row = next(r for r in ontology.overview() if r["name"] == "운영체제")
        self.assertEqual((row["lecture_docs"], row["exam_docs"], row["question_total"]), (1, 1, 3))
        self.assertEqual(row["concepts"][0]["name"], "페이징")
        self.assertEqual(row["concepts"][0]["bar"], 100)
        self.assertEqual(row["concepts"][1]["bar"], 0)
        self.assertEqual(row["types"], [("서술형", 3)])
        self.assertEqual(row["professors"], ["김철수"])

    def test_pages_are_lecturer_only_and_render(self):
        page = self.client.get("/course/studio/ontology/?subject=운영체제")
        self.assertContains(page, "개념 지도")
        self.assertContains(page, "페이징")
        self.assertContains(page, "족보 3회")
        self.assertContains(page, "cytoscape")
        data = self.client.get("/course/studio/ontology/data/", {"subject": "운영체제"}).json()
        self.assertTrue(data["nodes"])
        self.client.force_login(self.student)
        self.assertEqual(self.client.get("/course/studio/ontology/").status_code, 403)
        self.assertEqual(self.client.get("/course/studio/ontology/data/").status_code, 403)

    def test_backfill_rebuild_flag_builds_drafts(self):
        PersonalDocument.objects.filter(pk=self.lecture.pk).update(concept_tags=[])
        with patch("core.ai.complete_json", return_value={"sections": [{"i": 0, "concepts": ["페이징"]}]}), \
                patch("course.studio.build_draft") as build:
            call_command("backfill_ontology", "--rebuild", stdout=StringIO())
        build.assert_called_once_with("운영체제")
