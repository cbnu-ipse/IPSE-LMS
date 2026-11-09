"""[무제]: 방(코드로 입장), 맵 위 캐릭터 이동, 그리고 그 위에서 하는 경찰과 도둑 (DB를 쓰지 않는 순수 파이썬).

맵(크기·벽·소품·충돌 판정·봇 길찾기 격자)은 untitled_maps에 있다. 판과 판 사이에는 정사각형 대기실(LOBBY)에 모이고,
방장이 거기서 다음 판의 맵(choice)을 고른다. 시작하면 그 맵으로 옮겨 가고, 결과가 끝나면 대기실로 돌아온다.
캐릭터는 반지름 RADIUS의 원이다. 이동은 화면(브라우저)이 바로 그리고(겹치면 밖으로 밀어내 미끄러진다) 위치를 서버에 보낸다.
서버는 속도 한도를 넘거나 충돌 모양·맵 밖에 걸치거나 벽을 뚫은 위치를 받지 않고, 마지막으로 받은 위치를 되돌려 준다.

경찰과 도둑 (방장이 시작한다, 2명 이상)
- 약 3분의 1(최소 1명)이 경찰, 나머지가 도둑. 경찰은 처음 HEAD_START초 동안 움직이지 못한다.
- 잡기는 붙잡기다(폴가이즈처럼): 경찰이 도둑 가까이(ARREST_REACH)에서 잡기(E)를 누르면 붙잡기 시작하고, 누른 채로
  GRAB_SECONDS초 동안 놓치지 않으면(GRAB_KEEP 안) 도둑이 감옥(울타리로 막힌 방)으로 간다. 붙잡힌 도둑은 GRAB_SLOW배,
  붙잡은 경찰은 GRAB_COP_SLOW배로 느려진다. 떼거나 멀어지면 풀린다. 스치기만 해서는 잡히지 않는다.
  헛손질하거나 놓치면 ARREST_COOLDOWN초 동안 다시 못 잡는다.
  경찰 화면에는 도둑이 조금 늦게 그려지므로(전송·방송 간격), 서버는 도둑이 최근 몇십 분의 1초(두 사람의 핑으로 정한다,
  tag_window) 동안 지나간 자리 중 하나라도 경찰 손 닿는 곳이었는지로 판정한다.
- 잡히지 않은 도둑이 감옥 앞 구출 발판에 RESCUE_SECONDS초 동안 서 있으면 갇힌 도둑이 모두 발판 둘레로 풀려나고
  SAFE_SECONDS초 동안 잡히지 않는다. 발판에서 내려오면 처음부터 다시.
- 제한 시간(1분, round_seconds) 안에 도둑을 모두 가두면 경찰 승리, 끝날 때 한 명이라도 밖에 있으면 도둑 승리.
- 도둑은 달릴 수 있다(RUN_MULT배): 스태미나(STAMINA_MAX초 분량)가 달리는 동안 줄고, 안 달리면 STAMINA_REGEN만큼 다시 찬다.
  다 쓰면 탈진해서 STAMINA_RECOVER만큼 찰 때까지는 키를 계속 눌러도 달려지지 않는다 (바닥에서 찔끔찔끔 달리는 것을 막는다).
  화면이 이동마다 "달리는 중"을 함께 보내고, 서버가 같은 계산으로 스태미나를 셈해 속도 검사에 반영한다.
- 경찰은 대시 대신 테이저건을 쏜다: 바라보는 방향으로 침이 DART_SPEED로 TASER_RANGE칸까지 날아가고(벽에 막힌다),
  맞은 도둑은 STUN_SECONDS초 동안 감전돼 움직이지 못한다. TASER_COOLDOWN초마다 한 번. 날아가는 동안 피할 수 있다.
- 문: 1~2칸 폭의 출입구에는 문이 달린다. 닫혀 있으면 시선을 막고(열린 문은 막지 않는다), 곁(DOOR_OPEN_RADIUS)에 누가 서 있으면 열린다.
  이동은 막지 않는다. 구출 발판에 서 있는 도둑이 n명이면 게이지가 n배 빠르게 찬다.
- 사각지대: 게임 중에는 상대 팀이 내 캐릭터에서 보일 때(VIEW_RANGE칸 안이고 벽·높은 가구가 가리지 않을 때)만 그 위치를 보낸다 (visible_view).
- 이모티콘: 언제든 EMOTES 중 하나를 띄울 수 있다(놀리기용 앉았다 일어나기 "teabag" 포함). 너무 잦으면 무시한다.

봇: 방장이 대기실에서 넣고 뺀다(id는 음수). 봇은 서버가 움직인다(사람과 같은 충돌 판정과 대시). 경찰 봇은 가까운 도둑을 쫓고,
도둑 봇은 경찰보다 먼저 닿을 수 있는 트인 곳으로 달아나다가 동료가 갇히면 구출 발판으로 간다. 벽은 반 칸 격자에서 길을 찾아 돌아간다.
"""
import math
from collections import deque
import random
import time

from .untitled_maps import ALL_MAPS, DEFAULT_MAP, LOBBY, MAPS, STEP

MAX_PLAYERS = 8
SPEED = {"lobby": 4.0, "cop": 4.3, "thief": 4.0}     # 칸/초
SLACK = 1.6                    # 네트워크 지연을 봐주는 속도 여유 배수
BURST_SECONDS = 0.5            # 이동 허용량을 이만큼(초) 모아 둘 수 있다: 늦게 오다 한꺼번에 몰려 온 위치도 받는다
ARREST_REACH = 1.2             # 경찰과 도둑의 중심이 이보다 가까울 때 잡기(E)를 누르면 잡힌다 (칸)
ARREST_COOLDOWN = 0.5          # 헛손질하거나 놓친 뒤 다시 잡기를 누를 수 있기까지 (초)
GRAB_SECONDS, GRAB_KEEP = 0.5, 1.9   # 이만큼(초) 붙잡고 있어야 잡힌다, 이보다 멀어지면 풀린다 (칸, 지연을 봐줘 넉넉히)
GRAB_SLOW, GRAB_COP_SLOW = 0.35, 0.6 # 붙잡힌 도둑·붙잡은 경찰의 속도 배수
GRAB_GRACE = 0.25                    # 붙잡힌 걸 화면이 알기 전까지 서버가 속도를 봐주는 시간 (초)
# 경찰 화면의 "닿았다"를 판정할 때 되돌아보는 도둑의 지난 자리 (초): 두 사람 핑의 절반씩 + 서버 시계·화면 보간 지연(TAG_BASE),
# 그리고 아래위 한도. 핑이 좋으면 조금만, 나쁘면 더 멀리 되돌아본다.
TAG_BASE, TAG_MIN, TAG_MAX = 0.2, 0.15, 0.45
RTT_DEFAULT = 0.1              # 핑을 아직 못 잰 사람의 왕복 지연 (초)
RUN_MULT, STAMINA_MAX, STAMINA_REGEN = 1.6, 3.0, 0.6   # 달리기 속도 배수, 스태미나(달릴 수 있는 초), 안 달릴 때 1초에 차는 양
RUN_SPAN = 0.3                 # 이동 한 번(화면은 0.1초마다 보낸다)에 달린 것으로 칠 수 있는 최대 시간 (초)
STAMINA_RECOVER = 1.0          # 스태미나를 다 쓰면 탈진해서, 이만큼(초 분량) 찰 때까지는 달릴 수 없다
TASER_RANGE, TASER_CONE = 11.0, 0.12  # 사거리(칸), 조준 보정 각(라디안, 마우스로 겨누므로 작게)
DART_SPEED, DART_HIT = 32.0, 0.4     # 테이저 침 속도(칸/초), 침과 도둑 중심이 이만큼 가까우면 맞는다(칸)
TASER_COOLDOWN, STUN_SECONDS = 5.0, 1.5
COUNTDOWN, HEAD_START, SAFE_SECONDS, RESULT_SECONDS = 3.0, 5.0, 3.0, 8.0
RESCUE_SECONDS = 3.0           # 구출 발판에 이만큼 서 있어야 동료가 풀려난다
VIEW_RANGE = 18.0              # 이보다 먼 상대는 보이지 않는다 (칸)
EMOTES = ("laugh", "taunt", "wave", "angry", "cool", "teabag")
EMOTE_GAP = 0.12               # 이모티콘 사이 최소 간격 (초)
BOT_COP_HANDICAP = 0.92        # 혼자 연습할 때 경찰 봇이 너무 세지 않게 (사람 속도는 그대로)
BOT_REACTION = 0.35            # 경찰 봇이 도둑 위치를 다시 보는 간격 (초)
BOT_TASER_RANGE, BOT_AIM_ERROR = 7.0, 0.1   # 경찰 봇은 가까이서만 쏘고, 사람처럼 조준이 조금 빗나간다 (라디안)
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
MODELS = ["character-male-a", "character-female-a", "character-male-b", "character-female-b", "character-male-c", "character-female-c",
          "character-male-d", "character-female-d", "character-male-e", "character-female-e", "character-male-f", "character-female-f"]


def round_seconds(players):
    """제한 시간: 인원과 상관없이 1분."""
    return 60.0


def rules_view():
    """모든 맵에 공통인 규칙 (화면용)."""
    return {"speed": SPEED, "arrest": {"reach": ARREST_REACH, "cooldown": ARREST_COOLDOWN, "seconds": GRAB_SECONDS, "keep": GRAB_KEEP,
                                       "slow": GRAB_SLOW, "cop_slow": GRAB_COP_SLOW},
            "run": {"mult": RUN_MULT, "stamina": STAMINA_MAX, "regen": STAMINA_REGEN, "recover": STAMINA_RECOVER},
            "taser": {"range": TASER_RANGE, "cooldown": TASER_COOLDOWN, "stun": STUN_SECONDS, "speed": DART_SPEED},
            "view": VIEW_RANGE, "rescue": RESCUE_SECONDS}


HIDDEN_KEYS = ("id", "name", "model", "team", "jailed", "online", "bot", "catches")


def visible_view(state, viewer_id):
    """viewer에게 보낼 상태: 게임 중에는 내 캐릭터에서 안 보이는 상대 팀의 위치를 지운다 (같은 팀·관전자는 다 보인다)."""
    if state.get("phase") not in ("countdown", "playing"):
        return state
    me = next((p for p in state["players"] if p["id"] == viewer_id), None)
    if me is None or me["team"] is None:
        return state
    m = ALL_MAPS[state["map"]]
    players = []
    for p in state["players"]:
        near = (p["x"] - me["x"]) ** 2 + (p["y"] - me["y"]) ** 2 <= VIEW_RANGE ** 2
        if p["id"] == viewer_id or p["team"] == me["team"] or (near and m.can_see(me["x"], me["y"], p["x"], p["y"], state.get("doors", ()))):
            players.append(p)
        else:
            players.append({**{k: p[k] for k in HIDDEN_KEYS}, "hidden": True})
    return {**state, "players": players}


def worlds_view():
    """화면에 보낼 맵들: {맵 key: 맵 정보}."""
    return {key: m.view(rules_view()) for key, m in ALL_MAPS.items()}


def maps_list():
    return [m.summary() for m in MAPS.values()]


class Player:
    def __init__(self, uid, name, model, x, y, now):
        self.uid, self.name, self.model = uid, name, model
        self.x, self.y, self.dir, self.moving = x, y, 0.0, False
        self.last = now
        self.connected = True
        self.team = None                # None(대기) | "cop" | "thief"
        self.jailed = False
        self.safe_until = 0.0
        self.frozen_until = 0.0
        self.stamina = STAMINA_MAX       # 도둑의 달리기 스태미나 (초)
        self.exhausted = False           # 다 써서 STAMINA_RECOVER까지 차기 전에는 달릴 수 없다
        self.running = False
        self.grab_target, self.grab_since = None, 0.0   # 경찰이 붙잡고 있는 도둑
        self.grabbed_by = None                           # 도둑을 붙잡고 있는 경찰
        self.stun_until = 0.0           # 테이저에 맞아 감전된 동안 (frozen_until도 함께 늘린다)
        self.taser_ready = 0.0
        self.tp = 0                     # 서버가 옮길 때마다 1씩 늘어난다 (화면은 이걸 보고 내 위치를 맞춘다)
        self.catches = 0
        self.bot = uid < 0
        self.detour_until, self.detour = 0.0, (0.0, 0.0)
        self.stuck_check, self.wander = (x, y, now), None
        self.path, self.path_goal, self.path_at = [], None, -1.0
        self.seen = None                # 경찰 봇이 마지막으로 본 도둑 (id, x, y, 시각)
        self.flee, self.flee_at = None, -1.0
        self.trail = deque(maxlen=16)  # 최근 위치 (시각, x, y): 경찰 화면의 "닿았다"를 판정할 때 본다
        self.budget = 0.0              # 이동 허용량 (칸): 시간이 지나면 쌓이고, 받은 이동만큼 줄어든다
        self.rtt = 0.0 if self.bot else RTT_DEFAULT   # 화면이 잰 왕복 지연 (초). 봇은 서버 안에 있어 0
        self.emote_at = -1.0
        self.arrest_ready = 0.0

    def speed_now(self, now):
        """붙잡기 중이면 느려진 속도 (붙잡힌 직후 GRAB_GRACE초는 화면이 아직 모르므로 봐준다)."""
        base = self.speed()
        if self.grabbed_by is not None and now - self.grab_since >= GRAB_GRACE:
            return base * GRAB_SLOW
        if self.grab_target is not None:
            return base * GRAB_COP_SLOW
        return base

    def speed(self):
        base = SPEED[self.team or "lobby"]
        return base * BOT_COP_HANDICAP if self.bot and self.team == "cop" else base

    def teleport(self, x, y):
        self.x, self.y, self.moving = x, y, False
        self.tp += 1
        self.budget = 0.0
        self.trail.clear()                                      # 옮겨지기 전 자리로는 잡히지 않는다

    def reset_bot_plan(self):
        self.path, self.path_goal, self.path_at = [], None, -1.0
        self.seen, self.flee, self.wander = None, None, None

    def public(self, now):
        return {"id": self.uid, "name": self.name, "model": self.model, "x": round(self.x, 3), "y": round(self.y, 3),
                "dir": round(self.dir, 3), "moving": self.moving, "online": self.connected, "team": self.team, "jailed": self.jailed,
                "safe": round(max(0.0, self.safe_until - now), 1), "frozen": round(max(0.0, self.frozen_until - now), 1),
                "stamina": round(self.stamina / STAMINA_MAX, 2), "exhausted": self.exhausted, "speed": self.speed(), "tp": self.tp, "catches": self.catches,
                "grabbed": self.grabbed_by is not None, "grabbing": self.grab_target,
                "grab": round(min(1.0, (now - self.grab_since) / GRAB_SECONDS), 2) if self.grab_target is not None else 0,
                "stun": round(max(0.0, self.stun_until - now), 1), "taser": round(max(0.0, self.taser_ready - now), 1),
                "bot": self.bot, "running": self.running}


class Room:
    def __init__(self, code, host_id, name="", private=False, map_key=DEFAULT_MAP):
        self.code, self.host_id = code, host_id
        self.choice = MAPS.get(map_key, MAPS[DEFAULT_MAP])     # 다음 판의 맵 (방장이 대기실에서 고른다)
        self.map = LOBBY                                        # 지금 서 있는 맵: 대기 중에는 대기실
        self.name = (name or "").strip()[:24] or "경찰과 도둑"
        self.private = bool(private)
        self.last_update = None
        self.players = {}
        self.idle_since = None
        self.dirty = True
        self.phase = "lobby"            # lobby → countdown → playing → result → lobby
        self.phase_end = 0.0
        self.result = None
        self.events = []
        self.rng = random.Random()
        self.darts = []                 # 날아가는 테이저 침
        self.round_seconds = 0.0
        self.doors_open = frozenset()   # 지금 열려 있는 문 번호들 (곁에 사람이 있는 문)
        self.pad_time = 0.0             # 구출 발판 게이지 (초): 서 있는 도둑 수만큼 배로 찬다
        self.pad_n = 0                  # 지금 발판에 서 있는 도둑 수
        self._cop_dist, self._cop_map_at = {}, None

    # ── 방 ─────────────────────────────────────────────────────
    def add(self, uid, name, now=None):
        now = time.monotonic() if now is None else now
        if uid in self.players:
            self.players[uid].connected = True
            return True, ""
        if len(self.players) >= MAX_PLAYERS:
            return False, f"방이 가득 찼어요 (최대 {MAX_PLAYERS}명)."
        used = {p.model for p in self.players.values()}
        model = next(m for m in MODELS if m not in used)
        spawns = self.map.lobby_spawns
        x, y = next(((sx, sy) for sx, sy in spawns if all((p.x - sx) ** 2 + (p.y - sy) ** 2 > 0.5 for p in self.players.values())), spawns[0])
        self.players[uid] = Player(uid, name, model, x, y, now)          # 게임 중에 들어오면 다음 판까지 구경(대기)
        self.dirty = True
        return True, ""

    def humans(self):
        return [p for p in self.players.values() if not p.bot]

    def add_bot(self, uid, now=None):
        """방장이 대기실에서 봇을 넣는다. 넣은 봇의 id 또는 오류 문구(str)."""
        if uid != self.host_id:
            return "방장만 봇을 넣을 수 있어요."
        if self.phase != "lobby":
            return "대기실에서만 봇을 넣을 수 있어요."
        bot_id = min([p.uid for p in self.players.values() if p.bot] + [0]) - 1
        ok, message = self.add(bot_id, f"봇 {-bot_id}", now)
        return bot_id if ok else message

    def remove_bot(self, uid):
        if uid != self.host_id or self.phase != "lobby":
            return False
        bots = [p.uid for p in self.players.values() if p.bot]
        if not bots:
            return False
        self.remove(min(bots))                                 # 가장 나중에 넣은 봇 (id가 가장 작다)
        return True

    def remove(self, uid, now=None):
        self.players.pop(uid, None)
        if uid == self.host_id and self.humans():
            self.host_id = self.humans()[0].uid
        self.dirty = True
        if self.phase in ("countdown", "playing"):
            self._check_end(time.monotonic() if now is None else now)

    def set_map(self, uid, key, now=None):
        """방장이 대기실에서 다음 판의 맵을 고른다 (모두 대기실에 그대로 있다). 성공하면 "", 아니면 오류 문구."""
        if uid != self.host_id:
            return "방장만 맵을 고를 수 있어요."
        if self.phase != "lobby":
            return "대기실에서만 맵을 바꿀 수 있어요."
        if key not in MAPS:
            return "없는 맵이에요."
        if key == self.choice.key:
            return ""
        self.choice = MAPS[key]
        self.events.append({"t": "map", "map": key})
        self.dirty = True
        return ""

    def emote(self, uid, kind, now=None):
        """이모티콘을 띄운다. 띄웠으면 True."""
        now = time.monotonic() if now is None else now
        p = self.players.get(uid)
        if p is None or kind not in EMOTES or now - p.emote_at < EMOTE_GAP:
            return False
        p.emote_at = now
        self.events.append({"t": "emote", "id": uid, "e": kind})
        self.dirty = True
        return True

    # ── 이동 ───────────────────────────────────────────────────
    def move(self, uid, x, y, direction, moving, now=None, run=False):
        """화면이 보낸 위치를 받는다. 받으면 True, 받지 않으면 False (그 사람은 마지막 위치로 돌아간다)."""
        p = self.players.get(uid)
        now = time.monotonic() if now is None else now
        if p is None:
            return False
        try:
            x, y, direction = float(x), float(y), float(direction)
        except (TypeError, ValueError):
            return False
        if not all(math.isfinite(v) for v in (x, y, direction)):
            return False
        dt = max(0.0, now - p.last)
        ran = self._spend_stamina(p, dt, bool(run) and bool(moving))   # 이 구간 중 달린 시간
        speed = p.speed_now(now)
        cap = speed * SLACK * BURST_SECONDS * (RUN_MULT if p.running else 1.0)
        p.budget = min(cap, p.budget + speed * (dt + ran * (RUN_MULT - 1)) * SLACK)
        dist = math.hypot(x - p.x, y - p.y)
        frozen = now < p.frozen_until
        m = self.map
        bad = (dist > p.budget + 0.25 or not m.free_at(x, y) or (frozen and (x, y) != (p.x, p.y))
               or m.crosses_wall(p.x, p.y, x, y))
        if not bad and self.phase in ("countdown", "playing"):
            bad = m.in_jail(x, y) != p.jailed                           # 갇힌 사람은 감옥 안, 나머지는 감옥 밖에만
        p.last = now
        if bad:
            return False
        p.budget = max(0.0, p.budget - dist)
        p.x, p.y, p.dir, p.moving = x, y, direction, bool(moving)
        p.trail.append((now, x, y))
        self.dirty = True
        return True

    def set_rtt(self, uid, rtt):
        """화면이 잰 핑(초)을 기록한다. 이상한 값은 무시하고 1초를 넘지 않게 자른다."""
        p = self.players.get(uid)
        try:
            rtt = float(rtt)
        except (TypeError, ValueError):
            return
        if p is not None and math.isfinite(rtt) and rtt >= 0:
            p.rtt = min(rtt, 1.0)

    def tag_window(self, cop, thief):
        return min(TAG_MAX, max(TAG_MIN, (cop.rtt + thief.rtt) / 2 + TAG_BASE))

    def _spend_stamina(self, p, dt, run):
        """도둑이 달렸으면 스태미나를 쓰고(남은 만큼만) 달린 시간을 돌려준다. 안 달린 시간만큼은 다시 채운다.
        멈춰 있는 동안은 화면이 위치를 보내지 않으므로, 한 번에 RUN_SPAN초까지만 달린 것으로 치고 나머지는 쉰 시간으로 본다.
        다 쓰면 탈진: STAMINA_RECOVER까지 찰 때까지는 run을 계속 눌러도 달려지지 않는다."""
        if p.exhausted and p.stamina >= STAMINA_RECOVER:
            p.exhausted = False
        ran = 0.0
        if p.team == "thief" and run and p.stamina > 0 and not p.exhausted and not p.jailed:
            ran = min(dt, RUN_SPAN, p.stamina)
            p.stamina -= ran
            if p.stamina <= 1e-6:
                p.stamina, p.exhausted = 0.0, True
        p.running = ran > 0
        p.stamina = min(STAMINA_MAX, p.stamina + (dt - min(dt, RUN_SPAN) if ran else dt) * STAMINA_REGEN)
        return ran

    def arrest(self, uid, target=None, now=None):
        """경찰이 잡기(E)를 눌렀다: 손 닿는 곳의 도둑을 붙잡기 시작한다 (target은 경찰 화면에서 손 닿던 도둑, 없으면 가장 가까운 도둑).
        도둑의 최근 자리 중 하나라도 손 닿는 곳이었으면 붙잡는다. 붙잡은 도둑의 id, 헛손질이면 None.
        잡히는 건 GRAB_SECONDS초 동안 놓치지 않았을 때다 (_grabs)."""
        now = time.monotonic() if now is None else now
        cop = self.players.get(uid)
        if (self.phase != "playing" or cop is None or cop.team != "cop" or now < cop.frozen_until or now < cop.arrest_ready
                or cop.grab_target is not None):
            return None

        def reach(t):                                          # 핑만큼 되돌아본 도둑의 자리 중 경찰에게 가장 가까운 거리
            window = self.tag_window(cop, t)
            spots = [(x, y) for at, x, y in t.trail if now - at <= window] + [(t.x, t.y)]
            return min(math.hypot(x - cop.x, y - cop.y) for x, y in spots)

        thieves = [t for t in self.players.values() if t.team == "thief" and not t.jailed and now >= t.safe_until and t.grabbed_by is None]
        hint = self.players.get(target) if target is not None else None
        if hint in thieves and reach(hint) <= ARREST_REACH:
            caught = hint
        else:
            near = [(reach(t), t) for t in thieves]
            near = [(d, t) for d, t in near if d <= ARREST_REACH]
            caught = min(near, key=lambda q: q[0])[1] if near else None
        self.events.append({"t": "grab", "cop": uid, "thief": caught.uid if caught else None, "ok": caught is not None})
        self.dirty = True
        if caught is None:
            cop.arrest_ready = now + ARREST_COOLDOWN
            return None
        cop.grab_target, cop.grab_since = caught.uid, now
        caught.grabbed_by, caught.grab_since = cop.uid, now
        return caught.uid

    def release(self, uid, now=None):
        """경찰이 잡기에서 손을 뗐다. 아직 덜 붙잡았으면 놓친다."""
        now = time.monotonic() if now is None else now
        cop = self.players.get(uid)
        if cop is not None and cop.grab_target is not None:
            self._break_grab(cop, now)

    def _break_grab(self, cop, now):
        t = self.players.get(cop.grab_target)
        if t is not None and t.grabbed_by == cop.uid:
            t.grabbed_by = None
        self.events.append({"t": "grab_break", "cop": cop.uid, "thief": cop.grab_target})
        cop.grab_target = None
        cop.arrest_ready = now + ARREST_COOLDOWN
        self.dirty = True

    def _doors(self):
        """곁에 사람이 있는 문이 열린다. 달라지면 모두에게 알린다 (닫힌 문은 사각지대를 만든다)."""
        m = self.map
        if not m.door_boxes:
            return
        opened = m.open_door_ids([(p.x, p.y) for p in self.players.values()])
        if opened != self.doors_open:
            self.doors_open = opened
            self.dirty = True

    def _grabs(self, now):
        """붙잡기 진행: 멀어지거나 도둑이 갇히면 풀리고, GRAB_SECONDS초를 버티면 잡힌다."""
        for t in self.players.values():                          # 붙잡던 경찰이 나갔거나 다른 일로 풀렸으면 정리한다
            cop = self.players.get(t.grabbed_by) if t.grabbed_by is not None else None
            if t.grabbed_by is not None and (cop is None or cop.grab_target != t.uid):
                t.grabbed_by = None
        for cop in self.players.values():
            if cop.grab_target is None:
                continue
            t = self.players.get(cop.grab_target)
            if t is None or t.jailed or cop.team != "cop" or math.hypot(t.x - cop.x, t.y - cop.y) > GRAB_KEEP:
                self._break_grab(cop, now)
                continue
            self.dirty = True                                    # 진행 막대가 움직인다
            if now - cop.grab_since >= GRAB_SECONDS:
                cop.grab_target, t.grabbed_by = None, None
                self._jail(t, cop, now)

    def taser(self, uid, direction, now=None):
        """경찰이 바라보는 방향(direction: 화면과 같은 atan2(dx, dy))으로 테이저 침을 쏜다. 쐈으면 True.
        침은 DART_SPEED로 날아가므로 옆으로 피하거나 벽 뒤로 숨으면 피할 수 있다. 조준 보정: TASER_CONE 안에 보이는 도둑이 있으면
        그쪽으로 살짝 꺾어 쏜다 (방향키 8방향으로도 맞힐 수 있게)."""
        now = time.monotonic() if now is None else now
        cop = self.players.get(uid)
        try:
            direction = float(direction)
        except (TypeError, ValueError):
            return False
        if (self.phase != "playing" or cop is None or cop.team != "cop" or not math.isfinite(direction)
                or now < cop.frozen_until or now < cop.taser_ready):
            return False
        m = self.map
        best, best_d = None, 1e9
        for t in self.players.values():
            if t.team != "thief" or t.jailed or now < t.safe_until or now < t.stun_until:
                continue
            vx, vy = t.x - cop.x, t.y - cop.y
            d = math.hypot(vx, vy)
            off = abs((math.atan2(vx, vy) - direction + math.pi) % (2 * math.pi) - math.pi)
            if 0 < d <= TASER_RANGE and off <= TASER_CONE and d < best_d and m.can_see(cop.x, cop.y, t.x, t.y, self.doors_open):
                best, best_d = t, d
        if best is not None:
            direction = math.atan2(best.x - cop.x, best.y - cop.y)
        cop.taser_ready, cop.dir = now + TASER_COOLDOWN, direction
        dx, dy = math.sin(direction), math.cos(direction)
        x, y = cop.x + dx * 0.3, cop.y + dy * 0.3
        self.darts.append({"cop": uid, "x": x, "y": y, "dx": dx, "dy": dy, "flown": 0.0})
        self.events.append({"t": "shot", "cop": uid, "x": round(x, 3), "y": round(y, 3), "dir": round(direction, 4)})
        self.dirty = True
        return True

    def _darts(self, dt, now):
        """날아가는 테이저 침: 벽·높은 가구에 막히거나, 사거리 끝이거나, 도둑에 맞으면 끝난다."""
        m, left = self.map, []
        for d in self.darts:
            step = DART_SPEED * dt
            n = max(1, math.ceil(step / 0.1))
            hit, done = None, False
            for _ in range(n):
                nx, ny = d["x"] + d["dx"] * step / n, d["y"] + d["dy"] * step / n
                if m.area_at(nx, ny) < 0 or not m.can_see(d["x"], d["y"], nx, ny, self.doors_open):
                    done = True
                    break
                d["x"], d["y"], d["flown"] = nx, ny, d["flown"] + step / n
                hit = next((t for t in self.players.values() if t.team == "thief" and not t.jailed and now >= t.safe_until
                            and now >= t.stun_until and (t.x - nx) ** 2 + (t.y - ny) ** 2 <= DART_HIT ** 2), None)
                if hit is not None or d["flown"] >= TASER_RANGE:
                    done = True
                    break
            if not done:
                left.append(d)
                continue
            if hit is not None:
                hit.stun_until = now + STUN_SECONDS
                hit.frozen_until = max(hit.frozen_until, hit.stun_until)
                hit.moving = False
            self.events.append({"t": "tase", "cop": d["cop"], "thief": hit.uid if hit else None, "x": round(d["x"], 2), "y": round(d["y"], 2)})
            self.dirty = True
        self.darts = left

    # ── 경찰과 도둑 ────────────────────────────────────────────
    def start(self, uid, now=None):
        now = time.monotonic() if now is None else now
        if uid != self.host_id:
            return False, "방장만 시작할 수 있어요."
        if self.phase != "lobby":
            return False, "이미 진행 중이에요."
        people = list(self.players.values())
        if len(people) < 2:
            return False, "두 명 이상 있어야 시작할 수 있어요."
        self.rng.shuffle(people)
        cops = max(1, round(len(people) / 3))
        self.map, self._cop_dist, self._cop_map_at = self.choice, {}, None
        self.round_seconds, self.pad_time = round_seconds(len(people)), 0.0
        self.pad_n, self.doors_open = 0, frozenset()
        for i, p in enumerate(people):
            p.team = "cop" if i < cops else "thief"
            p.jailed, p.catches = False, 0
            p.safe_until = p.stun_until = p.taser_ready = p.arrest_ready = 0.0
            p.stamina, p.exhausted, p.running, p.grab_target, p.grabbed_by = STAMINA_MAX, False, False, None, None
            spots = self.map.cop_spawns if p.team == "cop" else self.map.thief_spawns
            index = i if p.team == "cop" else i - cops
            p.teleport(*spots[index % len(spots)])
            p.reset_bot_plan()
            p.frozen_until = now + COUNTDOWN + (HEAD_START if p.team == "cop" else 0.0)
            p.last = now
        self.phase, self.phase_end, self.result, self.darts = "countdown", now + COUNTDOWN, None, []
        self.events.append({"t": "start"})
        self.dirty = True
        return True, ""

    def update(self, now=None):
        """시계가 0.1초마다 부른다: 단계 넘기기, 잡기, 구출, 승패."""
        now = time.monotonic() if now is None else now
        dt = 0.0 if self.last_update is None else min(0.3, max(0.0, now - self.last_update))
        self.last_update = now
        if self.phase in ("countdown", "playing") and dt:
            self._bots(dt, now)
        if self.phase == "playing" and dt:
            self._darts(dt, now)
        if self.phase == "countdown" and now >= self.phase_end:
            self.phase, self.phase_end = "playing", now + self.round_seconds
            self.events.append({"t": "go"})
            self.dirty = True
        elif self.phase == "playing":
            self._grabs(now)
            self._doors()
            self._rescue(now, dt)
            self._check_end(now)
            self.dirty = True                                           # 남은 시간이 흐르므로 매번 보낸다
        elif self.phase == "result" and now >= self.phase_end:
            self._back_to_lobby(now)

    # ── 봇 ─────────────────────────────────────────────────────
    def _bots(self, dt, now):
        m = self.map
        people = list(self.players.values())
        for b in people:
            if not b.bot or b.jailed or now < b.frozen_until:
                continue
            goal = self._bot_goal(b, people, now)
            if goal is None:
                if b.moving:
                    b.moving = False
                    self.dirty = True
                continue
            gx, gy, run = goal
            gx, gy = self._waypoint(b, gx, gy, now)
            dx, dy = gx - b.x, gy - b.y
            dist = math.hypot(dx, dy)
            if dist < 0.15:
                b.moving = False
                continue
            if now < b.detour_until:                          # 막혀서 잠깐 옆으로 돌아가는 중
                dx, dy = b.detour
                dist = 1.0
            ran = self._spend_stamina(b, dt, run and b.stamina > 0.2)
            speed = b.speed_now(now) * (1 + (RUN_MULT - 1) * ran / dt if dt else 1)
            step = min(dist, speed * dt)
            others = [(p.x, p.y) for p in people if p is not b and not p.jailed]
            n = max(1, math.ceil(step / 0.08))
            x, y = b.x, b.y
            for _ in range(n):
                x += dx / dist * step / n
                y += dy / dist * step / n
                x, y = m.push_out(x, y, others)
            if not m.free_at(x, y) or m.in_jail(x, y):
                x, y = b.x, b.y
            b.dir = math.atan2(x - b.x, y - b.y) if (x, y) != (b.x, b.y) else b.dir
            b.x, b.y, b.moving = x, y, True
            b.trail.append((now, x, y))
            sx, sy, st = b.stuck_check
            if now - st > 0.8:                                  # 0.8초 동안 거의 못 움직였으면 옆으로 비켜 간다
                if math.hypot(b.x - sx, b.y - sy) < 0.35 and now >= b.detour_until:
                    side = self.rng.choice((1, -1))
                    b.detour = (-(gy - b.y) * side, (gx - b.x) * side)
                    norm = math.hypot(*b.detour) or 1.0
                    b.detour = (b.detour[0] / norm, b.detour[1] / norm)
                    b.detour_until = now + 0.7
                b.stuck_check = (b.x, b.y, now)
            self.dirty = True

    def _cop_map(self, cops, now):
        """모든 경찰에서 잰 격자 거리 지도. 0.3초마다 한 번만 새로 잰다."""
        if self._cop_map_at is None or now - self._cop_map_at > 0.3:
            self._cop_dist, self._cop_map_at = self.map.grid_dist([(p.x, p.y) for p in cops]), now
        return self._cop_dist

    def _flee_spot(self, b, cops, now):
        cop_d = self._cop_map(cops, now)
        m = self.map
        mine = m.grid_dist([(b.x, b.y)], limit=7.0)
        ratio = SPEED["cop"] / SPEED["thief"]
        room = m.open
        taken = [p.flee for p in self.players.values() if p is not b and p.team == "thief" and not p.jailed and p.flee]
        best, best_score = None, -1e9
        for (i, j), md in mine.items():
            cd = min(cop_d.get((i, j), 99.0), 14.0)
            if cd - md * ratio < -1.0 and md > 0.5:      # 경찰이 먼저 닿는 곳으로는 가지 않는다
                continue
            x, y = (i + 0.5) * STEP, (j + 0.5) * STEP
            score = cd + room[i][j] * 0.15 + self.rng.uniform(0, 0.5)
            if any(math.hypot(x - q[0], y - q[1]) < 1.2 for q in taken):   # 다른 도둑과 같은 곳으로 몰리지 않는다
                score -= 3.0
            if score > best_score:
                best, best_score = (x, y), score
        return best

    def _waypoint(self, b, gx, gy, now):
        """목표까지 곧장 갈 수 있으면 목표, 아니면 길을 찾아 지금 보이는 가장 먼 거쳐 갈 점."""
        m = self.map
        if m.clear_line(b.x, b.y, gx, gy):
            b.path = []
            return gx, gy
        pg = b.path_goal
        if not b.path or pg is None or math.hypot(pg[0] - gx, pg[1] - gy) > 1.0 or now - b.path_at > 1.0:
            b.path, b.path_goal, b.path_at = m.find_path(b.x, b.y, gx, gy), (gx, gy), now
        while len(b.path) > 1 and math.hypot(b.path[0][0] - b.x, b.path[0][1] - b.y) < 0.3:
            b.path.pop(0)
        if not b.path:
            return gx, gy
        best = 0
        for k in range(min(len(b.path), 10)):
            if m.clear_line(b.x, b.y, *b.path[k]):
                best = k
        del b.path[:best]
        return b.path[0]

    def _bot_goal(self, b, people, now):
        """봇이 향할 곳 (x, y, 대시할지). 없으면 None."""
        m = self.map
        if b.team == "cop":
            prey = [p for p in people if p.team == "thief" and not p.jailed and now >= p.safe_until]
            visible = [p for p in prey if math.hypot(p.x - b.x, p.y - b.y) <= VIEW_RANGE
                       and m.can_see(b.x, b.y, p.x, p.y, self.doors_open)]                    # 경찰 봇도 사각지대 너머는 못 본다
            if visible:
                t = min(visible, key=lambda p: (p.x - b.x) ** 2 + (p.y - b.y) ** 2)
                seen = b.seen
                if seen is None or seen[0] != t.uid or now - seen[3] >= BOT_REACTION:   # 사람처럼 조금 늦게 다시 겨눈다
                    seen = b.seen = (t.uid, t.x, t.y, now)
                if math.hypot(seen[1] - b.x, seen[2] - b.y) < 0.4:                    # 본 자리에 닿았으면 지금 자리로
                    seen = b.seen = (t.uid, t.x, t.y, now)
                d = math.hypot(seen[1] - b.x, seen[2] - b.y)
                if math.hypot(t.x - b.x, t.y - b.y) <= ARREST_REACH - 0.15:      # 손 닿는 곳이면 잡는다
                    self.arrest(b.uid, t.uid, now)
                elif now >= b.taser_ready and ARREST_REACH < d <= BOT_TASER_RANGE and now >= t.stun_until:
                    aim = math.atan2(seen[1] - b.x, seen[2] - b.y) + self.rng.uniform(-BOT_AIM_ERROR, BOT_AIM_ERROR)
                    self.taser(b.uid, aim, now)
                b.wander = None
                return seen[1], seen[2], False
            if b.seen is not None and math.hypot(b.seen[1] - b.x, b.seen[2] - b.y) > 0.5:
                return b.seen[1], b.seen[2], False                                # 마지막으로 본 자리로 가 본다
            b.seen = None
            return self._wander(b, [], now)
        if b.team != "thief":
            return None
        cops = [p for p in people if p.team == "cop"]
        near = min(cops, key=lambda p: (p.x - b.x) ** 2 + (p.y - b.y) ** 2) if cops else None
        d = math.hypot(near.x - b.x, near.y - b.y) if near else 99.0
        pad = self.map.pad
        jailed = any(p.jailed for p in people)
        pad_guard = min((math.hypot(p.x - pad["cx"], p.y - pad["cy"]) for p in cops), default=99.0)
        if jailed and d > 4.0 and pad_guard > 5.0:                # 발판을 지키는 경찰이 없고 쫓기지 않을 때만 구하러 간다
            return pad["cx"], pad["cy"], d < 2.5
        if near is not None and d < 7.0:                          # 경찰보다 먼저 닿을 수 있는 곳 중 경찰에게서 가장 먼 곳
            run_now = d < 4.0 or b.grabbed_by is not None       # 가까이 온 경찰은 달려서 떼어 낸다
            if b.flee is None or now - b.flee_at > 0.3 or math.hypot(b.flee[0] - b.x, b.flee[1] - b.y) < 0.4:
                b.flee, b.flee_at = self._flee_spot(b, cops, now), now
            if b.flee is not None:
                b.wander = None
                return b.flee[0], b.flee[1], run_now
        return self._wander(b, cops, now)

    def _wander(self, b, cops, now):
        """돌아다닐 곳: 걸을 수 있는 아무 곳 중 (cops가 있으면 경찰에게서 먼 곳)."""
        m = self.map
        if b.wander is None or math.hypot(b.wander[0] - b.x, b.wander[1] - b.y) < 0.5 or self.rng.random() < 0.01:
            spots = []
            for _ in range(40):
                wx, wy = self.rng.uniform(1, m.w - 1), self.rng.uniform(1, m.h - 1)
                if m.walkable_at(wx, wy):
                    spots.append((wx, wy))
                if len(spots) >= 6:
                    break
            if spots:
                b.wander = max(spots, key=lambda q: min((math.hypot(p.x - q[0], p.y - q[1]) for p in cops), default=0.0) + self.rng.uniform(0, 3))
        return (b.wander[0], b.wander[1], False) if b.wander else None

    def _jail(self, t, cop, now):
        spots = self.map.jail_spots
        t.jailed = True
        taken = {(round(p.x, 1), round(p.y, 1)) for p in self.players.values() if p.jailed and p is not t}
        spot = next((s for s in spots if (round(s[0], 1), round(s[1], 1)) not in taken), spots[0])
        t.teleport(*spot)
        t.last = now
        cop.catches += 1
        self.events.append({"t": "caught", "thief": t.uid, "cop": cop.uid})
        self.dirty = True

    def _rescue(self, now, dt):
        jailed = [p for p in self.players.values() if p.jailed]
        m, pad = self.map, self.map.pad
        heroes = [p for p in self.players.values() if p.team == "thief" and not p.jailed and now >= p.stun_until and m.on_pad(p.x, p.y)]
        n = len(heroes) if jailed else 0
        if n != self.pad_n:
            self.pad_n, self.dirty = n, True
        if not jailed or not heroes:
            if self.pad_time:
                self.pad_time, self.dirty = 0.0, True
            return
        hero = heroes[0]
        self.pad_time += dt * len(heroes)                         # 발판에 서 있는 도둑이 n명이면 n배 빠르게 찬다
        if self.pad_time < RESCUE_SECONDS:
            return
        self.pad_time = 0.0
        for i, t in enumerate(jailed):
            angle = math.pi * (0.55 + 0.5 * i / max(1, len(jailed)))          # 발판 아래쪽 둘레에 내려놓는다
            x, y = pad["cx"] + math.cos(angle) * 1.4, pad["cy"] + math.sin(angle) * 1.4
            if not m.free_at(x, y):
                x, y = pad["cx"], pad["cy"]
            t.jailed = False
            t.safe_until = now + SAFE_SECONDS
            t.teleport(x, y)
            t.last = now
        self.events.append({"t": "rescue", "by": hero.uid, "count": len(jailed), "helpers": len(heroes)})

    def _check_end(self, now):
        cops = [p for p in self.players.values() if p.team == "cop"]
        thieves = [p for p in self.players.values() if p.team == "thief"]
        winner = None
        if not cops:
            winner = "thief"
        elif not thieves or all(t.jailed for t in thieves):
            winner = "cop"                                         # 시간 안에 모두 가뒀다
        elif self.phase == "playing" and now >= self.phase_end:
            winner = "thief"                                       # 끝까지 한 명이라도 남았다
        if winner:
            self.phase, self.phase_end = "result", now + RESULT_SECONDS
            self.result = {"winner": winner, "free": sum(1 for t in thieves if not t.jailed), "thieves": len(thieves),
                           "catches": {p.uid: p.catches for p in cops}}
            self.events.append({"t": "end", "winner": winner})
            self.dirty = True

    def _back_to_lobby(self, now):
        self.phase, self.result, self.darts = "lobby", None, []
        self.map, self.pad_time = LOBBY, 0.0
        self.pad_n, self.doors_open = 0, frozenset()
        for i, p in enumerate(self.players.values()):
            p.team, p.jailed = None, False
            p.safe_until = p.frozen_until = p.stun_until = p.taser_ready = p.arrest_ready = 0.0
            p.stamina, p.exhausted, p.running, p.grab_target, p.grabbed_by = STAMINA_MAX, False, False, None, None
            p.teleport(*self.map.lobby_spawns[i % len(self.map.lobby_spawns)])
            p.last = now
        self.events.append({"t": "lobby"})
        self.dirty = True

    def take_events(self):
        ev, self.events = self.events, []
        return ev

    def summary(self):
        """열린 방 목록에 보일 한 줄."""
        return {"code": self.code, "name": self.name, "players": len(self.humans()), "bots": len(self.players) - len(self.humans()),
                "max": MAX_PLAYERS, "phase": self.phase, "map": self.choice.name}

    def snapshot(self, now=None):
        now = time.monotonic() if now is None else now
        return {"code": self.code, "name": self.name, "private": self.private, "host": self.host_id, "phase": self.phase,
                "map": self.map.key, "choice": self.choice.key,
                "left": round(max(0.0, self.phase_end - now), 1) if self.phase != "lobby" else None,
                "pad": round(min(1.0, self.pad_time / RESCUE_SECONDS), 2), "pad_n": self.pad_n, "doors": sorted(self.doors_open),
                "result": self.result, "players": [p.public(now) for p in self.players.values()]}


def new_code(taken, rng=random):
    for _ in range(200):
        code = "".join(rng.choices(CODE_ALPHABET, k=4))
        if code not in taken:
            return code
    raise RuntimeError("방 코드를 만들 수 없습니다.")

