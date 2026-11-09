import math

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from . import gun_hub as hub
from . import gun_world as gw
from . import untitled_maps as maps

User = get_user_model()
EAST = math.pi / 2                  # 방향은 화면과 같은 atan2(dx, dy): +x 쪽
LAB = maps.MAPS["lab"]


def playing(n=2, map_key="lab"):
    """n명이 들어가 시작해서 경기 중인 방과 시계 값. 사람이 방장(1), 나머지는 사람 (id 2…)."""
    room = gw.GunRoom("TEST", 1, map_key=map_key)
    for uid in range(1, n + 1):
        room.add(uid, f"p{uid}", now=0.0)
    ok, msg = room.start(1, now=0.0)
    assert ok, msg
    room.update(now=gw.COUNTDOWN + 0.1)
    assert room.phase == "playing"
    return room, gw.COUNTDOWN + 0.1


def put(p, x, y):
    p.x, p.y = x, y
    p.trail.clear()


def duel(now_offset=0.0):
    """서로 다른 팀 두 명이 일직선으로 마주 본 방: (방, 쏘는 사람, 맞는 사람, 시각)."""
    room, now = playing(2)
    a, b = room.players[1], room.players[2]
    assert a.team != b.team
    # 사람이 두 칸 이상 열린 한 줄 복도를 찾는다
    for y in range(2, LAB.h - 2):
        for x in range(2, LAB.w - 10):
            if all(LAB.free_at(x + k * 0.5, y + 0.5) for k in range(0, 17)) and LAB.can_see(x, y + 0.5, x + 8, y + 0.5):
                put(a, x + 0.5, y + 0.5)
                put(b, x + 5.5, y + 0.5)
                a.frozen_until = b.frozen_until = 0.0
                return room, a, b, now + now_offset
    raise AssertionError("no straight corridor found")


class ShootingTests(SimpleTestCase):
    def test_pistol_hits_an_enemy_in_line_and_hurts_him(self):
        room, a, b, now = duel()
        self.assertTrue(room.shoot(a.uid, EAST, now=now))
        self.assertEqual(b.hp, gw.HP_MAX - gw.WEAPONS["pistol"]["dmg"])
        ev = room.take_events()
        self.assertTrue(any(e["t"] == "gshot" and e["id"] == a.uid for e in ev))
        self.assertTrue(any(e["t"] == "hit" and e["id"] == b.uid for e in ev))

    def test_a_missed_shot_does_nothing_and_cooldown_blocks_the_next(self):
        room, a, b, now = duel()
        self.assertTrue(room.shoot(a.uid, EAST + 1.2, now=now))
        self.assertEqual(b.hp, gw.HP_MAX)
        self.assertFalse(room.shoot(a.uid, EAST, now=now + 0.05))            # 연사 간격 안
        self.assertTrue(room.shoot(a.uid, EAST, now=now + 0.5))

    def test_teammates_are_never_hit(self):
        room, a, b, now = duel()
        b.team = a.team
        room.shoot(a.uid, EAST, now=now)
        self.assertEqual(b.hp, gw.HP_MAX)

    def test_walls_block_bullets(self):
        room, a, b, now = duel()
        # 쏘는 사람이 벽 쪽을 향해 쏘면 맞은 사람이 없고, 총알 끝이 사거리보다 짧다
        wall = next(s for s in LAB.walls if s["cx"] > a.x and abs(s["cy"] - a.y) < 6)
        room.shoot(a.uid, math.atan2(wall["cx"] - a.x, wall["cy"] - a.y), now=now)
        end = next(e for e in room.take_events() if e["t"] == "gshot")["ends"][0]
        self.assertLess(math.hypot(end[0] - a.x, end[1] - a.y), gw.WEAPONS["pistol"]["range"] + 0.01)
        self.assertEqual(b.hp, gw.HP_MAX)
        # 가로막는 벽이 있으면 같은 방향에 서 있어도 안 맞는다
        put(b, wall["cx"] + wall["hx"] + 1.2, wall["cy"])
        room.shoot(a.uid, math.atan2(b.x - a.x, b.y - a.y), now=now + 1.0)
        if not LAB.can_see(a.x, a.y, b.x, b.y):
            self.assertEqual(b.hp, gw.HP_MAX)

    def test_out_of_range_misses(self):
        room, a, b, now = duel()
        put(b, a.x + gw.WEAPONS["pistol"]["range"] + 2.0, a.y)
        room.shoot(a.uid, EAST, now=now)
        self.assertEqual(b.hp, gw.HP_MAX)

    def test_lag_compensation_hits_where_he_was_a_moment_ago(self):
        room, a, b, now = duel()
        old = (b.x, b.y)
        b.trail.append((now - 0.1, *old))                                   # 0.1초 전 자리
        b.x, b.y = old[0], old[1] + 2.5                                     # 지금은 옆으로 비켰다
        a.rtt = b.rtt = 0.1
        room.shoot(a.uid, EAST, now=now)
        self.assertLess(b.hp, gw.HP_MAX)

    def test_killing_scores_for_the_team_and_respawns_with_protection(self):
        room, a, b, now = duel()
        b.hp = 10
        room.shoot(a.uid, EAST, now=now)
        self.assertEqual((b.hp, a.kills, b.deaths, room.score[a.team]), (0, 1, 1, 1))
        self.assertGreater(b.dead_until, now)
        self.assertFalse(room.shoot(b.uid, EAST + math.pi, now=now + 0.1))     # 쓰러진 사람은 못 쏜다
        room.update(now=now + gw.RESPAWN_SECONDS + 0.2)
        self.assertEqual((b.hp, b.dead_until), (gw.HP_MAX, 0.0))
        self.assertGreater(b.protect_until, now + gw.RESPAWN_SECONDS)
        room.shoot(a.uid, EAST, now=now + gw.RESPAWN_SECONDS + 0.3)           # 되살아난 직후에는 맞지 않는다
        self.assertEqual(b.hp, gw.HP_MAX)

    def test_shotgun_fires_pellets_and_runs_out_back_to_the_pistol(self):
        room, a, b, now = duel()
        a.weapon, a.ammo = "shotgun", 1
        room.shoot(a.uid, EAST, now=now)
        ev = next(e for e in room.take_events() if e["t"] == "gshot")
        self.assertEqual(len(ev["ends"]), gw.WEAPONS["shotgun"]["pellets"])
        self.assertEqual((a.weapon, a.ammo), ("pistol", None))
        self.assertEqual(ev["w"], "shotgun")


class MatchTests(SimpleTestCase):
    def test_start_makes_two_teams_and_places_pickups(self):
        room, now = playing(5)
        teams = [p.team for p in room.players.values()]
        self.assertEqual(sorted(set(teams)), ["blue", "red"])
        self.assertLessEqual(abs(teams.count("red") - teams.count("blue")), 1)
        self.assertTrue(room.pickups)
        for item in room.pickups:
            self.assertTrue(room.map.walkable_at(item["x"], item["y"]))
        self.assertFalse(room.start(2, now=1.0)[0])                          # 방장만, 한 번만

    def test_needs_two_players(self):
        room = gw.GunRoom("TEST", 1)
        room.add(1, "a", now=0.0)
        self.assertFalse(room.start(1, now=0.0)[0])

    def test_pickups_give_weapons_and_medkits_heal_and_come_back(self):
        room, now = playing(2)
        p = room.players[1]
        gun = next(i for i in room.pickups if i["kind"] == "sniper")
        put(p, gun["x"], gun["y"])
        room.update(now=now + 0.2)
        self.assertEqual((p.weapon, p.ammo), ("sniper", gw.WEAPONS["sniper"]["ammo"]))
        self.assertTrue(gun["until"])
        room.update(now=now + 0.3)
        kit = next(i for i in room.pickups if i["kind"] == "medkit")
        put(p, kit["x"], kit["y"])
        room.update(now=now + 0.4)
        self.assertFalse(kit["until"])                                        # 체력이 꽉 차 있으면 아껴 둔다
        p.hp = 30
        room.update(now=now + 0.5)
        self.assertEqual(p.hp, 30 + gw.MEDKIT_HEAL)
        put(p, 0.0, 0.0)
        room.update(now=now + 0.5 + gw.PICKUP_RESPAWN + 0.5)
        self.assertFalse(gun["until"])                                        # 다시 나왔다

    def test_first_to_the_kill_target_wins(self):
        room, now = playing(2)
        room.score["red"] = gw.KILL_TARGET
        room.update(now=now + 0.2)
        self.assertEqual((room.phase, room.result["winner"]), ("result", "red"))
        room.update(now=now + 0.2 + gw.RESULT_SECONDS + 0.5)
        self.assertEqual(room.phase, "lobby")
        self.assertEqual(room.map.key, maps.LOBBY.key)
        self.assertTrue(all(p.team is None and p.hp == gw.HP_MAX for p in room.players.values()))

    def test_time_limit_goes_to_the_team_with_more_kills_or_a_draw(self):
        room, now = playing(2)
        room.score.update(red=3, blue=5)
        room.update(now=now + gw.MATCH_SECONDS + 0.5)
        self.assertEqual(room.result["winner"], "blue")
        room, now = playing(2)
        room.update(now=now + gw.MATCH_SECONDS + 0.5)
        self.assertEqual(room.result["winner"], "draw")

    def test_a_team_that_empties_loses(self):
        room, now = playing(3)
        red = [p.uid for p in room.players.values() if p.team == "red"]
        for uid in red:
            room.remove(uid, now=now + 1.0)
        self.assertEqual(room.result["winner"], "blue")

    def test_cops_and_robbers_actions_do_nothing_here(self):
        room, now = playing(2)
        self.assertFalse(room.taser(1, EAST))
        self.assertFalse(room.arrest(1, 2))


class VisibilityTests(SimpleTestCase):
    def test_enemies_behind_walls_are_hidden_and_so_are_their_shots(self):
        room, now = playing(2)
        a, b = room.players[1], room.players[2]
        put(a, *LAB.cop_spawns[0])
        far = next((x, y) for x in range(2, LAB.w - 2) for y in range(2, LAB.h - 2)
                   if LAB.walkable_at(x + 0.5, y + 0.5) and not LAB.can_see(a.x, a.y, x + 0.5, y + 0.5) and a.team != b.team)
        put(b, far[0] + 0.5, far[1] + 0.5)
        room.events.append({"t": "gshot", "id": b.uid, "x": b.x, "y": b.y, "dir": 0, "w": "pistol", "ends": [[b.x, b.y]]})
        state = room.snapshot(now)
        state["events"] = room.take_events()
        mine = gw.visible_view(state, a.uid)
        seen_b = next(p for p in mine["players"] if p["id"] == b.uid)
        self.assertTrue(seen_b.get("hidden"))
        self.assertNotIn("x", seen_b)
        self.assertFalse(any(e["t"] == "gshot" for e in mine["events"]))
        self.assertTrue(any(e["t"] == "gshot" for e in gw.visible_view(state, b.uid)["events"]))      # 쏜 사람 화면에는 보인다

    def test_teammates_are_always_visible(self):
        room, now = playing(4)
        a = room.players[1]
        mate = next(p for p in room.players.values() if p is not a and p.team == a.team)
        state = room.snapshot(now)
        seen = next(p for p in gw.visible_view(state, a.uid)["players"] if p["id"] == mate.uid)
        self.assertNotIn("hidden", seen)


class BotTests(SimpleTestCase):
    def test_bots_play_a_whole_match_and_score(self):
        room = gw.GunRoom("TEST", 1)
        room.add(1, "p", now=0.0)
        for _ in range(3):
            room.add_bot(1)
        room.start(1, now=0.0)
        t = 0.0
        while room.phase != "result" and t < gw.MATCH_SECONDS + 20:
            t += 0.1
            room.update(now=t)
            if room.phase == "playing":                                       # 사람(1번)은 가만히 서 있다
                room.players[1].last = t
        self.assertEqual(room.phase, "result")
        self.assertGreater(sum(room.score.values()), 0)
        bots = [p for p in room.players.values() if p.bot]
        self.assertTrue(any(p.kills or p.deaths for p in bots))
        for p in room.players.values():
            self.assertTrue(room.map.free_at(p.x, p.y) or p.dead_until > 0)

    def test_bots_do_not_shoot_the_dead_or_through_walls(self):
        room, now = playing(2)
        for p in room.players.values():
            p.bot = True
        a, b = room.players[1], room.players[2]
        b.dead_until = now + 100
        room.update(now=now + 0.2)
        self.assertEqual(a.hp, gw.HP_MAX)


class HubTests(SimpleTestCase):
    def setUp(self):
        self.addCleanup(hub.ROOMS.clear)
        self.addCleanup(hub.USER_ROOM.clear)

    def test_gun_rooms_are_separate_from_cops_and_robbers(self):
        from . import untitled_hub
        room = hub.create_room(1, "a", "총 방")
        self.assertIsInstance(room, gw.GunRoom)
        self.assertNotIn(room.code, untitled_hub.ROOMS)
        self.assertEqual([r["name"] for r in hub.list_rooms()], ["총 방"])
        ok, same = hub.join_room(2, "b", room.code.lower())
        self.assertTrue(ok and same is room)
        self.assertEqual(hub.group_name(room.code), "gun_" + room.code)


class PageTests(TestCase):
    def test_page_needs_login_and_has_no_rescue_pad(self):
        self.assertEqual(self.client.get(reverse("gun_room")).status_code, 302)
        self.client.force_login(User.objects.create_user("shooter", password="pw"))
        res = self.client.get(reverse("gun_room"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "/ws/gun/")
        self.assertContains(res, "ut-world")
        for key in maps.MAPS:
            self.assertContains(res, '"%s"' % key)
        world = res.context["world_json"]["worlds"]["lab"]
        self.assertIsNone(world["pad"])
        self.assertIn("weapons", world["gun"])
        self.assertContains(self.client.get(reverse("game_lobby")), reverse("gun_room"))
