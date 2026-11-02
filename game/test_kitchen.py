import random

from asgiref.sync import sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase

from . import consumers, kitchen_engine as engine, kitchen_hub

User = get_user_model()


def room_with(*names):
    room = engine.Room("ABCD", 1, rng=random.Random(1))
    for i, name in enumerate(names, 1):
        room.add_player(i, name)
    return room


def put(room, uid, x, y, fx=0, fy=-1):
    p = room.players[uid]
    p.x, p.y, p.fx, p.fy = x, y, fx, fy
    return p


class MapTests(SimpleTestCase):
    def test_map_is_rectangular_and_spawns_are_open_floor(self):
        self.assertEqual({len(row) for row in engine.MAP}, {engine.W})
        self.assertEqual(len(engine.MAP), engine.H)
        for x, y in engine.SPAWNS:
            self.assertEqual(engine.tile_at(x, y), ".")

    def test_every_station_can_be_reached_from_the_floor(self):
        # 바닥 칸에서 시작해 갈 수 있는 모든 바닥 칸을 모으고, 각 시설 옆에 그런 칸이 있는지 본다
        seen, todo = set(), [engine.SPAWNS[0]]
        while todo:
            x, y = todo.pop()
            if (x, y) in seen or engine.tile_at(x, y) != ".":
                continue
            seen.add((x, y))
            todo += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
        for y in range(engine.H):
            for x in range(engine.W):
                if engine.tile_at(x, y) in "NEGDXWTBS":
                    self.assertTrue(any(n in seen for n in [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]), (x, y))


class RoomTests(SimpleTestCase):
    def test_room_limits_and_lobby_rules(self):
        room = room_with("a", "b", "c", "d")
        self.assertFalse(room.add_player(5, "e")[0])
        self.assertTrue(room.add_player(1, "a")[0])              # 이미 있는 사람은 재접속으로 본다
        self.assertFalse(room.start(2)[0])                       # 방장만 시작
        self.assertTrue(room.start(1)[0])
        self.assertFalse(room.add_player(9, "late")[0])          # 시작한 뒤에는 새로 못 들어온다
        self.assertEqual(room.targets, [t * 4 for t in engine.STAR_TARGETS])

    def test_solo_can_start_and_gets_two_orders(self):
        room = room_with("solo")
        self.assertTrue(room.start(1)[0])
        self.assertEqual(len(room.orders), 2)

    def test_host_moves_on_when_the_host_leaves(self):
        room = room_with("a", "b")
        room.remove_player(1)
        self.assertEqual(room.host_id, 2)


class MovementTests(SimpleTestCase):
    def test_moves_one_tile_per_cooldown_and_stops_at_walls_and_players(self):
        room = room_with("a", "b")
        room.start(1)
        a = put(room, 1, 5, 2)
        put(room, 2, 6, 2)
        room.set_input(1, 1, 0)
        room.step(0.05)
        self.assertEqual((a.x, a.y), (5, 2))                     # 옆 사람이 막고 있다
        self.assertEqual((a.fx, a.fy), (1, 0))                   # 그래도 그쪽을 본다
        room.set_input(1, 0, -1)
        room.step(0.05)
        self.assertEqual((a.x, a.y), (5, 1))
        room.step(0.05)
        self.assertEqual((a.x, a.y), (5, 1))                     # 쿨다운 중
        room.step(engine.MOVE_COOLDOWN)
        self.assertEqual((a.x, a.y), (5, 1))                     # 위는 창고(벽처럼 막힘)

    def test_invalid_input_is_ignored(self):
        room = room_with("a")
        room.start(1)
        room.set_input(1, 5, "x")
        self.assertEqual((room.players[1].dx, room.players[1].dy), (0, 0))
        room.set_input(1, 1, 1)
        self.assertEqual((room.players[1].dx, room.players[1].dy), (1, 0))


class CookingTests(SimpleTestCase):
    def setUp(self):
        self.room = room_with("a")
        self.room.start(1)
        self.p = put(self.room, 1, 6, 4)               # (6,3)은 화구

    def test_crate_gives_ingredient_only_to_empty_hands(self):
        put(self.room, 1, 0 + 1, 1)                      # (1,0)은 면 상자
        self.room.interact(1)
        self.assertEqual(self.p.held, {"k": "noodle", "s": "raw"})
        self.room.interact(1)
        self.assertEqual(self.p.held, {"k": "noodle", "s": "raw"})

    def test_noodle_cooks_then_burns(self):
        self.p.held = {"k": "noodle", "s": "raw"}
        self.room.interact(1)
        self.assertIsNone(self.p.held)
        self.room.step(engine.COOK_SECONDS["noodle"] + 0.1)
        self.assertEqual(self.room.items[(6, 3)]["s"], "cooked")
        self.room.step(engine.BURN_AFTER + 0.1)
        self.assertEqual(self.room.items[(6, 3)]["s"], "burnt")

    def test_picking_half_cooked_returns_raw(self):
        self.p.held = {"k": "egg", "s": "raw"}
        self.room.interact(1)
        self.room.step(1.0)
        self.room.interact(1)
        self.assertEqual(self.p.held, {"k": "egg", "s": "raw"})

    def test_cooked_item_only_goes_on_a_plate_or_counter_not_back_on_the_stove(self):
        self.p.held = {"k": "noodle", "s": "raw"}
        self.room.interact(1)
        self.room.step(engine.COOK_SECONDS["noodle"] + 0.1)
        self.room.interact(1)
        self.assertEqual(self.p.held, {"k": "noodle", "s": "cooked"})
        self.room.interact(1)
        self.assertNotIn((6, 3), self.room.items)               # 익힌 면은 화구에 다시 못 올린다
        self.assertEqual(self.p.held["s"], "cooked")

    def test_chopping_needs_the_key_held_at_the_board(self):
        put(self.room, 1, 2, 4)                          # (2,3)은 도마
        self.p.held = {"k": "scallion", "s": "raw"}
        self.room.interact(1)
        self.room.step(engine.CHOP_SECONDS + 1)
        self.assertEqual(self.room.items[(2, 3)]["s"], "raw")      # 누르지 않으면 진행 안 됨
        self.room.set_chop(1, True)
        self.room.step(engine.CHOP_SECONDS + 0.1)
        self.assertEqual(self.room.items[(2, 3)]["s"], "chopped")

    def test_only_scallion_goes_on_the_board_and_trash_empties_hands(self):
        put(self.room, 1, 2, 4)
        self.p.held = {"k": "egg", "s": "raw"}
        self.room.interact(1)
        self.assertNotIn((2, 3), self.room.items)
        put(self.room, 1, 10, 1)                         # (10,0)은 쓰레기통
        self.room.interact(1)
        self.assertIsNone(self.p.held)


class PlateAndServeTests(SimpleTestCase):
    def setUp(self):
        self.room = room_with("a")
        self.room.start(1)
        self.room.orders = [{"id": 1, "name": "계란라면", "items": ["noodle_cooked", "egg_cooked"], "pts": 35, "ttl": 50.0, "max": 75.0}]
        self.p = put(self.room, 1, 4, 4)                 # (4,3)은 조리대
        self.room.items[(4, 3)] = {"k": "noodle", "s": "cooked"}

    def test_plate_collects_each_ingredient_once(self):
        self.p.held = {"k": "plate", "c": []}
        self.room.interact(1)
        self.assertEqual(self.p.held["c"], ["noodle_cooked"])
        self.room.items[(4, 3)] = {"k": "noodle", "s": "cooked"}
        self.room.interact(1)
        self.assertEqual(self.p.held["c"], ["noodle_cooked"])      # 같은 재료는 두 번 못 담는다
        self.room.items[(4, 3)] = {"k": "egg", "s": "raw"}
        self.room.interact(1)
        self.assertEqual(self.p.held["c"], ["noodle_cooked"])      # 날 재료는 못 담는다

    def test_holding_ingredient_adds_it_to_a_plate_on_the_counter(self):
        self.room.items[(4, 3)] = {"k": "plate", "c": ["noodle_cooked"]}
        self.p.held = {"k": "egg", "s": "cooked"}
        self.room.interact(1)
        self.assertIsNone(self.p.held)
        self.assertEqual(sorted(self.room.items[(4, 3)]["c"]), ["egg_cooked", "noodle_cooked"])

    def test_serving_the_right_plate_scores_and_wrong_plate_is_rejected(self):
        put(self.room, 1, 11, 1)                         # (11,0)은 서빙 창구
        self.p.held = {"k": "plate", "c": ["noodle_cooked"]}
        self.room.interact(1)
        self.assertEqual(self.room.score, 0)
        self.assertIsNotNone(self.p.held)
        self.assertEqual(self.room.events[-1]["t"], "reject")
        self.p.held = {"k": "plate", "c": ["egg_cooked", "noodle_cooked"]}
        self.room.interact(1)
        self.assertEqual(self.room.score, 35)
        self.assertIsNone(self.p.held)
        self.assertEqual(self.room.orders, [])
        self.assertEqual(self.room.events[-1]["t"], "serve")

    def test_empty_plate_is_not_served(self):
        put(self.room, 1, 11, 1)
        self.p.held = {"k": "plate", "c": []}
        self.room.interact(1)
        self.assertEqual(self.room.events, [])


class TimeAndOrderTests(SimpleTestCase):
    def test_orders_expire_with_penalty_and_new_ones_arrive(self):
        room = room_with("a")
        room.start(1)
        room.score = 12
        first = len(room.orders)
        room.step(engine.ORDER_TTL + 1)
        self.assertEqual(room.score, 12 - engine.EXPIRE_PENALTY * first)     # 만료된 주문마다 감점
        self.assertLessEqual(len(room.orders), engine.MAX_ACTIVE_ORDERS)
        self.assertGreaterEqual(first, 2)

    def test_penalty_never_goes_below_zero(self):
        room = room_with("a")
        room.start(1)
        room.step(engine.ORDER_TTL + 1)
        self.assertEqual(room.score, 0)

    def test_game_ends_with_stars_and_stops_stepping(self):
        room = room_with("a", "b")
        room.start(1)
        room.score = 1000          # 만료 감점이 있어도 충분히 큰 값
        events = []
        for _ in range(int(engine.GAME_SECONDS / 5) + 2):
            events += room.step(5.0)
        self.assertEqual(room.phase, "done")
        end = [e for e in events if e["t"] == "end"]
        self.assertEqual(len(end), 1)
        self.assertEqual(end[0]["stars"], 3)
        self.assertEqual(room.step(1.0), [])
        self.assertTrue(room.back_to_lobby(1)[0])
        self.assertEqual((room.phase, room.score, room.orders), ("lobby", 0, []))

    def test_stars_scale_with_the_number_of_players(self):
        for names, expected in ((("a",), 1), (("a", "b"), 0)):
            room = room_with(*names)
            room.start(1)
            room.score = 60
            self.assertEqual(room.stars(), expected)             # 같은 점수라도 사람이 많으면 기준이 높다

    def test_more_players_get_orders_more_often(self):
        self.assertLess(engine.order_interval(4), engine.order_interval(1))
        self.assertGreaterEqual(engine.order_interval(100), 7.0)

    def test_snapshot_is_json_friendly(self):
        import json

        room = room_with("a")
        room.start(1)
        room.items[(6, 3)] = {"k": "noodle", "s": "cooking", "p": 3.0}
        shot = room.snapshot()
        json.dumps(shot)
        self.assertEqual(shot["items"][0]["item"]["p"], 0.5)


class HubTests(SimpleTestCase):
    def tearDown(self):
        kitchen_hub.ROOMS.clear()
        kitchen_hub.USER_ROOM.clear()

    def test_create_join_leave_and_codes(self):
        _, room = kitchen_hub.create_room(1, "a")
        self.assertEqual(len(room.code), 4)
        self.assertFalse(kitchen_hub.join_room(2, "b", "ZZZZ")[0])
        ok, joined = kitchen_hub.join_room(2, "b", room.code.lower())
        self.assertTrue(ok)
        self.assertIs(joined, room)
        _, other = kitchen_hub.create_room(2, "b")               # 다른 방을 만들면 이전 방에서 나온다
        self.assertNotIn(2, room.players)
        kitchen_hub.leave(1)
        self.assertNotIn(room.code, kitchen_hub.ROOMS)           # 비면 방이 사라진다
        self.assertIn(other.code, kitchen_hub.ROOMS)

    def test_disconnect_in_lobby_leaves_but_during_play_keeps_the_character(self):
        _, room = kitchen_hub.create_room(1, "a")
        kitchen_hub.join_room(2, "b", room.code)
        kitchen_hub.disconnect(2)
        self.assertNotIn(2, room.players)
        kitchen_hub.join_room(2, "b", room.code)
        room.start(1)
        kitchen_hub.disconnect(2)
        self.assertFalse(room.players[2].connected)
        self.assertTrue(kitchen_hub.join_room(2, "b", room.code)[0])    # 돌아오면 이어서
        self.assertTrue(room.players[2].connected)


class SocketTests(TestCase):
    databases = {"default", "beta_judge"}

    def tearDown(self):
        kitchen_hub.ROOMS.clear()
        kitchen_hub.USER_ROOM.clear()
        if kitchen_hub._loop_task:
            kitchen_hub._loop_task.cancel()

    async def connect(self, name):
        user = await sync_to_async(User.objects.create_user)(username=name, password="x")
        comm = WebsocketCommunicator(consumers.KitchenConsumer.as_asgi(), "/ws/kitchen/")
        comm.scope["user"] = user
        self.assertTrue((await comm.connect())[0])
        return user, comm

    async def until(self, comm, kind, tries=12):
        for _ in range(tries):
            msg = await comm.receive_json_from()
            if msg["type"] == kind:
                return msg
        self.fail(f"{kind} 메시지를 받지 못했다")

    async def test_two_players_join_start_and_move_over_the_socket(self):
        host, a = await self.connect("kh")
        guest, b = await self.connect("kg")
        self.assertIsNone((await self.until(a, "hello"))["room"])
        await a.send_json_to({"type": "create"})
        hello = await self.until(a, "hello")
        code = hello["room"]
        self.assertEqual(len(hello["map"]), engine.H)
        await b.send_json_to({"type": "join", "code": "nope"})
        self.assertEqual((await self.until(b, "error"))["type"], "error")
        await b.send_json_to({"type": "join", "code": code})
        state = await self.until(a, "state")
        while len(state["state"]["players"]) < 2:
            state = await self.until(a, "state")
        await b.send_json_to({"type": "start"})
        self.assertEqual((await self.until(b, "error"))["type"], "error")      # 방장이 아니다
        await a.send_json_to({"type": "start"})
        state = await self.until(a, "state")
        while state["state"]["phase"] != "playing":
            state = await self.until(a, "state")
        await a.send_json_to({"type": "input", "dx": 1, "dy": 0})
        x0 = next(p for p in state["state"]["players"] if p["id"] == host.id)["x"]
        for _ in range(8):
            state = await self.until(a, "state")
            if next(p for p in state["state"]["players"] if p["id"] == host.id)["x"] > x0:
                break
        else:
            self.fail("캐릭터가 움직이지 않았다")
        await a.disconnect()
        await b.disconnect()

    async def test_anonymous_users_are_rejected(self):
        from django.contrib.auth.models import AnonymousUser

        comm = WebsocketCommunicator(consumers.KitchenConsumer.as_asgi(), "/ws/kitchen/")
        comm.scope["user"] = AnonymousUser()
        self.assertFalse((await comm.connect())[0])


class PlaythroughTests(SimpleTestCase):
    """스크립트 플레이어가 길을 찾아 주문을 처음부터 끝까지 만든다: 맵이 막히지 않았고 제한시간 안에 가능한지 본다."""

    def go(self, room, uid, target, face):
        p = room.players[uid]
        prev = {(p.x, p.y): None}
        queue = [(p.x, p.y)]
        while queue and target not in prev:
            x, y = queue.pop(0)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (x + dx, y + dy)
                if n not in prev and engine.tile_at(*n) == ".":
                    prev[n] = (x, y)
                    queue.append(n)
        self.assertIn(target, prev, f"{target}에 갈 수 없다")
        path, cur = [], target
        while prev[cur] is not None:
            path.append(cur)
            cur = prev[cur]
        for nx, ny in reversed(path):
            room.set_input(uid, nx - p.x, ny - p.y)
            for _ in range(40):
                room.step(0.05)
                if (p.x, p.y) == (nx, ny):
                    break
            self.assertEqual((p.x, p.y), (nx, ny))
        room.set_input(uid, *face)
        room.step(0.02)
        room.set_input(uid, 0, 0)

    def test_solo_player_serves_a_full_order_in_time(self):
        room = room_with("solo")
        room.start(1)
        room.orders = [{"id": 99, "name": "풀세트라면", "items": ["noodle_cooked", "egg_cooked", "scallion_chopped"], "pts": 55, "ttl": engine.ORDER_TTL, "max": engine.ORDER_TTL}]
        room.next_order_in = 999                     # 다른 주문이 끼어들지 않게
        up = (0, -1)
        go, act = lambda target, face=up: self.go(room, 1, target, face), lambda: room.interact(1)
        go((1, 1)); act()                            # 면을 집어
        go((6, 4)); act()                            # 화구에 올린다
        go((3, 1)); act()                            # 달걀
        go((7, 4)); act()                            # 다른 화구
        go((5, 1)); act()                            # 파
        go((2, 4)); act()                            # 도마에 올리고
        room.set_chop(1, True)
        for _ in range(int(engine.CHOP_SECONDS / 0.05) + 4):
            room.step(0.05)
        room.set_chop(1, False)
        self.assertEqual(room.items[(2, 3)]["s"], "chopped")
        go((7, 1)); act()                            # 접시를 들고
        go((6, 4)); act()                            # 익은 면
        go((7, 4)); act()                            # 익은 달걀
        go((2, 4)); act()                            # 썬 파
        self.assertEqual(sorted(room.players[1].held["c"]), ["egg_cooked", "noodle_cooked", "scallion_chopped"])
        go((11, 1)); act()                           # 서빙
        self.assertEqual(room.score, 55)
        self.assertEqual(room.orders, [])
        elapsed = engine.GAME_SECONDS - room.time_left
        self.assertLess(elapsed, engine.ORDER_TTL - 10, f"혼자서 가장 어려운 주문에 {elapsed:.0f}초는 너무 오래 걸린다")
