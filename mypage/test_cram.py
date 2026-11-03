import io
import json
import shutil
import tempfile
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image

from accounts import credits
from core import ai as core_ai
from core.testing import use_up

from . import cram, notepage
from .models import PersonalDocument, ProcessingStatus
from .test_exam import make_doc

User = get_user_model()
NOTE = PersonalDocument.DocumentType.NOTE

NOTE_JSON = {
    "title": "운영체제 5분 노트",
    "sections": [
        {"heading": "프로세스 vs 스레드", "points": ["**프로세스** = 자원 단위", "스레드 = ==실행== 단위, 코드·힙 공유"]},
        {"heading": "스케줄링", "points": ["FCFS → 호위 효과", "$T_{wait} = \\mu + \\sigma$"]},
    ],
    "memo": ["교착상태 4조건 외우기"],
}


def ai_returns(data):
    """core.ai.chat이 data(JSON)를 답한 것처럼 돌려주는 패치."""
    message = type("M", (), {"content": json.dumps(data, ensure_ascii=False)})()
    response = type("R", (), {"choices": [type("C", (), {"message": message})()]})()
    return patch("core.ai.chat", return_value=response)


class _FakeThread:
    started = []

    def __init__(self, target=None, args=(), daemon=None):
        self.target, self.args = target, args

    def start(self):
        _FakeThread.started.append((self.target, self.args))


class NormalizeTests(TestCase):
    def test_drops_malformed_items_and_limits_sizes(self):
        data = {"title": "  제목  ", "sections": ["x", {"heading": "", "points": ["a"]}, {"heading": "A", "points": []},
                                               {"heading": "B", "points": ["b" * 500, "", None]}],
                "memo": ["m"] * 20}
        note = cram.normalize_note(data)
        self.assertEqual(note["title"], "제목")
        self.assertEqual([s["heading"] for s in note["sections"]], ["B"])
        self.assertEqual(len(note["sections"][0]["points"]), 1)
        self.assertLessEqual(len(note["sections"][0]["points"][0]), cram.FIELD_CHARS)
        self.assertEqual(len(note["memo"]), cram.MAX_MEMO)

    def test_non_dict_gives_empty_note(self):
        self.assertEqual(cram.normalize_note([1, 2])["sections"], [])


class ParseNoteJsonTests(TestCase):
    def test_unescaped_latex_backslashes_are_kept_not_fatal(self):
        raw = r'{"a": "$\frac{1}{2}\theta \det(A-\lambda I)$ \[x\] 줄\n바꿈 \"인용\" \\이미"}'
        self.assertEqual(cram.parse_note_json(raw)["a"], '$\\frac{1}{2}\\theta \\det(A-\\lambda I)$ \\[x\\] 줄\n바꿈 "인용" \\이미')

    def test_plain_json_and_fenced_json_still_parse(self):
        self.assertEqual(cram.parse_note_json('{"a": 1}'), {"a": 1})
        self.assertEqual(cram.parse_note_json('```json\n{"a": "b"}\n```'), {"a": "b"})

    def test_build_survives_latex_backslashes_in_ai_answer(self):
        media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, media, True)
        user = User.objects.create_user(username="u", password="pw")
        doc = make_doc(user)
        note = PersonalDocument.objects.create(user=user, title="n", file="", document_type=NOTE,
                                               summary_status=ProcessingStatus.PROCESSING)
        raw = ('{"title": "수학", "sections": [{"heading": "고윳값", "points": ["$\\det(A-\\lambda I)=0$", "$\\frac{1}{2}$", "**끝**"]}], "memo": []}')
        message = type("M", (), {"content": raw})()
        response = type("R", (), {"choices": [type("C", (), {"message": message})()]})()
        with override_settings(MEDIA_ROOT=media), patch("core.ai.chat", return_value=response):
            cram.build_note_document(note.pk, [doc.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.DONE)


class RenderTests(TestCase):
    def test_short_note_is_one_a4_page(self):
        pages = notepage.render_notes(cram.normalize_note(NOTE_JSON))
        self.assertEqual(len(pages), 1)
        image = Image.open(io.BytesIO(pages[0]))
        self.assertEqual(image.format, "PNG")
        self.assertEqual(image.size, (notepage.WIDTH, notepage.HEIGHT))

    def test_short_note_gets_bigger_letters_to_fill_the_page_instead_of_leaving_blank_space(self):
        note = cram.normalize_note(NOTE_JSON)
        k = notepage._layout(note, notepage.MAX_SCALE, None).k
        self.assertEqual(len(notepage._layout(note, k, None).pages), 1)
        self.assertGreater(notepage.MAX_SCALE, 1.0)                       # 짧은 노트는 기본보다 크게 쓸 수 있다
        words = [op for page in notepage._layout(note, 1.0, None).pages for op in page if op[0] == "word"]
        self.assertTrue(words)
        bottom = max(op[2] + op[3] for op in words)
        self.assertLess(bottom, notepage.HEIGHT)                          # 넘치지 않는다

    def test_overflow_continues_on_next_page_without_dropping_content(self):
        big = cram.normalize_note({"title": "큰 노트", "memo": ["확인 " * 10] * 6,
                                   "sections": [{"heading": f"주제{i}", "points": [f"항목{i}-{j} " + "긴 문장 " * 12 for j in range(6)]}
                                                for i in range(7)]})
        lay = notepage._layout(big, notepage.MIN_SCALE, None)
        self.assertGreater(len(lay.pages), 1)
        pages = notepage.render_notes(big)
        self.assertEqual(len(pages), len(lay.pages))
        for png in pages:
            self.assertEqual(Image.open(io.BytesIO(png)).size, (notepage.WIDTH, notepage.HEIGHT))
        words = [op[4] for page in lay.pages for op in page if op[0] == "word"]
        for i in range(7):                                               # 모든 항목이 어느 쪽에든 그려진다
            for j in range(6):
                self.assertIn(f"항목{i}-{j}", words)

    def test_no_op_goes_below_page_bottom_or_past_the_right_margin(self):
        big = cram.normalize_note({"title": "t", "sections": [{"heading": f"h{i}", "points": ["내용 " * 30 + "x" * 300] * 6} for i in range(7)],
                                   "memo": ["m"] * 6})
        for k in (notepage.MIN_SCALE, 1.0, notepage.MAX_SCALE):
            lay = notepage._layout(big, k, None)
            for page in lay.pages:
                for op in page:
                    if op[0] == "word":
                        _, x, y, size, text, style, _color, _gap = op
                        self.assertLess(y + size, notepage.HEIGHT)
                        self.assertLessEqual(x + notepage._style_font(size, style).getlength(text), notepage.WIDTH - notepage.MARGIN_X + 1)

    def test_memo_box_is_never_split_across_pages(self):
        note = cram.normalize_note({"title": "t", "sections": [{"heading": f"h{i}", "points": ["내용 " * 18] * 6} for i in range(7)],
                                    "memo": ["꼭 확인 " * 8] * 6})
        for k in (notepage.MIN_SCALE, 1.0):
            lay = notepage._layout(note, k, None)
            boxes = [i for i, page in enumerate(lay.pages) for op in page if op[0] == "box"]
            titles = [i for i, page in enumerate(lay.pages) for op in page if op[0] == "memo_title"]
            self.assertEqual(boxes, titles)                                # 제목과 상자가 같은 쪽에 있다

    def test_long_heading_is_shrunk_to_one_line(self):
        size = notepage._fit_heading(notepage.to_markup("가" * 40), notepage.HEAD_SIZE)
        self.assertLess(size, notepage.HEAD_SIZE)
        self.assertEqual(notepage._fit_heading(notepage.to_markup("짧은 제목"), notepage.HEAD_SIZE), notepage.HEAD_SIZE)

    def test_latex_environments_are_flattened_not_leaked(self):
        out = notepage.to_markup(r"$A^{-1} = \frac{1}{ad-bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}$")
        self.assertNotIn("begin", out)
        self.assertNotIn("end", out)
        self.assertNotIn("&", out)
        self.assertNotIn("\\", out)
        self.assertIn("[d -b; -c a]", out)

    def test_real_symbols_are_kept_not_spelled_out(self):
        out = notepage.to_markup(r"$\mu \pm 2\sigma$ $\theta \le \pi$ $Av=\lambda v$ → ≤ ∞ ① ✓")
        for symbol in ("μ", "±", "σ", "θ", "≤", "π", "λ", "→", "∞", "①", "✓"):
            self.assertIn(symbol, out)
        self.assertIn("Av=λv", out)                                       # 그리스 문자 뒤 띄어쓰기는 LaTeX처럼 무시
        self.assertIn("θ ≤ π", out)                                       # 연산자 둘레 띄어쓰기는 그대로

    def test_glyphs_missing_from_the_font_are_dropped_and_script_letters_become_sub_sup(self):
        out = notepage.to_markup("점수 😀 A\u1d40 x\u1d62\u00b2 $\\mathbb{R}^2$")
        self.assertNotIn("😀", out)
        self.assertIn("A<sup>T</sup>", out)
        self.assertIn("x<sub>i</sub><sup>2</sup>", out)
        self.assertIn("ℝ<sup>2</sup>", out)                               # ℝ는 수학 글꼴에 있어 진짜 기호로

    def test_bold_red_and_highlight_styles_are_parsed(self):
        segs = notepage.parse_segments(notepage.to_markup("일반 **굵게** ==형광펜== 끝"))
        self.assertIn(("굵게", frozenset({"b"})), segs)
        self.assertIn(("형광펜", frozenset({"m"})), segs)

    def test_unsupported_glyphs_do_not_crash(self):
        note = {"title": "Σ μ → ≤ x̄ ∞", "sections": [{"heading": "α β", "points": ["x² ≥ 1 ✓ 😀 $\\bar{x}$ $a_i^2$"]}], "memo": []}
        self.assertTrue(notepage.render_notes(note)[0].startswith(b"\x89PNG"))

    def test_note_is_a_white_typed_page_not_lined_notebook_paper(self):
        png = notepage.render_notes(cram.normalize_note(NOTE_JSON))[0]
        image = Image.open(io.BytesIO(png)).convert("RGB")
        self.assertEqual(image.getpixel((5, 5)), (255, 255, 255))         # 종이 색·결·공책 줄 없이 흰 쪽
        self.assertEqual(image.getpixel((notepage.WIDTH - 5, notepage.HEIGHT // 2)), (255, 255, 255))


class BuildNoteTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        self.user = User.objects.create_user(username="u", password="pw")

    def _placeholder(self):
        return PersonalDocument.objects.create(user=self.user, title="n", file="", document_type=NOTE,
                                               summary_status=ProcessingStatus.PROCESSING)

    def test_builds_png_document_from_selected_sources(self):
        a, b = make_doc(self.user, "a", summary="요약 A"), make_doc(self.user, "b", summary="요약 B")
        note = self._placeholder()
        with override_settings(MEDIA_ROOT=self.media), ai_returns(NOTE_JSON) as ai:
            cram.build_note_document(note.pk, [a.pk, b.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.DONE)
        self.assertTrue(note.file.name.endswith(".png"))
        self.assertEqual(note.title, "운영체제 5분 노트")
        self.assertIn("프로세스 vs 스레드", note.summary)
        self.assertEqual(ai.call_args.kwargs["cost"], cram.note_cost(2))      # 정액
        request = ai.call_args[0][1][1]["content"]
        self.assertIn("요약 A", request)
        self.assertIn("요약 B", request)

    def test_other_users_documents_are_not_read(self):
        other = User.objects.create_user(username="o", password="pw")
        secret = make_doc(other, "s", summary="남의 요약")
        note = self._placeholder()
        with override_settings(MEDIA_ROOT=self.media), ai_returns(NOTE_JSON) as ai:
            cram.build_note_document(note.pk, [secret.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.FAILED)
        ai.assert_not_called()

    def test_thin_ai_answer_fails_and_refunds(self):
        doc = make_doc(self.user)
        note = self._placeholder()
        with override_settings(MEDIA_ROOT=self.media), ai_returns({"title": "x", "sections": []}), \
                patch("core.ai.refund") as refund:
            cram.build_note_document(note.pk, [doc.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.FAILED)
        refund.assert_called_once()

    @override_settings(AI_CREDIT_COSTS={"cram_note": 1})
    def test_render_failure_refunds_once(self):
        doc = make_doc(self.user)
        note = self._placeholder()
        with override_settings(MEDIA_ROOT=self.media), ai_returns(NOTE_JSON), \
                patch("mypage.notepage.render_notes", side_effect=OSError("boom")), patch("core.ai.refund") as refund:
            cram.build_note_document(note.pk, [doc.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.FAILED)
        refund.assert_called_once()


@override_settings(AI_CREDIT_COSTS={"cram_note": 2})
class CreateViewTests(TestCase):
    def setUp(self):
        _FakeThread.started = []
        self.user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(self.user)
        self.url = reverse("mypage:cram_note_create")

    def _post(self, ids, **extra):
        with patch("mypage.views.threading.Thread", _FakeThread):
            return self.client.post(self.url, {"ids": ids, **extra})

    def test_creates_processing_note_and_starts_worker(self):
        a = make_doc(self.user, "a", course_name="운영체제")
        b = make_doc(self.user, "b", course_name="운영체제")
        credits.grant(self.user, 10, "admin_grant", "t")
        response = self._post([a.pk, b.pk])
        self.assertEqual(response.status_code, 302)
        note = PersonalDocument.objects.get(document_type=NOTE)
        self.assertEqual(note.summary_status, ProcessingStatus.PROCESSING)
        self.assertEqual(note.course_name, "운영체제")
        self.assertEqual(note.title, "운영체제 속성 노트")
        self.assertEqual(len(_FakeThread.started), 1)
        self.assertEqual(sorted(_FakeThread.started[0][1][1]), sorted([a.pk, b.pk]))

    def test_rejects_empty_selection_and_foreign_documents(self):
        other = User.objects.create_user(username="o", password="pw")
        credits.grant(self.user, 10, "admin_grant", "t")
        self._post([])
        self._post([make_doc(other).pk])
        self.assertFalse(PersonalDocument.objects.filter(document_type=NOTE).exists())
        self.assertEqual(_FakeThread.started, [])

    def test_notes_cannot_be_sources(self):
        note = PersonalDocument.objects.create(user=self.user, title="n", file="x.png", document_type=NOTE, summary="s")
        credits.grant(self.user, 10, "admin_grant", "t")
        self._post([note.pk])
        self.assertEqual(PersonalDocument.objects.filter(document_type=NOTE).count(), 1)
        self.assertEqual(_FakeThread.started, [])

    def test_too_many_sources_rejected(self):
        credits.grant(self.user, 10, "admin_grant", "t")
        ids = [make_doc(self.user, f"d{i}").pk for i in range(cram.MAX_SOURCES + 1)]
        self._post(ids)
        self.assertEqual(_FakeThread.started, [])

    @override_settings(AI_WEEKLY_LIMIT_POINTS=100)
    def test_weekly_limit_used_up_blocks_start(self):
        doc = make_doc(self.user)
        use_up(self.user, 101)
        self._post([doc.pk])
        self.assertFalse(PersonalDocument.objects.filter(document_type=NOTE).exists())
        self.assertEqual(_FakeThread.started, [])

    @override_settings(AI_WEEKLY_LIMIT_POINTS=100)
    def test_cost_is_flat_per_note_not_per_document(self):
        a, b, c = (make_doc(self.user, n) for n in "abc")
        use_up(self.user, 97)                                   # 남은 3: 자료 3개여도 정액 2라서 시작할 수 있다
        self._post([a.pk, b.pk, c.pk])
        self.assertEqual(PersonalDocument.objects.filter(document_type=NOTE).count(), 1)
        self.assertEqual(cram.note_cost(1), cram.note_cost(8))

    def test_login_required(self):
        self.client.logout()
        self.assertEqual(self.client.post(self.url, {"ids": [1]}).status_code, 302)


class PagesTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(self.user)

    def test_upload_form_does_not_offer_note_type(self):
        values = [v for v, _ in self.client.get(reverse("mypage:document_list")).context["form"].fields["document_type"].choices]
        self.assertNotIn("note", values)

    def test_list_shows_note_and_hides_resummarize_when_failed(self):
        PersonalDocument.objects.create(user=self.user, title="실패 노트", file="", document_type=NOTE,
                                        summary_status=ProcessingStatus.FAILED)
        html = self.client.get(reverse("mypage:document_list")).content.decode()
        self.assertIn("노트를 만들지 못했어요", html)
        self.assertNotIn("요약 실패 · 다시 만들기", html)

    def test_stale_processing_note_becomes_failed(self):
        from datetime import timedelta
        from django.utils import timezone

        note = PersonalDocument.objects.create(user=self.user, title="n", file="", document_type=NOTE,
                                               summary_status=ProcessingStatus.PROCESSING)
        PersonalDocument.objects.filter(pk=note.pk).update(uploaded_at=timezone.now() - timedelta(minutes=30))
        self.client.get(reverse("mypage:document_list"))
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.FAILED)

    def test_note_detail_page_and_owner_only(self):
        note = PersonalDocument.objects.create(user=self.user, title="노트", file="personal_docs/x.png", document_type=NOTE,
                                               summary="s", summary_status=ProcessingStatus.DONE)
        html = self.client.get(note.get_absolute_url()).content.decode()
        self.assertIn("이미지 저장", html)
        self.client.force_login(User.objects.create_user(username="o", password="pw"))
        self.assertEqual(self.client.get(note.get_absolute_url()).status_code, 403)

    def test_notes_are_not_course_or_exam_material(self):
        from course.studio import eligible_docs
        from .exam import exam_docs

        PersonalDocument.objects.create(user=self.user, title="노트", file="x.png", document_type=NOTE, summary="s",
                                        extracted_text="t", summary_status=ProcessingStatus.DONE, professor="김")
        self.assertEqual(eligible_docs("운영체제"), [])
        self.assertEqual(exam_docs("김", "운영체제"), [])


class FailureReasonTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        self.user = User.objects.create_user(username="u", password="pw")
        self.doc = make_doc(self.user)
        self.note = PersonalDocument.objects.create(user=self.user, title="n", file="", document_type=NOTE,
                                                    summary_status=ProcessingStatus.PROCESSING)

    def _build(self, patcher):
        with override_settings(MEDIA_ROOT=self.media), patcher:
            cram.build_note_document(self.note.pk, [self.doc.pk])
        self.note.refresh_from_db()
        self.assertEqual(self.note.summary_status, ProcessingStatus.FAILED)
        return self.note.summary

    def test_ai_failure_reason(self):
        self.assertIn("AI 서버", self._build(patch("core.ai.chat", side_effect=RuntimeError("down"))))

    def test_quota_reason(self):
        self.assertIn("이번 주 AI 사용 한도가 모자라", self._build(patch("core.ai.chat", side_effect=core_ai.AIQuotaExceeded("부족"))))

    def test_unreadable_answer_reason(self):
        message = type("M", (), {"content": "죄송합니다. JSON이 아닙니다"})()
        response = type("R", (), {"choices": [type("C", (), {"message": message})()]})()
        self.assertIn("읽을 수 없었습니다", self._build(patch("core.ai.chat", return_value=response)))

    def test_thin_content_reason(self):
        self.assertIn("충분히 찾지 못했습니다", self._build(ai_returns({"title": "x", "sections": []})))

    def test_render_failure_reason(self):
        with ai_returns(NOTE_JSON):
            reason = self._build(patch("mypage.notepage.render_notes", side_effect=OSError("font")))
        self.assertIn("이미지를 그리는 중", reason)

    def test_unreadable_sources_reason(self):
        PersonalDocument.objects.filter(pk=self.doc.pk).update(is_deleted=True)
        self.assertIn("읽을 수 없었습니다", self._build(patch("core.ai.chat")))

    def test_reason_is_shown_in_list_and_detail(self):
        PersonalDocument.objects.filter(pk=self.note.pk).update(summary_status=ProcessingStatus.FAILED, summary="이유 문구 테스트")
        self.client.force_login(self.user)
        self.assertIn("이유 문구 테스트", self.client.get(reverse("mypage:document_list")).content.decode())
        self.assertIn("이유 문구 테스트", self.client.get(self.note.get_absolute_url()).content.decode())


class MoveDocumentTests(TestCase):
    def setUp(self):
        from .models import PersonalFolder

        self.user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(self.user)
        self.folder = PersonalFolder.objects.create(user=self.user, name="운영체제")
        self.doc = make_doc(self.user)

    def _move(self, doc, folder):
        return self.client.post(reverse("mypage:document_move", args=[doc.pk]), {"folder": folder})

    def test_moves_into_folder_and_back_without_calling_ai(self):
        with patch("core.ai.chat") as chat, patch("core.ai.complete_json") as cj:
            self._move(self.doc, self.folder.pk)
            self.doc.refresh_from_db()
            self.assertEqual(self.doc.folder_id, self.folder.pk)
            self._move(self.doc, "")
            self.doc.refresh_from_db()
            self.assertIsNone(self.doc.folder_id)
        chat.assert_not_called()
        cj.assert_not_called()

    def test_cannot_move_to_or_from_other_users_folders(self):
        from .models import PersonalFolder

        other = User.objects.create_user(username="o", password="pw")
        theirs = PersonalFolder.objects.create(user=other, name="남의 폴더")
        self._move(self.doc, theirs.pk)
        self.doc.refresh_from_db()
        self.assertIsNone(self.doc.folder_id)
        foreign_doc = make_doc(other)
        self.assertEqual(self._move(foreign_doc, self.folder.pk).status_code, 403)

    def test_get_is_not_allowed(self):
        self.assertEqual(self.client.get(reverse("mypage:document_move", args=[self.doc.pk])).status_code, 405)

    def test_list_offers_move_button(self):
        html = self.client.get(reverse("mypage:document_list")).content.decode()
        self.assertIn("data-move-url", html)


class MultiPageNoteTests(TestCase):
    def test_overflow_creates_one_note_document_per_page(self):
        media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, media, True)
        user = User.objects.create_user(username="u", password="pw")
        src = make_doc(user, "a", course_name="운영체제")
        note = PersonalDocument.objects.create(user=user, title="n", file="", document_type=NOTE,
                                               summary_status=ProcessingStatus.PROCESSING)
        big = {"title": "큰 노트", "memo": ["확인 " * 10] * 6,
               "sections": [{"heading": f"주제{i}", "points": ["긴 문장 " * 12] * 6} for i in range(7)]}
        with override_settings(MEDIA_ROOT=media), ai_returns(big):
            cram.build_note_document(note.pk, [src.pk])
        notes = list(PersonalDocument.objects.filter(document_type=NOTE).order_by("id"))
        self.assertGreater(len(notes), 1)
        self.assertTrue(all(n.summary_status == ProcessingStatus.DONE and n.file.name.endswith(".png") for n in notes))
        self.assertTrue(notes[0].title.endswith(f"(1/{len(notes)})"))
        self.assertTrue(notes[-1].title.endswith(f"({len(notes)}/{len(notes)})"))


OLD_MARKDOWN = (
    "# 선형대수 속성 노트\n\n"
    "## 역행렬\n- 2x2 역행렬 $A^{-1} = 1/(ad-bc) * [[d, -b], [-c, a]]$\n- 분산 $s^2 = 1/(n-1) sum_{i=1}^n (x_i - x_bar)^2$\n\n"
    "## 정규분포\n- **약 95%** 가 mu ± 2 sigma 안에 있다\n- ==표준화== $z = (x - mu)/sigma$\n\n"
    "## 마지막 체크!\n- 분모는 ad-bc\n- n-1로 나눈다")


KINDS_JSON = {
    "title": "운영체제 5분 노트",
    "sections": [
        {"heading": "프로세스 vs 스레드", "kind": "table", "columns": ["", "프로세스", "스레드"],
         "rows": [["자원", "**독립된** 주소 공간", "코드·힙 ==공유=="], ["생성", "++fork++ 비용 큼", "가벼움 → 문맥 교환 ↓"]]},
        {"heading": "스케줄링", "kind": "tree", "points": [{"text": "**비선점**", "sub": ["FCFS → 호위 효과", "SJF"]}, {"text": "선점", "sub": ["RR"]}]},
        {"heading": "페이지 교체", "kind": "steps", "points": ["폴트 발생", {"text": "희생 선택", "sub": ["LRU"]}, "재실행"]},
        {"heading": "교착상태", "points": [{"text": "4조건", "sub": ["하나만 깨도 예방"]}, "회피 = 은행원"]},
    ],
    "memo": ["4조건 외우기"],
}


class SectionKindTests(TestCase):
    def test_normalize_reads_each_kind_and_falls_back_to_list(self):
        note = cram.normalize_note(KINDS_JSON)
        self.assertEqual([s["kind"] for s in note["sections"]], ["table", "tree", "steps", "list"])
        table, tree = note["sections"][0], note["sections"][1]
        self.assertEqual((table["columns"], len(table["rows"])), (["", "프로세스", "스레드"], 2))
        self.assertEqual((tree["points"], tree["subs"]), (["**비선점**", "선점"], [["FCFS → 호위 효과", "SJF"], ["RR"]]))
        bad_kind = cram.normalize_note({"sections": [{"heading": "h", "kind": "mindmap", "points": ["a"]}]})
        self.assertEqual(bad_kind["sections"][0]["kind"], "list")

    def test_broken_tables_are_dropped_or_read_as_lists_and_sizes_are_limited(self):
        one_col = {"heading": "표", "kind": "table", "columns": ["a"], "rows": [["1"]]}
        with_points = dict(one_col, points=["대신 목록"])
        wide = {"heading": "넓은 표", "kind": "table", "columns": ["a", "b", "c", "d", "e", "f"],
                "rows": [["1", "2|3"]] * 10 + ["x", ["", ""]]}
        note = cram.normalize_note({"sections": [one_col, with_points, wide]})
        self.assertEqual([(s["heading"], s["kind"]) for s in note["sections"]], [("표", "list"), ("넓은 표", "table")])
        table = note["sections"][1]
        self.assertEqual((len(table["columns"]), len(table["rows"])), (cram.MAX_COLS, cram.MAX_ROWS))
        self.assertEqual(table["rows"][0], ["1", "2/3", "", ""])               # 칸 수에 맞추고 | 는 표를 깨지 않게 바꾼다
        many = cram.normalize_note({"sections": [{"heading": "h", "points": [{"text": "a", "sub": ["s"] * 20}]}]})
        self.assertEqual(len(many["sections"][0]["subs"][0]), cram.MAX_SUBS)

    def test_markdown_round_trip_keeps_tables_numbering_and_sub_items(self):
        note = cram.normalize_note(KINDS_JSON)
        markdown = cram.note_markdown(note)
        self.assertIn("| 자원 | **독립된** 주소 공간 | 코드·힙 ==공유== |", markdown)
        self.assertIn("1. 폴트 발생", markdown)
        self.assertIn("  - LRU", markdown)
        again = cram.parse_note_markdown(markdown)
        tree = again["sections"][1]
        self.assertEqual((tree["kind"], tree["subs"]), ("list", [["FCFS → 호위 효과", "SJF"], ["RR"]]))     # 가지치기는 글에서는 중첩 목록
        for i in (0, 2, 3):
            self.assertEqual(again["sections"][i], note["sections"][i])

    def test_focus_terms_are_searched_in_tables_and_sub_items(self):
        note = cram.normalize_note(KINDS_JSON)
        note = cram._ensure_focus(note, ["스레드", "LRU"], "자료")
        self.assertEqual(note["memo"], ["4조건 외우기"])                       # 이미 표·세부 항목에 있어 마지막 체크에 더하지 않는다

    def test_prompt_asks_for_kinds_symbols_and_color_meanings(self):
        for word in ("table", "tree", "steps", "sub", "→", "++"):
            self.assertIn(word, cram.SYSTEM)


class KindRenderTests(TestCase):
    def test_every_kind_renders_inside_the_page(self):
        note = cram.normalize_note(KINDS_JSON)
        for k in (notepage.MIN_SCALE, 1.0, notepage.MAX_SCALE):
            for page in notepage._layout(note, k, None).pages:
                for op in page:
                    if op[0] == "rect":
                        _, x0, y0, x1, y1, _fill, _line = op
                        self.assertGreaterEqual(x0, notepage.MARGIN_X)
                        self.assertLessEqual(x1, notepage.WIDTH - notepage.MARGIN_X)
                        self.assertLess(y1, notepage.HEIGHT)
        pages = notepage.render_notes(note)
        self.assertTrue(all(p.startswith(b"\x89PNG") for p in pages))

    def test_outline_appears_only_with_three_or_more_sections_and_lists_emphasized_keywords(self):
        note = cram.normalize_note(KINDS_JSON)
        ops = [op for page in notepage._layout(note, 1.0, None).pages for op in page]
        self.assertIn("한눈에 보기", [op[4] for op in ops if op[0] == "memo_title"])
        words = [op[4] for op in ops if op[0] == "word"]
        self.assertIn("독립된", words)                                          # 표 칸의 강조어가 차례에도 올라온다
        short = cram.normalize_note({"sections": KINDS_JSON["sections"][:2]})
        ops = [op for page in notepage._layout(short, 1.0, None).pages for op in page]
        self.assertNotIn("한눈에 보기", [op[4] for op in ops if op[0] == "memo_title"])

    def test_table_header_is_repeated_on_the_next_page(self):
        rows = [[f"행{i}", "긴 설명 " * 12, "또 다른 긴 설명 " * 12] for i in range(6)]
        note = cram.normalize_note({"sections": [{"heading": "h", "points": ["내용 " * 25] * 6}] * 2 +
                                    [{"heading": "큰 표", "kind": "table", "columns": ["", "머리A", "머리B"], "rows": rows}]})
        lay = notepage._layout(note, notepage.MIN_SCALE, None)
        self.assertGreater(len(lay.pages), 1)
        heads = [sum(1 for op in page if op[0] == "word" and op[4] == "머리A") for page in lay.pages]
        self.assertTrue(all(h <= 1 for h in heads))
        pages_with_rows = [i for i, page in enumerate(lay.pages) if any(op[0] == "word" and op[4].startswith("행") for op in page)]
        for i in pages_with_rows:
            self.assertEqual(heads[i], 1)                                      # 표의 행이 있는 쪽마다 머리글이 있다

    def test_cyan_highlight_is_parsed_but_cpp_is_left_alone(self):
        segs = notepage.parse_segments(notepage.to_markup("++정의++ 와 C++ 그리고 C++"))
        self.assertIn(("정의", frozenset({"c"})), segs)
        self.assertEqual("".join(t for t, _ in segs), "정의 와 C++ 그리고 C++")
        self.assertEqual(notepage._keywords({"points": ["C++ 와 C++ 는 **포인터** 가 있다"]}), ["포인터"])

    def test_legend_shows_only_the_colors_used(self):
        def legend(note):
            ops = [op for page in notepage._layout(cram.normalize_note(note), 1.0, None).pages for op in page if op[0] == "legend"]
            return [name for name, _ in ops[0][4]] if ops else None
        self.assertEqual(legend(KINDS_JSON), ["red", "mark", "cyan"])
        self.assertEqual(legend({"sections": [{"heading": "h", "points": ["**핵심** 하나"]}]}), ["red"])
        self.assertIsNone(legend({"sections": [{"heading": "h", "points": ["평범한 글"]}]}))


class OldNoteUpgradeTests(TestCase):
    """옛 손글씨 노트(간이 표기로 쓴 글, 파일 이름 cram-note.png)를 새 디자인으로 바꾼다."""

    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        self.override = override_settings(MEDIA_ROOT=self.media)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.user = User.objects.create_user(username="old", password="pw")

    def old_note(self, markdown=OLD_MARKDOWN, title="선형대수 속성 노트"):
        from django.core.files.base import ContentFile

        doc = PersonalDocument.objects.create(user=self.user, title=title, file="", document_type=NOTE, summary=markdown, summary_status=ProcessingStatus.DONE)
        doc.file.save("cram-note.png", ContentFile(b"\x89PNG old handwritten"), save=True)
        return doc

    def test_markdown_round_trips_into_a_note_dict(self):
        note = cram.parse_note_markdown(OLD_MARKDOWN)
        self.assertEqual(note["title"], "선형대수 속성 노트")
        self.assertEqual([s["heading"] for s in note["sections"]], ["역행렬", "정규분포"])
        self.assertEqual(len(note["sections"][0]["points"]), 2)
        self.assertEqual(note["memo"], ["분모는 ad-bc", "n-1로 나눈다"])
        again = cram.parse_note_markdown(cram.note_markdown(note))
        self.assertEqual(again, note)                                      # 저장 → 복원이 손실 없이 돌아온다

    def test_opening_an_old_note_redraws_it_with_the_new_design(self):
        doc = self.old_note()
        old_name = doc.file.name
        self.client.force_login(self.user)
        res = self.client.get(reverse("mypage:document_preview", args=[doc.pk]))
        self.assertEqual(res.status_code, 200)
        doc.refresh_from_db()
        self.assertIn("cram-note-a4", doc.file.name)
        self.assertNotEqual(doc.file.name, old_name)
        self.assertTrue(doc.file.read(8).startswith(b"\x89PNG"))
        image = Image.open(doc.file.path)
        self.assertEqual(image.size, (notepage.WIDTH, notepage.HEIGHT))
        self.assertFalse(__import__("os").path.exists(__import__("os").path.join(self.media, old_name)))       # 옛 그림 파일은 지웠다

    def test_upgrade_does_not_call_ai_and_is_idempotent(self):
        doc = self.old_note()
        with patch("core.ai.chat") as chat, patch("core.ai.complete_json") as complete:
            self.assertEqual(cram.upgrade_note_group(doc), 1)
            doc.refresh_from_db()
            first = doc.file.name
            self.assertEqual(cram.upgrade_note_group(doc), 0)              # 이미 새 디자인이면 건드리지 않는다
            doc.refresh_from_db()
            self.assertEqual(doc.file.name, first)
        chat.assert_not_called()
        complete.assert_not_called()

    def test_multi_page_old_notes_are_upgraded_as_one_group(self):
        from django.core.files.base import ContentFile

        long_md = "# 긴 노트\n\n" + "\n".join(f"## 주제{i}\n" + "\n".join(f"- 항목 {i}-{j} " + "설명 " * 25 for j in range(6)) + "\n" for i in range(7)) + "\n## 마지막 체크!\n- 확인"
        first = self.old_note(long_md, "긴 노트 (1/2)")
        second = PersonalDocument.objects.create(user=self.user, title="긴 노트 (2/2)", file="", document_type=NOTE, summary=long_md, summary_status=ProcessingStatus.DONE)
        second.file.save("cram-note.png", ContentFile(b"\x89PNG old page 2"), save=True)
        total = cram.upgrade_note_group(first)
        group = cram.note_group(first)
        self.assertEqual(len(group), total)                                # 쪽 수만큼 문서가 있다 (늘면 더하고 줄면 지운다)
        self.assertTrue(all(cram.is_current_note(d) for d in group))
        self.assertEqual([d.title for d in group], [f"긴 노트 ({n}/{total})" for n in range(1, total + 1)] if total > 1 else ["긴 노트"])

    def test_notes_with_nothing_readable_or_a_render_failure_are_left_alone(self):
        empty = self.old_note("메모만 있는 글")
        self.assertEqual(cram.upgrade_note_group(empty), 0)
        doc = self.old_note()
        before = doc.file.name
        with patch("mypage.notepage.render_notes", side_effect=OSError("boom")):
            self.assertFalse(cram.upgrade_note_if_old(doc))                # 열람은 막지 않는다
        doc.refresh_from_db()
        self.assertEqual(doc.file.name, before)
        self.client.force_login(self.user)
        with patch("mypage.notepage.render_notes", side_effect=OSError("boom")):
            self.assertEqual(self.client.get(reverse("mypage:document_preview", args=[doc.pk])).status_code, 200)

    def test_new_notes_are_saved_under_the_new_file_name(self):
        doc = PersonalDocument.objects.create(user=self.user, title="n", file="", document_type=NOTE, summary_status=ProcessingStatus.PROCESSING)
        raw = json.dumps(NOTE_JSON, ensure_ascii=False)
        message = type("M", (), {"content": raw})()
        response = type("R", (), {"choices": [type("C", (), {"message": message})()]})()
        src = make_doc(self.user, "자료", summary="요약 " * 40)
        with patch("core.ai.chat", return_value=response):
            cram.build_note_document(doc.pk, [src.pk])
        doc.refresh_from_db()
        self.assertTrue(cram.is_current_note(doc))

    def test_management_command_upgrades_everything_and_supports_dry_run(self):
        from django.core.management import call_command

        a, b = self.old_note(), self.old_note(OLD_MARKDOWN.replace("선형대수", "통계"), "통계 속성 노트")
        out = io.StringIO()
        call_command("upgrade_notes", "--dry-run", stdout=out)
        self.assertIn("바꿀 노트: 2개", out.getvalue())
        a.refresh_from_db()
        self.assertFalse(cram.is_current_note(a))                          # 모의 실행은 아무것도 바꾸지 않는다
        out = io.StringIO()
        call_command("upgrade_notes", stdout=out)
        self.assertIn("바꾼 노트: 2개", out.getvalue())
        a.refresh_from_db()
        b.refresh_from_db()
        self.assertTrue(cram.is_current_note(a) and cram.is_current_note(b))
        out = io.StringIO()
        call_command("upgrade_notes", stdout=out)
        self.assertIn("바꾼 노트: 0개", out.getvalue())                       # 다시 돌려도 안전


class NoteTextViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tv", password="pw")
        self.client.force_login(self.user)
        self.doc = PersonalDocument.objects.create(user=self.user, title="노트", file="notes/x-a4.png", document_type=NOTE,
                                                   summary=OLD_MARKDOWN, summary_status=ProcessingStatus.DONE)

    def test_note_page_offers_a_text_view_with_latex_for_old_plain_math(self):
        res = self.client.get(reverse("mypage:document_preview", args=[self.doc.pk]))
        self.assertContains(res, 'data-tab="text"')
        self.assertContains(res, "글로 보기")
        text = res.context["note_text"]
        self.assertIn(r"\frac{1}{n-1}", text)
        self.assertIn(r"\begin{bmatrix}", text)
        self.assertIn(r"\mu", text)                                        # $ 없이 쓴 mu 도 수식으로
        self.assertContains(res, "markdown-lite.js")
        self.assertContains(res, "math-render.js")

    def test_text_view_data_is_embedded_safely(self):
        self.doc.summary = '# 제목\n\n## 섹션\n- </script><script>alert(1)</script> "따옴표" & <b>태그</b>\n- 항목'
        self.doc.save()
        html = self.client.get(reverse("mypage:document_preview", args=[self.doc.pk])).content.decode()
        self.assertNotIn("<script>alert(1)</script>", html)                # JSON으로 이스케이프돼 스크립트가 끼어들 수 없다
        self.assertIn("note-text-source", html)

    def test_only_the_owner_sees_the_note(self):
        other = User.objects.create_user(username="other", password="pw")
        self.client.force_login(other)
        self.assertEqual(self.client.get(reverse("mypage:document_preview", args=[self.doc.pk])).status_code, 403)

    def test_text_view_is_empty_while_the_note_is_still_processing(self):
        self.doc.summary_status = ProcessingStatus.PROCESSING
        self.doc.save()
        self.assertEqual(cram.note_text_markdown(self.doc), "")


class UpgradeSkipsUnreadableNotesTests(OldNoteUpgradeTests):
    def test_notes_whose_saved_text_has_no_sections_are_not_counted_or_touched(self):
        from django.core.management import call_command

        empty = self.old_note("# 노트")
        before = empty.file.name
        out = io.StringIO()
        call_command("upgrade_notes", "--dry-run", stdout=out)
        self.assertIn("바꿀 노트: 0개", out.getvalue())
        self.assertEqual(cram.upgrade_note_group(empty), 0)
        empty.refresh_from_db()
        self.assertEqual(empty.file.name, before)
