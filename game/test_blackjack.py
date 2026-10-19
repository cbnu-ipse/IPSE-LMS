from datetime import timedelta

from django.db.models import Sum
from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import blackjack as bj
from . import poker_engine
from .models import HouseBank, PokerChipWallet, PokerHandLog, PokerSeat, PokerTable

FILLER = ["2C"] * 60  # 조작한 카드 뒤에 깔아두는 카드 (슈가 모자라 다시 섞지 않도록)


def H(*cards, **kw):
    return dict(cards=list(cards), bet=kw.pop("bet", 100), **kw)


class BlackjackRulesTestCase(TestCase):
    def test_totals(self):
        self.assertEqual(bj.hand_total(["AS", "6H"]), (17, True))
        self.assertEqual(bj.hand_total(["AS", "6H", "TD"]), (17, False))
        self.assertEqual(bj.hand_total(["AS", "AH", "9D"]), (21, True))
        self.assertTrue(bj.is_blackjack(["AS", "KH"]))
        self.assertFalse(bj.is_blackjack(["AS", "KH"], from_split=True))
        self.assertFalse(bj.dealer_should_hit(["AS", "6H"]))  # 소프트 17 스탠드
        self.assertTrue(bj.dealer_should_hit(["TS", "6H"]))

    def test_settle(self):
        self.assertEqual(bj.settle_hand(H("AS", "KH"), ["TS", "9H"]), ("blackjack", 250))
        self.assertEqual(bj.settle_hand(H("AS", "KH"), ["AD", "QH"]), ("push", 100))
        self.assertEqual(bj.settle_hand(H("TS", "9H"), ["AD", "QH"]), ("lose", 0))
        self.assertEqual(bj.settle_hand(H("TS", "9H"), ["TD", "6H", "8C"]), ("win", 200))
        self.assertEqual(bj.settle_hand(H("TS", "7H"), ["TD", "7C"]), ("push", 100))
        self.assertEqual(bj.settle_hand(H("TS", "7H", "9C"), ["TD", "6H", "8C"]), ("bust", 0))
        self.assertEqual(bj.settle_hand(H("AS", "KH", from_split=True), ["TD", "9H"]), ("win", 200))

    def test_basic_strategy(self):
        s = lambda cards, up, n=1, extra=True: bj.basic_strategy(H(*cards), up, n, extra)
        self.assertEqual(s(["TS", "6H"], "TD"), "hit")
        self.assertEqual(s(["TS", "6H"], "6D"), "stand")
        self.assertEqual(s(["TS", "2H"], "3D"), "hit")
        self.assertEqual(s(["TS", "2H"], "4D"), "stand")
        self.assertEqual(s(["6S", "5H"], "TD"), "double")
        self.assertEqual(s(["6S", "5H"], "AD"), "hit")
        self.assertEqual(s(["6S", "5H"], "TD", extra=False), "hit")
        self.assertEqual(s(["8S", "8H"], "TD"), "split")
        self.assertEqual(s(["8S", "8H"], "TD", n=2), "hit")  # 스플릿은 한 번만 → 하드 16
        self.assertEqual(s(["AS", "AH"], "6D"), "split")
        self.assertEqual(s(["TS", "KH"], "6D"), "stand")
        self.assertEqual(s(["9S", "9H"], "7D"), "stand")
        self.assertEqual(s(["AS", "7H"], "4D"), "double")
        self.assertEqual(s(["AS", "7H"], "8D"), "stand")
        self.assertEqual(s(["AS", "7H"], "9D"), "hit")
        self.assertEqual(s(["AS", "7H", "2C"], "4D"), "stand")  # 세 장이면 더블 불가 → 스탠드


class BlackjackRoomTestCase(TestCase):
    def setUp(self):
        HouseBank.objects.update_or_create(pk=1, defaults={"chips": 10 ** 6})
        self.u = User.objects.create_user(username="p1", password="x")
        PokerChipWallet.objects.create(user=self.u, chips=20000)
        ok, self.table_id = poker_engine.create_table(self.u, "intermediate", 4, "blackjack")
        self.assertTrue(ok, self.table_id)

    # ── 도우미 ──
    def table(self):
        return PokerTable.objects.get(pk=self.table_id)

    def due(self):
        past = timezone.now() - timedelta(seconds=1)
        PokerTable.objects.filter(pk=self.table_id, turn_deadline__isnull=False).update(turn_deadline=past)
        PokerTable.objects.filter(pk=self.table_id, next_hand_at__isnull=False).update(next_hand_at=past)
        poker_engine.process_due_deadlines()

    def rig(self, *cards):
        """다음에 뽑힐 카드를 순서대로 정한다 (사람 1명: 내 카드, 딜러, 내 카드, 딜러, 이후 뽑는 카드…)."""
        t = self.table()
        t.bj_state["shoe"] = FILLER + list(reversed(cards))
        t.save()

    def total_chips(self):
        seats = PokerSeat.objects.aggregate(s=Sum("stack"), b=Sum("contributed_total"))
        wallets = PokerChipWallet.objects.aggregate(s=Sum("chips"))["s"] or 0
        return (seats["s"] or 0) + (seats["b"] or 0) + wallets + HouseBank.objects.get(pk=1).chips

    def start_round(self, *cards):
        self.due()  # 대기 → 배팅
        self.assertEqual(self.table().bj_state["phase"], "betting")
        if cards:
            self.rig(*cards)

    def act(self, action, user=None):
        ok, err = poker_engine.blackjack_action(user or self.u, action)
        self.assertTrue(ok, err)

    def my_stack(self):
        return PokerSeat.objects.get(user=self.u).stack

    # ── 테스트 ──
    def test_room_listing_and_bet_limits(self):
        state = poker_engine.get_state_for(self.u)
        self.assertEqual(state["table"]["game_type"], "blackjack")
        self.assertEqual(state["tables"][0]["game_type"], "blackjack")
        self.assertEqual((state["min_bet"], state["max_bet"]), (200, 10000))
        self.assertFalse(poker_engine.create_table(self.u, "intermediate", 4, "uno")[0])
        self.start_round()
        self.assertFalse(poker_engine.blackjack_bet(self.u, 199)[0])
        self.assertFalse(poker_engine.blackjack_bet(self.u, 10001)[0])
        self.assertTrue(poker_engine.blackjack_bet(self.u, 10000)[0])  # 최대 = 빅블라인드 × 50
        self.assertFalse(poker_engine.player_action(self.u, "call")[0])  # 홀덤 액션은 안 받는다

    def test_hit_stand_win_and_dealer_hole_card_hidden(self):
        before = self.total_chips()
        start = self.my_stack()
        self.start_round("TS", "9H", "5D", "8C", "6S")  # 나: T,5 (+6=21) / 딜러: 9,8 = 17
        self.assertTrue(poker_engine.blackjack_bet(self.u, 500)[0])
        state = poker_engine.get_state_for(self.u)
        self.assertEqual(state["phase"], "playing")
        self.assertEqual((state["dealer_cards"], state["dealer_hidden"]), (["9H"], 1))  # 두 번째 카드는 뒷면
        self.assertEqual(set(state["my_actions"]), {"hit", "stand", "double"})
        self.act("hit")  # 21 → 자동으로 끝, 딜러 17 스탠드
        t = self.table()
        self.assertEqual((t.status, t.bj_state["phase"]), ("waiting", "result"))
        self.assertEqual(self.my_stack(), start + 500)
        self.assertEqual(self.total_chips(), before)
        self.assertEqual(PokerHandLog.objects.get().winners[0]["amount"], 500)
        self.assertEqual(poker_engine.get_state_for(self.u)["dealer_cards"], ["9H", "8C"])

    def test_blackjack_pays_three_to_two(self):
        start = self.my_stack()
        house = HouseBank.objects.get(pk=1).chips
        self.start_round("AS", "9H", "KD", "7C")
        poker_engine.blackjack_bet(self.u, 400)
        self.assertEqual(self.table().bj_state["phase"], "result")  # 블랙잭은 바로 끝
        self.assertEqual(self.my_stack(), start + 600)
        self.assertEqual(HouseBank.objects.get(pk=1).chips, house - 600)

    def test_dealer_peek_blackjack_ends_round(self):
        start = self.my_stack()
        self.start_round("TS", "AH", "9D", "KC")  # 딜러 A 보이고 블랙잭
        poker_engine.blackjack_bet(self.u, 300)
        t = self.table()
        self.assertEqual(t.bj_state["phase"], "result")
        self.assertEqual(self.my_stack(), start - 300)
        self.assertTrue(poker_engine.get_state_for(self.u)["dealer_blackjack"])

    def test_double_and_bust(self):
        start = self.my_stack()
        self.start_round("6S", "TH", "5D", "7C", "2S")  # 나 11 더블 → 13 / 딜러 17
        poker_engine.blackjack_bet(self.u, 1000)
        self.act("double")
        self.assertEqual(self.my_stack(), start - 2000)
        start = self.my_stack()
        self.due()  # 다음 판
        self.rig("TS", "TH", "6D", "7C", "9S")  # 16 히트 → 25 버스트
        poker_engine.blackjack_bet(self.u, 200)
        self.act("hit")
        self.assertEqual(self.table().bj_state["phase"], "result")
        self.assertEqual(self.my_stack(), start - 200)

    def test_split_once_and_split_aces_one_card(self):
        before = self.total_chips()
        start = self.my_stack()
        # 나 8,8 / 딜러 6, T → 스플릿: 첫 패 8+3 (+T=21), 둘째 패 8+8 (다시 스플릿 불가) 스탠드
        self.start_round("8S", "6H", "8D", "TC", "3S", "8C", "TD")
        poker_engine.blackjack_bet(self.u, 200)
        self.act("split")
        state = poker_engine.get_state_for(self.u)
        me = next(s for s in state["seats"] if s.get("is_me"))
        self.assertEqual([h["cards"] for h in me["hands"]], [["8S", "3S"], ["8D", "8C"]])
        self.act("hit")  # 첫 패 21 → 둘째 패
        self.assertNotIn("split", poker_engine.get_state_for(self.u)["my_actions"])
        self.act("stand")  # 딜러 16 → 히트(2C) 18: 21 이김, 16 짐
        hands = self.table().bj_state["seats"]["0"]["hands"]
        self.assertEqual([h["outcome"] for h in hands], ["win", "lose"])
        self.assertEqual(self.my_stack(), start)
        self.assertEqual(self.total_chips(), before)
        # 에이스 스플릿은 한 장씩만 받고, 21이어도 블랙잭이 아니다
        self.due()
        self.rig("AS", "9H", "AD", "8C", "KS", "5C")
        poker_engine.blackjack_bet(self.u, 200)
        self.act("split")
        hands = self.table().bj_state["seats"]["0"]["hands"]
        self.assertEqual([h["outcome"] for h in hands], ["win", "lose"])  # 21 vs 17, 16 vs 17
        self.assertEqual([h["payout"] for h in hands], [400, 0])

    def test_bet_timeout_sits_out_then_leaves(self):
        for i in range(poker_engine.POKER_MAX_TIMEOUTS):
            self.start_round()
            self.due()  # 아무도 안 걸었다 → 쉬고 잠시 뒤 다시
            t = self.table()
            self.assertEqual(t.status, "waiting")
        self.assertTrue(PokerSeat.objects.get(user=self.u).leaving_after_hand)
        self.due()  # 다음 판을 열 때 퇴장 → 사람이 없으니 방도 지워진다
        self.assertFalse(PokerTable.objects.filter(pk=self.table_id).exists())
        self.assertEqual(PokerChipWallet.objects.get(user=self.u).chips, 20000)

    def test_turn_timeout_plays_basic_strategy(self):
        self.start_round("TS", "TH", "6D", "7C", "5S")  # 16 vs 10 → 기본 전략은 히트
        poker_engine.blackjack_bet(self.u, 200)
        self.due()
        hand = self.table().bj_state["seats"]["0"]["hands"][0]
        self.assertEqual(hand["cards"], ["TS", "6D", "5S"])
        self.assertEqual(PokerSeat.objects.get(user=self.u).consecutive_timeouts, 1)

    def test_stand_up_during_betting_refunds_and_closes(self):
        other = User.objects.create_user(username="p2", password="x")
        PokerChipWallet.objects.create(user=other, chips=20000)
        self.assertTrue(poker_engine.join_table(other, self.table_id)[0])
        before = self.total_chips()
        self.start_round()
        poker_engine.blackjack_bet(self.u, 1000)  # p2가 아직 안 걸어서 배팅 단계 그대로
        self.assertTrue(poker_engine.stand_up(self.u)[0])
        self.assertEqual(PokerChipWallet.objects.get(user=self.u).chips, 20000)  # 건 칩도 돌려받는다
        self.assertEqual(self.total_chips(), before)
        poker_engine.blackjack_bet(other, 200)  # 남은 사람이 다 걸면 바로 카드를 나눈다
        self.assertEqual(self.table().bj_state["phase"], "playing")
        poker_engine.stand_up(other)
        self.due()
        self.assertFalse(PokerTable.objects.filter(pk=self.table_id).exists())
        self.assertEqual(self.total_chips(), before)

    def test_stand_up_mid_hand_finishes_by_strategy(self):
        self.start_round("TS", "TH", "9D", "7C")  # 19 → 스탠드
        poker_engine.blackjack_bet(self.u, 200)
        poker_engine.stand_up(self.u)
        t = self.table()
        self.assertEqual(t.bj_state["phase"], "result")
        self.due()  # 다음 판 시작 때 나가고 방이 닫힌다
        self.assertFalse(PokerTable.objects.filter(pk=self.table_id).exists())
        self.assertEqual(PokerChipWallet.objects.get(user=self.u).chips, 20000 + 200)

    def test_bots_bet_minimum_and_chips_are_conserved(self):
        for _ in range(2):
            self.assertTrue(poker_engine.add_bot(self.u)[0])
        before = self.total_chips()
        for _ in range(30):
            self.start_round()
            t = self.table()
            bot_bets = [sd["hands"][0]["bet"] for n, sd in t.bj_state["seats"].items() if n != "0"]
            self.assertEqual(bot_bets, [200, 200])
            poker_engine.blackjack_bet(self.u, 200)
            for _ in range(20):  # 사람 차례는 시간초과 → 기본 전략, AI는 바로
                if self.table().status != "playing":
                    break
                self.due()
                PokerSeat.objects.filter(user=self.u).update(consecutive_timeouts=0)
            self.assertEqual(self.table().bj_state["phase"], "result")
            self.assertEqual(self.total_chips(), before)

    def test_page_has_game_type_selector(self):
        self.client.force_login(self.u)
        page = self.client.get("/game/poker/")
        self.assertContains(page, 'id="pk-game-type"')
