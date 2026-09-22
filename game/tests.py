import asyncio
import json
from datetime import timedelta
from unittest.mock import patch

from channels.db import database_sync_to_async
from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import consumers as game_consumers, poker_engine, views as game_views
from .models import PokerSeat, PokerTable, PokerChipWallet, HighLowSession, HighLowPlayLog
from .poker_engine import evaluate_best_of_7, _build_side_pots


class PokerHandEvaluatorTestCase(TestCase):
    """카드 평가 로직이 표준 포커 족보 순서를 지키는지 확인 (money path 핵심 로직)."""

    def test_category_ordering(self):
        royal_flush = evaluate_best_of_7(["AS", "KS", "QS", "JS", "TS", "2H", "3D"])
        straight_flush = evaluate_best_of_7(["9S", "8S", "7S", "6S", "5S", "2H", "3D"])
        four_kind = evaluate_best_of_7(["AS", "AH", "AD", "AC", "2H", "3D", "4C"])
        full_house = evaluate_best_of_7(["AS", "AH", "AD", "2C", "2H", "3D", "4C"])
        flush = evaluate_best_of_7(["AS", "KS", "9S", "5S", "2S", "2H", "3D"])
        straight = evaluate_best_of_7(["9S", "8H", "7D", "6C", "5S", "2H", "3D"])
        # 주의: 키커에 5-4-3-2를 함께 넣으면 A와 묶여 휠 스트레이트(A-2-3-4-5)가
        # 숨어버려 트리플/투페어/원페어보다 강하게 평가된다. 아래 키커들은 그런
        # 5연속 조합이 생기지 않도록 골랐다.
        trips = evaluate_best_of_7(["AS", "AH", "AD", "9C", "7H", "4D", "2C"])
        two_pair = evaluate_best_of_7(["AS", "AH", "5D", "5C", "9H", "7D", "2C"])
        one_pair = evaluate_best_of_7(["AS", "AH", "9D", "7C", "2H", "3D", "4C"])
        high_card = evaluate_best_of_7(["AS", "KH", "9D", "5C", "2H", "3D", "7C"])

        ordering = [
            high_card, one_pair, two_pair, trips, straight,
            flush, full_house, four_kind, straight_flush, royal_flush,
        ]
        for weaker, stronger in zip(ordering, ordering[1:]):
            self.assertLess(weaker, stronger)

    def test_wheel_straight_is_five_high(self):
        wheel = evaluate_best_of_7(["AS", "2H", "3D", "4C", "5S", "9H", "KD"])
        six_high = evaluate_best_of_7(["6S", "2H", "3D", "4C", "5S", "9H", "KD"])
        self.assertEqual(wheel[0], 4)   # 스트레이트 카테고리
        self.assertEqual(wheel[1], 5)   # 하이카드는 5 (A는 최하위 취급)
        self.assertLess(wheel, six_high)


class PokerSidePotTestCase(TestCase):
    """짧은 스택 올인이 섞였을 때 사이드팟이 정확히 나뉘는지 확인."""

    def test_uneven_all_ins_split_into_side_pots(self):
        # A: 50 올인, B: 150 올인, C: 150 콜 (전부 컨트리뷰션 == 최종 상태)
        a = PokerSeat(seat_number=0, contributed_total=50, status="all_in")
        b = PokerSeat(seat_number=1, contributed_total=150, status="all_in")
        c = PokerSeat(seat_number=2, contributed_total=150, status="active")

        pots = _build_side_pots([a, b, c])

        self.assertEqual(len(pots), 2)
        main_pot, side_pot = pots
        self.assertEqual(main_pot["amount"], 150)  # 50 * 3명
        self.assertEqual({s.seat_number for s in main_pot["eligible"]}, {0, 1, 2})
        self.assertEqual(side_pot["amount"], 200)  # (150-50) * 2명
        self.assertEqual({s.seat_number for s in side_pot["eligible"]}, {1, 2})

    def test_folded_contribution_stays_in_pot_but_not_eligible(self):
        a = PokerSeat(seat_number=0, contributed_total=100, status="folded")
        b = PokerSeat(seat_number=1, contributed_total=100, status="active")

        pots = _build_side_pots([a, b])

        self.assertEqual(len(pots), 1)
        self.assertEqual(pots[0]["amount"], 200)
        self.assertEqual({s.seat_number for s in pots[0]["eligible"]}, {1})


class PokerNextHandSchedulingTestCase(TestCase):
    """회귀 테스트: 핸드가 끝나도 table.status가 'playing'에 남아있으면
    next_deadline_at()/process_due_deadlines()가 next_hand_at을 절대 보지 않아
    "카운트다운은 뜨는데 다음 핸드가 시작을 안 함" 상태로 영원히 멈췄던 버그."""

    def _seat_two_active_players(self):
        table = PokerTable.get_solo()
        u1 = User.objects.create_user(username="p1", password="x")
        u2 = User.objects.create_user(username="p2", password="x")
        seats = {s.seat_number: s for s in table.seats.all()}
        s0, s1 = seats[0], seats[1]
        s0.user, s0.stack, s0.status, s0.contributed_total = u1, 19000, "active", 1000
        s0.hole_cards = ["AS", "KS"]
        s1.user, s1.stack, s1.status, s1.contributed_total = u2, 19000, "active", 1000
        s1.hole_cards = ["2H", "3D"]
        s0.save()
        s1.save()
        table.status = "playing"
        table.round = "river"
        table.pot = 2000
        table.dealer_seat = 0
        table.community_cards = ["4C", "5C", "6C", "7H", "9D"]
        table.save()
        return table, {0: s0, 1: s1}

    def test_finish_hand_with_two_remaining_marks_table_waiting(self):
        table, seats_by_number = self._seat_two_active_players()

        poker_engine._finish_hand(table, seats_by_number)

        table.refresh_from_db()
        self.assertEqual(table.status, "waiting")
        self.assertIsNotNone(table.next_hand_at)

    def test_process_due_deadlines_deals_next_hand_once_due(self):
        table, seats_by_number = self._seat_two_active_players()
        poker_engine._finish_hand(table, seats_by_number)

        table.refresh_from_db()
        table.next_hand_at = timezone.now() - timedelta(seconds=1)
        table.save()

        poker_engine.process_due_deadlines()

        table.refresh_from_db()
        self.assertEqual(table.status, "playing")
        self.assertEqual(table.round, "preflop")
        self.assertEqual(table.hand_number, 1)


class HighLowGameTestCase(TestCase):
    """회귀 테스트: 하이로우 베팅/정산이 (포커와 공유하는) 칩 지갑 잔액과 어긋나지 않는지 확인 (money path 핵심 로직)."""

    def setUp(self):
        self.user = User.objects.create_user(username="hl1", password="x")
        self.wallet = PokerChipWallet.objects.create(user=self.user, chips=1000)
        self.client.force_login(self.user)

    def _post(self, path, payload=None):
        return self.client.post(
            f"/game/highlow/{path}/",
            data=json.dumps(payload or {}),
            content_type="application/json",
        )

    def test_multiplier_is_none_for_impossible_direction(self):
        self.assertIsNone(game_views._highlow_multiplier(2, "lower"))   # 2보다 낮은 랭크는 없음
        self.assertIsNone(game_views._highlow_multiplier(14, "higher"))  # A(14)보다 높은 랭크는 없음
        self.assertIsNotNone(game_views._highlow_multiplier(8, "higher"))

    def test_start_rejected_when_chip_wallet_insufficient(self):
        self.wallet.chips = 3  # 최소 베팅(5)보다 적은 칩만 보유
        self.wallet.save()
        res = self._post("start", {"bet": 5})
        self.assertEqual(res.status_code, 400)
        self.assertFalse(HighLowSession.objects.filter(user=self.user).exists())

    def test_start_deducts_bet_and_creates_session(self):
        with patch.object(game_views, "_highlow_draw_rank", return_value=8):
            res = self._post("start", {"bet": 10})
        self.assertEqual(res.status_code, 200)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.chips, 990)
        self.assertTrue(HighLowSession.objects.filter(user=self.user).exists())

    def test_correct_guess_increases_streak_and_payout(self):
        with patch.object(game_views, "_highlow_draw_rank", return_value=8):
            self._post("start", {"bet": 10})
        with patch.object(game_views, "_highlow_draw_rank", return_value=12):
            res = self._post("guess", {"guess": "higher"})
        data = res.json()
        self.assertEqual(data["result"], "continue")
        session = HighLowSession.objects.get(user=self.user)
        self.assertEqual(session.streak, 1)
        self.assertEqual(session.current_rank, 12)
        self.assertGreater(session.potential_payout, 10)  # 베팅액보다 커야 정상 배당

    def test_correct_guess_at_min_bet_still_grows_payout(self):
        # 회귀 테스트: int()로 소수점을 버리면 최소 베팅 시 배당이 반올림 전까지
        # 그대로 남아 배수가 적용 안 되는 것처럼 보였던 버그 (round()로 수정).
        with patch.object(game_views, "_highlow_draw_rank", return_value=8):
            self._post("start", {"bet": game_views.HIGHLOW_MIN_BET})
        with patch.object(game_views, "_highlow_draw_rank", return_value=12):
            res = self._post("guess", {"guess": "higher"})
        data = res.json()
        self.assertEqual(data["result"], "continue")
        session = HighLowSession.objects.get(user=self.user)
        self.assertGreater(session.potential_payout, game_views.HIGHLOW_MIN_BET)

    def test_wrong_guess_busts_and_forfeits_bet(self):
        with patch.object(game_views, "_highlow_draw_rank", return_value=8):
            self._post("start", {"bet": 10})
        with patch.object(game_views, "_highlow_draw_rank", return_value=3):
            res = self._post("guess", {"guess": "higher"})
        data = res.json()
        self.assertEqual(data["result"], "bust")
        self.assertFalse(HighLowSession.objects.filter(user=self.user).exists())
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.chips, 990)  # 베팅액은 시작 시점에 이미 차감, 환불 없음
        log = HighLowPlayLog.objects.get(user=self.user)
        self.assertEqual(log.result, "busted")
        self.assertEqual(log.payout, 0)

    def test_cashout_pays_out_and_clears_session(self):
        with patch.object(game_views, "_highlow_draw_rank", return_value=8):
            self._post("start", {"bet": 10})
        with patch.object(game_views, "_highlow_draw_rank", return_value=12):
            self._post("guess", {"guess": "higher"})
        expected_payout = HighLowSession.objects.get(user=self.user).potential_payout

        res = self._post("cashout")
        data = res.json()

        self.assertEqual(data["payout"], expected_payout)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.chips, 990 + expected_payout)
        self.assertFalse(HighLowSession.objects.filter(user=self.user).exists())
        log = HighLowPlayLog.objects.get(user=self.user, result="cashed_out")
        self.assertEqual(log.streak, 1)

    def test_cashout_without_any_correct_guess_is_rejected(self):
        with patch.object(game_views, "_highlow_draw_rank", return_value=8):
            self._post("start", {"bet": 10})
        res = self._post("cashout")
        self.assertEqual(res.status_code, 400)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.chips, 990)  # 거부됐으니 잔액 변화 없어야 함

    def test_buy_chips_converts_leaves_to_shared_poker_wallet(self):
        self.user.leaves = 5
        self.user.save()
        res = self._post("buy-chips", {"leaves": 2})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["leaves"], 3)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.chips, 1000 + 2 * 1000)

    def test_cash_out_chips_converts_shared_poker_wallet_to_leaves(self):
        res = self._post("cash-out-chips", {"chips": 1000})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["leaves"], 1)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.chips, 0)


class PokerDisconnectGraceTestCase(TestCase):
    """회귀 테스트: 앉은 채로 연결만 끊고 다시는 접속하지 않으면(새로고침이 아닌
    이탈) 유예시간 뒤에 자리에서 자동으로 내려가야 한다 — 그렇지 않으면
    2명 미만이라 핸드가 돌지 않는 한 자리를 영원히 차지하는 버그가 난다."""

    def setUp(self):
        self.table = PokerTable.get_solo()
        self.user = User.objects.create_user(username="afk1", password="x")
        PokerChipWallet.objects.create(user=self.user, chips=poker_engine.POKER_BUY_IN)
        ok, _ = poker_engine.sit_down(self.user, 0)
        self.assertTrue(ok)

    def tearDown(self):
        game_consumers._disconnect_grace_tasks.clear()

    async def test_disconnect_grace_vacates_seat_after_timeout(self):
        with patch.object(game_consumers, "POKER_DISCONNECT_GRACE_SECONDS", 0):
            await game_consumers._schedule_disconnect_grace(self.user)
        seat = await database_sync_to_async(PokerSeat.objects.get)(table=self.table, seat_number=0)
        self.assertIsNone(seat.user_id)

    async def test_reconnect_cancels_pending_grace_vacate(self):
        task = asyncio.create_task(game_consumers._schedule_disconnect_grace(self.user))
        game_consumers._disconnect_grace_tasks[self.user.id] = task
        await asyncio.sleep(0)  # 태스크가 asyncio.sleep()에 들어갈 때까지 양보
        game_consumers._cancel_disconnect_grace(self.user.id)
        await asyncio.sleep(0)  # 취소가 반영될 시간을 준다
        seat = await database_sync_to_async(PokerSeat.objects.get)(table=self.table, seat_number=0)
        self.assertEqual(seat.user_id, self.user.id)  # 취소됐으니 자리 유지
