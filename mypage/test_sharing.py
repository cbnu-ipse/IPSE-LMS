import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.test import TestCase, override_settings

from community.models import CommunityPost, CommunityPostAttachment

from .models import MockExam, PersonalDocument, ProcessingStatus, SharedImport, SharedMaterial

User = get_user_model()
PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 40
QUESTIONS = [
    {"type": "ox", "q": "비밀 문제 하나", "answer": True, "explanation": "해설 하나"},
    {"type": "mc", "q": "객관식 문제", "options": ["가", "나", "다", "라"], "answer": 2, "explanation": ""},
    {"type": "essay", "q": "서술 문제", "answer": "모범답안", "explanation": ""},
]
TMP = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TMP)
class SharingTestCase(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP, ignore_errors=True)

    def setUp(self):
        self.author = User.objects.create_user(username="author", password="pw")
        self.reader = User.objects.create_user(username="reader", password="pw")
        self.exam = MockExam.objects.create(user=self.author, course_code="운영체제", title="운영체제 모의고사", style_label="김교수 교수님", questions=QUESTIONS,
                                            answers=["O"], results=[True], submitted_at=None)
        self.pages = []
        for n in (1, 2):
            doc = PersonalDocument.objects.create(user=self.author, title=f"운영체제 속성 노트 ({n}/2)", file="", document_type="note", course_name="운영체제",
                                                  summary="# 노트\n- 핵심", summary_status=ProcessingStatus.DONE, is_course_material=False)
            doc.file.save("cram-note.png", ContentFile(PNG + bytes([n])), save=True)
            self.pages.append(doc)

    def share(self, kind, pk, user=None):
        self.client.force_login(user or self.author)
        return self.client.post(f"/mypage/share/{kind}/{pk}/")


class ShareTests(SharingTestCase):
    def test_sharing_a_note_posts_all_pages_to_the_free_board_and_returns_a_link(self):
        res = self.share("note", self.pages[1].pk)                                 # 둘째 장에서 눌러도 노트 전체
        data = res.json()
        self.assertTrue(data["ok"] and data["created"])
        post = CommunityPost.objects.get()
        self.assertEqual((post.category, post.author), ("free", self.author))
        self.assertTrue(post.title.startswith("[속성 노트] 운영체제 속성 노트"))
        self.assertTrue(data["url"].endswith(f"/board/{post.pk}/"))
        self.assertEqual(post.attachments.count(), 2)
        material = SharedMaterial.objects.get()
        self.assertEqual((material.kind, material.payload["markdown"], len(material.payload["attachments"])), ("note", "# 노트\n- 핵심", 2))

    def test_sharing_again_returns_the_existing_post_without_a_duplicate(self):
        self.share("note", self.pages[0].pk)
        res = self.share("note", self.pages[1].pk)
        self.assertFalse(res.json()["created"])
        self.assertEqual((CommunityPost.objects.count(), SharedMaterial.objects.count()), (1, 1))

    def test_sharing_a_mock_exam_keeps_questions_and_answers_out_of_the_post_text(self):
        res = self.share("mock", self.exam.pk)
        self.assertTrue(res.json()["ok"])
        post = CommunityPost.objects.get()
        self.assertIn("모의고사 3문항", post.content)
        self.assertNotIn("비밀 문제 하나", post.content + post.title)
        material = SharedMaterial.objects.get()
        self.assertEqual(len(material.payload["questions"]), 3)
        self.assertNotIn("answers", material.payload)                               # 푼 답·결과는 올리지 않는다

    def test_only_the_owner_can_share_and_unfinished_notes_are_refused(self):
        self.assertEqual(self.share("mock", self.exam.pk, self.reader).status_code, 400)
        self.assertEqual(self.share("note", self.pages[0].pk, self.reader).status_code, 400)
        PersonalDocument.objects.filter(pk=self.pages[0].pk).update(summary_status=ProcessingStatus.PROCESSING)
        PersonalDocument.objects.filter(pk=self.pages[1].pk).update(summary_status=ProcessingStatus.PROCESSING)
        res = self.share("note", self.pages[0].pk)
        self.assertEqual((res.status_code, res.json()["ok"]), (400, False))
        self.assertFalse(CommunityPost.objects.exists())

    def test_sharing_requires_login_and_post(self):
        self.client.logout()
        self.assertEqual(self.client.post(f"/mypage/share/mock/{self.exam.pk}/").status_code, 302)
        self.client.force_login(self.author)
        self.assertEqual(self.client.get(f"/mypage/share/mock/{self.exam.pk}/").status_code, 405)


class ImportTests(SharingTestCase):
    def test_importing_a_mock_exam_makes_a_fresh_unsolved_copy_for_the_reader(self):
        self.share("mock", self.exam.pk)
        material = SharedMaterial.objects.get()
        self.client.force_login(self.reader)
        res = self.client.post(f"/mypage/share/{material.pk}/import/")
        copy = MockExam.objects.get(user=self.reader)
        self.assertEqual((copy.title, copy.course_code, len(copy.questions)), ("운영체제 모의고사", "운영체제", 3))
        self.assertEqual((copy.answers, copy.results, copy.submitted_at), ([], [], None))
        self.assertEqual((copy.document.document_type, copy.document.user, copy.document.summary_status), ("mock", self.reader, "done"))
        self.assertRedirects(res, copy.document.get_absolute_url(), fetch_redirect_response=False)
        material.refresh_from_db()
        self.assertEqual(material.import_count, 1)

    def test_importing_twice_points_to_the_same_copy_and_counts_once(self):
        self.share("mock", self.exam.pk)
        material = SharedMaterial.objects.get()
        self.client.force_login(self.reader)
        self.client.post(f"/mypage/share/{material.pk}/import/")
        self.client.post(f"/mypage/share/{material.pk}/import/")
        self.assertEqual(MockExam.objects.filter(user=self.reader).count(), 1)
        material.refresh_from_db()
        self.assertEqual(material.import_count, 1)

    def test_a_deleted_copy_can_be_imported_again(self):
        self.share("mock", self.exam.pk)
        material = SharedMaterial.objects.get()
        self.client.force_login(self.reader)
        self.client.post(f"/mypage/share/{material.pk}/import/")
        PersonalDocument.objects.filter(user=self.reader).update(is_deleted=True)
        self.client.post(f"/mypage/share/{material.pk}/import/")
        self.assertEqual(MockExam.objects.filter(user=self.reader).count(), 2)
        self.assertEqual(SharedImport.objects.filter(user=self.reader).count(), 1)

    def test_importing_a_note_copies_every_page_image_and_the_markdown(self):
        self.share("note", self.pages[0].pk)
        material = SharedMaterial.objects.get()
        self.client.force_login(self.reader)
        self.client.post(f"/mypage/share/{material.pk}/import/")
        notes = list(PersonalDocument.objects.filter(user=self.reader, document_type="note").order_by("id"))
        self.assertEqual([n.title for n in notes], ["운영체제 속성 노트 (1/2)", "운영체제 속성 노트 (2/2)"])
        self.assertEqual({n.summary for n in notes}, {"# 노트\n- 핵심"})
        self.assertEqual([n.file.read() for n in notes], [PNG + b"\x01", PNG + b"\x02"])
        self.assertTrue(all(n.summary_status == "done" for n in notes))

    def test_the_author_cannot_import_their_own_post(self):
        self.share("mock", self.exam.pk)
        material = SharedMaterial.objects.get()
        self.client.post(f"/mypage/share/{material.pk}/import/")
        self.assertEqual(MockExam.objects.filter(user=self.author).count(), 1)         # 원본뿐

    def test_imported_questions_are_validated_again(self):
        self.share("mock", self.exam.pk)
        material = SharedMaterial.objects.get()
        material.payload["questions"] = [{"type": "ox", "q": "정상", "answer": False, "figure": {"svg": "<svg><script>x</script></svg>", "alt": "a"}},
                                         {"type": "mc", "q": "깨진 객관식", "options": ["하나"], "answer": 5}, "문자열"]
        material.save()
        self.client.force_login(self.reader)
        self.client.post(f"/mypage/share/{material.pk}/import/")
        copy = MockExam.objects.get(user=self.reader)
        self.assertEqual([q["q"] for q in copy.questions], ["정상"])
        self.assertNotIn("figure", copy.questions[0])                                   # 위험한 SVG는 그림만 빠진다

    def test_nothing_usable_shows_an_error_and_creates_no_copy(self):
        self.share("mock", self.exam.pk)
        material = SharedMaterial.objects.get()
        material.payload["questions"] = []
        material.save()
        self.client.force_login(self.reader)
        res = self.client.post(f"/mypage/share/{material.pk}/import/", follow=True)
        self.assertContains(res, "불러올 수 있는 문제가 없어요")
        self.assertFalse(PersonalDocument.objects.filter(user=self.reader).exists())
        self.assertEqual(SharedImport.objects.filter(user=self.reader).count(), 0)       # 실패하면 불러온 기록도 남기지 않는다

    def test_a_note_whose_images_are_gone_cannot_be_imported(self):
        self.share("note", self.pages[0].pk)
        CommunityPostAttachment.objects.all().delete()
        material = SharedMaterial.objects.get()
        self.client.force_login(self.reader)
        res = self.client.post(f"/mypage/share/{material.pk}/import/", follow=True)
        self.assertContains(res, "노트 이미지를 찾을 수 없어요")


class PagesTests(SharingTestCase):
    def test_share_buttons_show_on_the_mock_and_note_pages_with_the_copy_script(self):
        self.client.force_login(self.author)
        mock = self.client.get(self.exam.get_absolute_url())
        self.assertContains(mock, f"/mypage/share/mock/{self.exam.pk}/")
        self.assertContains(mock, "js/share-board.js")
        note = self.client.get(self.pages[0].get_absolute_url())
        self.assertContains(note, f"/mypage/share/note/{self.pages[0].pk}/")
        self.assertContains(note, "js/share-board.js")

    def test_post_page_offers_the_import_button_to_readers_but_not_the_author(self):
        self.share("mock", self.exam.pk)
        post = CommunityPost.objects.get()
        material = SharedMaterial.objects.get()
        url = f"/community/board/{post.pk}/"
        self.client.force_login(self.reader)
        res = self.client.get(url)
        self.assertContains(res, "내 자료로 불러오기")
        self.assertContains(res, f"/mypage/share/{material.pk}/import/")
        self.assertNotContains(res, "비밀 문제 하나")
        self.client.force_login(self.author)
        self.assertNotContains(self.client.get(url), f"/mypage/share/{material.pk}/import/")         # 본인에게는 불러오기 양식이 없다
