import math

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from . import untitled_hub as hub
from . import untitled_maps as maps
from . import untitled_world as world

User = get_user_model()


CAMPUS = maps.MAPS["campus"]


class MapTests(SimpleTestCase):
    def test_every_map_is_a_rectangle_with_everything_reachable(self):
        self.assertGreaterEqual(len(maps.MAPS), 3)
        for m in maps.MAPS.values():
            with self.subTest(m.key):
                self.assertNotEqual(m.w, m.h)                                   # 정사각형이 아니다
                for x, y in m.lobby_spawns + m.cop_spawns + m.thief_spawns:
                    self.assertTrue(m.free_at(x, y) and not m.in_jail(x, y), (x, y))
                for x, y in m.jail_spots:
                    self.assertTrue(m.free_at(x, y) and m.in_jail(x, y), (x, y))
                self.assertTrue(m.free_at(m.pad["cx"], m.pad["cy"]))
                seen = m.grid_dist([m.cop_spawns[0]])
                open_nodes = {(i, j) for i in range(m.gx) for j in range(m.gy) if m.walk[i][j]}
                self.assertEqual(open_nodes - set(seen), set())                   # 막혀서 못 가는 빈 곳이 없다
                self.assertIn(m.node(m.pad["cx"], m.pad["cy"]), seen)
                self.assertFalse(m.free_at(m.w - 0.1, 5) or m.free_at(5, m.h - 0.1))   # 맵 밖으로 몸이 나간다

    def test_props_block_only_their_real_shape(self):
        lamp = next(x for x in CAMPUS.shapes if x["model"] == "lampSquareFloor")
        self.assertEqual(lamp["kind"], "circle")
        self.assertFalse(CAMPUS.free_at(lamp["cx"] + 0.3, lamp["cy"]))          # 조명 바로 옆은 막힌다
        self.assertTrue(CAMPUS.free_at(lamp["cx"] - 0.45, lamp["cy"] - 0.45))   # 같은 칸이어도 구석은 지나갈 수 있다

    def test_round_table_is_a_circle(self):
        table = next(x for x in CAMPUS.shapes if x["model"] == "tableRound" and x["cx"] == 20)   # 가운데 광장 탁자
        self.assertEqual((table["cx"], table["cy"]), (20, 13))
        self.assertFalse(CAMPUS.free_at(20.5, 13.0))
        self.assertTrue(CAMPUS.free_at(19.0, 14.2))                            # 2×2 칸의 모서리 쪽은 비어 있다

    def test_turned_bench_uses_its_turned_size(self):
        bench = next(x for x in CAMPUS.shapes if x["model"] == "benchCushion" and x["cx"] == 18.5)
        self.assertEqual((bench["cx"], bench["cy"]), (18.5, 12.5))            # 1×1 칸의 가운데
        self.assertLess(bench["hx"], bench["hy"])                            # 돌려서 세로로 길다
        self.assertTrue(CAMPUS.free_at(18.5, 12.5 - bench["hy"] - 0.31))
        self.assertFalse(CAMPUS.free_at(18.5, 12.5 - bench["hy"] - 0.25))
        edge = 18.5 - bench["hx"] - maps.RADIUS
        self.assertTrue(CAMPUS.free_at(edge + 0.0007, 12.5))                 # 밀어낸 위치를 반올림해 보낸 만큼은 봐준다
        self.assertFalse(CAMPUS.free_at(edge + 0.01, 12.5))

    def test_zone_walls_block_except_at_their_doors(self):
        self.assertFalse(CAMPUS.free_at(14.0, 2.0))                           # 도서관 동쪽 벽
        self.assertTrue(CAMPUS.free_at(14.0, 5.0))                            # 그 벽의 문
        self.assertFalse(CAMPUS.free_at(29.0, 16.0))                          # 창고 북쪽 벽
        self.assertTrue(CAMPUS.free_at(32.0, 16.0))
        pieces = CAMPUS.wall_pieces()
        self.assertNotIn(("v", 14, 4), pieces)                               # 문 칸에는 벽 조각을 그리지 않는다
        self.assertIn(("v", 14, 3), pieces)

    def test_paths_go_through_doors(self):
        path = CAMPUS.find_path(4.5, 4.0, 6.5, 21.5)                          # 도서관 → 라운지 (벽 너머)
        self.assertTrue(path)
        self.assertEqual(path[-1], (6.5, 21.5))
        self.assertTrue(all(CAMPUS.free_at(x, y) for x, y in path))
        crossings = [x for (x, y0), (_, y1) in zip(path, path[1:]) if y0 < 10 <= y1]
        self.assertTrue(crossings and 6 <= crossings[0] <= 8)                  # 도서관 남쪽 문으로 나간다

    def test_page_data_has_every_map(self):
        worlds = world.worlds_view()
        self.assertEqual(set(worlds), set(maps.MAPS))
        dorm = worlds["dorm"]
        self.assertEqual((dorm["w"], dorm["h"]), (26, 40))
        self.assertEqual(dorm["jail"], {"x": 22, "y": 4})
        self.assertIn("dash", dorm)


class WorldTests(SimpleTestCase):
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
        bunch = world.Room("BNCH", 3)                                            # 늦게 오다 몰려 온 위치
        bunch.add(3, "b", now=0)
        q = bunch.players[3]
        q.x, q.y, q.last = 16.5, 15.0, 0.0
        self.assertTrue(bunch.move(3, 16.5 - 0.8, 15.0, 0, True, now=0.25))
        self.assertTrue(bunch.move(3, 16.5 - 1.2, 15.0, 0, True, now=0.255))     # 바로 뒤에 붙어 와도 받는다
        self.assertFalse(bunch.move(3, 16.5 - 5.2, 15.0, 0, True, now=2.0))      # 오래 멈춰 있었어도 순간이동은 안 된다
        far = world.Room("EFGH", 2)
        far.add(2, "x", now=0)
        far.players[2].x, far.players[2].y = 19.0, 14.6
        self.assertFalse(far.move(2, 19.9, 13.6, 0, True, now=10))                # 탁자 안으로는 못 들어간다
        self.assertTrue(far.move(2, 19.1, 14.5, 0, True, now=10.5))
        far.players[2].x, far.players[2].y = 13.5, 2.5
        self.assertFalse(far.move(2, 14.5, 2.5, 0, True, now=11))                 # 벽은 뚫고 지나갈 수 없다


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
        self.assertTrue(room.map.in_jail(t.x, t.y))
        self.assertEqual(t.tp, 2)                                           # 시작할 때 한 번, 잡혀서 한 번
        self.assertEqual(cop.catches, 1)
        self.assertFalse(room.move(t.uid, room.map.jail_x - 0.5, t.y, 0, True, now=now + 5))   # 울타리 밖으로는 못 나간다

    def test_stepping_on_the_pad_frees_everyone(self):
        room, cop, thieves = self.playing()
        jailed, hero = thieves
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = jailed.x + 0.4, jailed.y
        room.update(now=now)
        self.assertTrue(jailed.jailed)
        cop.x, cop.y = 2, 2
        hero.x, hero.y = room.map.pad["cx"], room.map.pad["cy"]
        room.update(now=now + 1)
        self.assertFalse(jailed.jailed)
        self.assertFalse(room.map.in_jail(jailed.x, jailed.y))
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
        t.x, t.y, t.last = 15.0, 12.5, 10.0
        self.assertFalse(room.move(t.uid, 15.0 + 1.6, 12.5, 0, True, now=10.15))     # 대시 없이는 너무 멀다
        t.last = 10.0
        self.assertTrue(room.dash(t.uid, now=10.0))
        self.assertTrue(room.move(t.uid, 15.0 + 1.6, 12.5, 0, True, now=10.15))
        self.assertTrue(t.public(10.3)["dashing"])                                   # 다른 사람 화면에도 대시가 보이도록 알린다
        self.assertFalse(t.public(10.0 + world.DASH_SECONDS + 0.01)["dashing"])
        self.assertFalse(room.dash(t.uid, now=11.0))                                 # 쿨타임

    def test_a_cops_tag_counts_where_the_thief_just_was(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = 3.0, 12.5
        t.x, t.y, t.last = 3.4, 13.0, now - 0.25                         # 0.25초 전에는 경찰 바로 옆이었다
        self.assertTrue(room.move(t.uid, 3.4, 13.0, 0, True, now=now - 0.25))
        self.assertTrue(room.move(t.uid, 4.6, 13.4, 0, True, now=now))    # 지금은 서버 기준 1.6칸 떨어져 있다
        room.update(now=now)
        self.assertFalse(t.jailed)                                       # 서버만 보면 닿지 않았다
        self.assertFalse(room.tag(thieves[1].uid, t.uid, now=now))       # 도둑은 잡을 수 없다
        self.assertTrue(room.tag(cop.uid, t.uid, now=now))               # 경찰 화면에서는 닿았다
        self.assertTrue(t.jailed)
        self.assertEqual(cop.catches, 1)

    def test_a_tag_does_not_reach_too_far_back(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = 3.0, 12.5
        t.x, t.y, t.last = 3.4, 13.0, now - 0.8
        self.assertTrue(room.move(t.uid, 3.4, 13.0, 0, True, now=now - 0.8))
        self.assertTrue(room.move(t.uid, 5.5, 13.4, 0, True, now=now))
        self.assertFalse(room.tag(cop.uid, t.uid, now=now))              # 0.8초 전 자리는 너무 오래됐다
        t.safe_until = now + 1
        t.x, t.y = cop.x + 0.3, cop.y
        self.assertFalse(room.tag(cop.uid, t.uid, now=now))              # 막 풀려난 도둑은 안 잡힌다

    def test_worse_ping_looks_further_back(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = 3.0, 12.5
        t.x, t.y, t.last = 3.4, 13.0, now - 0.4
        self.assertTrue(room.move(t.uid, 3.4, 13.0, 0, True, now=now - 0.4))
        self.assertTrue(room.move(t.uid, 5.0, 13.4, 0, True, now=now))
        room.set_rtt(cop.uid, 0.0)
        room.set_rtt(t.uid, 0.0)
        self.assertFalse(room.tag(cop.uid, t.uid, now=now))              # 핑이 좋으면 0.4초 전까지는 보지 않는다
        room.set_rtt(cop.uid, 0.5)
        room.set_rtt(t.uid, "nan")                                       # 이상한 값은 무시한다
        room.set_rtt(t.uid, 0.5)
        self.assertAlmostEqual(room.tag_window(cop, t), world.TAG_MAX)
        self.assertTrue(room.tag(cop.uid, t.uid, now=now))               # 핑이 나쁘면 더 멀리 되돌아본다

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
        me.x, me.y = 2.5, 12.5
        bot.x, bot.y = 12.5, 13.0
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
        jailed.x, jailed.y = room.map.jail_spots[0]
        me.x, me.y = 2.5, 24.5                                       # 경찰(나)은 멀리 라운지 구석에 가만히 있다
        runner.x, runner.y = 31.0, 13.0
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
        bot.x, bot.y = 14.8, 2.6                                     # 벽 바로 바깥 (도서관 동쪽 벽 x=14)
        me.x, me.y = 13.4, 2.6                                       # 벽 안쪽, 문은 y 4~6
        self.run_until(room, lambda: me.jailed, room.last_update or 0.1, limit=20)
        self.assertTrue(me.jailed, "경찰 봇이 벽을 돌아 문으로 들어오지 못했다")

    def test_bots_never_end_up_inside_anything(self):
        for key in maps.MAPS:
            with self.subTest(key):
                room = self.solo(bots=5)
                self.assertEqual(room.set_map(1, key, now=0), "")
                room.update(now=0)
                room.start(1, now=0)
                t = 0.0
                for _ in range(400):
                    t += 0.1
                    room.update(now=t)
                    for p in room.players.values():
                        self.assertTrue(room.map.free_at(p.x, p.y), (p.name, p.x, p.y))

    def test_host_picks_the_map_in_the_lobby(self):
        room = self.solo(bots=1)
        room.add(2, "friend", now=0)
        self.assertEqual(room.map.key, maps.DEFAULT_MAP)
        self.assertTrue(room.set_map(2, "dorm", now=0))                   # 방장만
        self.assertTrue(room.set_map(1, "nowhere", now=0))
        self.assertEqual(room.set_map(1, "dorm", now=0), "")
        self.assertEqual(room.snapshot(now=0)["map"], "dorm")
        self.assertTrue(all((p.x, p.y) in room.map.lobby_spawns for p in room.players.values()))   # 모두 새 맵 대기 자리로
        self.assertEqual(room.summary()["map"], "기숙사")
        room.start(1, now=0)
        self.assertTrue(room.set_map(1, "campus", now=1))                 # 게임 중에는 못 바꾼다
        self.assertEqual(room.map.key, "dorm")


class HubTests(SimpleTestCase):
    def setUp(self):
        self.addCleanup(hub.ROOMS.clear)
        self.addCleanup(hub.USER_ROOM.clear)

    def test_a_room_can_be_created_on_any_map(self):
        room = hub.create_room(1, "a", "기숙사 방", map_key="dorm")
        self.assertEqual(room.map.key, "dorm")
        self.assertEqual(hub.list_rooms()[0]["map"], "기숙사")
        self.assertEqual(hub.create_room(2, "b", map_key="bogus").map.key, maps.DEFAULT_MAP)

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
        for key in maps.MAPS:
            self.assertContains(res, '"%s"' % key)
        self.assertContains(self.client.get(reverse("game_lobby")), reverse("cops_robbers"))
