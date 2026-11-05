import math

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
        table = next(x for x in world.SHAPES if x["model"] == "tableRound" and x["cx"] == 16)   # 가운데 광장 탁자
        self.assertEqual((table["cx"], table["cy"]), (16, 16))
        self.assertFalse(world.free_at(16.5, 16.0))
        self.assertTrue(world.free_at(15.0, 17.2))                            # 2×2 칸의 모서리 쪽은 비어 있다

    def test_turned_bench_uses_its_turned_size(self):
        bench = next(x for x in world.SHAPES if x["model"] == "benchCushion" and x["cx"] == 14.5)
        self.assertEqual((bench["cx"], bench["cy"]), (14.5, 15.5))            # 1×1 칸의 가운데
        self.assertLess(bench["hx"], bench["hy"])                            # 돌려서 세로로 길다
        self.assertTrue(world.free_at(14.5, 15.5 - bench["hy"] - 0.31))
        self.assertFalse(world.free_at(14.5, 15.5 - bench["hy"] - 0.25))

    def test_zone_walls_block_except_at_their_doors(self):
        self.assertFalse(world.free_at(12.0, 3.0))                            # 도서관 동쪽 벽
        self.assertTrue(world.free_at(12.0, 6.0))                             # 그 벽의 문
        self.assertFalse(world.free_at(25.0, 20.0))                           # 창고 북쪽 벽
        self.assertTrue(world.free_at(26.0, 20.0))
        pieces = world.wall_pieces()
        self.assertNotIn(("v", 12, 5), pieces)                               # 문 칸에는 벽 조각을 그리지 않는다
        self.assertIn(("v", 12, 4), pieces)

    def test_every_open_spot_is_reachable_from_the_plaza(self):
        walk = world.walkable()
        seen = world.grid_dist([(15.5, 19.5)])
        open_nodes = {(i, j) for i in range(world.GRID_N) for j in range(world.GRID_N) if walk[i][j]}
        self.assertEqual(open_nodes - set(seen), set())
        for x, y in world.THIEF_SPAWNS + world.COP_SPAWNS + [(world.PAD["cx"], world.PAD["cy"])]:
            self.assertIn(world._node(x, y), seen)

    def test_paths_go_through_doors(self):
        path = world.find_path(6.0, 6.0, 6.0, 26.0)                          # 도서관 → 라운지 (벽 너머)
        self.assertTrue(path)
        self.assertEqual(path[-1], (6.0, 26.0))
        self.assertTrue(all(world.free_at(x, y) for x, y in path))
        crossings = [x for (x, y0), (_, y1) in zip(path, path[1:]) if y0 < 12 <= y1]
        self.assertTrue(crossings and 5 <= crossings[0] <= 7)                  # 도서관 남쪽 문으로 나간다

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
        far.players[2].x, far.players[2].y = 14.5, 17.6
        self.assertFalse(far.move(2, 15.6, 16.6, 0, True, now=10))                # 탁자 안으로는 못 들어간다
        self.assertTrue(far.move(2, 14.6, 17.5, 0, True, now=10.5))
        far.players[2].x, far.players[2].y = 11.448, 22.931                        # 라운지 의자와 옷걸이 사이 좁은 틈
        self.assertTrue(far.move(2, 11.209, 23.009, 0, True, now=10.6))           # 밀어낸 위치를 반올림해 보내도 받는다
        far.players[2].x, far.players[2].y = 11.5, 3.0
        self.assertFalse(far.move(2, 12.5, 3.0, 0, True, now=11))                 # 벽은 뚫고 지나갈 수 없다


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
        self.assertTrue(t.public(10.3)["dashing"])                                   # 다른 사람 화면에도 대시가 보이도록 알린다
        self.assertFalse(t.public(10.0 + world.DASH_SECONDS + 0.01)["dashing"])
        self.assertFalse(room.dash(t.uid, now=11.0))                                 # 쿨타임

    def test_cops_leaving_ends_the_round(self):
        room, cop, thieves = self.playing()
        room.remove(cop.uid, now=world.COUNTDOWN + 1)
        self.assertEqual(room.result["winner"], "thief")


class BotTests(SimpleTestCase):
    def solo(self, bots=1):
        room = world.Room("SOLO", 1)
        room.add(1, "me", now=0)
        for _ in range(bots):
            self.assertLess(room.add_bot(1, now=0), 0)
        room.rng.seed(4)
        return room

    def run_until(self, room, done, start, limit=90.0):
        t = start
        while t < start + limit and not done():
            t += 0.1
            room.update(now=t)
        return t

    def test_only_the_host_adds_bots_in_the_lobby(self):
        room = self.solo(bots=0)
        room.add(2, "friend", now=0)
        self.assertIsInstance(room.add_bot(2, now=0), str)
        bot = room.add_bot(1, now=0)
        self.assertTrue(room.players[bot].bot)
        self.assertTrue(room.remove_bot(1))
        self.assertFalse(any(p.bot for p in room.players.values()))
        self.assertFalse(room.remove_bot(1))

    def test_one_person_and_a_bot_can_play_and_a_cop_bot_catches(self):
        room = self.solo(bots=1)
        room.update(now=0)
        self.assertTrue(room.start(1, now=0)[0])
        me, bot = room.players[1], next(p for p in room.players.values() if p.bot)
        me.team, bot.team = "thief", "cop"                          # 나는 가만히 있는 도둑, 봇은 경찰
        bot.frozen_until = 0
        me.x, me.y = 3.5, 19.5
        bot.x, bot.y = 15.5, 19.5
        t = self.run_until(room, lambda: me.jailed, 0.1)
        self.assertTrue(me.jailed, "경찰 봇이 도둑을 잡지 못했다")
        self.assertLess(t, 30)
        self.assertEqual(room.result["winner"], "cop")

    def test_thief_bot_runs_away_and_comes_to_rescue(self):
        room = self.solo(bots=2)
        room.update(now=0)
        room.start(1, now=0)
        me = room.players[1]
        bots = [p for p in room.players.values() if p.bot]
        me.team = "cop"
        for b in bots:
            b.team = "thief"
        jailed, runner = bots
        jailed.jailed = True
        jailed.x, jailed.y = world.JAIL_SPOTS[0]
        me.x, me.y = 2.5, 30.5                                       # 경찰(나)은 멀리 라운지 구석에 가만히 있다
        runner.x, runner.y = 10.5, 19.5
        self.run_until(room, lambda: not jailed.jailed, 0.1, limit=40)
        self.assertFalse(jailed.jailed, "도둑 봇이 구출하러 가지 않았다")
        me.x, me.y = runner.x + 1.2, runner.y
        d0 = math.hypot(me.x - runner.x, me.y - runner.y)
        t = room.last_update
        self.run_until(room, lambda: False, t, limit=1.0)
        self.assertGreater(math.hypot(me.x - runner.x, me.y - runner.y), d0)     # 가까이 온 경찰에게서 멀어진다

    def test_cop_bot_walks_around_a_wall_to_reach_a_thief(self):
        room = self.solo(bots=1)
        room.update(now=0)
        room.start(1, now=0)
        me, bot = room.players[1], next(p for p in room.players.values() if p.bot)
        me.team, bot.team = "thief", "cop"
        bot.frozen_until = 0.0
        bot.x, bot.y = 14.0, 3.0                                     # 벽 바로 바깥 (도서관 동쪽 벽 x=12)
        me.x, me.y = 10.5, 3.0                                       # 벽 안쪽, 문은 y 5~7
        self.run_until(room, lambda: me.jailed, room.last_update or 0.1, limit=20)
        self.assertTrue(me.jailed, "경찰 봇이 벽을 돌아 문으로 들어오지 못했다")

    def test_bots_never_end_up_inside_anything(self):
        room = self.solo(bots=5)
        room.update(now=0)
        room.start(1, now=0)
        t = 0.0
        for _ in range(600):
            t += 0.1
            room.update(now=t)
            for p in room.players.values():
                self.assertTrue(world.free_at(p.x, p.y), (p.name, p.x, p.y))


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

    def test_room_list_hides_private_rooms_and_rooms_left_to_bots(self):
        public = hub.create_room(1, "a", "다같이")
        hub.create_room(2, "b", "비밀", private=True)
        self.assertEqual([r["name"] for r in hub.list_rooms()], ["다같이"])
        public.add_bot(1, now=0)
        self.assertEqual(hub.list_rooms()[0]["bots"], 1)
        hub.leave(1)                                                      # 봇만 남으면 방이 없어진다
        self.assertNotIn(public.code, hub.ROOMS)

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
        self.assertEqual(self.client.get(reverse("cops_robbers")).status_code, 302)
        self.client.force_login(User.objects.create_user("walker", password="pw"))
        res = self.client.get(reverse("cops_robbers"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "ut-world")
        self.assertContains(self.client.get(reverse("game_lobby")), reverse("cops_robbers"))
