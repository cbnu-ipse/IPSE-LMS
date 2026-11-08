import math

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from . import untitled_hub as hub
from . import untitled_maps as maps
from . import untitled_world as world

User = get_user_model()
SCHOOL, DORM, LAB = maps.MAPS["school"], maps.MAPS["dorm"], maps.MAPS["lab"]
EAST = math.pi / 2                  # 방향은 화면과 같은 atan2(dx, dy): +x 쪽


class MapTests(SimpleTestCase):
    def test_every_map_is_rooms_and_corridors_with_everything_reachable(self):
        self.assertGreaterEqual(len(maps.MAPS), 3)
        for m in maps.MAPS.values():
            with self.subTest(m.key):
                self.assertNotEqual(m.w, m.h)
                floor = sum((a["x1"] - a["x0"]) * (a["y1"] - a["y0"]) for a in m.areas)
                self.assertLess(floor, m.w * m.h * 0.9)                         # 네모가 아니다: 빈 곳이 꽤 있다
                self.assertTrue(any(a["kind"] == "corridor" for a in m.areas))
                for x, y in m.lobby_spawns + m.cop_spawns + m.thief_spawns:
                    self.assertTrue(m.free_at(x, y) and not m.in_jail(x, y), (x, y))
                for x, y in m.jail_spots:
                    self.assertTrue(m.free_at(x, y) and m.in_jail(x, y), (x, y))
                self.assertTrue(m.free_at(m.pad["cx"], m.pad["cy"]))
                seen = m.grid_dist([m.cop_spawns[0]])
                open_nodes = {(i, j) for i in range(m.gx) for j in range(m.gy) if m.walk[i][j]}
                self.assertEqual(open_nodes - set(seen), set())                   # 막혀서 못 가는 빈 곳이 없다
                self.assertIn(m.node(m.pad["cx"], m.pad["cy"]), seen)
                self.assertTrue(m.fence_edges)

    def test_doors_join_floors_of_the_same_height_and_rooms_form_loops(self):
        for m in maps.MAPS.values():
            with self.subTest(m.key):
                links = set()
                for o, f, t0, t1 in m.doors:
                    for t in range(t0, t1):
                        a, b = ((f - 0.01, t + 0.5), (f + 0.01, t + 0.5)) if o == "v" else ((t + 0.5, f - 0.01), (t + 0.5, f + 0.01))
                        self.assertAlmostEqual(m.height_at(*a), m.height_at(*b), delta=0.05)   # 문턱에서 높이가 맞는다
                        links.add(tuple(sorted((m.area_at(*a), m.area_at(*b)))))
                node = lambda k: m.areas[k]["group"] or k                                      # noqa: E731
                nodes = {node(k) for k, a in enumerate(m.areas) if a["kind"] != "jail"}
                edges = {tuple(sorted((str(node(a)), str(node(b))))) for a, b in links if node(a) != node(b)}
                self.assertGreaterEqual(len(edges) - len(nodes) + 1, 3)                     # 빙 돌아 도망칠 고리가 여러 개
                self.assertGreater(len({a["h"] for a in m.areas}), 1)                      # 높낮이가 있다

    def test_stairs_slope_between_levels(self):
        self.assertEqual(LAB.height_at(20, 4), 1.0)                            # 위층 헬기장
        self.assertAlmostEqual(LAB.height_at(15, 11), 0.5)                     # 계단 중간
        self.assertEqual(LAB.height_at(20, 41), -1.0)                          # 지하 저장고
        self.assertNotIn(("h", 30, 35), LAB.wall_edges)                        # ㄱ자 휴게실의 두 사각형 사이에는 벽이 없다

    def test_void_and_walls_block_and_doors_let_you_through(self):
        self.assertFalse(SCHOOL.free_at(24.0, 2.0))                            # 2반과 감옥 사이는 빈 곳
        self.assertFalse(SCHOOL.free_at(12.0, 4.0))                            # 1반·2반 사이 벽
        self.assertTrue(SCHOOL.free_at(12.0, 8.0))                             # 그 벽의 문
        self.assertFalse(SCHOOL.free_at(3.0, 13.0))                            # 교실과 복도 사이 벽
        self.assertTrue(SCHOOL.free_at(7.0, 13.0))
        self.assertNotIn(("v", 12, 7), SCHOOL.wall_edges)                     # 문 칸에는 벽 조각이 없다
        self.assertIn(("v", 12, 4), SCHOOL.wall_edges)

    def test_jail_fence_blocks_walking_but_not_sight(self):
        self.assertFalse(SCHOOL.free_at(27.0, 5.0))
        self.assertTrue(SCHOOL.can_see(27.0, 6.5, 27.0, 3.0))
        self.assertFalse(SCHOOL.can_see(11.5, 4.0, 12.5, 4.0))                 # 벽 너머는 안 보인다
        self.assertFalse(SCHOOL.can_see(3.0, 15.0, 3.0, 11.0))
        self.assertTrue(SCHOOL.can_see(10.0, 15.0, 14.0, 15.0))                # 복도는 트여 있다

    def test_props_block_only_their_real_shape(self):
        lamp = next(x for x in SCHOOL.shapes if x["model"] == "lampSquareFloor")
        self.assertEqual(lamp["kind"], "circle")
        self.assertFalse(SCHOOL.free_at(lamp["cx"] + 0.3, lamp["cy"]))
        self.assertTrue(SCHOOL.free_at(lamp["cx"], lamp["cy"] - lamp["r"] - 0.36))
        table = next(x for x in DORM.shapes if x["model"] == "tableRound")
        self.assertEqual((table["cx"], table["cy"]), (6, 17))
        self.assertFalse(DORM.free_at(6.5, 17.0))
        self.assertTrue(DORM.free_at(5.0, 18.2))                               # 2×2 칸의 모서리 쪽은 비어 있다

    def test_turned_bench_uses_its_turned_size(self):
        bench = next(x for x in DORM.shapes if x["model"] == "bench")
        self.assertEqual((bench["cx"], bench["cy"]), (15.5, 9.5))
        self.assertLess(bench["hx"], bench["hy"])                            # 돌려서 세로로 길다
        self.assertTrue(DORM.free_at(15.5, 9.5 - bench["hy"] - 0.31))
        self.assertFalse(DORM.free_at(15.5, 9.5 - bench["hy"] - 0.25))
        edge = 15.5 - bench["hx"] - maps.RADIUS
        self.assertTrue(DORM.free_at(edge + 0.0007, 9.5))                    # 밀어낸 위치를 반올림해 보낸 만큼은 봐준다
        self.assertFalse(DORM.free_at(edge + 0.01, 9.5))

    def test_paths_go_through_doors(self):
        path = SCHOOL.find_path(3.5, 11.0, 3.5, 25.0)                          # 1반 → 3반 (복도를 건너)
        self.assertTrue(path)
        self.assertEqual(path[-1], (3.5, 25.0))
        self.assertTrue(all(SCHOOL.free_at(x, y) for x, y in path))
        out = [x for (x, y0), (_, y1) in zip(path, path[1:]) if y0 < 13 <= y1]
        self.assertTrue(out and (6 <= out[0] <= 8 or 0 <= out[0] <= 2))       # 1반 문이나 옆 통로로 나간다

    def test_page_data_has_every_map(self):
        worlds = world.worlds_view()
        self.assertEqual(set(worlds), set(maps.MAPS) | {"lobby"})              # 대기실도 그린다
        dorm = worlds["dorm"]
        self.assertEqual((dorm["w"], dorm["h"]), (30, 40))
        self.assertEqual(dorm["jail"], {"x0": 26, "y0": 0, "x1": 30, "y1": 4})
        self.assertTrue(dorm["sight"] and dorm["fences"] and dorm["areas"])
        self.assertIn("taser", dorm)


class WorldTests(SimpleTestCase):
    def test_room_fills_up_and_hands_over_host(self):
        room = world.Room("ABCD", 1, map_key="school")
        for uid in range(1, world.MAX_PLAYERS + 1):
            self.assertTrue(room.add(uid, f"p{uid}", now=0)[0])
        self.assertFalse(room.add(99, "late", now=0)[0])
        self.assertEqual(len({p.model for p in room.players.values()}), world.MAX_PLAYERS)   # 모두 다른 캐릭터
        room.remove(1)
        self.assertEqual(room.host_id, 2)

    def test_moves_are_checked_for_speed_and_obstacles(self):
        room = world.Room("ABCD", 1, map_key="school")
        room.map = SCHOOL                                                      # 이동 규칙만 본다 (보통은 대기실)
        room.add(1, "me", now=0)
        p = room.players[1]
        x0, y0 = p.x, p.y
        self.assertTrue(room.move(1, x0, y0 - 0.3, 3.1, True, now=0.1))
        self.assertFalse(room.move(1, x0, y0 - 9, 3.1, True, now=0.2))          # 순간이동
        self.assertEqual((round(p.x, 3), round(p.y, 3)), (round(x0, 3), round(y0 - 0.3, 3)))
        self.assertFalse(room.move(1, "nan", 3, 0, True, now=0.3))
        self.assertFalse(room.move(1, None, 3, 0, True, now=0.3))
        bunch = world.Room("BNCH", 3, map_key="school")                                            # 늦게 오다 몰려 온 위치
        bunch.map = SCHOOL
        bunch.add(3, "b", now=0)
        q = bunch.players[3]
        q.x, q.y, q.last = 20.0, 15.0, 0.0
        self.assertTrue(bunch.move(3, 20.0 - 0.8, 15.0, 0, True, now=0.25))
        self.assertTrue(bunch.move(3, 20.0 - 1.2, 15.0, 0, True, now=0.255))     # 바로 뒤에 붙어 와도 받는다
        self.assertFalse(bunch.move(3, 20.0 - 5.2, 15.0, 0, True, now=2.0))      # 오래 멈춰 있었어도 순간이동은 안 된다
        far = world.Room("EFGH", 2, map_key="school")
        far.map = SCHOOL
        far.add(2, "x", now=0)
        far.players[2].x, far.players[2].y = 3.0, 15.5
        self.assertFalse(far.move(2, 3.0, 12.5, 0, True, now=10))                 # 교실 벽은 뚫고 지나갈 수 없다
        self.assertTrue(far.move(2, 3.0, 14.5, 0, True, now=10.5))
        far.players[2].x, far.players[2].y = 24.0, 14.0
        self.assertFalse(far.move(2, 24.0, 12.4, 0, True, now=20))                # 빈 곳으로는 못 간다


class CopsAndRobbersTests(SimpleTestCase):
    def room(self, n=3):
        room = world.Room("COPS", 1, map_key="school")
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

    def place(self, p, x, y, now):
        p.teleport(x, y)
        p.last = now

    def run_for(self, room, start, seconds):
        t = start
        while t < start + seconds:
            t += 0.05
            room.update(now=t)
        return [e for e in room.take_events() if e["t"] == "tase"]

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

    def test_touching_is_not_enough_the_cop_has_to_grab(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = t.x + 0.5, t.y
        room.update(now=now)
        self.assertFalse(t.jailed)                                          # 스치기만 해서는 안 잡힌다
        self.assertIsNone(room.arrest(t.uid, cop.uid, now=now))             # 도둑은 잡을 수 없다
        self.assertEqual(room.arrest(cop.uid, None, now=now), t.uid)        # 잡기를 누르면 잡힌다
        self.assertTrue(t.jailed)
        self.assertTrue(room.map.in_jail(t.x, t.y))
        self.assertEqual(t.tp, 2)                                           # 시작할 때 한 번, 잡혀서 한 번
        self.assertEqual(cop.catches, 1)
        self.assertFalse(room.move(t.uid, t.x, room.map.jail["y1"] + 0.5, 0, True, now=now + 5))   # 울타리 밖으로는 못 나간다

    def test_stepping_on_the_pad_frees_everyone(self):
        room, cop, thieves = self.playing()
        jailed, hero = thieves
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = jailed.x + 0.4, jailed.y
        room.arrest(cop.uid, jailed.uid, now=now)
        room.update(now=now)
        self.assertTrue(jailed.jailed)
        cop.x, cop.y = 40.5, 10.0
        hero.x, hero.y = room.map.pad["cx"], room.map.pad["cy"]
        t = now
        for _ in range(15):                                                   # 1.5초: 아직 모자라다
            t += 0.1
            room.update(now=t)
        self.assertTrue(jailed.jailed)
        self.assertGreater(room.snapshot(t)["pad"], 0.4)
        hero.x += 2.0                                                         # 내려오면 처음부터
        room.update(now=t + 0.1)
        self.assertEqual(room.pad_time, 0.0)
        hero.x -= 2.0
        t += 0.1
        for _ in range(int(world.RESCUE_SECONDS * 10) + 2):
            t += 0.1
            room.update(now=t)
        self.assertFalse(jailed.jailed)
        self.assertFalse(room.map.in_jail(jailed.x, jailed.y))
        cop.x, cop.y = jailed.x + 0.3, jailed.y
        self.assertIsNone(room.arrest(cop.uid, jailed.uid, now=t + 0.5))
        self.assertFalse(jailed.jailed)                                       # 풀려난 직후 잠깐은 안 잡힌다

    def test_cops_win_when_every_thief_is_jailed(self):
        room, cop, thieves = self.playing()
        now = world.COUNTDOWN + world.HEAD_START + 1
        for t in thieves:
            cop.x, cop.y = t.x + 0.3, t.y
            now += world.ARREST_COOLDOWN
            room.arrest(cop.uid, t.uid, now=now)
            room.update(now=now)
        self.assertEqual(room.phase, "result")
        self.assertEqual(room.result["winner"], "cop")
        room.update(now=now + world.RESULT_SECONDS + 0.1)
        self.assertEqual(room.phase, "lobby")
        self.assertTrue(all(p.team is None and not p.jailed for p in room.players.values()))

    def test_thieves_win_if_anyone_is_still_free_when_time_runs_out(self):
        room, cop, thieves = self.playing()
        room.update(now=world.COUNTDOWN + room.round_seconds + 1)
        self.assertEqual(room.result["winner"], "thief")

    def test_a_missed_grab_has_a_short_cooldown(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = t.x + world.ARREST_REACH + 0.5, t.y
        self.assertIsNone(room.arrest(cop.uid, t.uid, now=now))            # 손이 닿지 않는다 (헛손질)
        self.assertEqual([e["ok"] for e in room.take_events() if e["t"] == "grab"], [False])
        cop.x = t.x + 0.8
        self.assertIsNone(room.arrest(cop.uid, t.uid, now=now + 0.2))      # 바로 다시는 못 누른다
        self.assertEqual(room.arrest(cop.uid, t.uid, now=now + world.ARREST_COOLDOWN + 0.01), t.uid)

    def test_more_players_get_more_time(self):
        self.assertLess(world.round_seconds(3), world.round_seconds(8))

    def test_lobby_is_a_fixed_square_and_the_round_moves_to_the_chosen_map(self):
        room = self.room(3)
        self.assertEqual(room.map.key, "lobby")
        self.assertEqual(room.map.w, room.map.h)
        self.assertEqual(room.set_map(1, "dorm", now=0), "")
        self.assertEqual(room.map.key, "lobby")                              # 고르기만 하고 대기실에 그대로
        room.start(1, now=0)
        self.assertEqual(room.map.key, "dorm")
        self.assertTrue(all(room.map.free_at(p.x, p.y) for p in room.players.values()))
        room.update(now=world.COUNTDOWN + 0.01)
        room.update(now=world.COUNTDOWN + room.round_seconds + 1)
        room.update(now=world.COUNTDOWN + room.round_seconds + world.RESULT_SECONDS + 2)
        self.assertEqual((room.phase, room.map.key, room.choice.key), ("lobby", "lobby", "dorm"))

    def test_emotes_are_broadcast_but_not_spammed(self):
        room = self.room(2)
        room.take_events()
        self.assertTrue(room.emote(1, "teabag", now=1.0))
        self.assertFalse(room.emote(1, "teabag", now=1.05))                 # 너무 잦다
        self.assertTrue(room.emote(1, "laugh", now=1.2))
        self.assertFalse(room.emote(1, "<script>", now=2.0))
        self.assertEqual([(e["id"], e["e"]) for e in room.take_events()], [(1, "teabag"), (1, "laugh")])

    def test_only_thieves_dash(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        self.place(t, 20.0, 15.0, 10.0)
        self.assertFalse(room.move(t.uid, 20.0 + 1.6, 15.0, 0, True, now=10.15))   # 대시 없이는 너무 멀다
        t.last = 10.0
        self.assertTrue(room.dash(t.uid, now=10.0))
        self.assertTrue(room.move(t.uid, 20.0 + 1.6, 15.0, 0, True, now=10.15))
        self.assertTrue(t.public(10.3)["dashing"])                                   # 다른 사람 화면에도 대시가 보이도록 알린다
        self.assertFalse(t.public(10.0 + world.DASH_SECONDS + 0.01)["dashing"])
        self.assertFalse(room.dash(t.uid, now=11.0))                                 # 쿨타임
        self.assertFalse(room.dash(cop.uid, now=20.0))                               # 경찰은 대시할 수 없다
        lobby = self.room(2)
        self.assertFalse(lobby.dash(1, now=1))                                       # 대기실에서도 (아직 도둑이 아니다)

    def test_taser_dart_stuns_a_thief_it_reaches(self):
        room, cop, thieves = self.playing()
        t, other = thieves
        now = world.COUNTDOWN + world.HEAD_START + 1
        room.update(now=now)
        other.x, other.y = 40.5, 10.0
        self.place(cop, 10.0, 15.0, now)
        self.place(t, 13.0, 15.0, now)
        self.assertTrue(room.taser(cop.uid, EAST + 0.2, now=now))          # 조금 빗나가게 겨눠도 보정된다
        hits = self.run_for(room, now, 0.8)
        self.assertEqual(hits[0]["thief"], t.uid)
        self.assertGreater(t.stun_until, now)
        self.assertGreater(t.public(now + 0.5)["stun"], 0)
        self.assertFalse(room.move(t.uid, t.x + 0.2, t.y, 0, True, now=now + 0.9))   # 감전된 동안은 못 움직인다
        self.assertFalse(room.dash(t.uid, now=now + 0.9))
        self.assertFalse(room.taser(cop.uid, EAST, now=now + 1.0))         # 쿨타임
        self.assertFalse(room.taser(t.uid, EAST, now=now + 1.0))           # 도둑은 쏠 수 없다
        self.assertTrue(room.move(t.uid, t.x + 0.2, t.y, 0, True, now=now + world.STUN_SECONDS + 0.5))

    def test_taser_misses_when_aimed_away_dodged_or_behind_a_wall(self):
        room, cop, thieves = self.playing()
        t, other = thieves
        now = world.COUNTDOWN + world.HEAD_START + 1
        room.update(now=now)
        other.x, other.y = 40.5, 10.0
        self.place(cop, 10.0, 15.0, now)
        self.place(t, 13.0, 15.0, now)
        self.assertTrue(room.taser(cop.uid, EAST + 0.8, now=now))          # 엉뚱한 방향
        self.assertIsNone(self.run_for(room, now, 0.8)[0]["thief"])
        now += world.TASER_COOLDOWN + 0.1
        self.place(t, 14.0, 15.0, now)
        self.assertTrue(room.taser(cop.uid, EAST, now=now))
        t.y = 16.3                                                          # 쏘자마자 옆으로 비킨다
        self.assertIsNone(self.run_for(room, now, 0.8)[0]["thief"])
        self.assertEqual(t.stun_until, 0.0)
        now += world.TASER_COOLDOWN + 1
        self.place(cop, 3.0, 15.0, now)
        self.place(t, 3.0, 11.0, now)                                       # 교실 벽 너머
        self.assertTrue(room.taser(cop.uid, math.pi, now=now))
        self.assertIsNone(self.run_for(room, now, 0.8)[0]["thief"])

    def test_cops_only_see_thieves_in_their_line_of_sight(self):
        room, cop, thieves = self.playing()
        t, mate = thieves
        now = world.COUNTDOWN + world.HEAD_START + 1
        self.place(cop, 3.0, 15.0, now)
        self.place(t, 3.0, 11.0, now)                                       # 교실 벽 너머
        self.place(mate, 9.0, 15.0, now)                                    # 같은 복도
        seen_by_cop = {p["id"]: p for p in world.visible_view(room.snapshot(now), cop.uid)["players"]}
        self.assertTrue(seen_by_cop[t.uid].get("hidden"))
        self.assertNotIn("x", seen_by_cop[t.uid])                           # 위치는 아예 보내지 않는다
        self.assertFalse(seen_by_cop[mate.uid].get("hidden"))
        seen_by_t = {p["id"]: p for p in world.visible_view(room.snapshot(now), t.uid)["players"]}
        self.assertFalse(seen_by_t[mate.uid].get("hidden"))                 # 같은 팀은 늘 보인다
        self.assertTrue(seen_by_t[cop.uid].get("hidden"))
        far = {p["id"]: p for p in world.visible_view(room.snapshot(now), cop.uid)["players"]}
        self.assertFalse(far[mate.uid].get("hidden"))
        self.place(mate, 3.0 + world.VIEW_RANGE + 1, 15.0, now)            # 같은 복도라도 너무 멀면 안 보인다
        far = {p["id"]: p for p in world.visible_view(room.snapshot(now), cop.uid)["players"]}
        self.assertTrue(far[mate.uid].get("hidden"))
        room.update(now=world.COUNTDOWN + room.round_seconds + 1)           # 끝나면 다 보인다
        self.assertFalse(any(p.get("hidden") for p in world.visible_view(room.snapshot(), cop.uid)["players"]))

    def test_a_grab_counts_where_the_thief_just_was(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = 3.0, 14.5
        t.x, t.y, t.last = 3.4, 15.0, now - 0.25                         # 0.25초 전에는 경찰 바로 옆이었다
        self.assertTrue(room.move(t.uid, 3.4, 15.0, 0, True, now=now - 0.25))
        self.assertTrue(room.move(t.uid, 4.9, 15.4, 0, True, now=now))    # 지금은 서버 기준 손이 닿지 않는다
        room.update(now=now)
        self.assertFalse(t.jailed)                                       # 서버만 보면 닿지 않았다
        self.assertEqual(room.arrest(cop.uid, t.uid, now=now), t.uid)    # 경찰 화면에서는 손이 닿았다
        self.assertTrue(t.jailed)
        self.assertEqual(cop.catches, 1)

    def test_a_grab_does_not_reach_too_far_back(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = 3.0, 14.5
        t.x, t.y, t.last = 3.4, 15.0, now - 0.8
        self.assertTrue(room.move(t.uid, 3.4, 15.0, 0, True, now=now - 0.8))
        self.assertTrue(room.move(t.uid, 5.5, 15.4, 0, True, now=now))
        self.assertIsNone(room.arrest(cop.uid, t.uid, now=now))          # 0.8초 전 자리는 너무 오래됐다
        t.safe_until = now + 5
        t.x, t.y = cop.x + 0.3, cop.y
        self.assertIsNone(room.arrest(cop.uid, t.uid, now=now + 1))      # 막 풀려난 도둑은 안 잡힌다

    def test_worse_ping_looks_further_back(self):
        room, cop, thieves = self.playing()
        t = thieves[0]
        now = world.COUNTDOWN + world.HEAD_START + 1
        cop.x, cop.y = 3.0, 14.5
        t.x, t.y, t.last = 3.4, 15.0, now - 0.4
        self.assertTrue(room.move(t.uid, 3.4, 15.0, 0, True, now=now - 0.4))
        self.assertTrue(room.move(t.uid, 5.0, 15.4, 0, True, now=now))
        room.set_rtt(cop.uid, 0.0)
        room.set_rtt(t.uid, 0.0)
        self.assertIsNone(room.arrest(cop.uid, t.uid, now=now))          # 핑이 좋으면 0.4초 전까지는 보지 않는다
        cop.arrest_ready = 0.0                                           # (헛손질 쿨타임은 이 검사와 무관)
        room.set_rtt(cop.uid, 0.5)
        room.set_rtt(t.uid, "nan")                                       # 이상한 값은 무시한다
        room.set_rtt(t.uid, 0.5)
        self.assertAlmostEqual(room.tag_window(cop, t), world.TAG_MAX)
        self.assertEqual(room.arrest(cop.uid, t.uid, now=now), t.uid)    # 핑이 나쁘면 더 멀리 되돌아본다

    def test_cops_leaving_ends_the_round(self):
        room, cop, thieves = self.playing()
        room.remove(cop.uid, now=world.COUNTDOWN + 1)
        self.assertEqual(room.result["winner"], "thief")


class BotTests(SimpleTestCase):
    def solo(self, bots=1):
        room = world.Room("SOLO", 1, map_key="school")
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
        me.x, me.y = 5.5, 15.0
        bot.x, bot.y = 15.5, 15.0                                   # 같은 복도라 보인다
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
        me.x, me.y = 40.5, 10.0                                      # 경찰(나)은 멀리 체육관에 가만히 있다
        runner.x, runner.y = 30.5, 22.5
        self.run_until(room, lambda: not jailed.jailed, 0.1, limit=40)
        self.assertFalse(jailed.jailed, "도둑 봇이 구출하러 가지 않았다")
        me.x, me.y = runner.x + 1.2, runner.y
        d0 = math.hypot(me.x - runner.x, me.y - runner.y)
        t = room.last_update
        self.run_until(room, lambda: False, t, limit=1.0)
        self.assertGreater(math.hypot(me.x - runner.x, me.y - runner.y), d0)     # 가까이 온 경찰에게서 멀어진다

    def test_cop_bot_goes_where_it_last_saw_a_thief_around_a_wall(self):
        room = self.solo(bots=1)
        room.update(now=0)
        room.start(1, now=0)
        me, bot = room.players[1], next(p for p in room.players.values() if p.bot)
        me.team, bot.team = "thief", "cop"
        bot.frozen_until = 0.0
        bot.x, bot.y = 12.6, 4.0                                     # 2반, 1반과의 벽 바로 옆 (문은 y 7~9)
        me.x, me.y = 11.4, 4.0                                       # 벽 너머 1반: 봇에게는 안 보인다
        self.assertFalse(room.map.can_see(bot.x, bot.y, me.x, me.y))
        bot.seen = (me.uid, 11.4, 8.0, 0.0)                          # 문 쪽으로 들어가는 걸 마지막으로 봤다
        self.run_until(room, lambda: me.jailed, room.last_update or 0.1, limit=20)
        self.assertTrue(me.jailed, "경찰 봇이 벽을 돌아 문으로 들어오지 못했다")

    def test_cop_bot_does_not_chase_what_it_cannot_see(self):
        room = self.solo(bots=1)
        room.update(now=0)
        room.start(1, now=0)
        me, bot = room.players[1], next(p for p in room.players.values() if p.bot)
        me.team, bot.team = "thief", "cop"
        bot.frozen_until = 0.0
        bot.x, bot.y = 12.6, 4.0
        me.x, me.y = 11.4, 4.0
        goal = room._bot_goal(bot, list(room.players.values()), 1.0)
        self.assertNotEqual((round(goal[0], 1), round(goal[1], 1)), (11.4, 4.0))

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
        self.assertEqual(world.Room("NEW", 1).choice.key, maps.DEFAULT_MAP)
        self.assertTrue(room.set_map(2, "dorm", now=0))                   # 방장만
        self.assertTrue(room.set_map(1, "nowhere", now=0))
        self.assertEqual(room.set_map(1, "dorm", now=0), "")
        self.assertEqual((room.snapshot(now=0)["map"], room.snapshot(now=0)["choice"]), ("lobby", "dorm"))
        self.assertTrue(all((p.x, p.y) in room.map.lobby_spawns for p in room.players.values()))   # 모두 대기실에 그대로
        self.assertEqual(room.summary()["map"], "기숙사")
        room.start(1, now=0)
        self.assertTrue(room.set_map(1, "school", now=1))                 # 게임 중에는 못 바꾼다
        self.assertEqual(room.map.key, "dorm")


class HubTests(SimpleTestCase):
    def setUp(self):
        self.addCleanup(hub.ROOMS.clear)
        self.addCleanup(hub.USER_ROOM.clear)

    def test_a_room_can_be_created_on_any_map(self):
        room = hub.create_room(1, "a", "기숙사 방", map_key="dorm")
        self.assertEqual(room.choice.key, "dorm")
        self.assertEqual(hub.list_rooms()[0]["map"], "기숙사")
        self.assertEqual(hub.create_room(2, "b", map_key="bogus").choice.key, maps.DEFAULT_MAP)

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
