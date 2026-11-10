import io
import re
import shutil
import tempfile
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from . import cram, notepage
from .models import PersonalDocument, ProcessingStatus
from .test_cram import NOTE, ai_returns
from .test_exam import make_doc

User = get_user_model()


class NotePdfTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        self.user = User.objects.create_user(username="u", password="pw")
        src = make_doc(self.user, "a", course_name="운영체제")
        note = PersonalDocument.objects.create(user=self.user, title="큰/노트", file="", document_type=NOTE,
                                               summary_status=ProcessingStatus.PROCESSING)
        big = {"title": "큰/노트", "memo": ["확인 " * 10] * 6,
               "sections": [{"heading": f"주제{i}", "points": ["긴 문장 " * 40] * 6} for i in range(7)]}
        with override_settings(MEDIA_ROOT=self.media), ai_returns(big), patch.object(notepage, "DEFAULT_STYLE", "typed"):
            cram.build_note_document(note.pk, [src.pk])
        self.note = PersonalDocument.objects.get(pk=note.pk)

    def get(self, pk=None, user=None):
        self.client.force_login(user or self.user)
        with override_settings(MEDIA_ROOT=self.media):
            return self.client.get(reverse("mypage:note_pdf", args=[pk or self.note.pk]))

    def test_all_pages_in_one_pdf(self):
        pages = len(self.note.page_names())
        self.assertGreater(pages, 1)
        r = self.get()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r["Content-Type"], "application/pdf")
        body = r.content
        self.assertTrue(body.startswith(b"%PDF"))
        self.assertEqual(len(re.findall(rb"/Type\s*/Page\b", body)), pages)
        self.assertIn("attachment", r["Content-Disposition"])
        self.assertNotIn("/", r["Content-Disposition"].split("filename*=")[1])   # 제목의 슬래시는 파일 이름에서 빠진다

    def test_only_the_owner_can_download(self):
        other = User.objects.create_user(username="o", password="pw")
        self.assertEqual(self.get(user=other).status_code, 403)

    def test_unfinished_or_non_note_is_404(self):
        PersonalDocument.objects.filter(pk=self.note.pk).update(summary_status=ProcessingStatus.PROCESSING)
        self.assertEqual(self.get().status_code, 404)
        plain = make_doc(self.user, "p", course_name="운영체제")
        self.assertEqual(self.get(pk=plain.pk).status_code, 404)

    def test_note_page_shows_pdf_button(self):
        self.client.force_login(self.user)
        with override_settings(MEDIA_ROOT=self.media):
            html = self.client.get(reverse("mypage:document_preview", args=[self.note.pk])).content.decode()
        self.assertIn(reverse("mypage:note_pdf", args=[self.note.pk]), html)
