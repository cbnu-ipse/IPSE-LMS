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
        self.assertTrue(all(world.free_at(x, y) for x, y in world.LOBBY_SPAWNS + world.COP_SPAWNS + world.THIEF_SPAWNS))
        self.assertFalse(world.free_at(0.1, 5))                               # 광장 밖으로 몸이 나간다

    def test_round_table_is_a_circle(self):
        table = next(x for x in world.SHAPES if x["model"] == "tableRound")
        self.assertEqual((table["cx"], table["cy"]), (11, 11))
        self.assertFalse(world.free_at(11.5, 11.0))
        self.assertTrue(world.free_at(10.0, 12.2))                            # 2×2 칸의 모서리 쪽은 비어 있다

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
        far.players[2].x, far.players[2].y = 9.5, 12.6
        self.assertFalse(far.move(2, 10.6, 11.6, 0, True, now=10))                # 탁자 안으로는 못 들어간다
        self.assertTrue(far.move(2, 9.6, 12.5, 0, True, now=10.5))


class CopsAndRobbersTests(SimpleTestCase):
    def room(self, n=3):
        room = world.Room("COPS", 1)
        for uid in range(1, n + 1):
            room.add(uid, f"p{uid}", now=0)
        room.rng.seed(1)
        return room

    def playing(self, n=3):
        room = self.room(n)
        self.assertTrue(room.start(1, now=0)[0])
        room.update(now=world.COUNTDOWN + 0.01)
        self.assertEqual(room.phase, "playing")
        cop = next(p for p in room.players.values() if p.team == "cop")
        thieves = [p for p in room.players.values() if p.team == "thief"]
        return room, cop, thieves

    def test_only_the_host_starts_with_two_or_more(self):
        room = self.room(1)
        self.assertFalse(room.start(1, now=0)[0])
        room.add(2, "b", now=0)
        self.assertFalse(room.start(2, now=0)[0])
        self.assertTrue(room.start(1, now=0)[0])
        teams = [p.team for p in room.players.values()]
        self.assertEqual(teams.count("cop"), 1)
        cop = next(p for p in room.players.values() if p.team == "cop")
        self.assertGreater(cop.frozen_until, world.COUNTDOWN)                 # 경찰은 도둑보다 늦게 출발한다
        self.assertFalse(room.move(cop.uid, cop.x + 0.1, cop.y, 0, True, now=1))

    def test_a_touched_thief_goes_to_jail_and_cannot_walk_out(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = t.x + 0.5, t.y
        room.update(now=now)
        self.assertTrue(t.jailed)
        self.assertTrue(world.in_jail(t.x, t.y))
        self.assertEqual(t.tp, 2)                                           # 시작할 때 한 번, 잡혀서 한 번
        self.assertEqual(cop.catches, 1)
        self.assertFalse(room.move(t.uid, world.JAIL_X - 0.5, t.y, 0, True, now=now + 5))   # 울타리 밖으로는 못 나간다

    def test_stepping_on_the_pad_frees_everyone(self):
        room, cop, thieves = self.playing()
        jailed, hero = thieves
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = jailed.x + 0.4, jailed.y
        room.update(now=now)
        self.assertTrue(jailed.jailed)
        cop.x, cop.y = 2, 2
        hero.x, hero.y = world.PAD["cx"], world.PAD["cy"]
        room.update(now=now + 1)
        self.assertFalse(jailed.jailed)
        self.assertFalse(world.in_jail(jailed.x, jailed.y))
        cop.x, cop.y = jailed.x + 0.3, jailed.y
        room.update(now=now + 2)
        self.assertFalse(jailed.jailed)                                       # 풀려난 직후 잠깐은 안 잡힌다

    def test_cops_win_when_every_thief_is_jailed(self):
        room, cop, thieves = self.playing()
        now = world.COUNTDOWN + world.HEAD_START + 1
        for t in thieves:
            cop.x, cop.y = t.x + 0.3, t.y
            room.update(now=now)
        self.assertEqual(room.phase, "result")
        self.assertEqual(room.result["winner"], "cop")
        room.update(now=now + world.RESULT_SECONDS + 0.1)
        self.assertEqual(room.phase, "lobby")
        self.assertTrue(all(p.team is None and not p.jailed for p in room.players.values()))

    def test_thieves_win_when_time_runs_out(self):
        room, cop, thieves = self.playing()
        room.update(now=world.COUNTDOWN + world.ROUND_SECONDS + 1)
        self.assertEqual(room.result["winner"], "thief")

    def test_dash_lets_you_cover_more_ground_once_per_cooldown(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        t.x, t.y, t.last = 5.5, 19.5, 10.0
        self.assertFalse(room.move(t.uid, 5.5 + 1.6, 19.5, 0, True, now=10.15))     # 대시 없이는 너무 멀다
        t.last = 10.0
        self.assertTrue(room.dash(t.uid, now=10.0))
        self.assertTrue(room.move(t.uid, 5.5 + 1.6, 19.5, 0, True, now=10.15))
        self.assertFalse(room.dash(t.uid, now=11.0))                                 # 쿨타임

    def test_cops_leaving_ends_the_round(self):
        room, cop, thieves = self.playing()
        room.remove(cop.uid, now=world.COUNTDOWN + 1)
        self.assertEqual(room.result["winner"], "thief")


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
