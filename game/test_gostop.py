import random
from datetime import timedelta
from unittest.mock import patch

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.db import transaction
from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import consumers as game_consumers, gostop_ai, gostop_engine as eng, poker_engine
from .models import (
    GostopGameLog, GostopRoom, GostopSeat, HouseBank, PokerChipWallet, PokerSeat, PokerTable,
)

# 기본 방 단계(중수): 점당 100칩, 최소 입장 10,000칩
GOSTOP_CHIPS_PER_POINT = 100
GOSTOP_BUY_IN = GOSTOP_CHIPS_PER_POINT * 100

# 카드 id = (월-1)*4 + 월 안 순번. 예) 1월 광=0, 1월 홍단=1, 12월 비광=44
GWANG = [0, 8, 28, 40, 44]
GODORI = [4, 12, 29]
HONG = [1, 5, 9]
GUKJIN = 32


def blank_state(mode="matgo", **kw):
    st, _ = eng.new_game(mode, 0, random.Random(1))
    n = len(st["hands"])
    st.update(hands=[[] for _ in range(n)], floor=[], pile=[], captured=[[] for _ in range(n)], phase="play", turn=0)
    st.update(kw)
    return st


def all_cards(st):
    cards = st["floor"] + st["pile"] + sum(st["hands"], []) + sum(st["captured"], [])
    if st.get("pending"):
        cards.append(st["pending"]["card"])
    return cards


class GostopScoreTestCase(TestCase):
    def test_gwang(self):
        self.assertEqual(eng.score_breakdown([0, 8, 28])["gwang_pts"], 3)
        self.assertEqual(eng.score_breakdown([0, 8, 44])["gwang_pts"], 2)  # 비광 3광
        self.assertEqual(eng.score_breakdown(GWANG[:4])["gwang_pts"], 4)
        self.assertEqual(eng.score_breakdown(GWANG)["gwang_pts"], 15)

    def test_godori_and_dan(self):
        self.assertEqual(eng.score_breakdown(GODORI)["total"], 5)
        self.assertEqual(eng.score_breakdown(HONG)["total"], 3)
        self.assertEqual(eng.score_breakdown(HONG + [13, 17])["total"], 4)  # 홍단 3 + 띠 5장 1

    def test_pi_and_gukjin(self):
        pis = [2, 3, 6, 7, 10, 11, 14, 15, 41]  # 피 8장 + 쌍피 = 10장
        self.assertEqual(eng.score_breakdown(pis)["pi_pts"], 1)
        self.assertEqual(eng.score_breakdown(pis + [GUKJIN], gukjin_as_pi=True)["pi_pts"], 3)
        self.assertEqual(eng.best_score(pis + [GUKJIN]), 3)


class GostopTurnTestCase(TestCase):
    def test_jjok_steals_pi(self):
        # 1월 광을 냈는데 바닥에 1월이 없고, 뒤집은 패도 1월 → 쪽
        st = blank_state(hands=[[0, 20], [21]], floor=[36], pile=[2, 38],
                         captured=[[], [6]])
        eng.play_card(st, 0, 0)
        self.assertCountEqual(st["captured"][0], [0, 2, 6])
        self.assertEqual(st["events"], ["쪽"])
        self.assertEqual(st["turn"], 1)

    def test_ppeok_then_eaten_by_opponent(self):
        st = blank_state(hands=[[0, 20], [3, 21]], floor=[1, 36, 44], pile=[2, 38, 39],
                         captured=[[6], [7]])
        eng.play_card(st, 0, 0)  # 1월 광 + 바닥 1월 홍단, 뒤집은 1월 피 → 뻑 (맞고 첫 턴이라 첫뻑)
        self.assertEqual(st["events"], ["뻑", "첫뻑"])
        self.assertEqual(st["bonus_pay"], [{"side": 0, "points": 7, "reason": "첫뻑"}])
        self.assertCountEqual(st["floor"], [0, 1, 2, 36, 44])
        eng.play_card(st, 1, 3)  # 상대가 남은 1월로 뻑 먹기
        self.assertEqual(st["events"], ["뻑 먹기"])
        self.assertCountEqual(st["captured"][1], [0, 1, 2, 3, 38, 36, 7, 6])

    def test_ttadak(self):
        st = blank_state(hands=[[0, 20], [21]], floor=[1, 2], pile=[3, 38], captured=[[], [6]])
        eng.play_card(st, 0, 0, target=1)
        self.assertEqual(st["events"], ["따닥", "첫따닥", "쓸"])
        self.assertCountEqual(st["captured"][0], [0, 1, 2, 3, 6])

    def test_choice_required_for_different_cards(self):
        st = blank_state(hands=[[0, 20], [21]], floor=[1, 2], pile=[36, 38])
        with self.assertRaises(ValueError):
            eng.play_card(st, 0, 0)
        self.assertEqual(st["hands"][0], [0, 20])  # 검증 실패 시 상태 불변

    def test_flip_choice(self):
        st = blank_state(hands=[[20, 22], [23]], floor=[0, 2, 36], pile=[1, 38])
        eng.play_card(st, 0, 20)
        self.assertEqual(st["phase"], "choose_flip")
        eng.choose_flip_card(st, 0, 0)
        self.assertCountEqual(st["captured"][0], [1, 0])
        self.assertEqual(st["floor"], [2, 36, 20])

    def test_bomb(self):
        st = blank_state(hands=[[0, 1, 2, 20], [21]], floor=[3, 36], pile=[38, 39],
                         captured=[[], [6]])
        eng.play_card(st, 0, 0, mode="bomb")
        self.assertEqual(st["bombs"][0], 2)
        self.assertEqual(st["shakes"][0], 1)
        self.assertCountEqual(st["captured"][0], [0, 1, 2, 3, 38, 36, 6])
        self.assertEqual(st["hands"][0], [20])

    def test_go_stop(self):
        # 3광 + 고도리 직전: 8월 열끗(고도리)을 먹으면 3 + 5 = 8점
        st = blank_state(hands=[[29, 20], [21, 22]], floor=[30], pile=[36, 38, 39],
                         captured=[[0, 8, 28, 4, 12], []])
        eng.play_card(st, 0, 29)
        self.assertEqual(st["phase"], "go_stop")
        eng.declare_go_stop(st, 0, True)
        self.assertEqual((st["go"][0], st["turn"]), (1, 1))
        eng.play_card(st, 1, 21)
        eng.play_card(st, 0, 20)
        self.assertEqual(st["phase"], "play")  # 점수가 안 올랐으면 다시 묻지 않는다

    def test_settle_go_and_baks(self):
        st = blank_state(captured=[[0, 8, 28, 4, 12, 29], [2]], go=[1, 0], shakes=[1, 0])
        payments, detail = eng.settle(st, 0, "stop")
        # (3광 3 + 고도리 5 + 1고) × 광박 2 × 흔들기 2 = 36
        self.assertEqual(payments, [{"side": 1, "points": 36, "baks": ["광박"], "gobak": False}])
        self.assertEqual((detail["base"], detail["go"]), (8, 1))

    def test_random_games_keep_48_cards_and_finish(self):
        rng = random.Random(42)
        for mode in ("matgo", "gostop"):
            n = eng.MODES[mode]["players"]
            for _ in range(300):
                st, outcome = eng.new_game(mode, rng.randrange(n), rng)
                steps = 0
                while outcome is None:
                    outcome = eng.auto_act(st, st["turn"])
                    self.assertCountEqual(all_cards(st), range(48) if mode == "gostop" else range(50))
                    steps += 1
                    self.assertLess(steps, 60)
                if outcome["winner"] is not None:
                    payments, _ = eng.settle(st, outcome["winner"], outcome["reason"])
                    self.assertEqual(len(payments), n - 1)
                    self.assertGreaterEqual(sum(p["points"] for p in payments), st["win_score"])


class GostopMatgoOnlyRulesTestCase(TestCase):
    def test_bonus_from_hand_steals_draws_and_keeps_turn(self):
        st = blank_state(hands=[[48, 20], [21]], floor=[36], pile=[0, 38], captured=[[], [6]])
        eng.play_card(st, 0, 48)
        self.assertEqual((st["turn"], st["phase"]), (0, "play"))
        self.assertEqual(st["hands"][0], [0, 20])  # 더미에서 1장 보충
        self.assertCountEqual(st["captured"][0], [48, 6])
        self.assertEqual(eng.score_breakdown([48, 49])["pi_count"], 5)

    def test_bonus_flipped_from_pile_is_taken_and_flips_again(self):
        st = blank_state(hands=[[20, 22], [23]], floor=[36], pile=[49, 38, 39])
        eng.play_card(st, 0, 20)
        self.assertIn(49, st["captured"][0])
        self.assertEqual(st["last_play"]["flip"], 38)
        self.assertCountEqual(st["captured"][0], [49, 38, 36])

    def test_floor_bonus_goes_to_first_player(self):
        for seed in range(200):
            st, _ = eng.new_game("matgo", 1, random.Random(seed))
            self.assertFalse(any(eng.is_bonus(c) for c in st["floor"]))
            self.assertEqual(len(st["floor"]), 8)
            self.assertFalse(any(eng.is_bonus(c) for c in st["captured"][0]))
        self.assertFalse(any(eng.is_bonus(c) for c in eng.new_game("gostop", 0, random.Random(1))[0]["pile"]))

    def test_matgo_gobak_doubles(self):
        st = blank_state(captured=[[0, 8, 28, 4, 12, 29], [2, 40]], go=[0, 1])
        payments, _ = eng.settle(st, 0, "stop")
        self.assertEqual((payments[0]["points"], payments[0]["gobak"]), (16, True))  # 8점 × 고박 2

    def test_consecutive_ppeok(self):
        st = blank_state(firsts=[False, False], prev_ppeok=[True, False],
                         hands=[[0, 20], [21]], floor=[1, 36], pile=[2, 38])
        eng.play_card(st, 0, 0)
        self.assertEqual(st["events"], ["뻑", "연뻑"])


class GostopComboEventTestCase(TestCase):
    def test_new_combo_is_announced_once(self):
        # 홍단 두 장을 가진 상태에서 3월 홍단을 먹으면 "홍단" 이벤트, 다음 턴엔 다시 안 나온다
        st = blank_state(hands=[[8, 20], [21, 22]], floor=[9, 36], pile=[38, 39, 2],
                         captured=[[1, 5], []])
        eng.play_card(st, 0, 8)
        self.assertIn("홍단", st["events"])
        eng.play_card(st, 1, 21)
        eng.play_card(st, 0, 20)
        self.assertNotIn("홍단", st["events"])
        self.assertEqual(eng.combos([4, 12, 29, 13, 17, 25]), ["초단", "고도리"])


class GostopThreePlayerTestCase(TestCase):
    def test_jjok_steals_from_everyone(self):
        st = blank_state("gostop", hands=[[0, 20], [21], [22]], floor=[36], pile=[2, 38],
                         captured=[[], [6], [7]])
        eng.play_card(st, 0, 0)
        self.assertCountEqual(st["captured"][0], [0, 2, 6, 7])
        self.assertEqual(st["turn"], 1)

    def test_turn_order_and_win_score(self):
        # 3인은 3점부터 난다: 3광 완성 → 고/스톱
        st = blank_state("gostop", hands=[[20], [28, 24], [22]], floor=[30], pile=[36, 38],
                         captured=[[], [0, 8], []], turn=1)
        eng.play_card(st, 1, 28)
        self.assertEqual(st["phase"], "go_stop")
        eng.declare_go_stop(st, 1, True)
        self.assertEqual((st["turn"], st["last_go"]), (2, 1))

    def test_gobak_payer_covers_other_loser(self):
        st = blank_state("gostop", captured=[[0, 8, 28], [2], [3]], go=[0, 1, 0], last_go=1)
        payments, _ = eng.settle(st, 0, "stop")
        # 3광 3점 × 광박 2 = 패자당 6점. 고를 불렀던 1번이 2번 몫까지 12점
        by_side = {p["side"]: (p["points"], p["gobak"]) for p in payments}
        self.assertEqual(by_side, {1: (12, True), 2: (0, False)})


class GostopRoomTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        for u in (self.a, self.b):
            PokerChipWallet.objects.create(user=u, chips=GOSTOP_BUY_IN * 2)

    def chips(self, u):
        return PokerChipWallet.objects.get(user=u).chips

    def test_enter_with_whole_wallet(self):
        PokerChipWallet.objects.filter(user=self.a).update(chips=12345)
        _, room_id = eng.create_room(self.a, "matgo")
        eng.join_room(self.b, room_id)
        stacks = dict(GostopSeat.objects.values_list("user__username", "stack"))
        self.assertEqual(stacks, {"a": 12345, "b": GOSTOP_BUY_IN * 2})
        self.assertEqual((self.chips(self.a), self.chips(self.b)), (0, 0))

    def test_buy_in_required(self):
        c = User.objects.create_user(username="c", password="x")
        self.assertFalse(eng.create_room(c, "matgo")[0])  # 지갑 없음
        PokerChipWallet.objects.create(user=c, chips=GOSTOP_BUY_IN - 1)
        self.assertFalse(eng.create_room(c, "matgo")[0])  # 최소 미만
        self.assertEqual(self.chips(c), GOSTOP_BUY_IN - 1)
        self.assertFalse(GostopRoom.objects.exists())
        self.assertFalse(eng.create_room(self.a, "poker")[0])

    def _start(self, mode, *users):
        _, room_id = eng.create_room(users[0], mode)
        for u in users[1:]:
            eng.join_room(u, room_id)
        GostopRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room = GostopRoom.objects.get(pk=room_id)
        return room if room.status == "playing" else None  # 총통으로 바로 끝나면 None

    def _run_until_game_ends(self, room_id):
        for _ in range(300):
            GostopRoom.objects.filter(pk=room_id, status="playing").update(turn_deadline=timezone.now() - timedelta(seconds=1))
            eng.process_due_deadlines()
            if GostopGameLog.objects.exists():
                return
        self.fail("판이 끝나지 않음")

    def test_leave_during_game_is_reserved_until_game_ends(self):
        room = self._start("matgo", self.a, self.b)
        if not room:
            return
        self.assertFalse(eng.create_room(self.a, "matgo")[0])  # 이미 방에 있음
        eng.leave_room(self.a)  # 판 중 나가기 = 예약 (기권 정산 없음)
        eng.leave_room(self.a)  # 다시 누르면 취소
        eng.leave_room(self.a)
        room.refresh_from_db()
        self.assertEqual((room.status, room.state["leaving"]), ("playing", [0]))
        self.assertEqual(GostopSeat.objects.filter(room=room).count(), 2)
        self.assertEqual(self.chips(self.a), 0)  # 보관 칩 전부 들고 들어가 있고, 판 중엔 정산 없음

        eng._end_game(GostopRoom.objects.get(pk=room.pk), {"winner": 1, "reason": "stop"})
        self.assertEqual(GostopSeat.objects.filter(room=room).count(), 2)  # 결과 보는 동안은 자리 유지
        eng._start_game(GostopRoom.objects.get(pk=room.pk))  # 다음 판 시작 시점에 퇴장
        seat = GostopSeat.objects.get(room=room)
        self.assertEqual((seat.user, seat.seat), (self.b, 0))  # 판 끝나고 퇴장, 상대가 방장 승계
        self.assertEqual(self.chips(self.a) + self.chips(self.b) + seat.stack, GOSTOP_BUY_IN * 4)

    def test_three_player_reserved_leave_after_game(self):
        c = User.objects.create_user(username="c", password="x")
        PokerChipWallet.objects.create(user=c, chips=GOSTOP_BUY_IN * 2)
        _, room_id = eng.create_room(self.a, "gostop")
        eng.join_room(self.b, room_id)
        self.assertIsNone(GostopRoom.objects.get(pk=room_id).next_game_at)  # 아직 2/3명
        eng.join_room(c, room_id)
        d = User.objects.create_user(username="d", password="x")
        PokerChipWallet.objects.create(user=d, chips=GOSTOP_BUY_IN)
        self.assertFalse(eng.join_room(d, room_id)[0])  # 정원 초과
        GostopRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room = GostopRoom.objects.get(pk=room_id)
        if room.status != "playing":  # 총통
            return
        eng.leave_room(self.a)
        eng._end_game(GostopRoom.objects.get(pk=room_id), {"winner": None, "reason": "nagari"})
        eng._start_game(GostopRoom.objects.get(pk=room_id))
        room = GostopRoom.objects.get(pk=room_id)
        self.assertEqual((room.status, room.next_game_at), ("waiting", None))
        self.assertEqual(
            list(GostopSeat.objects.filter(room=room).order_by("seat").values_list("user__username", "seat")),
            [("b", 0), ("c", 1)],
        )

    def test_disconnect_marks_away_and_reconnect_restores(self):
        room = self._start("matgo", self.a, self.b)
        if not room:
            return
        away_side = room.state["turn"]
        away_user = self.a if away_side == 0 else self.b
        eng.leave_room(away_user, away=True)
        room.refresh_from_db()
        self.assertEqual((room.state["away"], room.state["leaving"]), ([away_side], [away_side]))
        # 자리 비운 사람 차례는 짧게 자동 진행
        GostopRoom.objects.filter(pk=room.pk).update(turn_deadline=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room.refresh_from_db()
        if room.status == "playing" and room.state["turn"] == away_side:
            left = (room.turn_deadline - timezone.now()).total_seconds()
            self.assertLessEqual(left, eng.GOSTOP_AWAY_TURN_TIMEOUT)
        self.assertEqual(eng.mark_back(away_user)[0], room.status == "playing")
        room.refresh_from_db()
        if room.status == "playing":
            self.assertEqual((room.state["away"], room.state["leaving"]), ([], []))

    def _room_with_game(self, stacks):
        _, room_id = eng.create_room(self.a, "matgo")
        eng.join_room(self.b, room_id)
        room = GostopRoom.objects.get(pk=room_id)
        for side, stack in enumerate(stacks):
            GostopSeat.objects.filter(room=room, seat=side).update(stack=stack)
        st, _ = eng.new_game("matgo", 0, random.Random(3))
        st.update(captured=[[], []], bonus_pay=[])
        room.state, room.status = st, "playing"
        room.save()
        return room

    def test_winner_cannot_take_more_than_own_stack(self):
        room = self._room_with_game([1000, 50000])
        room.state["captured"][0] = GWANG  # 5광 15점 × 광박 2 = 30점 = 3,000칩
        room.save()
        eng._end_game(room, {"winner": 0, "reason": "stop"})
        stacks = dict(GostopSeat.objects.filter(room=room).values_list("user__username", "stack"))
        self.assertEqual(stacks, {"a": 2000, "b": 49000})  # 가진 1,000칩까지만
        room.refresh_from_db()
        self.assertTrue(room.last_result["transfers"][0]["capped"])

    def test_result_net_uses_user_not_shifted_seat(self):
        room = self._room_with_game([5000, 5000])
        room.state["captured"][1] = GWANG
        room.state["leaving"] = [0]  # 패자(0번)가 퇴장 예약 → 판 끝나고 빠지면 승자가 0번으로 당겨짐
        room.save()
        eng._end_game(room, {"winner": 1, "reason": "stop"})
        eng._start_game(GostopRoom.objects.get(pk=room.pk))
        seat = GostopSeat.objects.get(room=room)
        self.assertEqual((seat.user, seat.seat), (self.b, 0))
        self.assertEqual(eng.get_state_for(self.b)["room"]["last_result"]["my_net"], 3000)

    def test_first_ppeok_is_paid_even_on_nagari(self):
        _, room_id = eng.create_room(self.a, "matgo")
        eng.join_room(self.b, room_id)
        room = GostopRoom.objects.get(pk=room_id)
        st, _ = eng.new_game("matgo", 0, random.Random(3))
        st["bonus_pay"] = [{"side": 1, "points": 7, "reason": "첫뻑"}]
        room.state, room.status = st, "playing"
        room.save()
        eng._end_game(room, {"winner": None, "reason": "nagari"})
        stacks = dict(GostopSeat.objects.filter(room=room).values_list("user__username", "stack"))
        self.assertEqual(stacks, {"a": GOSTOP_BUY_IN * 2 - 700, "b": GOSTOP_BUY_IN * 2 + 700})
        room.refresh_from_db()
        self.assertEqual((room.last_result["nagari"], room.carry_multiplier), (True, 2))

    def test_timeouts_play_on_instead_of_forfeit(self):
        room = self._start("matgo", self.a, self.b)
        if not room:
            return
        self._run_until_game_ends(room.id)  # 시간초과만으로도 판이 끝까지 진행된다 (기권 없음)
        self.assertNotEqual(GostopGameLog.objects.get().detail.get("reason"), "forfeit")
        GostopRoom.objects.update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        self.assertFalse(GostopRoom.objects.exists())  # 둘 다 시간초과 3번 → 결과 뒤 다음 판 시작 때 퇴장
        total = sum(PokerChipWallet.objects.values_list("chips", flat=True))
        total += sum(GostopSeat.objects.values_list("stack", flat=True))
        self.assertEqual(total, GOSTOP_BUY_IN * 4)


class GostopConsumerTestCase(TestCase):
    """소켓으로 방 만들기/입장 후 각자 자기 시점의 상태를 받는지 (상대 손패는 비공개)."""

    async def _connect(self, user):
        comm = WebsocketCommunicator(game_consumers.GostopConsumer.as_asgi(), "/ws/gostop/")
        comm.scope["user"] = user
        connected, _ = await comm.connect()
        self.assertTrue(connected)
        state = await comm.receive_json_from()
        self.assertEqual(state["type"], "state")
        return comm

    @patch.object(game_consumers, "_ensure_gostop_watchdog", lambda: None)
    async def test_create_join_and_hidden_hands(self):
        def setup():
            users = [User.objects.create_user(username=n, password="x") for n in ("s1", "s2")]
            for u in users:
                PokerChipWallet.objects.create(user=u, chips=GOSTOP_BUY_IN)
            return users
        u1, u2 = await database_sync_to_async(setup)()
        c1, c2 = await self._connect(u1), await self._connect(u2)

        await c1.send_json_to({"type": "create", "mode": "matgo"})
        s1 = await c1.receive_json_from()
        await c2.receive_json_from()
        room_id = s1["room"]["id"]
        self.assertEqual(s1["wallet_chips"], 0)

        await c2.send_json_to({"type": "join", "room_id": room_id})
        await c1.receive_json_from()
        await c2.receive_json_from()

        def start():
            GostopRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
            eng.process_due_deadlines()
        await database_sync_to_async(start)()
        await game_consumers._broadcast_gostop_state()
        s1, s2 = await c1.receive_json_from(), await c2.receive_json_from()
        g1, g2 = s1["room"]["game"], s2["room"]["game"]
        if g1["phase"] != "over":  # 총통이 아니면 진행 중, 상대 손패는 개수만 보인다
            self.assertEqual(len(g1["my_hand"]), 10)
            self.assertIsNone(g1["hands"])
            self.assertEqual(g1["hand_counts"], [10, 10])
            self.assertNotEqual(g1["my_turn"], g2["my_turn"])

        await c1.disconnect()
        await c2.disconnect()
        for task in list(game_consumers._gostop_disconnect_tasks.values()):
            task.cancel()


class GostopPageTestCase(TestCase):
    def test_page_renders(self):
        self.client.force_login(User.objects.create_user(username="p", password="x"))
        res = self.client.get("/game/gostop/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "gs-cards-data")
        self.assertContains(res, "/ws/gostop/")
        self.assertContains(res, "?presence=1")


class GostopChipConservationTestCase(TestCase):
    """돈복사 방지: 방 만들기/입장/퇴장 예약·취소/끊김/재접속/두기/시간초과, 포커 착석/일어나기를
    무작위로 섞어도 (지갑 + 고스톱 스택 + 포커 스택) 칩 총합은 절대 변하지 않아야 한다."""

    def total(self):
        return (sum(PokerChipWallet.objects.values_list("chips", flat=True))
                + sum(HouseBank.objects.values_list("chips", flat=True))
                + sum(GostopSeat.objects.values_list("stack", flat=True))
                + sum(PokerSeat.objects.values_list("stack", flat=True)))

    @patch.object(gostop_ai, "AI_TIME_BUDGET", 0)
    def test_random_operations_conserve_chips(self):
        rng = random.Random(7)
        with transaction.atomic():
            HouseBank.locked()
        users = [User.objects.create_user(username=f"u{i}", password="x") for i in range(6)]
        for i, u in enumerate(users):
            PokerChipWallet.objects.create(user=u, chips=[0, 3000, 5000, 7000, 12000, 50000][i])
        start = self.total()
        for step in range(2500):
            u = rng.choice(users)
            op = rng.random()
            if op < .12:
                eng.create_room(u, rng.choice(["matgo", "gostop"]))
            elif op < .3:
                room = GostopRoom.objects.order_by("?").first()
                if room:
                    eng.join_room(u, room.id)
            elif op < .38:
                eng.leave_room(u)
            elif op < .42:
                eng.leave_room(u, away=True)
            elif op < .46:
                eng.mark_back(u)
            elif op < .47:
                eng.add_bots(u)
            elif op < .5:
                table = PokerTable.objects.order_by("?").first()
                if table and rng.random() < .7:
                    poker_engine.join_table(u, table.id)
                else:
                    poker_engine.create_table(u, rng.choice(["beginner", "intermediate"]))
            elif op < .54:
                poker_engine.stand_up(u)
            elif op < .8:
                seat = GostopSeat.objects.filter(user=u).select_related("room").first()
                if seat and seat.room.status == "playing" and seat.room.state.get("turn") == seat.seat:
                    eng._act(u, lambda st, s: eng.auto_act(st, s))
            else:
                GostopRoom.objects.update(
                    next_game_at=timezone.now() - timedelta(seconds=1),
                    turn_deadline=timezone.now() - timedelta(seconds=1),
                )
                eng.process_due_deadlines()
            self.assertEqual(self.total(), start, f"step {step}")
            # 5000칩 미만으로 방 스택을 가진 사람은 없어야 한다 (입장 시점 기준)
        self.assertFalse(GostopSeat.objects.filter(user=users[0]).exists())  # 0칩 유저는 입장 불가


@patch.object(gostop_ai, "AI_TIME_BUDGET", 0)  # 테스트에선 시뮬레이션 1회만
class GostopBotTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        PokerChipWallet.objects.create(user=self.a, chips=12000)
        PokerChipWallet.objects.create(user=self.b, chips=GOSTOP_BUY_IN)

    def house(self):
        return HouseBank.objects.get(pk=1).chips

    def test_add_bots_plays_full_game_and_returns_chips_to_house(self):
        _, room_id = eng.create_room(self.a, "gostop")
        self.assertEqual(eng.add_bots(self.a), (True, None))
        seats = list(GostopSeat.objects.filter(room_id=room_id).order_by("seat").select_related("user"))
        self.assertEqual([(s.user.is_bot, s.stack) for s in seats], [(False, 12000), (True, 12000), (True, 12000)])
        start_total = 12000 * 3 + self.house()
        for _ in range(400):  # 사람 차례는 시간초과로, AI 차례는 AI가 둔다
            GostopRoom.objects.filter(pk=room_id).update(
                next_game_at=timezone.now() - timedelta(seconds=1),
                turn_deadline=timezone.now() - timedelta(seconds=1),
            )
            eng.process_due_deadlines()
            if GostopGameLog.objects.exists():
                break
        self.assertTrue(GostopGameLog.objects.exists())
        eng.leave_room(self.a)  # 사람이 다 나가면 AI도 정리, 칩은 하우스로
        self.assertFalse(GostopRoom.objects.exists())
        self.assertEqual(PokerChipWallet.objects.get(user=self.a).chips + self.house(), start_total)

    def test_human_takes_bot_seat(self):
        _, room_id = eng.create_room(self.a, "matgo")
        eng.add_bots(self.a)
        self.assertEqual(eng.join_room(self.b, room_id), (True, room_id))  # 대기 중이면 AI가 바로 비켜줌
        users = list(GostopSeat.objects.filter(room_id=room_id).order_by("seat").values_list("user__username", flat=True))
        self.assertEqual(users, ["a", "b"])

    def test_bot_yields_after_game_when_playing(self):
        _, room_id = eng.create_room(self.a, "matgo")
        eng.add_bots(self.a)
        GostopRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        if GostopRoom.objects.get(pk=room_id).status != "playing":
            return
        ok, msg = eng.join_room(self.b, room_id)
        self.assertFalse(ok)
        self.assertEqual(GostopRoom.objects.get(pk=room_id).state["leaving"], [1])  # 판 끝나면 AI 퇴장

    def test_bots_hidden_from_leaves_ranking(self):
        _, room_id = eng.create_room(self.a, "matgo")
        eng.add_bots(self.a)
        self.client.force_login(self.a)
        rows = self.client.get("/ranking/community/?board=leaves").context["ranking_rows"]
        self.assertFalse(any(r["user"].is_bot for r in rows))

    def test_ai_moves_are_always_legal(self):
        rng = random.Random(5)
        for mode in ("matgo", "gostop"):
            for _ in range(15):
                st, out = eng.new_game(mode, 0, rng)
                while out is None:
                    out = gostop_ai.act(st, st["turn"], 0, rng)  # 모든 자리를 AI가 둬도 규칙 위반 없이 끝난다


class CrossGameSeatTestCase(TestCase):
    """포커에 앉은 채 고스톱으로 가거나 그 반대여도 칩이 묶이지 않는다."""

    def setUp(self):
        self.u = User.objects.create_user(username="u", password="x")
        self.v = User.objects.create_user(username="v", password="x")
        PokerChipWallet.objects.create(user=self.u, chips=GOSTOP_BUY_IN * 2)
        PokerChipWallet.objects.create(user=self.v, chips=GOSTOP_BUY_IN * 2)

    def test_gostop_entry_stands_up_from_idle_poker_seat(self):
        poker_engine.create_table(self.u, "intermediate")
        self.assertEqual(PokerChipWallet.objects.get(user=self.u).chips, 0)
        ok, room_id = eng.create_room(self.u, "matgo")
        self.assertTrue(ok)
        self.assertFalse(PokerSeat.objects.filter(user=self.u).exists())
        self.assertEqual(GostopSeat.objects.get(user=self.u).stack, GOSTOP_BUY_IN * 2)

    def test_poker_sit_leaves_waiting_gostop_room(self):
        eng.create_room(self.u, "matgo")
        self.assertTrue(poker_engine.create_table(self.u, "intermediate")[0])
        self.assertFalse(GostopRoom.objects.exists())
        self.assertEqual(PokerSeat.objects.get(user=self.u).stack, GOSTOP_BUY_IN * 2)

    def test_cancel_leave_while_viewing_result(self):
        _, room_id = eng.create_room(self.u, "matgo")
        eng.join_room(self.v, room_id)
        room = GostopRoom.objects.get(pk=room_id)
        st, _ = eng.new_game("matgo", 0, random.Random(3))
        st["leaving"] = [0]
        room.state, room.status = st, "playing"
        room.save()
        eng._end_game(room, {"winner": None, "reason": "nagari"})
        eng.cancel_leave(self.u)
        eng._start_game(GostopRoom.objects.get(pk=room_id))
        self.assertEqual(GostopSeat.objects.filter(room_id=room_id).count(), 2)


class PageLeaveGraceTestCase(TestCase):
    """페이지를 떠나며 page_leave를 보낸 연결은 짧은 유예 뒤 바로 일어난다."""

    async def test_page_leave_stands_up_quickly(self):
        def setup():
            u = User.objects.create_user(username="pl", password="x")
            PokerChipWallet.objects.create(user=u, chips=GOSTOP_BUY_IN)
            poker_engine.create_table(u, "intermediate")
            return u
        u = await database_sync_to_async(setup)()
        comm = WebsocketCommunicator(game_consumers.PokerConsumer.as_asgi(), "/ws/poker/")
        comm.scope["user"] = u
        with patch.object(game_consumers, "_ensure_poker_watchdog", lambda: None), \
                patch.object(game_consumers, "PAGE_LEAVE_GRACE_SECONDS", 0):
            await comm.connect()
            await comm.receive_json_from()
            await comm.send_json_to({"type": "page_leave"})
            await comm.disconnect()
            await game_consumers._disconnect_grace_tasks[u.id]
        self.assertFalse(await database_sync_to_async(PokerSeat.objects.filter(user=u).exists)())


class GostopAiFairnessTestCase(TestCase):
    """AI는 숨은 카드(상대 손패·더미 순서)를 보지 않는다: 같은 난수로 결정하게 하면 숨은 카드
    배치를 아무리 바꿔도 결정이 같아야 한다."""

    def test_ai_decision_ignores_hidden_cards(self):
        rng = random.Random(11)
        checked = 0
        for g in range(40):
            st, out = eng.new_game("matgo", g % 2, rng)
            while out is None:
                s = st["turn"]
                if s == 0:
                    alt = gostop_ai._clone(st)
                    pool = alt["pile"] + alt["hands"][1]
                    random.Random(g).shuffle(pool)
                    k = len(alt["hands"][1])
                    alt["hands"][1], alt["pile"] = sorted(pool[:k]), pool[k:]
                    decision = gostop_ai.choose(st, 0, budget=0, rng=random.Random(5))
                    self.assertEqual(decision, gostop_ai.choose(alt, 0, budget=0, rng=random.Random(5)))
                    checked += 1
                    out = gostop_ai.apply(st, 0, decision)
                else:
                    out = gostop_ai.apply(st, s, gostop_ai._policy(st, s))
        self.assertGreater(checked, 200)
