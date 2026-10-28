import base64

from django.contrib.auth import get_user_model
from django.test import TestCase

from . import wrongnotes
from .exam import _normalize_mock_question
from .figure import data_uri, normalize_figure, sanitize_svg
from .models import MockExam, WrongNote

User = get_user_model()

GOOD = ("<svg viewBox='0 0 200 100'><rect x='10' y='10' width='40' height='60' fill='#334155'/>"
        "<text x='10' y='90' font-size='12'>A &lt; B</text><line x1='0' y1='80' x2='200' y2='80' stroke='#334155'/></svg>")


class SanitizeTests(TestCase):
    def test_keeps_safe_shapes_and_text(self):
        out = sanitize_svg(GOOD)
        self.assertIn("<rect", out)
        self.assertIn("A &lt; B", out)
        self.assertIn('xmlns="http://www.w3.org/2000/svg"', out)

    def test_removes_scripts_events_styles_and_external_references(self):
        out = sanitize_svg("<svg viewBox='0 0 9 9' onload='x()' style='background:url(http://e)'>"
                           "<rect width='3' height='3' onclick='x()' fill='url(http://evil/x)' stroke='red'/></svg>")
        for bad in ("onload", "onclick", "style", "evil", "url("):
            self.assertNotIn(bad, out)
        self.assertIn('stroke="red"', out)

    def test_rejects_dangerous_or_broken_documents(self):
        for bad in ("<svg viewBox='0 0 9 9'><script>alert(1)</script></svg>",
                    "<svg viewBox='0 0 9 9'><foreignObject><div/></foreignObject></svg>",
                    "<svg viewBox='0 0 9 9'><image href='http://x/y.png'/></svg>",
                    "<!DOCTYPE svg [<!ENTITY a 'b'>]><svg viewBox='0 0 9 9'/>",
                    "<svg viewBox='0 0 9 9'><rect></svg>", "<div/>", "", None, "x" * 20000,
                    "<svg viewBox='0 0 9 9'>" + "<rect/>" * 500 + "</svg>"):
            self.assertIsNone(sanitize_svg(bad), bad)

    def test_width_height_become_viewbox_and_size_attrs_are_dropped(self):
        out = sanitize_svg("<svg width='120px' height='80'><circle cx='5' cy='5' r='3'/></svg>")
        self.assertIn('viewBox="0 0 120.0 80.0"', out)
        self.assertNotIn('width=', out)
        self.assertIsNone(sanitize_svg("<svg><circle r='3'/></svg>"))

    def test_data_uri_is_an_svg_image(self):
        uri = data_uri({"svg": GOOD})
        self.assertTrue(uri.startswith("data:image/svg+xml;base64,"))
        self.assertIn(b"<rect", base64.b64decode(uri.split(",", 1)[1]))
        self.assertEqual(data_uri({"svg": "<svg><script/></svg>"}), "")
        self.assertEqual(data_uri(None), "")


class QuestionFigureTests(TestCase):
    def test_figure_is_kept_on_any_question_type_and_bad_figure_only_drops_the_figure(self):
        q = _normalize_mock_question({"type": "ox", "q": "그림을 보고 답하세요", "answer": True,
                                      "figure": {"svg": GOOD, "alt": "막대 하나"}})
        self.assertEqual(q["figure"]["alt"], "막대 하나")
        bad = _normalize_mock_question({"type": "short", "q": "문제", "answers": ["a"], "figure": {"svg": "<svg><script/></svg>"}})
        self.assertNotIn("figure", bad)
        self.assertEqual(bad["answers"], ["a"])
        self.assertIsNone(normalize_figure("text"))


class FigureViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="fg", password="pw")
        self.client.force_login(self.user)
        self.exam = MockExam.objects.create(user=self.user, course_code="통계", title="통계 모의고사", questions=[
            {"type": "ox", "q": "히스토그램에서 막대는 붙인다.", "answer": True, "explanation": "",
             "figure": {"svg": sanitize_svg(GOOD), "alt": "막대 하나"}}])

    def test_exam_page_shows_the_figure(self):
        self.assertContains(self.client.get(self.exam.get_absolute_url()), 'src="data:image/svg+xml;base64,')

    def test_wrong_note_keeps_and_shows_the_figure(self):
        self.client.post(self.exam.get_absolute_url(), {"a_0": "X"})
        note = WrongNote.objects.get(user=self.user)
        self.assertIn("svg", note.question["figure"])
        self.assertContains(self.client.get("/mypage/wrong/"), 'src="data:image/svg+xml;base64,')
