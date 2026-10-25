import random
from datetime import timedelta

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from accounts.models import User
from . import consumers as game_consumers
from . import janggi_ai
from . import janggi_engine as eng
from . import janggi_rules as r
from .models import JanggiMatch, JanggiRoom, JanggiSeat
from .views import get_janggi_ranking


def empty_board():
    return [[""] * r.COLS for _ in range(r.ROWS)]


def put(board, *pieces):
    for x, y, p in pieces:
        board[y][x] = p
    return board


def base():
    """양쪽 궁만 있는 판 (초 궁 (4,8), 한 궁 (4,1)은 마주 보지 않게 가운데에 졸 하나)."""
    return put(empty_board(), (3, 8, "cK"), (5, 1, "hK"))


class PieceMovesTestCase(TestCase):
    def moves(self, board, x, y):
        return sorted(r.pseudo_moves(board, x, y))

    def test_horse_moves_and_is_blocked_by_adjacent_piece(self):
        b = put(base(), (4, 5, "cH"))
        self.assertEqual(self.moves(b, 4, 5), sorted([(3, 3), (5, 3), (2, 4), (6, 4), (2, 6), (6, 6), (3, 7), (5, 7)]))
        b[4][4] = "cP"                                               # 위로 한 칸이 막히면 그쪽 두 칸은 못 간다 (멱)
        self.assertNotIn((3, 3), self.moves(b, 4, 5))
        self.assertNotIn((5, 3), self.moves(b, 4, 5))
        self.assertIn((2, 4), self.moves(b, 4, 5))

    def test_elephant_moves_and_is_blocked_on_either_step(self):
        b = put(base(), (4, 5, "cE"))
        self.assertEqual(self.moves(b, 4, 5), sorted([(1, 3), (1, 7), (2, 2), (2, 8), (6, 2), (6, 8), (7, 3), (7, 7)]))
        self.assertIn((7, 3), self.moves(b, 4, 5))                    # 오른쪽 1칸 + 대각선 2칸
        blocked_first = put(base(), (4, 5, "cE"), (5, 5, "hP"))       # 직진 칸 막힘
        self.assertNotIn((7, 3), self.moves(blocked_first, 4, 5))
        blocked_mid = put(base(), (4, 5, "cE"), (6, 4, "hP"))         # 첫 대각선 칸 막힘
        self.assertNotIn((7, 3), self.moves(blocked_mid, 4, 5))
        self.assertIn((7, 7), self.moves(blocked_mid, 4, 5))          # 다른 길은 그대로

    def test_cannon_must_jump_one_piece_and_cannot_use_or_capture_cannons(self):
        b = put(base(), (1, 5, "cC"), (1, 3, "hP"))                   # 위: 졸을 넘어 (1,2)(1,1)(1,0)
        up = [m for m in self.moves(b, 1, 5) if m[0] == 1]
        self.assertEqual(sorted(up), [(1, 0), (1, 1), (1, 2)])
        self.assertEqual([m for m in self.moves(b, 1, 5) if m[1] == 5], [])   # 넘을 말이 없으면 못 간다
        b = put(base(), (1, 5, "cC"), (1, 3, "hC"))                   # 포는 넘을 수 없다
        self.assertEqual([m for m in self.moves(b, 1, 5) if m[0] == 1], [])
        b = put(base(), (1, 5, "cC"), (1, 3, "hP"), (1, 1, "hC"))     # 포는 잡을 수 없다
        self.assertEqual(sorted(m for m in self.moves(b, 1, 5) if m[0] == 1), [(1, 2)])
        b = put(base(), (1, 5, "cC"), (1, 3, "hP"), (1, 1, "hR"))     # 차는 잡을 수 있다
        self.assertIn((1, 1), self.moves(b, 1, 5))

    def test_chariot_slides_captures_and_uses_palace_diagonals(self):
        b = put(base(), (0, 5, "cR"), (0, 2, "hP"), (3, 5, "cP"))
        got = self.moves(b, 0, 5)
        self.assertIn((0, 2), got)                                    # 잡기
        self.assertNotIn((0, 1), got)                                 # 그 뒤는 못 간다
        self.assertIn((2, 5), got)
        self.assertNotIn((3, 5), got)                                 # 내 말에 막힘
        b = put(empty_board(), (3, 7, "cR"), (3, 9, "cK"), (5, 1, "hK"))
        self.assertIn((5, 9), self.moves(b, 3, 7))                    # 궁성 대각선 끝까지 (중앙 통과)
        self.assertIn((4, 8), self.moves(b, 3, 7))

    def test_soldier_never_moves_backward_and_uses_enemy_palace_diagonal(self):
        b = put(base(), (4, 5, "cP"))
        self.assertEqual(self.moves(b, 4, 5), sorted([(4, 4), (3, 5), (5, 5)]))
        b = put(empty_board(), (3, 2, "cP"), (4, 9, "cK"), (3, 9, "hK"))
        self.assertIn((4, 1), self.moves(b, 3, 2))                    # 한 궁성 대각선 (앞)
        hb = put(empty_board(), (4, 1, "hP"), (3, 9, "hK"), (5, 8, "cK"))
        self.assertEqual(sorted(m for m in self.moves(hb, 4, 1) if m[1] == 0), [])   # 병은 뒤로 못 간다

    def test_general_and_guard_stay_in_palace_with_diagonals(self):
        b = put(empty_board(), (4, 8, "cK"), (5, 1, "hK"))
        self.assertEqual(len(self.moves(b, 4, 8)), 8)                 # 궁성 중앙에서는 8방향
        b = put(empty_board(), (3, 9, "cA"), (4, 8, "cK"), (5, 1, "hK"))
        self.assertEqual(self.moves(b, 3, 9), sorted([(3, 8), (4, 9)]))   # 중앙은 내 궁이 차지, 궁성 밖으로 못 나감


class LegalityTestCase(TestCase):
    def test_cannot_leave_own_general_in_check_and_facing_generals_are_illegal(self):
        b = put(empty_board(), (4, 9, "cK"), (3, 1, "hK"), (4, 6, "cR"), (4, 0, "hR"))
        # 초 차는 (4,0)의 한 차가 (4,9)의 초 궁을 노리는 줄을 막고 있다 → 옆으로 비키면 안 된다
        moves = r.legal_moves_for(b, 4, 6)
        self.assertTrue(all(x == 4 for x, _ in moves))
        b = put(empty_board(), (4, 9, "cK"), (4, 1, "hK"), (4, 5, "cR"))   # 사이에 초 차 하나만 있다
        self.assertNotIn((3, 5), r.legal_moves_for(b, 4, 5))               # 비키면 빅장(궁끼리 마주 봄)
        self.assertIn((4, 2), r.legal_moves_for(b, 4, 5))

    def test_check_detection_and_checkmate(self):
        b = put(empty_board(), (3, 9, "cK"), (4, 1, "hK"), (3, 0, "hR"))
        self.assertTrue(r.in_check(b, r.CHO))
        # 외통수: 초 궁이 구석, 한 차 둘이 궁성 줄을 모두 지킨다
        b = put(empty_board(), (5, 9, "cK"), (4, 0, "hK"), (3, 9, "hR"), (3, 8, "hR"), (4, 8, "hR"))
        self.assertTrue(r.in_check(b, r.CHO))
        self.assertEqual(r.all_legal_moves(b, r.CHO), {})

    def test_initial_setup_variants_and_opening_moves(self):
        for i in range(len(r.SETUPS)):
            b = r.new_board(i, (i + 1) % 4)
            self.assertEqual(sum(1 for row in b for c in row if c), 32)
            self.assertFalse(r.in_check(b, r.CHO) or r.in_check(b, r.HAN))
        b = r.new_board(0, 0)
        self.assertEqual(b[9][1], "cH")
        self.assertEqual(b[9][2], "cE")
        self.assertEqual(r.new_board(2, 0)[9][1], "cE")
        self.assertGreater(len(r.all_legal_moves(b, r.CHO)), 5)


class AiTestCase(TestCase):
    def test_ai_takes_free_material_and_never_plays_illegal_moves(self):
        b = put(base(), (4, 5, "cR"), (4, 2, "hR"))                    # 초 차가 한 차를 공짜로 잡을 수 있다
        b[8][3] = "cK"
        self.assertEqual(janggi_ai.choose_move(b, r.CHO, random.Random(1))[2:], (4, 2))
        rng = random.Random(7)
        board, side = r.new_board(0, 3), r.CHO
        for _ in range(60):                                            # AI끼리 60수: 모든 수가 규칙에 맞아야 한다
            move = janggi_ai.choose_move(board, side, rng)
            if move is None:
                break
            fx, fy, tx, ty = move
            self.assertIn((tx, ty), r.legal_moves_for(board, fx, fy))
            board, _ = r.apply_move(board, fx, fy, tx, ty)
            side = 1 - side


class RoomFlowTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="ja", password="x")
        self.b = User.objects.create_user(username="jb", password="x")

    def start(self):
        ok, room_id = eng.create_room(self.a)
        self.assertTrue(ok)
        self.assertTrue(eng.join_room(self.b, room_id)[0])
        JanggiRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        return JanggiRoom.objects.get(pk=room_id)

    def users(self, room):
        seats = {s.seat: s.user for s in room.seats.select_related("user")}
        return seats[room.state["cho"]], seats[1 - room.state["cho"]]

    def to_play(self, room):
        cho, han = self.users(room)
        self.assertEqual(room.state["phase"], "setup")
        self.assertTrue(eng.choose_setup(cho, 0)[0])
        self.assertTrue(eng.choose_setup(han, 3)[0])
        room.refresh_from_db()
        self.assertEqual(room.state["phase"], "play")
        return cho, han

    def test_setup_phase_then_cho_moves_first_with_chosen_arrangements(self):
        room = self.start()
        cho, han = self.to_play(room)
        board = room.state["board"]
        self.assertEqual((board[9][1], board[0][1]), ("cH", "hE"))     # 초 마상마상, 한 상마상마
        self.assertFalse(eng.move(han, 0, 3, 0, 4)[0])                  # 한은 먼저 못 둔다
        self.assertTrue(eng.move(cho, 0, 6, 0, 5)[0])
        self.assertFalse(eng.move(cho, 2, 6, 2, 5)[0])                  # 같은 사람이 연달아 못 둔다
        self.assertFalse(eng.choose_setup(cho, 1)[0])                   # 판이 시작되면 상차림 못 바꿈

    def test_bad_moves_are_rejected_with_reason(self):
        room = self.start()
        cho, han = self.to_play(room)
        for args in [(0, 9, 0, 5), (4, 6, 4, 4), (9, 9, 1, 1), (0, 0, 0, 1), (4, 4, 4, 5)]:
            ok, msg = eng.move(cho, *args)
            self.assertFalse(ok, args)
            self.assertTrue(msg)

    def test_unchosen_setup_defaults_when_time_runs_out(self):
        room = self.start()
        cho, han = self.users(room)
        self.assertTrue(eng.choose_setup(cho, 2)[0])
        JanggiRoom.objects.filter(pk=room.pk).update(turn_deadline=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room.refresh_from_db()
        self.assertEqual(room.state["phase"], "play")
        self.assertEqual(room.state["board"][0][1], "hH")               # 안 고른 한은 기본 마상마상

    def test_checkmate_ends_the_game_and_is_recorded(self):
        room = self.start()
        cho, han = self.to_play(room)
        # 초 궁 (4,9), 한 차가 (0,9)와 (0,7): 한 차를 (0,8)로 옮기면 외통수
        room.state["board"] = put(empty_board(), (4, 9, "cK"), (3, 0, "hK"), (0, 9, "hR"), (0, 7, "hR"))
        room.state["turn"] = 1 - room.state["cho"]
        room.state["bots"] = []
        room.save()
        self.assertTrue(eng.move(han, 0, 7, 0, 8)[0])
        match = JanggiMatch.objects.get()
        self.assertEqual((match.winner, match.reason, match.cho, match.han), (han, "checkmate", cho, han))
        self.assertFalse(match.ranked)                                  # 20수 미만이라 랭킹 제외
        room.refresh_from_db()
        self.assertEqual((room.status, room.last_result["winner"]), ("waiting", han.display_name))

    def test_resign_timeout_and_leave(self):
        room = self.start()
        cho, han = self.to_play(room)
        self.assertTrue(eng.resign(han)[0])
        self.assertEqual((JanggiMatch.objects.get().winner, JanggiMatch.objects.get().reason), (cho, "resign"))
        JanggiRoom.objects.filter(pk=room.pk).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room.refresh_from_db()
        self.to_play(room)
        room.refresh_from_db()
        mover = room.state["turn"]
        JanggiRoom.objects.filter(pk=room.pk).update(turn_deadline=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        last = JanggiMatch.objects.first()
        self.assertEqual(last.reason, "timeout")
        self.assertNotEqual(last.winner_id, room.seats.get(seat=mover).user_id)
        JanggiRoom.objects.filter(pk=room.pk).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        eng.leave_room(self.b)                                          # 판 중 퇴장 = 패
        self.assertEqual(JanggiMatch.objects.first().reason, "leave")

    def test_repetition_is_a_draw(self):
        room = self.start()
        cho, han = self.to_play(room)
        room.state["board"] = put(empty_board(), (3, 9, "cK"), (5, 0, "hK"), (0, 5, "cR"), (8, 4, "hR"))
        room.state["positions"] = {}
        room.state["turn"] = room.state["cho"]
        room.save()
        cycle = [(cho, (0, 5, 0, 6)), (han, (8, 4, 8, 3)), (cho, (0, 6, 0, 5)), (han, (8, 3, 8, 4))]
        for i in range(12):                                             # 같은 국면이 세 번 나오면 중간에 무승부로 끝난다
            if JanggiMatch.objects.exists():
                break
            who, args = cycle[i % 4]
            self.assertTrue(eng.move(who, *args)[0], i)
        match = JanggiMatch.objects.get()
        self.assertEqual((match.reason, match.winner), ("draw", None))

    def test_bot_game_is_never_ranked_and_bot_moves_on_its_own(self):
        ok, room_id = eng.create_room(self.a)
        self.assertTrue(eng.add_bot(self.a)[0])
        JanggiRoom.objects.filter(pk=room_id).update(next_game_at=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room = JanggiRoom.objects.get(pk=room_id)
        bot_seat = room.state["bots"][0]
        if room.state["phase"] == "setup":
            eng.choose_setup(self.a, 1)
            room.refresh_from_db()
        if room.state["turn"] != bot_seat:                               # 사람이 먼저면 한 수 둔다
            move = next(iter(r.all_legal_moves(room.state["board"], r.CHO if room.state["cho"] != bot_seat else r.HAN).items()))
            self.assertTrue(eng.move(self.a, move[0][0], move[0][1], *move[1][0])[0])
            room.refresh_from_db()
        before = len(room.state["moves"])
        JanggiRoom.objects.filter(pk=room_id).update(turn_deadline=timezone.now() - timedelta(seconds=1))
        eng.process_due_deadlines()
        room.refresh_from_db()
        self.assertEqual(len(room.state["moves"]), before + 1)
        eng.resign(self.a)
        match = JanggiMatch.objects.get()
        self.assertEqual((match.vs_bot, match.ranked), (True, False))

    def test_state_exposes_legal_moves_only_on_my_turn(self):
        room = self.start()
        cho, han = self.to_play(room)
        mine = eng.get_state_for(cho)["room"]["game"]
        self.assertTrue(mine["my_turn"])
        self.assertIn("0,6", mine["legal"])
        self.assertEqual(eng.get_state_for(han)["room"]["game"]["legal"], {})
        self.assertEqual(eng.get_state_for(han)["room"]["game"]["cho"], room.state["cho"])


class RankingAndViewsTestCase(TestCase):
    def test_pair_cap_and_ranking_counts_only_ranked_human_wins(self):
        a, b = User.objects.create_user(username="ra", password="x"), User.objects.create_user(username="rb", password="x")
        for _ in range(eng.PAIR_DAILY_RANKED_CAP):
            JanggiMatch.objects.create(cho=a, han=b, winner=a, moves=40, ranked=True)
        self.assertFalse(eng._ranked(a, b, 40, a))
        self.assertFalse(eng._ranked(a, b, 5, a))                       # 너무 짧은 판
        JanggiMatch.objects.create(cho=a, han=b, winner=b, moves=40, ranked=False)
        rows = get_janggi_ranking(top_n=None)
        self.assertEqual([(x["user"].username, x["score"]) for x in rows], [("ra", 5)])
        self.assertEqual(rows[0]["losses"], 0)

    def test_pages_render_and_presence_label(self):
        from .views import _my_game_spot
        user = User.objects.create_user(username="jv", password="x")
        self.client.force_login(user)
        self.assertContains(self.client.get(reverse("janggi")), "/ws/janggi/")
        self.assertContains(self.client.get(reverse("game_lobby")), reverse("janggi"))
        page = self.client.get(reverse("game_ranking"), {"board": "janggi"})
        self.assertContains(page, "장기 승 수 랭킹")
        eng.create_room(user)
        self.assertEqual(game_consumers._seated_games([user.id]), {user.id: "장기"})
        self.assertTrue(_my_game_spot(user, "janggi")[1].startswith("/game/janggi/?room="))


class ConsumerTestCase(TestCase):
    databases = {"default", "beta_judge"}

    def tearDown(self):
        for task in list(game_consumers._janggi_disconnect_tasks.values()):
            task.cancel()
        game_consumers._janggi_disconnect_tasks.clear()

    async def test_create_room_and_errors_via_socket(self):
        user = await database_sync_to_async(User.objects.create_user)(username="jws", password="x")
        comm = WebsocketCommunicator(game_consumers.JanggiConsumer.as_asgi(), "/ws/janggi/")
        comm.scope["user"] = user
        self.assertTrue((await comm.connect())[0])
        self.assertEqual((await comm.receive_json_from())["room"], None)
        await comm.send_json_to({"type": "create"})
        self.assertEqual((await comm.receive_json_from())["room"]["seats"][0]["user_id"], user.id)
        await comm.send_json_to({"type": "move", "fx": 0, "fy": 6, "tx": 0, "ty": 5})
        self.assertEqual((await comm.receive_json_from())["type"], "error")      # 판이 아직 없음
        await comm.disconnect()
