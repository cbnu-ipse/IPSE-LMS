from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from . import untitled_hub as hub
from . import untitled_world as world

User = get_user_model()


class WorldTests(SimpleTestCase):
    def test_props_block_only_their_real_shape(self):
        lamp = next(x for x in world.SHAPES if x["model"] == "lampSquareFloor")
        self.assertEqual(lamp["kind"], "circle")
        self.assertFalse(world.free_at(lamp["cx"] + 0.3, lamp["cy"]))          # 조명 바로 옆은 막힌다
        self.assertTrue(world.free_at(lamp["cx"] - 0.45, lamp["cy"] - 0.45))   # 같은 칸이어도 구석은 지나갈 수 있다 (예전엔 칸 전체가 막혔다)
        self.assertTrue(all(world.free_at(x, y) for x, y in world.SPAWNS))
        self.assertFalse(world.free_at(0.1, 5))                               # 광장 밖으로 몸이 나간다

    def test_round_table_is_a_circle(self):
        table = next(x for x in world.SHAPES if x["model"] == "tableRound")
        self.assertEqual((table["cx"], table["cy"]), (8, 8))
        self.assertFalse(world.free_at(8.5, 8.0))
        self.assertTrue(world.free_at(7.0, 9.2))                              # 2×2 칸의 모서리 쪽은 비어 있다

    def test_turned_sofa_uses_its_turned_size(self):
        sofa = next(x for x in world.SHAPES if x["model"] == "loungeSofa")
        self.assertEqual((sofa["cx"], sofa["cy"]), (1.5, 7.0))                # 1×2 칸의 가운데
        self.assertLess(sofa["hx"], sofa["hy"])                              # 돌려서 세로로 길다
        self.assertTrue(world.free_at(1.5, 7.0 - sofa["hy"] - 0.31))
        self.assertFalse(world.free_at(1.5, 7.0 - sofa["hy"] - 0.25))

    def test_room_fills_up_and_hands_over_host(self):
        room = world.Room("ABCD", 1)
        for uid in range(1, world.MAX_PLAYERS + 1):
            self.assertTrue(room.add(uid, f"p{uid}", now=0)[0])
        self.assertFalse(room.add(99, "late", now=0)[0])
        self.assertEqual(len({p.model for p in room.players.values()}), world.MAX_PLAYERS)   # 모두 다른 캐릭터
        room.remove(1)
        self.assertEqual(room.host_id, 2)

    def test_moves_are_checked_for_speed_and_obstacles(self):
        room = world.Room("ABCD", 1)
        room.add(1, "me", now=0)
        p = room.players[1]
        x0, y0 = p.x, p.y
        self.assertTrue(room.move(1, x0, y0 - 0.3, 3.1, True, now=0.1))
        self.assertFalse(room.move(1, x0, y0 - 9, 3.1, True, now=0.2))          # 순간이동
        self.assertEqual((round(p.x, 3), round(p.y, 3)), (round(x0, 3), round(y0 - 0.3, 3)))
        self.assertFalse(room.move(1, "nan", 3, 0, True, now=0.3))
        self.assertFalse(room.move(1, None, 3, 0, True, now=0.3))
        far = world.Room("EFGH", 2)
        far.add(2, "x", now=0)
        far.players[2].x, far.players[2].y = 6.5, 9.6
        self.assertFalse(far.move(2, 7.6, 8.6, 0, True, now=10))                  # 탁자 안으로는 못 들어간다
        self.assertTrue(far.move(2, 6.6, 9.5, 0, True, now=10.5))


class HubTests(SimpleTestCase):
    def setUp(self):
        self.addCleanup(hub.ROOMS.clear)
        self.addCleanup(hub.USER_ROOM.clear)

    def test_create_join_leave(self):
        room = hub.create_room(1, "a")
        ok, same = hub.join_room(2, "b", room.code.lower())
        self.assertTrue(ok)
        self.assertIs(same, room)
        self.assertEqual(set(room.players), {1, 2})
        self.assertFalse(hub.join_room(3, "c", "ZZZZ")[0])
        hub.leave(1)
        hub.leave(2)
        self.assertNotIn(room.code, hub.ROOMS)

    def test_creating_a_new_room_leaves_the_old_one(self):
        first = hub.create_room(1, "a")
        second = hub.create_room(1, "a")
        self.assertNotIn(first.code, hub.ROOMS)
        self.assertIs(hub.room_of(1), second)

    def test_disconnect_keeps_the_character_for_a_reconnect(self):
        room = hub.create_room(1, "a")
        hub.disconnect(1)
        self.assertFalse(room.players[1].connected)
        self.assertIsNotNone(room.idle_since)
        ok, again = hub.join_room(1, "a", room.code)
        self.assertTrue(again.players[1].connected)
        self.assertIsNone(again.idle_since)


class PageTests(TestCase):
    def test_page_needs_login_and_lists_the_map(self):
        self.assertEqual(self.client.get(reverse("untitled")).status_code, 302)
        self.client.force_login(User.objects.create_user("walker", password="pw"))
        res = self.client.get(reverse("untitled"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "ut-world")
        self.assertContains(self.client.get(reverse("game_lobby")), reverse("untitled"))
