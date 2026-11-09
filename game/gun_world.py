"""총게임: 경찰과 도둑의 방·맵·이동 검증·사각지대·봇 엔진 위에서 하는 팀 데스매치 (DB를 쓰지 않는 순수 파이썬).

방, 맵 고르기, 이동 검증(속도 한도·벽·충돌), 핑 보정, 문, 이모티콘, 봇 길찾기는 untitled_world.Room을 그대로 쓴다.
여기서는 규칙만 바꾼다.

팀 데스매치 (방장이 시작한다, 2명 이상 — 봇도 센다)
- 레드·블루 두 팀으로 나눈다 (번갈아 가며, 섞어서). 제한 시간(MATCH_SECONDS) 안에 먼저 KILL_TARGET킬을 채우거나,
  시간이 다 됐을 때 킬이 더 많은 팀이 이긴다. 같으면 무승부.
- 체력은 HP_MAX. 0이 되면 쓰러지고 RESPAWN_SECONDS초 뒤 적에게서 먼 자리에서 되살아나며, SPAWN_PROTECT초 동안 맞지 않는다.
- 총은 마우스로 겨눠 쏜다 (WEAPONS). 탄은 즉시 맞는 총알(히트스캔)이다: 쏜 사람 위치에서 방향으로 사거리까지 곧게 나가며,
  시선을 막는 것(벽·높은 가구·닫힌 문)에 막힌다. 낮은 가구는 넘어간다. 같은 팀은 맞지 않는다.
  경찰과 도둑의 체포처럼, 쏜 사람 화면에 보인 모습으로 판정하도록 맞는 사람이 최근 TAG_MAX초 안에 서 있던 자리 중 하나를 맞히면 맞은 것이다 (핑 보정).
- 권총은 탄이 무한. 맵에 놓인 상자(PICKUPS)를 밟으면 총(탄 가득)이나 구급상자를 얻고, 한 자리에서 PICKUP_RESPAWN초 뒤 다시 나온다.
  주무기는 하나만 들 수 있고(새로 주우면 바뀐다), 탄이 떨어지면 권총으로 돌아간다. 구급상자는 체력 MEDKIT_HEAL을 채운다.
- 사각지대는 경찰과 도둑과 같다: 상대 팀은 보일 때만 위치를 보낸다. 안 보이는 곳에서 쏜 총알도 보내지 않는다.
- 봇: 보이는 가장 가까운 적을 겨눠 쏘고(조금 빗나간다), 거리를 보며 다가가거나 옆으로 비킨다. 적이 안 보이면 상자를 줍거나 돌아다닌다.
"""
import math
import random

from . import untitled_world as base
from .untitled_maps import ALL_MAPS, LOBBY, MAPS, RADIUS

MAX_PLAYERS = base.MAX_PLAYERS
TEAMS = ("red", "blue")
HP_MAX = 100
SPEED = 4.3                    # 칸/초 (모두 같다)
HIT_RADIUS = 0.5               # 총알 선과 몸 중심이 이만큼 가까우면 맞는다 (칸)
RESPAWN_SECONDS, SPAWN_PROTECT = 3.0, 2.0
MATCH_SECONDS, KILL_TARGET = 180.0, 20
COUNTDOWN, RESULT_SECONDS = 3.0, 8.0
PICKUP_COUNT, PICKUP_RESPAWN, PICKUP_REACH = 7, 15.0, 0.9
MEDKIT_HEAL = 50
# dmg: 한 발(알)당, pellets: 한 번에 나가는 알 수, spread: 퍼짐(라디안), ammo: 주웠을 때 탄(None은 무한), cooldown: 연사 간격(초), auto: 누르고 있으면 연사
WEAPONS = {
    "pistol": {"name": "권총", "dmg": 20, "pellets": 1, "spread": 0.0, "range": 14.0, "cooldown": 0.38, "ammo": None, "auto": False},
    "rifle": {"name": "소총", "dmg": 11, "pellets": 1, "spread": 0.05, "range": 16.0, "cooldown": 0.12, "ammo": 36, "auto": True},
    "shotgun": {"name": "샷건", "dmg": 11, "pellets": 6, "spread": 0.2, "range": 8.0, "cooldown": 0.85, "ammo": 8, "auto": False},
    "sniper": {"name": "저격총", "dmg": 70, "pellets": 1, "spread": 0.0, "range": 20.0, "cooldown": 1.5, "ammo": 5, "auto": False},
}
PICKUP_KINDS = ("rifle", "shotgun", "sniper", "medkit")
VIEW_RANGE = base.VIEW_RANGE
BOT_AIM_ERROR, BOT_REACTION = 0.09, 0.3     # 봇 조준이 빗나가는 정도(라디안)와, 적의 위치를 다시 보는 간격(초)
BOT_FIRE_FRACTION = 0.85                    # 사거리의 이만큼 안에서만 쏜다
RESULT_KEYS = ("red", "blue")


def rules_view():
    return {"speed": {"lobby": base.SPEED["lobby"], "red": SPEED, "blue": SPEED, "cop": SPEED, "thief": SPEED},
            "run": {"mult": 1.0, "stamina": 1.0, "regen": 0.0, "recover": 0.0},
            "arrest": {"reach": 0, "cooldown": 0, "seconds": 1, "keep": 0, "slow": 1, "cop_slow": 1},
            "taser": {"range": WEAPONS["pistol"]["range"], "cooldown": 1, "stun": 0, "speed": 40},
            "view": VIEW_RANGE, "rescue": 0,
            "gun": {"hp": HP_MAX, "weapons": WEAPONS, "kill_target": KILL_TARGET, "respawn": RESPAWN_SECONDS, "protect": SPAWN_PROTECT,
                    "pickup_reach": PICKUP_REACH, "medkit_heal": MEDKIT_HEAL}}


def worlds_view():
    """총게임 화면에 보낼 맵들 (구출 발판은 쓰지 않으므로 뺀다)."""
    out = {}
    for key, m in ALL_MAPS.items():
        view = m.view(rules_view())
        view["pad"] = None
        out[key] = view
    return out


HIDDEN_KEYS = ("id", "name", "model", "team", "online", "bot", "kills", "deaths")


def visible_view(state, viewer_id):
    """viewer에게 보낼 상태: 게임 중에는 내게 안 보이는 상대 팀의 위치를 지우고, 그 사람이 쏜 총알도 뺀다."""
    if state.get("phase") not in ("countdown", "playing"):
        return state
    me = next((p for p in state["players"] if p["id"] == viewer_id), None)
    if me is None or me["team"] is None:
        return state
    m = ALL_MAPS[state["map"]]
    players, hidden = [], set()
    for p in state["players"]:
        near = (p["x"] - me["x"]) ** 2 + (p["y"] - me["y"]) ** 2 <= VIEW_RANGE ** 2
        if p["id"] == viewer_id or p["team"] == me["team"] or (near and m.can_see(me["x"], me["y"], p["x"], p["y"], state.get("doors", ()))):
            players.append(p)
        else:
            players.append({**{k: p[k] for k in HIDDEN_KEYS}, "hidden": True})
            hidden.add(p["id"])
    events = [e for e in state.get("events", ()) if not (e.get("t") == "gshot" and e.get("id") in hidden)]
    return {**state, "players": players, "events": events}


class GunPlayer(base.Player):
    def __init__(self, uid, name, model, x, y, now):
        super().__init__(uid, name, model, x, y, now)
        self.hp = HP_MAX
        self.weapon, self.ammo = "pistol", None
        self.fire_ready = 0.0
        self.dead_until = 0.0            # 쓰러져 있는 동안 다시 살아날 시각 (0이면 살아 있다)
        self.protect_until = 0.0
        self.kills = self.deaths = 0
        self.aim_noise = (0.0, 0.0)
        self.strafe = (1, 0.0)           # 봇이 옆으로 비키는 방향(±1)과 바꿀 시각

    def alive(self, now):
        return self.dead_until <= 0.0

    def speed(self):
        return SPEED if self.team else base.SPEED["lobby"]

    def speed_now(self, now):
        return self.speed()

    def public(self, now):
        w = WEAPONS[self.weapon]
        return {"id": self.uid, "name": self.name, "model": self.model, "x": round(self.x, 3), "y": round(self.y, 3),
                "dir": round(self.dir, 3), "moving": self.moving, "online": self.connected, "team": self.team, "jailed": False,
                "safe": round(max(0.0, self.protect_until - now), 1), "frozen": round(max(0.0, self.frozen_until - now), 1),
                "speed": self.speed(), "tp": self.tp, "bot": self.bot, "running": False,
                "hp": self.hp, "dead": round(max(0.0, self.dead_until - now), 1) if self.dead_until else 0, "weapon": self.weapon,
                "ammo": self.ammo, "ready": round(max(0.0, self.fire_ready - now), 2), "auto": w["auto"],
                "kills": self.kills, "deaths": self.deaths}


class GunRoom(base.Room):
    player_class = GunPlayer

    def __init__(self, code, host_id, name="", private=False, map_key=base.DEFAULT_MAP):
        super().__init__(code, host_id, name or "총게임", private, map_key)
        self.name = (name or "").strip()[:24] or "총게임"
        self.score = {"red": 0, "blue": 0}
        self.pickups = []                # {"id", "x", "y", "kind", "until"}: until은 먹혀서 다시 나올 시각 (0이면 놓여 있다)

    # ── 규칙 바깥(경찰과 도둑 전용)은 쓰지 않는다 ───────────────
    def arrest(self, *args, **kwargs):
        return False

    def release(self, *args, **kwargs):
        return False

    def taser(self, *args, **kwargs):
        return False

    def _solid(self, p):
        return p.dead_until <= 0.0

    def tag_window(self, shooter, target):
        return min(base.TAG_MAX, max(base.TAG_MIN, (shooter.rtt + target.rtt) / 2 + base.TAG_BASE))

    # ── 시작·끝 ─────────────────────────────────────────────────
    def start(self, uid, now=None):
        now = base.time.monotonic() if now is None else now
        if uid != self.host_id:
            return False, "방장만 시작할 수 있어요."
        if self.phase != "lobby":
            return False, "이미 진행 중이에요."
        people = list(self.players.values())
        if len(people) < 2:
            return False, "두 명 이상 있어야 시작할 수 있어요."
        self.rng.shuffle(people)
        self.map, self.doors_open = self.choice, frozenset()
        self.score = {"red": 0, "blue": 0}
        self.round_seconds = MATCH_SECONDS
        counts = {"red": 0, "blue": 0}
        for i, p in enumerate(people):
            p.team = TEAMS[i % 2]
            spots = self.map.cop_spawns if p.team == "red" else self.map.thief_spawns
            p.hp, p.weapon, p.ammo = HP_MAX, "pistol", None
            p.fire_ready = p.dead_until = p.protect_until = 0.0
            p.kills = p.deaths = 0
            p.teleport(*spots[counts[p.team] % len(spots)])
            counts[p.team] += 1
            p.reset_bot_plan()
            p.frozen_until = now + COUNTDOWN
            p.last = now
        self._place_pickups(now)
        self.phase, self.phase_end, self.result = "countdown", now + COUNTDOWN, None
        self.events.append({"t": "start"})
        self.dirty = True
        return True, ""

    def _place_pickups(self, now):
        m = self.map
        spots = []
        for _ in range(400):
            x, y = self.rng.uniform(1, m.w - 1), self.rng.uniform(1, m.h - 1)
            if m.walkable_at(x, y) and not m.in_jail(x, y) and all(math.hypot(x - sx, y - sy) > 5.0 for sx, sy in spots):
                spots.append((x, y))
            if len(spots) >= PICKUP_COUNT:
                break
        kinds = list(PICKUP_KINDS)
        self.pickups = [{"id": i, "x": round(x, 2), "y": round(y, 2), "kind": kinds[i % len(kinds)], "until": 0.0}
                        for i, (x, y) in enumerate(spots)]

    def update(self, now=None):
        now = base.time.monotonic() if now is None else now
        dt = 0.0 if self.last_update is None else min(0.3, max(0.0, now - self.last_update))
        self.last_update = now
        if self.phase in ("countdown", "playing") and dt:
            self._bots(dt, now)
        if self.phase == "countdown" and now >= self.phase_end:
            self.phase, self.phase_end = "playing", now + self.round_seconds
            self.events.append({"t": "go"})
            self.dirty = True
        elif self.phase == "playing":
            self._respawns(now)
            self._pickups(now)
            self._doors()
            self._check_end(now)
            self.dirty = True                                           # 남은 시간이 흐르므로 매번 보낸다
        elif self.phase == "result" and now >= self.phase_end:
            self._back_to_lobby(now)

    def _check_end(self, now):
        teams = {t: [p for p in self.players.values() if p.team == t] for t in TEAMS}
        winner = None
        if not teams["red"] or not teams["blue"]:
            winner = "blue" if not teams["red"] else "red"             # 한 팀이 다 나갔다
        elif max(self.score.values()) >= KILL_TARGET:
            winner = max(TEAMS, key=lambda t: self.score[t])
        elif self.phase == "playing" and now >= self.phase_end:
            a, b = self.score["red"], self.score["blue"]
            winner = "red" if a > b else "blue" if b > a else "draw"
        if winner:
            self.phase, self.phase_end = "result", now + RESULT_SECONDS
            self.result = {"winner": winner, "score": dict(self.score),
                           "stats": {p.uid: {"kills": p.kills, "deaths": p.deaths, "team": p.team} for p in self.players.values() if p.team}}
            self.events.append({"t": "end", "winner": winner})
            self.dirty = True

    def _back_to_lobby(self, now):
        self.phase, self.result = "lobby", None
        self.map, self.doors_open, self.pickups = LOBBY, frozenset(), []
        for i, p in enumerate(self.players.values()):
            p.team = None
            p.hp, p.weapon, p.ammo = HP_MAX, "pistol", None
            p.fire_ready = p.dead_until = p.protect_until = p.frozen_until = 0.0
            p.teleport(*self.map.lobby_spawns[i % len(self.map.lobby_spawns)])
            p.last = now
        self.events.append({"t": "lobby"})
        self.dirty = True

    # ── 총 ──────────────────────────────────────────────────────
    def _ray_end(self, x, y, dx, dy, length):
        """(x, y)에서 (dx, dy) 방향으로 length까지 쏠 때 시선을 막는 것에 닿기 전까지의 길이."""
        m = self.map
        if m.can_see(x, y, x + dx * length, y + dy * length, self.doors_open):
            return length
        lo, hi = 0.0, length
        for _ in range(12):
            mid = (lo + hi) / 2
            if m.can_see(x, y, x + dx * mid, y + dy * mid, self.doors_open):
                lo = mid
            else:
                hi = mid
        return lo

    def shoot(self, uid, direction, now=None):
        """총을 쏜다. 쐈으면 True (맞혔든 빗나갔든)."""
        now = base.time.monotonic() if now is None else now
        p = self.players.get(uid)
        if p is None or self.phase != "playing" or p.team is None or p.dead_until > 0 or now < p.fire_ready or now < p.frozen_until:
            return False
        try:
            direction = float(direction)
        except (TypeError, ValueError):
            return False
        if not math.isfinite(direction):
            return False
        wkey = p.weapon
        w = WEAPONS[wkey]
        p.fire_ready = now + w["cooldown"] * 0.92                       # 화면 시계와 조금 어긋나도 받도록 아주 조금 봐준다
        p.dir = direction
        enemies = [q for q in self.players.values() if q.team and q.team != p.team and q.dead_until <= 0 and now >= q.protect_until]
        damage, ends = {}, []
        for _ in range(w["pellets"]):
            ang = direction + (self.rng.uniform(-w["spread"], w["spread"]) if w["spread"] else 0.0)
            dx, dy = math.sin(ang), math.cos(ang)
            reach = self._ray_end(p.x, p.y, dx, dy, w["range"])
            best, best_s = None, reach
            for q in enemies:
                window = self.tag_window(p, q)
                spots = [(q.x, q.y)] + [(tx, ty) for t, tx, ty in q.trail if now - t <= window]
                for qx, qy in spots:
                    s = (qx - p.x) * dx + (qy - p.y) * dy                 # 쏜 선 위에서의 위치
                    if s < 0 or s > best_s + HIT_RADIUS:
                        continue
                    off = abs((qx - p.x) * dy - (qy - p.y) * dx)          # 선에서 옆으로 떨어진 거리
                    if off <= HIT_RADIUS and s <= best_s + 1e-6:
                        best, best_s = q, s
            end = best_s if best is not None else reach
            ends.append([round(p.x + dx * end, 2), round(p.y + dy * end, 2)])
            if best is not None:
                damage[best.uid] = damage.get(best.uid, 0) + w["dmg"]
        if p.ammo is not None:
            p.ammo -= 1
            if p.ammo <= 0:
                p.weapon, p.ammo = "pistol", None
        self.events.append({"t": "gshot", "id": uid, "x": round(p.x, 2), "y": round(p.y, 2), "dir": round(direction, 3), "w": wkey, "ends": ends})
        for target_id, dmg in damage.items():
            self._hurt(self.players[target_id], dmg, p, now, wkey)
        self.dirty = True
        return True

    def _hurt(self, victim, dmg, shooter, now, wkey):
        victim.hp -= dmg
        self.events.append({"t": "hit", "id": victim.uid, "by": shooter.uid, "dmg": dmg})
        if victim.hp > 0:
            return
        victim.hp = 0
        victim.deaths += 1
        shooter.kills += 1
        self.score[shooter.team] += 1
        victim.dead_until = now + RESPAWN_SECONDS
        victim.frozen_until = victim.dead_until
        victim.moving, victim.weapon, victim.ammo = False, "pistol", None
        self.events.append({"t": "kill", "killer": shooter.uid, "victim": victim.uid, "w": wkey})

    def _respawns(self, now):
        for p in self.players.values():
            if p.dead_until > 0 and now >= p.dead_until:
                p.dead_until, p.hp, p.fire_ready = 0.0, HP_MAX, 0.0
                p.protect_until = now + SPAWN_PROTECT
                p.frozen_until = 0.0
                p.teleport(*self._spawn_spot(p))
                p.last = now
                p.reset_bot_plan()
                self.events.append({"t": "respawn", "id": p.uid})

    def _spawn_spot(self, p):
        """되살아날 자리: 시작 자리들 중 적에게서 가장 먼 곳."""
        m = self.map
        foes = [(q.x, q.y) for q in self.players.values() if q.team and q.team != p.team and q.dead_until <= 0]
        spots = list(m.cop_spawns) + list(m.thief_spawns)
        if not foes:
            return self.rng.choice(spots)
        return max(spots, key=lambda s: min(math.hypot(s[0] - fx, s[1] - fy) for fx, fy in foes) + self.rng.uniform(0, 1.5))

    def _pickups(self, now):
        for item in self.pickups:
            if item["until"]:
                if now < item["until"]:
                    continue
                item["until"] = 0.0
                self.events.append({"t": "spawn", "id": item["id"]})
            for p in self.players.values():
                if p.team is None or p.dead_until > 0 or math.hypot(p.x - item["x"], p.y - item["y"]) > PICKUP_REACH:
                    continue
                if item["kind"] == "medkit":
                    if p.hp >= HP_MAX:
                        continue                                          # 꽉 찬 사람은 아껴 둔다
                    p.hp = min(HP_MAX, p.hp + MEDKIT_HEAL)
                else:
                    p.weapon, p.ammo = item["kind"], WEAPONS[item["kind"]]["ammo"]
                    p.fire_ready = max(p.fire_ready, now + 0.25)
                item["until"] = now + PICKUP_RESPAWN
                self.events.append({"t": "pickup", "id": item["id"], "by": p.uid, "kind": item["kind"]})
                self.dirty = True
                break

    # ── 봇 ─────────────────────────────────────────────────────
    def _bots(self, dt, now):
        people = list(self.players.values())
        for b in people:
            if not b.bot or b.team is None or b.dead_until > 0 or now < b.frozen_until:
                continue
            goal = self._bot_goal(b, people, now)
            if goal is None:
                if b.moving:
                    b.moving = False
                    self.dirty = True
                continue
            self._bot_move(b, goal, dt, now, people)

    def _bot_goal(self, b, people, now):
        m = self.map
        foes = [q for q in people if q.team and q.team != b.team and q.dead_until <= 0 and now >= q.protect_until
                and math.hypot(q.x - b.x, q.y - b.y) <= VIEW_RANGE and m.can_see(b.x, b.y, q.x, q.y, self.doors_open)]
        if foes:
            t = min(foes, key=lambda q: (q.x - b.x) ** 2 + (q.y - b.y) ** 2)
            seen = b.seen
            if seen is None or seen[0] != t.uid or now - seen[3] >= BOT_REACTION:      # 사람처럼 조금 늦게 다시 겨눈다
                seen = b.seen = (t.uid, t.x, t.y, now)
            d = math.hypot(seen[1] - b.x, seen[2] - b.y)
            w = WEAPONS[b.weapon]
            b.dir = math.atan2(seen[1] - b.x, seen[2] - b.y)
            if d <= w["range"] * BOT_FIRE_FRACTION and now >= b.fire_ready:
                self.shoot(b.uid, b.dir + self.rng.uniform(-BOT_AIM_ERROR, BOT_AIM_ERROR), now)
            b.wander = None
            ideal = min(6.0, w["range"] * 0.5)
            if d > ideal + 1.5:
                return seen[1], seen[2], False                                         # 다가간다
            side, until = b.strafe                                                    # 가까우면 옆으로 비킨다
            if now >= until:
                side, until = self.rng.choice((1, -1)), now + self.rng.uniform(0.8, 1.8)
                b.strafe = (side, until)
            px, py = (b.y - seen[2]) * side, -(b.x - seen[1]) * side
            norm = math.hypot(px, py) or 1.0
            gx, gy = b.x + px / norm * 2.0, b.y + py / norm * 2.0
            if d < ideal - 1.5:                                                       # 너무 가까우면 뒤로도 물러난다
                gx, gy = gx + (b.x - seen[1]) / (d or 1) * 1.5, gy + (b.y - seen[2]) / (d or 1) * 1.5
            return (gx, gy, False) if m.free_at(gx, gy) else (seen[1], seen[2], False)
        if b.seen is not None and math.hypot(b.seen[1] - b.x, b.seen[2] - b.y) > 0.6:
            return b.seen[1], b.seen[2], False                                         # 마지막으로 본 자리로 가 본다
        b.seen = None
        wanted = [i for i in self.pickups if not i["until"] and (b.weapon == "pistol" and i["kind"] != "medkit" or b.hp < HP_MAX * 0.6 and i["kind"] == "medkit")]
        if wanted:
            i = min(wanted, key=lambda i: math.hypot(i["x"] - b.x, i["y"] - b.y))
            if math.hypot(i["x"] - b.x, i["y"] - b.y) < 14.0:
                return i["x"], i["y"], False
        return self._wander(b, [], now)

    # ── 상태 ────────────────────────────────────────────────────
    def snapshot(self, now=None):
        now = base.time.monotonic() if now is None else now
        return {"code": self.code, "name": self.name, "private": self.private, "host": self.host_id, "phase": self.phase,
                "map": self.map.key, "choice": self.choice.key,
                "left": round(max(0.0, self.phase_end - now), 1) if self.phase != "lobby" else None,
                "doors": sorted(self.doors_open), "score": dict(self.score), "target": KILL_TARGET,
                "pickups": [{"id": i["id"], "x": i["x"], "y": i["y"], "kind": i["kind"], "on": not i["until"]} for i in self.pickups],
                "result": self.result, "players": [p.public(now) for p in self.players.values()]}


new_code = base.new_code
