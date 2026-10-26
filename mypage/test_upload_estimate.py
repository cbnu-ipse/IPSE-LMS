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


@override_settings(AI_CREDIT_COSTS={"summary": 3, "ocr": 1})
class UploadLoadControlTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="load", password="pw")
        self.client.force_login(self.user)

    def upload(self):
        return self.client.post("/mypage/", {"title": "", "file": SimpleUploadedFile("n.txt", ("본문 " * 40).encode()),
                                             "document_type": "lecture", "course_name": "운영체제", "professor": "김"}, follow=True)

    def test_a_user_cannot_have_more_than_the_allowed_number_processing_at_once(self):
        credits.grant(self.user, 100, "test")
        for i in range(5):
            PersonalDocument.objects.create(user=self.user, title=f"d{i}", extracted_text="x", summary_status="processing")
        with patch("mypage.views.threading.Thread") as thread:
            res = self.upload()
        thread.assert_not_called()
        self.assertContains(res, "요약 중인 자료가 5개")
        self.assertEqual(PersonalDocument.objects.count(), 5)                 # 새 자료는 만들어지지 않았다

    def test_old_stuck_processing_documents_do_not_count(self):
        from datetime import timedelta
        from django.utils import timezone
        credits.grant(self.user, 100, "test")
        for i in range(5):
            doc = PersonalDocument.objects.create(user=self.user, title=f"d{i}", extracted_text="x", summary_status="processing")
            PersonalDocument.objects.filter(pk=doc.pk).update(uploaded_at=timezone.now() - timedelta(minutes=30))
        with patch("mypage.views.threading.Thread"), patch("mypage.views.extract_text", return_value="본문 " * 50):
            self.upload()
        self.assertEqual(PersonalDocument.objects.count(), 6)

    def test_busy_extraction_gives_a_clear_error_and_leaves_no_half_document(self):
        credits.grant(self.user, 100, "test")
        with patch("mypage.views.extract_slot", side_effect=TimeoutError("서버가 바빠 파일을 읽지 못했습니다. 잠시 후 다시 시도해주세요.")):
            res = self.upload()
        self.assertContains(res, "서버가 바빠")
        self.assertFalse(PersonalDocument.objects.exists())
        with patch("mypage.views.extract_slot", side_effect=TimeoutError("busy")):
            self.assertEqual(self.client.post("/mypage/estimate/", {"file": SimpleUploadedFile("a.txt", b"x")}).status_code, 503)

    def test_upload_page_shows_a_loading_overlay_while_uploading(self):
        html = self.client.get("/mypage/").content.decode()
        self.assertIn('id="upload-loading"', html)
        self.assertIn("파일을 올리고 글자를 읽고 있어요", html)
        self.assertIn("showLoading(); form.submit()", html)


@override_settings(AI_CREDIT_COSTS={"summary": 3, "ocr": 1})
class TooLongDocumentTests(TestCase):
    """한 자료는 약 12만 자(요약 10조각)까지 — 넘으면 앞부분만 요약하지 않고 쪼개서 올리게 한다."""

    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="long", password="pw")
        self.client.force_login(self.user)
        credits.grant(self.user, 100, "test")
        self.too_long = "\n\n".join("가" * 11000 for _ in range(40))
        self.fits = "\n\n".join("가" * 11000 for _ in range(10))

    def estimate(self, text, content=b"%PDF"):
        with patch("mypage.views.extract_text", return_value=text):
            return self.client.post("/mypage/estimate/", {"file": SimpleUploadedFile("book.pdf", content)})

    def test_estimate_refuses_too_long_text_and_tells_to_split(self):
        res = self.estimate(self.too_long)
        self.assertEqual(res.status_code, 422)
        d = res.json()
        self.assertTrue(d["too_long"])
        self.assertIn("440,", d["error"])                                             # 실제 글자 수
        self.assertIn("120,000자", d["error"])
        self.assertIn("PDF를 장별로 쪼개서", d["error"])
        self.assertEqual(self.estimate(self.fits, b"%PDF-other").status_code, 200)                  # 10조각까지는 그대로

    def test_upload_of_too_long_text_is_rejected_without_leaving_a_document_or_charging(self):
        data = {"title": "", "file": SimpleUploadedFile("book.pdf", b"x" * 100), "document_type": "lecture", "course_name": "운영체제", "professor": "김"}
        with patch("mypage.views.extract_text", return_value=self.too_long), patch("mypage.views.threading.Thread") as thread:
            res = self.client.post("/mypage/", data, follow=True)
        self.assertContains(res, "장별로 쪼개서")
        thread.assert_not_called()
        self.assertFalse(PersonalDocument.objects.exists())
        self.user.refresh_from_db()
        self.assertEqual(self.user.credits, 100)

    def test_resummarize_of_an_old_too_long_document_is_refused(self):
        doc = PersonalDocument.objects.create(user=self.user, title="옛 책", extracted_text=self.too_long, summary="", summary_status="failed")
        with patch("mypage.views.threading.Thread") as thread:
            res = self.client.post(f"/mypage/{doc.pk}/resummarize/", follow=True)
        thread.assert_not_called()
        self.assertContains(res, "장별로 쪼개서")

    def test_page_script_shows_the_split_message_through_the_error_path(self):
        html = self.client.get("/mypage/").content.decode()
        self.assertNotIn("만 요약돼요", html)                                          # 앞부분만 요약하는 경로는 없다
