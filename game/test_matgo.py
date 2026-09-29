import random
from datetime import timedelta
from unittest.mock import patch

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import consumers as game_consumers, matgo_engine as eng
from .models import MatgoGameLog, MatgoRoom, PokerChipWallet, MATGO_BUY_IN, MATGO_CHIPS_PER_POINT

# 카드 id = (월-1)*4 + 월 안 순번. 예) 1월 광=0, 1월 홍단=1, 12월 비광=44
GWANG = [0, 8, 28, 40, 44]
GODORI = [4, 12, 29]
HONG = [1, 5, 9]
GUKJIN = 32


def blank_state(**kw):
    st, _ = eng.new_game(0, random.Random(1))
    st.update(hands=[[], []], floor=[], pile=[], captured=[[], []], phase="play", turn=0)
    st.update(kw)
    return st


def all_cards(st):
    cards = st["floor"] + st["pile"] + sum(st["hands"], []) + sum(st["captured"], [])
    if st.get("pending"):
        cards.append(st["pending"]["card"])
    return cards


class MatgoScoreTestCase(TestCase):
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


class MatgoTurnTestCase(TestCase):
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
        eng.play_card(st, 0, 0)  # 1월 광 + 바닥 1월 홍단, 뒤집은 1월 피 → 뻑
        self.assertEqual(st["events"], ["뻑"])
        self.assertCountEqual(st["floor"], [0, 1, 2, 36, 44])
        eng.play_card(st, 1, 3)  # 상대가 남은 1월로 뻑 먹기
        self.assertEqual(st["events"], ["뻑 먹기"])
        self.assertCountEqual(st["captured"][1], [0, 1, 2, 3, 38, 36, 7, 6])

    def test_ttadak(self):
        st = blank_state(hands=[[0, 20], [21]], floor=[1, 2], pile=[3, 38], captured=[[], [6]])
        eng.play_card(st, 0, 0, target=1)
        self.assertEqual(st["events"], ["따닥", "쓸"])
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
        points, detail = eng.settle(st, 0, "stop")
        # (3광 3 + 고도리 5 + 1고) × 광박 2 × 흔들기 2 = 36
        self.assertEqual(points, 36)
        self.assertEqual(detail["baks"], ["광박"])

    def test_random_games_keep_48_cards_and_finish(self):
        rng = random.Random(42)
        for _ in range(300):
            st, outcome = eng.new_game(rng.randint(0, 1), rng)
            steps = 0
            while outcome is None:
                outcome = eng.auto_act(st, st["turn"])
                self.assertCountEqual(all_cards(st), range(48))
                steps += 1
                self.assertLess(steps, 60)
            if outcome["winner"] is not None:
                points, _ = eng.settle(st, outcome["winner"], outcome["reason"])
                self.assertGreaterEqual(points, eng.MATGO_WIN_SCORE)


class MatgoRoomTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        for u in (self.a, self.b):
            PokerChipWallet.objects.create(user=u, chips=MATGO_BUY_IN * 2)

    def chips(self, u):
        return PokerChipWallet.objects.get(user=u).chips

    def test_buy_in_required(self):
        c = User.objects.create_user(username="c", password="x")
        ok, msg = eng.create_room(c)
        self.assertFalse(ok)

    def test_forfeit_moves_chips_and_room_is_deleted(self):
        ok, room_id = eng.create_room(self.a)
        self.assertTrue(ok)
        self.assertFalse(eng.create_room(self.a)[0])
        eng.join_room(self.b, room_id)
        MatgoRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room = MatgoRoom.objects.get(pk=room_id)
        if room.status != "playing":  # 총통으로 바로 끝난 경우
            return
        eng.leave_room(self.a)  # 진행 중 퇴장 = 기권 (최소 7점)
        lost = MATGO_CHIPS_PER_POINT * eng.MATGO_WIN_SCORE
        self.assertEqual(self.chips(self.a), MATGO_BUY_IN * 2 - lost)
        room = MatgoRoom.objects.get(pk=room_id)
        self.assertEqual((room.host_id, room.guest_id), (self.b.id, None))  # 상대가 방장 승계
        self.assertEqual(room.host_stack, MATGO_BUY_IN + lost)
        eng.leave_room(self.b)
        self.assertFalse(MatgoRoom.objects.exists())
        self.assertEqual(self.chips(self.a) + self.chips(self.b), MATGO_BUY_IN * 4)
        self.assertEqual(MatgoGameLog.objects.get().winner, self.b)

    def test_timeouts_finish_game(self):
        _, room_id = eng.create_room(self.a)
        eng.join_room(self.b, room_id)
        for _ in range(200):
            MatgoRoom.objects.filter(pk=room_id).update(
                next_game_at=timezone.now() - timedelta(seconds=1),
                turn_deadline=timezone.now() - timedelta(seconds=1),
            )
            eng.process_due_deadlines()
            if MatgoGameLog.objects.exists():
                break
        self.assertTrue(MatgoGameLog.objects.exists())
        total = sum(PokerChipWallet.objects.values_list("chips", flat=True))
        total += sum(r.host_stack + r.guest_stack for r in MatgoRoom.objects.all())
        self.assertEqual(total, MATGO_BUY_IN * 4)


class MatgoConsumerTestCase(TestCase):
    """소켓으로 방 만들기/입장 후 각자 자기 시점의 상태를 받는지 (상대 손패는 비공개)."""

    async def _connect(self, user):
        comm = WebsocketCommunicator(game_consumers.MatgoConsumer.as_asgi(), "/ws/matgo/")
        comm.scope["user"] = user
        connected, _ = await comm.connect()
        self.assertTrue(connected)
        state = await comm.receive_json_from()
        self.assertEqual(state["type"], "state")
        return comm

    @patch.object(game_consumers, "_ensure_matgo_watchdog", lambda: None)
    async def test_create_join_and_hidden_hands(self):
        def setup():
            users = [User.objects.create_user(username=n, password="x") for n in ("s1", "s2")]
            for u in users:
                PokerChipWallet.objects.create(user=u, chips=MATGO_BUY_IN)
            return users
        u1, u2 = await database_sync_to_async(setup)()
        c1, c2 = await self._connect(u1), await self._connect(u2)

        await c1.send_json_to({"type": "create"})
        s1 = await c1.receive_json_from()
        await c2.receive_json_from()
        room_id = s1["room"]["id"]
        self.assertEqual(s1["wallet_chips"], 0)

        await c2.send_json_to({"type": "join", "room_id": room_id})
        await c1.receive_json_from()
        await c2.receive_json_from()

        def start():
            MatgoRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
            eng.process_due_deadlines()
        await database_sync_to_async(start)()
        await game_consumers._broadcast_matgo_state()
        s1, s2 = await c1.receive_json_from(), await c2.receive_json_from()
        g1, g2 = s1["room"]["game"], s2["room"]["game"]
        if g1["phase"] != "over":  # 총통이 아니면 진행 중, 상대 손패는 개수만 보인다
            self.assertEqual(len(g1["my_hand"]), 10)
            self.assertIsNone(g1["opp_hand"])
            self.assertEqual(g1["opp_hand_count"], 10)
            self.assertNotEqual(g1["my_turn"], g2["my_turn"])

        await c1.disconnect()
        await c2.disconnect()
        for task in list(game_consumers._matgo_disconnect_tasks.values()):
            task.cancel()


class MatgoPageTestCase(TestCase):
    def test_page_renders(self):
        self.client.force_login(User.objects.create_user(username="p", password="x"))
        res = self.client.get("/game/matgo/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "mg-cards-data")
        self.assertContains(res, "/ws/matgo/")
        self.assertContains(res, "?presence=1")
