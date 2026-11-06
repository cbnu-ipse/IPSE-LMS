"""경찰과 도둑 맵: 방·복도 같은 영역(사각형)들을 이어 붙인 불규칙한 모양. 영역 밖은 빈 곳(못 들어간다, 화면에 바닥이 없다).

좌표는 칸 단위 실수 (x, y). 칸 (i, j)는 x∈[i, i+1), y∈[j, j+1)이다.
벽은 영역의 경계에 저절로 생긴다: 빈 곳과 맞닿은 변, 그리고 다른 영역과 맞닿았지만 문(doors)이 아닌 변.
영역마다 높이 층(h: -1 지하, 0 바닥, 1 위층 …)이 있고, kind가 "stairs"인 영역은 axis 방향으로 from 층에서 to 층으로 기운 계단이다.
같은 group의 영역끼리는 벽 없이 이어진다 (ㄱ자처럼 사각형 여러 개로 된 방). 움직임·충돌·시야 판정은 평면(2D)이고, 높이는 화면에만 쓴다.
감옥은 kind가 "jail"인 작은 영역이고, 다른 영역과 맞닿은 변은 울타리(지나갈 수는 없지만 너머가 보인다)다.
시야: 벽과 높은 가구(SIGHT_MODELS)가 시선을 막는다. 울타리·문·낮은 가구는 막지 않는다.
소품은 실제 모델 크기의 충돌 모양(둥근 것은 원, 나머지는 회전을 반영한 사각형)으로 막는다. 캐릭터는 반지름 RADIUS의 원이다.
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
SIGHT_MODELS = {"bookcaseOpen", "bookcaseClosed", "bookcaseClosedWide", "kitchenFridge", "washerDryerStacked", "bedBunk"}  # 시선을 막는 높은 가구
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
    """맵 하나. areas는 영역 dict(name, kind, color, x0, y0, x1, y1), doors는 (방향, 고정 좌표, 시작, 끝): "v"는 x=고정 좌표인 세로 변,
    "h"는 y=고정 좌표인 가로 변. props는 (모델, x, y, 돌림, 가로 칸, 세로 칸): 가로·세로는 돌린 뒤 차지하는 칸 수이고,
    소품은 그 칸들의 가운데에 놓인다. pad는 구출 발판 (cx, cy)."""

    def __init__(self, key, name, blurb, areas, doors, props, decor, lobby, cops, thieves, pad):
        self.key, self.name, self.blurb = key, name, blurb
        self.areas, self.doors, self.props, self.decor = areas, doors, props, decor
        self.lobby_spawns, self.cop_spawns, self.thief_spawns = lobby, cops, thieves
        self.w, self.h = max(a["x1"] for a in areas), max(a["y1"] for a in areas)
        self.cell = [[-1] * self.h for _ in range(self.w)]       # 칸마다 영역 번호 (-1은 빈 곳)
        for k, a in enumerate(areas):
            for i in range(a["x0"], a["x1"]):
                for j in range(a["y0"], a["y1"]):
                    self.cell[i][j] = k
        jail = next((a for a in areas if a["kind"] == "jail"), None)    # 대기실처럼 감옥이 없는 맵도 있다
        if jail is None:
            self.jail, self.pad, self.jail_spots = None, None, []
        else:
            self.jail = {"x0": jail["x0"], "y0": jail["y0"], "x1": jail["x1"], "y1": jail["y1"]}
            self.pad = {"cx": pad[0], "cy": pad[1], "r": 0.8}
            jx, jy = (jail["x1"] - jail["x0"]) - 1.6, (jail["y1"] - jail["y0"]) - 1.6
            self.jail_spots = [(jail["x0"] + 0.8 + jx * (i % 3) / 2, jail["y0"] + 0.8 + jy * (i // 3) / 2) for i in range(9)]
        self.wall_edges, self.fence_edges = self._edges(areas.index(jail) if jail else -1)
        self.shapes = self._shapes()
        self.walls = [s for s in self.shapes if s["model"] in ("wall", "fence")]
        self.sight = [s for s in self.shapes if s["model"] == "wall" or (s["model"] in SIGHT_MODELS and s["kind"] == "box")]
        self._buckets = self._bucket_shapes()
        self.gx, self.gy = int(self.w / STEP), int(self.h / STEP)
        self.walk = [[self.free_at((i + 0.5) * STEP, (j + 0.5) * STEP) and not self.in_jail((i + 0.5) * STEP, (j + 0.5) * STEP)
                      for j in range(self.gy)] for i in range(self.gx)]
        self.open = [[sum(self.walk[a][b] for a in range(max(0, i - 3), min(self.gx, i + 4)) for b in range(max(0, j - 3), min(self.gy, j + 4)))
                      for j in range(self.gy)] for i in range(self.gx)]

    def height_at(self, x, y):
        """바닥 높이(층 단위, 계단은 사이 값). 빈 곳은 0."""
        k = self.area_at(x, y)
        if k < 0:
            return 0.0
        a = self.areas[k]
        if a["kind"] != "stairs":
            return float(a.get("h", 0))
        t = (x - a["x0"]) / (a["x1"] - a["x0"]) if a["axis"] == "x" else (y - a["y0"]) / (a["y1"] - a["y0"])
        return a["from"] + (a["to"] - a["from"]) * min(1.0, max(0.0, t))

    def area_at(self, x, y):
        i, j = int(math.floor(x)), int(math.floor(y))
        return self.cell[i][j] if 0 <= i < self.w and 0 <= j < self.h else -1

    def _edges(self, jail_index):
        """영역 경계의 한 칸 길이 변들: 벽 {(방향, 고정 좌표, t)}와 감옥 울타리."""
        def cell(i, j):
            return self.cell[i][j] if 0 <= i < self.w and 0 <= j < self.h else -1

        def is_door(o, fixed, t):
            return any(o == do and fixed == df and d0 <= t < d1 for do, df, d0, d1 in self.doors)

        walls, fences = set(), set()
        for i in range(self.w):
            for j in range(self.h):
                a = self.cell[i][j]
                if a < 0:
                    continue
                for edge, b in ((("v", i, j), cell(i - 1, j)), (("v", i + 1, j), cell(i + 1, j)),
                                (("h", j, i), cell(i, j - 1)), (("h", j + 1, i), cell(i, j + 1))):
                    if b == a or (b >= 0 and self.areas[a].get("group") and self.areas[a].get("group") == self.areas[b].get("group")):
                        continue
                    if b >= 0 and jail_index in (a, b):
                        fences.add(edge)
                    elif b < 0 or not is_door(*edge):
                        walls.add(edge)
        return sorted(walls), sorted(fences)

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
        for edges, model, half_t in ((self.wall_edges, "wall", WALL_T), (self.fence_edges, "fence", FENCE_T)):
            runs = {}                                                # 한 줄로 이어진 변들을 긴 사각형 하나로
            for o, fixed, t in edges:
                runs.setdefault((o, fixed), []).append(t)
            for (o, fixed), ts in runs.items():
                ts.sort()
                start = prev = ts[0]
                for t in ts[1:] + [None]:
                    if t is not None and t == prev + 1:
                        prev = t
                        continue
                    mid, half = (start + prev + 1) / 2, (prev + 1 - start) / 2 + half_t
                    if o == "v":
                        out.append({"kind": "box", "cx": fixed, "cy": mid, "hx": half_t, "hy": half, "model": model})
                    else:
                        out.append({"kind": "box", "cx": mid, "cy": fixed, "hx": half, "hy": half_t, "model": model})
                    start = prev = t
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
        """벽 변들 (화면은 변마다 Kenney 반쪽 벽을 그린다): [(방향, 고정 좌표, 시작)]."""
        return self.wall_edges

    def view(self, extra):
        """화면에 보낼 맵 정보 (extra: 속도·대시 같은 공통 규칙)."""
        return {**extra, "key": self.key, "name": self.name, "w": self.w, "h": self.h, "radius": RADIUS, "shapes": self.shapes,
                "jail": self.jail, "pad": self.pad, "areas": self.areas,
                "walls": [{"o": o, "f": f, "t": t} for o, f, t in self.wall_edges],
                "fences": [{"o": o, "f": f, "t": t} for o, f, t in self.fence_edges],
                "sight": [{"cx": s["cx"], "cy": s["cy"], "hx": s["hx"], "hy": s["hy"]} for s in self.sight],
                "props": [{"model": m, "x": x, "y": y, "rot": r, "w": w, "d": d} for m, x, y, r, w, d in self.props],
                "decor": [{"model": m, "x": x, "y": y, "rot": r} for m, x, y, r in self.decor]}

    def summary(self):
        return {"key": self.key, "name": self.name, "blurb": self.blurb, "w": self.w, "h": self.h}

    # ── 판정 ───────────────────────────────────────────────────
    def free_at(self, x, y):
        """(x, y)에 캐릭터가 설 수 있는가: 맵 안이고, 몸통(원)이 어떤 충돌 모양과도 겹치지 않는다."""
        eps = 1e-6
        if not (RADIUS - eps <= x <= self.w - RADIUS + eps and RADIUS - eps <= y <= self.h - RADIUS + eps) or self.area_at(x, y) < 0:
            return False
        return all(gap(s, x, y) >= RADIUS - TOUCH for s in self.near_shapes(x, y))

    def crosses_wall(self, x0, y0, x1, y1):
        """두 위치 사이에서 벽·울타리를 뚫고 지나갔는지. 끝점만 보면 얇은 벽을 한 번에 건너뛸 수 있어서 따로 본다."""
        return any(_seg_hits_box(x0, y0, x1, y1, s) for s in self.walls)

    def in_jail(self, x, y):
        j = self.jail
        return j is not None and j["x0"] < x < j["x1"] and j["y0"] < y < j["y1"]

    def can_see(self, x0, y0, x1, y1):
        """(x0, y0)에서 (x1, y1)이 보이는가: 그 사이를 벽·높은 가구가 가리지 않는다."""
        lo_x, hi_x, lo_y, hi_y = min(x0, x1), max(x0, x1), min(y0, y1), max(y0, y1)
        for s in self.sight:
            if s["cx"] + s["hx"] < lo_x or s["cx"] - s["hx"] > hi_x or s["cy"] + s["hy"] < lo_y or s["cy"] - s["hy"] > hi_y:
                continue
            if _seg_hits_box(x0, y0, x1, y1, s):
                return False
        return True

    def on_pad(self, x, y):
        return self.pad is not None and (x - self.pad["cx"]) ** 2 + (y - self.pad["cy"]) ** 2 <= self.pad["r"] ** 2

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




def _area(name, kind, color, x0, y0, x1, y1, h=0, group=None):
    return {"name": name, "kind": kind, "color": color, "x0": x0, "y0": y0, "x1": x1, "y1": y1, "h": h, "group": group}


def _stairs(x0, y0, x1, y1, axis, frm, to):
    """계단: axis 방향으로 시작 변(x0 또는 y0)이 frm 층, 끝 변이 to 층."""
    return {"name": "계단", "kind": "stairs", "color": "#a8a29e", "x0": x0, "y0": y0, "x1": x1, "y1": y1,
            "axis": axis, "from": frm, "to": to, "h": max(frm, to), "group": None}


def _row(model, y, xs, rot=0):
    return [(model, x, y, rot, 1, 1) for x in xs]


def _desk(x, y):
    """책상(2×1)과 그 아래 의자."""
    return [("desk", x, y, 0, 2, 1), ("chairDesk", x, y + 1, 2, 1, 1)]


def _classroom(x0, y0, teacher):
    out = [("desk", teacher[0], teacher[1], 0, 2, 1)]
    for dy in (2, 5):
        for dx in (1, 4, 7):
            out += _desk(x0 + dx, y0 + dy)
    return out


CORRIDOR, JAIL = "#cbd5e1", "#94a3b8"


# ── 연구소 (40×44): 위층 헬기장에서 계단 두 개로 내려와, 복도가 고리처럼 방들을 감싸고, 지하 저장고로 다시 계단 두 개 ──
def _lab():
    areas = [
        _area("헬기장", "room", "#64748b", 14, 0, 26, 9, h=1),
        _stairs(14, 9, 16, 13, "y", 1, 0), _stairs(24, 9, 26, 13, "y", 1, 0),
        _area("중앙홀", "room", "#f59e0b", 10, 13, 30, 18),
        _area("서쪽 복도", "corridor", CORRIDOR, 6, 13, 10, 36), _area("동쪽 복도", "corridor", CORRIDOR, 30, 13, 34, 36),
        _area("남쪽 복도", "corridor", CORRIDOR, 10, 33, 30, 36),
        _area("실험실", "room", "#14b8a6", 10, 18, 20, 33), _area("서버실", "room", "#6366f1", 20, 18, 30, 33),
        _area("감옥", "jail", JAIL, 30, 9, 34, 13),
        _area("휴게실", "room", "#fb7185", 34, 20, 38, 30, group="rest"), _area("휴게실", "room", "#fb7185", 34, 30, 40, 36, group="rest"),
        _stairs(14, 36, 16, 38, "y", 0, -1), _stairs(24, 36, 26, 38, "y", 0, -1),
        _area("지하 저장고", "room", "#a16207", 12, 38, 28, 44, h=-1),
    ]
    doors = [("h", 9, 14, 16), ("h", 13, 14, 16), ("h", 9, 24, 26), ("h", 13, 24, 26),
             ("v", 10, 14, 17), ("v", 30, 14, 17),
             ("h", 18, 14, 16), ("v", 10, 25, 27), ("h", 33, 13, 15), ("v", 20, 22, 24),
             ("h", 18, 25, 27), ("v", 30, 27, 29), ("h", 33, 26, 28),
             ("v", 10, 33, 36), ("v", 30, 33, 36), ("v", 34, 22, 24), ("v", 34, 32, 34),
             ("h", 36, 14, 16), ("h", 38, 14, 16), ("h", 36, 24, 26), ("h", 38, 24, 26)]
    wide = "bookcaseClosedWide"
    props = (
        # 헬기장
        _row("cardboardBoxClosed", 1, [15, 16, 24]) + _row("cardboardBoxClosed", 2, [24]) + [("speaker", 25, 7, 3, 1, 1), ("speaker", 14, 7, 1, 1, 1)]
        # 중앙홀
        + [("pottedPlant", 10, 13, 0, 1, 1), ("pottedPlant", 29, 13, 0, 1, 1), ("bench", 20, 17, 2, 1, 1), ("lampSquareFloor", 12, 17, 0, 1, 1)]
        # 실험실: 실험대 줄
        + [("tableCross", x, y, 0, 2, 1) for y in (21, 25, 29) for x in (12, 16)]
        + [s for y in (22, 26, 30) for s in _row("stoolBar", y, [12, 13, 16, 17])] + [("bookcaseClosed", 19, 32, 2, 1, 1)]
        # 서버실: 높은 서버 선반(시선을 가린다)
        + [(wide, x, y, 0, 2, 1) for y in (21, 24, 27, 30) for x in (22, 26)]
        # 복도: 쓰러진 상자 더미
        + _row("cardboardBoxClosed", 20, [6, 7]) + _row("cardboardBoxOpen", 29, [8]) + [("pottedPlant", 33, 19, 0, 1, 1), ("trashcan", 31, 25, 0, 1, 1)]
        + [("trashcan", 20, 35, 0, 1, 1), ("pottedPlant", 11, 35, 0, 1, 1)]
        # 휴게실 (ㄱ자)
        + [("loungeSofa", 37, 25, 3, 1, 2), ("tableCoffee", 35, 25, 1, 1, 2), ("kitchenFridge", 39, 35, 2, 1, 1), ("loungeChair", 38, 31, 2, 1, 1)]
        # 지하 저장고: 상자 미로
        + _row("cardboardBoxClosed", 40, [14, 15, 19, 20, 24, 25]) + _row("cardboardBoxOpen", 42, [16, 17, 22, 23]) + [("bookcaseClosed", 12, 43, 2, 1, 1)]
    )
    decor = [("rugRound", 19, 3, 0), ("rugRectangle", 35, 32, 0)]
    return GameMap("lab", "연구소", "위층 헬기장, 고리처럼 이어진 복도, 계단으로 내려가는 지하 저장고", areas, doors, props, decor,
                   lobby=[(13.5 + 2 * i, 15.5) for i in range(8)],
                   cops=[(18.5, 5.0), (21.5, 5.0), (18.5, 7.0), (21.5, 7.0)],
                   thieves=[(18.8, 19.5), (28.5, 19.5), (8.0, 25.0), (32.0, 31.0), (21.5, 34.5), (12.5, 42.5), (36.0, 22.0), (27.0, 41.5)],
                   pad=(32.0, 14.7))


# ── 학교 (46×30): 앞·뒤 복도와 옆 통로가 교실을 빙 두르고, 무대가 있는 강당, 계단 아래 지하 매점 ─────────
def _school():
    areas = [
        _area("복도", "corridor", CORRIDOR, 0, 13, 46, 17), _area("서쪽 통로", "corridor", CORRIDOR, 0, 3, 2, 13),
        _area("뒷복도", "corridor", CORRIDOR, 0, 0, 23, 3),
        _area("1반", "room", "#fb923c", 2, 3, 12, 13), _area("2반", "room", "#fbbf24", 12, 3, 23, 13),
        _area("감옥", "jail", JAIL, 25, 1, 29, 5), _area("교무실", "room", "#64748b", 25, 5, 34, 13),
        _area("강당", "room", "#22c55e", 34, 5, 46, 13, group="hall"), _area("강당", "room", "#22c55e", 34, 3, 40, 5, group="hall"),
        _area("강당", "room", "#22c55e", 42, 3, 46, 5, group="hall"),
        _area("무대", "room", "#15803d", 36, 0, 46, 3, h=1), _stairs(40, 3, 42, 5, "y", 1, 0),
        _area("3반", "room", "#f472b6", 1, 17, 12, 27), _area("화장실", "room", "#38bdf8", 12, 17, 18, 22),
        _stairs(18, 17, 20, 23, "y", 0, -1), _stairs(12, 24, 14, 26, "x", 0, -1),
        _area("지하 매점", "room", "#eab308", 14, 23, 26, 30, h=-1),
        _area("과학실", "room", "#14b8a6", 26, 17, 38, 28), _area("창고", "room", "#a16207", 38, 17, 46, 24),
    ]
    doors = [("h", 3, 0, 2), ("h", 13, 0, 2), ("h", 3, 5, 7), ("h", 3, 17, 19), ("v", 12, 7, 9), ("v", 2, 9, 11),
             ("h", 13, 6, 8), ("h", 13, 18, 20), ("h", 13, 28, 30), ("v", 34, 9, 11), ("h", 13, 38, 41),
             ("h", 3, 40, 42), ("h", 5, 40, 42),
             ("h", 17, 6, 8), ("h", 17, 14, 16), ("h", 17, 18, 20), ("h", 23, 18, 20), ("v", 12, 24, 26), ("v", 14, 24, 26),
             ("h", 17, 31, 33), ("v", 38, 20, 22), ("h", 17, 41, 43)]
    props = (
        _classroom(2, 3, (8, 3)) + _classroom(12, 3, (14, 3)) + _classroom(1, 17, (5, 26))
        # 교무실
        + _desk(26, 9) + _desk(30, 9) + [("bookcaseClosed", 32, 6, 2, 1, 1), ("bookcaseClosed", 33, 6, 2, 1, 1)]
        # 강당: 무대와 객석
        + [("speaker", 36, 0, 0, 1, 1), ("speaker", 45, 0, 0, 1, 1)]
        + _row("benchCushion", 8, [36, 37, 39, 40, 42, 43], 2) + _row("benchCushion", 10, [36, 37, 39, 40, 42, 43], 2)
        # 복도·뒷복도
        + [("kitchenFridge", 22, 13, 2, 1, 1), ("trashcan", 11, 16, 0, 1, 1), ("lampSquareFloor", 35, 16, 0, 1, 1), ("pottedPlant", 45, 13, 0, 1, 1),
           ("pottedPlant", 22, 0, 0, 1, 1), ("cardboardBoxOpen", 10, 1, 0, 1, 1)]
        # 화장실
        + [("kitchenSink", 13, 21, 2, 1, 1), ("kitchenSink", 15, 21, 2, 1, 1), ("trashcan", 17, 18, 0, 1, 1)]
        # 지하 매점
        + _row("kitchenBar", 29, [16, 17, 18], 2) + [("kitchenFridge", 19, 29, 2, 1, 1), ("tableRound", 21, 25, 0, 2, 2), ("tableRound", 23, 27, 0, 2, 2),
                                                    ("chair", 20, 25, 1, 1, 1), ("chair", 25, 28, 3, 1, 1)]
        # 과학실
        + [("tableCross", 28, 20, 0, 2, 1), ("tableCross", 32, 20, 0, 2, 1), ("tableCross", 28, 24, 0, 2, 1), ("tableCross", 32, 24, 0, 2, 1)]
        + _row("stoolBar", 21, [28, 29, 32, 33]) + _row("stoolBar", 25, [28, 29, 32, 33])
        + [("kitchenCabinet", 27, 27, 2, 1, 1), ("kitchenCabinet", 28, 27, 2, 1, 1), ("bookcaseClosed", 36, 27, 2, 1, 1), ("bookcaseClosed", 37, 27, 2, 1, 1)]
        # 창고
        + _row("cardboardBoxClosed", 18, [44]) + _row("cardboardBoxClosed", 19, [44]) + _row("cardboardBoxOpen", 22, [40, 41])
        + [("bookcaseClosedWide", 42, 20, 0, 2, 1)]
    )
    decor = [("rugRectangle", 16, 24, 0)]
    return GameMap("school", "학교", "교실을 빙 두르는 앞·뒤 복도, 무대가 있는 강당, 계단 아래 지하 매점", areas, doors, props, decor,
                   lobby=[(16.5 + i, 15.0) for i in range(8)],
                   cops=[(30.5, 15.0), (32.5, 15.0), (34.5, 15.0), (36.5, 15.0)],
                   thieves=[(4.0, 11.5), (21.5, 11.0), (44.5, 11.5), (40.0, 1.5), (3.5, 25.0), (16.0, 26.5), (35.0, 26.0), (44.5, 21.0)],
                   pad=(27.0, 6.4))


# ── 기숙사 (30×40): 세로 복도 양쪽의 방들(옆방끼리도 이어진다), 계단 두 개로 내려가는 지하 휴게실 ─────────
def _dorm():
    areas = [
        _area("복도", "corridor", CORRIDOR, 12, 0, 16, 40),
        _area("101호", "room", "#fb7185", 2, 0, 12, 8), _area("102호", "room", "#f472b6", 0, 8, 12, 16),
        _area("지하 휴게실", "room", "#14b8a6", 3, 16, 9, 19, h=-1, group="lounge"), _area("지하 휴게실", "room", "#14b8a6", 0, 19, 9, 26, h=-1, group="lounge"),
        _stairs(9, 18, 12, 22, "x", -1, 0), _stairs(1, 16, 3, 19, "y", 0, -1),
        _area("103호", "room", "#fb7185", 4, 26, 12, 33), _area("104호", "room", "#f472b6", 2, 33, 12, 40),
        _area("사감실", "room", "#64748b", 16, 0, 26, 8), _area("감옥", "jail", JAIL, 26, 0, 30, 4),
        _area("201호", "room", "#a78bfa", 16, 8, 26, 16), _area("세탁실", "room", "#38bdf8", 16, 16, 24, 22),
        _area("202호", "room", "#c084fc", 16, 22, 28, 31), _area("203호", "room", "#a78bfa", 16, 31, 26, 40),
    ]
    doors = [("v", 12, 3, 5), ("v", 12, 11, 13), ("v", 12, 18, 22), ("v", 9, 18, 22), ("v", 12, 28, 30), ("v", 12, 36, 38),
             ("v", 16, 5, 7), ("v", 16, 11, 13), ("v", 16, 18, 20), ("v", 16, 25, 27), ("v", 16, 35, 37),
             ("h", 8, 3, 5), ("h", 16, 1, 3), ("h", 19, 1, 3), ("h", 33, 9, 11),
             ("h", 8, 23, 25), ("h", 16, 17, 19), ("h", 22, 21, 23), ("h", 31, 24, 26)]

    def room(x0, y0, x1, left):
        """침대 두 개는 바깥 벽, 책상은 복도 쪽."""
        outer, side = (x0, x0 + 1) if left else (x1 - 1, x1 - 2)
        desk_x = x1 - 4 if left else x0 + 2
        return [("bedSingle", outer, y0 + 1, 0, 1, 2), ("bedBunk", outer, y0 + 4, 0, 1, 2), ("cabinetBedDrawer", side, y0 + 1, 0, 1, 1)] + _desk(desk_x, y0 + 1)

    props = (
        room(2, 0, 12, True) + [("bedSingle", 0, 12, 0, 1, 2), ("cabinetBedDrawer", 4, 9, 0, 1, 1)] + _desk(8, 9)
        + room(4, 26, 12, True) + room(2, 33, 12, True)
        + room(16, 8, 26, False) + room(16, 22, 28, False) + room(16, 31, 26, False)
        # 사감실
        + _desk(17, 1) + [("bookcaseClosed", 20, 0, 0, 1, 1), ("bookcaseClosed", 21, 0, 0, 1, 1), ("coatRackStanding", 17, 6, 0, 1, 1), ("pottedPlant", 25, 7, 0, 1, 1)]
        # 지하 휴게실
        + [("loungeSofa", 1, 20, 0, 2, 1), ("tableCoffee", 1, 22, 0, 2, 1), ("cabinetTelevision", 1, 24, 2, 2, 1),
           ("loungeChair", 5, 21, 1, 1, 1), ("loungeChair", 5, 23, 1, 1, 1), ("tableRound", 5, 16, 0, 2, 2), ("pottedPlant", 8, 25, 0, 1, 1)]
        # 세탁실
        + [("washer", 23, 17, 3, 1, 1), ("washer", 23, 18, 3, 1, 1), ("washer", 23, 19, 3, 1, 1), ("dryer", 23, 20, 3, 1, 1),
           ("washerDryerStacked", 20, 17, 0, 1, 1), ("table", 18, 20, 0, 2, 1)]
        # 복도
        + [("pottedPlant", 15, 0, 0, 1, 1), ("pottedPlant", 12, 39, 0, 1, 1), ("lampSquareFloor", 12, 15, 0, 1, 1),
           ("lampSquareFloor", 15, 24, 0, 1, 1), ("trashcan", 15, 31, 0, 1, 1), ("bench", 15, 9, 1, 1, 1)]
    )
    decor = [("rugRectangle", 1, 21, 0), ("rugSquare", 6, 3, 0), ("rugSquare", 20, 26, 0)]
    return GameMap("dorm", "기숙사", "세로 복도 양쪽의 방들, 계단 두 개로 내려가는 지하 휴게실", areas, doors, props, decor,
                   lobby=[(14.0, 9.5 + i) for i in range(8)],
                   cops=[(13.2, 20.0), (14.8, 20.0), (13.2, 22.0), (14.8, 22.0)],
                   thieves=[(6.0, 5.5), (5.5, 13.5), (7.0, 24.5), (9.5, 31.0), (6.0, 38.5), (21.5, 13.5), (21.5, 28.5), (21.5, 38.0)],
                   pad=(24.6, 2.0))


# ── 대기실 (18×18, 정사각형 고정): 게임 전후에 모이는 곳. 맵은 여기서 방장이 고른다. ─────────────
def _lobby():
    areas = [_area("대기실", "room", "#818cf8", 0, 0, 18, 18)]
    props = [
        ("loungeSofa", 1, 1, 0, 2, 1), ("loungeSofa", 15, 1, 0, 2, 1), ("tableCoffee", 1, 3, 0, 2, 1), ("tableCoffee", 15, 3, 0, 2, 1),
        ("kitchenFridge", 8, 0, 0, 1, 1), ("kitchenFridge", 9, 0, 0, 1, 1), ("pottedPlant", 0, 17, 0, 1, 1), ("pottedPlant", 17, 17, 0, 1, 1),
        ("pottedPlant", 0, 8, 0, 1, 1), ("pottedPlant", 17, 8, 0, 1, 1), ("bench", 4, 16, 2, 1, 1), ("bench", 13, 16, 2, 1, 1),
        ("lampSquareFloor", 5, 5, 0, 1, 1), ("lampSquareFloor", 12, 5, 0, 1, 1), ("lampSquareFloor", 5, 12, 0, 1, 1), ("lampSquareFloor", 12, 12, 0, 1, 1),
    ]
    ring = [(9.0 + 3.2 * math.cos(k * math.pi / 4), 9.0 + 3.2 * math.sin(k * math.pi / 4)) for k in range(8)]
    return GameMap("lobby", "대기실", "게임 전에 모이는 곳", areas, [], props, [("rugRound", 8, 8, 0)],
                   lobby=[(round(x, 2), round(y, 2)) for x, y in ring], cops=[(9.0, 9.0)], thieves=[(9.0, 9.0)], pad=None)


MAPS = {m.key: m for m in (_lab(), _school(), _dorm())}      # 게임 맵 (방장이 고른다)
LOBBY = _lobby()
ALL_MAPS = {**MAPS, LOBBY.key: LOBBY}
DEFAULT_MAP = "lab"
