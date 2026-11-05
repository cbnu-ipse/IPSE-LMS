"""[무제]: 방(코드로 입장), 광장 위 캐릭터 이동, 그리고 그 위에서 하는 경찰과 도둑 (DB를 쓰지 않는 순수 파이썬).

좌표는 칸 단위 실수 (x, y). 광장은 SIZE×SIZE 칸이고, 칸 (i, j)는 x∈[i, i+1), y∈[j, j+1)이다.
소품은 칸 전체가 아니라 실제 모델 크기의 충돌 모양(둥근 것은 원, 나머지는 회전을 반영한 사각형)으로 막는다.
캐릭터는 반지름 RADIUS의 원이다. 이동은 화면(브라우저)이 바로 그리고(겹치면 밖으로 밀어내 미끄러진다) 위치를 서버에 보낸다.
서버는 속도 한도를 넘거나 충돌 모양·광장 밖에 걸친 위치를 받지 않고, 마지막으로 받은 위치를 되돌려 준다.

경찰과 도둑 (방장이 시작한다, 2명 이상)
- 약 3분의 1(최소 1명)이 경찰, 나머지가 도둑. 경찰은 처음 HEAD_START초 동안 움직이지 못한다.
- 경찰이 도둑에게 닿으면(CATCH 거리) 도둑은 오른쪽 위 구석의 감옥(울타리로 막힌 칸)으로 옮겨진다.
- 잡히지 않은 도둑이 감옥 앞 구출 발판을 밟으면 갇힌 도둑이 모두 발판 둘레로 풀려나고 SAFE_SECONDS초 동안 잡히지 않는다.
- ROUND_SECONDS 안에 도둑이 모두 갇히면 경찰 승리, 시간이 다 됐을 때 한 명이라도 밖에 있으면 도둑 승리.
- 누구나 대시(DASH_SECONDS 동안 DASH_MULT배 빠르게, DASH_COOLDOWN초마다 한 번)를 쓸 수 있다. 서버가 대시 시간을 기록해 속도 검사에 반영한다.

봇: 방장이 대기실에서 넣고 뺀다(id는 음수). 봇은 서버가 움직인다(사람과 같은 충돌 판정과 대시). 경찰 봇은 가까운 도둑을 쫓고,
도둑 봇은 가까운 경찰에게서 달아나다가 동료가 갇히면 구출 발판으로 간다. 막히면 잠깐 옆으로 비켜 돌아간다.
"""
import math
import random
import time

SIZE = 22
MAX_PLAYERS = 8
SPEED = {"lobby": 4.0, "cop": 4.3, "thief": 4.0}     # 칸/초
RADIUS = 0.3                   # 캐릭터 몸통 반지름 (칸)
SLACK = 1.6                    # 네트워크 지연을 봐주는 속도 여유 배수
CATCH = 0.75                   # 경찰과 도둑의 중심이 이보다 가까우면 잡힌다 (칸)
DASH_MULT, DASH_SECONDS, DASH_COOLDOWN = 1.8, 0.8, 5.0
COUNTDOWN, HEAD_START, ROUND_SECONDS, SAFE_SECONDS, RESULT_SECONDS = 3.0, 5.0, 180.0, 3.0, 8.0
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
MODELS = ["character-male-a", "character-female-a", "character-male-b", "character-female-b", "character-male-c", "character-female-c",
          "character-male-d", "character-female-d", "character-male-e", "character-female-e", "character-male-f", "character-female-f"]

# 감옥: 오른쪽 위 구석 [JAIL_X, SIZE] × [0, JAIL_Y]. 울타리(충돌 모양)로 막혀 있다. 구출 발판은 울타리 바깥 모서리 앞.
JAIL_X, JAIL_Y = 18, 4
PAD = {"cx": 16.9, "cy": 5.1, "r": 0.8}
JAIL_SPOTS = [(19.0 + (i % 3) * 1.0, 1.0 + (i // 3) * 1.2) for i in range(9)]

# 광장 소품: (모델, x, y, 돌림, 가로 칸, 세로 칸). 가로·세로는 광장 기준(돌린 뒤) 차지하는 칸 수이고, 소품은 그 칸들의 가운데에 놓인다.
PROPS = [
    ("tableRound", 10, 10, 0, 2, 2), ("benchCushion", 9, 10, 1, 1, 1), ("benchCushion", 12, 11, 3, 1, 1),
    ("loungeSofa", 1, 6, 1, 1, 2), ("tableCoffee", 2, 6, 1, 1, 2), ("bookcaseOpen", 0, 10, 1, 1, 1), ("bookcaseOpen", 0, 11, 1, 1, 1),
    ("bookcaseOpen", 6, 4, 0, 1, 1), ("bookcaseOpen", 7, 4, 0, 1, 1), ("bookcaseOpen", 8, 4, 0, 1, 1),
    ("bookcaseOpen", 13, 16, 0, 1, 1), ("bookcaseOpen", 14, 16, 0, 1, 1), ("bookcaseOpen", 15, 16, 0, 1, 1),
    ("loungeSofa", 5, 14, 0, 2, 1), ("loungeSofa", 15, 7, 1, 1, 2), ("tableCoffee", 5, 13, 0, 2, 1),
    ("pottedPlant", 3, 3, 0, 1, 1), ("pottedPlant", 3, 18, 0, 1, 1), ("pottedPlant", 18, 18, 0, 1, 1), ("pottedPlant", 10, 6, 0, 1, 1),
    ("pottedPlant", 10, 15, 0, 1, 1), ("pottedPlant", 6, 9, 0, 1, 1), ("pottedPlant", 15, 12, 0, 1, 1),
    ("lampSquareFloor", 7, 7, 0, 1, 1), ("lampSquareFloor", 14, 4, 0, 1, 1), ("lampSquareFloor", 7, 17, 0, 1, 1), ("lampSquareFloor", 17, 13, 0, 1, 1),
    ("loungeChair", 12, 0, 0, 1, 1), ("radio", 14, 0, 0, 1, 1), ("speaker", 0, 2, 1, 1, 1),
    ("trashcan", 21, 20, 3, 1, 1), ("cardboardBoxClosed", 20, 21, 0, 1, 1), ("cardboardBoxClosed", 21, 21, 0, 1, 1),
    ("cardboardBoxClosed", 3, 10, 0, 1, 1), ("cardboardBoxClosed", 18, 9, 0, 1, 1), ("cardboardBoxClosed", 19, 9, 0, 1, 1),
]
DECOR = [("rugRound", 10, 10, 0)]       # 밟고 지나갈 수 있는 것
LOBBY_SPAWNS = [(11.0 + dx, 19.5) for dx in (-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5)]
COP_SPAWNS = [(11.0, 8.2), (12.5, 8.2), (9.5, 8.2), (11.0, 13.8)]
THIEF_SPAWNS = [(2.0, 20.0), (20.0, 15.0), (4.0, 1.0), (19.0, 20.0), (1.0, 14.5), (8.5, 1.5), (16.0, 19.5), (20.0, 11.0)]

# Kenney Furniture Kit 모델의 바닥 크기 (모델 단위, 돌리기 전 가로 x · 세로 z). 한 칸 = 5 모델 단위.
CELL_UNITS = 5.0
MODEL_SIZE = {
    "tableRound": (6.9, 8.0), "benchCushion": (4.0, 2.0), "pottedPlant": (2.1, 2.4), "lampSquareFloor": (1.2, 1.2),
    "lampRoundFloor": (1.5, 1.8), "loungeSofa": (9.8, 4.1), "tableCoffee": (6.6, 4.0), "bookcaseOpen": (4.0, 2.5),
    "loungeChair": (4.9, 4.1), "radio": (3.1, 1.0), "speaker": (1.5, 1.5), "trashcan": (2.1, 2.3), "cardboardBoxClosed": (2.1, 2.1),
}
ROUND = {"tableRound", "pottedPlant", "lampSquareFloor", "lampRoundFloor", "trashcan"}    # 위에서 보면 둥근 것
FENCE_T = 0.12                  # 감옥 울타리 두께의 절반 (칸)


def shapes():
    """충돌 모양: 소품(화면에서 그릴 때와 같은 크기·위치, 칸보다 크면 칸에 맞게 줄인다)과 감옥 울타리."""
    out = []
    for model, x, y, rot, w, d in PROPS:
        sx, sz = MODEL_SIZE[model]
        if rot % 2:
            sx, sz = sz, sx                                      # 돌린 뒤의 광장 기준 크기
        ex = min(sx / CELL_UNITS, w + 0.12)
        ey = min(sz / CELL_UNITS, d + 0.12)
        cx, cy = x + w / 2, y + d / 2
        if model in ROUND:
            out.append({"kind": "circle", "cx": cx, "cy": cy, "r": round(min(ex, ey) / 2, 4), "model": model})
        else:
            out.append({"kind": "box", "cx": cx, "cy": cy, "hx": round(ex / 2, 4), "hy": round(ey / 2, 4), "model": model})
    out.append({"kind": "box", "cx": JAIL_X, "cy": JAIL_Y / 2, "hx": FENCE_T, "hy": JAIL_Y / 2 + FENCE_T, "model": "fence"})
    out.append({"kind": "box", "cx": (JAIL_X + SIZE) / 2, "cy": JAIL_Y, "hx": (SIZE - JAIL_X) / 2 + FENCE_T, "hy": FENCE_T, "model": "fence"})
    return out


SHAPES = shapes()


def world_view():
    """화면에 보낼 광장 정보."""
    return {"size": SIZE, "speed": SPEED, "radius": RADIUS, "shapes": SHAPES, "catch": CATCH,
            "dash": {"mult": DASH_MULT, "seconds": DASH_SECONDS, "cooldown": DASH_COOLDOWN},
            "jail": {"x": JAIL_X, "y": JAIL_Y}, "pad": PAD,
            "props": [{"model": m, "x": x, "y": y, "rot": r, "w": w, "d": d} for m, x, y, r, w, d in PROPS],
            "decor": [{"model": m, "x": x, "y": y, "rot": r} for m, x, y, r in DECOR]}


def gap(shape, x, y):
    """점 (x, y)에서 충돌 모양 가장자리까지의 거리 (안쪽이면 0)."""
    if shape["kind"] == "circle":
        return max(0.0, math.hypot(x - shape["cx"], y - shape["cy"]) - shape["r"])
    dx = max(abs(x - shape["cx"]) - shape["hx"], 0.0)
    dy = max(abs(y - shape["cy"]) - shape["hy"], 0.0)
    return math.hypot(dx, dy)


def free_at(x, y):
    """(x, y)에 캐릭터가 설 수 있는가: 광장 안이고, 몸통(원)이 어떤 충돌 모양과도 겹치지 않는다."""
    eps = 1e-6
    if not (RADIUS - eps <= x <= SIZE - RADIUS + eps and RADIUS - eps <= y <= SIZE - RADIUS + eps):
        return False
    return all(gap(s, x, y) >= RADIUS - 1e-4 for s in SHAPES)


def in_jail(x, y):
    return x > JAIL_X and y < JAIL_Y


def push_out(x, y, others=()):
    """(x, y)가 충돌 모양·다른 캐릭터와 겹치면 겹친 만큼 밖으로 민다 (화면의 pushOut과 같은 방식). 민 위치를 돌려준다."""
    for _ in range(4):
        moved = False
        for s in SHAPES:
            if s["kind"] == "circle":
                nx, ny, reach = s["cx"], s["cy"], s["r"] + RADIUS
            else:
                nx = min(max(x, s["cx"] - s["hx"]), s["cx"] + s["hx"])
                ny = min(max(y, s["cy"] - s["hy"]), s["cy"] + s["hy"])
                reach = RADIUS
            dx, dy = x - nx, y - ny
            dist = math.hypot(dx, dy)
            if dist >= reach:
                continue
            if dist < 1e-6:                                    # 중심이 사각형 안: 가까운 변으로 나간다
                ex, ey = s["hx"] - abs(x - s["cx"]), s["hy"] - abs(y - s["cy"])
                if ex < ey:
                    x += math.copysign(1, x - s["cx"] or 1) * (ex + reach + 1e-3)
                else:
                    y += math.copysign(1, y - s["cy"] or 1) * (ey + reach + 1e-3)
            else:
                x += dx / dist * (reach - dist + 1e-3)
                y += dy / dist * (reach - dist + 1e-3)
            moved = True
        for ox, oy in others:
            dx, dy = x - ox, y - oy
            dist = math.hypot(dx, dy)
            if 1e-6 < dist < RADIUS * 2:
                x += dx / dist * (RADIUS * 2 - dist)
                y += dy / dist * (RADIUS * 2 - dist)
                moved = True
        x = min(max(x, RADIUS), SIZE - RADIUS)
        y = min(max(y, RADIUS), SIZE - RADIUS)
        if not moved:
            break
    return x, y


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
        self.dash_until = 0.0
        self.dash_ready = 0.0
        self.tp = 0                     # 서버가 옮길 때마다 1씩 늘어난다 (화면은 이걸 보고 내 위치를 맞춘다)
        self.catches = 0
        self.bot = uid < 0
        self.detour_until, self.detour = 0.0, (0.0, 0.0)
        self.stuck_check, self.wander = (x, y, now), None

    def speed(self):
        return SPEED[self.team or "lobby"]

    def teleport(self, x, y):
        self.x, self.y, self.moving = x, y, False
        self.tp += 1

    def public(self, now):
        return {"id": self.uid, "name": self.name, "model": self.model, "x": round(self.x, 3), "y": round(self.y, 3),
                "dir": round(self.dir, 3), "moving": self.moving, "online": self.connected, "team": self.team, "jailed": self.jailed,
                "safe": round(max(0.0, self.safe_until - now), 1), "frozen": round(max(0.0, self.frozen_until - now), 1),
                "dash": round(max(0.0, self.dash_ready - now), 1), "speed": self.speed(), "tp": self.tp, "catches": self.catches,
                "bot": self.bot}


class Room:
    def __init__(self, code, host_id, name="", private=False):
        self.code, self.host_id = code, host_id
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
        x, y = next(((sx, sy) for sx, sy in LOBBY_SPAWNS if all((p.x - sx) ** 2 + (p.y - sy) ** 2 > 0.5 for p in self.players.values())), LOBBY_SPAWNS[0])
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

    # ── 이동 ───────────────────────────────────────────────────
    def move(self, uid, x, y, direction, moving, now=None):
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
        dash = min(dt, max(0.0, p.dash_until - p.last))                 # 이 구간 중 대시하던 시간
        reach = (p.speed() * (dt + dash * (DASH_MULT - 1))) * SLACK + 0.25
        frozen = now < p.frozen_until
        bad = (x - p.x) ** 2 + (y - p.y) ** 2 > reach ** 2 or not free_at(x, y) or (frozen and (x, y) != (p.x, p.y))
        if not bad and self.phase in ("countdown", "playing"):
            bad = in_jail(x, y) != p.jailed                             # 갇힌 사람은 감옥 안, 나머지는 감옥 밖에만
        p.last = now
        if bad:
            return False
        p.x, p.y, p.dir, p.moving = x, y, direction, bool(moving)
        self.dirty = True
        return True

    def dash(self, uid, now=None):
        p = self.players.get(uid)
        now = time.monotonic() if now is None else now
        if p is None or now < p.dash_ready or now < p.frozen_until or p.jailed:
            return False
        p.dash_until = now + DASH_SECONDS
        p.dash_ready = now + DASH_COOLDOWN
        self.dirty = True
        return True

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
        for i, p in enumerate(people):
            p.team = "cop" if i < cops else "thief"
            p.jailed, p.catches = False, 0
            p.safe_until = p.dash_until = p.dash_ready = 0.0
            spots = COP_SPAWNS if p.team == "cop" else THIEF_SPAWNS
            index = i if p.team == "cop" else i - cops
            p.teleport(*spots[index % len(spots)])
            p.frozen_until = now + COUNTDOWN + (HEAD_START if p.team == "cop" else 0.0)
            p.last = now
        self.phase, self.phase_end, self.result = "countdown", now + COUNTDOWN, None
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
        if self.phase == "countdown" and now >= self.phase_end:
            self.phase, self.phase_end = "playing", now + ROUND_SECONDS
            self.events.append({"t": "go"})
            self.dirty = True
        elif self.phase == "playing":
            self._catch(now)
            self._rescue(now)
            self._check_end(now)
            self.dirty = True                                           # 남은 시간이 흐르므로 매번 보낸다
        elif self.phase == "result" and now >= self.phase_end:
            self._back_to_lobby(now)

    # ── 봇 ─────────────────────────────────────────────────────
    def _bots(self, dt, now):
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
            gx, gy, dash = goal
            dx, dy = gx - b.x, gy - b.y
            dist = math.hypot(dx, dy)
            if dist < 0.15:
                b.moving = False
                continue
            if now < b.detour_until:                          # 막혀서 잠깐 옆으로 돌아가는 중
                dx, dy = b.detour
                dist = 1.0
            if dash and now >= b.dash_ready:
                self.dash(b.uid, now)
            speed = b.speed() * (DASH_MULT if now < b.dash_until else 1.0)
            step = min(dist, speed * dt)
            others = [(p.x, p.y) for p in people if p is not b and not p.jailed]
            n = max(1, math.ceil(step / 0.08))
            x, y = b.x, b.y
            for _ in range(n):
                x += dx / dist * step / n
                y += dy / dist * step / n
                x, y = push_out(x, y, others)
            if not free_at(x, y) or in_jail(x, y):
                x, y = b.x, b.y
            b.dir = math.atan2(x - b.x, y - b.y) if (x, y) != (b.x, b.y) else b.dir
            b.x, b.y, b.moving = x, y, True
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

    def _bot_goal(self, b, people, now):
        """봇이 향할 곳 (x, y, 대시할지). 없으면 None."""
        if b.team == "cop":
            prey = [p for p in people if p.team == "thief" and not p.jailed and now >= p.safe_until]
            if not prey:
                return None
            t = min(prey, key=lambda p: (p.x - b.x) ** 2 + (p.y - b.y) ** 2)
            d = math.hypot(t.x - b.x, t.y - b.y)
            return t.x, t.y, 1.5 < d < 4.5
        if b.team != "thief":
            return None
        cops = [p for p in people if p.team == "cop"]
        near = min(cops, key=lambda p: (p.x - b.x) ** 2 + (p.y - b.y) ** 2) if cops else None
        d = math.hypot(near.x - b.x, near.y - b.y) if near else 99.0
        jailed = any(p.jailed for p in people)
        pad_guard = min((math.hypot(p.x - PAD["cx"], p.y - PAD["cy"]) for p in cops), default=99.0)
        if jailed and (d > 3.0 or pad_guard > 4.0) and pad_guard > 2.0:
            return PAD["cx"], PAD["cy"], d < 2.5
        if near is not None and d < 7.0:                          # 경찰과 멀어지는 쪽 중 갈 수 있는 방향
            best, best_score = None, -1e9
            for k in range(16):
                a = k * math.pi / 8
                tx, ty = push_out(b.x + math.cos(a) * 1.5, b.y + math.sin(a) * 1.5)
                score = math.hypot(tx - near.x, ty - near.y) + math.hypot(tx - b.x, ty - b.y) * 0.6 + self.rng.uniform(0, 0.3)
                if score > best_score and not in_jail(tx, ty):
                    best, best_score = (tx, ty), score
            return best[0], best[1], d < 2.5
        if b.wander is None or math.hypot(b.wander[0] - b.x, b.wander[1] - b.y) < 0.5 or self.rng.random() < 0.01:
            for _ in range(20):
                wx, wy = self.rng.uniform(1, SIZE - 1), self.rng.uniform(JAIL_Y + 1, SIZE - 1)
                if free_at(wx, wy):
                    b.wander = (wx, wy)
                    break
        return (b.wander[0], b.wander[1], False) if b.wander else None

    def _catch(self, now):
        cops = [p for p in self.players.values() if p.team == "cop" and now >= p.frozen_until]
        for t in self.players.values():
            if t.team != "thief" or t.jailed or now < t.safe_until:
                continue
            cop = next((c for c in cops if (c.x - t.x) ** 2 + (c.y - t.y) ** 2 <= CATCH ** 2), None)
            if cop is None:
                continue
            t.jailed = True
            taken = {(round(p.x, 1), round(p.y, 1)) for p in self.players.values() if p.jailed and p is not t}
            spot = next((s for s in JAIL_SPOTS if (round(s[0], 1), round(s[1], 1)) not in taken), JAIL_SPOTS[0])
            t.teleport(*spot)
            t.last = now
            cop.catches += 1
            self.events.append({"t": "caught", "thief": t.uid, "cop": cop.uid})

    def _rescue(self, now):
        jailed = [p for p in self.players.values() if p.jailed]
        if not jailed:
            return
        hero = next((p for p in self.players.values() if p.team == "thief" and not p.jailed
                     and (p.x - PAD["cx"]) ** 2 + (p.y - PAD["cy"]) ** 2 <= PAD["r"] ** 2), None)
        if hero is None:
            return
        for i, t in enumerate(jailed):
            angle = math.pi * (0.55 + 0.5 * i / max(1, len(jailed)))          # 발판 아래쪽 둘레에 내려놓는다
            x, y = PAD["cx"] + math.cos(angle) * 1.4, PAD["cy"] + math.sin(angle) * 1.4
            if not free_at(x, y):
                x, y = PAD["cx"], PAD["cy"]
            t.jailed = False
            t.safe_until = now + SAFE_SECONDS
            t.teleport(x, y)
            t.last = now
        self.events.append({"t": "rescue", "by": hero.uid, "count": len(jailed)})

    def _check_end(self, now):
        cops = [p for p in self.players.values() if p.team == "cop"]
        thieves = [p for p in self.players.values() if p.team == "thief"]
        winner = None
        if not cops:
            winner = "thief"
        elif not thieves or all(t.jailed for t in thieves):
            winner = "cop"
        elif self.phase == "playing" and now >= self.phase_end:
            winner = "thief"
        if winner:
            self.phase, self.phase_end = "result", now + RESULT_SECONDS
            self.result = {"winner": winner, "free": sum(1 for t in thieves if not t.jailed), "thieves": len(thieves),
                           "catches": {p.uid: p.catches for p in cops}}
            self.events.append({"t": "end", "winner": winner})
            self.dirty = True

    def _back_to_lobby(self, now):
        self.phase, self.result = "lobby", None
        for i, p in enumerate(self.players.values()):
            p.team, p.jailed = None, False
            p.safe_until = p.frozen_until = p.dash_until = p.dash_ready = 0.0
            p.teleport(*LOBBY_SPAWNS[i % len(LOBBY_SPAWNS)])
            p.last = now
        self.events.append({"t": "lobby"})
        self.dirty = True

    def take_events(self):
        ev, self.events = self.events, []
        return ev

    def summary(self):
        """열린 방 목록에 보일 한 줄."""
        return {"code": self.code, "name": self.name, "players": len(self.humans()), "bots": len(self.players) - len(self.humans()),
                "max": MAX_PLAYERS, "phase": self.phase}

    def snapshot(self, now=None):
        now = time.monotonic() if now is None else now
        return {"code": self.code, "name": self.name, "private": self.private, "host": self.host_id, "phase": self.phase,
                "left": round(max(0.0, self.phase_end - now), 1) if self.phase != "lobby" else None,
                "result": self.result, "players": [p.public(now) for p in self.players.values()]}


def new_code(taken, rng=random):
    for _ in range(200):
        code = "".join(rng.choices(CODE_ALPHABET, k=4))
        if code not in taken:
            return code
    raise RuntimeError("방 코드를 만들 수 없습니다.")
