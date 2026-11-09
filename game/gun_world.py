"""총게임: 경찰과 도둑의 방·맵·이동 검증·사각지대·봇 엔진 위에서 하는 라운드제 팀 대전 (DB를 쓰지 않는 순수 파이썬).

방, 맵 고르기, 이동 검증(속도 한도·벽·충돌), 핑 보정, 문, 이모티콘, 봇 길찾기는 untitled_world.Room을 그대로 쓴다.
여기서는 규칙만 바꾼다. 발로란트·카스처럼 라운드마다 총을 사서 싸운다.

대기실: 대기실 왼쪽 레드 자리·오른쪽 블루 자리에 서면 그 팀이 된다(버튼으로도 옮길 수 있다). 방장은 팀마다 봇을 넣는다.
  어느 자리에도 안 선 사람은 시작할 때 사람이 적은 팀으로 들어간다. 두 팀 모두 한 명 이상이어야 시작한다.

라운드제 (방장이 시작한다, 2명 이상 — 봇도 센다)
- 레드·블루 두 팀. 먼저 ROUNDS_TO_WIN라운드를 이긴 팀이 이긴다. SWAP_EVERY라운드마다 시작 자리(맵의 양 끝)를 서로 바꾼다.
- 한 라운드: 구매 시간(BUY_SECONDS, 제자리에 서서 산다) → 교전(ROUND_SECONDS) → 잠깐 결과(ROUND_END_SECONDS).
  구매 시간에는 자기 기지(맵마다 정해진 구역) 안에서 움직일 수 있지만 나갈 수는 없다(기지 출구가 잠긴다). 교전이 시작되면 열린다.
  맵에는 A·B 사이트가 있어 위치를 안내하는 데 쓴다 (gun_layout).
  교전 중에는 부활이 없고, 쓰러지면 살아 있는 팀원을 관전한다. 상대 팀이 모두 쓰러지면 이긴다.
  시간이 다 되면 살아 있는 사람이 많은 팀이, 같으면 남은 체력 합이 많은 팀이 이긴다. 그것도 같으면 무승부(점수 없음).
- 돈: 처음 START_MONEY. 라운드가 끝나면 이긴 팀 WIN_BONUS, 진 팀은 LOSS_BASE에서 연패마다 LOSS_STEP씩 늘어난 보너스(최대 LOSS_MAX연패분),
  킬마다 무기별 보상(KILL_REWARD). MAX_MONEY까지 가질 수 있다. 같은 팀을 쏘는 일은 없다.
- 구매 시간에 PRICES의 무기(주무기는 하나만, 새로 사면 바뀐다)와 방어구를 산다. 권총은 기본 무기이고 탄이 무한이다.
  살아남은 사람은 다음 라운드에도 무기·방어구·탄을 그대로 갖고, 쓰러진 사람은 권총만 들고 다시 시작한다. 체력은 라운드마다 가득 찬다.
- 방어구(ARMOR_MAX)가 있으면 받는 피해가 ARMOR_ABSORB만큼 줄고, 줄어든 만큼 방어구가 닳는다.
- 총은 마우스로 겨눠 쏜다 (WEAPONS). 탄은 즉시 맞는 총알(히트스캔)이다: 쏜 사람 위치에서 방향으로 사거리까지 곧게 나가며,
  시선을 막는 것(벽·높은 가구·닫힌 문)에 막힌다. 낮은 가구는 넘어간다. 같은 팀은 맞지 않는다. 움직이면서 쏘면 더 퍼진다(MOVE_SPREAD).
  쏜 사람 화면에 보인 모습으로 판정하도록 맞는 사람이 최근 TAG_MAX초 안에 서 있던 자리 중 하나를 맞히면 맞은 것이다 (핑 보정).
- 사각지대는 경찰과 도둑과 같다: 상대 팀은 보일 때만 위치를 보낸다. 안 보이는 곳에서 쏜 총알도 보내지 않는다.
  쓰러진 사람은 관전 중인 팀원이 보는 것을 본다. 라운드가 끝난 뒤에는 모두 보인다.
- 봇: 구매 시간에 가진 돈으로 무기를 사고, 보이는 가장 가까운 적을 겨눠 쏘며(조금 빗나간다) 다가가거나 옆으로 비킨다.
  적이 안 보이면 상대 시작 자리 쪽을 향해 돌아다닌다.
"""
import math

from . import gun_layout as lay
from . import untitled_world as base
from .untitled_maps import ALL_MAPS, LOBBY

MAX_PLAYERS = base.MAX_PLAYERS
TEAMS = ("red", "blue")
HP_MAX = 100
SPEED = 4.3                    # 칸/초 (모두 같다)
HIT_RADIUS = 0.5               # 총알 선과 몸 중심이 이만큼 가까우면 맞는다 (칸)
MOVE_SPREAD = 0.05             # 움직이는 동안 더해지는 퍼짐 (라디안)
ROUNDS_TO_WIN, SWAP_EVERY = 5, 3
BUY_SECONDS, ROUND_SECONDS, ROUND_END_SECONDS, RESULT_SECONDS = 12.0, 75.0, 5.0, 8.0
START_MONEY, MAX_MONEY = 800, 16000
WIN_BONUS, LOSS_BASE, LOSS_STEP, LOSS_MAX = 3250, 1400, 500, 4
KILL_REWARD = {"pistol": 300, "rifle": 300, "shotgun": 900, "sniper": 100}
PRICES = {"shotgun": 1200, "rifle": 2700, "sniper": 4750, "armor": 650}
ARMOR_MAX, ARMOR_ABSORB = 100, 0.5
# dmg: 한 발(알)당, pellets: 한 번에 나가는 알 수, spread: 퍼짐(라디안), ammo: 산 직후 탄(None은 무한), cooldown: 연사 간격(초), auto: 누르고 있으면 연사
WEAPONS = {
    "pistol": {"name": "권총", "dmg": 20, "pellets": 1, "spread": 0.0, "range": 14.0, "cooldown": 0.38, "ammo": None, "auto": False},
    "rifle": {"name": "소총", "dmg": 14, "pellets": 1, "spread": 0.05, "range": 16.0, "cooldown": 0.12, "ammo": 60, "auto": True},
    "shotgun": {"name": "샷건", "dmg": 11, "pellets": 6, "spread": 0.2, "range": 8.0, "cooldown": 0.85, "ammo": 14, "auto": False},
    "sniper": {"name": "저격총", "dmg": 70, "pellets": 1, "spread": 0.0, "range": 20.0, "cooldown": 1.5, "ammo": 10, "auto": False},
}
VIEW_RANGE = base.VIEW_RANGE
BOT_AIM_ERROR, BOT_REACTION = 0.09, 0.3     # 봇 조준이 빗나가는 정도(라디안)와, 적의 위치를 다시 보는 간격(초)
BOT_FIRE_FRACTION = 0.85                    # 사거리의 이만큼 안에서만 쏜다
PHASES_FOG = ("buy", "playing")             # 사각지대가 적용되는 단계 (결과 화면에서는 모두 보인다)


def rules_view():
    return {"speed": {"lobby": base.SPEED["lobby"], "red": SPEED, "blue": SPEED, "cop": SPEED, "thief": SPEED},
            "run": {"mult": 1.0, "stamina": 1.0, "regen": 0.0, "recover": 0.0},
            "arrest": {"reach": 0, "cooldown": 0, "seconds": 1, "keep": 0, "slow": 1, "cop_slow": 1},
            "taser": {"range": WEAPONS["pistol"]["range"], "cooldown": 1, "stun": 0, "speed": 40},
            "view": VIEW_RANGE, "rescue": 0,
            "gun": {"hp": HP_MAX, "weapons": WEAPONS, "prices": PRICES, "rounds_to_win": ROUNDS_TO_WIN, "move_spread": MOVE_SPREAD,
                    "armor_max": ARMOR_MAX, "buy_seconds": BUY_SECONDS}}


def worlds_view():
    """총게임 화면에 보낼 맵들 (구출 발판은 쓰지 않으므로 뺀다)."""
    out = {}
    for key, m in ALL_MAPS.items():
        view = m.view(rules_view())
        view["pad"] = None
        view["gun_layout"] = lay.LAYOUTS[key].view() if key in lay.LAYOUTS else None
        view["gun_pads"] = lay.LOBBY_PADS if key == LOBBY.key else None
        out[key] = view
    return out


HIDDEN_KEYS = ("id", "name", "model", "team", "online", "bot", "kills", "deaths", "alive")


def visible_view(state, viewer_id):
    """viewer에게 보낼 상태: 구매·교전 중에는 내(쓰러졌다면 관전 중인 팀원)가 볼 수 없는 상대 팀의 위치를 지우고, 그 사람이 쏜 총알도 뺀다."""
    if state.get("phase") not in PHASES_FOG:
        return state
    me = next((p for p in state["players"] if p["id"] == viewer_id), None)
    if me is None or me["team"] is None:
        return state
    eye = me
    if not me.get("alive", True):                                     # 쓰러졌으면 관전 중인 팀원의 눈으로 본다
        eye = next((p for p in state["players"] if p["id"] == me.get("spec") and p.get("alive") and p.get("x") is not None), None)
        if eye is None:
            eye = next((p for p in state["players"] if p["team"] == me["team"] and p.get("alive") and p.get("x") is not None), me)
    m = ALL_MAPS[state["map"]]
    players, hidden = [], set()
    for p in state["players"]:
        near = (p["x"] - eye["x"]) ** 2 + (p["y"] - eye["y"]) ** 2 <= VIEW_RANGE ** 2
        if p["id"] == viewer_id or p["team"] == me["team"] or (near and m.can_see(eye["x"], eye["y"], p["x"], p["y"], state.get("doors", ()))):
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
        self.armor = 0
        self.money = 0
        self.weapon, self.ammo = "pistol", None
        self.fire_ready = 0.0
        self.alive = True
        self.spec = None                 # 쓰러졌을 때 보고 있는 팀원
        self.pref = None                 # 대기실에서 서 있는 팀 자리 ("red"/"blue"/None)
        self.kills = self.deaths = 0
        self.strafe = (1, 0.0)           # 봇이 옆으로 비키는 방향(±1)과 바꿀 시각

    def speed(self):
        return SPEED if self.team else base.SPEED["lobby"]

    def speed_now(self, now):
        return self.speed()

    def public(self, now):
        w = WEAPONS[self.weapon]
        return {"id": self.uid, "name": self.name, "model": self.model, "x": round(self.x, 3), "y": round(self.y, 3),
                "dir": round(self.dir, 3), "moving": self.moving, "online": self.connected, "team": self.team, "jailed": False,
                "safe": 0, "frozen": round(max(0.0, min(self.frozen_until - now, 99.0)), 1),
                "speed": self.speed(), "tp": self.tp, "bot": self.bot, "running": False,
                "hp": self.hp, "armor": self.armor, "money": self.money, "alive": self.alive, "spec": self.spec, "pref": self.pref,
                "weapon": self.weapon, "ammo": self.ammo, "ready": round(max(0.0, self.fire_ready - now), 2), "auto": w["auto"],
                "kills": self.kills, "deaths": self.deaths}


class GunRoom(base.Room):
    player_class = GunPlayer

    def __init__(self, code, host_id, name="", private=False, map_key=base.DEFAULT_MAP):
        super().__init__(code, host_id, name or "총게임", private, map_key)
        self.name = (name or "").strip()[:24] or "총게임"
        self.score = {"red": 0, "blue": 0}
        self.round = 0
        self.loss_streak = {"red": 0, "blue": 0}
        self.round_result = None         # 방금 끝난 라운드: {"winner", "bonus": {...}}

    def add(self, uid, name, now=None):
        """대기실에서는 어느 팀 자리도 아닌 가운데에서 시작한다 (경찰과 도둑의 대기실 고리는 팀 자리에 걸친다). 재접속은 제자리."""
        known = uid in self.players
        ok, message = super().add(uid, name, now)
        p = self.players.get(uid)
        if ok and not known and p is not None and self.phase == "lobby":
            taken = [(q.x, q.y) for q in self.players.values() if q is not p]
            p.x, p.y = next((s for s in lay.LOBBY_NEUTRAL if all(math.hypot(s[0] - x, s[1] - y) > 0.9 for x, y in taken)), lay.LOBBY_NEUTRAL[0])
            p.pref = None
        return ok, message

    # ── 경찰과 도둑 전용 동작은 쓰지 않는다 ───────────────────
    def arrest(self, *args, **kwargs):
        return False

    def release(self, *args, **kwargs):
        return False

    def taser(self, *args, **kwargs):
        return False

    def _solid(self, p):
        return p.alive

    def tag_window(self, shooter, target):
        return min(base.TAG_MAX, max(base.TAG_MIN, (shooter.rtt + target.rtt) / 2 + base.TAG_BASE))

    # ── 경기 ────────────────────────────────────────────────────
    def start(self, uid, now=None):
        now = base.time.monotonic() if now is None else now
        if uid != self.host_id:
            return False, "방장만 시작할 수 있어요."
        if self.phase != "lobby":
            return False, "이미 진행 중이에요."
        people = list(self.players.values())
        if len(people) < 2:
            return False, "두 명 이상 있어야 시작할 수 있어요."
        teams = {"red": [p for p in people if p.pref == "red"], "blue": [p for p in people if p.pref == "blue"]}
        neutral = [p for p in people if p.pref is None]
        self.rng.shuffle(neutral)
        for p in neutral:                                                  # 자리에 안 선 사람은 적은 팀으로
            a, b = len(teams["red"]), len(teams["blue"])
            teams["red" if a < b or (a == b and self.rng.random() < 0.5) else "blue"].append(p)
        if not teams["red"] or not teams["blue"]:
            return False, "레드와 블루 팀에 각각 한 명 이상 있어야 해요. 자리를 옮기거나 봇을 넣어 주세요."
        self.map, self.doors_open = self.choice, frozenset()
        self.score, self.round, self.result, self.round_result = {"red": 0, "blue": 0}, 0, None, None
        self.loss_streak = {"red": 0, "blue": 0}
        for team, members in teams.items():
            for p in members:
                p.team, p.pref = team, None
                p.money = START_MONEY
                p.weapon, p.ammo, p.armor = "pistol", None, 0
                p.kills = p.deaths = 0
                p.alive = True
        self.events.append({"t": "start"})
        self._new_round(now)
        return True, ""

    def _side(self):
        """0이면 레드가 첫째 기지, 1이면 블루가 첫째 기지 (SWAP_EVERY라운드마다 바뀐다)."""
        return ((self.round - 1) // SWAP_EVERY) % 2

    def _base(self, team):
        """이번 라운드에 이 팀이 쓰는 기지: gun_layout의 {"areas", "gates", "spawns", "rect"}."""
        bases = lay.LAYOUTS[self.map.key].bases
        return bases[self._side() if team == "red" else 1 - self._side()]

    def _spawns(self, team):
        return self._base(team)["spawns"]

    def _locks(self):
        """구매 시간 동안 잠긴 기지 출구 (화면이 막이를 그리고 그 밖으로 못 나가게 한다)."""
        if self.phase != "buy":
            return None
        return {t: {"areas": self._base(t)["areas"], "gates": [list(g) for g in self._base(t)["gates"]]} for t in TEAMS}

    def move(self, uid, x, y, direction, moving, now=None, run=False):
        p = self.players.get(uid)
        if p is not None and p.team is not None and self.phase == "buy":      # 구매 시간에는 기지 안에서만
            try:
                fx, fy = float(x), float(y)
            except (TypeError, ValueError):
                return False
            if not lay.inside(self.map, self._base(p.team)["areas"], fx, fy):
                return False
        return super().move(uid, x, y, direction, moving, now=now, run=run)

    def _new_round(self, now):
        """새 라운드의 구매 시간: 모두 자기 시작 자리에 서고 체력이 찬다. 쓰러졌던 사람은 권총만 든다."""
        self.round += 1
        self.round_result = None
        used = {"red": 0, "blue": 0}
        for p in self.players.values():
            if p.team is None:
                continue
            if not p.alive:
                p.weapon, p.ammo, p.armor = "pistol", None, 0
            p.alive, p.hp, p.spec = True, HP_MAX, None
            p.fire_ready = 0.0
            spots = self._spawns(p.team)
            p.teleport(*spots[used[p.team] % len(spots)])
            used[p.team] += 1
            p.reset_bot_plan()
            p.frozen_until = 0.0
            p.last = now
        self.phase, self.phase_end = "buy", now + BUY_SECONDS
        self.events.append({"t": "round", "n": self.round})
        self._bots_buy()
        self.dirty = True

    def update(self, now=None):
        now = base.time.monotonic() if now is None else now
        dt = 0.0 if self.last_update is None else min(0.3, max(0.0, now - self.last_update))
        self.last_update = now
        if self.phase == "playing" and dt:
            self._bots(dt, now)
        if self.phase == "lobby":
            self._pads()
        if self.phase == "buy" and now >= self.phase_end:
            self.phase, self.phase_end = "playing", now + ROUND_SECONDS
            self.events.append({"t": "go"})
            self.dirty = True
        elif self.phase == "playing":
            self._doors()
            self._follow()
            self._check_round(now)
            self.dirty = True                                           # 남은 시간이 흐르므로 매번 보낸다
        elif self.phase == "round_end" and now >= self.phase_end:
            if self.result is not None:
                self.phase, self.phase_end = "result", now + RESULT_SECONDS
            else:
                self._new_round(now)
        elif self.phase == "result" and now >= self.phase_end:
            self._back_to_lobby(now)

    def _alive(self, team):
        return [p for p in self.players.values() if p.team == team and p.alive]

    def _check_round(self, now):
        red, blue = self._alive("red"), self._alive("blue")
        winner = None
        if not blue and not red:
            winner = "draw"
        elif not blue:
            winner = "red"
        elif not red:
            winner = "blue"
        elif now >= self.phase_end:
            if len(red) != len(blue):
                winner = "red" if len(red) > len(blue) else "blue"
            else:
                hr, hb = sum(p.hp for p in red), sum(p.hp for p in blue)
                winner = "red" if hr > hb else "blue" if hb > hr else "draw"
        if winner:
            self._end_round(winner, now)

    def _end_round(self, winner, now):
        bonus = {}
        for team in TEAMS:
            if winner == team:
                gain, self.loss_streak[team] = WIN_BONUS, 0
            else:
                gain = LOSS_BASE + LOSS_STEP * min(self.loss_streak[team], LOSS_MAX)
                self.loss_streak[team] += 1
            bonus[team] = gain
            for p in self.players.values():
                if p.team == team:
                    p.money = min(MAX_MONEY, p.money + gain)
        if winner != "draw":
            self.score[winner] += 1
        self.round_result = {"winner": winner, "bonus": bonus, "round": self.round}
        self.phase, self.phase_end = "round_end", now + ROUND_END_SECONDS
        self.events.append({"t": "round_end", "winner": winner})
        top = max(self.score.values())
        if top >= ROUNDS_TO_WIN:
            champ = max(TEAMS, key=lambda t: self.score[t])
            self._finish(champ)
        self.dirty = True

    def _finish(self, champ):
        self.result = {"winner": champ, "score": dict(self.score), "rounds": self.round,
                       "stats": {p.uid: {"kills": p.kills, "deaths": p.deaths, "team": p.team} for p in self.players.values() if p.team}}
        self.events.append({"t": "end", "winner": champ})

    def _back_to_lobby(self, now):
        """경기가 끝나면 대기실로: 같은 팀끼리 그 팀 자리에 모여 다시 할 수 있다."""
        self.phase, self.result, self.round_result = "lobby", None, None
        self.map, self.doors_open = LOBBY, frozenset()
        used = {"red": 0, "blue": 0}
        for i, p in enumerate(self.players.values()):
            team = p.team
            p.team = None
            p.hp, p.armor, p.money, p.weapon, p.ammo, p.alive, p.spec = HP_MAX, 0, 0, "pistol", None, True, None
            p.fire_ready = p.frozen_until = 0.0
            if team in lay.LOBBY_SPOTS:
                spots = lay.LOBBY_SPOTS[team]
                p.teleport(*spots[used[team] % len(spots)])
                used[team] += 1
                p.pref = team
            else:
                p.teleport(*lay.LOBBY_NEUTRAL[i % len(lay.LOBBY_NEUTRAL)])
                p.pref = None
            p.last = now
        self.events.append({"t": "lobby"})
        self.dirty = True

    def _check_end(self, now):
        """Room.remove가 부르는 자리: 총게임은 아래 remove에서 직접 판정한다."""

    def remove(self, uid, now=None):
        super().remove(uid, now)
        now = base.time.monotonic() if now is None else now
        if self.phase in ("buy", "playing", "round_end") and self.result is None:
            teams = {t: [p for p in self.players.values() if p.team == t] for t in TEAMS}
            if not teams["red"] or not teams["blue"]:                   # 한 팀이 다 나갔다: 남은 팀이 이긴다
                self._finish("red" if teams["red"] else "blue")
                self.phase, self.phase_end = "result", now + RESULT_SECONDS
            elif self.phase == "playing":
                self._check_round(now)
            self.dirty = True

    # ── 대기실 팀 자리 ──────────────────────────────────────────
    def _pads(self):
        """대기실에서 누가 어느 팀 자리에 서 있는지 갱신한다."""
        for p in self.players.values():
            pref = lay.lobby_pref(p.x, p.y)
            if pref != p.pref:
                p.pref = pref
                self.dirty = True

    def _to_pad(self, p, team):
        """p를 team 자리의 비어 있는 곳으로 옮긴다 (team이 None이면 대기실 가운데로)."""
        if team is None:
            x, y = self.rng.choice(LOBBY.lobby_spawns)
        else:
            others = [(q.x, q.y) for q in self.players.values() if q is not p]
            spots = lay.LOBBY_SPOTS[team]
            x, y = max(spots, key=lambda s: min((math.hypot(s[0] - ox, s[1] - oy) for ox, oy in others), default=9.0))
        p.teleport(x, y)
        p.pref = team
        self.dirty = True

    def set_team(self, uid, team, now=None):
        """대기실에서 team("red"/"blue", 그 밖은 자리에서 내려오기)으로 옮긴다. 성공하면 "", 아니면 오류 문구."""
        p = self.players.get(uid)
        if p is None or self.phase != "lobby":
            return "대기실에서만 팀을 옮길 수 있어요."
        self._to_pad(p, team if team in TEAMS else None)
        return ""

    def add_bot(self, uid, now=None, team=None):
        """방장이 대기실에서 봇을 넣는다 (team을 주면 그 팀 자리에 선다)."""
        result = super().add_bot(uid, now)
        if isinstance(result, int) and team in TEAMS:
            self._to_pad(self.players[result], team)
        return result

    # ── 구매 ────────────────────────────────────────────────────
    def buy(self, uid, item, now=None):
        """구매 시간에 무기나 방어구를 산다. (성공 여부, 오류 문구)"""
        p = self.players.get(uid)
        if p is None or p.team is None or self.phase != "buy":
            return False, "구매 시간에만 살 수 있어요."
        price = PRICES.get(item)
        if price is None:
            return False, "없는 물건이에요."
        if price > p.money:
            return False, "돈이 모자라요."
        if item == "armor":
            if p.armor >= ARMOR_MAX:
                return False, "방어구를 이미 입었어요."
            p.armor = ARMOR_MAX
        else:
            if p.weapon == item and p.ammo == WEAPONS[item]["ammo"]:
                return False, "이미 가지고 있어요."
            p.weapon, p.ammo = item, WEAPONS[item]["ammo"]
        p.money -= price
        self.events.append({"t": "buy", "id": uid, "item": item})
        self.dirty = True
        return True, ""

    def _bots_buy(self):
        for p in self.players.values():
            if not p.bot or p.team is None:
                continue
            if p.weapon == "pistol":
                for item, chance in (("sniper", 0.25), ("rifle", 1.0), ("shotgun", 0.5)):
                    if p.money >= PRICES[item] and self.rng.random() < chance:
                        self.buy(p.uid, item)
                        break
            if p.armor == 0 and p.money >= PRICES["armor"]:
                self.buy(p.uid, "armor")

    # ── 관전 ────────────────────────────────────────────────────
    def _follow(self):
        """쓰러진 사람이 보고 있는 팀원이 쓰러졌거나 없으면 살아 있는 다른 팀원으로 옮긴다."""
        for p in self.players.values():
            if p.team is None or p.alive:
                continue
            mates = [q.uid for q in self._alive(p.team)]
            if p.spec not in mates:
                p.spec = mates[0] if mates else None

    def spectate(self, uid, step=1):
        """쓰러진 사람이 보는 팀원을 바꾼다 (step: 1이면 다음, -1이면 이전)."""
        p = self.players.get(uid)
        if p is None or p.alive or p.team is None or self.phase not in ("playing", "round_end"):
            return False
        mates = sorted(q.uid for q in self._alive(p.team))
        if not mates:
            return False
        i = mates.index(p.spec) if p.spec in mates else -1
        p.spec = mates[(i + (1 if step >= 0 else -1)) % len(mates)]
        self.dirty = True
        return True

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
        if p is None or self.phase != "playing" or p.team is None or not p.alive or now < p.fire_ready or now < p.frozen_until:
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
        spread = w["spread"] + (MOVE_SPREAD if p.moving else 0.0)
        enemies = [q for q in self.players.values() if q.team and q.team != p.team and q.alive]
        damage, ends = {}, []
        for _ in range(w["pellets"]):
            ang = direction + (self.rng.uniform(-spread, spread) if spread else 0.0)
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
        if victim.armor > 0:                                             # 방어구가 피해를 덜어 주고 그만큼 닳는다
            soaked = min(victim.armor, round(dmg * ARMOR_ABSORB))
            victim.armor -= soaked
            dmg -= soaked
        victim.hp -= dmg
        self.events.append({"t": "hit", "id": victim.uid, "by": shooter.uid, "dmg": dmg})
        if victim.hp > 0:
            return
        victim.hp, victim.alive, victim.moving = 0, False, False
        victim.frozen_until = now + 10 ** 6                              # 이번 라운드가 끝날 때까지 움직이지 못한다
        victim.deaths += 1
        shooter.kills += 1
        shooter.money = min(MAX_MONEY, shooter.money + KILL_REWARD.get(wkey, 300))
        victim.spec = None
        self.events.append({"t": "kill", "killer": shooter.uid, "victim": victim.uid, "w": wkey})

    # ── 봇 ─────────────────────────────────────────────────────
    def _bots(self, dt, now):
        people = list(self.players.values())
        for b in people:
            if not b.bot or b.team is None or not b.alive or now < b.frozen_until:
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
        foes = [q for q in people if q.team and q.team != b.team and q.alive
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
        return self._hunt(b, now)

    def _hunt(self, b, now):
        """적이 안 보일 때: 사이트(A·B)나 상대 기지 둘레의 걸을 수 있는 곳을 차례로 돌아본다."""
        if b.wander is None or math.hypot(b.wander[0] - b.x, b.wander[1] - b.y) < 0.8 or self.rng.random() < 0.01:
            layout = lay.LAYOUTS[self.map.key]
            if self.rng.random() < 0.6:
                x0, y0, x1, y1 = self.rng.choice(list(layout.sites.values()))["rect"]
                cx, cy, spread = (x0 + x1) / 2, (y0 + y1) / 2, max(2.0, min(x1 - x0, y1 - y0) / 2 - 1)
            else:
                cx, cy = self.rng.choice(self._spawns("blue" if b.team == "red" else "red"))
                spread = 6.0
            for _ in range(30):
                wx, wy = cx + self.rng.uniform(-spread, spread), cy + self.rng.uniform(-spread, spread)
                if self.map.walkable_at(wx, wy) and not self.map.in_jail(wx, wy):
                    b.wander = (wx, wy)
                    break
        return (b.wander[0], b.wander[1], False) if b.wander else None

    # ── 상태 ────────────────────────────────────────────────────
    def snapshot(self, now=None):
        now = base.time.monotonic() if now is None else now
        return {"code": self.code, "name": self.name, "private": self.private, "host": self.host_id, "phase": self.phase,
                "map": self.map.key, "choice": self.choice.key,
                "left": round(max(0.0, self.phase_end - now), 1) if self.phase != "lobby" else None,
                "doors": sorted(self.doors_open), "score": dict(self.score), "round": self.round, "target": ROUNDS_TO_WIN,
                "side": self._side() if self.round else 0, "lock": self._locks() if self.round else None,
                "round_result": self.round_result, "result": self.result, "players": [p.public(now) for p in self.players.values()]}


new_code = base.new_code
