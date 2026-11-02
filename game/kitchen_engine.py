"""분식 대작전: 마우스(클릭)로만 하는 협동 라면 가게 게임의 규칙 (서버가 모든 것을 판정한다).

DB를 쓰지 않는 순수 파이썬이라 시간(step)과 클릭(click)을 직접 넣어 테스트할 수 있다.

규칙 요약
- 손님이 와서 메뉴를 주문하고, 인내심이 다 닳기 전에 만들어 주면 점수(빨리 줄수록 보너스)를 받는다. 못 만들어 주면 손님이 떠나고 감점.
- 손(hand)에 물건을 집고 → 놓을 곳을 누르는 식이다. 면·달걀은 냄비에서 익히고(오래 두면 탄다), 그릇 자리에 올린 그릇에 익힌 재료와 파를 담아
  주문과 똑같이 맞춰 손님에게 준다.
- 한 가게를 여러 명이 함께 쓴다. 사람마다 자기 손이 따로 있어 한 명은 조리, 한 명은 서빙처럼 역할을 나눌 수 있다.
"""
import random

GAME_SECONDS = 180
MAX_PLAYERS = 4
POTS = 3                    # 냄비 수
SLOTS = 4                   # 그릇 자리 수
SEATS = 4                   # 손님 자리 수
COOK_SECONDS = {"noodle": 6.0, "egg": 4.0}
BURN_AFTER = 8.0            # 다 익은 뒤 이만큼 두면 탄다
PATIENCE = 55.0             # 손님 인내심(초)
LEAVE_PENALTY = 5
SPEED_BONUS = 0.5           # 남은 인내심 비율만큼 더하는 최대 보너스 (점수의 50%)
STAR_TARGETS = (60, 120, 200)   # 1인 기준, 사람 수만큼 곱한다

SOURCES = {"noodle": "면", "egg": "달걀", "scallion": "파"}
BOWL_CODES = ("noodle", "egg", "scallion")     # 그릇에 담을 수 있는 재료 (면·달걀은 익혀서, 파는 그대로)

# (이름, 그릇에 담을 재료, 점수, 뽑힐 가중치)
RECIPES = [
    ("라면", ("noodle",), 20, 4),
    ("계란라면", ("noodle", "egg"), 35, 3),
    ("파송송라면", ("noodle", "scallion"), 35, 3),
    ("풀세트라면", ("noodle", "egg", "scallion"), 55, 2),
]


def customer_interval(players):
    """새 손님이 오는 간격: 사람이 늘수록 더 자주."""
    return max(6.0, 14.0 / (1 + 0.45 * (players - 1)))


class Player:
    def __init__(self, uid, name, index):
        self.uid, self.name, self.index = uid, name, index
        self.hand = None
        self.connected = True

    def public(self):
        return {"id": self.uid, "name": self.name, "color": self.index, "hand": self.hand, "online": self.connected}


class Room:
    def __init__(self, code, host_id, rng=None):
        self.code, self.host_id = code, host_id
        self.rng = rng or random.Random()
        self.players = {}
        self.phase = "lobby"             # lobby → playing → done
        self.events = []
        self.idle_since = None           # 아무도 접속해 있지 않게 된 시각(방 정리용, hub가 채운다)
        self.targets = list(STAR_TARGETS)
        self._clear()

    def _clear(self):
        self.pots = [None] * POTS
        self.slots = [None] * SLOTS
        self.seats = [None] * SEATS
        self.time_left = float(GAME_SECONDS)
        self.score = 0
        self.next_customer_in = 0.0
        self.customer_seq = 0

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
            self._spawn_customer()
        self.next_customer_in = customer_interval(len(self.players))
        return True, ""

    def reset(self):
        """대기실로 되돌린다: 가게와 점수를 처음으로 (접속해 있는 사람만 남긴다)."""
        self.players = {uid: p for uid, p in self.players.items() if p.connected}
        for i, p in enumerate(self.players.values()):
            p.index, p.hand = i, None
        if self.host_id not in self.players and self.players:
            self.host_id = next(iter(self.players))
        self.events = []
        self._clear()
        self.phase = "lobby"

    def back_to_lobby(self, uid):
        if uid != self.host_id:
            return False, "방장만 다시 시작할 수 있어요."
        if self.phase == "playing":
            return False, "게임이 진행 중이에요."
        self.reset()
        return True, ""

    # ── 클릭 ───────────────────────────────────────────────────
    def click(self, uid, target):
        """target: crate:noodle|egg|scallion · bowls · trash · pot:N · slot:N · seat:N. 손에 든 것과 누른 곳에 따라 하는 일이 정해진다."""
        p = self.players.get(uid)
        if p is None or self.phase != "playing":
            return
        kind, _, arg = str(target).partition(":")
        if kind == "crate" and arg in SOURCES:
            self._crate(p, arg)
        elif kind == "bowls":
            if p.hand is None:
                p.hand = {"k": "bowl", "c": []}
        elif kind == "trash":
            if p.hand is not None:
                p.hand = None
                self.events.append({"t": "trash", "uid": uid})
        elif kind == "pot" and _index(arg, POTS) is not None:
            self._pot(p, _index(arg, POTS))
        elif kind == "slot" and _index(arg, SLOTS) is not None:
            self._slot(p, _index(arg, SLOTS))
        elif kind == "seat" and _index(arg, SEATS) is not None:
            self._serve(p, _index(arg, SEATS))

    def _crate(self, p, source):
        hand = p.hand
        if hand is None:
            p.hand = {"k": source, "s": "raw"}
        elif hand["k"] == "bowl" and source == "scallion" and "scallion" not in hand["c"]:
            hand["c"].append("scallion")                 # 파는 손에 든 그릇에 바로 올린다

    def _pot(self, p, i):
        pot, hand = self.pots[i], p.hand
        if pot is None:
            if hand is not None and hand["k"] in COOK_SECONDS and hand["s"] == "raw":
                self.pots[i] = {"k": hand["k"], "s": "cooking", "p": 0.0}
                p.hand = None
        elif hand is None:
            p.hand = {"k": pot["k"], "s": "raw" if pot["s"] == "cooking" else pot["s"]}      # 익는 중에 집으면 날것으로 돌아간다
            self.pots[i] = None
        elif hand["k"] == "bowl" and pot["s"] == "cooked" and pot["k"] not in hand["c"]:
            hand["c"].append(pot["k"])                   # 손에 든 그릇에 바로 담는다
            self.pots[i] = None

    def _slot(self, p, i):
        bowl, hand = self.slots[i], p.hand
        if bowl is None:
            if hand is not None and hand["k"] == "bowl":
                self.slots[i], p.hand = hand, None
        elif hand is None:
            p.hand, self.slots[i] = bowl, None
        elif hand["k"] != "bowl" and _addable(bowl, hand):
            bowl["c"].append(hand["k"])
            p.hand = None

    def _serve(self, p, i):
        customer, hand = self.seats[i], p.hand
        if customer is None or hand is None or hand["k"] != "bowl" or not hand["c"]:
            return
        if sorted(hand["c"]) != sorted(customer["items"]):
            self.events.append({"t": "reject", "uid": p.uid})
            return
        bonus = round(customer["pts"] * SPEED_BONUS * max(0.0, customer["patience"]) / customer["max"])
        gained = customer["pts"] + bonus
        self.score += gained
        self.seats[i], p.hand = None, None
        self.events.append({"t": "serve", "uid": p.uid, "name": customer["name"], "pts": gained, "bonus": bonus, "by": p.name, "seat": i})

    # ── 시간 ───────────────────────────────────────────────────
    def step(self, dt):
        """dt초만큼 게임을 진행하고 이번 틱에 생긴 이벤트 목록을 돌려준다."""
        if self.phase != "playing":
            return []
        self._cook(dt)
        self._customers(dt)
        self.time_left = max(0.0, self.time_left - dt)
        if self.time_left <= 0:
            self.phase = "done"
            self.events.append({"t": "end", "score": self.score, "stars": self.stars()})
        return self.take_events()

    def take_events(self):
        events, self.events = self.events, []
        return events

    def stars(self):
        return sum(1 for t in self.targets if self.score >= t)

    def _cook(self, dt):
        for pot in self.pots:
            if pot is None:
                continue
            pot["p"] += dt
            if pot["s"] == "cooking" and pot["p"] >= COOK_SECONDS[pot["k"]]:
                pot["s"], pot["p"] = "cooked", 0.0
                self.events.append({"t": "ding"})
            elif pot["s"] == "cooked" and pot["p"] >= BURN_AFTER:
                pot["s"], pot["p"] = "burnt", 0.0
                self.events.append({"t": "burnt"})

    def _customers(self, dt):
        for i, customer in enumerate(self.seats):
            if customer is None:
                continue
            customer["patience"] -= dt
            if customer["patience"] <= 0:
                self.seats[i] = None
                self.score = max(0, self.score - LEAVE_PENALTY)
                self.events.append({"t": "leave", "name": customer["name"], "seat": i})
        self.next_customer_in -= dt
        if self.next_customer_in <= 0:
            self._spawn_customer()
            self.next_customer_in = customer_interval(len(self.players))

    def _spawn_customer(self):
        free = [i for i, c in enumerate(self.seats) if c is None]
        if not free:
            return
        name, items, pts, _ = self.rng.choices(RECIPES, weights=[r[3] for r in RECIPES])[0]
        self.customer_seq += 1
        self.seats[self.rng.choice(free)] = {"id": self.customer_seq, "name": name, "items": list(items), "pts": pts,
                                             "patience": PATIENCE, "max": PATIENCE}

    # ── 화면에 보낼 상태 ───────────────────────────────────────
    def snapshot(self):
        return {
            "code": self.code, "phase": self.phase, "host": self.host_id,
            "time": round(self.time_left, 1), "score": self.score, "targets": self.targets, "stars": self.stars(),
            "players": [p.public() for p in self.players.values()],
            "pots": [_pot_view(pot) for pot in self.pots],
            "slots": self.slots,
            "seats": [None if c is None else {**c, "patience": round(c["patience"], 1)} for c in self.seats],
        }


def _index(text, size):
    return int(text) if text.isdigit() and int(text) < size else None


def _addable(bowl, item):
    """그릇에 담을 수 있는 재료인가: 익힌 면·달걀, 파. 같은 재료는 한 번만."""
    if item["k"] in COOK_SECONDS:
        ok = item["s"] == "cooked"
    else:
        ok = item["k"] == "scallion"
    return ok and item["k"] not in bowl["c"]


def _pot_view(pot):
    if pot is None:
        return None
    need = COOK_SECONDS[pot["k"]] if pot["s"] == "cooking" else BURN_AFTER
    return {"k": pot["k"], "s": pot["s"], "p": 1.0 if pot["s"] == "burnt" else round(min(1.0, pot["p"] / need), 2)}
