from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import gostop_engine, poker_engine
from .models import GostopRoom, HouseBank, PokerChipWallet, PokerTable


def _due_poker(table_id):
    PokerTable.objects.filter(pk=table_id).update(next_hand_at=timezone.now() - timedelta(seconds=1))
    poker_engine.process_due_deadlines()


class PokerSpectateTestCase(TestCase):
    def setUp(self):
        HouseBank.objects.update_or_create(pk=1, defaults={"chips": 10 ** 6})
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        self.watcher = User.objects.create_user(username="w", password="x")
        for u in (self.a, self.b, self.watcher):
            PokerChipWallet.objects.create(user=u, chips=20000)

    def test_holdem_spectator_sees_only_public_info(self):
        _, tid = poker_engine.create_table(self.a, "intermediate", 4)
        poker_engine.join_table(self.b, tid)
        _due_poker(tid)
        spec = [{"user_id": self.watcher.id, "display_name": "w", "picture": ""}]
        state = poker_engine.get_state_for(self.watcher, tid, {tid: spec})
        self.assertTrue(state["table"]["spectating"])
        self.assertEqual(state["table"]["spectators"], spec)
        self.assertEqual(state["tables"][0]["spectators"], spec)
        self.assertEqual(state["table_status"], "playing")
        self.assertTrue(all(not s.get("hole_cards") for s in state["seats"]))  # 손패는 안 보인다
        self.assertEqual((state["my_seat_number"], state["my_hand_descs"]), (None, {}))
        self.assertTrue(state["table"]["can_sit"])
        # 앉아 있는 사람에겐 관전 상태가 아니고 자기 패가 보인다
        mine = poker_engine.get_state_for(self.a, None, {tid: spec})
        self.assertFalse(mine["table"]["spectating"])
        self.assertEqual(len(next(s for s in mine["seats"] if s.get("is_me"))["hole_cards"]), 2)
        # 관전하다 빈자리에 앉기
        self.assertTrue(poker_engine.join_table(self.watcher, tid)[0])
        self.assertFalse(poker_engine.get_state_for(self.watcher, tid)["table"]["spectating"])

    def test_blackjack_spectator_and_missing_room(self):
        _, tid = poker_engine.create_table(self.a, "intermediate", 2, "blackjack")
        _due_poker(tid)
        poker_engine.blackjack_bet(self.a, 200)
        state = poker_engine.get_state_for(self.watcher, tid)
        self.assertTrue(state["table"]["spectating"])
        if state["phase"] == "playing":
            self.assertEqual(state["dealer_hidden"], 1)  # 딜러 두 번째 카드는 관전자에게도 뒷면
        self.assertEqual((state["my_actions"], state["can_bet"]), ([], False))
        self.assertIsNone(poker_engine.get_state_for(self.watcher, 99999)["table"])


class GostopSpectateTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        self.watcher = User.objects.create_user(username="w", password="x")
        for u in (self.a, self.b, self.watcher):
            PokerChipWallet.objects.create(user=u, chips=10 ** 6)

    def test_spectator_hides_hands(self):
        _, rid = gostop_engine.create_room(self.a, "matgo")
        gostop_engine.join_room(self.b, rid)
        GostopRoom.objects.filter(pk=rid).update(next_game_at=timezone.now() - timedelta(seconds=1))
        gostop_engine.process_due_deadlines()
        state = gostop_engine.get_state_for(self.watcher, rid, {rid: [{"user_id": self.watcher.id}]})
        room = state["room"]
        self.assertTrue(room["spectating"])
        self.assertEqual(len(room["spectators"]), 1)
        self.assertEqual(state["rooms"][0]["spectators"], room["spectators"])
        g = room["game"]
        self.assertEqual((g["my_hand"], g["my_bombs"], g["my_turn"], g["pending_options"]), ([], 0, False, None))
        self.assertIsNone(g["hands"])
        self.assertGreater(g["hand_counts"][room["me"]], 0)
        self.assertFalse(room["can_sit"])
        self.assertTrue(gostop_engine.get_state_for(self.a)["room"]["game"]["my_hand"])
        self.assertFalse(gostop_engine.get_state_for(self.a)["room"]["spectating"])
