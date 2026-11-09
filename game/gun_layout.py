"""총게임의 맵 배치: 두 팀의 기지(시작 구역), A·B 사이트, 대기실의 팀 자리.

맵(untitled_maps)은 경찰과 도둑과 같은 것을 쓰고, 여기서는 영역 번호로 어디가 기지이고 사이트인지만 정한다.
- 기지 둘(bases): 구매 시간에는 자기 기지 안에서만 움직일 수 있다. 기지에서 나가는 길(문·계단 입구)은 구매 시간 동안 잠긴다(gates).
  첫 SWAP_EVERY라운드는 레드가 첫째 기지, 이후에는 서로 바꾼다.
- 사이트 둘(sites): 두 기지 사이의 방들. 바닥에 A·B로 표시하고, 위치 안내에 쓴다.
- 대기실(LOBBY)에는 왼쪽 레드 자리와 오른쪽 블루 자리가 있고, 그 자리에 서면 그 팀이 된다.
"""
import math

from .untitled_maps import LOBBY, MAPS, RADIUS, STEP

# 영역 번호는 untitled_maps의 areas 순서 (맵을 고치면 여기도 맞춘다)
# 기지와 사이트는 봇끼리 수십 판 돌려 한쪽 기지만 이기지 않는 쪽으로 골랐다 (첫째 기지 승률: 연구소 약 63%, 학교 약 52%, 기숙사 약 45%).
# 문이 좁은 구석 방(학교 창고 등)은 지키기 쉬워 기지로 쓰면 크게 기운다.
LAYOUT_AREAS = {
    "lab": {"bases": ([0], [14]), "sites": {"A": [7], "B": [8]}},                    # 헬기장 ↔ 지하 저장고, 실험실 / 서버실
    "school": {"bases": ([7, 8, 9], [12]), "sites": {"A": [6], "B": [16]}},          # 강당 ↔ 3반, 교무실 / 지하 매점
    "dorm": {"bases": ([1], [13]), "sites": {"A": [3, 4], "B": [11]}},               # 101호 ↔ 202호, 지하 휴게실 / 201호
}
LOBBY_PADS = {"red": (1.0, 5.0, 7.0, 13.0), "blue": (11.0, 5.0, 17.0, 13.0)}         # x0, y0, x1, y1 (대기실은 18×18)
SPAWNS_PER_BASE = 8


def inside(m, areas, x, y, margin=RADIUS):
    """(x, y)의 몸(반지름 margin)이 areas(영역 번호들) 안에 있는가: 가운데와 사방 끝이 모두 안이어야 한다."""
    return all(m.area_at(x + dx, y + dy) in areas for dx, dy in ((0, 0), (margin, 0), (-margin, 0), (0, margin), (0, -margin)))


def _gates(m, areas):
    """areas 밖으로 이어지는 열린 변(벽도 울타리도 없는 곳)을 이어 붙여 [(방향, 고정 좌표, 시작, 끝)]으로."""
    walls, fences = set(m.wall_edges), set(m.fence_edges)
    units = set()
    for i in range(m.w):
        for j in range(m.h):
            if m.cell[i][j] not in areas:
                continue
            for edge, (ni, nj) in ((("v", i, j), (i - 1, j)), (("v", i + 1, j), (i + 1, j)), (("h", j, i), (i, j - 1)), (("h", j + 1, i), (i, j + 1))):
                other = m.cell[ni][nj] if 0 <= ni < m.w and 0 <= nj < m.h else -1
                if other < 0 or other in areas or edge in walls or edge in fences:
                    continue
                units.add(edge)
    out = []
    for o, f, t in sorted(units):
        if out and out[-1][0] == o and out[-1][1] == f and out[-1][3] == t:
            out[-1] = (o, f, out[-1][2], t + 1)
        else:
            out.append((o, f, t, t + 1))
    return out


def _spots(m, areas, count, spacing=1.8):
    """areas 안에서 서로 떨어진, 트인 자리 count개."""
    cands = []
    for i in range(m.gx):
        for j in range(m.gy):
            x, y = (i + 0.5) * STEP, (j + 0.5) * STEP
            if m.walk[i][j] and inside(m, areas, x, y):
                cands.append((m.open[i][j], x, y))
    cands.sort(key=lambda c: (-c[0], c[1], c[2]))
    picked = []
    for gap in (spacing, 1.2, 0.8):
        for _, x, y in cands:
            if len(picked) >= count:
                break
            if all(math.hypot(x - px, y - py) >= gap for px, py in picked):
                picked.append((x, y))
    return [(round(x, 2), round(y, 2)) for x, y in picked]


def _rects(m, areas):
    """영역마다의 [x0, y0, x1, y1] (여러 영역으로 된 곳은 빈 땅까지 덮지 않도록 따로 그린다)."""
    return [[m.areas[k]["x0"], m.areas[k]["y0"], m.areas[k]["x1"], m.areas[k]["y1"]] for k in areas]


def _rect(m, areas):
    xs0 = [m.areas[k]["x0"] for k in areas]
    ys0 = [m.areas[k]["y0"] for k in areas]
    xs1 = [m.areas[k]["x1"] for k in areas]
    ys1 = [m.areas[k]["y1"] for k in areas]
    return [min(xs0), min(ys0), max(xs1), max(ys1)]


class Layout:
    """한 맵의 기지·사이트. bases[0], bases[1]: {"areas", "gates", "spawns", "rect"}, sites: {"A": {...}, "B": {...}}."""

    def __init__(self, m, spec):
        self.map = m
        self.bases = []
        for areas in spec["bases"]:
            self.bases.append({"areas": list(areas), "gates": _gates(m, areas), "spawns": _spots(m, areas, SPAWNS_PER_BASE), "rect": _rect(m, areas), "rects": _rects(m, areas)})
        self.sites = {sid: {"id": sid, "areas": list(areas), "rect": _rect(m, areas), "rects": _rects(m, areas), "name": m.areas[areas[0]]["name"]} for sid, areas in spec["sites"].items()}

    def view(self):
        return {"bases": [{"areas": b["areas"], "gates": [list(g) for g in b["gates"]], "rect": b["rect"], "rects": b["rects"]} for b in self.bases],
                "sites": list(self.sites.values())}


LAYOUTS = {key: Layout(MAPS[key], spec) for key, spec in LAYOUT_AREAS.items()}


def lobby_spots(team, count=SPAWNS_PER_BASE):
    """대기실에서 team 자리 안의 트인 자리들."""
    x0, y0, x1, y1 = LOBBY_PADS[team]
    spots = []
    for _ in range(3):
        for j in range(int(y0 * 2) + 1, int(y1 * 2), 2):
            for i in range(int(x0 * 2) + 1, int(x1 * 2), 2):
                x, y = i / 2, j / 2
                if LOBBY.free_at(x, y) and all(math.hypot(x - px, y - py) >= 1.2 for px, py in spots):
                    spots.append((x, y))
    spots.sort(key=lambda s: (abs(s[1] - 9.0), s[0]))                  # 대기실 가운데 높이에 가까운 자리부터
    return spots[:count]


LOBBY_SPOTS = {team: lobby_spots(team) for team in LOBBY_PADS}


def lobby_pref(x, y):
    """대기실의 (x, y)가 어느 팀 자리인지 ("red"/"blue", 어느 쪽도 아니면 None)."""
    for team, (x0, y0, x1, y1) in LOBBY_PADS.items():
        if x0 <= x <= x1 and y0 <= y <= y1:
            return team
    return None


LOBBY_NEUTRAL = [(round(9.0 + 1.7 * math.cos(k * math.pi / 4), 2), round(9.0 + 1.7 * math.sin(k * math.pi / 4), 2)) for k in range(8)]    # 어느 팀 자리도 아닌 가운데
