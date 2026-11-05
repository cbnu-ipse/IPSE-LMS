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
도둑 봇은 가까운 경찰에게서 달아나다가 동료가 갇히면 구출 발판으로 간다. 벽이 가로막으면 반 칸 격자에서 길을 찾아 돌아간다.
"""
import math
from collections import deque
import random
import time

SIZE = 32
MAX_PLAYERS = 8
SPEED = {"lobby": 4.0, "cop": 4.3, "thief": 4.0}     # 칸/초
RADIUS = 0.3                   # 캐릭터 몸통 반지름 (칸)
TOUCH = 2e-3                   # 맞닿음 허용 오차: 화면은 밀어낸 위치를 소수 셋째 자리로 반올림해 보내므로 그만큼 봐준다
SLACK = 1.6                    # 네트워크 지연을 봐주는 속도 여유 배수
CATCH = 0.75                   # 경찰과 도둑의 중심이 이보다 가까우면 잡힌다 (칸)
DASH_MULT, DASH_SECONDS, DASH_COOLDOWN = 1.8, 0.8, 5.0
COUNTDOWN, HEAD_START, ROUND_SECONDS, SAFE_SECONDS, RESULT_SECONDS = 3.0, 5.0, 180.0, 3.0, 8.0
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
MODELS = ["character-male-a", "character-female-a", "character-male-b", "character-female-b", "character-male-c", "character-female-c",
          "character-male-d", "character-female-d", "character-male-e", "character-female-e", "character-male-f", "character-female-f"]

# 감옥: 오른쪽 위 구석 [JAIL_X, SIZE] × [0, JAIL_Y]. 울타리(충돌 모양)로 막혀 있다. 구출 발판은 울타리 바깥 모서리 앞.
JAIL_X, JAIL_Y = 28, 4
PAD = {"cx": 26.9, "cy": 5.1, "r": 0.8}
JAIL_SPOTS = [(JAIL_X + 1.0 + (i % 3) * 1.0, 1.0 + (i // 3) * 1.2) for i in range(9)]

# 구역: 바닥 무늬가 다르고(화면), 사이사이 문이 뚫린 낮은 벽으로 나뉜다. 가운데 십자 띠는 열린 광장·복도.
ZONES = [
    {"kind": "library", "name": "도서관", "x0": 0, "y0": 0, "x1": 12, "y1": 12},
    {"kind": "cafe", "name": "카페", "x0": 20, "y0": 0, "x1": 32, "y1": 12},
    {"kind": "lounge", "name": "라운지", "x0": 0, "y0": 20, "x1": 12, "y1": 32},
    {"kind": "warehouse", "name": "창고", "x0": 20, "y0": 20, "x1": 32, "y1": 32},
]
# 벽: (방향, 고정 좌표, 시작, 끝, 문 구간들). "v"는 x=고정 좌표인 세로 벽(y 시작~끝), "h"는 y=고정 좌표인 가로 벽(x 시작~끝).
WALL_LINES = [
    ("v", 12, 0, 12, [(5, 7)]), ("h", 12, 0, 12, [(5, 7)]),
    ("v", 20, 0, 12, [(7, 9)]), ("h", 12, 20, 32, [(24, 26)]),
    ("v", 12, 20, 32, [(25, 27)]), ("h", 20, 0, 12, [(2, 4), (8, 10)]),
    ("v", 20, 20, 32, [(25, 27)]), ("h", 20, 20, 32, [(25, 27)]),
]
WALL_T = 0.12                   # 벽 두께의 절반 (칸)


def wall_pieces():
    """벽을 한 칸 길이 조각들로 (화면은 조각마다 Kenney 반쪽 벽을 그린다): [(방향, 고정 좌표, 시작)]."""
    out = []
    for o, fixed, a, b, gaps in WALL_LINES:
        for t in range(a, b):
            if not any(g0 <= t < g1 for g0, g1 in gaps):
                out.append((o, fixed, t))
    return out


def _bookrow(y, xs, model="bookcaseOpen"):
    return [(model, x, y, 0, 1, 1) for x in xs]


# 광장 소품: (모델, x, y, 돌림, 가로 칸, 세로 칸). 가로·세로는 광장 기준(돌린 뒤) 차지하는 칸 수이고, 소품은 그 칸들의 가운데에 놓인다.
PROPS = (
    # 도서관: 책장 줄 사이 통로, 열람 책상
    _bookrow(2, [1, 2, 3, 4, 7, 8, 9, 10]) + _bookrow(5, [1, 2, 3, 6, 7, 8, 9]) + _bookrow(8, [1, 2, 5, 6, 7, 8, 9, 10])
    + [("bookcaseClosedWide", 1, 11, 0, 2, 1), ("bookcaseClosedWide", 8, 11, 2, 2, 1), ("table", 4, 10, 0, 2, 1),
       ("chair", 4, 11, 2, 1, 1), ("chair", 5, 11, 2, 1, 1), ("lampRoundFloor", 11, 1, 0, 1, 1), ("pottedPlant", 11, 9, 0, 1, 1)]
    # 카페: 카운터와 스툴, 테이블 자리
    + [("kitchenFridge", 20, 0, 0, 1, 1), ("kitchenBar", 21, 0, 0, 1, 1), ("kitchenBar", 22, 0, 0, 1, 1), ("kitchenBar", 23, 0, 0, 1, 1),
       ("kitchenCabinet", 24, 0, 0, 1, 1), ("kitchenCabinet", 25, 0, 0, 1, 1),
       ("stoolBar", 21, 2, 2, 1, 1), ("stoolBar", 22, 2, 2, 1, 1), ("stoolBar", 23, 2, 2, 1, 1),
       ("tableRound", 21, 4, 0, 2, 2), ("chair", 23, 5, 3, 1, 1),
       ("tableRound", 22, 8, 0, 2, 2), ("chair", 24, 9, 3, 1, 1), ("chair", 22, 10, 2, 1, 1),
       ("tableCloth", 27, 8, 0, 2, 1), ("chair", 27, 9, 2, 1, 1), ("chair", 28, 9, 2, 1, 1), ("chair", 27, 7, 0, 1, 1), ("chair", 28, 7, 0, 1, 1),
       ("pottedPlant", 31, 11, 0, 1, 1), ("pottedPlant", 20, 11, 0, 1, 1), ("lampSquareFloor", 31, 6, 0, 1, 1)]
    # 라운지: 소파, TV장, 책상 자리
    + [("loungeSofa", 2, 23, 0, 2, 1), ("tableCoffee", 2, 25, 0, 2, 1), ("cabinetTelevision", 2, 27, 2, 2, 1),
       ("desk", 7, 23, 0, 2, 1), ("chairDesk", 7, 22, 0, 1, 1), ("desk", 7, 28, 0, 2, 1), ("chairDesk", 8, 27, 0, 1, 1),
       ("loungeChair", 10, 22, 3, 1, 1), ("loungeChair", 10, 30, 3, 1, 1), ("sideTable", 5, 30, 0, 1, 1),
       ("coatRackStanding", 11, 23, 0, 1, 1), ("pottedPlant", 1, 21, 0, 1, 1), ("pottedPlant", 11, 31, 0, 1, 1), ("lampSquareFloor", 0, 30, 0, 1, 1)]
    # 창고: 상자 미로와 세탁기
    + [("cardboardBoxClosed", x, 22, 0, 1, 1) for x in (22, 23, 24, 28, 29, 30)]
    + [("cardboardBoxOpen", x, 24, 0, 1, 1) for x in (21, 26, 27, 31)]
    + [("cardboardBoxClosed", x, 27, 0, 1, 1) for x in (22, 23, 28, 29, 30)]
    + [("cardboardBoxOpen", x, 29, 0, 1, 1) for x in (24, 25, 26, 30)]
    + [("bookcaseClosed", 21, 31, 0, 1, 1), ("bookcaseClosed", 22, 31, 0, 1, 1), ("washer", 31, 31, 0, 1, 1), ("washer", 30, 31, 0, 1, 1)]
    # 가운데 광장과 복도
    + [("tableRound", 15, 15, 0, 2, 2), ("benchCushion", 14, 15, 1, 1, 1), ("benchCushion", 17, 16, 3, 1, 1),
       ("lampSquareFloor", 13, 13, 0, 1, 1), ("lampSquareFloor", 18, 13, 0, 1, 1), ("lampSquareFloor", 13, 18, 0, 1, 1), ("lampSquareFloor", 18, 18, 0, 1, 1),
       ("pottedPlant", 14, 4, 0, 1, 1), ("pottedPlant", 17, 8, 0, 1, 1), ("bench", 15, 1, 0, 1, 1), ("lampRoundFloor", 16, 6, 0, 1, 1),
       ("pottedPlant", 14, 24, 0, 1, 1), ("pottedPlant", 17, 28, 0, 1, 1), ("bench", 15, 30, 2, 1, 1), ("lampRoundFloor", 16, 22, 0, 1, 1),
       ("pottedPlant", 3, 14, 0, 1, 1), ("pottedPlant", 8, 17, 0, 1, 1), ("bench", 5, 13, 0, 1, 1), ("trashcan", 1, 18, 0, 1, 1),
       ("pottedPlant", 24, 14, 0, 1, 1), ("pottedPlant", 29, 17, 0, 1, 1), ("speaker", 31, 13, 3, 1, 1), ("bench", 27, 13, 0, 1, 1)]
)
DECOR = [("rugRound", 15, 15, 0), ("rugRectangle", 2, 29, 0), ("rugSquare", 21, 8, 0)]       # 밟고 지나갈 수 있는 것
LOBBY_SPAWNS = [(12.5 + i, 19.5) for i in range(8)]
COP_SPAWNS = [(15.0, 13.6), (16.8, 13.6), (14.4, 18.2), (17.6, 18.2)]
THIEF_SPAWNS = [(5.5, 6.5), (5.5, 29.5), (25.5, 30.5), (25.5, 10.6), (15.5, 3.5), (3.5, 16.5), (28.5, 16.5), (15.5, 27.5)]

# Kenney Furniture Kit 모델의 바닥 크기 (모델 단위, 돌리기 전 가로 x · 세로 z). 한 칸 = 5 모델 단위.
CELL_UNITS = 5.0
MODEL_SIZE = {
    "table": (8.4, 4.5), "tableCloth": (8.4, 4.5), "chair": (2.0, 2.0), "stoolBar": (2.7, 2.3), "desk": (7.3, 3.9), "chairDesk": (3.3, 3.1),
    "bookcaseClosed": (4.0, 2.5), "bookcaseClosedWide": (8.0, 2.5), "cardboardBoxOpen": (3.7, 2.1), "kitchenBar": (4.3, 2.1),
    "kitchenCabinet": (4.3, 4.5), "kitchenFridge": (4.3, 2.9), "cabinetTelevision": (8.0, 2.5), "washer": (3.9, 3.9),
    "coatRackStanding": (2.7, 2.7), "sideTable": (5.3, 2.2), "bench": (4.0, 2.0), "tableCoffeeGlass": (6.6, 4.0),
    "tableRound": (6.9, 8.0), "benchCushion": (4.0, 2.0), "pottedPlant": (2.1, 2.4), "lampSquareFloor": (1.2, 1.2),
    "lampRoundFloor": (1.5, 1.8), "loungeSofa": (9.8, 4.1), "tableCoffee": (6.6, 4.0), "bookcaseOpen": (4.0, 2.5),
    "loungeChair": (4.9, 4.1), "radio": (3.1, 1.0), "speaker": (1.5, 1.5), "trashcan": (2.1, 2.3), "cardboardBoxClosed": (2.1, 2.1),
}
ROUND = {"tableRound", "pottedPlant", "lampSquareFloor", "lampRoundFloor", "trashcan", "stoolBar", "coatRackStanding"}    # 위에서 보면 둥근 것
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
    for o, fixed, a, b, gaps in WALL_LINES:                  # 벽: 문 구간을 뺀 이어진 토막마다 얇은 사각형
        cuts = [a] + [g for gap in gaps for g in gap] + [b]
        for t0, t1 in zip(cuts[::2], cuts[1::2]):
            if t1 <= t0:
                continue
            mid, half = (t0 + t1) / 2, (t1 - t0) / 2 + WALL_T
            if o == "v":
                out.append({"kind": "box", "cx": fixed, "cy": mid, "hx": WALL_T, "hy": half, "model": "wall"})
            else:
                out.append({"kind": "box", "cx": mid, "cy": fixed, "hx": half, "hy": WALL_T, "model": "wall"})
    out.append({"kind": "box", "cx": JAIL_X, "cy": JAIL_Y / 2, "hx": FENCE_T, "hy": JAIL_Y / 2 + FENCE_T, "model": "fence"})
    out.append({"kind": "box", "cx": (JAIL_X + SIZE) / 2, "cy": JAIL_Y, "hx": (SIZE - JAIL_X) / 2 + FENCE_T, "hy": FENCE_T, "model": "fence"})
    return out


SHAPES = shapes()


def _bucket_shapes():
    """칸마다 그 칸 안의 어떤 점에서든 닿을 수 있는 충돌 모양만 모아 둔다 (밀어내기·빈자리 검사를 빠르게)."""
    reach = RADIUS + 0.8                       # 한 번 밀린 뒤 옆 칸으로 넘어가도 놓치지 않을 만큼 넉넉히
    out = [[[] for _ in range(SIZE)] for _ in range(SIZE)]
    for s in SHAPES:
        ext_x = s["r"] if s["kind"] == "circle" else s["hx"]
        ext_y = s["r"] if s["kind"] == "circle" else s["hy"]
        for i in range(max(0, int(s["cx"] - ext_x - reach)), min(SIZE, int(s["cx"] + ext_x + reach) + 1)):
            for j in range(max(0, int(s["cy"] - ext_y - reach)), min(SIZE, int(s["cy"] + ext_y + reach) + 1)):
                out[i][j].append(s)
    return out


_BUCKETS = _bucket_shapes()
WALLS = [s for s in SHAPES if s["model"] in ("wall", "fence")]


def near_shapes(x, y):
    i, j = min(SIZE - 1, max(0, int(x))), min(SIZE - 1, max(0, int(y)))
    return _BUCKETS[i][j]


def world_view():
    """화면에 보낼 광장 정보."""
    return {"size": SIZE, "speed": SPEED, "radius": RADIUS, "shapes": SHAPES, "catch": CATCH,
            "dash": {"mult": DASH_MULT, "seconds": DASH_SECONDS, "cooldown": DASH_COOLDOWN},
            "jail": {"x": JAIL_X, "y": JAIL_Y}, "pad": PAD, "zones": ZONES,
            "walls": [{"o": o, "f": f, "t": t} for o, f, t in wall_pieces()],
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
    return all(gap(s, x, y) >= RADIUS - TOUCH for s in near_shapes(x, y))


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


def crosses_wall(x0, y0, x1, y1):
    """두 위치 사이에서 벽·울타리를 뚫고 지나갔는지. 끝점만 보면 얇은 벽을 한 번에 건너뛸 수 있어서 따로 본다."""
    return any(_seg_hits_box(x0, y0, x1, y1, s) for s in WALLS)


def in_jail(x, y):
    return x > JAIL_X and y < JAIL_Y


def push_out(x, y, others=()):
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
        for s in near_shapes(x, y):
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
        x = min(max(x, RADIUS), SIZE - RADIUS)
        y = min(max(y, RADIUS), SIZE - RADIUS)
        if not moved:
            break
    return x, y


# ── 봇 길찾기: 반 칸 격자 위 너비 우선 탐색 ────────────────────────
STEP = 0.5
BOT_COP_HANDICAP = 0.92         # 혼자 연습할 때 경찰 봇이 너무 세지 않게 (사람 속도는 그대로)
BOT_REACTION = 0.35            # 경찰 봇이 도둑 위치를 다시 보는 간격 (초)
GRID_N = int(SIZE / STEP)
_WALK = None


def walkable():
    """반 칸 격자 마디마다 캐릭터가 설 수 있는지 (감옥 안은 못 가는 곳으로 친다). 한 번만 계산한다."""
    global _WALK
    if _WALK is None:
        _WALK = [[free_at((i + 0.5) * STEP, (j + 0.5) * STEP) and not in_jail((i + 0.5) * STEP, (j + 0.5) * STEP)
                  for j in range(GRID_N)] for i in range(GRID_N)]
    return _WALK


_OPEN = None


def openness():
    """마디마다 둘레 7×7 마디 중 설 수 있는 곳의 수 (구석·막다른 곳일수록 작다). 한 번만 계산한다."""
    global _OPEN
    if _OPEN is None:
        w = walkable()
        _OPEN = [[sum(w[a][b] for a in range(max(0, i - 3), min(GRID_N, i + 4)) for b in range(max(0, j - 3), min(GRID_N, j + 4)))
                  for j in range(GRID_N)] for i in range(GRID_N)]
    return _OPEN


def _node(x, y):
    return min(GRID_N - 1, max(0, int(x / STEP))), min(GRID_N - 1, max(0, int(y / STEP)))


def clear_line(x0, y0, x1, y1):
    """두 점 사이를 격자 위에서 막힘 없이 곧게 갈 수 있는지."""
    w = walkable()
    n = max(1, math.ceil(math.hypot(x1 - x0, y1 - y0) / (STEP * 0.4)))
    for k in range(n + 1):
        i, j = _node(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n)
        if not w[i][j]:
            return False
    return True


def find_path(x0, y0, x1, y1):
    """(x0, y0)에서 (x1, y1)까지 거쳐 갈 점들. 목표 마디가 막혀 있으면 가장 가까운 열린 마디로 간다. 못 가면 []."""
    w = walkable()
    start, goal = _node(x0, y0), _node(x1, y1)
    if not w[goal[0]][goal[1]]:
        cands = [(i, j) for i in range(max(0, goal[0] - 3), min(GRID_N, goal[0] + 4))
                 for j in range(max(0, goal[1] - 3), min(GRID_N, goal[1] + 4)) if w[i][j]]
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
            if not (0 <= ni < GRID_N and 0 <= nj < GRID_N) or (ni, nj) in prev or not w[ni][nj]:
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
    if out:
        out[-1] = (x1, y1) if free_at(x1, y1) else out[-1]
    return out


def grid_dist(sources, limit=None):
    """여러 출발점에서 격자를 따라 잰 거리(칸) 지도 {마디: 거리}. limit을 넘는 곳은 넣지 않는다."""
    w = walkable()
    dist, queue = {}, deque()
    for x, y in sources:
        n = _node(x, y)
        if n not in dist:
            dist[n] = 0.0
            queue.append(n)
    while queue:
        cur = queue.popleft()
        i, j = cur
        base = dist[cur]
        for di, dj, c in ((1, 0, STEP), (-1, 0, STEP), (0, 1, STEP), (0, -1, STEP)):
            ni, nj = i + di, j + dj
            if 0 <= ni < GRID_N and 0 <= nj < GRID_N and w[ni][nj] and (ni, nj) not in dist and (limit is None or base + c <= limit):
                dist[(ni, nj)] = base + c
                queue.append((ni, nj))
    return dist


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
        self.path, self.path_goal, self.path_at = [], None, -1.0
        self.seen = None                # 경찰 봇이 마지막으로 본 도둑 (id, x, y, 시각)
        self.flee, self.flee_at = None, -1.0

    def speed(self):
        base = SPEED[self.team or "lobby"]
        return base * BOT_COP_HANDICAP if self.bot and self.team == "cop" else base

    def teleport(self, x, y):
        self.x, self.y, self.moving = x, y, False
        self.tp += 1

    def public(self, now):
        return {"id": self.uid, "name": self.name, "model": self.model, "x": round(self.x, 3), "y": round(self.y, 3),
                "dir": round(self.dir, 3), "moving": self.moving, "online": self.connected, "team": self.team, "jailed": self.jailed,
                "safe": round(max(0.0, self.safe_until - now), 1), "frozen": round(max(0.0, self.frozen_until - now), 1),
                "dash": round(max(0.0, self.dash_ready - now), 1), "speed": self.speed(), "tp": self.tp, "catches": self.catches,
                "bot": self.bot, "dashing": now < self.dash_until}


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
        bad = ((x - p.x) ** 2 + (y - p.y) ** 2 > reach ** 2 or not free_at(x, y) or (frozen and (x, y) != (p.x, p.y))
               or crosses_wall(p.x, p.y, x, y))
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
            gx, gy = self._waypoint(b, gx, gy, now)
            if dash and now >= b.dash_ready:
                self.dash(b.uid, now)
            dx, dy = gx - b.x, gy - b.y
            dist = math.hypot(dx, dy)
            if dist < 0.15:
                b.moving = False
                continue
            if now < b.detour_until:                          # 막혀서 잠깐 옆으로 돌아가는 중
                dx, dy = b.detour
                dist = 1.0
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

    def _cop_map(self, cops, now):
        """모든 경찰에서 잰 격자 거리 지도. 0.3초마다 한 번만 새로 잰다."""
        if self._cop_map_at is None or now - self._cop_map_at > 0.3:
            self._cop_dist, self._cop_map_at = grid_dist([(p.x, p.y) for p in cops]), now
        return self._cop_dist

    def _flee_spot(self, b, cops, now):
        cop_d = self._cop_map(cops, now)
        mine = grid_dist([(b.x, b.y)], limit=7.0)
        ratio = SPEED["cop"] / SPEED["thief"]
        room = openness()
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
        if clear_line(b.x, b.y, gx, gy):
            b.path = []
            return gx, gy
        pg = b.path_goal
        if not b.path or pg is None or math.hypot(pg[0] - gx, pg[1] - gy) > 1.0 or now - b.path_at > 1.0:
            b.path, b.path_goal, b.path_at = find_path(b.x, b.y, gx, gy), (gx, gy), now
        while len(b.path) > 1 and math.hypot(b.path[0][0] - b.x, b.path[0][1] - b.y) < 0.3:
            b.path.pop(0)
        if not b.path:
            return gx, gy
        best = 0
        for k in range(min(len(b.path), 10)):
            if clear_line(b.x, b.y, *b.path[k]):
                best = k
        del b.path[:best]
        return b.path[0]

    def _bot_goal(self, b, people, now):
        """봇이 향할 곳 (x, y, 대시할지). 없으면 None."""
        if b.team == "cop":
            prey = [p for p in people if p.team == "thief" and not p.jailed and now >= p.safe_until]
            if not prey:
                return None
            t = min(prey, key=lambda p: (p.x - b.x) ** 2 + (p.y - b.y) ** 2)
            seen = b.seen
            if seen is None or seen[0] != t.uid or now - seen[3] >= BOT_REACTION:   # 사람처럼 조금 늦게 다시 겨눈다
                seen = b.seen = (t.uid, t.x, t.y, now)
            d = math.hypot(t.x - b.x, t.y - b.y)
            if math.hypot(seen[1] - b.x, seen[2] - b.y) < 0.4:                    # 본 자리에 닿았으면 지금 자리로
                seen = b.seen = (t.uid, t.x, t.y, now)
            return seen[1], seen[2], 1.5 < d < 4.0
        if b.team != "thief":
            return None
        cops = [p for p in people if p.team == "cop"]
        near = min(cops, key=lambda p: (p.x - b.x) ** 2 + (p.y - b.y) ** 2) if cops else None
        d = math.hypot(near.x - b.x, near.y - b.y) if near else 99.0
        jailed = any(p.jailed for p in people)
        pad_guard = min((math.hypot(p.x - PAD["cx"], p.y - PAD["cy"]) for p in cops), default=99.0)
        if jailed and d > 4.0 and pad_guard > 5.0:                # 발판을 지키는 경찰이 없고 쫓기지 않을 때만 구하러 간다
            return PAD["cx"], PAD["cy"], d < 2.5
        def danger(x, y):                                      # 모든 경찰 중 가장 가까운 거리
            return min((math.hypot(p.x - x, p.y - y) for p in cops), default=99.0)

        if near is not None and d < 7.0:                          # 경찰보다 먼저 닿을 수 있는 곳 중 경찰에게서 가장 먼 곳
            dash_now = d < 2.5 or (near.dash_until > now and d < 4.0)
            if b.flee is None or now - b.flee_at > 0.3 or math.hypot(b.flee[0] - b.x, b.flee[1] - b.y) < 0.4:
                b.flee, b.flee_at = self._flee_spot(b, cops, now), now
            if b.flee is not None:
                b.wander = None
                return b.flee[0], b.flee[1], dash_now
        if b.wander is None or math.hypot(b.wander[0] - b.x, b.wander[1] - b.y) < 0.5 or self.rng.random() < 0.01:
            spots = []
            for _ in range(30):
                wx, wy = self.rng.uniform(1, SIZE - 1), self.rng.uniform(1, SIZE - 1)
                i, j = _node(wx, wy)
                if walkable()[i][j]:
                    spots.append((wx, wy))
                if len(spots) >= 6:
                    break
            if spots:                                              # 경찰에게서 먼 곳으로 돌아다닌다
                b.wander = max(spots, key=lambda q: danger(*q) + self.rng.uniform(0, 3))
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


# 봇 길찾기 격자는 서버가 뜰 때 한 번 만들어 둔다 (첫 판 도중 이벤트 루프가 멈칫하지 않게, 약 30ms)
walkable()
openness()
