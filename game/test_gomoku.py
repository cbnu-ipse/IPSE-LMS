import random
from datetime import timedelta
from io import StringIO
from unittest.mock import patch

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from accounts.models import User
from . import consumers as game_consumers
from . import gomoku_ai, gomoku_engine as eng
from .models import GomokuMatch, GomokuRoom, GomokuSeat
from .views import get_gomoku_ranking


def board_with(stones):
    b = eng.new_board()
    for x, y, c in stones:
        b[y][x] = c
    return b


class RulesTestCase(TestCase):
    def test_five_in_every_direction_wins(self):
        for dx, dy in eng.DIRS:
            st = eng.new_game(0)
            for i in range(4):
                st["board"][5 + dy * i][5 + dx * i] = 1
            st["moves"] = [[0, 0, 0]] * 8
            out = eng.place_stone(st, 0, 5 + dx * 4, 5 + dy * 4)
            self.assertEqual((out["winner"], out["reason"]), (0, "five"), (dx, dy))
            self.assertEqual(len(out["line"]), 5)

    def test_four_does_not_win_and_six_or_more_does(self):
        st = eng.new_game(0)
        for x in range(4):
            st["board"][7][x] = 1
        self.assertIsNone(eng.place_stone(st, 0, 4 if False else 3, 8))     # 다른 줄에 둠
        st = eng.new_game(0)
        for x in (0, 1, 2, 4, 5):
            st["board"][7][x] = 1
        out = eng.place_stone(st, 0, 3, 7)                                   # 6목 완성 (자유룰)
        self.assertEqual(len(out["line"]), 6)

    def test_other_colors_do_not_connect_and_bad_moves_are_rejected(self):
        st = eng.new_game(0)
        st["board"][3][3] = 2
        with self.assertRaises(ValueError):
            eng.place_stone(st, 0, 3, 3)                 # 돌이 있는 자리
        with self.assertRaises(ValueError):
            eng.place_stone(st, 0, 15, 0)                # 판 밖
        with self.assertRaises(ValueError):
            eng.place_stone(st, 1, 0, 0)                 # 내 차례가 아님
        for x in range(4):
            st["board"][9][x] = 2
        self.assertIsNone(eng.place_stone(st, 0, 4, 9))  # 흑이 사이를 막으면 백 4개 뒤라 5목 아님

    def test_draw_when_board_is_full(self):
        st = eng.new_game(0)
        st["moves"] = [[0, 0, 0]] * (eng.SIZE * eng.SIZE - 1)
        out = eng.place_stone(st, 0, 7, 7)
        self.assertEqual((out["winner"], out["reason"]), (None, "draw"))


class AiTestCase(TestCase):
    def test_ai_completes_its_own_four_and_blocks_opponent_four(self):
        own = board_with([(x, 7, 2) for x in range(3, 7)] + [(3, 9, 1), (4, 9, 1)])
        self.assertIn(gomoku_ai.choose_move(own, 2, random.Random(1)), [(2, 7), (7, 7)])
        block = board_with([(x, 7, 1) for x in range(3, 7)] + [(10, 10, 2)])
        self.assertIn(gomoku_ai.choose_move(block, 2, random.Random(1)), [(2, 7), (7, 7)])

    def test_ai_opens_at_center_and_handles_full_board(self):
        self.assertEqual(gomoku_ai.choose_move(eng.new_board(), 1), (7, 7))
        full = [[1 if (x + y) % 2 else 2 for x in range(15)] for y in range(15)]
        self.assertIsNone(gomoku_ai.choose_move(full, 1))


class RoomFlowTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="ga", password="x")
        self.b = User.objects.create_user(username="gb", password="x")

    def start(self):
        ok, room_id = eng.create_room(self.a)
        self.assertTrue(ok)
        self.assertTrue(eng.join_room(self.b, room_id)[0])
        GomokuRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        return GomokuRoom.objects.get(pk=room_id)

    def sides(self, room):
        black = room.state["black"]
        seats = {s.seat: s.user for s in room.seats.select_related("user")}
        return seats[black], seats[1 - black]

    def play_five(self, room, black_user, white_user, white_x_offset=0):
        """흑이 가로 5목을 만들 때까지 번갈아 둔다 (백은 아래 줄에 흩어 둔다) = 9수."""
        for i in range(5):
            self.assertTrue(eng.place(black_user, 3 + i, 7)[0])
            if i < 4:
                self.assertTrue(eng.place(white_user, 3 + i + white_x_offset, 10)[0])

    def test_two_players_start_and_black_moves_first(self):
        room = self.start()
        self.assertEqual(room.status, "playing")
        black, white = self.sides(room)
        self.assertFalse(eng.place(white, 7, 7)[0])        # 백은 첫 수를 못 둔다
        self.assertTrue(eng.place(black, 7, 7)[0])

    def test_win_is_recorded_as_ranked_between_humans(self):
        room = self.start()
        black, white = self.sides(room)
        self.play_five(room, black, white)
        match = GomokuMatch.objects.get()
        self.assertEqual((match.winner, match.reason, match.moves, match.ranked, match.vs_bot),
                         (black, "five", 9, True, False))
        room.refresh_from_db()
        self.assertEqual((room.status, room.last_result["winner"]), ("waiting", black.display_name))
        state = eng.get_state_for(black)
        self.assertEqual(state["record"], {"wins": 1, "losses": 0, "games": 1})
        self.assertEqual(eng.get_state_for(white)["record"], {"wins": 0, "losses": 1, "games": 1})

    def test_next_game_swaps_colors(self):
        room = self.start()
        black, white = self.sides(room)
        self.play_five(room, black, white)
        GomokuRoom.objects.filter(pk=room.pk).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room.refresh_from_db()
        self.assertEqual(self.sides(room)[0], white)

    def test_early_resign_and_leave_are_not_ranked_and_timeout_loses(self):
        room = self.start()
        black, white = self.sides(room)
        self.assertTrue(eng.place(black, 7, 7)[0])
        self.assertTrue(eng.resign(white)[0])               # 2수 만에 기권
        match = GomokuMatch.objects.get()
        self.assertEqual((match.winner, match.reason, match.ranked), (black, "resign", False))
        GomokuRoom.objects.filter(pk=room.pk).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room.refresh_from_db()
        mover = self.sides(room)[0]                          # 이번 판 흑 차례인 사람이 시간 초과
        GomokuRoom.objects.filter(pk=room.pk).update(turn_deadline=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        last = GomokuMatch.objects.first()
        self.assertEqual((last.reason, last.winner == mover), ("timeout", False))

    def test_leaving_mid_game_forfeits_and_empty_room_is_deleted(self):
        room = self.start()
        black, white = self.sides(room)
        eng.leave_room(white)
        match = GomokuMatch.objects.get()
        self.assertEqual((match.winner, match.reason), (black, "leave"))
        self.assertTrue(GomokuRoom.objects.filter(pk=room.pk).exists())     # 남은 사람이 있으면 방 유지
        eng.leave_room(black)
        self.assertFalse(GomokuRoom.objects.filter(pk=room.pk).exists())

    def test_same_pair_ranked_wins_are_capped_per_day(self):
        for i in range(eng.PAIR_DAILY_RANKED_CAP):
            GomokuMatch.objects.create(black=self.a, white=self.b, winner=self.a, moves=30, ranked=True)
        self.assertFalse(eng._ranked(self.a, self.b, 30, self.a))
        self.assertFalse(eng._ranked(self.b, self.a, 30, self.b))           # 순서 무관
        other = User.objects.create_user(username="gc", password="x")
        self.assertTrue(eng._ranked(self.a, other, 30, self.a))              # 다른 상대는 영향 없음

    def test_bot_games_are_never_ranked_and_bot_moves_on_its_own(self):
        ok, room_id = eng.create_room(self.a)
        self.assertTrue(eng.add_bot(self.a)[0])
        GomokuRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room = GomokuRoom.objects.get(pk=room_id)
        bot_side = room.state["bots"][0]
        if room.state["turn"] != bot_side:                    # 사람이 먼저면 한 수 둔다
            self.assertTrue(eng.place(self.a, 7, 7)[0])
            room.refresh_from_db()
        GomokuRoom.objects.filter(pk=room_id).update(turn_deadline=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room.refresh_from_db()
        self.assertEqual(room.state["moves"][-1][2], bot_side)                 # 마지막 수는 AI가 둠
        eng.resign(self.a)
        match = GomokuMatch.objects.get()
        self.assertEqual((match.vs_bot, match.ranked), (True, False))

    def test_cannot_join_two_rooms_and_full_room_is_refused(self):
        ok, room_id = eng.create_room(self.a)
        self.assertFalse(eng.create_room(self.a)[0])
        self.assertTrue(eng.join_room(self.b, room_id)[0])
        third = User.objects.create_user(username="gd", password="x")
        self.assertFalse(eng.join_room(third, room_id)[0])


class RankingTestCase(TestCase):
    def test_ranking_counts_ranked_human_wins_and_orders_by_wins_then_rate(self):
        a, b, c = (User.objects.create_user(username=n, password="x") for n in "rka rkb rkc".split())
        def match(w, l, ranked=True):
            GomokuMatch.objects.create(black=w, white=l, winner=w, moves=30, ranked=ranked)
        match(a, b); match(a, c); match(b, a); match(b, c); match(c, a, ranked=False)   # 마지막은 제외
        rows = get_gomoku_ranking(top_n=None)
        self.assertEqual([r["user"].username for r in rows], ["rka", "rkb"])         
        self.assertEqual((rows[0]["score"], rows[0]["games"], rows[0]["losses"]), (2, 3, 1))
        self.assertEqual([r["rank"] for r in rows], [1, 1])                           # 승 수·승률이 같으면 공동 순위

    def test_ranking_page_and_lobby_card_render(self):
        user = User.objects.create_user(username="viewer", password="x")
        GomokuMatch.objects.create(black=user, white=None, winner=user, moves=40, ranked=True)
        self.client.force_login(user)
        page = self.client.get(reverse("game_ranking"), {"board": "gomoku"})
        self.assertContains(page, "오목 승 수 랭킹")
        self.assertContains(page, "1승")
        self.assertNotContains(page, "시즌 보상: 1위")
        self.assertContains(self.client.get(reverse("game_lobby")), reverse("gomoku"))
        self.assertContains(self.client.get(reverse("gomoku")), "/ws/gomoku/")


class ConsumerTestCase(TestCase):
    databases = {"default", "beta_judge"}

    def tearDown(self):
        for task in list(game_consumers._gomoku_disconnect_tasks.values()):
            task.cancel()
        game_consumers._gomoku_disconnect_tasks.clear()

    async def test_create_room_and_state_via_socket(self):
        user = await database_sync_to_async(User.objects.create_user)(username="ws1", password="x")
        comm = WebsocketCommunicator(game_consumers.GomokuConsumer.as_asgi(), "/ws/gomoku/")
        comm.scope["user"] = user
        connected, _ = await comm.connect()
        self.assertTrue(connected)
        first = await comm.receive_json_from()
        self.assertEqual((first["type"], first["room"]), ("state", None))
        await comm.send_json_to({"type": "create"})
        state = await comm.receive_json_from()
        self.assertEqual(state["room"]["seats"][0]["user_id"], user.id)
        await comm.send_json_to({"type": "place", "x": 1, "y": 1})          # 판이 아직 없음
        err = await comm.receive_json_from()
        self.assertEqual(err["type"], "error")
        await comm.disconnect()

    def test_presence_label_and_invite_spot_for_gomoku(self):
        from .views import _my_game_spot
        user = User.objects.create_user(username="pl", password="x")
        eng.create_room(user)
        self.assertEqual(game_consumers._seated_games([user.id]), {user.id: "오목"})
        name, link = _my_game_spot(user, "gomoku")
        self.assertTrue(name.startswith("오목") and link.startswith("/game/gomoku/?room="))
