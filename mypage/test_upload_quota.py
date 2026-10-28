from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from accounts import credits
from core.testing import use_up

from .models import PersonalDocument, ProcessingStatus

User = get_user_model()


@override_settings(AI_CREDIT_COSTS={"summary": 3, "ocr": 1}, AI_WEEKLY_LIMIT_POINTS=100)
class UploadWhenWeeklyLimitIsUsedUpTests(TestCase):
    """주간 한도를 넘은 상태에서 요약본을 올리거나 다시 요약할 때의 차단과 크레딧 허용."""

    def setUp(self):
        self.user = User.objects.create_user(username="lim", password="pw")
        self.client.force_login(self.user)
        cache.clear()                           # 올릴 때 읽어 둔 글자가 캐시에 남아 다른 테스트에 번지지 않게
        self.addCleanup(cache.clear)

    def upload(self, text="본문 " * 50):
        data = {"title": "", "file": SimpleUploadedFile("note.txt", text.encode()), "document_type": "lecture",
                "course_name": "선형대수학", "professor": "김교수"}
        with patch("mypage.views.threading.Thread") as thread:
            res = self.client.post("/mypage/", data, follow=True)
        return res, thread

    def test_blocked_with_a_clear_message_when_limit_and_credits_are_gone(self):
        use_up(self.user, 101)
        res, thread = self.upload()
        thread.assert_not_called()
        self.assertFalse(PersonalDocument.objects.exists())                      # 파일도 남기지 않는다
        self.assertContains(res, "자료를 올리지 못했습니다")
        self.assertContains(res, "한도를 다 썼고 남은 크레딧도 없어요")

    def test_credits_let_the_upload_and_summary_start(self):
        use_up(self.user, 101)
        credits.grant(self.user, 30, "test")
        res, thread = self.upload()
        self.assertEqual(PersonalDocument.objects.get().summary_status, ProcessingStatus.PROCESSING)
        self.assertEqual(thread.call_args.kwargs["target"].__name__, "_generate_summary_bg")

    def test_too_few_credits_for_the_whole_document_uploads_but_waits(self):
        use_up(self.user, 101)
        credits.grant(self.user, 4, "test")                                      # 첫 조각(3)은 되지만 5조각(15점)은 모자란다
        res, thread = self.upload("\n\n".join("가" * 3000 for _ in range(5)))
        doc = PersonalDocument.objects.get()
        self.assertEqual(doc.summary_status, ProcessingStatus.PENDING)
        self.assertContains(res, "요약은 시작하지 않았습니다")

    def test_resummarize_is_blocked_too(self):
        doc = PersonalDocument.objects.create(user=self.user, title="t", course_name="선형대수학", professor="김",
                                              document_type="lecture", extracted_text="내용 " * 100,
                                              summary_status=ProcessingStatus.FAILED)
        use_up(self.user, 101)
        with patch("mypage.views.threading.Thread") as thread:
            res = self.client.post(f"/mypage/{doc.pk}/resummarize/", follow=True)
        thread.assert_not_called()
        self.assertContains(res, "남은 크레딧도 없어요")
        doc.refresh_from_db()
        self.assertEqual(doc.summary_status, ProcessingStatus.FAILED)

    def test_upload_estimate_says_not_enough_without_credits_and_enough_with_them(self):
        use_up(self.user, 101)
        url = "/mypage/estimate/"
        post = lambda: self.client.post(url, {"file": SimpleUploadedFile("n.txt", ("본문 " * 50).encode())}).json()
        self.assertFalse(post()["enough"])
        credits.grant(self.user, 30, "test")
        self.assertTrue(post()["enough"])
