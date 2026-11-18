from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import PersonalDocument, PersonalFolder, ProcessingStatus

User = get_user_model()


class BulkDocumentTests(TestCase):
    """개인 탭: 여러 자료를 골라 한 번에 삭제하거나 폴더로 옮긴다."""

    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        self.other = User.objects.create_user(username="o", password="pw")
        self.client.force_login(self.user)
        self.docs = [self.doc(f"자료{i}") for i in range(3)]
        self.url = reverse("mypage:document_bulk")

    def doc(self, title, user=None, **kw):
        return PersonalDocument.objects.create(user=user or self.user, title=title, summary="요약",
                                               summary_status=ProcessingStatus.DONE, **kw)

    def post(self, **data):
        return self.client.post(self.url, data)

    def test_delete_hides_only_the_picked_documents(self):
        a, b, c = self.docs
        res = self.post(action="delete", ids=[a.pk, b.pk])
        self.assertRedirects(res, reverse("mypage:document_list"))
        self.assertEqual(set(PersonalDocument.objects.filter(is_deleted=True).values_list("pk", flat=True)), {a.pk, b.pk})
        self.assertTrue(PersonalDocument.objects.filter(pk=a.pk).exists())          # 하나씩 지울 때처럼 숨김 처리 (행은 남는다)
        c.refresh_from_db()
        self.assertFalse(c.is_deleted)

    def test_move_to_a_folder_and_back_to_the_root(self):
        folder = PersonalFolder.objects.create(user=self.user, name="오토마타")
        ids = [d.pk for d in self.docs[:2]]
        self.post(action="move", ids=ids, folder=folder.pk)
        self.assertEqual(PersonalDocument.objects.filter(folder=folder).count(), 2)
        self.post(action="move", ids=ids, folder="")
        self.assertEqual(PersonalDocument.objects.filter(folder__isnull=True).count(), 3)

    def test_other_peoples_documents_and_folders_are_never_touched(self):
        theirs = self.doc("남의 자료", user=self.other)
        their_folder = PersonalFolder.objects.create(user=self.other, name="남의 폴더")
        self.post(action="delete", ids=[theirs.pk, self.docs[0].pk])
        theirs.refresh_from_db()
        self.assertFalse(theirs.is_deleted)
        self.post(action="move", ids=[self.docs[1].pk], folder=their_folder.pk)
        self.docs[1].refresh_from_db()
        self.assertIsNone(self.docs[1].folder)

    def test_nothing_picked_or_bad_action_changes_nothing(self):
        self.post(action="delete")
        self.post(action="delete", ids=["abc", "-1"])
        self.post(action="explode", ids=[self.docs[0].pk])
        self.assertFalse(PersonalDocument.objects.filter(is_deleted=True).exists())

    def test_already_deleted_documents_are_skipped(self):
        gone = self.doc("지운 자료", is_deleted=True)
        folder = PersonalFolder.objects.create(user=self.user, name="f")
        self.post(action="move", ids=[gone.pk], folder=folder.pk)
        gone.refresh_from_db()
        self.assertIsNone(gone.folder)

    def test_redirects_back_to_the_folder_page_but_never_off_site(self):
        folder = PersonalFolder.objects.create(user=self.user, name="f")
        back = reverse("mypage:document_list", args=[folder.pk])
        self.assertRedirects(self.post(action="delete", ids=[self.docs[0].pk], next=back), back)
        res = self.post(action="delete", ids=[self.docs[1].pk], next="https://evil.example/")
        self.assertRedirects(res, reverse("mypage:document_list"))

    def test_only_post_and_login(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)
        self.client.logout()
        self.assertEqual(self.post(action="delete", ids=[self.docs[0].pk]).status_code, 302)
        self.assertFalse(PersonalDocument.objects.filter(is_deleted=True).exists())

    def test_list_page_offers_the_selection_mode_for_every_document(self):
        note = self.doc("노트", document_type=PersonalDocument.DocumentType.NOTE)
        html = self.client.get(reverse("mypage:document_list")).content.decode()
        self.assertIn('id="manage-toggle"', html)
        self.assertIn('id="manage-bar"', html)
        self.assertIn(f'action="{self.url}"', html)
        for d in [*self.docs, note]:                       # 노트·모의고사까지 모든 자료 카드를 고를 수 있다
            self.assertIn(f'data-doc-id="{d.pk}"', html)
