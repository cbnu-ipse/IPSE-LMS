from django.test import TestCase

from . import credits
from .models import CreditTransaction, User


class CreditLedgerTestCase(TestCase):
    def setUp(self):
        self.u = User.objects.create_user(username="c1", password="x")
        self.other = User.objects.create_user(username="c2", password="x")

    def test_grant_and_spend_update_balance_and_ledger(self):
        self.assertEqual(credits.grant(self.u, 50, "test", "지급"), 50)
        self.assertEqual(credits.spend(self.u, 20, "test", "사용"), 30)
        self.u.refresh_from_db()
        self.assertEqual(self.u.credits, 30)
        txs = list(CreditTransaction.objects.filter(user=self.u))
        self.assertEqual([(t.amount, t.balance_after) for t in txs], [(50, 50), (-20, 30)])
        self.assertTrue(credits.verify_ledger(self.u))

    def test_cannot_spend_more_than_balance(self):
        credits.grant(self.u, 10, "test")
        with self.assertRaises(credits.InsufficientCredits):
            credits.spend(self.u, 11, "test")
        self.u.refresh_from_db()
        self.assertEqual(self.u.credits, 10)
        self.assertEqual(CreditTransaction.objects.filter(user=self.u).count(), 1)  # 실패한 거래는 기록되지 않는다

    def test_invalid_amounts_rejected(self):
        for bad in (0, -5, 1.5, True, "3", None):
            with self.assertRaises(ValueError):
                credits.grant(self.u, bad, "test")
            with self.assertRaises(ValueError):
                credits.spend(self.u, bad, "test")

    def test_stale_user_object_does_not_overwrite_balance(self):
        stale = User.objects.get(pk=self.u.pk)
        credits.grant(self.u, 10, "test")
        credits.grant(stale, 5, "test")  # stale.credits는 0이지만 DB 값(10) 위에 더한다
        self.assertEqual(User.objects.get(pk=self.u.pk).credits, 15)
        self.assertEqual(stale.credits, 15)

    def test_chain_is_per_user_and_detects_tampering(self):
        credits.grant(self.u, 10, "test")
        credits.grant(self.other, 7, "test")
        credits.grant(self.u, 5, "test")
        first, second = CreditTransaction.objects.filter(user=self.u)
        self.assertEqual((first.previous_hash, second.previous_hash), (credits.GENESIS, first.hash))
        self.assertTrue(credits.verify_ledger(self.u) and credits.verify_ledger(self.other))
        CreditTransaction.objects.filter(pk=first.pk).update(amount=999)  # 원장을 직접 고치면 검증이 실패한다
        self.assertFalse(credits.verify_ledger(self.u))
        self.assertTrue(credits.verify_ledger(self.other))

    def test_balance_mismatch_detected(self):
        credits.grant(self.u, 10, "test")
        User.objects.filter(pk=self.u.pk).update(credits=11)
        self.assertFalse(credits.verify_ledger(self.u))

    def test_ledger_rows_are_immutable(self):
        credits.grant(self.u, 10, "test")
        tx = CreditTransaction.objects.get()
        tx.amount = 99
        with self.assertRaises(PermissionError):
            tx.save()

    def test_admin_is_read_only(self):
        credits.grant(self.u, 10, "test")
        admin_user = User.objects.create_superuser(username="root", password="x")
        self.client.force_login(admin_user)
        self.assertEqual(self.client.get("/admin/accounts/credittransaction/").status_code, 200)
        self.assertEqual(self.client.get("/admin/accounts/credittransaction/add/").status_code, 403)
