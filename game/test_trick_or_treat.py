import json
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


# 고정 지도 (6×6, 출발 🏠 = 왼쪽 아래, -1 = 귀신 집)
BOARD = [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [5, -1, 1, 1, 1, 1],
    [5, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1],
]


@patch.object(treats, "TREAT_EVENT_END", FUTURE)
class TrickOrTreatGameTestCase(TestCase):
    def setUp(self):
        self.u = User.objects.create_user(username="kid", password="x")

    def _run(self, board=BOARD):
        best, _ = tot.best_route(board)
        TrickOrTreatRun.objects.create(user=self.u, board=board, best=best)
        return best

    def test_best_route_and_route_check(self):
        best, route = tot.best_route(BOARD)
        self.assertEqual(tot.check_route(BOARD, route), best)
        self.assertEqual(best, 18)  # 5 + 5 + 나머지 8칸 1개씩
        self.assertIsNone(tot.check_route(BOARD, [[3, 1]]))           # 출발점과 붙어 있지 않음
        self.assertIsNone(tot.check_route(BOARD, [[4, 0], [3, 0], [4, 0]]))  # 같은 칸 다시
        self.assertIsNone(tot.check_route(BOARD, [[4, 0], [4, 1], [3, 1]]))  # 귀신 집
        self.assertIsNone(tot.check_route(BOARD, [[4, 0]] * 11))       # 걸음 초과
        self.assertEqual(tot.check_route(BOARD, [[4, 0], [3, 0]]), 10)

    def test_rewards_by_ratio(self):
        self.assertEqual([tot.reward_for(s, 20) for s in (20, 17, 14, 13)], [3, 2, 1, 0])

    def test_submit_best_grants_three_and_shows_best_route(self):
        best = self._run()
        _, route = tot.best_route(BOARD)
        ok, res = tot.submit(self.u, route)
        self.assertTrue(ok)
        self.assertEqual((res["score"], res["best"], res["earned"], res["granted"]), (best, best, 3, 3))
        self.assertEqual(len(res["best_route"]), tot.MOVES)
        self.assertFalse(TrickOrTreatRun.objects.exists())
        self.assertEqual(TrickOrTreatLog.objects.get().granted, 3)
        self.u.refresh_from_db()
        self.assertEqual(self.u.treats, 3)

    def test_invalid_route_rejected_and_late_gets_nothing(self):
        self._run()
        self.assertFalse(tot.submit(self.u, [[3, 1]])[0])
        TrickOrTreatRun.objects.update(created_at=timezone.now() - timedelta(seconds=tot.TIME_LIMIT + 10))
        _, route = tot.best_route(BOARD)
        ok, res = tot.submit(self.u, route)
        self.assertTrue(res["late"])
        self.assertEqual(res["granted"], 0)

    def test_daily_cap_applies(self):
        treats.grant(self.u, 9, "test")
        self._run()
        _, route = tot.best_route(BOARD)
        self.assertEqual(tot.submit(self.u, route)[1]["granted"], 1)

    def test_generated_board_is_solvable(self):
        board, best = tot.make_board()
        self.assertEqual(len(board), tot.SIZE)
        self.assertEqual(best, tot.best_route(board)[0])
        self.assertGreaterEqual(best, 15)

    def test_endpoints_and_page(self):
        self.client.force_login(self.u)
        page = self.client.get("/game/trick-or-treat/")
        self.assertContains(page, "사탕 골목 지도")
        self.assertContains(page, '"event_active": true')  # 상태가 JSON 객체로 들어가는지 (문자열로 이중 인코딩 X)
        data = self.client.post("/game/trick-or-treat/start/", content_type="application/json").json()
        self.assertEqual(len(data["state"]["run"]["board"]), tot.SIZE)
        self.assertNotIn("best", data["state"]["run"])  # 최고 점수는 제출 전엔 보내지 않는다
        res = self.client.post("/game/trick-or-treat/submit/", data=json.dumps({"route": [[0, 0]]}),
                               content_type="application/json")
        self.assertEqual(res.status_code, 400)
        res = self.client.post("/game/trick-or-treat/submit/", data=json.dumps({"route": []}),
                               content_type="application/json").json()
        self.assertEqual(res["result"]["score"], 0)
        self.assertEqual(self.client.post("/game/trick-or-treat/exchange/", data=json.dumps({"amount": 1}),
                                          content_type="application/json").status_code, 400)  # 기간 중 환전 불가
