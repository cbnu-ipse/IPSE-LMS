"""[무제]: 방(코드로 입장)과 광장 위 캐릭터 이동 규칙 (DB를 쓰지 않는 순수 파이썬).

좌표는 칸 단위 실수 (x, y). 광장은 SIZE×SIZE 칸이고, 칸 (i, j)는 x∈[i, i+1), y∈[j, j+1)이다. 소품이 놓인 칸은 지나갈 수 없다.
이동은 화면(브라우저)이 바로 그리고 위치를 서버에 보낸다. 서버는 속도 한도를 넘거나 막힌 칸·광장 밖으로 가는 위치를 받지 않고,
마지막으로 받은 위치를 되돌려 준다(화면은 그 자리로 돌아간다).
"""
import math
import random
import time

SIZE = 16
MAX_PLAYERS = 8
SPEED = 4.0                    # 칸/초
RADIUS = 0.3                   # 캐릭터 몸통 반지름 (칸)
SLACK = 1.6                    # 네트워크 지연을 봐주는 속도 여유 배수
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
MODELS = ["character-male-a", "character-female-a", "character-male-b", "character-female-b", "character-male-c", "character-female-c",
          "character-male-d", "character-female-d", "character-male-e", "character-female-e", "character-male-f", "character-female-f"]

# 광장 소품: (모델, x, y, 돌림, 가로 칸, 세로 칸). 차지한 칸은 막힌다.
PROPS = [
    ("tableRound", 7, 7, 0, 2, 2), ("benchCushion", 6, 7, 1, 1, 1), ("benchCushion", 9, 8, 3, 1, 1),
    ("pottedPlant", 2, 2, 0, 1, 1), ("pottedPlant", 13, 2, 0, 1, 1), ("pottedPlant", 2, 13, 0, 1, 1), ("pottedPlant", 13, 13, 0, 1, 1),
    ("lampSquareFloor", 5, 5, 0, 1, 1), ("lampSquareFloor", 10, 5, 0, 1, 1), ("lampSquareFloor", 5, 10, 0, 1, 1), ("lampSquareFloor", 10, 10, 0, 1, 1),
    ("loungeSofa", 1, 6, 1, 1, 2), ("tableCoffee", 2, 6, 1, 1, 2), ("bookcaseOpen", 0, 9, 1, 1, 1), ("bookcaseOpen", 0, 10, 1, 1, 1),
    ("loungeChair", 12, 0, 0, 1, 1), ("radio", 14, 0, 0, 1, 1), ("speaker", 15, 1, 3, 1, 1),
    ("trashcan", 15, 14, 3, 1, 1), ("cardboardBoxClosed", 14, 15, 0, 1, 1), ("cardboardBoxClosed", 15, 15, 0, 1, 1),
]
DECOR = [("rugRound", 7, 7, 0)]       # 밟고 지나갈 수 있는 것
SPAWNS = [(8.0 + dx, 13.5) for dx in (-2.5, -1.5, -0.5, 0.5, 1.5, 2.5, -3.5, 3.5)]


def blocked_cells():
    out = set()
    for _, x, y, _, w, d in PROPS:
        for i in range(w):
            for j in range(d):
                out.add((x + i, y + j))
    return out


BLOCKED = blocked_cells()


def world_view():
    """화면에 보낼 광장 정보."""
    return {"size": SIZE, "speed": SPEED, "radius": RADIUS,
            "props": [{"model": m, "x": x, "y": y, "rot": r, "w": w, "d": d} for m, x, y, r, w, d in PROPS],
            "decor": [{"model": m, "x": x, "y": y, "rot": r} for m, x, y, r in DECOR]}


def free_at(x, y):
    """(x, y)에 캐릭터가 설 수 있는가: 광장 안이고, 몸통이 막힌 칸에 걸치지 않는다."""
    if not (RADIUS <= x <= SIZE - RADIUS and RADIUS <= y <= SIZE - RADIUS):
        return False
    for cx in range(int(math.floor(x - RADIUS)), int(math.floor(x + RADIUS)) + 1):
        for cy in range(int(math.floor(y - RADIUS)), int(math.floor(y + RADIUS)) + 1):
            if (cx, cy) not in BLOCKED:
                continue
            nx, ny = min(max(x, cx), cx + 1), min(max(y, cy), cy + 1)      # 칸 사각형에서 가장 가까운 점
            if (x - nx) ** 2 + (y - ny) ** 2 < RADIUS ** 2 - 1e-9:
                return False
    return True


class Player:
    def __init__(self, uid, name, model, x, y, now):
        self.uid, self.name, self.model = uid, name, model
        self.x, self.y, self.dir, self.moving = x, y, 0.0, False
        self.last = now
        self.connected = True

    def public(self):
        return {"id": self.uid, "name": self.name, "model": self.model, "x": round(self.x, 3), "y": round(self.y, 3),
                "dir": round(self.dir, 3), "moving": self.moving, "online": self.connected}


class Room:
    def __init__(self, code, host_id):
        self.code, self.host_id = code, host_id
        self.players = {}
        self.idle_since = None
        self.dirty = True

    def add(self, uid, name, now=None):
        now = time.monotonic() if now is None else now
        if uid in self.players:
            self.players[uid].connected = True
            return True, ""
        if len(self.players) >= MAX_PLAYERS:
            return False, f"방이 가득 찼어요 (최대 {MAX_PLAYERS}명)."
        used = {p.model for p in self.players.values()}
        model = next(m for m in MODELS if m not in used)
        x, y = next(((sx, sy) for sx, sy in SPAWNS if all((p.x - sx) ** 2 + (p.y - sy) ** 2 > 0.5 for p in self.players.values())), SPAWNS[0])
        self.players[uid] = Player(uid, name, model, x, y, now)
        self.dirty = True
        return True, ""

    def remove(self, uid):
        self.players.pop(uid, None)
        if uid == self.host_id and self.players:
            self.host_id = next(iter(self.players))
        self.dirty = True

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
        reach = SPEED * SLACK * dt + 0.25
        if (x - p.x) ** 2 + (y - p.y) ** 2 > reach ** 2 or not free_at(x, y):
            p.last = now
            return False
        p.x, p.y, p.dir, p.moving = x, y, direction, bool(moving)
        p.last = now
        self.dirty = True
        return True

    def snapshot(self):
        return {"code": self.code, "host": self.host_id, "players": [p.public() for p in self.players.values()]}


def new_code(taken, rng=random):
    for _ in range(200):
        code = "".join(rng.choices(CODE_ALPHABET, k=4))
        if code not in taken:
            return code
    raise RuntimeError("방 코드를 만들 수 없습니다.")
