import math

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from . import gun_hub as hub
from . import gun_layout as lay
from . import gun_world as gw
from . import untitled_maps as maps

User = get_user_model()
EAST = math.pi / 2                  # 방향은 화면과 같은 atan2(dx, dy): +x 쪽
LAB = maps.MAPS["lab"]


def playing(n=2, map_key="lab"):
    """n명이 들어가 시작해서 1라운드 교전 중인 방과 시계 값. 사람이 방장(1), 나머지도 사람(id 2…)."""
    room = gw.GunRoom("TEST", 1, map_key=map_key)
    for uid in range(1, n + 1):
        room.add(uid, f"p{uid}", now=0.0)
    ok, msg = room.start(1, now=0.0)
    assert ok, msg
    assert room.phase == "buy"
    room.update(now=gw.BUY_SECONDS + 0.1)
    assert room.phase == "playing"
    return room, gw.BUY_SECONDS + 0.1


def put(p, x, y):
    p.x, p.y = x, y
    p.trail.clear()


def duel(now_offset=0.0):
    """서로 다른 팀 두 명이 일직선으로 마주 본 방: (방, 쏘는 사람, 맞는 사람, 시각)."""
    room, now = playing(2)
    a, b = room.players[1], room.players[2]
    assert a.team != b.team
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

    def test_nobody_can_shoot_during_the_buy_phase(self):
        room = gw.GunRoom("TEST", 1)
        room.add(1, "a", now=0.0)
        room.add(2, "b", now=0.0)
        room.start(1, now=0.0)
        self.assertFalse(room.shoot(1, EAST, now=1.0))

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
        wall = next(s for s in LAB.walls if s["cx"] > a.x and abs(s["cy"] - a.y) < 6)
        room.shoot(a.uid, math.atan2(wall["cx"] - a.x, wall["cy"] - a.y), now=now)
        end = next(e for e in room.take_events() if e["t"] == "gshot")["ends"][0]
        self.assertLess(math.hypot(end[0] - a.x, end[1] - a.y), gw.WEAPONS["pistol"]["range"] + 0.01)
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

    def test_a_kill_pays_by_weapon_and_there_is_no_respawn(self):
        room, a, b, now = duel()
        b.hp = 10
        before = a.money
        room.shoot(a.uid, EAST, now=now)
        self.assertEqual((b.hp, b.alive, a.kills, b.deaths), (0, False, 1, 1))
        self.assertEqual(a.money, before + gw.KILL_REWARD["pistol"])
        self.assertFalse(room.shoot(b.uid, EAST + math.pi, now=now + 1.0))     # 쓰러진 사람은 못 쏜다
        room.update(now=now + 1.1)                                             # 다음 시계에서 라운드가 끝난 걸 알아챈다
        self.assertEqual(room.phase, "round_end")                              # 마지막 한 명이 쓰러져 라운드가 끝났다
        self.assertEqual(room.score[a.team], 1)

    def test_armor_soaks_damage_and_wears_down(self):
        room, a, b, now = duel()
        b.armor = 100
        room.shoot(a.uid, EAST, now=now)
        self.assertEqual(b.hp, gw.HP_MAX - 10)                                  # 권총 20 중 절반을 방어구가 받는다
        self.assertEqual(b.armor, 90)

    def test_shotgun_fires_pellets_and_runs_out_back_to_the_pistol(self):
        room, a, b, now = duel()
        a.weapon, a.ammo = "shotgun", 1
        room.shoot(a.uid, EAST, now=now)
        ev = next(e for e in room.take_events() if e["t"] == "gshot")
        self.assertEqual(len(ev["ends"]), gw.WEAPONS["shotgun"]["pellets"])
        self.assertEqual((a.weapon, a.ammo), ("pistol", None))
        self.assertEqual(ev["w"], "shotgun")


class BuyTests(SimpleTestCase):
    def setUp(self):
        self.room = gw.GunRoom("TEST", 1)
        for uid in (1, 2):
            self.room.add(uid, f"p{uid}", now=0.0)
        self.room.start(1, now=0.0)
        self.p = self.room.players[1]

    def test_everyone_starts_with_money_and_a_pistol(self):
        for p in self.room.players.values():
            self.assertEqual((p.money, p.weapon, p.armor), (gw.START_MONEY, "pistol", 0))
        self.assertEqual((self.room.phase, self.room.round), ("buy", 1))

    def test_buying_spends_money_and_swaps_the_main_weapon(self):
        self.p.money = 5000
        self.assertTrue(self.room.buy(1, "rifle")[0])
        self.assertEqual((self.p.weapon, self.p.ammo, self.p.money), ("rifle", gw.WEAPONS["rifle"]["ammo"], 5000 - gw.PRICES["rifle"]))
        self.assertFalse(self.room.buy(1, "rifle")[0])                          # 같은 걸 또 사지는 못한다
        self.assertTrue(self.room.buy(1, "shotgun")[0])
        self.assertEqual(self.p.weapon, "shotgun")
        self.assertTrue(self.room.buy(1, "armor")[0])
        self.assertEqual(self.p.armor, gw.ARMOR_MAX)
        self.assertFalse(self.room.buy(1, "armor")[0])

    def test_not_enough_money_unknown_items_and_wrong_phase(self):
        self.assertFalse(self.room.buy(1, "sniper")[0])
        self.assertFalse(self.room.buy(1, "bazooka")[0])
        self.assertEqual(self.p.money, gw.START_MONEY)
        self.room.update(now=gw.BUY_SECONDS + 0.1)
        self.p.money = 9000
        self.assertFalse(self.room.buy(1, "rifle")[0])                          # 교전 중에는 못 산다


class LayoutTests(SimpleTestCase):
    def test_every_map_has_two_sealable_bases_and_two_reachable_sites(self):
        for key, layout in lay.LAYOUTS.items():
            with self.subTest(key):
                m = layout.map
                self.assertEqual(len(layout.bases), 2)
                self.assertEqual(sorted(layout.sites), ["A", "B"])
                seen = m.grid_dist([layout.bases[0]["spawns"][0]])
                for base in layout.bases:
                    self.assertGreaterEqual(len(base["spawns"]), 8)
                    self.assertTrue(base["gates"])                                    # 나가는 길이 있고, 그 길이 잠긴다
                    for x, y in base["spawns"]:
                        self.assertTrue(m.free_at(x, y) and lay.inside(m, base["areas"], x, y), (x, y))
                        self.assertIn(m.node(x, y), seen)                             # 기지끼리 길이 이어져 있다
                    for o, f, t0, t1 in base["gates"]:                                # 잠금 선은 기지 가장자리에 놓인다
                        mid = (t0 + t1) / 2
                        a, b = ((f - 0.5, mid), (f + 0.5, mid)) if o == "v" else ((mid, f - 0.5), (mid, f + 0.5))
                        self.assertNotEqual(m.area_at(*a) in base["areas"], m.area_at(*b) in base["areas"])
                for site in layout.sites.values():
                    x0, y0, x1, y1 = site["rect"]
                    self.assertTrue(any(m.node(x + 0.5, y + 0.5) in seen for x in range(x0, x1) for y in range(y0, y1) if m.walkable_at(x + 0.5, y + 0.5)))
                self.assertFalse(set(layout.bases[0]["areas"]) & set(layout.bases[1]["areas"]))

    def test_lobby_has_a_red_side_and_a_blue_side(self):
        for team, spots in lay.LOBBY_SPOTS.items():
            self.assertGreaterEqual(len(spots), 8)
            for x, y in spots:
                self.assertTrue(maps.LOBBY.free_at(x, y))
                self.assertEqual(lay.lobby_pref(x, y), team)
        self.assertIsNone(lay.lobby_pref(9.0, 9.0))


class LobbyTests(SimpleTestCase):
    def room(self, n=2):
        room = gw.GunRoom("TEST", 1)
        for uid in range(1, n + 1):
            room.add(uid, f"p{uid}", now=0.0)
        return room

    def test_standing_on_a_pad_picks_that_team(self):
        room = self.room()
        p = room.players[1]
        put(p, *lay.LOBBY_SPOTS["red"][0])
        room.update(now=0.1)
        self.assertEqual(p.public(0.1)["pref"], "red")
        put(p, 9.0, 9.0)
        room.update(now=0.2)
        self.assertIsNone(p.pref)

    def test_new_players_start_in_the_middle_not_on_a_pad_and_reconnecting_keeps_the_spot(self):
        room = self.room(8)
        self.assertTrue(all(p.pref is None for p in room.players.values()))
        room.set_team(3, "blue")
        spot = (room.players[3].x, room.players[3].y)
        room.add(3, "p3")                                                         # 재접속
        self.assertEqual((room.players[3].x, room.players[3].y), spot)
        self.assertEqual(room.players[3].pref, "blue")

    def test_buttons_move_you_onto_the_team_pad(self):
        room = self.room()
        self.assertEqual(room.set_team(2, "blue"), "")
        self.assertEqual((room.players[2].pref, lay.lobby_pref(room.players[2].x, room.players[2].y)), ("blue", "blue"))
        room.set_team(2, None)
        self.assertIsNone(room.players[2].pref)
        self.assertTrue(room.set_team(2, "red") == "")
        room.phase = "buy"
        self.assertNotEqual(room.set_team(2, "blue"), "")

    def test_start_uses_the_pad_teams_and_balances_those_standing_in_the_middle(self):
        room = self.room(5)
        room.set_team(1, "red")
        room.set_team(2, "red")
        room.set_team(3, "red")
        self.assertTrue(room.start(1, now=0.0)[0])
        teams = {uid: p.team for uid, p in room.players.items()}
        self.assertEqual([teams[1], teams[2], teams[3]], ["red"] * 3)
        self.assertEqual((teams[4], teams[5]), ("blue", "blue"))                  # 자리에 안 선 둘은 적은 팀으로

    def test_start_refuses_when_a_whole_team_is_empty(self):
        room = self.room(2)
        room.set_team(1, "red")
        room.set_team(2, "red")
        ok, msg = room.start(1, now=0.0)
        self.assertFalse(ok)
        self.assertIn("각각", msg)
        room.set_team(2, "blue")
        self.assertTrue(room.start(1, now=0.0)[0])

    def test_bots_join_the_chosen_team_and_everyone_returns_to_their_pad(self):
        room = self.room(1)
        room.set_team(1, "red")
        bot = room.add_bot(1, team="blue")
        self.assertEqual(room.players[bot].pref, "blue")
        self.assertTrue(room.start(1, now=0.0)[0])
        self.assertEqual((room.players[1].team, room.players[bot].team), ("red", "blue"))
        room._back_to_lobby(100.0)
        room.update(now=100.1)
        self.assertEqual((room.players[1].pref, room.players[bot].pref), ("red", "blue"))
        self.assertTrue(room.start(1, now=101.0)[0])                              # 같은 팀으로 바로 다시 시작


class BuyLockTests(SimpleTestCase):
    def setUp(self):
        self.room = gw.GunRoom("TEST", 1)
        for uid in (1, 2):
            self.room.add(uid, f"p{uid}", now=0.0)
        self.room.set_team(1, "red")
        self.room.set_team(2, "blue")
        self.room.start(1, now=0.0)
        self.p = self.room.players[1]

    def test_you_can_walk_around_your_base_while_buying(self):
        base = self.room._base("red")
        a, b = base["spawns"][0], base["spawns"][1]
        put(self.p, *a)
        self.p.last = 0.0
        self.assertTrue(self.room.move(1, b[0], b[1], 0, True, now=3.0))
        self.assertEqual((self.p.x, self.p.y), tuple(b))

    def test_you_cannot_leave_the_base_until_the_round_starts(self):
        base = self.room._base("red")
        o, f, t0, t1 = base["gates"][0]
        mid = (t0 + t1) / 2
        step = 1.0 if o == "h" else 1.0
        inside_pt, outside_pt = ((mid, f - step), (mid, f + step)) if o == "h" else ((f - step, mid), (f + step, mid))
        if not lay.inside(self.room.map, base["areas"], *inside_pt):
            inside_pt, outside_pt = outside_pt, inside_pt
        put(self.p, *inside_pt)
        self.p.last = 0.0
        self.assertFalse(self.room.move(1, outside_pt[0], outside_pt[1], 0, True, now=4.0))      # 잠긴 출구
        self.room.update(now=gw.BUY_SECONDS + 0.1)                                              # 교전 시작: 열린다
        self.assertEqual(self.room.phase, "playing")
        put(self.p, *inside_pt)
        self.p.last = gw.BUY_SECONDS + 0.1
        self.assertTrue(self.room.move(1, outside_pt[0], outside_pt[1], 0, True, now=gw.BUY_SECONDS + 4.0))

    def test_snapshot_lists_the_locked_gates_only_while_buying(self):
        snap = self.room.snapshot(1.0)
        self.assertEqual(set(snap["lock"]), {"red", "blue"})
        self.assertEqual(snap["lock"]["red"]["areas"], self.room._base("red")["areas"])
        self.assertTrue(snap["lock"]["red"]["gates"])
        self.room.update(now=gw.BUY_SECONDS + 0.1)
        self.assertIsNone(self.room.snapshot(gw.BUY_SECONDS + 0.2)["lock"])

    def test_the_two_teams_start_in_different_bases_and_swap_sides_later(self):
        red, blue = self.room._base("red"), self.room._base("blue")
        self.assertNotEqual(red["areas"], blue["areas"])
        self.room.round = gw.SWAP_EVERY + 1
        self.assertEqual(self.room._base("red")["areas"], blue["areas"])


class RoundTests(SimpleTestCase):
    def kill_all(self, room, team, now):
        for p in room.players.values():
            if p.team == team:
                p.hp, p.alive = 0, False
        room.update(now=now)

    def test_wiping_a_team_ends_the_round_with_win_and_loss_money(self):
        room, now = playing(4)
        self.kill_all(room, "blue", now + 1.0)
        self.assertEqual((room.phase, room.score, room.round_result["winner"]), ("round_end", {"red": 1, "blue": 0}, "red"))
        for p in room.players.values():
            gain = gw.WIN_BONUS if p.team == "red" else gw.LOSS_BASE
            self.assertEqual(p.money, gw.START_MONEY + gain)
        t = now + 1.0 + gw.ROUND_END_SECONDS + 0.1
        room.update(now=t)
        self.assertEqual((room.phase, room.round), ("buy", 2))
        self.assertTrue(all(p.alive and p.hp == gw.HP_MAX for p in room.players.values()))

    def test_consecutive_losses_raise_the_loss_bonus_and_a_win_resets_it(self):
        room, now = playing(2)
        room.players[1].team, room.players[2].team = "red", "blue"
        for n in range(3):
            self.kill_all(room, "blue", now)
            now += gw.ROUND_END_SECONDS + 0.1
            room.update(now=now)
            now += gw.BUY_SECONDS + 0.1
            room.update(now=now)
        self.assertEqual(room.players[2].money, gw.START_MONEY + gw.LOSS_BASE + (gw.LOSS_BASE + gw.LOSS_STEP) + (gw.LOSS_BASE + 2 * gw.LOSS_STEP))
        self.kill_all(room, "red", now)
        self.assertEqual(room.loss_streak["blue"], 0)

    def test_survivors_keep_their_gear_and_the_fallen_start_over_with_a_pistol(self):
        room, now = playing(4)
        reds = [p for p in room.players.values() if p.team == "red"]
        alive, fallen = reds[0], reds[1]
        for p in (alive, fallen):
            p.weapon, p.ammo, p.armor = "rifle", 33, 100
        fallen.hp, fallen.alive = 0, False
        self.kill_all(room, "blue", now + 1.0)
        room.update(now=now + 1.0 + gw.ROUND_END_SECONDS + 0.1)
        self.assertEqual((alive.weapon, alive.ammo, alive.armor), ("rifle", 33, 100))
        self.assertEqual((fallen.weapon, fallen.ammo, fallen.armor), ("pistol", None, 0))

    def test_sides_swap_every_few_rounds(self):
        room, now = playing(2)
        red = next(p for p in room.players.values() if p.team == "red")
        spots = room._spawns("red")
        self.assertIn((red.x, red.y), [tuple(s) for s in spots])
        room.round = gw.SWAP_EVERY + 1
        self.assertNotEqual(room._spawns("red"), spots)

    def test_first_to_the_round_target_wins_the_match_then_back_to_the_lobby(self):
        room, now = playing(2)
        room.players[1].team, room.players[2].team = "red", "blue"
        room.score["red"] = gw.ROUNDS_TO_WIN - 1
        self.kill_all(room, "blue", now)
        self.assertEqual(room.result["winner"], "red")
        room.update(now=now + gw.ROUND_END_SECONDS + 0.1)
        self.assertEqual(room.phase, "result")
        room.update(now=now + gw.ROUND_END_SECONDS + gw.RESULT_SECONDS + 0.5)
        self.assertEqual((room.phase, room.map.key), ("lobby", maps.LOBBY.key))
        self.assertTrue(all(p.team is None and p.money == 0 and p.alive for p in room.players.values()))

    def test_time_up_goes_to_more_survivors_then_more_health_then_a_draw(self):
        room, now = playing(4)
        reds = [p for p in room.players.values() if p.team == "red"]
        reds[0].hp, reds[0].alive = 0, False
        room.update(now=now + gw.ROUND_SECONDS + 0.5)
        self.assertEqual(room.round_result["winner"], "blue")
        room, now = playing(2)
        room.players[1].team, room.players[2].team = "red", "blue"
        room.players[1].hp = 60
        room.update(now=now + gw.ROUND_SECONDS + 0.5)
        self.assertEqual(room.round_result["winner"], "blue")
        room, now = playing(2)
        room.update(now=now + gw.ROUND_SECONDS + 0.5)
        self.assertEqual(room.round_result["winner"], "draw")
        self.assertEqual(room.score, {"red": 0, "blue": 0})

    def test_needs_two_players_and_only_the_host_starts(self):
        room = gw.GunRoom("TEST", 1)
        room.add(1, "a", now=0.0)
        self.assertFalse(room.start(1, now=0.0)[0])
        room.add(2, "b", now=0.0)
        self.assertFalse(room.start(2, now=0.0)[0])
        self.assertTrue(room.start(1, now=0.0)[0])
        self.assertFalse(room.start(1, now=1.0)[0])

    def test_a_team_that_empties_loses_the_match(self):
        room, now = playing(3)
        for uid in [p.uid for p in room.players.values() if p.team == "red"]:
            room.remove(uid, now=now + 1.0)
        self.assertEqual(room.result["winner"], "blue")
        self.assertEqual(room.phase, "result")

    def test_cops_and_robbers_actions_do_nothing_here(self):
        room, now = playing(2)
        self.assertFalse(room.taser(1, EAST))
        self.assertFalse(room.arrest(1, 2))


class SpectateTests(SimpleTestCase):
    def test_the_fallen_follow_a_living_teammate_and_can_cycle(self):
        room, now = playing(6)
        reds = sorted((p for p in room.players.values() if p.team == "red"), key=lambda p: p.uid)
        dead = reds[0]
        dead.hp, dead.alive = 0, False
        room.update(now=now + 0.5)
        self.assertIn(dead.spec, {p.uid for p in reds[1:]})
        first = dead.spec
        self.assertTrue(room.spectate(dead.uid, 1))
        self.assertNotEqual(dead.spec, first)
        self.assertFalse(room.spectate(reds[1].uid, 1))                          # 살아 있는 사람은 관전하지 않는다
        spec = next(p for p in reds if p.uid == dead.spec)
        spec.hp, spec.alive = 0, False
        room.update(now=now + 0.7)
        self.assertNotEqual(dead.spec, spec.uid)                                 # 보던 팀원이 쓰러지면 다른 팀원으로 옮긴다

    def test_a_dead_player_sees_what_the_spectated_teammate_sees(self):
        room, now = playing(4)
        reds = sorted((p for p in room.players.values() if p.team == "red"), key=lambda p: p.uid)
        blues = [p for p in room.players.values() if p.team == "blue"]
        dead, mate = reds[0], reds[1]
        put(dead, *LAB.cop_spawns[0])
        far = next((x + 0.5, y + 0.5) for x in range(2, LAB.w - 2) for y in range(2, LAB.h - 2)
                   if LAB.walkable_at(x + 0.5, y + 0.5) and not LAB.can_see(dead.x, dead.y, x + 0.5, y + 0.5))
        put(blues[0], *far)
        put(mate, far[0] - 1.0, far[1])                                           # 팀원은 적 바로 곁에 있다
        dead.hp, dead.alive, dead.spec = 0, False, mate.uid
        state = room.snapshot(now)
        seen = {p["id"]: p for p in gw.visible_view(state, dead.uid)["players"]}
        self.assertNotIn("hidden", seen[blues[0].uid]) if LAB.can_see(mate.x, mate.y, blues[0].x, blues[0].y) else None


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
        self.assertIn("alive", seen_b)                                                                # 몇 명 남았는지는 알려 준다
        room.phase = "round_end"                                                                      # 라운드가 끝나면 모두 보인다
        shown = next(p for p in gw.visible_view(room.snapshot(now), a.uid)["players"] if p["id"] == b.uid)
        self.assertNotIn("hidden", shown)

    def test_teammates_are_always_visible(self):
        room, now = playing(4)
        a = room.players[1]
        mate = next(p for p in room.players.values() if p is not a and p.team == a.team)
        state = room.snapshot(now)
        seen = next(p for p in gw.visible_view(state, a.uid)["players"] if p["id"] == mate.uid)
        self.assertNotIn("hidden", seen)


class BotTests(SimpleTestCase):
    def test_bots_buy_weapons_and_play_a_whole_match(self):
        room = gw.GunRoom("TEST", 1)
        room.add(1, "p", now=0.0)
        for _ in range(3):
            room.add_bot(1)
        room.start(1, now=0.0)
        t, bought = 0.0, False
        while room.phase != "result" and t < 3000:
            t += 0.1
            room.update(now=t)
            if room.phase == "playing":                                       # 사람(1번)은 가만히 서 있다
                room.players[1].last = t
            bought = bought or any(p.bot and (p.weapon != "pistol" or p.armor) for p in room.players.values())
            for p in room.players.values():
                self.assertTrue(room.map.free_at(p.x, p.y), (p.uid, p.x, p.y))
        self.assertEqual(room.phase, "result")
        self.assertTrue(bought)
        self.assertEqual(max(room.score.values()), gw.ROUNDS_TO_WIN)
        self.assertTrue(any(p.kills for p in room.players.values() if p.bot))

    def test_bots_do_not_shoot_the_dead(self):
        room, now = playing(3)
        a = room.players[1]
        for p in room.players.values():
            p.bot = True
        foes = [p for p in room.players.values() if p.team != a.team]
        for f in foes:
            f.alive, f.hp = False, 0
        hp = a.hp
        room.update(now=now + 0.2)
        self.assertEqual(a.hp, hp)


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
