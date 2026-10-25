import json

from django.test import TestCase

from accounts import credits
from accounts.models import LeafCode, User


class CreditCodeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="coder", password="pw")
        self.client.force_login(self.user)

    def redeem(self, code):
        return self.client.post("/accounts/profile/redeem-code/", data=json.dumps({"code": code}),
                                content_type="application/json")

    def test_credit_code_grants_credits_once(self):
        LeafCode.objects.create(code="AI10", reward_type="credit", amount=10)
        res = self.redeem("AI10")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["credits"], 10)
        self.user.refresh_from_db()
        self.assertEqual((self.user.credits, self.user.leaves), (10, 0))
        self.assertTrue(credits.verify_ledger(self.user))
        self.assertEqual(self.redeem("AI10").status_code, 400)        # 한 사람이 한 번만

    def test_leaf_code_still_grants_leaves(self):
        LeafCode.objects.create(code="LEAF5", amount=5)
        self.assertEqual(self.redeem("LEAF5").status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual((self.user.leaves, self.user.credits), (5, 0))
