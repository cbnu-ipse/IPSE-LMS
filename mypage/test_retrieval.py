from django.contrib.auth import get_user_model
from django.test import TestCase

from . import exam, retrieval
from .models import PersonalDocument

User = get_user_model()

TEXT = (
    "# 행렬식\n행렬식은 정사각행렬에 대응하는 스칼라이다. 2x2 행렬의 행렬식은 ad - bc 이다.\n\n"
    "가역행렬은 행렬식이 0이 아닌 행렬이다. 역행렬 공식은 행렬식으로 나눈 수반행렬이다.\n\n"
    "# 고윳값\n고윳값은 det(A - λI) = 0 의 근이다. 특성다항식을 풀어서 구한다.\n\n"
    "# 벡터공간\n부분공간이 되려면 영벡터를 포함하고 덧셈과 스칼라배에 닫혀 있어야 한다.")


class ChunkAndSearchTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="r", password="pw")
        self.doc = PersonalDocument.objects.create(user=self.user, title="선형대수 노트", file="", extracted_text=TEXT)

    def test_korean_particles_still_match(self):
        hit = retrieval.search([self.doc], "행렬식을 어떻게 구해?")[0]
        self.assertIn("행렬식", hit["text"])
        hit = retrieval.search([self.doc], "부분공간 조건")[0]
        self.assertIn("영벡터", hit["text"])

    def test_most_relevant_passage_comes_first_and_unrelated_query_finds_nothing(self):
        long_doc = PersonalDocument.objects.create(user=self.user, title="긴 자료", file="",
                                                   extracted_text="\n\n".join(f"{i}번째 문단은 운영체제의 페이징과 스케줄링을 다룬다. " * 3 for i in range(40)) + "\n\n고윳값 분해는 대각화이다.")
        top = retrieval.search([long_doc], "고윳값 분해")[0]
        self.assertIn("대각화", top["text"])
        self.assertEqual(top["part"], top["parts"])
        self.assertEqual(retrieval.search([self.doc], "zzzqqq"), [])
        self.assertEqual(retrieval.search([self.doc], ""), [])

    def test_chunks_respect_size_and_keep_order(self):
        chunks = retrieval.split_chunks("가나다 라마바. " * 400)
        self.assertTrue(all(len(c) <= retrieval.CHUNK_MAX + 20 for c in chunks))
        self.assertGreater(len(chunks), 3)

    def test_format_passages_includes_source(self):
        text = retrieval.format_passages(retrieval.search([self.doc], "고윳값"))
        self.assertIn("선형대수 노트", text)
        self.assertIn("번째 부분", text)


class ExamMaterialTests(TestCase):
    def setUp(self):
        user = User.objects.create_user(username="m", password="pw")
        self.doc = PersonalDocument.objects.create(user=user, title="노트", file="", extracted_text=TEXT, summary="요약본 내용")

    def test_original_text_is_used_when_it_fits_and_summary_otherwise(self):
        self.assertIn("ad - bc", exam.build_material([self.doc], original=True))
        self.assertIn("요약본 내용", exam.build_material([self.doc]))
        with self.settings():
            old = exam.ORIGINAL_CHARS
            exam.ORIGINAL_CHARS = 10
            try:
                self.assertIn("요약본 내용", exam.build_material([self.doc], original=True))
            finally:
                exam.ORIGINAL_CHARS = old


class OriginalModeExamTests(TestCase):
    QUOTE = "안전 상태란 모든 프로세스가 끝까지 실행될 수 있는 순서가 존재하는 상태를 말한다"

    def questions(self, source):
        return {"title": "t", "questions": [{"type": "ox", "q": f"OX {i}", "answer": True, "explanation": "e", "source": source} for i in range(10)]}

    def make(self):
        user = User.objects.create_user(username="o", password="pw")
        doc = PersonalDocument.objects.create(user=user, title="OS", file="", document_type="lecture", course_name="운영체제",
                                              extracted_text=f"# 교착상태\n{self.QUOTE}. 불안전 상태는 교착 가능성이 있다.", summary="## 교착상태\n- 요약만 있는 문장", summary_status="done")
        return user, doc

    def test_prompt_uses_original_text_and_questions_quoting_it_are_kept(self):
        from unittest.mock import patch

        user, doc = self.make()
        with patch("core.ai.complete_json", return_value=self.questions(self.QUOTE)) as ai:
            made = exam.generate_mock_exam(user, [doc])
        prompt = ai.call_args.args[1][1]["content"]
        self.assertIn(self.QUOTE, prompt)
        self.assertNotIn("요약만 있는 문장", prompt)
        self.assertEqual(len(made.questions), 10)

    def test_questions_quoting_text_not_in_the_prompt_are_dropped(self):
        from unittest.mock import patch

        user, doc = self.make()
        with patch("core.ai.complete_json", return_value=self.questions("자료에 전혀 없는 지어낸 문장입니다 엉터리")):
            with self.assertRaises(ValueError):
                exam.generate_mock_exam(user, [doc])

    def test_focus_terms_add_original_passages(self):
        from unittest.mock import patch

        user, doc = self.make()
        doc.extracted_text = "# 다른 이야기\n" + "무관한 문장입니다. " * 4000 + f"\n\n# 교착상태\n{self.QUOTE}. 불안전 상태는 교착 가능성이 있다."
        doc.save()
        with patch("core.ai.complete_json", return_value=self.questions(self.QUOTE)) as ai:
            exam.generate_mock_exam(user, [doc], focus={"text": "교착상태", "terms": ["안전 상태"]})
        self.assertIn("주제어 관련 원문 발췌", ai.call_args.args[1][1]["content"])
