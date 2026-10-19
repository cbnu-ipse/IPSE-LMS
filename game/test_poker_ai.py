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
        def open_table():
            # 사람이 올인으로 파산하면 방이 닫힌다 — 그럴 땐 칩을 채워 다시 연다 (운에 따라 가끔 실패하던 원인)
            if PokerChipWallet.objects.get(user=self.a).chips < BUY_IN:
                PokerChipWallet.objects.filter(user=self.a).update(chips=BUY_IN * 3)
            poker_engine.create_table(self.a, "intermediate")
            poker_engine.add_bot(self.a)
            poker_engine.add_bot(self.a)
            return self.total()
        start = open_table()
        hands = 0
        for _ in range(600):
            if not PokerTable.objects.exists():
                self.assertEqual(self.total(), start)  # 방이 닫혀도 칩은 그대로 (하우스·지갑으로)
                hands += PokerHandLog.objects.count()
                PokerHandLog.objects.all().delete()
                start = open_table()
            PokerTable.objects.update(
                next_hand_at=timezone.now() - timedelta(seconds=1),
                turn_deadline=timezone.now() - timedelta(seconds=1),
            )
            # 사람은 연속 시간초과로 퇴장되지 않게 한다 (퇴장하면 AI도 떠나 방이 닫힘)
            PokerSeat.objects.filter(user=self.a).update(consecutive_timeouts=0)
            poker_engine.process_due_deadlines()  # 사람 차례는 시간초과 → AI가 대신, AI 차례는 AI가 둔다
            self.assertEqual(self.total(), start)
            if hands + PokerHandLog.objects.count() >= 3:
                break
        self.assertGreaterEqual(hands + PokerHandLog.objects.count(), 3)

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


class AiStrengthFloorTestCase(TestCase):
    def test_equity_runs_minimum_sims_even_with_no_time(self):
        calls = []
        real = poker_engine.evaluate_best_of_7
        with patch.object(poker_ai, "evaluate_best_of_7", side_effect=lambda c: calls.append(1) or real(c)):
            poker_ai.equity(["AS", "KD"], [], 1, budget=0, rng=random.Random(1))   # 시간이 0이어도
        self.assertGreaterEqual(len(calls) // 2, poker_ai.MIN_SIMS)                  # 최소 횟수는 채운다

    def test_gostop_hard_ai_runs_min_rounds_but_normal_does_not(self):
        from . import gostop_ai, gostop_engine as eng
        for seed in range(30):                                   # 고를 수 있는 수가 여럿인 판을 찾는다
            st, _ = eng.new_game("matgo", 0, random.Random(seed))
            if len(gostop_ai.candidates(st, st["turn"])) >= 3:
                break
        me, rounds = st["turn"], []
        real = gostop_ai._determinize
        with patch.object(gostop_ai, "_determinize", side_effect=lambda *a, **k: rounds.append(1) or real(*a, **k)):
            with patch.object(gostop_ai, "AI_TIME_BUDGET", 0):                  # 시간이 0이어도
                gostop_ai.choose(st, me, rng=random.Random(1))
            hard = len(rounds)
            rounds.clear()
            gostop_ai.choose(st, me, budget=0, rng=random.Random(1))            # 보통 난이도는 일부러 약하게
        self.assertGreaterEqual(hard, gostop_ai.HARD_MIN_ROUNDS)
        self.assertEqual(len(rounds), 1)
