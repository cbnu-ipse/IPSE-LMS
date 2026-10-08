import json
import random
from datetime import datetime, timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from accounts import treats
from accounts.models import TreatTransaction, User
from . import trick_or_treat as tot
from .models import TrickOrTreatLog, TrickOrTreatRun

PAST = datetime(2020, 1, 1, tzinfo=treats.KST)
FUTURE = timezone.now() + timedelta(days=30)


class AlwaysRng:
    """rng.random()이 항상 같은 값을 돌려준다 (0 = 유령, 0.99 = 사탕·왕사탕 없음)."""
    def __init__(self, value):
        self.value = value

    def random(self):
        return self.value

    def shuffle(self, x):
        pass


@patch.object(treats, "TREAT_EVENT_END", FUTURE)
class TreatCurrencyTestCase(TestCase):
    def setUp(self):
        self.u = User.objects.create_user(username="t1", password="x")

    def test_daily_cap(self):
        self.assertEqual(treats.grant(self.u, 7, "test"), 7)
        self.assertEqual(treats.grant(self.u, 7, "test"), 3)  # 하루 10개까지
        self.assertEqual(treats.grant(self.u, 1, "test"), 0)
        self.u.refresh_from_db()
        self.assertEqual(self.u.treats, 10)
        # 다음 날이면 다시 받는다
        TreatTransaction.objects.update(created_at=timezone.now() - timedelta(days=1))
        self.assertEqual(treats.grant(self.u, 4, "test"), 4)

    def test_no_exchange_during_event_and_ranking(self):
        treats.grant(self.u, 5, "test")
        ok, _ = treats.exchange_to_leaves(self.u, 1)
        self.assertFalse(ok)
        boss = User.objects.create_user(username="boss", password="x", is_president=True)  # 운영진 포함
        treats.grant(boss, 5, "test")
        late = User.objects.create_user(username="late", password="x")
        treats.grant(late, 3, "test")
        rows = treats.ranking()
        self.assertEqual([r["user"].username for r in rows], ["t1", "boss", "late"])  # 동점은 먼저 도달한 사람
        self.assertEqual(treats.my_rank(late), 3)

    def test_guestbook_gives_treats_instead_of_leaf(self):
        self.client.force_login(self.u)
        res = self.client.post("/community/guestbook/api/create/", data=json.dumps({"content": "해피 할로윈"}),
                               content_type="application/json")
        self.assertEqual(res.json()["treats_given"], treats.TREAT_GUESTBOOK)
        self.u.refresh_from_db()
        self.assertEqual((self.u.treats, self.u.leaves), (treats.TREAT_GUESTBOOK, 0))


class TreatAfterEventTestCase(TestCase):
    def setUp(self):
        self.u = User.objects.create_user(username="t2", password="x")
        with patch.object(treats, "TREAT_EVENT_END", FUTURE):
            treats.grant(self.u, 6, "test")
        # 실제 마감 시각 기준 순위가 보이도록 거래 시각을 이벤트 기간 안으로
        TreatTransaction.objects.update(created_at=PAST - timedelta(days=1))

    @patch.object(treats, "TREAT_EVENT_END", PAST)
    def test_after_event_no_earning_exchange_ok_ranking_frozen(self):
        self.assertEqual(treats.grant(self.u, 3, "test"), 0)  # 끝나면 못 받는다
        ok, msg = treats.exchange_to_leaves(self.u, 4)
        self.assertTrue(ok, msg)
        self.u.refresh_from_db()
        self.assertEqual((self.u.treats, self.u.leaves), (2, 4))
        self.assertEqual(treats.ranking()[0]["treats"], 6)  # 환전해도 순위(마감 시점 합계)는 그대로
        self.assertFalse(treats.exchange_to_leaves(self.u, 3)[0])  # 가진 것보다 많이는 불가

    @patch.object(treats, "TREAT_EVENT_END", PAST)
    def test_guestbook_gives_leaf_after_event(self):
        self.client.force_login(self.u)
        res = self.client.post("/community/guestbook/api/create/", data=json.dumps({"content": "hi"}),
                               content_type="application/json")
        self.assertTrue(res.json()["leaf_given"])
        self.assertEqual(res.json()["treats_given"], 0)

    @patch.object(treats, "TREAT_EVENT_END", PAST)
    def test_game_closed_after_event(self):
        self.assertFalse(tot.start(self.u)[0])


@patch.object(treats, "TREAT_EVENT_END", FUTURE)
class TrickOrTreatGameTestCase(TestCase):
    def setUp(self):
        self.u = User.objects.create_user(username="kid", password="x")

    def test_treat_then_home_grants_bag(self):
        tot.start(self.u)
        run = TrickOrTreatRun.objects.get(user=self.u)
        haunted = run.offers.index("haunted")
        ok, res = tot.knock(self.u, haunted, rng=AlwaysRng(0.99))
        self.assertEqual((res["outcome"], res["gained"]), ("treat", 4))
        run.refresh_from_db()
        self.assertEqual((run.bag, run.step), (4, 1))
        ok, res = tot.go_home(self.u)
        self.assertEqual(res, {"bag": 4, "granted": 4})
        self.u.refresh_from_db()
        self.assertEqual(self.u.treats, 4)
        self.assertFalse(TrickOrTreatRun.objects.exists())
        self.assertEqual(TrickOrTreatLog.objects.get().result, "home")

    def test_ghost_loses_bag(self):
        tot.start(self.u)
        tot.knock(self.u, 0, rng=AlwaysRng(0.99))
        ok, res = tot.knock(self.u, 0, rng=AlwaysRng(0.0))
        self.assertEqual(res["outcome"], "ghost")
        self.assertGreater(res["lost"], 0)
        self.assertFalse(TrickOrTreatRun.objects.exists())
        self.u.refresh_from_db()
        self.assertEqual(self.u.treats, 0)

    def test_home_capped_by_daily_limit_and_risk_grows(self):
        treats.grant(self.u, 8, "test")
        tot.start(self.u)
        for _ in range(3):
            run = TrickOrTreatRun.objects.get(user=self.u)
            tot.knock(self.u, run.offers.index("candle"), rng=AlwaysRng(0.99))
        self.assertEqual(tot.go_home(self.u)[1], {"bag": 6, "granted": 2})
        self.assertGreater(tot.risk_of("pumpkin", 5), tot.risk_of("pumpkin", 0))

    def test_endpoints_and_page(self):
        self.client.force_login(self.u)
        page = self.client.get("/game/trick-or-treat/")
        self.assertContains(page, "트릭 오어 트릿")
        self.assertContains(page, '"event_active": true')  # 상태가 JSON 객체로 들어가는지 (문자열로 이중 인코딩 X)
        data = self.client.post("/game/trick-or-treat/start/", content_type="application/json").json()
        self.assertEqual(len(data["state"]["run"]["houses"]), 3)
        res = self.client.post("/game/trick-or-treat/knock/", data=json.dumps({"house": 9}), content_type="application/json")
        self.assertEqual(res.status_code, 400)
        random.seed(0)
        data = self.client.post("/game/trick-or-treat/knock/", data=json.dumps({"house": 0}), content_type="application/json").json()
        self.assertIn(data["result"]["outcome"], ("treat", "ghost"))
        self.assertEqual(self.client.post("/game/trick-or-treat/exchange/", data=json.dumps({"amount": 1}),
                                          content_type="application/json").status_code, 400)  # 기간 중 환전 불가
