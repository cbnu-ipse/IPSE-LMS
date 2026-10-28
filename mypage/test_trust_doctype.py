import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from accounts import trust
from accounts.models import TrustEvent

from . import doctype, exam
from .models import DocTypeRules, ExamQuestion, PersonalDocument, ProcessingStatus

User = get_user_model()
EXAM, LECTURE = PersonalDocument.DocumentType.EXAM, PersonalDocument.DocumentType.LECTURE

EXAM_TEXT = "\n".join(["2023학년도 중간고사 학번: ____ 이름: ____"] + [f"{i}. 다음 중 옳은 것은? (5점)\n(1) 가 (2) 나 (3) 다" for i in range(1, 7)] + ["정답 및 풀이: 1번 3 ..."])
LECTURE_TEXT = "\n".join(["# 1장 프로세스", "학습목표", "목차"] + [f"## {i}.{i} 개념" for i in range(1, 6)] + ["- 정의", "- 예제", "- 요약"] * 12)


class SuggestTests(TestCase):
    def test_numbered_questions_with_scores_and_answer_words_look_like_an_exam(self):
        out = doctype.suggest("midterm.txt", EXAM_TEXT)
        self.assertEqual(out["type"], "exam")
        self.assertTrue(out["reasons"])

    def test_headings_and_lecture_words_look_like_course_material(self):
        out = doctype.suggest("ch1.txt", LECTURE_TEXT)
        self.assertEqual(out["type"], "lecture")

    def test_slide_files_are_course_material_and_images_lean_towards_exams(self):
        self.assertEqual(doctype.suggest("slides.pptx", "")["type"], "lecture")
        self.assertEqual(doctype.suggest("scan.jpg", "")["type"], "")            # 이미지 하나만으로는 확신하지 않는다 (1.0 < 기준 1.5)
        self.assertEqual(doctype.suggest("scan.jpg", EXAM_TEXT)["type"], "exam")

    def test_unclear_files_get_no_suggestion_so_the_user_must_choose(self):
        out = doctype.suggest("memo.txt", "그냥 짧은 메모입니다.")
        self.assertEqual((out["type"], out["reasons"]), ("", []))

    def test_sanitize_rules_clamps_unknown_and_out_of_range_values(self):
        rules = doctype.sanitize_rules({"margin": 99, "features": {"image_file": {"exam": 50, "lecture": -3}, "made_up": {"exam": 4}},
                                        "keywords": {"exam": ["정답", "정답", "x", "가" * 40, "풀이"], "lecture": []}})
        self.assertEqual(rules["margin"], 4.0)
        self.assertEqual(rules["features"]["image_file"], {"exam": 4.0, "lecture": 0.0})
        self.assertNotIn("made_up", rules["features"])
        self.assertEqual(rules["keywords"]["exam"], ["정답", "풀이"])
        self.assertEqual(rules["keywords"]["lecture"], doctype.DEFAULT_RULES["keywords"]["lecture"])    # 비면 기본값

    def test_stored_rules_change_the_decision(self):
        DocTypeRules.objects.create(rules=doctype.sanitize_rules({"features": {"slide_file": {"exam": 4, "lecture": 0}}}))
        self.assertEqual(doctype.suggest("slides.pptx", "")["type"], "exam")


class RefreshRulesTests(TestCase):
    def make(self, owner, kind, text, n):
        for i in range(n):
            PersonalDocument.objects.create(user=owner, title=f"{kind}{i}", file=f"{kind}{i}.txt", extracted_text=text, document_type=kind,
                                            summary_status=ProcessingStatus.DONE)

    def test_not_enough_verified_samples_leaves_rules_alone(self):
        lecturer = User.objects.create_user(username="l", password="pw", is_lecturer=True)
        self.make(lecturer, EXAM, EXAM_TEXT, 2)
        with patch("core.ai.complete_json") as llm:
            self.assertIsNone(doctype.refresh_rules())
        llm.assert_not_called()

    def test_ai_rewrites_rules_from_verified_documents_and_old_ones_are_deactivated(self):
        lecturer = User.objects.create_user(username="l", password="pw", is_lecturer=True)
        stranger = User.objects.create_user(username="s", password="pw")
        self.make(lecturer, EXAM, EXAM_TEXT, 5)
        self.make(lecturer, LECTURE, LECTURE_TEXT, 5)
        self.make(stranger, EXAM, "검증되지 않은 자료", 9)                          # 확인되지 않은 자료는 근거로 쓰지 않는다
        DocTypeRules.objects.create(rules=doctype.DEFAULT_RULES, source="default")
        answer = {"margin": 2.0, "features": {"score_marks": {"exam": 3.5, "lecture": 0}, "evil": {"exam": 4}}, "keywords": {"exam": ["정답"], "lecture": ["목차"]}}
        with patch("core.ai.complete_json", return_value=answer) as llm:
            row = doctype.refresh_rules()
        body = llm.call_args.args[1][1]["content"]
        self.assertNotIn("검증되지 않은 자료", body)
        self.assertEqual((row.sample_count, row.rules["margin"], row.rules["features"]["score_marks"]["exam"]), (10, 2.0, 3.5))
        self.assertNotIn("evil", row.rules["features"])
        self.assertEqual(list(DocTypeRules.objects.filter(is_active=True)), [row])


class TrustTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_lecturers_are_always_100_and_never_adjusted(self):
        lecturer = User.objects.create_user(username="l", password="pw", is_lecturer=True, trust_score=10)
        self.assertEqual(trust.effective(lecturer), 100)
        self.assertEqual(trust.adjust(lecturer, -25, "x"), 100)
        self.assertFalse(TrustEvent.objects.filter(user=lecturer).exists())

    def test_adjust_clamps_and_logs_each_change(self):
        self.assertEqual(trust.effective(self.user), 50)
        self.assertEqual(trust.adjust(self.user, -25, "잘못됨"), 25)
        self.assertEqual(trust.adjust(self.user, -90, "잘못됨"), 0)
        self.assertEqual(trust.adjust(self.user, 200, "맞음"), 100)
        self.assertEqual(list(TrustEvent.objects.filter(user=self.user).values_list("score_after", flat=True)), [100, 0, 25])

    def test_passive_growth_stops_at_the_cap(self):
        User.objects.filter(pk=self.user.pk).update(trust_score=69)
        self.user.refresh_from_db()
        self.assertEqual(trust.reward_clean_upload(self.user), 70)
        self.assertEqual(trust.reward_clean_upload(self.user), 70)
        self.assertEqual(TrustEvent.objects.filter(user=self.user).count(), 1)

    def test_weight_is_relative_to_the_starting_score(self):
        self.assertEqual(trust.weight(self.user), 1.0)
        self.assertEqual(trust.weight(User(is_lecturer=True)), 2.0)


class TrustShapesLearningTests(TestCase):
    def setUp(self):
        self.low = User.objects.create_user(username="low", password="pw", trust_score=30)
        self.mid = User.objects.create_user(username="mid", password="pw")
        self.lecturer = User.objects.create_user(username="lec", password="pw", is_lecturer=True)

    def doc(self, owner, title, **kw):
        return PersonalDocument.objects.create(user=owner, title=title, file=f"{title}.txt", extracted_text=f"{title} 본문", professor="김교수",
                                               course_name="운영체제", document_type=EXAM, summary_status=ProcessingStatus.DONE, **kw)

    def test_low_trust_and_rejected_exams_are_not_learned_from_but_approved_ones_are(self):
        low, mid = self.doc(self.low, "낮음"), self.doc(self.mid, "보통")
        rejected = self.doc(self.mid, "반려", review_status=PersonalDocument.ReviewStatus.REJECTED)
        approved = self.doc(self.low, "승인", review_status=PersonalDocument.ReviewStatus.APPROVED)
        self.assertEqual({d.title for d in exam.exam_docs("김교수", "운영체제")}, {"보통", "승인"})
        self.assertNotIn(low, exam.exam_docs("김교수")) ; self.assertNotIn(rejected, exam.exam_docs("김교수")) ; self.assertIn(approved, exam.exam_docs("김교수"))

    def test_higher_trust_comes_first_within_the_limited_material(self):
        mid, lec = self.doc(self.mid, "보통"), self.doc(self.lecturer, "강의자")
        self.assertEqual([d.title for d in exam.exam_docs("김교수")], ["강의자", "보통"])

    def test_stats_ignore_untrusted_questions_and_count_trusted_ones_more(self):
        from .ontology import exam_stats
        mid, low, lec = self.doc(self.mid, "보통"), self.doc(self.low, "낮음"), self.doc(self.lecturer, "강의자")
        for d, qtype in ((mid, "ox"), (low, "essay"), (lec, "mc")):
            ExamQuestion.objects.create(document=d, number=1, text="q", qtype=qtype)
        stats = exam_stats("김교수", "운영체제")
        self.assertEqual(stats["total"], 2)                                         # 낮은 신뢰도의 문제는 빠진다
        self.assertEqual(stats["type_weight"], {"ox": 1.0, "mc": 2.0})              # 강의자는 2배
        self.assertEqual(stats["type_mix"], {"ox": 0.33, "mc": 0.67})


class UploadFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="up", password="pw")
        self.client.force_login(self.user)

    def upload(self, name="exam.txt", text=EXAM_TEXT, **extra):
        data = {"title": "", "file": SimpleUploadedFile(name, text.encode()), "course_name": "운영체제", "professor": "김교수", **extra}
        with patch("mypage.views.threading.Thread"):
            return self.client.post("/mypage/", data, follow=True)

    def test_upload_requires_choosing_a_document_type(self):
        res = self.upload()                                                         # document_type 없음 (기본은 선택 안 함)
        self.assertFalse(PersonalDocument.objects.exists())
        self.assertContains(res, "자료 구분, 과목 이름, 교수 이름을 모두 입력해주세요")

    def test_upload_form_defaults_to_no_selection(self):
        html = self.client.get("/mypage/").content.decode()
        select = html[html.index('name="document_type"'):]
        select = select[:select.index("</select>")]
        self.assertIn('<option value="" selected>자료 구분 선택…</option>', select)       # 빈 선택지가 기본
        self.assertNotIn('value="lecture" selected', select)
        self.assertNotIn('value="exam" selected', select)

    def test_matching_choice_is_recorded_and_raises_trust_slightly(self):
        self.upload(document_type=EXAM)
        doc = PersonalDocument.objects.get()
        self.assertEqual((doc.suggested_type, doc.review_status), ("exam", "pending"))
        self.assertGreater(doc.type_confidence, 0.3)
        self.user.refresh_from_db()
        self.assertEqual(self.user.trust_score, 51)

    def test_a_choice_that_contradicts_the_guess_is_flagged_for_review_without_a_trust_reward(self):
        self.upload(document_type=LECTURE)                                          # 족보처럼 생긴 파일을 수업 자료로 올림
        doc = PersonalDocument.objects.get()
        self.user.refresh_from_db()
        self.assertEqual((doc.suggested_type, self.user.trust_score), ("exam", 50))
        res = self.client.get("/mypage/review/")
        self.assertEqual(res.status_code, 302)                                      # 일반 사용자는 검토 화면에 못 들어간다

    def test_lecturer_uploads_are_approved_automatically(self):
        lecturer = User.objects.create_user(username="lec", password="pw", is_lecturer=True)
        self.client.force_login(lecturer)
        self.upload(document_type=EXAM)
        self.assertEqual(PersonalDocument.objects.get().review_status, "approved")

    def test_estimate_returns_the_suggestion_for_the_dropdown(self):
        from django.core.cache import cache
        cache.clear()
        res = self.client.post("/mypage/estimate/", {"file": SimpleUploadedFile("m.txt", EXAM_TEXT.encode())}).json()
        self.assertEqual(res["suggest"]["type"], "exam")
        self.assertTrue(res["suggest"]["reasons"])
        res = self.client.post("/mypage/estimate/", {"file": SimpleUploadedFile("n.txt", "짧은 메모 입니다 ".encode() * 3)}).json()
        self.assertEqual(res["suggest"]["type"], "")


class ReviewTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pw")
        self.lecturer = User.objects.create_user(username="lec", password="pw", is_lecturer=True)
        self.doc = PersonalDocument.objects.create(user=self.owner, title="의심 족보", file="a.txt", extracted_text="내용", document_type=EXAM,
                                                   course_name="운영체제", professor="김교수", summary_status=ProcessingStatus.DONE)

    def test_only_lecturers_or_admins_can_review(self):
        self.client.force_login(self.owner)
        self.assertEqual(self.client.get("/mypage/review/").status_code, 302)
        self.assertEqual(self.client.post(f"/mypage/review/{self.doc.pk}/", {"decision": "approve"}).status_code, 302)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.review_status, "pending")

    def test_queue_lists_pending_exams_and_mislabeled_lecture_uploads(self):
        mislabeled = PersonalDocument.objects.create(user=self.owner, title="족보를 수업 자료로", file="b.txt", extracted_text="x", document_type=LECTURE,
                                                     suggested_type="exam", type_confidence=0.8, summary_status=ProcessingStatus.DONE)
        PersonalDocument.objects.create(user=self.owner, title="그냥 수업 자료", file="c.txt", extracted_text="x", document_type=LECTURE,
                                        summary_status=ProcessingStatus.DONE)
        self.client.force_login(self.lecturer)
        res = self.client.get("/mypage/review/")
        titles = [d.title for d in res.context["docs"]]
        self.assertEqual(titles, ["족보를 수업 자료로", "의심 족보"])                  # 구분이 의심되는 것이 먼저
        self.assertNotIn("그냥 수업 자료", titles)
        self.assertContains(res, "서버는 족보로 짐작")

    def test_approve_raises_trust_and_reject_lowers_it_once(self):
        self.client.force_login(self.lecturer)
        self.client.post(f"/mypage/review/{self.doc.pk}/", {"decision": "approve"})
        self.client.post(f"/mypage/review/{self.doc.pk}/", {"decision": "reject"})   # 이미 검토한 자료는 바꾸지 않는다
        self.doc.refresh_from_db()
        self.owner.refresh_from_db()
        self.assertEqual((self.doc.review_status, self.doc.reviewed_by, self.owner.trust_score), ("approved", self.lecturer, 60))
        other = PersonalDocument.objects.create(user=self.owner, title="가짜", file="d.txt", extracted_text="x", document_type=EXAM,
                                                summary_status=ProcessingStatus.DONE)
        self.client.post(f"/mypage/review/{other.pk}/", {"decision": "reject"})
        self.owner.refresh_from_db()
        other.refresh_from_db()
        self.assertEqual((other.review_status, self.owner.trust_score), ("rejected", 35))
        self.assertEqual(list(TrustEvent.objects.filter(user=self.owner).values_list("delta", flat=True)), [-25, 10])

    def test_list_page_shows_the_review_link_to_lecturers_only(self):
        self.client.force_login(self.lecturer)
        self.assertContains(self.client.get("/mypage/"), "족보 검토 (1)")
        self.client.force_login(self.owner)
        self.assertNotContains(self.client.get("/mypage/"), "족보 검토")
