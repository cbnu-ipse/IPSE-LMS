import random
from datetime import timedelta
from unittest.mock import patch

from django.db import transaction
from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import poker_ai, poker_engine
from .models import HouseBank, PokerChipWallet, PokerHandLog, PokerSeat, PokerTable

BUY_IN = 10000  # 중수 방 최소 칩


class PokerEquityTestCase(TestCase):
    def test_equity_sanity(self):
        rng = random.Random(1)
        aa = poker_ai.equity(["AS", "AH"], [], 1, budget=0, rng=rng, min_sims=800)      # 실제 약 85%
        seven_two = poker_ai.equity(["7S", "2H"], [], 1, budget=0, rng=rng, min_sims=800)  # 실제 약 35%
        self.assertGreater(aa, .8)
        self.assertLess(seven_two, .4)
        nuts = poker_ai.equity(["AS", "KS"], ["QS", "JS", "TS"], 3, budget=0, rng=rng, max_sims=200)
        self.assertEqual(nuts, 1.0)  # 로열 플러시 완성


@patch.object(poker_ai, "AI_TIME_BUDGET", 0)  # 테스트에선 최소 시뮬레이션만
class PokerBotSeatingTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        PokerChipWallet.objects.create(user=self.a, chips=BUY_IN * 3)
        PokerChipWallet.objects.create(user=self.b, chips=BUY_IN)
        with transaction.atomic():
            HouseBank.locked()

    def seats(self):
        return list(PokerSeat.objects.filter(user__isnull=False).select_related("user").order_by("seat_number"))

    def house(self):
        return HouseBank.objects.get(pk=1).chips

    def total(self):
        # 핸드 중엔 베팅한 칩이 팟에 있으므로 팟까지 더한다
        return (sum(PokerChipWallet.objects.values_list("chips", flat=True))
                + sum(PokerSeat.objects.values_list("stack", flat=True)) + self.house()
                + sum(PokerTable.objects.values_list("pot", flat=True)))

    def test_add_bot_brings_biggest_human_stack_from_house(self):
        start = self.total()
        ok, table_id = poker_engine.create_table(self.a, "intermediate")
        poker_engine.add_bot(self.a)
        poker_engine.add_bot(self.a)
        seats = self.seats()
        self.assertEqual([(s.seat_number, s.user.is_bot, s.stack) for s in seats],
                         [(0, False, BUY_IN * 3), (4, True, BUY_IN * 3), (5, True, BUY_IN * 3)])
        self.assertEqual(self.total(), start)
        self.assertIsNotNone(PokerTable.objects.get(pk=table_id).next_hand_at)

    def test_last_human_leaving_clears_bots(self):
        ok, table_id = poker_engine.create_table(self.a, "intermediate")
        poker_engine.add_bot(self.a)
        poker_engine.join_table(self.b, table_id)
        start = self.total()
        poker_engine.stand_up(self.b)
        poker_engine.stand_up(self.a)
        self.assertEqual(self.seats(), [])  # 사람이 없으면 AI도 떠나고 칩은 하우스로
        self.assertFalse(PokerTable.objects.exists())
        self.assertEqual(self.total(), start)

    def test_bots_play_hands_and_timeouts_are_played_by_ai_conserving_chips(self):
        poker_engine.create_table(self.a, "intermediate")
        poker_engine.add_bot(self.a)
        poker_engine.add_bot(self.a)
        start = self.total()
        for _ in range(400):
            PokerTable.objects.update(
                next_hand_at=timezone.now() - timedelta(seconds=1),
                turn_deadline=timezone.now() - timedelta(seconds=1),
            )
            # 사람은 연속 시간초과로 퇴장되지 않게 한다 (퇴장하면 AI도 떠나 방이 닫힘)
            PokerSeat.objects.filter(user=self.a).update(consecutive_timeouts=0)
            poker_engine.process_due_deadlines()  # 사람 차례는 시간초과 → AI가 대신, AI 차례는 AI가 둔다
            self.assertEqual(self.total(), start)
            if PokerHandLog.objects.count() >= 3:
                break
        self.assertGreaterEqual(PokerHandLog.objects.count(), 3)

    def test_ai_decisions_are_legal(self):
        rng = random.Random(3)
        for _ in range(60):
            table = PokerTable(tier=rng.choice(["beginner", "intermediate", "expert"]),
                               pot=rng.choice([7, 60, 400]), current_bet=rng.choice([0, 5, 40]), min_raise=5,
                               community_cards=rng.sample(poker_engine.FULL_DECK, rng.choice([0, 3, 4, 5])))
            deck = [c for c in poker_engine.FULL_DECK if c not in table.community_cards]
            me = PokerSeat(seat_number=0, user=self.a, stack=rng.choice([10, 500, 5000]), status="active",
                           current_bet=min(table.current_bet, rng.choice([0, 5])), hole_cards=deck[:2])
            opp = PokerSeat(seat_number=1, user=self.b, stack=5000, status="active", hole_cards=deck[2:4])
            action, amount = poker_ai.decide(table, {0: me, 1: opp}, me, budget=0, rng=rng)
            self.assertIn(action, {"fold", "check", "call", "bet", "raise"})
            if action == "check":
                self.assertEqual(me.current_bet, table.current_bet)
            if action == "bet":
                self.assertTrue(table.current_bet == 0 and 0 < amount <= me.stack)
            if action == "raise":
                self.assertTrue(table.current_bet < amount <= me.current_bet + me.stack)
