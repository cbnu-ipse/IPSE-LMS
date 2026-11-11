import io
import os
import shutil
import tempfile
import zipfile
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from pptx import Presentation
from pptx.util import Inches

from . import images, views
from .models import PersonalDocument, ProcessingStatus

User = get_user_model()


def png(width=240, height=160, color=(200, 60, 60)):
    image = Image.new("RGB", (width, height), color)
    for x in range(0, width, 12):                       # 단색이 아니게 (줄무늬)
        image.paste((255 - color[0], color[1], 255 - color[2]), (x, 0, x + 4, height))
    out = io.BytesIO()
    image.save(out, "PNG")
    return out.getvalue()


def pptx_bytes(slides):
    """slides: [(글, [PNG 바이트 ...]) ...]"""
    prs = Presentation()
    for text, pictures in slides:
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        box = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(8), Inches(0.8))
        box.text_frame.text = text
        for n, data in enumerate(pictures):
            slide.shapes.add_picture(io.BytesIO(data), Inches(0.5 + 3.2 * n), Inches(1.5), width=Inches(3))
    out = io.BytesIO()
    prs.save(out)
    return out.getvalue()


def docx_bytes(parts):
    """parts: 글(문단) 또는 PNG 바이트(그림 문단)의 목록."""
    body, rels, media = [], [], {}
    for n, part in enumerate(parts, 1):
        if isinstance(part, bytes):
            media[f"word/media/image{n}.png"] = part
            rels.append(f'<Relationship Id="rId{n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image{n}.png"/>')
            body.append(f'<w:p><w:r><w:drawing><a:graphic><a:graphicData><pic:pic><pic:blipFill><a:blip r:embed="rId{n}"/></pic:blipFill></pic:pic></a:graphicData></a:graphic></w:drawing></w:r></w:p>')
        else:
            body.append(f"<w:p><w:r><w:t>{part}</w:t></w:r></w:p>")
    document = ('<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
                'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" '
                'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' + "".join(body) + "</w:body></w:document>")
    relationships = ('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                     + "".join(rels) + "</Relationships>")
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w") as zf:
        zf.writestr("word/document.xml", document)
        zf.writestr("word/_rels/document.xml.rels", relationships)
        for path, data in media.items():
            zf.writestr(path, data)
    return out.getvalue()


class ExtractTests(TestCase):
    def test_pptx_pictures_are_named_by_slide_and_keep_the_slide_text(self):
        data = pptx_bytes([("논리회로 개요", [png(color=(10, 20, 30))]), ("AND 게이트와 OR 게이트", [png(color=(30, 90, 10)), png(color=(90, 10, 200))])])
        kept, skipped = images.prepare(images.raw_from_pptx(io.BytesIO(data)))
        self.assertEqual(images._names(kept, "pptx"), ["slide01_1.png", "slide02_1.png", "slide02_2.png"])
        self.assertIn("AND 게이트", kept[1]["ctx"])
        self.assertEqual(sum(skipped.values()), 0)

    def test_icons_thin_lines_and_repeated_logos_are_dropped(self):
        logo = png(200, 100, (1, 2, 3))
        slides = [("1", [logo, png(20, 20)]), ("2", [logo, png(600, 8)]), ("3", [logo, png(300, 200, (5, 80, 5))])]
        kept, skipped = images.prepare(images.raw_from_pptx(io.BytesIO(pptx_bytes(slides))))
        self.assertEqual([k["slide"] for k in kept], [3])               # 슬라이드 3의 진짜 그림만
        self.assertEqual(skipped["repeated"], 3)
        self.assertEqual(skipped["small"], 2)                            # 아이콘 + 가는 선

    def test_vector_pictures_are_counted_not_stored(self):
        kept, skipped = images.prepare([(1, "emf", b"not an image", "글")])
        self.assertEqual((kept, skipped["vector"]), ([], 1))

    def test_big_pictures_are_shrunk_and_big_photos_become_jpeg(self):
        photo = Image.frombytes("RGB", (1800, 1200), os.urandom(1800 * 1200 * 3))
        out = io.BytesIO()
        photo.save(out, "PNG")
        kept, _ = images.prepare([(1, "png", out.getvalue(), "사진")])
        self.assertEqual(max(kept[0]["w"], kept[0]["h"]), images.MAX_EDGE)
        self.assertEqual(kept[0]["ext"], "jpg")
        self.assertLess(len(kept[0]["data"]), len(out.getvalue()))

    def test_limits_drop_the_smallest_pictures_first(self):
        raw = [(n, "png", png(100 + 40 * n, 100 + 40 * n, (n * 20 % 255, 50, 90)), f"s{n}") for n in range(1, 6)]
        with patch.object(images, "MAX_IMAGES", 3):
            kept, skipped = images.prepare(raw)
        self.assertEqual([k["slide"] for k in kept], [3, 4, 5])          # 원래 순서는 유지, 가장 작은 둘이 빠짐
        self.assertEqual(skipped["over_limit"], 2)

    def test_total_size_limit(self):
        raw = [(n, "png", png(300, 300, (n * 30, 10, 10)), "x") for n in range(1, 5)]
        size = len(images.prepare(raw)[0][0]["data"])
        with patch.object(images, "MAX_TOTAL_BYTES", size * 2 + 1):
            kept, _ = images.prepare(raw)
        self.assertEqual(len(kept), 2)

    def test_docx_pictures_come_in_document_order_with_the_text_around_them(self):
        data = docx_bytes(["1장 조합 회로", png(color=(9, 9, 200)), "그림 1. 반가산기", "2장 순차 회로", png(color=(200, 9, 9))])
        raw = images.raw_from_docx(io.BytesIO(data))
        kept, _ = images.prepare(raw)
        self.assertEqual(images._names(kept, "docx"), ["fig01.png", "fig02.png"])
        self.assertIn("반가산기", kept[0]["ctx"])
        self.assertIn("순차 회로", kept[1]["ctx"])
        self.assertIsNone(kept[0]["slide"])


class StoredImagesTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        self.override = override_settings(MEDIA_ROOT=self.media)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.user = User.objects.create_user(username="u", password="pw")
        self.client.force_login(self.user)

    def doc(self, name="slides.pptx", data=None, user=None, **kw):
        data = data if data is not None else pptx_bytes([("회로", [png(color=(1, 90, 200))]), ("게이트", [png(color=(120, 90, 20)), png(color=(7, 7, 99))])])
        document = PersonalDocument(user=user or self.user, title="논리회로", summary="## 회로\n내용", extracted_text="본문",
                                    summary_status=ProcessingStatus.DONE, **kw)
        document.file.save(name, ContentFile(data), save=False)
        document.save()
        return document

    def test_extract_stores_files_and_an_index(self):
        document = self.doc()
        index = images.extract_for_document(document)
        self.assertEqual([i["name"] for i in index["images"]], ["slide01_1.png", "slide02_1.png", "slide02_2.png"])
        listed = images.image_list(document)
        self.assertEqual(len(listed), 3)
        self.assertTrue(os.path.exists(os.path.join(self.media, images.STORE_DIR, str(document.pk), "slide01_1.png")))
        self.assertTrue(listed[0]["url"].endswith(f"{images.STORE_DIR}/{document.pk}/slide01_1.png"))

    def test_zip_has_every_picture_under_its_name(self):
        document = self.doc()
        images.extract_for_document(document)
        with zipfile.ZipFile(io.BytesIO(images.zip_bytes(document))) as zf:
            self.assertEqual(sorted(zf.namelist()), ["slide01_1.png", "slide02_1.png", "slide02_2.png"])

    def test_extracting_again_replaces_the_old_files(self):
        document = self.doc()
        images.extract_for_document(document)
        folder = os.path.join(self.media, images.STORE_DIR, str(document.pk))
        with open(os.path.join(folder, "stale.png"), "wb") as fh:
            fh.write(b"x")
        index = images.extract_for_document(document)
        self.assertEqual(len(index["images"]), 3)
        self.assertEqual(len(images.image_list(document)), 3)

    def test_non_office_files_are_ignored(self):
        document = self.doc("note.txt", b"hello")
        self.assertIsNone(images.extract_for_document(document))
        self.assertIsNone(images.load_index(document))

    def test_a_broken_file_does_not_raise(self):
        document = self.doc("broken.pptx", b"this is not a pptx")
        self.assertIsNone(images.extract_for_document(document))

    def test_deleting_the_row_removes_the_files(self):
        document = self.doc()
        images.extract_for_document(document)
        folder = os.path.join(self.media, images.STORE_DIR, str(document.pk))
        self.assertTrue(os.listdir(folder))
        document.delete()
        self.assertFalse(os.path.exists(os.path.join(folder, "index.json")))
        self.assertFalse(os.path.exists(os.path.join(folder, "slide01_1.png")))

    def test_upload_starts_the_extraction_only_for_office_files(self):
        office = self.doc()
        plain = self.doc("a.pdf", b"%PDF")
        with patch.object(views.threading, "Thread") as thread:
            views._start_image_extraction(office)
            views._start_image_extraction(plain)
        self.assertEqual([c.kwargs["target"] for c in thread.call_args_list], [views._extract_images_bg])

    def test_command_extracts_missing_ones_and_skips_done_ones(self):
        a, b = self.doc(), self.doc()
        images.extract_for_document(a)
        call_command("extract_document_images", stdout=io.StringIO())
        self.assertIsNotNone(images.load_index(b))
        with patch.object(images, "extract_for_document", wraps=images.extract_for_document) as spy:
            call_command("extract_document_images", stdout=io.StringIO())
            self.assertEqual(spy.call_count, 0)
            call_command("extract_document_images", "--force", stdout=io.StringIO())
            self.assertEqual(spy.call_count, 2)


class ScreenTests(TestCase):
    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.media, True)
        self.override = override_settings(MEDIA_ROOT=self.media)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.user = User.objects.create_user(username="u", password="pw")
        self.other = User.objects.create_user(username="o", password="pw")
        self.client.force_login(self.user)
        data = pptx_bytes([("회로", [png(color=(1, 90, 200))]), ("게이트", [png(color=(120, 90, 20))])])
        self.document = PersonalDocument(user=self.user, title="논리회로", summary="## 회로\n내용\n\n## 게이트\n내용", extracted_text="본문",
                                         summary_status=ProcessingStatus.DONE)
        self.document.file.save("slides.pptx", ContentFile(data), save=False)
        self.document.save()

    def test_study_screen_shows_the_pictures_button_data_and_the_pdf_hint(self):
        images.extract_for_document(self.document)
        html = self.client.get(self.document.get_absolute_url()).content.decode()
        self.assertIn(reverse("mypage:document_images", args=[self.document.pk]), html)
        self.assertIn("그림 2개", html)
        self.assertIn('id="doc-images"', html)
        self.assertIn("summary-images.js", html)
        self.assertIn("PDF로 저장해서 올려주세요", html)                 # 원문이 글자로 보이는 형식에는 안내가 나온다

    def test_without_pictures_there_is_no_button_but_the_hint_stays(self):
        html = self.client.get(self.document.get_absolute_url()).content.decode()
        self.assertNotIn('id="ms-images"', html)
        self.assertNotIn("summary-images.js", html)
        self.assertIn("PDF로 저장해서 올려주세요", html)

    def test_text_and_pdf_sources_have_no_hint(self):
        txt = PersonalDocument(user=self.user, title="t", summary="s", extracted_text="본문", summary_status=ProcessingStatus.DONE)
        txt.file.save("a.txt", ContentFile(b"hello"), save=False)
        txt.save()
        self.assertNotIn("글자만 뽑아 보여 드려요", self.client.get(txt.get_absolute_url()).content.decode())

    def test_gallery_lists_pictures_and_offers_the_zip(self):
        images.extract_for_document(self.document)
        html = self.client.get(reverse("mypage:document_images", args=[self.document.pk])).content.decode()
        self.assertIn("slide01_1.png", html)
        self.assertIn("slide02_1.png", html)
        self.assertIn(reverse("mypage:document_images_zip", args=[self.document.pk]), html)

    def test_gallery_explains_the_empty_states(self):
        url = reverse("mypage:document_images", args=[self.document.pk])
        self.assertIn("아직 그림을 뽑지 않았어요", self.client.get(url).content.decode())
        PersonalDocument.objects.filter(pk=self.document.pk).update(file="")
        pdf = PersonalDocument(user=self.user, title="p", summary="s", extracted_text="x", summary_status=ProcessingStatus.DONE)
        pdf.file.save("a.pdf", ContentFile(b"%PDF"), save=False)
        pdf.save()
        self.assertIn("PPTX·DOCX 자료에서만", self.client.get(reverse("mypage:document_images", args=[pdf.pk])).content.decode())

    def test_only_the_owner_can_see_or_download(self):
        images.extract_for_document(self.document)
        self.client.force_login(self.other)
        self.assertEqual(self.client.get(reverse("mypage:document_images", args=[self.document.pk])).status_code, 403)
        self.assertEqual(self.client.get(reverse("mypage:document_images_zip", args=[self.document.pk])).status_code, 403)

    def test_zip_download(self):
        images.extract_for_document(self.document)
        res = self.client.get(reverse("mypage:document_images_zip", args=[self.document.pk]))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res["Content-Type"], "application/zip")
        with zipfile.ZipFile(io.BytesIO(res.content)) as zf:
            self.assertEqual(sorted(zf.namelist()), ["slide01_1.png", "slide02_1.png"])

    def test_zip_is_404_when_there_is_nothing(self):
        self.assertEqual(self.client.get(reverse("mypage:document_images_zip", args=[self.document.pk])).status_code, 404)
