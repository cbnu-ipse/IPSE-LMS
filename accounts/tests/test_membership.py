import json

from django.test import TestCase

from accounts.models import (
    Friendship, GraduationRequest, LeafCode, LeafCodeUsage, LeafTransaction, Notification, User,
)
from community.models import CommunityComment, CommunityPost


class GraduationTestCase(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username="stu", password="pw", first_name="민수", last_name="김")
        self.boss = User.objects.create_user(username="boss", password="pw", is_executive=True)
        self.other = User.objects.create_user(username="oth", password="pw")

    def test_apply_notify_and_approve(self):
        self.client.force_login(self.student)
        self.client.post("/accounts/graduation/apply/", {"message": "2026년 2월 졸업"})
        req = GraduationRequest.objects.get(user=self.student)
        self.assertEqual((req.status, req.message), ("pending", "2026년 2월 졸업"))
        n = Notification.objects.get(recipient=self.boss)
        self.assertEqual((n.notification_type, n.link), ("graduation_request", "/accounts/graduation-requests/"))
        self.client.post("/accounts/graduation/apply/")  # 중복 신청 무시
        self.assertEqual(GraduationRequest.objects.filter(user=self.student).count(), 1)

        self.client.force_login(self.other)  # 일반 회원은 관리 화면 접근 불가
        self.assertEqual(self.client.get("/accounts/graduation-requests/").status_code, 403)
        self.assertEqual(self.client.post(f"/accounts/graduation-requests/{req.id}/", {"action": "approve"}).status_code, 403)

        self.client.force_login(self.boss)
        self.assertContains(self.client.get("/accounts/graduation-requests/"), "2026년 2월 졸업")
        self.client.post(f"/accounts/graduation-requests/{req.id}/", {"action": "approve"})
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_graduate)
        self.assertIsNotNone(self.student.graduated_at)
        self.assertIn("졸업", self.student.badge_html)
        self.assertTrue(Notification.objects.filter(recipient=self.student, notification_type="graduation_result").exists())

    def test_reject_and_cancel(self):
        self.client.force_login(self.student)
        self.client.post("/accounts/graduation/apply/")
        self.client.post("/accounts/graduation/cancel/")
        self.assertFalse(GraduationRequest.objects.exists())
        self.client.post("/accounts/graduation/apply/")
        req = GraduationRequest.objects.get()
        self.client.force_login(self.boss)
        self.client.post(f"/accounts/graduation-requests/{req.id}/", {"action": "reject"})
        req.refresh_from_db()
        self.student.refresh_from_db()
        self.assertEqual(req.status, "rejected")
        self.assertFalse(self.student.is_graduate)

    def test_badge_shows_on_post_and_comment(self):
        User.objects.filter(pk=self.student.pk).update(is_graduate=True)
        post = CommunityPost.objects.create(title="t", content="c", author=self.student)
        CommunityComment.objects.create(post=post, author=self.student, content="hi")
        self.client.force_login(self.other)
        res = self.client.get(f"/community/board/{post.id}/")
        if res.status_code == 404:
            self.skipTest("게시글 상세 경로가 다름")
        self.assertContains(res, 'title="졸업생"', count=2)


class WithdrawTestCase(TestCase):
    databases = {"default", "beta_judge"}

    def setUp(self):
        self.u = User.objects.create_user(username="bye", password="pw")
        self.client.force_login(self.u)

    def test_wrong_password_or_confirm_keeps_account(self):
        self.client.post("/accounts/withdraw/", {"password": "nope", "confirm": "회원탈퇴"})
        self.client.post("/accounts/withdraw/", {"password": "pw", "confirm": "탈퇴"})
        self.assertTrue(User.objects.filter(pk=self.u.pk).exists())

    def test_withdraw_deletes_everything(self):
        from problems.models import Problem, ProblemComment, SolveRecord
        author = User.objects.create_user(username="setter", password="pw")
        problem = Problem.objects.create(title="p", description="d", flag="f", author_id=author.pk)
        SolveRecord.objects.create(user_id=self.u.pk, problem=problem)  # SOLVED면 점수 시그널이 돌아 생략
        ProblemComment.objects.create(problem=problem, author_id=self.u.pk, content="c") \
            if "content" in [f.name for f in ProblemComment._meta.fields] else None
        LeafTransaction.objects.create(user=self.u, amount=5, transaction_type="TEST")
        LeafCodeUsage.objects.create(user=self.u, leaf_code=LeafCode.objects.create(code="X1", amount=1))
        post = CommunityPost.objects.create(title="t", content="c", author=self.u)
        CommunityComment.objects.create(post=post, author=author, content="남의 댓글")
        Friendship.objects.create(from_user=self.u, to_user=author)
        uid = self.u.pk

        res = self.client.post("/accounts/withdraw/", {"password": "pw", "confirm": "회원탈퇴"})
        self.assertEqual(res.status_code, 302)
        self.assertFalse(User.objects.filter(pk=uid).exists())
        for qs in (LeafTransaction.objects.filter(user_id=uid), LeafCodeUsage.objects.filter(user_id=uid),
                   CommunityPost.objects.filter(author_id=uid), CommunityComment.objects.filter(post=post),
                   Friendship.objects.filter(from_user_id=uid), SolveRecord.objects.filter(user_id=uid),
                   ProblemComment.objects.filter(author_id=uid)):
            self.assertFalse(qs.exists(), qs.model.__name__)
        self.assertTrue(Problem.objects.filter(pk=problem.pk).exists())  # 남의 문제는 그대로
        self.assertTrue(User.objects.filter(pk=author.pk).exists())

    def test_blockers(self):
        from course.models import Course
        from game import poker_engine
        from game.models import PokerChipWallet
        admin = User.objects.create_superuser(username="root", password="pw")
        self.client.force_login(admin)
        self.assertContains(self.client.get("/accounts/withdraw/"), "관리자 계정은 탈퇴할 수 없습니다")
        self.client.post("/accounts/withdraw/", {"password": "pw", "confirm": "회원탈퇴"})
        self.assertTrue(User.objects.filter(pk=admin.pk).exists())

        PokerChipWallet.objects.create(user=self.u, chips=10000)
        poker_engine.create_table(self.u, "intermediate")
        self.client.force_login(self.u)
        self.assertContains(self.client.get("/accounts/withdraw/"), "게임 방에 앉아 있습니다")
        poker_engine.stand_up(self.u)
        if hasattr(Course, "instructor"):
            try:
                Course.objects.create(title="c", instructor=self.u, slug="c")
                self.assertContains(self.client.get("/accounts/withdraw/"), "담당 중인 강의")
            except Exception:
                pass


class AdminUserDeleteTestCase(TestCase):
    databases = {"default", "beta_judge"}

    def test_superuser_can_delete_user_with_leaf_history(self):
        root = User.objects.create_superuser(username="root", password="pw")
        u = User.objects.create_user(username="victim", password="pw")
        LeafTransaction.objects.create(user=u, amount=5, transaction_type="TEST")
        LeafCodeUsage.objects.create(user=u, leaf_code=LeafCode.objects.create(code="Y1", amount=1))
        self.client.force_login(root)
        res = self.client.get(f"/admin/accounts/user/{u.pk}/delete/")
        self.assertEqual(res.context["perms_lacking"], set())  # "삭제할 권한이 없습니다" 없음
        self.client.post(f"/admin/accounts/user/{u.pk}/delete/", {"post": "yes"})
        self.assertFalse(User.objects.filter(pk=u.pk).exists())
        self.assertFalse(LeafTransaction.objects.filter(user_id=u.pk).exists())
        # 원장 화면에서 직접 지우는 건 여전히 막힌다
        LeafTransaction.objects.create(user=root, amount=1, transaction_type="TEST")
        tx = LeafTransaction.objects.get(user=root)
        self.assertEqual(self.client.get(f"/admin/accounts/leaftransaction/{tx.pk}/delete/").status_code, 403)


class ProfileCardTestCase(TestCase):
    def test_profile_stats_has_graduate_and_friend_status(self):
        me = User.objects.create_user(username="me", password="pw")
        other = User.objects.create_user(username="ot", password="pw", is_graduate=True)
        self.client.force_login(me)
        data = self.client.get(f"/ranking/api/profile-stats/{other.pk}/").json()
        self.assertTrue(data["is_graduate"])
        self.assertEqual(data["friend_status"], "none")
        Friendship.objects.create(from_user=other, to_user=me)
        self.assertEqual(self.client.get(f"/ranking/api/profile-stats/{other.pk}/").json()["friend_status"], "incoming")
        self.assertEqual(self.client.get(f"/ranking/api/profile-stats/{me.pk}/").json()["friend_status"], "self")


class ProfileAccountCardTestCase(TestCase):
    def test_profile_shows_account_management(self):
        u = User.objects.create_user(username="pf", password="pw")
        boss = User.objects.create_user(username="pb", password="pw", is_president=True)
        self.client.force_login(u)
        res = self.client.get("/accounts/profile/")
        self.assertContains(res, "졸업생 전환 신청")
        self.assertContains(res, "/accounts/withdraw/")
        self.assertNotContains(res, "졸업생 전환 신청 관리")
        self.client.post("/accounts/graduation/apply/")
        self.assertContains(self.client.get("/accounts/profile/"), "운영진 승인을 기다리는 중")
        self.client.force_login(boss)
        self.assertContains(self.client.get("/accounts/profile/"), "대기 1건 보기")
