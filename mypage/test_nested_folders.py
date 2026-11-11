from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from . import folders as tree
from .models import PersonalDocument, PersonalFolder, ProcessingStatus

User = get_user_model()


def folder(user, name, parent=None):
    return PersonalFolder.objects.create(user=user, name=name, parent=parent)


class NestedFolderBase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        self.other = User.objects.create_user(username="o", password="pw")
        self.client.force_login(self.user)

    def create(self, name, parent=None, user=None):
        self.client.force_login(user or self.user)
        data = {"name": name}
        if parent is not None:
            data["parent"] = parent.pk
        return self.client.post(reverse("mypage:folder_create"), data)

    def chain(self, n):
        out, parent = [], None
        for i in range(n):
            parent = folder(self.user, f"L{i + 1}", parent)
            out.append(parent)
        return out


class TreeTests(NestedFolderBase):
    def test_depth_path_and_dfs_order(self):
        a = folder(self.user, "과목")
        b = folder(self.user, "1학기", a)
        folder(self.user, "중간", b)
        folder(self.user, "기타")
        ordered, nodes, roots = tree.build_tree(self.user)
        self.assertEqual([n.name for n in ordered], ["과목", "1학기", "중간", "기타"])
        self.assertEqual([n.depth for n in ordered], [1, 2, 3, 1])
        self.assertEqual(nodes[b.pk].children[0].path, "과목 / 1학기 / 중간")
        self.assertEqual(nodes[a.pk].height, 3)
        self.assertEqual(len(nodes[a.pk].subtree_ids), 3)

    def test_other_users_folders_are_not_in_my_tree(self):
        folder(self.other, "남의 폴더")
        self.assertEqual(tree.build_tree(self.user)[0], [])

    def test_breadcrumb_goes_from_the_top(self):
        a, b, c = self.chain(3)
        _, nodes, _ = tree.build_tree(self.user)
        self.assertEqual([n.name for n in tree.breadcrumb(nodes, c)], ["L1", "L2", "L3"])
        self.assertEqual(tree.breadcrumb(nodes, None), [])


class CreateTests(NestedFolderBase):
    def test_create_inside_a_folder(self):
        a = folder(self.user, "A")
        res = self.create("B", parent=a)
        b = PersonalFolder.objects.get(name="B")
        self.assertEqual(b.parent, a)
        self.assertRedirects(res, reverse("mypage:document_list", args=[b.pk]))

    def test_create_at_root_is_unchanged(self):
        self.create("Root")
        self.assertIsNone(PersonalFolder.objects.get(name="Root").parent)

    def test_cannot_create_below_someone_elses_folder(self):
        theirs = folder(self.other, "남의 것")
        self.create("X", parent=theirs)
        self.assertFalse(PersonalFolder.objects.filter(name="X").exists())

    def test_depth_limit(self):
        chain = self.chain(tree.MAX_FOLDER_DEPTH)
        self.create("too deep", parent=chain[-1])
        self.assertFalse(PersonalFolder.objects.filter(name="too deep").exists())
        self.create("fits", parent=chain[-2])
        self.assertTrue(PersonalFolder.objects.filter(name="fits").exists())


class DeleteTests(NestedFolderBase):
    databases = {"default", "beta_judge"}      # 사용자를 지우면 accounts 시그널이 judge DB도 정리한다

    def test_folder_with_subfolders_cannot_be_deleted(self):
        a = folder(self.user, "A")
        folder(self.user, "B", a)
        self.client.post(reverse("mypage:folder_delete", args=[a.pk]))
        self.assertTrue(PersonalFolder.objects.filter(pk=a.pk).exists())

    def test_documents_move_up_one_level_not_to_the_root(self):
        a = folder(self.user, "A")
        b = folder(self.user, "B", a)
        doc = PersonalDocument.objects.create(user=self.user, folder=b, title="d", summary_status=ProcessingStatus.DONE)
        res = self.client.post(reverse("mypage:folder_delete", args=[b.pk]))
        doc.refresh_from_db()
        self.assertEqual(doc.folder, a)
        self.assertRedirects(res, reverse("mypage:document_list", args=[a.pk]))

    def test_root_folder_documents_still_go_to_the_root(self):
        a = folder(self.user, "A")
        doc = PersonalDocument.objects.create(user=self.user, folder=a, title="d", summary_status=ProcessingStatus.DONE)
        self.client.post(reverse("mypage:folder_delete", args=[a.pk]))
        doc.refresh_from_db()
        self.assertIsNone(doc.folder)

    def test_deleting_a_user_with_nested_folders_works(self):
        self.chain(3)
        self.user.delete()
        self.assertEqual(PersonalFolder.objects.count(), 0)


class MoveTests(NestedFolderBase):
    def move(self, f, target):
        return self.client.post(reverse("mypage:folder_move", args=[f.pk]), {"parent": target.pk if target else ""})

    def test_move_into_another_folder_and_back_to_the_root(self):
        a, b = folder(self.user, "A"), folder(self.user, "B")
        self.move(b, a)
        b.refresh_from_db()
        self.assertEqual(b.parent, a)
        self.move(b, None)
        b.refresh_from_db()
        self.assertIsNone(b.parent)

    def test_cannot_move_into_itself_or_its_own_descendant(self):
        a, b, c = self.chain(3)
        for target in (a, b, c):
            self.move(a, target)
        a.refresh_from_db()
        self.assertIsNone(a.parent)

    def test_depth_limit_counts_the_whole_branch(self):
        chain = self.chain(tree.MAX_FOLDER_DEPTH - 1)
        branch = folder(self.user, "branch")
        folder(self.user, "leaf", branch)               # 높이 2
        self.move(branch, chain[-1])                    # 4 + 2 = 6 > 5
        branch.refresh_from_db()
        self.assertIsNone(branch.parent)
        self.move(branch, chain[-2])                    # 3 + 2 = 5
        branch.refresh_from_db()
        self.assertEqual(branch.parent, chain[-2])

    def test_only_the_owner_can_move_and_only_to_own_folders(self):
        mine, theirs = folder(self.user, "mine"), folder(self.other, "theirs")
        self.assertEqual(self.client.post(reverse("mypage:folder_move", args=[theirs.pk]), {"parent": ""}).status_code, 403)
        self.move(mine, theirs)
        mine.refresh_from_db()
        self.assertIsNone(mine.parent)


class PageTests(NestedFolderBase):
    def test_root_page_lists_only_top_level_folders_as_cards(self):
        a = folder(self.user, "과목")
        folder(self.user, "하위", a)
        html = self.client.get(reverse("mypage:document_list")).content.decode()
        grid = html[html.index('id="doc-grid"'):]
        self.assertIn("과목", grid)
        self.assertIn("폴더 1개", grid)                                   # 과목 카드에 하위 폴더 수가 보인다

    def test_inside_a_folder_the_subfolders_are_shown_with_a_path(self):
        a = folder(self.user, "과목")
        b = folder(self.user, "1학기", a)
        folder(self.user, "중간", b)
        html = self.client.get(reverse("mypage:document_list", args=[b.pk])).content.decode()
        grid = html[html.index('id="doc-grid"'):]
        self.assertIn("중간", grid)
        self.assertIn('id="folder-breadcrumb"', html)
        self.assertIn('aria-current="page">1학기<', html)
        self.assertIn(reverse("mypage:document_list", args=[a.pk]), html)           # 위 폴더로 가는 링크
        self.assertIn("「1학기」 안에 만들어져요", html)
        self.assertIn('name="parent" value="%d"' % b.pk, html)           # 새 폴더는 지금 보는 폴더 안에 만들어진다

    def test_at_the_depth_limit_the_create_form_explains(self):
        chain = self.chain(tree.MAX_FOLDER_DEPTH)
        html = self.client.get(reverse("mypage:document_list", args=[chain[-1].pk])).content.decode()
        self.assertIn('id="folder-depth-note"', html)
        self.assertNotIn('id="folder-create-where"', html)

    def test_move_dialog_offers_the_paths(self):
        a = folder(self.user, "과목")
        folder(self.user, "1학기", a)
        html = self.client.get(reverse("mypage:document_list")).content.decode()
        self.assertIn("과목 / 1학기", html)
        self.assertIn(reverse("mypage:folder_move", args=[a.pk]), html)

    def test_someone_elses_folder_page_is_forbidden(self):
        theirs = folder(self.other, "x")
        self.assertEqual(self.client.get(reverse("mypage:document_list", args=[theirs.pk])).status_code, 403)
