import json
from unittest.mock import patch

from django.contrib.auth.models import Permission
from django.test import TestCase

from accounts import credits, grants
from accounts.models import CurrencyGrant, Notification, User


class CurrencyGrantTests(TestCase):
    def setUp(self):
        patcher = patch("accounts.utils.send_web_push")
        patcher.start()
        self.addCleanup(patcher.stop)
        self.grantor = User.objects.create_user(username="giver", password="pw", first_name="은", last_name="김")
        self.grantor.user_permissions.add(Permission.objects.get(codename="grant_currency"))
        self.admin = User.objects.create_superuser(username="boss", password="pw", email="b@b.com")
        self.member = User.objects.create_user(username="2024001", password="pw", first_name="길동", last_name="홍")
        self.plain = User.objects.create_user(username="plain", password="pw")

    def post(self, user, **data):
        self.client.force_login(user)
        return self.client.post("/accounts/grant/", data=json.dumps(data), content_type="application/json")

    def test_permission_holder_and_superuser_can_grant_others_cannot(self):
        self.assertTrue(grants.can_grant(self.grantor))
        self.assertTrue(grants.can_grant(self.admin))
        self.assertFalse(grants.can_grant(self.member))
        res = self.post(self.plain, user_id=self.member.pk, currency="credit", amount=10)
        self.assertEqual(res.status_code, 403)
        self.member.refresh_from_db()
        self.assertEqual(self.member.credits, 0)

    def test_credit_grant_updates_ledger_notifies_and_records(self):
        res = self.post(self.grantor, user_id=self.member.pk, currency="credit", amount=50, reason="스터디 우수")
        self.assertEqual(res.status_code, 200)
        self.assertIn("크레딧 50개", res.json()["message"])
        self.member.refresh_from_db()
        self.assertEqual(self.member.credits, 50)
        self.assertTrue(credits.verify_ledger(self.member))
        note = Notification.objects.get(recipient=self.member)
        self.assertEqual(note.notification_type, "currency_grant")
        self.assertIn("크레딧 50개", note.message)
        self.assertIn("스터디 우수", note.message)
        grant = CurrencyGrant.objects.get()
        self.assertEqual((grant.granted_by, grant.amount, grant.seen_at), (self.grantor, 50, None))

    def test_leaf_grant(self):
        self.post(self.admin, user_id=self.member.pk, currency="leaf", amount=30)
        self.member.refresh_from_db()
        self.assertEqual(self.member.leaves, 30)

    def test_limits_and_self_grant_are_rejected_without_changing_balances(self):
        for bad in ({"amount": 0}, {"amount": -5}, {"amount": "abc"}, {"amount": 501}, {"currency": "gold"}):
            data = {"user_id": self.member.pk, "currency": "credit", "amount": 10, **bad}
            self.assertEqual(self.post(self.grantor, **data).status_code, 400, bad)
        self.assertEqual(self.post(self.grantor, user_id=self.grantor.pk, currency="credit", amount=5).status_code, 400)
        self.assertEqual(self.post(self.grantor, user_id=99999, currency="credit", amount=5).status_code, 400)
        self.assertFalse(CurrencyGrant.objects.exists())
        self.assertFalse(Notification.objects.exists())

    def test_cannot_grant_to_bots_or_inactive_accounts(self):
        bot = User.objects.create_user(username="botty", password="pw", is_bot=True)
        gone = User.objects.create_user(username="gone", password="pw", is_active=False)
        for target in (bot, gone):
            self.assertEqual(self.post(self.grantor, user_id=target.pk, currency="credit", amount=5).status_code, 400)

    def test_search_finds_members_only_for_grantors(self):
        self.client.force_login(self.grantor)
        found = self.client.get("/accounts/grant/search/", {"q": "길동"}).json()["users"]
        self.assertEqual([u["username"] for u in found], ["2024001"])
        by_id = self.client.get("/accounts/grant/search/", {"q": "2024"}).json()["users"]
        self.assertEqual(len(by_id), 1)
        self.assertEqual(self.client.get("/accounts/grant/search/", {"q": ""}).json()["users"], [])
        self.client.force_login(self.plain)
        self.assertEqual(self.client.get("/accounts/grant/search/", {"q": "길동"}).status_code, 403)

    def test_recipient_sees_popup_once_after_logging_in(self):
        self.post(self.grantor, user_id=self.member.pk, currency="credit", amount=50, reason="우수")
        self.post(self.grantor, user_id=self.member.pk, currency="leaf", amount=20)
        self.client.force_login(self.member)
        html = self.client.get("/mypage/").content.decode()
        self.assertIn("재화가 도착했어요", html)
        self.assertIn("+50", html)
        self.assertIn("+20", html)
        self.assertEqual(self.client.post("/accounts/grant/seen/").status_code, 200)
        self.assertNotIn("재화가 도착했어요", self.client.get("/mypage/").content.decode())

    def test_grant_button_only_for_grantors(self):
        self.client.force_login(self.grantor)
        self.assertContains(self.client.get("/mypage/"), "openGrantModal")
        self.client.force_login(self.plain)
        self.assertNotContains(self.client.get("/mypage/"), "openGrantModal")
        self.assertNotContains(self.client.get("/mypage/"), 'id="grant-modal"')
