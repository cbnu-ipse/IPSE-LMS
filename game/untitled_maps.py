"""경찰과 도둑 맵: 크기(가로×세로, 정사각형이 아니다)·구역·벽·소품과, 그로부터 만든 충돌 판정과 봇 길찾기 격자.

좌표는 칸 단위 실수 (x, y). 칸 (i, j)는 x∈[i, i+1), y∈[j, j+1)이다.
소품은 실제 모델 크기의 충돌 모양(둥근 것은 원, 나머지는 회전을 반영한 사각형)으로 막는다. 캐릭터는 반지름 RADIUS의 원이다.
감옥은 언제나 오른쪽 위 구석 [jail_x, w] × [0, jail_y]이고 울타리로 막혀 있다. 구출 발판은 울타리 바깥 모서리 앞이다.
"""
import math
from collections import deque

RADIUS = 0.3                   # 캐릭터 몸통 반지름 (칸)
TOUCH = 2e-3                   # 맞닿음 허용 오차: 화면은 밀어낸 위치를 소수 셋째 자리로 반올림해 보내므로 그만큼 봐준다
WALL_T = 0.12                  # 벽 두께의 절반 (칸)
FENCE_T = 0.12                 # 감옥 울타리 두께의 절반 (칸)
STEP = 0.5                     # 봇 길찾기 격자 간격 (칸)

# Kenney Furniture Kit 모델의 바닥 크기 (모델 단위, 돌리기 전 가로 x · 세로 z). 한 칸 = 5 모델 단위.
CELL_UNITS = 5.0
MODEL_SIZE = {
    "table": (8.4, 4.5), "tableCloth": (8.4, 4.5), "tableCross": (8.5, 4.5), "chair": (2.0, 2.0), "stoolBar": (2.7, 2.3),
    "desk": (7.3, 3.9), "chairDesk": (3.3, 3.1), "bookcaseClosed": (4.0, 2.5), "bookcaseClosedWide": (8.0, 2.5),
    "bookcaseOpen": (4.0, 2.5), "bookcaseOpenLow": (4.0, 2.5), "cardboardBoxOpen": (3.7, 2.1), "cardboardBoxClosed": (2.1, 2.1),
    "kitchenBar": (4.3, 2.1), "kitchenCabinet": (4.3, 4.5), "kitchenFridge": (4.3, 2.9), "kitchenStove": (4.3, 4.5), "kitchenSink": (4.3, 4.5),
    "cabinetTelevision": (8.0, 2.5), "washer": (3.9, 3.9), "dryer": (3.9, 3.8), "washerDryerStacked": (3.9, 3.9),
    "coatRackStanding": (2.7, 2.7), "sideTable": (5.3, 2.2), "bench": (4.0, 2.0), "benchCushion": (4.0, 2.0),
    "tableCoffeeGlass": (6.6, 4.0), "tableCoffee": (6.6, 4.0), "tableRound": (6.9, 8.0), "pottedPlant": (2.1, 2.4),
    "lampSquareFloor": (1.2, 1.2), "lampRoundFloor": (1.5, 1.8), "loungeSofa": (9.8, 4.1), "loungeChair": (4.9, 4.1),
    "loungeChairRelax": (4.9, 6.75), "radio": (3.1, 1.0), "speaker": (1.5, 1.5), "trashcan": (2.1, 2.3),
    "bedSingle": (5.7, 11.25), "bedBunk": (5.7, 10.95), "cabinetBedDrawer": (2.7, 2.2),
}
ROUND = {"tableRound", "pottedPlant", "lampSquareFloor", "lampRoundFloor", "trashcan", "stoolBar", "coatRackStanding"}    # 위에서 보면 둥근 것


def gap(shape, x, y):
    """점 (x, y)에서 충돌 모양 가장자리까지의 거리 (안쪽이면 0)."""
    if shape["kind"] == "circle":
        return max(0.0, math.hypot(x - shape["cx"], y - shape["cy"]) - shape["r"])
    dx = max(abs(x - shape["cx"]) - shape["hx"], 0.0)
    dy = max(abs(y - shape["cy"]) - shape["hy"], 0.0)
    return math.hypot(dx, dy)


def _seg_hits_box(x0, y0, x1, y1, s):
    """선분이 사각형 s 자체(반지름으로 부풀리지 않은 것)를 지나는지 (slab 방법)."""
    lo, hi = 0.0, 1.0
    for a0, d, c, h in ((x0, x1 - x0, s["cx"], s["hx"]), (y0, y1 - y0, s["cy"], s["hy"])):
        if abs(d) < 1e-12:
            if abs(a0 - c) > h:
                return False
            continue
        t0, t1 = (c - h - a0) / d, (c + h - a0) / d
        lo, hi = max(lo, min(t0, t1)), min(hi, max(t0, t1))
        if lo > hi:
            return False
    return True


class GameMap:
    """맵 하나. props는 (모델, x, y, 돌림, 가로 칸, 세로 칸): 가로·세로는 돌린 뒤 차지하는 칸 수이고, 소품은 그 칸들의 가운데에 놓인다.
    walls는 (방향, 고정 좌표, 시작, 끝, 문 구간들): "v"는 x=고정 좌표인 세로 벽, "h"는 y=고정 좌표인 가로 벽."""

    def __init__(self, key, name, blurb, w, h, zones, walls, props, decor, lobby, cops, thieves, jail=(4, 4)):
        self.key, self.name, self.blurb = key, name, blurb
        self.w, self.h = w, h
        self.zones, self.wall_lines, self.props, self.decor = zones, walls, props, decor
        self.lobby_spawns, self.cop_spawns, self.thief_spawns = lobby, cops, thieves
        self.jail_x, self.jail_y = w - jail[0], jail[1]
        self.pad = {"cx": self.jail_x - 1.1, "cy": self.jail_y + 1.1, "r": 0.8}
        self.jail_spots = [(self.jail_x + 1.0 + (i % 3) * 1.0, 1.0 + (i // 3) * 1.2) for i in range(9)]
        self.shapes = self._shapes()
        self.walls = [s for s in self.shapes if s["model"] in ("wall", "fence")]
        self._buckets = self._bucket_shapes()
        self.gx, self.gy = int(w / STEP), int(h / STEP)
        self.walk = [[self.free_at((i + 0.5) * STEP, (j + 0.5) * STEP) and not self.in_jail((i + 0.5) * STEP, (j + 0.5) * STEP)
                      for j in range(self.gy)] for i in range(self.gx)]
        self.open = [[sum(self.walk[a][b] for a in range(max(0, i - 3), min(self.gx, i + 4)) for b in range(max(0, j - 3), min(self.gy, j + 4)))
                      for j in range(self.gy)] for i in range(self.gx)]

    # ── 충돌 모양 ───────────────────────────────────────────────
    def _shapes(self):
        out = []
        for model, x, y, rot, w, d in self.props:
            sx, sz = MODEL_SIZE[model]
            if rot % 2:
                sx, sz = sz, sx                                      # 돌린 뒤의 맵 기준 크기
            ex, ey = min(sx / CELL_UNITS, w + 0.12), min(sz / CELL_UNITS, d + 0.12)
            cx, cy = x + w / 2, y + d / 2
            if model in ROUND:
                out.append({"kind": "circle", "cx": cx, "cy": cy, "r": round(min(ex, ey) / 2, 4), "model": model})
            else:
                out.append({"kind": "box", "cx": cx, "cy": cy, "hx": round(ex / 2, 4), "hy": round(ey / 2, 4), "model": model})
        for o, fixed, a, b, gaps in self.wall_lines:              # 벽: 문 구간을 뺀 이어진 토막마다 얇은 사각형
            cuts = [a] + [g for gp in gaps for g in gp] + [b]
            for t0, t1 in zip(cuts[::2], cuts[1::2]):
                if t1 <= t0:
                    continue
                mid, half = (t0 + t1) / 2, (t1 - t0) / 2 + WALL_T
                if o == "v":
                    out.append({"kind": "box", "cx": fixed, "cy": mid, "hx": WALL_T, "hy": half, "model": "wall"})
                else:
                    out.append({"kind": "box", "cx": mid, "cy": fixed, "hx": half, "hy": WALL_T, "model": "wall"})
        jx, jy = self.jail_x, self.jail_y
        out.append({"kind": "box", "cx": jx, "cy": jy / 2, "hx": FENCE_T, "hy": jy / 2 + FENCE_T, "model": "fence"})
        out.append({"kind": "box", "cx": (jx + self.w) / 2, "cy": jy, "hx": (self.w - jx) / 2 + FENCE_T, "hy": FENCE_T, "model": "fence"})
        return out

    def _bucket_shapes(self):
        """칸마다 그 칸 안의 어떤 점에서든 닿을 수 있는 충돌 모양만 모아 둔다 (밀어내기·빈자리 검사를 빠르게)."""
        reach = RADIUS + 0.8
        out = [[[] for _ in range(self.h)] for _ in range(self.w)]
        for s in self.shapes:
            ext_x = s["r"] if s["kind"] == "circle" else s["hx"]
            ext_y = s["r"] if s["kind"] == "circle" else s["hy"]
            for i in range(max(0, int(s["cx"] - ext_x - reach)), min(self.w, int(s["cx"] + ext_x + reach) + 1)):
                for j in range(max(0, int(s["cy"] - ext_y - reach)), min(self.h, int(s["cy"] + ext_y + reach) + 1)):
                    out[i][j].append(s)
        return out

    def near_shapes(self, x, y):
        return self._buckets[min(self.w - 1, max(0, int(x)))][min(self.h - 1, max(0, int(y)))]

    def wall_pieces(self):
        """벽을 한 칸 길이 조각들로 (화면은 조각마다 Kenney 반쪽 벽을 그린다): [(방향, 고정 좌표, 시작)]."""
        return [(o, fixed, t) for o, fixed, a, b, gaps in self.wall_lines for t in range(a, b) if not any(g0 <= t < g1 for g0, g1 in gaps)]

    def view(self, extra):
        """화면에 보낼 맵 정보 (extra: 속도·대시 같은 공통 규칙)."""
        return {**extra, "key": self.key, "name": self.name, "w": self.w, "h": self.h, "radius": RADIUS, "shapes": self.shapes,
                "jail": {"x": self.jail_x, "y": self.jail_y}, "pad": self.pad, "zones": self.zones,
                "walls": [{"o": o, "f": f, "t": t} for o, f, t in self.wall_pieces()],
                "props": [{"model": m, "x": x, "y": y, "rot": r, "w": w, "d": d} for m, x, y, r, w, d in self.props],
                "decor": [{"model": m, "x": x, "y": y, "rot": r} for m, x, y, r in self.decor]}

    def summary(self):
        return {"key": self.key, "name": self.name, "blurb": self.blurb, "w": self.w, "h": self.h}

    # ── 판정 ───────────────────────────────────────────────────
    def free_at(self, x, y):
        """(x, y)에 캐릭터가 설 수 있는가: 맵 안이고, 몸통(원)이 어떤 충돌 모양과도 겹치지 않는다."""
        eps = 1e-6
        if not (RADIUS - eps <= x <= self.w - RADIUS + eps and RADIUS - eps <= y <= self.h - RADIUS + eps):
            return False
        return all(gap(s, x, y) >= RADIUS - TOUCH for s in self.near_shapes(x, y))

    def crosses_wall(self, x0, y0, x1, y1):
        """두 위치 사이에서 벽·울타리를 뚫고 지나갔는지. 끝점만 보면 얇은 벽을 한 번에 건너뛸 수 있어서 따로 본다."""
        return any(_seg_hits_box(x0, y0, x1, y1, s) for s in self.walls)

    def in_jail(self, x, y):
        return x > self.jail_x and y < self.jail_y

    def on_pad(self, x, y):
        return (x - self.pad["cx"]) ** 2 + (y - self.pad["cy"]) ** 2 <= self.pad["r"] ** 2

    def push_out(self, x, y, others=()):
        """(x, y)가 충돌 모양·다른 캐릭터와 겹치면 겹친 만큼 밖으로 민다 (화면의 pushOut과 같은 방식). 민 위치를 돌려준다."""
        for _ in range(8):
            moved = False
            for ox, oy in others:                                  # 다른 캐릭터를 먼저 밀고 충돌 모양이 마지막에 이긴다
                dx, dy = x - ox, y - oy
                dist = math.hypot(dx, dy)
                if 1e-6 < dist < RADIUS * 2:
                    x += dx / dist * (RADIUS * 2 - dist)
                    y += dy / dist * (RADIUS * 2 - dist)
                    moved = True
            for s in self.near_shapes(x, y):
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
            x = min(max(x, RADIUS), self.w - RADIUS)
            y = min(max(y, RADIUS), self.h - RADIUS)
            if not moved:
                break
        return x, y

    # ── 봇 길찾기: 반 칸 격자 ───────────────────────────────────
    def node(self, x, y):
        return min(self.gx - 1, max(0, int(x / STEP))), min(self.gy - 1, max(0, int(y / STEP)))

    def walkable_at(self, x, y):
        i, j = self.node(x, y)
        return self.walk[i][j]

    def clear_line(self, x0, y0, x1, y1):
        """두 점 사이를 격자 위에서 막힘 없이 곧게 갈 수 있는지."""
        n = max(1, math.ceil(math.hypot(x1 - x0, y1 - y0) / (STEP * 0.4)))
        for k in range(n + 1):
            i, j = self.node(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n)
            if not self.walk[i][j]:
                return False
        return True

    def find_path(self, x0, y0, x1, y1):
        """(x0, y0)에서 (x1, y1)까지 거쳐 갈 점들. 목표 마디가 막혀 있으면 가장 가까운 열린 마디로 간다. 못 가면 []."""
        w = self.walk
        start, goal = self.node(x0, y0), self.node(x1, y1)
        if not w[goal[0]][goal[1]]:
            cands = [(i, j) for i in range(max(0, goal[0] - 3), min(self.gx, goal[0] + 4))
                     for j in range(max(0, goal[1] - 3), min(self.gy, goal[1] + 4)) if w[i][j]]
            if not cands:
                return []
            goal = min(cands, key=lambda c: (c[0] - goal[0]) ** 2 + (c[1] - goal[1]) ** 2)
        prev = {start: None}
        queue = deque([start])
        while queue:
            cur = queue.popleft()
            if cur == goal:
                break
            i, j = cur
            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
                ni, nj = i + di, j + dj
                if not (0 <= ni < self.gx and 0 <= nj < self.gy) or (ni, nj) in prev or not w[ni][nj]:
                    continue
                if di and dj and not (w[i + di][j] and w[i][j + dj]):      # 모서리를 대각선으로 파고들지 않는다
                    continue
                prev[(ni, nj)] = cur
                queue.append((ni, nj))
        if goal not in prev:
            return []
        out, cur = [], goal
        while cur is not None and cur != start:
            out.append(((cur[0] + 0.5) * STEP, (cur[1] + 0.5) * STEP))
            cur = prev[cur]
        out.reverse()
        if out and self.free_at(x1, y1):
            out[-1] = (x1, y1)
        return out

    def grid_dist(self, sources, limit=None):
        """여러 출발점에서 격자를 따라 잰 거리(칸) 지도 {마디: 거리}. limit을 넘는 곳은 넣지 않는다."""
        w = self.walk
        dist, queue = {}, deque()
        for x, y in sources:
            n = self.node(x, y)
            if n not in dist:
                dist[n] = 0.0
                queue.append(n)
        while queue:
            cur = queue.popleft()
            i, j = cur
            base = dist[cur]
            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ni, nj = i + di, j + dj
                if 0 <= ni < self.gx and 0 <= nj < self.gy and w[ni][nj] and (ni, nj) not in dist and (limit is None or base + STEP <= limit):
                    dist[(ni, nj)] = base + STEP
                    queue.append((ni, nj))
        return dist


def _row(model, y, xs, rot=0):
    return [(model, x, y, rot, 1, 1) for x in xs]


def _cluster(x, y, model="cardboardBoxClosed"):
    return [(model, x + i, y + j, 0, 1, 1) for i in (0, 1) for j in (0, 1)]


# ── 캠퍼스 (40×26): 네 모서리 구역과 가운데 십자 광장 ───────────────────
def _campus():
    zones = [
        {"kind": "library", "name": "도서관", "color": "#8b5a2b", "x0": 0, "y0": 0, "x1": 14, "y1": 10},
        {"kind": "cafe", "name": "카페", "color": "#f59e0b", "x0": 26, "y0": 0, "x1": 40, "y1": 10},
        {"kind": "lounge", "name": "라운지", "color": "#14b8a6", "x0": 0, "y0": 16, "x1": 14, "y1": 26},
        {"kind": "warehouse", "name": "창고", "color": "#64748b", "x0": 26, "y0": 16, "x1": 40, "y1": 26},
    ]
    walls = [
        ("v", 14, 0, 10, [(4, 6)]), ("h", 10, 0, 14, [(6, 8)]),
        ("v", 26, 0, 10, [(6, 8)]), ("h", 10, 26, 40, [(30, 32)]),
        ("v", 14, 16, 26, [(20, 22)]), ("h", 16, 0, 14, [(3, 5), (10, 12)]),
        ("v", 26, 16, 26, [(20, 22)]), ("h", 16, 26, 40, [(31, 33)]),
    ]
    props = (
        # 도서관: 책장 줄 사이 통로
        _row("bookcaseOpen", 2, [1, 2, 3, 4, 5, 8, 9, 10, 11, 12]) + _row("bookcaseOpen", 5, [1, 2, 3, 6, 7, 8, 9, 10, 11])
        + _row("bookcaseOpen", 8, [1, 2, 3, 4, 9, 10, 11, 12])
        + [("lampRoundFloor", 13, 1, 0, 1, 1), ("pottedPlant", 13, 8, 0, 1, 1), ("bookcaseClosedWide", 6, 0, 0, 2, 1)]
        # 카페: 카운터와 스툴, 테이블 자리 (오른쪽 위 구석은 감옥)
        + [("kitchenFridge", 27, 0, 0, 1, 1), ("kitchenBar", 28, 0, 0, 1, 1), ("kitchenBar", 29, 0, 0, 1, 1), ("kitchenBar", 30, 0, 0, 1, 1),
           ("kitchenCabinet", 31, 0, 0, 1, 1), ("kitchenSink", 32, 0, 0, 1, 1), ("kitchenStove", 33, 0, 0, 1, 1)]
        + _row("stoolBar", 2, [28, 29, 30], 2)
        + [("tableRound", 27, 4, 0, 2, 2), ("chair", 29, 5, 3, 1, 1), ("tableRound", 28, 7, 0, 2, 2), ("chair", 30, 8, 3, 1, 1),
           ("tableCloth", 32, 7, 0, 2, 1), ("chair", 32, 6, 0, 1, 1), ("chair", 33, 6, 0, 1, 1), ("chair", 32, 8, 2, 1, 1), ("chair", 33, 8, 2, 1, 1),
           ("pottedPlant", 39, 9, 0, 1, 1), ("pottedPlant", 27, 9, 0, 1, 1), ("lampSquareFloor", 39, 6, 0, 1, 1)]
        # 라운지: 소파, TV장, 책상 자리
        + [("loungeSofa", 2, 19, 0, 2, 1), ("tableCoffee", 2, 21, 0, 2, 1), ("cabinetTelevision", 2, 23, 2, 2, 1),
           ("desk", 8, 19, 0, 2, 1), ("chairDesk", 8, 18, 0, 1, 1), ("desk", 8, 24, 0, 2, 1), ("chairDesk", 9, 23, 0, 1, 1),
           ("loungeChair", 12, 18, 3, 1, 1), ("loungeChair", 12, 24, 3, 1, 1), ("sideTable", 5, 25, 0, 1, 1),
           ("pottedPlant", 1, 17, 0, 1, 1), ("pottedPlant", 13, 25, 0, 1, 1), ("lampSquareFloor", 0, 25, 0, 1, 1)]
        # 창고: 상자 미로와 세탁기
        + _row("cardboardBoxClosed", 18, [28, 29, 30, 34, 35, 36]) + _row("cardboardBoxOpen", 20, [29, 32, 33, 38])
        + _row("cardboardBoxClosed", 23, [28, 29, 34, 35, 36]) + _row("cardboardBoxOpen", 25, [30, 31, 32, 36])
        + [("bookcaseClosed", 27, 25, 0, 1, 1), ("bookcaseClosed", 28, 25, 0, 1, 1), ("washer", 39, 25, 0, 1, 1), ("washer", 38, 25, 0, 1, 1)]
        # 가운데 광장과 복도
        + [("tableRound", 19, 12, 0, 2, 2), ("benchCushion", 18, 12, 1, 1, 1), ("benchCushion", 21, 13, 3, 1, 1),
           ("lampSquareFloor", 17, 11, 0, 1, 1), ("lampSquareFloor", 22, 11, 0, 1, 1), ("lampSquareFloor", 17, 14, 0, 1, 1), ("lampSquareFloor", 22, 14, 0, 1, 1),
           ("bench", 19, 1, 0, 1, 1), ("pottedPlant", 16, 3, 0, 1, 1), ("pottedPlant", 23, 6, 0, 1, 1), ("lampRoundFloor", 20, 7, 0, 1, 1),
           ("bookcaseOpenLow", 17, 5, 0, 1, 1), ("bookcaseOpenLow", 22, 4, 0, 1, 1),
           ("pottedPlant", 16, 20, 0, 1, 1), ("pottedPlant", 23, 23, 0, 1, 1), ("bench", 19, 25, 2, 1, 1), ("lampRoundFloor", 20, 18, 0, 1, 1),
           ("bookcaseOpenLow", 17, 22, 0, 1, 1), ("bookcaseOpenLow", 22, 21, 0, 1, 1),
           ("pottedPlant", 4, 12, 0, 1, 1), ("pottedPlant", 9, 14, 0, 1, 1), ("bench", 6, 11, 0, 1, 1), ("trashcan", 1, 14, 0, 1, 1),
           ("pottedPlant", 29, 12, 0, 1, 1), ("pottedPlant", 35, 14, 0, 1, 1), ("speaker", 39, 11, 3, 1, 1), ("bench", 33, 11, 0, 1, 1)]
    )
    decor = [("rugRound", 19, 12, 0), ("rugRectangle", 5, 20, 0), ("rugSquare", 28, 7, 0)]
    return GameMap("campus", "캠퍼스", "도서관·카페·라운지·창고와 가운데 광장", 40, 26, zones, walls, props, decor,
                   lobby=[(16.5 + i, 15.5) for i in range(8)],
                   cops=[(18.4, 10.6), (21.6, 10.6), (18.4, 15.0), (21.6, 15.0)],
                   thieves=[(4.5, 4.0), (6.5, 21.5), (31.5, 21.5), (34.5, 3.0), (20.5, 3.0), (6.5, 13.0), (33.5, 13.5), (20.5, 23.0)])


# ── 물류창고 (44×20): 가로로 긴 적재장·선반 통로·사무실·하역장 ─────────────
def _logistics():
    zones = [
        {"kind": "yard", "name": "적재장", "color": "#a16207", "x0": 0, "y0": 0, "x1": 14, "y1": 20},
        {"kind": "shelves", "name": "선반 구역", "color": "#475569", "x0": 14, "y0": 0, "x1": 30, "y1": 20},
        {"kind": "office", "name": "사무실", "color": "#0ea5e9", "x0": 30, "y0": 0, "x1": 44, "y1": 10},
        {"kind": "dock", "name": "하역장", "color": "#ca8a04", "x0": 30, "y0": 10, "x1": 44, "y1": 20},
    ]
    walls = [("v", 14, 0, 20, [(4, 6), (14, 16)]), ("v", 30, 0, 20, [(3, 5), (14, 16)]), ("h", 10, 30, 44, [(36, 38)])]
    wide = "bookcaseClosedWide"
    props = (
        # 적재장: 상자 더미 (2×2) 사이를 빙빙 돈다
        _cluster(2, 2) + _cluster(7, 2) + _cluster(11, 7) + _cluster(3, 8) + _cluster(8, 11) + _cluster(2, 14) + _cluster(7, 16) + _cluster(11, 13)
        + [("cardboardBoxOpen", 5, 5, 0, 1, 1), ("cardboardBoxOpen", 1, 11, 0, 1, 1), ("tableCross", 4, 18, 0, 2, 1)]
        # 선반 구역: 긴 선반 줄, 가운데와 양 끝이 트여 있다
        + [(wide, x, 2, 0, 2, 1) for x in (16, 18, 24, 26)] + [(wide, x, 6, 0, 2, 1) for x in (15, 17, 23, 25)]
        + [(wide, x, 10, 0, 2, 1) for x in (16, 18, 24, 26)] + [(wide, x, 14, 0, 2, 1) for x in (16, 18, 23, 25)]
        + [(wide, x, 17, 0, 2, 1) for x in (15, 17, 24, 26)]
        + [("cardboardBoxClosed", 21, 8, 0, 1, 1), ("cardboardBoxOpen", 22, 12, 0, 1, 1)]
        # 사무실 (오른쪽 위 구석은 감옥)
        + [("desk", 32, 1, 0, 2, 1), ("chairDesk", 32, 2, 2, 1, 1), ("desk", 35, 1, 0, 2, 1), ("chairDesk", 36, 2, 2, 1, 1),
           ("desk", 33, 6, 0, 2, 1), ("chairDesk", 33, 7, 2, 1, 1), ("bookcaseClosed", 31, 8, 0, 1, 1), ("bookcaseClosed", 31, 9, 0, 1, 1),
           ("coatRackStanding", 41, 8, 0, 1, 1), ("pottedPlant", 43, 9, 0, 1, 1), ("sideTable", 42, 6, 0, 1, 1), ("lampSquareFloor", 39, 8, 0, 1, 1)]
        # 하역장: 팔레트 줄
        + _row("cardboardBoxOpen", 12, [32, 33, 39, 40, 41]) + _row("cardboardBoxClosed", 15, [34, 35, 36, 41, 42])
        + _row("cardboardBoxOpen", 18, [31, 32, 37, 38]) + [("tableCross", 42, 18, 0, 2, 1)]
    )
    decor = [("rugRectangle", 33, 3, 0)]
    return GameMap("logistics", "물류창고", "가로로 긴 창고: 상자 더미와 긴 선반 통로", 44, 20, zones, walls, props, decor,
                   lobby=[(16.5 + i, 4.5) for i in range(8)],
                   cops=[(20.0, 8.5), (22.5, 9.5), (21.5, 12.0), (22.8, 11.0)],
                   thieves=[(5.5, 6.5), (5.5, 12.5), (10.5, 18.5), (36.5, 13.5), (40.0, 17.0), (33.0, 4.5), (21.5, 16.0), (28.5, 12.5)])


# ── 기숙사 (26×40): 세로로 긴 복도와 양쪽 방, 옆방끼리도 문으로 이어진다 ─────
def _dorm():
    zones = [{"kind": "corridor", "name": "복도", "color": "#cbd5e1", "x0": 11, "y0": 0, "x1": 15, "y1": 40}]
    left = [("101호", 0), ("102호", 8), ("휴게실", 16), ("103호", 24), ("104호", 32)]
    right = [("사감실", 0), ("201호", 8), ("세탁실", 16), ("202호", 24), ("203호", 32)]
    room_color = {"휴게실": "#14b8a6", "세탁실": "#38bdf8", "사감실": "#64748b"}
    for name, y in left:
        zones.append({"kind": "room", "name": name, "color": room_color.get(name, "#fb7185"), "x0": 0, "y0": y, "x1": 11, "y1": y + 8})
    for name, y in right:
        zones.append({"kind": "room", "name": name, "color": room_color.get(name, "#a78bfa"), "x0": 15, "y0": y, "x1": 26, "y1": y + 8})
    walls = [
        ("v", 11, 0, 40, [(3, 5), (11, 13), (18, 22), (27, 29), (35, 37)]),
        ("v", 15, 0, 40, [(5, 7), (11, 13), (18, 22), (27, 29), (35, 37)]),
        ("h", 8, 0, 11, [(1, 3)]), ("h", 16, 0, 11, [(8, 10)]), ("h", 24, 0, 11, [(1, 3)]), ("h", 32, 0, 11, [(8, 10)]),
        ("h", 8, 15, 26, [(23, 25)]), ("h", 16, 15, 26, [(16, 18)]), ("h", 24, 15, 26, [(23, 25)]), ("h", 32, 15, 26, [(16, 18)]),
    ]
    props = []
    for _, oy in (left[0], left[1], left[3], left[4]):            # 왼쪽 방: 침대 두 개, 책상, 낮은 책장
        props += [("bedSingle", 0, oy + 1, 0, 1, 2), ("bedBunk", 0, oy + 5, 0, 1, 2), ("cabinetBedDrawer", 1, oy + 1, 0, 1, 1),
                  ("desk", 5, oy + 1, 0, 2, 1), ("chairDesk", 5, oy + 2, 2, 1, 1), ("bookcaseOpenLow", 8, oy, 0, 1, 1), ("bookcaseOpenLow", 9, oy, 0, 1, 1)]
    for _, oy in (right[1], right[3], right[4]):                  # 오른쪽 방: 거울처럼
        props += [("bedSingle", 25, oy + 1, 0, 1, 2), ("bedBunk", 25, oy + 5, 0, 1, 2), ("cabinetBedDrawer", 24, oy + 1, 0, 1, 1),
                  ("desk", 19, oy + 1, 0, 2, 1), ("chairDesk", 20, oy + 2, 2, 1, 1), ("bookcaseOpenLow", 16, oy, 0, 1, 1), ("bookcaseOpenLow", 17, oy, 0, 1, 1)]
    props += [
        # 사감실 (오른쪽 위 구석은 감옥)
        ("desk", 16, 1, 0, 2, 1), ("chairDesk", 17, 2, 2, 1, 1), ("bookcaseClosed", 19, 0, 0, 1, 1), ("bookcaseClosed", 20, 0, 0, 1, 1),
        ("coatRackStanding", 17, 7, 0, 1, 1), ("pottedPlant", 25, 6, 0, 1, 1),
        # 휴게실
        ("loungeSofa", 1, 17, 0, 2, 1), ("tableCoffee", 1, 19, 0, 2, 1), ("cabinetTelevision", 1, 21, 2, 2, 1),
        ("loungeChair", 5, 18, 1, 1, 1), ("loungeChair", 5, 21, 1, 1, 1), ("tableRound", 7, 19, 0, 2, 2),
        ("pottedPlant", 10, 17, 0, 1, 1), ("pottedPlant", 10, 23, 0, 1, 1),
        # 세탁실
        ("washer", 25, 17, 0, 1, 1), ("washer", 25, 18, 0, 1, 1), ("washer", 25, 19, 0, 1, 1), ("dryer", 25, 21, 0, 1, 1), ("dryer", 25, 22, 0, 1, 1),
        ("washerDryerStacked", 21, 17, 0, 1, 1), ("washerDryerStacked", 22, 17, 0, 1, 1),
        ("table", 19, 20, 0, 2, 1), ("cardboardBoxOpen", 16, 23, 0, 1, 1), ("trashcan", 22, 22, 0, 1, 1),
        # 복도
        ("pottedPlant", 14, 1, 0, 1, 1), ("lampSquareFloor", 11, 15, 0, 1, 1), ("lampSquareFloor", 14, 24, 0, 1, 1),
        ("trashcan", 14, 31, 0, 1, 1), ("pottedPlant", 11, 39, 0, 1, 1), ("bench", 14, 8, 1, 1, 1), ("bench", 11, 33, 1, 1, 1),
    ]
    decor = [("rugRectangle", 1, 19, 0), ("rugSquare", 4, 4, 0), ("rugSquare", 20, 28, 0)]
    return GameMap("dorm", "기숙사", "세로로 긴 복도와 양쪽 방, 옆방끼리도 이어진다", 26, 40, zones, walls, props, decor,
                   lobby=[(13.0, 9.5 + i) for i in range(8)],
                   cops=[(12.2, 19.0), (13.8, 19.0), (12.2, 21.0), (13.8, 21.0)],
                   thieves=[(5.5, 4.5), (5.5, 12.5), (5.5, 28.5), (5.5, 36.5), (20.5, 12.5), (20.5, 28.5), (20.5, 36.5), (12.5, 37.0)])


MAPS = {m.key: m for m in (_campus(), _logistics(), _dorm())}
DEFAULT_MAP = "campus"
