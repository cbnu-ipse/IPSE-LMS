import io
import shutil
import tempfile
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image

from accounts import credits
from core import ai as core_ai

from . import cram, handnote
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


class RenderTests(TestCase):
    def test_render_is_always_one_a4_page(self):
        small = Image.open(io.BytesIO(handnote.render_note(cram.normalize_note(NOTE_JSON))))
        self.assertEqual(small.format, "PNG")
        self.assertEqual(small.size, (handnote.WIDTH, handnote.HEIGHT))
        big = {"title": "큰 노트", "memo": ["확인 " * 12] * 6,
               "sections": [{"heading": f"주제 {i}", "points": ["긴 문장 " * 14] * 6} for i in range(7)]}
        note = cram.normalize_note(big)
        self.assertEqual(Image.open(io.BytesIO(handnote.render_note(note))).size, (handnote.WIDTH, handnote.HEIGHT))
        lay = handnote._layout(note, handnote._rng_for(note), handnote.MIN_SCALE, None)
        self.assertLessEqual(lay.y, handnote.HEIGHT)

    def test_everything_fits_by_shrinking_text(self):
        note = cram.normalize_note({"title": "t", "sections": [{"heading": f"h{i}", "points": ["내용 " * 30] * 6} for i in range(7)],
                                    "memo": ["m"] * 6})
        rng = handnote._rng_for(note)
        full = handnote._layout(note, rng, 1.0, None)
        self.assertGreater(full.y, handnote.HEIGHT)                       # 기본 크기로는 한 장을 넘는다
        realistic = cram.normalize_note({"title": "t", "sections": [{"heading": f"h{i}", "points": ["내용 " * 10] * 6} for i in range(7)],
                                         "memo": ["m"] * 6})
        self.assertLessEqual(handnote._layout(realistic, handnote._rng_for(realistic), handnote.MIN_SCALE, None).y, handnote.HEIGHT)

    def test_unsupported_glyphs_do_not_crash(self):
        note = {"title": "Σ μ → ≤ x̄ ∞", "sections": [{"heading": "α β", "points": ["x² ≥ 1 ✓ 😀 $\\bar{x}$ $a_i^2$"]}], "memo": []}
        self.assertTrue(handnote.render_note(note).startswith(b"\x89PNG"))


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
        with override_settings(MEDIA_ROOT=self.media), patch("core.ai.complete_json", return_value=NOTE_JSON) as ai:
            cram.build_note_document(note.pk, [a.pk, b.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.DONE)
        self.assertTrue(note.file.name.endswith(".png"))
        self.assertEqual(note.title, "운영체제 5분 노트")
        self.assertIn("프로세스 vs 스레드", note.summary)
        request = ai.call_args[0][1][1]["content"]
        self.assertIn("요약 A", request)
        self.assertIn("요약 B", request)

    def test_other_users_documents_are_not_read(self):
        other = User.objects.create_user(username="o", password="pw")
        secret = make_doc(other, "s", summary="남의 요약")
        note = self._placeholder()
        with override_settings(MEDIA_ROOT=self.media), patch("core.ai.complete_json", return_value=NOTE_JSON) as ai:
            cram.build_note_document(note.pk, [secret.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.FAILED)
        ai.assert_not_called()

    def test_thin_ai_answer_fails_and_refunds(self):
        doc = make_doc(self.user)
        note = self._placeholder()
        with override_settings(MEDIA_ROOT=self.media), patch("core.ai.complete_json", return_value={"title": "x", "sections": []}), \
                patch("core.ai.refund") as refund:
            cram.build_note_document(note.pk, [doc.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.FAILED)
        refund.assert_called_once()

    def test_render_failure_refunds_once(self):
        doc = make_doc(self.user)
        note = self._placeholder()
        with override_settings(MEDIA_ROOT=self.media), patch("core.ai.complete_json", return_value=NOTE_JSON), \
                patch("mypage.handnote.render_note", side_effect=OSError("boom")), patch("core.ai.refund") as refund:
            cram.build_note_document(note.pk, [doc.pk])
        note.refresh_from_db()
        self.assertEqual(note.summary_status, ProcessingStatus.FAILED)
        refund.assert_called_once()


@override_settings(AI_CREDIT_COSTS={"cram_note": 4})
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

    def test_insufficient_credits_blocks_start(self):
        doc = make_doc(self.user)
        with patch("core.ai._is_exempt", return_value=False):
            self._post([doc.pk])
        self.assertFalse(PersonalDocument.objects.filter(document_type=NOTE).exists())

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
