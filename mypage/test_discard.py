from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from . import discards, exam
from .models import DiscardedQuestion, MockExam, PersonalDocument, ProcessingStatus

User = get_user_model()
SUMMARY = "행렬의 곱셈은 교환법칙이 일반적으로 성립하지 않는다. 가역행렬의 행렬식은 0이 아니다. 대각합은 tr(AB)=tr(BA)이다."


def qs(n=4):
    kinds = ["ox", "mc", "short", "essay"]
    out = []
    for i in range(n):
        k = kinds[i % 4]
        q = {"type": k, "q": f"문제 {i} 입니다 고유한 문장 {i * 7}", "explanation": ""}
        if k == "ox":
            q["answer"] = True
        elif k == "mc":
            q.update(options=["가", "나", "다", "라"], answer=1)
        elif k == "short":
            q["answers"] = ["답"]
        else:
            q["answer"] = "모범답안"
        out.append(q)
    return out


class DiscardViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="d", password="pw")
        self.other = User.objects.create_user(username="o", password="pw")
        self.client.force_login(self.user)
        self.doc = PersonalDocument.objects.create(user=self.user, title="모의", file="", document_type="mock", professor="김교수", course_name="선형대수",
                                                   summary="4문항 · 선형대수", summary_status=ProcessingStatus.DONE)
        self.exam = MockExam.objects.create(user=self.user, document=self.doc, course_code="선형대수", title="t", questions=qs(4))

    def url(self, index, exam=None):
        return f"/mypage/mock/{(exam or self.exam).pk}/discard/{index}/"

    def discard(self, index, **data):
        self.exam.refresh_from_db()                                                  # 화면이 늘 최신 문제 상태를 보내는 것처럼
        data.setdefault("fp", exam.question_fingerprint(self.exam.questions[index]))
        return self.client.post(self.url(index), data)

    def test_discarding_removes_the_question_shifts_the_numbers_and_records_the_snapshot(self):
        gone = self.exam.questions[1]
        res = self.discard(1, reason="too_hard")
        self.assertEqual(res.json(), {"ok": True, "remaining": 3})
        self.exam.refresh_from_db()
        self.assertEqual([q["q"] for q in self.exam.questions], [qs(4)[0]["q"], qs(4)[2]["q"], qs(4)[3]["q"]])
        row = DiscardedQuestion.objects.get()
        self.assertEqual((row.user, row.course_code, row.professor, row.qtype, row.reason), (self.user, "선형대수", "김교수", "mc", "too_hard"))
        self.assertEqual(row.question, gone)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.summary, "3문항 · 선형대수")                      # 카드의 문항 수도 맞춘다

    def test_an_unknown_reason_becomes_other_and_the_last_question_cannot_be_discarded(self):
        self.discard(0, reason="아무거나")
        self.assertEqual(DiscardedQuestion.objects.get().reason, "other")
        self.discard(0)
        self.discard(0)
        res = self.discard(0)                                                        # 1개 남음
        self.assertEqual(res.status_code, 400)
        self.assertIn("마지막 문제", res.json()["error"])
        self.exam.refresh_from_db()
        self.assertEqual(len(self.exam.questions), 1)

    def test_a_stale_page_cannot_discard_the_wrong_question(self):
        res = self.client.post(self.url(1), {"fp": "deadbeef00", "reason": "other"})
        self.assertEqual(res.status_code, 409)
        self.exam.refresh_from_db()
        self.assertEqual(len(self.exam.questions), 4)
        self.assertFalse(DiscardedQuestion.objects.exists())

    def test_only_the_owner_before_submission_with_a_valid_index(self):
        self.client.force_login(self.other)
        self.assertEqual(self.client.post(self.url(0), {}).status_code, 404)
        self.client.force_login(self.user)
        self.assertEqual(self.client.post(self.url(9), {}).status_code, 404)
        MockExam.objects.filter(pk=self.exam.pk).update(submitted_at="2026-01-01T00:00:00Z")
        res = self.client.post(self.url(0), {})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(self.client.get(self.url(0)).status_code, 405)
        self.assertFalse(DiscardedQuestion.objects.exists())

    def test_the_page_offers_discard_buttons_with_reasons_only_before_submission(self):
        html = self.client.get(self.exam.get_absolute_url()).content.decode()
        self.assertEqual(html.count("이 문제 버리기"), 4)
        for label in ("범위 밖 내용", "너무 어려움", "너무 쉬움", "문제가 이상함", "그냥 버림"):
            self.assertIn(label, html)
        self.assertIn(f'data-fp="{exam.question_fingerprint(self.exam.questions[0])}"', html)
        self.assertIn(f"/mypage/mock/{self.exam.pk}/discard/0/", html)
        self.client.post(self.exam.get_absolute_url(), {"a_0": "O"})
        self.assertNotIn("이 문제 버리기", self.client.get(self.exam.get_absolute_url()).content.decode())

    def test_after_discarding_the_remaining_exam_grades_with_the_new_length(self):
        self.discard(0)
        self.discard(0)
        self.exam.refresh_from_db()
        res = self.client.post(self.exam.get_absolute_url(), {"a_0": "1", "a_1": ""}, follow=True)
        self.exam.refresh_from_db()
        self.assertEqual(len(self.exam.results), 2)
        self.assertContains(res, "/ 2점")


class GuidanceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="g", password="pw")
        self.other = User.objects.create_user(username="o", password="pw")
        self.exam = MockExam.objects.create(user=self.user, course_code="선형대수", title="t", questions=qs(4))

    def drop(self, user, subject, kind, reason, text):
        DiscardedQuestion.objects.create(user=user, course_code=subject, qtype=kind, reason=reason, question={"type": kind, "q": text})

    def test_no_history_means_no_guidance(self):
        self.assertEqual(discards.guidance(self.user, "선형대수"), "")
        self.assertEqual(discards.guidance(self.user, ""), "")

    def test_recent_discards_are_listed_as_data_and_repeated_reasons_and_types_add_advice(self):
        for i in range(3):
            self.drop(self.user, "선형대수", "essay", "too_hard", f"어려운 서술형 문제 {i}")
        self.drop(self.user, "선형대수", "ox", "weird", "이상한 OX")
        self.drop(self.user, "다른과목", "mc", "too_easy", "다른 과목 문제")
        self.drop(self.other, "선형대수", "mc", "out_of_scope", "다른 사용자의 문제")
        text = discards.guidance(self.user, "선형대수")
        self.assertIn("<버린문제>", text)
        self.assertIn("[서술형 · 너무 어려움] 어려운 서술형 문제 2", text)
        self.assertNotIn("다른 과목 문제", text)                                    # 다른 과목은 섞이지 않는다
        self.assertNotIn("다른 사용자의 문제", text)                                  # 다른 사용자의 기록도
        self.assertIn("난이도를 낮추세요", text)                                      # too_hard 3개
        self.assertIn("서술형 문제를 자주 버렸습니다", text)                           # essay 3/4
        self.assertNotIn("문장이 모호하거나", text)                                    # weird는 1개라 아직 경향이 아니다

    def test_a_question_like_a_discarded_one_is_filtered_from_new_results(self):
        self.drop(self.user, "선형대수", "ox", "weird", "행렬의 곱셈에서 교환법칙이 항상 성립한다는 명제는 참인가?")
        pairs = [({"type": "ox", "q": "행렬의 곱셈에서 교환법칙이 항상 성립한다는 명제는 참인가?"}, "s"),
                 ({"type": "ox", "q": "가역행렬의 행렬식은 0이 아니다."}, "s")]
        kept = discards.exclude_discarded(pairs, self.user, "선형대수")
        self.assertEqual([q["q"] for q, _ in kept], ["가역행렬의 행렬식은 0이 아니다."])
        self.assertEqual(len(discards.exclude_discarded(pairs, self.other, "선형대수")), 2)      # 다른 사용자에게는 영향 없음

    def test_the_history_is_capped_per_user(self):
        for i in range(discards.KEEP_PER_USER + 5):
            discards.record(self.user, self.exam, {"type": "ox", "q": f"q{i}"}, "other")
        self.assertEqual(DiscardedQuestion.objects.filter(user=self.user).count(), discards.KEEP_PER_USER)


class GenerationUsesDiscardsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        self.doc = PersonalDocument.objects.create(user=self.user, title="강의", file="a.txt", extracted_text=SUMMARY, summary=SUMMARY,
                                                   summary_status=ProcessingStatus.DONE, document_type="lecture", course_name="선형대수")

    def ox(self, q, source="행렬의 곱셈은 교환법칙이 일반적으로 성립하지 않는다"):
        return {"type": "ox", "q": q, "answer": True, "explanation": "e", "source": source}

    def test_the_prompt_carries_the_discard_guidance_and_new_duplicates_are_dropped(self):
        DiscardedQuestion.objects.create(user=self.user, course_code="선형대수", qtype="ox", reason="out_of_scope",
                                         question={"type": "ox", "q": "버렸던 문제: 행렬의 곱셈에서 교환법칙은 항상 성립한다."})
        questions = [self.ox(f"새 문제 {i} 대각합과 행렬식") for i in range(6)] + [self.ox("버렸던 문제: 행렬의 곱셈에서 교환법칙은 항상 성립한다.")]
        with patch("core.ai.complete_json", return_value={"title": "t", "questions": questions}) as ai:
            mock = exam.generate_mock_exam(self.user, [self.doc])
        prompt, system = ai.call_args.args[1][1]["content"], ai.call_args.args[1][0]["content"]
        self.assertIn("사용자가 이 과목의 모의고사에서 버린 문제", prompt)
        self.assertIn("버렸던 문제: 행렬의 곱셈", prompt)
        self.assertIn("'사용자가 버린 문제'가 주어지면", system)
        self.assertEqual(len(mock.questions), 6)
        self.assertNotIn("버렸던 문제", " ".join(q["q"] for q in mock.questions))             # 같은 문제는 서버가 걸러 낸다

    def test_without_discards_the_prompt_has_no_such_block(self):
        with patch("core.ai.complete_json", return_value={"title": "t", "questions": [self.ox(f"문제 {i} 다른 말") for i in range(6)]}) as ai:
            exam.generate_mock_exam(self.user, [self.doc])
        self.assertNotIn("버린 문제입니다", ai.call_args.args[1][1]["content"])


class StyleLengthTests(TestCase):
    def test_long_style_guidelines_are_kept_up_to_the_setting_and_the_prompt_asks_for_detail(self):
        from django.test import override_settings

        from .models import ExamStyle

        long = "\n".join(f"- 아주 자세한 지시 {i}: " + "상세 " * 40 for i in range(40))
        self.assertGreater(len(long), 2000)
        user = User.objects.create_user(username="s", password="pw")
        PersonalDocument.objects.create(user=user, title="족보", file="a.txt", extracted_text="1. 문제입니다", document_type="exam", professor="김교수",
                                        course_name="선형대수", summary_status=ProcessingStatus.DONE)
        with patch("core.ai.complete_json", return_value={"mix": {"mc": 1}, "difficulty": "어렵다", "traits": [f"특징{i}" for i in range(12)], "guidelines": long}) as ai:
            style = exam.refresh_style("김교수", "선형대수")
        self.assertEqual(len(style.guidelines), len(long.strip()))                              # 예전 2000자 제한에 잘리지 않는다
        self.assertEqual(len(style.profile["traits"]), 12)
        self.assertIn("길어도 좋으니", ai.call_args.args[1][0]["content"])
        with override_settings(AI_STYLE_MAX_CHARS=500):
            with patch("core.ai.complete_json", return_value={"mix": {}, "guidelines": long}):
                ExamStyle.objects.all().delete()
                self.assertEqual(len(exam.refresh_style("김교수", "선형대수").guidelines), 500)       # 설정으로 조절

    def test_the_style_output_budget_is_larger(self):
        from core.ai import MAX_OUTPUT_TOKENS

        self.assertGreaterEqual(MAX_OUTPUT_TOKENS["exam_style"], 4000)
