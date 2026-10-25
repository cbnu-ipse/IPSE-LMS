import io
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from accounts import credits
from mypage.forms import MAX_UPLOAD_SIZE
from mypage.models import PersonalDocument

User = get_user_model()


@override_settings(AI_CREDIT_COSTS={"summary": 3, "ocr": 1})
class UploadEstimateTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="est", password="pw")
        self.client.force_login(self.user)

    def estimate(self, name="a.txt", content=b"hello", **kw):
        return self.client.post("/mypage/estimate/", {"file": SimpleUploadedFile(name, content)}, **kw)

    def test_text_file_gets_exact_cost_from_chunk_count_and_balance_check(self):
        credits.grant(self.user, 10, "test")
        text = "\n\n".join("가" * 11000 for _ in range(4))
        with patch("mypage.views.extract_text", return_value=text):
            d = self.estimate().json()
        self.assertEqual((d["kind"], d["chunks"], d["cost"], d["unit_cost"]), ("text", 4, 12, 3))
        self.assertEqual((d["balance"], d["enough"], d["empty"]), (10, False, False))     # 12 필요, 10 보유
        credits.grant(self.user, 5, "test")
        with patch("mypage.views.extract_text", return_value=text):
            self.assertTrue(self.estimate().json()["enough"])

    def test_image_estimate_is_ocr_by_size_plus_summary_range(self):
        credits.grant(self.user, 100, "test")
        with patch("mypage.views.extract_text") as extract:
            d = self.estimate("scan.png", b"x" * 2_500_000).json()
        extract.assert_not_called()                                                     # 이미지는 OCR이라 계산 때는 읽지 않는다
        self.assertEqual((d["kind"], d["ocr_cost"], d["min_cost"], d["max_cost"]), ("image", 3, 6, 33))

    def test_unreadable_text_is_flagged_and_costs_nothing(self):
        with patch("mypage.views.extract_text", return_value=""):
            d = self.estimate("scan.pdf", b"%PDF").json()
        self.assertEqual((d["empty"], d["cost"]), (True, 0))

    def test_too_big_or_wrong_type_is_rejected(self):
        with patch("mypage.views.MAX_UPLOAD_SIZE", 2 * 1024 * 1024):
            res = self.client.post("/mypage/estimate/", {"file": SimpleUploadedFile("big.pdf", b"x" * (3 * 1024 * 1024))})
        self.assertEqual(res.status_code, 413)
        self.assertIn("2MB를 넘을 수 없습니다 (선택한 파일 3.0MB)", res.json()["error"])
        self.assertEqual(self.estimate("virus.exe").status_code, 400)
        self.assertEqual(self.client.post("/mypage/estimate/", {}).status_code, 400)

    def test_requires_login_and_is_rate_limited(self):
        self.client.logout()
        self.assertEqual(self.estimate().status_code, 302)
        self.client.force_login(self.user)
        with patch("mypage.views.extract_text", return_value="글"):
            codes = [self.estimate().status_code for _ in range(22)]
        self.assertEqual(codes[:20], [200] * 20)
        self.assertEqual(codes[20:], [429, 429])

    def test_upload_reuses_the_text_read_at_selection(self):
        credits.grant(self.user, 30, "test")
        content = b"hello world " * 40
        with patch("mypage.views.extract_text", return_value="본문 " * 50) as extract:
            self.estimate("note.txt", content)
            self.assertEqual(extract.call_count, 1)
            with patch("mypage.views.threading.Thread"):
                self.client.post("/mypage/", {"title": "", "file": SimpleUploadedFile("note.txt", content), "document_type": "lecture",
                                              "course_name": "운영체제", "professor": "김"})
            self.assertEqual(extract.call_count, 1)                                     # 업로드에서 다시 읽지 않았다
        self.assertEqual(PersonalDocument.objects.get().extracted_text, "본문 " * 50)

    def test_upload_page_has_selection_time_estimate_and_size_guard(self):
        html = self.client.get("/mypage/").content.decode()
        self.assertIn("계산 중…", html)
        self.assertIn(f"MAX_BYTES = {MAX_UPLOAD_SIZE}", html)
        self.assertIn('id="upload-submit"', html)
        self.assertIn('id="uc-estimate"', html)                      # 크레딧 비용이 0인 설정에서도 스크립트가 기대하는 요소가 있어야 한다
