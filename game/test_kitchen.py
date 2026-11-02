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


def playing(*names):
    room = room_with(*names)
    room.start(1)
    room.seats = [None] * engine.SEATS          # 손님이 끼어들지 않게 비워 두고 필요한 것만 넣는다
    room.next_customer_in = 999
    return room


def customer(items, name="주문", pts=35, patience=50.0, maximum=55.0):
    return {"id": 1, "name": name, "items": list(items), "pts": pts, "patience": patience, "max": maximum}


class RoomTests(SimpleTestCase):
    def test_room_limits_and_lobby_rules(self):
        room = room_with("a", "b", "c", "d")
        self.assertFalse(room.add_player(5, "e")[0])
        self.assertTrue(room.add_player(1, "a")[0])              # 이미 있는 사람은 재접속으로 본다
        self.assertFalse(room.start(2)[0])                       # 방장만 시작
        self.assertTrue(room.start(1)[0])
        self.assertFalse(room.add_player(9, "late")[0])          # 시작한 뒤에는 새로 못 들어온다
        self.assertEqual(room.targets, [t * 4 for t in engine.STAR_TARGETS])

    def test_solo_can_start_and_gets_two_customers(self):
        room = room_with("solo")
        self.assertTrue(room.start(1)[0])
        self.assertEqual(sum(1 for c in room.seats if c), 2)

    def test_host_moves_on_when_the_host_leaves(self):
        room = room_with("a", "b")
        room.remove_player(1)
        self.assertEqual(room.host_id, 2)

    def test_clicks_are_ignored_outside_a_running_game_and_for_strangers(self):
        room = room_with("a")
        room.click(1, "crate:noodle")
        self.assertIsNone(room.players[1].hand)                  # 대기실
        room.start(1)
        room.click(99, "crate:noodle")
        room.click(1, "pot:9")
        room.click(1, "wat:1")
        room.click(1, "crate:gold")
        room.click(1, "slot:-1")
        self.assertIsNone(room.players[1].hand)


class HandTests(SimpleTestCase):
    def setUp(self):
        self.room = playing("a", "b")
        self.a, self.b = self.room.players[1], self.room.players[2]

    def test_crates_fill_an_empty_hand_only_and_each_player_has_their_own_hand(self):
        self.room.click(1, "crate:noodle")
        self.room.click(1, "crate:egg")
        self.assertEqual(self.a.hand, {"k": "noodle", "s": "raw"})
        self.assertIsNone(self.b.hand)
        self.room.click(2, "bowls")
        self.assertEqual(self.b.hand, {"k": "bowl", "c": []})

    def test_trash_empties_the_hand(self):
        self.room.click(1, "crate:egg")
        self.room.click(1, "trash")
        self.assertIsNone(self.a.hand)
        self.assertEqual(self.room.events[-1]["t"], "trash")

    def test_scallion_goes_straight_onto_a_bowl_in_hand_once(self):
        self.room.click(1, "bowls")
        self.room.click(1, "crate:scallion")
        self.room.click(1, "crate:scallion")
        self.assertEqual(self.a.hand["c"], ["scallion"])


class CookingTests(SimpleTestCase):
    def setUp(self):
        self.room = playing("a")
        self.p = self.room.players[1]

    def test_noodle_cooks_then_burns(self):
        self.room.click(1, "crate:noodle")
        self.room.click(1, "pot:0")
        self.assertIsNone(self.p.hand)
        self.room.step(engine.COOK_SECONDS["noodle"] + 0.1)
        self.assertEqual(self.room.pots[0]["s"], "cooked")
        self.room.step(engine.BURN_AFTER + 0.1)
        self.assertEqual(self.room.pots[0]["s"], "burnt")

    def test_only_raw_noodle_or_egg_go_in_a_pot_and_scallion_does_not(self):
        self.room.click(1, "crate:scallion")
        self.room.click(1, "pot:0")
        self.assertIsNone(self.room.pots[0])
        self.assertEqual(self.p.hand["k"], "scallion")

    def test_picking_a_half_cooked_item_returns_it_raw(self):
        self.room.click(1, "crate:egg")
        self.room.click(1, "pot:1")
        self.room.step(1.0)
        self.room.click(1, "pot:1")
        self.assertEqual(self.p.hand, {"k": "egg", "s": "raw"})
        self.assertIsNone(self.room.pots[1])

    def test_cooked_item_cannot_go_back_into_a_pot(self):
        self.room.click(1, "crate:noodle")
        self.room.click(1, "pot:0")
        self.room.step(engine.COOK_SECONDS["noodle"] + 0.1)
        self.room.click(1, "pot:0")
        self.assertEqual(self.p.hand, {"k": "noodle", "s": "cooked"})
        self.room.click(1, "pot:1")
        self.assertIsNone(self.room.pots[1])

    def test_burnt_food_can_be_picked_up_and_thrown_away(self):
        self.room.click(1, "crate:noodle")
        self.room.click(1, "pot:0")
        for _ in range(int((engine.COOK_SECONDS["noodle"] + engine.BURN_AFTER + 1) / 0.2)):      # 실제 틱(0.2초)대로 진행
            self.room.step(0.2)
        self.room.click(1, "pot:0")
        self.assertEqual(self.p.hand["s"], "burnt")
        self.room.click(1, "slot:0")                                  # 그릇에는 담기지 않는다
        self.assertIsNone(self.room.slots[0])
        self.room.click(1, "trash")
        self.assertIsNone(self.p.hand)

    def test_ding_and_burnt_events_are_reported(self):
        self.room.click(1, "crate:egg")
        self.room.click(1, "pot:0")
        events = self.room.step(engine.COOK_SECONDS["egg"] + 0.1)
        self.assertIn("ding", [e["t"] for e in events])
        events = self.room.step(engine.BURN_AFTER + 0.1)
        self.assertIn("burnt", [e["t"] for e in events])


class BowlAndServeTests(SimpleTestCase):
    def setUp(self):
        self.room = playing("a")
        self.p = self.room.players[1]

    def cooked(self, kind, pot=0):
        self.room.click(1, f"crate:{kind}")
        self.room.click(1, f"pot:{pot}")
        self.room.step(engine.COOK_SECONDS[kind] + 0.1)

    def test_bowl_slots_collect_each_ingredient_once(self):
        self.room.click(1, "bowls")
        self.room.click(1, "slot:2")
        self.assertEqual(self.room.slots[2], {"k": "bowl", "c": []})
        self.cooked("noodle")
        self.room.click(1, "pot:0")
        self.room.click(1, "slot:2")
        self.assertEqual(self.room.slots[2]["c"], ["noodle"])
        self.cooked("noodle", pot=1)
        self.room.click(1, "pot:1")
        self.room.click(1, "slot:2")                                   # 같은 재료는 두 번 못 담는다
        self.assertEqual(self.room.slots[2]["c"], ["noodle"])
        self.assertEqual(self.p.hand, {"k": "noodle", "s": "cooked"})

    def test_raw_ingredients_cannot_be_put_in_a_bowl_but_scallion_can(self):
        self.room.click(1, "bowls")
        self.room.click(1, "slot:0")
        self.room.click(1, "crate:egg")
        self.room.click(1, "slot:0")
        self.assertEqual(self.room.slots[0]["c"], [])
        self.room.click(1, "trash")
        self.room.click(1, "crate:scallion")
        self.room.click(1, "slot:0")
        self.assertEqual(self.room.slots[0]["c"], ["scallion"])

    def test_cooked_item_goes_straight_into_a_bowl_held_in_hand(self):
        self.cooked("noodle")
        # 한 손에는 하나만 들 수 있으므로 그릇을 들고 냄비를 눌러 바로 담는다
        self.room.click(1, "bowls")
        self.room.click(1, "pot:0")
        self.assertEqual(self.p.hand["c"], ["noodle"])
        self.assertIsNone(self.room.pots[0])

    def test_serving_the_right_bowl_scores_with_a_speed_bonus(self):
        self.room.seats[1] = customer(["noodle", "egg"], pts=40, patience=55.0, maximum=55.0)
        self.room.slots[0] = {"k": "bowl", "c": ["egg", "noodle"]}
        self.room.click(1, "slot:0")
        self.room.click(1, "seat:1")
        self.assertEqual(self.room.score, 40 + round(40 * engine.SPEED_BONUS))
        self.assertIsNone(self.room.seats[1])
        self.assertIsNone(self.p.hand)
        self.assertEqual(self.room.events[-1]["t"], "serve")

    def test_a_slower_service_gets_a_smaller_bonus(self):
        self.room.seats[0] = customer(["noodle"], pts=20, patience=11.0, maximum=55.0)
        self.p.hand = {"k": "bowl", "c": ["noodle"]}
        self.room.click(1, "seat:0")
        self.assertEqual(self.room.score, 20 + round(20 * engine.SPEED_BONUS * 11 / 55))

    def test_wrong_empty_or_missing_customer_does_not_serve(self):
        self.room.seats[0] = customer(["noodle", "egg"])
        self.p.hand = {"k": "bowl", "c": ["noodle"]}
        self.room.click(1, "seat:0")
        self.assertEqual((self.room.score, self.room.events[-1]["t"]), (0, "reject"))
        self.assertIsNotNone(self.p.hand)                              # 틀려도 그릇은 손에 남는다
        self.room.events.clear()
        self.room.click(1, "seat:3")                                    # 빈 자리
        self.p.hand = {"k": "bowl", "c": []}
        self.room.click(1, "seat:0")                                    # 빈 그릇
        self.assertEqual(self.room.events, [])

    def test_a_player_can_take_a_bowl_someone_else_prepared(self):
        room = playing("a", "b")
        room.click(1, "bowls")
        room.click(1, "slot:0")
        room.click(2, "slot:0")
        self.assertEqual(room.players[2].hand, {"k": "bowl", "c": []})
        self.assertIsNone(room.slots[0])


class CustomerAndTimeTests(SimpleTestCase):
    def test_impatient_customers_leave_with_a_penalty_that_never_goes_below_zero(self):
        room = playing("a")
        room.seats[0] = customer(["noodle"], patience=3.0)
        room.score = 12
        events = room.step(3.5)
        self.assertEqual(room.score, 12 - engine.LEAVE_PENALTY)
        self.assertIsNone(room.seats[0])
        self.assertIn("leave", [e["t"] for e in events])
        room.score = 2
        room.seats[1] = customer(["noodle"], patience=1.0)
        room.step(1.5)
        self.assertEqual(room.score, 0)

    def test_new_customers_arrive_over_time_but_never_exceed_the_seats(self):
        room = room_with("a")
        room.start(1)
        for _ in range(60):
            room.step(2.0)
            self.assertLessEqual(sum(1 for c in room.seats if c), engine.SEATS)
        self.assertGreater(room.customer_seq, 4)

    def test_game_ends_with_stars_and_stops_stepping(self):
        room = room_with("a", "b")
        room.start(1)
        room.score = 1000
        events = []
        for _ in range(int(engine.GAME_SECONDS / 5) + 2):
            events += room.step(5.0)
        self.assertEqual(room.phase, "done")
        end = [e for e in events if e["t"] == "end"]
        self.assertEqual(len(end), 1)
        self.assertEqual(end[0]["stars"], 3)
        self.assertEqual(room.step(1.0), [])
        room.click(1, "crate:egg")                                       # 끝난 뒤에는 클릭이 먹히지 않는다
        self.assertIsNone(room.players[1].hand)
        self.assertTrue(room.back_to_lobby(1)[0])
        self.assertEqual((room.phase, room.score), ("lobby", 0))
        self.assertEqual(room.seats, [None] * engine.SEATS)

    def test_stars_scale_with_the_number_of_players(self):
        for names, expected in ((("a",), 1), (("a", "b"), 0)):
            room = room_with(*names)
            room.start(1)
            room.score = 70
            self.assertEqual(room.stars(), expected)             # 같은 점수라도 사람이 많으면 기준이 높다

    def test_more_players_get_customers_more_often(self):
        self.assertLess(engine.customer_interval(4), engine.customer_interval(1))
        self.assertGreaterEqual(engine.customer_interval(100), 6.0)

    def test_snapshot_is_json_friendly(self):
        import json

        room = room_with("a")
        room.start(1)
        room.pots[0] = {"k": "noodle", "s": "cooking", "p": 3.0}
        room.click(1, "bowls")
        shot = room.snapshot()
        json.dumps(shot)
        self.assertEqual(shot["pots"][0]["p"], 0.5)
        self.assertEqual(shot["players"][0]["hand"], {"k": "bowl", "c": []})


class PlaythroughTests(SimpleTestCase):
    """클릭만으로 주문을 처음부터 끝까지 만들어 본다: 규칙이 서로 맞물리고 제한시간 안에 충분히 가능한지 본다."""

    def test_one_player_serves_a_full_order_with_only_clicks(self):
        room = playing("solo")
        room.seats[0] = customer(["noodle", "egg", "scallion"], name="풀세트라면", pts=55)
        click = lambda *targets: [room.click(1, t) for t in targets]
        click("crate:noodle", "pot:0", "crate:egg", "pot:1")           # 면과 달걀을 익히기 시작
        click("bowls", "slot:0")                                       # 그릇을 자리에 올려 두고
        room.step(engine.COOK_SECONDS["noodle"] + 0.1)                 # 다 익을 때까지 기다린다
        click("pot:0", "slot:0", "pot:1", "slot:0")                    # 익힌 면·달걀을 그릇에
        click("crate:scallion", "slot:0")                              # 파를 얹고
        patience_left = room.seats[0]["patience"]
        click("slot:0", "seat:0")                                      # 그릇을 들어 손님에게
        self.assertIsNone(room.seats[0])
        self.assertEqual(room.score, 55 + round(55 * engine.SPEED_BONUS * patience_left / 55))
        self.assertGreater(patience_left, engine.PATIENCE / 2)         # 기다리는 시간(조리 6초)이 인내심의 절반도 안 걸린다

    def test_two_players_split_the_work(self):
        room = playing("cook", "waiter")
        room.seats[2] = customer(["noodle", "scallion"], pts=35)
        for target in ("crate:noodle", "pot:0"):
            room.click(1, target)
        for target in ("bowls", "slot:1", "crate:scallion", "slot:1"):    # 서빙 담당은 그릇을 준비하고 파를 올린다
            room.click(2, target)
        room.step(engine.COOK_SECONDS["noodle"] + 0.1)
        for target in ("pot:0", "slot:1"):                                # 조리 담당이 익힌 면을 그릇 자리에
            room.click(1, target)
        for target in ("slot:1", "seat:2"):
            room.click(2, target)
        self.assertGreater(room.score, 35)
        self.assertEqual(room.seats[2], None)


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

    def test_disconnect_in_lobby_leaves_but_during_play_keeps_the_player(self):
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

    async def until(self, comm, kind, tries=15):
        for _ in range(tries):
            msg = await comm.receive_json_from()
            if msg["type"] == kind:
                return msg
        self.fail(f"{kind} 메시지를 받지 못했다")

    async def test_two_players_join_start_and_click_over_the_socket(self):
        host, a = await self.connect("kh")
        guest, b = await self.connect("kg")
        self.assertIsNone((await self.until(a, "hello"))["room"])
        await a.send_json_to({"type": "create"})
        code = (await self.until(a, "hello"))["room"]
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
        self.assertEqual(sum(1 for c in state["state"]["seats"] if c), 2)
        await a.send_json_to({"type": "click", "target": "crate:noodle"})
        for _ in range(10):
            state = await self.until(a, "state")
            mine = next(p for p in state["state"]["players"] if p["id"] == host.id)
            if mine["hand"]:
                break
        else:
            self.fail("클릭이 반영되지 않았다")
        self.assertEqual(mine["hand"], {"k": "noodle", "s": "raw"})
        guest_hand = next(p for p in state["state"]["players"] if p["id"] == guest.id)["hand"]
        self.assertIsNone(guest_hand)                                          # 손은 사람마다 따로
        await a.disconnect()
        await b.disconnect()

    async def test_anonymous_users_are_rejected(self):
        from django.contrib.auth.models import AnonymousUser

        comm = WebsocketCommunicator(consumers.KitchenConsumer.as_asgi(), "/ws/kitchen/")
        comm.scope["user"] = AnonymousUser()
        self.assertFalse((await comm.connect())[0])
