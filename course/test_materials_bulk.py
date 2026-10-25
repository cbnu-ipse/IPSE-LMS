from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.test import TestCase

from mypage.models import PersonalDocument

User = get_user_model()


class BulkDeleteTests(TestCase):
    def setUp(self):
        self.lecturer = User.objects.create_user(username="lect", password="pw", is_lecturer=True)
        self.student = User.objects.create_user(username="stud", password="pw")
        self.docs = []
        for i in range(4):
            doc = PersonalDocument.objects.create(user=self.student, title=f"자료{i}", extracted_text="x")
            doc.file.save(f"f{i}.txt", ContentFile(b"hello"))
            self.docs.append(doc)

    def delete(self, ids, **extra):
        return self.client.post("/course/studio/materials/bulk-delete/", {"ids": ids, **extra}, follow=True)

    def test_selected_documents_and_files_are_deleted(self):
        self.client.force_login(self.lecturer)
        paths = [d.file.path for d in self.docs[:2]]
        res = self.delete([self.docs[0].pk, self.docs[1].pk], next="/course/studio/materials/?scope=all")
        self.assertContains(res, "자료 2개를 삭제했습니다.")
        self.assertEqual(sorted(PersonalDocument.objects.values_list("title", flat=True)), ["자료2", "자료3"])
        import os
        self.assertFalse(any(os.path.exists(p) for p in paths))
        for d in self.docs[2:]:
            d.file.delete(save=False)

    def test_nothing_selected_and_junk_ids(self):
        self.client.force_login(self.lecturer)
        self.assertContains(self.delete([]), "삭제할 자료를 선택해주세요.")
        self.assertContains(self.delete(["abc", "-1"]), "삭제할 자료를 선택해주세요.")
        self.assertEqual(PersonalDocument.objects.count(), 4)

    def test_limit_per_request(self):
        self.client.force_login(self.lecturer)
        self.assertContains(self.delete(list(range(1, 202))), "한 번에 200개까지")
        self.assertEqual(PersonalDocument.objects.count(), 4)

    def test_non_lecturers_cannot_delete_and_next_must_stay_in_studio(self):
        self.client.force_login(self.student)
        self.assertEqual(self.delete([self.docs[0].pk]).status_code, 403)
        self.assertEqual(PersonalDocument.objects.count(), 4)
        self.client.force_login(self.lecturer)
        res = self.client.post("/course/studio/materials/bulk-delete/", {"ids": [self.docs[0].pk], "next": "https://evil.example/"})
        self.assertEqual(res.status_code, 302)
        self.assertTrue(res["Location"].startswith("/course/studio/materials/"))

    def test_page_has_checkboxes_tied_to_the_bulk_form(self):
        self.client.force_login(self.lecturer)
        html = self.client.get("/course/studio/materials/").content.decode()
        self.assertEqual(html.count('form="bulk-form" name="ids"'), 4)
        self.assertIn('id="bulk-form"', html)
        self.assertIn("선택 삭제", html)
