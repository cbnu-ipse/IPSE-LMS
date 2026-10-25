import base64
import io
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from accounts import credits
from core import vertex
from mypage.ai import extract_text, prepare_image
from mypage.models import ExamQuestion, PersonalDocument, ProcessingStatus, Subject

User = get_user_model()


def jpeg(size=(300, 200), exif_orientation=None, mode="RGB", color="white"):
    image = Image.new(mode, size, color)
    out = io.BytesIO()
    if exif_orientation:
        exif = image.getexif()
        exif[274] = exif_orientation
        image.save(out, "JPEG", exif=exif)
    else:
        image.save(out, "JPEG")
    return out.getvalue()


class PrepareImageTests(TestCase):
    def test_exif_rotation_is_applied(self):
        raw = jpeg((300, 200), exif_orientation=6)             # 세로로 찍은 휴대폰 사진: 가로로 저장 + '90도 돌려 보라'
        prepared, mime = prepare_image(raw, "p.jpg")
        self.assertEqual(Image.open(io.BytesIO(prepared)).size, (200, 300))
        self.assertEqual(mime, "jpeg")

    def test_large_photos_are_shrunk(self):
        prepared, _ = prepare_image(jpeg((5000, 3000)), "big.jpg")
        self.assertEqual(max(Image.open(io.BytesIO(prepared)).size), 2400)

    def test_transparent_png_gets_white_background(self):
        out = io.BytesIO()
        Image.new("RGBA", (40, 40), (0, 0, 0, 0)).save(out, "PNG")
        prepared, mime = prepare_image(out.getvalue(), "t.png")
        self.assertEqual(Image.open(io.BytesIO(prepared)).convert("RGB").getpixel((5, 5)), (255, 255, 255))
        self.assertEqual(mime, "jpeg")

    def test_unreadable_bytes_are_returned_unchanged(self):
        self.assertEqual(prepare_image(b"not an image", "x.png"), (b"not an image", "png"))


class ExamPhotoFlowTests(TestCase):
    """족보는 보통 사진이다: 업로드 → 글자 읽기(OCR) → Gemini에 이미지로 전달 → 문제 분석."""

    def setUp(self):
        self.user = User.objects.create_user(username="photo", password="pw")
        self.client.force_login(self.user)

    def test_ocr_sends_the_prepared_image_to_gemini_as_inline_data(self):
        seen = {}

        def fake_generate(key, model, messages, **kwargs):
            seen["messages"] = messages
            seen["contents"] = vertex.to_contents(messages)[1]
            return type("R", (), {"choices": [type("C", (), {"message": type("M", (), {"content": "1. 문제", "tool_calls": None})()})()],
                                  "usage": None})()

        with override_settings(AI_BLOCK_NETWORK=False, AI_CREDIT_COSTS={}), patch("core.vertex.generate", side_effect=fake_generate), \
                patch.dict("django.conf.settings.AI_PROVIDERS", {"gemini": {"key": "k", "base_url": None, "native": "vertex"}}):
            text = extract_text(io.BytesIO(jpeg((300, 200), exif_orientation=6)), "족보.jpg", user=None)
        self.assertEqual(text, "1. 문제")
        parts = seen["contents"][0]["parts"]
        self.assertIn("문제 번호", parts[0]["text"])                           # 시험지용 안내
        inline = parts[1]["inlineData"]
        self.assertEqual(inline["mimeType"], "image/jpeg")
        self.assertEqual(Image.open(io.BytesIO(base64.b64decode(inline["data"]))).size, (200, 300))   # 회전이 바로잡혀 전달된다

    @override_settings(AI_CREDIT_COSTS={"summary": 3, "ocr": 1})
    def test_exam_photo_upload_is_charged_by_size_then_analysed_into_questions(self):
        credits.grant(self.user, 20, "test")
        subject = Subject.objects.get_or_create(name="운영체제")[0]
        ocr_text = "1. 프로세스 상태가 아닌 것은? ① 준비 ② 컴파일\n2. 페이징을 서술하시오. (10점)"
        analysis = {"questions": [{"number": 1, "text": "프로세스 상태 고르기", "type": "mc", "concepts": ["프로세스 상태"]},
                                  {"number": 2, "text": "페이징 서술", "type": "essay", "points": 10, "concepts": ["페이징"]}]}
        data = {"title": "", "file": SimpleUploadedFile("족보.jpg", jpeg((600, 400))), "document_type": "exam",
                "course_name": "운영체제", "professor": "김철수"}
        created = []

        def run_now(target=None, args=(), kwargs=None, daemon=None):      # 백그라운드 스레드를 그 자리에서 실행
            class T:
                def start(self_inner):
                    created.append(target)
            return T()

        with patch("mypage.ai.core_ai.complete", return_value=ocr_text) as ocr, patch("mypage.views.threading.Thread", side_effect=run_now):
            self.client.post("/mypage/", data)
        doc = PersonalDocument.objects.get()
        self.assertEqual((doc.document_type, doc.extracted_text, doc.professor), ("exam", ocr_text, "김철수"))
        self.assertEqual(ocr.call_args.kwargs["cost"], 1)                   # 600x400 JPEG는 1MB 미만 → 1크레딧
        PersonalDocument.objects.filter(pk=doc.pk).update(summary="## 출제 범위\n프로세스, 페이징", summary_status=ProcessingStatus.DONE)
        doc.topics.add(subject)                                              # 분류는 백그라운드에서 이 과목으로 정해진다
        doc.refresh_from_db()
        with patch("core.ai.complete_json", return_value=analysis):
            from mypage import ontology
            self.assertEqual(ontology.analyze_exam(doc), 2)
        self.assertEqual(list(ExamQuestion.objects.filter(document=doc).values_list("qtype", "points")), [("mc", None), ("essay", 10)])
