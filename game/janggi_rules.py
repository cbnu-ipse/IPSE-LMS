"""장기 규칙 — 판만 보는 순수 함수. 판은 10행(y: 0 위 ~ 9 아래) × 9열(x: 0 ~ 8)의 2차원 리스트이고
칸은 "" (빈칸) 또는 두 글자 말: 진영(c = 초, h = 한) + 종류(K 궁, A 사, E 상, H 마, R 차, C 포, P 졸/병).

초(0)는 아래쪽에서 위로 올라가고 먼저 둔다, 한(1)은 위쪽에서 내려온다.
이동 규칙
  - 궁·사: 궁성(3×3) 안에서 한 칸, 궁성의 대각선 선이 있는 점에서는 대각선으로도.
  - 차: 가로·세로로 막힐 때까지, 궁성 안에서는 대각선 선을 따라서도 (상대 말을 만나면 잡고 멈춘다).
  - 포: 가로·세로(궁성 안에서는 대각선도)로 말 하나를 넘어서만 움직이고 잡을 수 있다. 포는 포를 넘을 수도 잡을 수도 없다.
  - 마: 한 칸 직진 후 대각선 한 칸 (직진 칸이 막혀 있으면 못 간다 = 멱).
  - 상: 한 칸 직진 후 대각선 두 칸 (직진 칸이나 첫 대각선 칸이 막혀 있으면 못 간다).
  - 졸/병: 앞이나 옆으로 한 칸 (뒤로 못 감). 상대 궁성에서는 대각선 선을 따라 앞으로도.
자기 궁이 장군을 받는 상태가 되는 수, 두 궁이 아무 말 없이 마주 보게 되는 수(빅장)는 둘 수 없다.
둘 수 있는 수가 하나도 없으면 진다 (외통수; 한수쉼은 지원하지 않는다).
"""
COLS, ROWS = 9, 10
CHO, HAN = 0, 1
SIDE_LETTER = {CHO: "c", HAN: "h"}
PIECE_NAMES = {"K": "궁", "A": "사", "E": "상", "H": "마", "R": "차", "C": "포", "P": "졸병"}
VALUES = {"K": 0, "A": 3, "E": 3, "H": 5, "R": 13, "C": 7, "P": 2}
ORTHO = ((1, 0), (-1, 0), (0, 1), (0, -1))

# 상차림: 마·상이 놓이는 네 자리(x = 1, 2, 6, 7)의 배치. 각자 고른다.
SETUPS = ["마상마상", "마상상마", "상마마상", "상마상마"]
_SETUP_PIECES = {"마": "H", "상": "E"}


def _palace_lines():
    """궁성의 대각선 선 (세 점씩): 위(한) 궁성 y 0~2, 아래(초) 궁성 y 7~9."""
    lines = []
    for yc in (1, 8):
        lines.append([(3, yc - 1), (4, yc), (5, yc + 1)])
        lines.append([(5, yc - 1), (4, yc), (3, yc + 1)])
    return lines


PALACE_LINES = _palace_lines()
PALACE_CELLS = {HAN: {(x, y) for x in range(3, 6) for y in range(0, 3)},
                CHO: {(x, y) for x in range(3, 6) for y in range(7, 10)}}


def inb(x, y):
    return 0 <= x < COLS and 0 <= y < ROWS


def side_of(piece):
    return CHO if piece[0] == "c" else HAN


def piece_type(piece):
    return piece[1]


def new_board(cho_setup=0, han_setup=0):
    """초기 배치. cho_setup/han_setup = SETUPS의 번호."""
    b = [[""] * COLS for _ in range(ROWS)]
    for side, back, cannon, soldier, setup in ((CHO, 9, 7, 6, cho_setup), (HAN, 0, 2, 3, han_setup)):
        c = SIDE_LETTER[side]
        for x, t in ((0, "R"), (3, "A"), (5, "A"), (8, "R")):
            b[back][x] = c + t
        for x, name in zip((1, 2, 6, 7), SETUPS[setup]):
            b[back][x] = c + _SETUP_PIECES[name]
        b[back + (-1 if side == CHO else 1)][4] = c + "K"
        b[cannon][1] = b[cannon][7] = c + "C"
        for x in (0, 2, 4, 6, 8):
            b[soldier][x] = c + "P"
    return b


def _diag_rays(x, y):
    """(x, y)에서 궁성 대각선 선을 따라 뻗는 길 (점 목록들)."""
    rays = []
    for line in PALACE_LINES:
        if (x, y) in line:
            i = line.index((x, y))
            if i == 0:
                rays.append([line[1], line[2]])
            elif i == 2:
                rays.append([line[1], line[0]])
            else:
                rays.append([line[0]])
                rays.append([line[2]])
    return rays


def _ortho_rays(x, y):
    rays = []
    for dx, dy in ORTHO:
        ray, cx, cy = [], x + dx, y + dy
        while inb(cx, cy):
            ray.append((cx, cy))
            cx, cy = cx + dx, cy + dy
        rays.append(ray)
    return rays


def pseudo_moves(board, x, y):
    """(x, y)의 말이 규칙대로 갈 수 있는 칸들 (자기 궁 안전은 따지지 않음)."""
    piece = board[y][x]
    side, t = side_of(piece), piece_type(piece)
    out = []

    def free_or_enemy(px, py):
        return inb(px, py) and (not board[py][px] or side_of(board[py][px]) != side)

    if t in "KA":
        palace = PALACE_CELLS[side]
        for dx, dy in ORTHO:
            if (x + dx, y + dy) in palace and free_or_enemy(x + dx, y + dy):
                out.append((x + dx, y + dy))
        for ray in _diag_rays(x, y):
            p = ray[0]
            if p in palace and abs(p[0] - x) == 1 and abs(p[1] - y) == 1 and free_or_enemy(*p):
                out.append(p)
    elif t == "R":
        for ray in _ortho_rays(x, y) + _diag_rays(x, y):
            for px, py in ray:
                if not board[py][px]:
                    out.append((px, py))
                    continue
                if side_of(board[py][px]) != side:
                    out.append((px, py))
                break
    elif t == "C":
        for ray in _ortho_rays(x, y) + _diag_rays(x, y):
            i = next((k for k, (px, py) in enumerate(ray) if board[py][px]), None)
            if i is None or piece_type(board[ray[i][1]][ray[i][0]]) == "C":
                continue                                      # 넘을 말이 없거나 포를 넘을 수는 없다
            for px, py in ray[i + 1:]:
                if not board[py][px]:
                    out.append((px, py))
                    continue
                if side_of(board[py][px]) != side and piece_type(board[py][px]) != "C":
                    out.append((px, py))                      # 포는 잡을 수 없다
                break
    elif t == "H":
        for dx, dy in ORTHO:
            if inb(x + dx, y + dy) and not board[y + dy][x + dx]:
                for s in (1, -1):
                    tx, ty = x + 2 * dx + dy * s, y + 2 * dy + dx * s
                    if free_or_enemy(tx, ty):
                        out.append((tx, ty))
    elif t == "E":
        for dx, dy in ORTHO:
            if not (inb(x + dx, y + dy) and not board[y + dy][x + dx]):
                continue
            for s in (1, -1):
                ddx, ddy = dx + dy * s, dy + dx * s
                mx, my = x + dx + ddx, y + dy + ddy
                tx, ty = mx + ddx, my + ddy
                if inb(mx, my) and not board[my][mx] and free_or_enemy(tx, ty):
                    out.append((tx, ty))
    elif t == "P":
        fy = -1 if side == CHO else 1
        for tx, ty in ((x, y + fy), (x - 1, y), (x + 1, y)):
            if free_or_enemy(tx, ty):
                out.append((tx, ty))
        for ray in _diag_rays(x, y):                          # 궁성 대각선 선을 따라 앞으로 한 칸
            p = ray[0]
            if abs(p[0] - x) == 1 and p[1] - y == fy and free_or_enemy(*p):
                out.append(p)
    return out


def find_king(board, side):
    target = SIDE_LETTER[side] + "K"
    for y in range(ROWS):
        for x in range(COLS):
            if board[y][x] == target:
                return x, y
    return None


def is_attacked(board, x, y, by_side):
    """(x, y)를 by_side의 말이 한 수에 잡을 수 있는가 (포는 빈칸 쪽 계산을 위해 목적지 비교만 사용)."""
    for py in range(ROWS):
        for px in range(COLS):
            piece = board[py][px]
            if piece and side_of(piece) == by_side and (x, y) in pseudo_moves(board, px, py):
                return True
    return False


def kings_facing(board):
    """두 궁이 같은 세로줄에서 사이에 말 없이 마주 본다 (빅장)."""
    a, b = find_king(board, CHO), find_king(board, HAN)
    if not a or not b or a[0] != b[0]:
        return False
    return all(not board[y][a[0]] for y in range(min(a[1], b[1]) + 1, max(a[1], b[1])))


def in_check(board, side):
    king = find_king(board, side)
    return bool(king) and is_attacked(board, king[0], king[1], 1 - side)


def apply_move(board, fx, fy, tx, ty):
    """말을 옮긴 새 판과 잡힌 말을 돌려준다 (원래 판은 바꾸지 않는다)."""
    nb = [row[:] for row in board]
    captured = nb[ty][tx]
    nb[ty][tx], nb[fy][fx] = nb[fy][fx], ""
    return nb, captured


def legal_moves_for(board, x, y):
    """(x, y)의 말이 둘 수 있는 수: 내 궁이 장군 상태가 되지 않고 빅장도 아닌 것."""
    side = side_of(board[y][x])
    out = []
    for tx, ty in pseudo_moves(board, x, y):
        nb, _ = apply_move(board, x, y, tx, ty)
        if in_check(nb, side) or kings_facing(nb):
            continue
        out.append((tx, ty))
    return out


def all_legal_moves(board, side):
    """{(x, y): [(tx, ty), ...]} — 둘 수 있는 말만."""
    out = {}
    for y in range(ROWS):
        for x in range(COLS):
            piece = board[y][x]
            if piece and side_of(piece) == side:
                moves = legal_moves_for(board, x, y)
                if moves:
                    out[(x, y)] = moves
    return out


def position_key(board, turn):
    return ("".join(c or ".." for row in board for c in row) + str(turn))
