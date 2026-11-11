import io
import os
import shutil
import subprocess
import tempfile
import zipfile
from unittest import skipUnless
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from pypdf import PdfWriter

from . import convert, views
from .models import PersonalDocument, ProcessingStatus

User = get_user_model()


def office_like(name="x"):
    """Office 문서처럼 보이는(ZIP 시그니처) 바이트."""
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w") as zf:
        zf.writestr(name, "x")
    return out.getvalue()


def soffice_works():
    """LibreOffice가 실제로 실행되는지 (실행 파일만 있고 앱이 없는 깨진 설치도 걸러낸다)."""
    binary = convert.soffice_path()
    if not binary:
        return False
    try:
        return subprocess.run([binary, "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60).returncode == 0
    except (OSError, subprocess.SubprocessError):
        return False


def pdf_bytes(pages=2):
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=720, height=540)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def fake_soffice(pdf=None, fail=False):
    """subprocess.run을 대신하는 가짜: --outdir에 input.pdf를 만든다."""
    calls = []

    def run(command, **kwargs):
        calls.append((command, kwargs))
        if fail:
            raise subprocess.CalledProcessError(1, command)
        out_dir = command[command.index("--outdir") + 1]
        with open(os.path.join(out_dir, "input.pdf"), "wb") as fh:
            fh.write(pdf if pdf is not None else pdf_bytes())
        return subprocess.CompletedProcess(command, 0)

    run.calls = calls
    return run


class ConvertToPdfTests(TestCase):
    def test_runs_soffice_headless_with_a_private_profile_and_returns_the_pdf(self):
        run = fake_soffice()
        with patch.object(convert, "soffice_path", return_value="/usr/bin/soffice"), patch.object(convert.subprocess, "run", run):
            pdf = convert.convert_to_pdf(office_like(), ".pptx")
        self.assertTrue(pdf.startswith(b"%PDF"))
        command, kwargs = run.calls[0]
        self.assertEqual(command[0], "/usr/bin/soffice")
        for flag in ("--headless", "--convert-to", "pdf", "--norestore"):
            self.assertIn(flag, command)
        self.assertTrue(any(c.startswith("-env:UserInstallation=file://") for c in command))      # 프로필을 따로 써서 서로 충돌하지 않는다
        self.assertTrue(command[-1].endswith("input.pptx"))                                       # 한글 파일 이름이 변환기에 가지 않는다
        self.assertEqual(kwargs["timeout"], convert.TIMEOUT_SECONDS)

    def test_temp_files_are_removed(self):
        run = fake_soffice()
        with patch.object(convert, "soffice_path", return_value="/x/soffice"), patch.object(convert.subprocess, "run", run):
            convert.convert_to_pdf(office_like(), ".docx")
        work = os.path.dirname(run.calls[0][0][-1])
        self.assertFalse(os.path.exists(work))

    def test_no_soffice_means_none_not_an_error(self):
        with patch.object(convert, "soffice_path", return_value=None):
            self.assertIsNone(convert.convert_to_pdf(office_like(), ".pptx"))

    def test_failure_timeout_and_garbage_output_give_none(self):
        with patch.object(convert, "soffice_path", return_value="/x/soffice"):
            with patch.object(convert.subprocess, "run", fake_soffice(fail=True)):
                self.assertIsNone(convert.convert_to_pdf(office_like(), ".pptx"))
            with patch.object(convert.subprocess, "run", side_effect=subprocess.TimeoutExpired("soffice", 1)):
                self.assertIsNone(convert.convert_to_pdf(office_like(), ".pptx"))
            with patch.object(convert.subprocess, "run", fake_soffice(pdf=b"not a pdf")):
                self.assertIsNone(convert.convert_to_pdf(office_like(), ".pptx"))

    def test_files_that_are_not_office_documents_are_not_converted(self):
        run = fake_soffice()
        with patch.object(convert, "soffice_path", return_value="/x/soffice"), patch.object(convert.subprocess, "run", run):
            for data in (b"garbage", b"", b"<html>not office</html>"):
                self.assertIsNone(convert.convert_to_pdf(data, ".pptx"))
        self.assertEqual(run.calls, [])                                          # 변환기를 부르지도 않는다

    def test_known_office_signatures_pass(self):
        for data in (office_like(), b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1" + b"x" * 20, b"{\\rtf1\\ansi hello}"):
            self.assertTrue(convert.looks_like_office_file(data))

    def test_which_extensions_are_converted(self):
        for name in ("a.pptx", "A.PPT", "a.docx", "a.doc", "a.rtf"):
            self.assertTrue(convert.needs_conversion(name), name)
        for name in ("a.pdf", "a.hwp", "a.hwpx", "a.txt", "a.png", ""):
            self.assertFalse(convert.needs_conversion(name), name)

    @skipUnless(soffice_works(), "LibreOffice가 없거나 실행되지 않는 환경 (Docker 이미지에서는 실제 변환까지 확인된다)")
    def test_real_conversion(self):
        from pptx import Presentation

        prs = Presentation()
        prs.slides.add_slide(prs.slide_layouts[6]).shapes.add_textbox(0, 0, 3000000, 500000).text_frame.text = "안녕 slide"
        out = io.BytesIO()
        prs.save(out)
        self.assertTrue(convert.convert_to_pdf(out.getvalue(), ".pptx").startswith(b"%PDF"))


class StoredPdfTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        override = override_settings(MEDIA_ROOT=self.media)
        override.enable()
        self.addCleanup(override.disable)
        self.user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(self.user)
        patcher = patch.object(convert, "soffice_path", return_value="/x/soffice")
        patcher.start()
        self.addCleanup(patcher.stop)

    def doc(self, name="slides.pptx", data=None, **kw):
        data = office_like() if data is None else data
        document = PersonalDocument(user=self.user, title="논리회로", summary="## 회로\n내용\n\n## 게이트\n내용", extracted_text="회로 게이트 본문",
                                    summary_status=ProcessingStatus.DONE, **kw)
        document.file.save(name, ContentFile(data), save=False)
        document.save()
        return document

    def page(self, document):
        return self.client.get(document.get_absolute_url())

    def test_conversion_saves_the_pdf_and_the_state_becomes_ready(self):
        document = self.doc()
        self.assertEqual(convert.state(document), "pending")                    # 방금 올렸고 변환기가 있다
        with patch.object(convert.subprocess, "run", fake_soffice()):
            self.assertTrue(convert.convert_document(document))
        self.assertEqual(convert.state(document), "ready")
        self.assertTrue(convert.pdf_url(document).endswith(f"doc_pdf/{document.pk}.pdf"))

    def test_failed_conversion_is_remembered_so_pending_does_not_stick(self):
        document = self.doc()
        with patch.object(convert.subprocess, "run", fake_soffice(fail=True)):
            self.assertFalse(convert.convert_document(document))
        self.assertEqual(convert.state(document), "text")
        self.assertIsNone(convert.pdf_url(document))

    def test_old_unconverted_documents_and_missing_converter_show_text(self):
        document = self.doc()
        PersonalDocument.objects.filter(pk=document.pk).update(uploaded_at=timezone.now() - convert.PENDING_FOR * 2)
        document.refresh_from_db()
        self.assertEqual(convert.state(document), "text")
        fresh = self.doc()
        with patch.object(convert, "soffice_path", return_value=None):
            self.assertEqual(convert.state(fresh), "text")

    def test_pdf_and_text_files_are_not_conversion_targets(self):
        self.assertEqual(convert.state(self.doc("a.pdf", pdf_bytes())), "none")
        self.assertFalse(convert.convert_document(self.doc("a.hwpx", b"x")))

    def test_study_screen_shows_the_converted_pdf_like_a_pdf_upload(self):
        document = self.doc()
        with patch.object(convert.subprocess, "run", fake_soffice(pdf_bytes(3))):
            convert.convert_document(document)
        res = self.page(document)
        html = res.content.decode()
        self.assertIn(f'<iframe src="{convert.pdf_url(document)}"', html)
        self.assertNotIn("글자만 뽑아 보여 드려요", html)
        self.assertNotIn("<pre>", html.split('id="ms-src"')[1].split("</div>")[0])
        self.assertTrue(res.context["is_pdf"])
        self.assertIn('id="ms-pdf-pages"', html)                               # 요약 조각과 원문 쪽이 서로 따라가는 데이터

    def test_while_converting_the_screen_says_so_and_polls_until_it_is_ready(self):
        document = self.doc()
        res = self.page(document)
        html = res.content.decode()
        self.assertIn("원본 모양으로 바꾸는 중이에요", html)
        self.assertEqual(res.context["initial_state"]["source"], "pending")
        self.assertIn("initial.source === 'pending'", html)
        status = self.client.get(reverse("mypage:document_status", args=[document.pk])).json()
        self.assertEqual(status["source"], "pending")
        with patch.object(convert.subprocess, "run", fake_soffice()):
            convert.convert_document(document)
        self.assertEqual(self.client.get(reverse("mypage:document_status", args=[document.pk])).json()["source"], "ready")   # 값이 바뀌면 화면이 새로 읽힌다

    def test_text_fallback_keeps_the_pdf_advice_for_hwp_and_failures(self):
        hwp = self.doc("a.hwpx", b"x")
        self.assertIn("원본 모양 그대로 보려면 PDF로 저장해서 올려주세요", self.page(hwp).content.decode())
        failed = self.doc()
        with patch.object(convert.subprocess, "run", fake_soffice(fail=True)):
            convert.convert_document(failed)
        self.assertIn("PDF로 저장해서 올려주세요", self.page(failed).content.decode())

    def test_plain_text_and_pdf_uploads_are_unchanged(self):
        txt = self.doc("a.txt", b"hello")
        self.assertNotIn("글자만 뽑아 보여 드려요", self.page(txt).content.decode())
        pdf = self.doc("a.pdf", pdf_bytes())
        self.assertIn(f'<iframe src="{pdf.file.url}"', self.page(pdf).content.decode())

    def test_upload_starts_the_conversion_only_for_convertible_files(self):
        with patch.object(views.threading, "Thread") as thread:
            views._start_conversion(self.doc())
            views._start_conversion(self.doc("a.pdf", pdf_bytes()))
            views._start_conversion(self.doc("a.hwp", b"x"))
        self.assertEqual([c.kwargs["target"] for c in thread.call_args_list], [views._convert_bg])

    def test_deleting_the_row_removes_the_pdf(self):
        document = self.doc()
        with patch.object(convert.subprocess, "run", fake_soffice()):
            convert.convert_document(document)
        path = os.path.join(self.media, convert.pdf_name(document.pk))
        self.assertTrue(os.path.exists(path))
        document.delete()
        self.assertFalse(os.path.exists(path))

    def test_command_converts_missing_ones_and_skips_done_ones(self):
        a, b = self.doc(), self.doc()
        with patch.object(convert.subprocess, "run", fake_soffice()):
            convert.convert_document(a)
            call_command("convert_document_pdfs", stdout=io.StringIO(), stderr=io.StringIO())
            self.assertEqual(convert.state(b), "ready")
        with patch.object(convert, "convert_document", wraps=convert.convert_document) as spy, patch.object(convert.subprocess, "run", fake_soffice()):
            call_command("convert_document_pdfs", stdout=io.StringIO())
            self.assertEqual(spy.call_count, 0)
            call_command("convert_document_pdfs", "--force", stdout=io.StringIO())
            self.assertEqual(spy.call_count, 2)

    def test_command_without_soffice_explains(self):
        with patch.object(convert, "soffice_path", return_value=None):
            with self.assertRaises(CommandError):
                call_command("convert_document_pdfs", stdout=io.StringIO())
