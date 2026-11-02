"""분식 대작전: 1~4명이 함께 라면 가게를 운영하는 협동 요리 게임의 규칙 (서버가 모든 것을 판정한다).

DB를 쓰지 않는 순수 파이썬이라 틱(step)을 직접 돌려 테스트할 수 있다. 방·시간·주문·재료·조리 상태가 전부 이 객체 안에 있다.

규칙 요약
- 맨 위 줄의 창고에서 재료(면·달걀·파)와 접시를 집는다. 면과 달걀은 화구에서 익히고(오래 두면 탄다), 파는 도마에서 썬다(썰기 키를 누르고 있어야 진행).
- 익힌/썬 재료를 접시에 담아 주문과 똑같이 맞춰 서빙 창구에 낸다. 제한 시간 안에 번 점수로 별을 받는다.
- 혼자서도 모든 일을 할 수 있고, 사람이 늘면 주문이 더 자주 들어와 역할을 나눠야 한다.
"""
import random

W, H = 13, 9
# N 면 상자 · E 달걀 상자 · G 파 상자 · D 접시 · X 쓰레기통 · W 서빙 창구 · T 조리대 · B 도마 · S 화구 · # 벽 · . 바닥
MAP = [
    "#NNEEGGDDTXW#",
    "#...........#",
    "#...........#",
    "#.BBT.SS.SS.#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#TTTTTTTTTTT#",
]
CRATES = {"N": "noodle", "E": "egg", "G": "scallion"}
SPAWNS = [(3, 6), (5, 6), (7, 6), (9, 6)]
MAX_PLAYERS = 4

GAME_SECONDS = 180
MOVE_COOLDOWN = 0.18        # 한 칸 이동에 걸리는 시간
CHOP_SECONDS = 3.0
COOK_SECONDS = {"noodle": 6.0, "egg": 4.0}
BURN_AFTER = 8.0            # 다 익은 뒤 이만큼 두면 탄다
ORDER_TTL = 75.0
MAX_ACTIVE_ORDERS = 5
EXPIRE_PENALTY = 5
STAR_TARGETS = (50, 100, 160)   # 1인 기준, 사람 수만큼 곱한다
PLATE_ITEMS = ("noodle_cooked", "egg_cooked", "scallion_chopped")

# (이름, 접시에 올릴 재료, 점수, 뽑힐 가중치)
RECIPES = [
    ("라면", ("noodle_cooked",), 20, 4),
    ("계란라면", ("noodle_cooked", "egg_cooked"), 35, 3),
    ("파송송라면", ("noodle_cooked", "scallion_chopped"), 35, 3),
    ("풀세트라면", ("noodle_cooked", "egg_cooked", "scallion_chopped"), 55, 2),
]


def tile_at(x, y):
    if 0 <= y < H and 0 <= x < W:
        return MAP[y][x]
    return "#"


def order_interval(players):
    """새 주문이 들어오는 간격: 사람이 늘수록 더 자주."""
    return max(7.0, 18.0 / (1 + 0.4 * (players - 1)))


class Player:
    def __init__(self, uid, name, index):
        self.uid, self.name, self.index = uid, name, index
        self.x, self.y = SPAWNS[index % len(SPAWNS)]
        self.fx, self.fy = 0, 1          # 바라보는 방향
        self.dx = self.dy = 0            # 누르고 있는 방향
        self.cooldown = 0.0
        self.held = None
        self.chopping = False
        self.connected = True

    def public(self):
        return {"id": self.uid, "name": self.name, "x": self.x, "y": self.y, "fx": self.fx, "fy": self.fy,
                "held": self.held, "chop": self.chopping, "color": self.index, "online": self.connected}


class Room:
    def __init__(self, code, host_id, rng=None):
        self.code, self.host_id = code, host_id
        self.rng = rng or random.Random()
        self.players = {}
        self.phase = "lobby"             # lobby → playing → done
        self.items = {}                  # (x, y) → 조리대·도마·화구 위의 물건
        self.orders = []
        self.events = []
        self.time_left = float(GAME_SECONDS)
        self.score = 0
        self.targets = list(STAR_TARGETS)
        self.next_order_in = 0.0
        self.order_seq = 0
        self.idle_since = None           # 아무도 접속해 있지 않게 된 시각(방 정리용, hub가 채운다)

    # ── 방 관리 ────────────────────────────────────────────────
    def add_player(self, uid, name):
        if uid in self.players:
            self.players[uid].connected = True
            return True, ""
        if self.phase != "lobby":
            return False, "이미 시작된 게임이에요. 다음 판에 들어와 주세요."
        if len(self.players) >= MAX_PLAYERS:
            return False, f"방이 가득 찼어요 (최대 {MAX_PLAYERS}명)."
        used = {p.index for p in self.players.values()}
        index = next(i for i in range(MAX_PLAYERS) if i not in used)
        self.players[uid] = Player(uid, name, index)
        return True, ""

    def remove_player(self, uid):
        self.players.pop(uid, None)
        if uid == self.host_id and self.players:
            self.host_id = next(iter(self.players))      # 방장이 나가면 다음 사람에게 넘긴다

    def start(self, uid):
        if uid != self.host_id:
            return False, "방장만 시작할 수 있어요."
        if self.phase == "playing":
            return False, "이미 진행 중이에요."
        self.reset()
        self.phase = "playing"
        self.targets = [t * len(self.players) for t in STAR_TARGETS]
        for _ in range(2):
            self._spawn_order()
        self.next_order_in = order_interval(len(self.players))
        return True, ""

    def reset(self):
        """다시 하기: 시간·점수·주문·재료를 처음으로 되돌린다 (접속해 있는 사람만 남긴다)."""
        self.players = {uid: p for uid, p in self.players.items() if p.connected}
        for i, p in enumerate(self.players.values()):
            p.index = i
            p.x, p.y = SPAWNS[i % len(SPAWNS)]
            p.fx, p.fy, p.dx, p.dy, p.cooldown, p.held, p.chopping = 0, 1, 0, 0, 0.0, None, False
        if self.host_id not in self.players and self.players:
            self.host_id = next(iter(self.players))
        self.items, self.orders, self.events = {}, [], []
        self.time_left, self.score, self.order_seq = float(GAME_SECONDS), 0, 0
        self.phase = "lobby"

    def back_to_lobby(self, uid):
        if uid != self.host_id:
            return False, "방장만 다시 시작할 수 있어요."
        if self.phase == "playing":
            return False, "게임이 진행 중이에요."
        self.reset()
        return True, ""

    # ── 입력 ───────────────────────────────────────────────────
    def set_input(self, uid, dx, dy):
        p = self.players.get(uid)
        if p is None or self.phase != "playing":
            return
        dx, dy = _axis(dx), _axis(dy)
        if dx and dy:
            dy = 0                                   # 대각선은 가로 우선
        p.dx, p.dy = dx, dy

    def set_chop(self, uid, on):
        p = self.players.get(uid)
        if p is not None and self.phase == "playing":
            p.chopping = bool(on)

    def interact(self, uid):
        p = self.players.get(uid)
        if p is None or self.phase != "playing":
            return
        tx, ty = p.x + p.fx, p.y + p.fy
        kind = tile_at(tx, ty)
        if kind in CRATES:
            if p.held is None:
                p.held = {"k": CRATES[kind], "s": "raw"}
        elif kind == "D":
            if p.held is None:
                p.held = {"k": "plate", "c": []}
        elif kind == "X":
            if p.held is not None:
                p.held = None
                self.events.append({"t": "trash", "uid": uid})
        elif kind == "W":
            self._serve(p)
        elif kind in "TBS":
            self._station(p, kind, (tx, ty))

    # ── 상호작용 규칙 ──────────────────────────────────────────
    def _station(self, p, kind, pos):
        slot, held = self.items.get(pos), p.held
        if held is not None and held["k"] == "plate":
            if slot is not None and slot["k"] != "plate" and self._can_add(held, slot):        # 접시에 담기
                held["c"].append(_code(slot))
                del self.items[pos]
            elif slot is None and kind == "T":
                self.items[pos], p.held = held, None
            return
        if held is not None and slot is not None and slot["k"] == "plate" and kind == "T" and self._can_add(slot, held):
            slot["c"].append(_code(held))                                                      # 조리대의 접시에 담기
            p.held = None
            return
        if held is None:
            if slot is not None:
                p.held = self._pick_from(slot, kind)
                del self.items[pos]
            return
        if slot is not None:
            return
        if kind == "T":
            self.items[pos], p.held = held, None
        elif kind == "B" and held["k"] == "scallion" and held["s"] == "raw":
            self.items[pos] = {"k": "scallion", "s": "raw", "p": 0.0}
            p.held = None
        elif kind == "S" and held["k"] in COOK_SECONDS and held["s"] == "raw":
            self.items[pos] = {"k": held["k"], "s": "cooking", "p": 0.0}
            p.held = None

    @staticmethod
    def _pick_from(slot, kind):
        item = {"k": slot["k"], "s": slot["s"]} if slot["k"] != "plate" else slot
        if slot["k"] != "plate" and slot["s"] == "cooking":
            item["s"] = "raw"                                   # 익는 중에 집으면 날것으로 돌아간다
        return item

    @staticmethod
    def _can_add(plate, item):
        code = _code(item)
        return code in PLATE_ITEMS and code not in plate["c"]

    def _serve(self, p):
        held = p.held
        if held is None or held["k"] != "plate" or not held["c"]:
            return
        want = sorted(held["c"])
        for order in sorted(self.orders, key=lambda o: o["ttl"]):
            if sorted(order["items"]) == want:
                self.orders.remove(order)
                self.score += order["pts"]
                p.held = None
                self.events.append({"t": "serve", "uid": p.uid, "name": order["name"], "pts": order["pts"], "by": p.name})
                return
        self.events.append({"t": "reject", "uid": p.uid})

    # ── 시간 ───────────────────────────────────────────────────
    def step(self, dt):
        """dt초만큼 게임을 진행하고 이번 틱에 생긴 이벤트 목록을 돌려준다."""
        if self.phase != "playing":
            return []
        self._move_players(dt)
        self._work(dt)
        self._orders(dt)
        self.time_left = max(0.0, self.time_left - dt)
        if self.time_left <= 0:
            self.phase = "done"
            for p in self.players.values():
                p.dx = p.dy = 0
                p.chopping = False
            self.events.append({"t": "end", "score": self.score, "stars": self.stars()})
        events, self.events = self.events, []
        return events

    def stars(self):
        return sum(1 for t in self.targets if self.score >= t)

    def _move_players(self, dt):
        for p in self.players.values():
            p.cooldown = max(0.0, p.cooldown - dt)
            if not (p.dx or p.dy):
                continue
            p.fx, p.fy = p.dx, p.dy
            if p.cooldown > 0:
                continue
            nx, ny = p.x + p.dx, p.y + p.dy
            if tile_at(nx, ny) == "." and not any(o is not p and (o.x, o.y) == (nx, ny) for o in self.players.values()):
                p.x, p.y = nx, ny
                p.cooldown = MOVE_COOLDOWN

    def _work(self, dt):
        for p in self.players.values():            # 썰기: 도마를 바라보고 키를 누르고 있는 동안
            if p.chopping:
                slot = self.items.get((p.x + p.fx, p.y + p.fy))
                if slot and slot["k"] == "scallion" and slot["s"] == "raw" and tile_at(p.x + p.fx, p.y + p.fy) == "B":
                    slot["p"] += dt
                    if slot["p"] >= CHOP_SECONDS:
                        slot["s"], slot["p"] = "chopped", 0.0
                        self.events.append({"t": "ding"})
        for pos, slot in self.items.items():       # 조리: 화구 위 재료
            if tile_at(*pos) != "S" or slot["k"] not in COOK_SECONDS:
                continue
            if slot["s"] == "cooking":
                slot["p"] += dt
                if slot["p"] >= COOK_SECONDS[slot["k"]]:
                    slot["s"], slot["p"] = "cooked", 0.0
                    self.events.append({"t": "ding"})
            elif slot["s"] == "cooked":
                slot["p"] += dt
                if slot["p"] >= BURN_AFTER:
                    slot["s"], slot["p"] = "burnt", 0.0
                    self.events.append({"t": "burnt"})

    def _orders(self, dt):
        for order in list(self.orders):
            order["ttl"] -= dt
            if order["ttl"] <= 0:
                self.orders.remove(order)
                self.score = max(0, self.score - EXPIRE_PENALTY)
                self.events.append({"t": "expire", "name": order["name"]})
        self.next_order_in -= dt
        if self.next_order_in <= 0:
            if len(self.orders) < MAX_ACTIVE_ORDERS:
                self._spawn_order()
            self.next_order_in = order_interval(len(self.players))

    def _spawn_order(self):
        name, items, pts, _ = self.rng.choices(RECIPES, weights=[r[3] for r in RECIPES])[0]
        self.order_seq += 1
        self.orders.append({"id": self.order_seq, "name": name, "items": list(items), "pts": pts, "ttl": ORDER_TTL, "max": ORDER_TTL})

    # ── 화면에 보낼 상태 ───────────────────────────────────────
    def snapshot(self):
        return {
            "code": self.code, "phase": self.phase, "host": self.host_id,
            "time": round(self.time_left, 1), "score": self.score, "targets": self.targets, "stars": self.stars(),
            "players": [p.public() for p in self.players.values()],
            "items": [{"x": x, "y": y, "item": _view(item)} for (x, y), item in self.items.items()],
            "orders": [{"id": o["id"], "name": o["name"], "items": o["items"], "ttl": round(o["ttl"], 1), "max": o["max"], "pts": o["pts"]}
                       for o in self.orders],
        }


def _axis(value):
    return value if value in (-1, 0, 1) else 0


def _code(item):
    return f"{item['k']}_{item['s']}"


def _view(item):
    out = dict(item)
    if "p" in out:
        need = CHOP_SECONDS if out["k"] == "scallion" else (COOK_SECONDS[out["k"]] if out["s"] == "cooking" else BURN_AFTER)
        out["p"] = round(min(1.0, out["p"] / need), 2)
    return out
