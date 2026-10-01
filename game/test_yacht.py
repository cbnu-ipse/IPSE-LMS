import random
from datetime import timedelta
from unittest.mock import patch

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.db import transaction
from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import consumers as game_consumers, yacht_ai, yacht_engine as ye
from .models import HouseBank, PokerChipWallet, YachtGameLog, YachtRoom, YachtSeat

STAKE = 1000


class YachtScoringTestCase(TestCase):
    def test_categories(self):
        self.assertEqual(ye.score_of("threes", [3, 3, 1, 3, 6]), 9)
        self.assertEqual(ye.score_of("choice", [1, 2, 3, 4, 6]), 16)
        self.assertEqual(ye.score_of("four_kind", [5, 5, 5, 5, 2]), 22)
        self.assertEqual(ye.score_of("four_kind", [5, 5, 5, 2, 2]), 0)
        self.assertEqual(ye.score_of("full_house", [2, 2, 6, 6, 6]), 22)
        self.assertEqual(ye.score_of("full_house", [4, 4, 4, 4, 4]), 20)  # 요트도 풀하우스로 인정
        self.assertEqual(ye.score_of("small_straight", [1, 3, 2, 4, 4]), 15)
        self.assertEqual(ye.score_of("small_straight", [1, 2, 3, 5, 6]), 0)
        self.assertEqual(ye.score_of("large_straight", [2, 3, 4, 5, 6]), 30)
        self.assertEqual(ye.score_of("large_straight", [1, 2, 3, 4, 6]), 0)
        self.assertEqual(ye.score_of("yacht", [6] * 5), 50)

    def test_upper_bonus(self):
        card = {"ones": 3, "twos": 6, "threes": 9, "fours": 12, "fives": 15, "sixes": 18, "yacht": 50}
        self.assertEqual(ye.card_totals(card), {"upper": 63, "bonus": 35, "total": 148})
        card["ones"] = 2
        self.assertEqual(ye.card_totals(card)["bonus"], 0)

    def test_turn_flow(self):
        st = ye.new_game(2, 0)
        rng = random.Random(3)
        with self.assertRaises(ValueError):
            ye.score_category(st, 0, "choice")  # 굴리기 전엔 못 적음
        with self.assertRaises(ValueError):
            ye.roll_dice(st, 1, None, rng)  # 내 차례 아님
        ye.roll_dice(st, 0, None, rng)
        kept = st["dice"][0]
        ye.roll_dice(st, 0, [True, False, False, False, False], rng)
        self.assertEqual(st["dice"][0], kept)
        with self.assertRaises(ValueError):
            ye.roll_dice(st, 0, [True] * 5, rng)
        ye.roll_dice(st, 0, None, rng)
        with self.assertRaises(ValueError):
            ye.roll_dice(st, 0, None, rng)  # 3번까지
        ye.score_category(st, 0, "choice")
        with self.assertRaises(ValueError):
            ye.roll_dice(st, 0, None, rng)
        self.assertEqual((st["turn"], st["round"], st["rolls"]), (1, 1, 0))
        ye.roll_dice(st, 1, None, rng)
        ye.score_category(st, 1, "yacht")
        self.assertEqual((st["turn"], st["round"]), (0, 2))
        ye.roll_dice(st, 0, None, rng)
        with self.assertRaises(ValueError):
            ye.score_category(st, 0, "choice")  # 이미 적은 칸

    def test_game_ends_after_12_rounds(self):
        st = ye.new_game(2, 1)
        rng = random.Random(5)
        outcome = None
        for _ in range(24):
            ye.roll_dice(st, st["turn"], None, rng)
            cat = next(c for c in ye.CATEGORIES if c not in st["cards"][st["turn"]])
            outcome = ye.score_category(st, st["turn"], cat)
        self.assertEqual(outcome, {"over": True})
        self.assertTrue(all(len(c) == 12 for c in st["cards"]))


class YachtAITestCase(TestCase):
    def play(self, fn, rng):
        st = ye.new_game(1, 0)
        while True:
            kind, arg = fn(st, 0)
            if kind == "roll":
                ye.roll_dice(st, 0, arg, rng)
            elif ye.score_category(st, 0, arg):
                return ye.card_totals(st["cards"][0])["total"]

    def test_hard_beats_medium_on_average(self):
        hard = [self.play(yacht_ai.hard_action, random.Random(i)) for i in range(15)]
        medium = [self.play(yacht_ai.medium_action, random.Random(i)) for i in range(15)]
        self.assertGreater(sum(hard) / 15, sum(medium) / 15 + 10)

    def test_hard_keeps_yacht_and_writes_it(self):
        st = ye.new_game(1, 0)
        st.update(dice=[6, 6, 6, 6, 6], rolls=1)
        self.assertEqual(yacht_ai.hard_action(st, 0), ("score", "yacht"))


class YachtRoomTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        for u in (self.a, self.b):
            PokerChipWallet.objects.create(user=u, chips=STAKE * 3)
        with transaction.atomic():
            house = HouseBank.locked()
            house.chips = STAKE * 10
            house.save()

    def total(self):
        return (sum(PokerChipWallet.objects.values_list("chips", flat=True))
                + HouseBank.objects.get(pk=1).chips + sum(YachtRoom.objects.values_list("pot", flat=True)))

    def room(self):
        return YachtRoom.objects.get()

    def fire(self):
        YachtRoom.objects.update(next_game_at=timezone.now() - timedelta(seconds=1),
                                 turn_deadline=timezone.now() - timedelta(seconds=1))
        ye.process_due_deadlines()

    def test_create_requires_stake(self):
        poor = User.objects.create_user(username="p", password="x")
        PokerChipWallet.objects.create(user=poor, chips=STAKE - 1)
        ok, _ = ye.create_room(poor, 2, STAKE)
        self.assertFalse(ok)
        ok, _ = ye.create_room(self.a, 5, STAKE)
        self.assertFalse(ok)
        ok, _ = ye.create_room(self.a, 2, 777)
        self.assertFalse(ok)
        self.assertFalse(YachtRoom.objects.exists())

    def test_full_game_pays_winner_and_conserves_chips(self):
        start = self.total()
        ye.create_room(self.a, 2, STAKE)
        ye.join_room(self.b, self.room().id)
        self.fire()  # 시작
        room = self.room()
        self.assertEqual((room.status, room.pot), ("playing", STAKE * 2))
        self.assertEqual(self.total(), start)
        for _ in range(500):  # 둘 다 시간초과 → 대신 두기로 끝까지
            self.fire()
            if YachtGameLog.objects.exists():
                break
        self.assertEqual(self.total(), start)
        result = self.room().last_result
        won = sum(r["won"] for r in result["rows"])
        self.assertEqual(won, STAKE * 2)
        self.assertEqual(self.room().status, "waiting")

    def test_timeout_marks_away_and_leaving(self):
        ye.create_room(self.a, 2, STAKE)
        ye.join_room(self.b, self.room().id)
        self.fire()
        first = self.room().state["turn"]
        self.fire()
        self.fire()
        st = self.room().state
        self.assertIn(first, st["away"])
        self.assertIn(first, st["leaving"])

    def test_add_bots_from_house_and_bot_yields_to_human(self):
        ye.create_room(self.a, 3, STAKE)
        ok, _ = ye.add_bots(self.a)
        self.assertTrue(ok)
        seats = list(YachtSeat.objects.order_by("seat").select_related("user"))
        self.assertEqual([s.user.is_bot for s in seats], [False, True, True])
        ok, _ = ye.join_room(self.b, self.room().id)  # 대기 중이면 AI가 바로 비켜줌
        self.assertTrue(ok)
        self.assertEqual(YachtSeat.objects.filter(user__is_bot=True).count(), 1)
        start = self.total()
        self.fire()
        self.assertEqual(self.room().pot, STAKE * 3)
        self.assertEqual(self.total(), start)

    def test_bot_yields_after_game_when_playing(self):
        ye.create_room(self.a, 2, STAKE)
        ye.add_bots(self.a)
        self.fire()
        ok, _ = ye.join_room(self.b, self.room().id)
        self.assertFalse(ok)
        self.assertIn(1, self.room().state["leaving"])

    def test_last_human_leaving_clears_bots_and_room(self):
        ye.create_room(self.a, 3, STAKE)
        ye.add_bots(self.a)
        ye.leave_room(self.a)
        self.assertFalse(YachtRoom.objects.exists())
        self.assertFalse(YachtSeat.objects.exists())

    def test_leave_during_game_is_reserved_and_sees_result(self):
        ye.create_room(self.a, 2, STAKE)
        ye.add_bots(self.a)
        self.fire()
        start = self.total()
        ye.leave_room(self.a)
        st = self.room().state
        self.assertIn(0, st["leaving"])
        self.assertIn(0, st["away"])
        for _ in range(500):
            self.fire()
            if YachtGameLog.objects.exists():
                break
        self.assertEqual(self.total(), start)
        # 결과를 보는 동안은 아직 자리에 있다
        self.assertTrue(YachtSeat.objects.filter(user=self.a).exists())
        state = ye.get_state_for(self.a)
        self.assertIsNotNone(state["room"]["last_result"]["my_net"])
        self.fire()  # 다음 판 시작 시점에 퇴장 → 사람이 없으니 방도 정리
        self.assertFalse(YachtRoom.objects.exists())
        self.assertEqual(self.total(), start)

    def test_page_renders(self):
        self.client.force_login(self.a)
        res = self.client.get("/game/yacht/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "yc-felt")


class YachtConsumerTestCase(TestCase):
    """소켓으로 방 만들기 → AI 채우기 → 시작 → 굴리기/적기."""

    async def _recv_state(self, comm):
        while True:
            msg = await comm.receive_json_from()
            if msg["type"] in ("state", "error"):
                return msg

    @patch.object(game_consumers, "_ensure_yacht_watchdog", lambda: None)
    async def test_create_add_bots_roll_and_score(self):
        def setup():
            u = User.objects.create_user(username="s1", password="x")
            PokerChipWallet.objects.create(user=u, chips=STAKE * 2)
            with transaction.atomic():
                house = HouseBank.locked()
                house.chips = STAKE * 5
                house.save()
            return u
        u = await database_sync_to_async(setup)()
        comm = WebsocketCommunicator(game_consumers.YachtConsumer.as_asgi(), "/ws/yacht/")
        comm.scope["user"] = u
        connected, _ = await comm.connect()
        self.assertTrue(connected)
        self.assertIsNone((await self._recv_state(comm))["room"])

        await comm.send_json_to({"type": "create", "capacity": 2, "stake": STAKE})
        s = await self._recv_state(comm)
        self.assertEqual((s["room"]["capacity"], s["room"]["stake"]), (2, STAKE))
        await comm.send_json_to({"type": "add_bots"})
        s = await self._recv_state(comm)
        self.assertEqual([p["is_bot"] for p in s["room"]["seats"]], [False, True])

        def start():
            YachtRoom.objects.update(next_game_at=timezone.now() - timedelta(seconds=1))
            ye.process_due_deadlines()
            YachtRoom.objects.update(state=dict(YachtRoom.objects.get().state, turn=0, first=0))
        await database_sync_to_async(start)()
        await comm.send_json_to({"type": "roll", "held": None})
        s = await self._recv_state(comm)
        g = s["room"]["game"]
        self.assertTrue(g["my_turn"])
        self.assertEqual((len(g["dice"]), g["rolls"]), (5, 1))
        self.assertEqual(s["wallet_chips"], STAKE)  # 참가비가 나갔다
        await comm.send_json_to({"type": "score", "category": "choice"})
        s = await self._recv_state(comm)
        g = s["room"]["game"]
        self.assertEqual(g["cards"][0]["choice"], sum(g["last"]["dice"]))
        self.assertFalse(g["my_turn"])

        await comm.disconnect()
        for task in list(game_consumers._yacht_disconnect_tasks.values()):
            task.cancel()
