"""오목 금수(렌주룰) 판정 — 판(15×15, 0 = 빈칸, 1 = 흑, 2 = 백)만 보는 순수 함수.

렌주룰 요약
  - 흑(선공)만 제한: 3-3(열린 3이 둘 이상), 4-4(4가 둘 이상), 장목(6목 이상)은 둘 수 없다 (금수).
  - 흑은 정확히 5목이어야 이긴다. 5목이 완성되는 수는 금수 모양이 동시에 생겨도 둘 수 있다 (5목 우선).
  - 4-3(4와 3 동시)은 허용. 백은 아무 제한이 없고 5목 이상이면 이긴다.
용어: "4" = 한 수 더 두면 정확히 5목이 되는 줄, "열린 3" = 한 수 더 두면 양쪽이 열린 4(둘 다 5목으로 이어지는)가 되는 줄.
"""
SIZE = 15
DIRS = ((1, 0), (0, 1), (1, 1), (1, -1))
BLACK, WHITE = 1, 2
FORBIDDEN_LABELS = {"overline": "장목(6목 이상)", "double_four": "4-4", "double_three": "3-3"}


def _in(x, y):
    return 0 <= x < SIZE and 0 <= y < SIZE


def run_through(board, x, y, dx, dy, color):
    """(x, y)를 지나는 한 방향의 연속된 같은 색 돌 (개수, 양 끝 바로 밖 칸 두 개)."""
    count = 1
    ends = []
    for sign in (-1, 1):
        cx, cy = x + dx * sign, y + dy * sign
        while _in(cx, cy) and board[cy][cx] == color:
            count += 1
            cx, cy = cx + dx * sign, cy + dy * sign
        ends.append((cx, cy))
    return count, ends


def exact_five_line(board, x, y, color):
    """(x, y)의 돌로 정확히 5목이 된 줄이 있으면 그 칸 목록."""
    for dx, dy in DIRS:
        count, _ = run_through(board, x, y, dx, dy, color)
        if count == 5:
            cells = [(x, y)]
            for sign in (-1, 1):
                cx, cy = x + dx * sign, y + dy * sign
                while _in(cx, cy) and board[cy][cx] == color:
                    cells.append((cx, cy))
                    cx, cy = cx + dx * sign, cy + dy * sign
            return sorted(cells)
    return None


def _line_points(x, y, dx, dy, reach=4):
    """(x, y)와 같은 줄에서 ±reach 안의 빈 칸 후보 (k, 좌표)."""
    for k in range(-reach, reach + 1):
        cx, cy = x + dx * k, y + dy * k
        if k and _in(cx, cy):
            yield k, cx, cy


def _fours_in_direction(board, x, y, dx, dy):
    """이번 수(x, y)가 만든 이 방향의 '4' 개수. 한 수 더 두면 정확히 5목이 되고 그 5목에 이번 수가 들어가는 빈 칸을 센다.
    양쪽이 열린 4(_●●●●_)는 5목 자리가 둘이어도 4 하나로 센다 (두 자리가 5칸 떨어져 있음)."""
    points = []
    for k, cx, cy in _line_points(x, y, dx, dy):
        if board[cy][cx]:
            continue
        board[cy][cx] = BLACK
        count, _ = run_through(board, cx, cy, dx, dy, BLACK)
        if count == 5:
            cells = {(cx, cy)}
            for sign in (-1, 1):
                nx, ny = cx + dx * sign, cy + dy * sign
                while _in(nx, ny) and board[ny][nx] == BLACK:
                    cells.add((nx, ny))
                    nx, ny = nx + dx * sign, ny + dy * sign
            if (x, y) in cells:
                points.append(k)
        board[cy][cx] = 0
    if len(points) == 2 and abs(points[0] - points[1]) == 5:
        return 1
    return len(points)


def _has_open_three(board, x, y, dx, dy, depth):
    """이번 수(x, y)로 이 방향에 열린 3이 생겼는지: 한 수 더 두어 양쪽이 열린 4가 되는, 둘 수 있는 빈 칸이 있는가."""
    for k, cx, cy in _line_points(x, y, dx, dy):
        if board[cy][cx]:
            continue
        board[cy][cx] = BLACK
        try:
            count, ends = run_through(board, cx, cy, dx, dy, BLACK)
            if count != 4:
                continue
            (ax, ay), (bx, by) = ends
            if not (_in(ax, ay) and _in(bx, by) and board[ay][ax] == 0 and board[by][bx] == 0):
                continue
            # 양쪽 끝에 두었을 때 6목이 되지 않아야 진짜 열린 4
            if (_in(ax - dx, ay - dy) and board[ay - dy][ax - dx] == BLACK) or \
               (_in(bx + dx, by + dy) and board[by + dy][bx + dx] == BLACK):
                continue
            cells = [(cx, cy)]
            for sign in (-1, 1):
                nx, ny = cx + dx * sign, cy + dy * sign
                while _in(nx, ny) and board[ny][nx] == BLACK:
                    cells.append((nx, ny))
                    nx, ny = nx + dx * sign, ny + dy * sign
            if (x, y) not in cells:
                continue
        finally:
            board[cy][cx] = 0
        if depth < 2 and forbidden_reason(board, cx, cy, depth + 1):
            continue   # 그 자리가 금수면 열린 4를 못 만든다 → 3이 아니다
        return True
    return False


def forbidden_reason(board, x, y, depth=0):
    """흑이 빈 칸 (x, y)에 두면 금수인지. 금수 종류('overline'/'double_four'/'double_three') 또는 None."""
    if board[y][x]:
        return None
    board[y][x] = BLACK
    try:
        counts = [run_through(board, x, y, dx, dy, BLACK)[0] for dx, dy in DIRS]
        if 5 in counts:
            return None                       # 5목 우선
        if any(c >= 6 for c in counts):
            return "overline"
        fours = sum(_fours_in_direction(board, x, y, dx, dy) for dx, dy in DIRS)
        if fours >= 2:
            return "double_four"
        if fours == 1:
            return None                       # 4-3은 허용
        threes = sum(1 for dx, dy in DIRS if _has_open_three(board, x, y, dx, dy, depth))
        return "double_three" if threes >= 2 else None
    finally:
        board[y][x] = 0


def forbidden_cells(board, reach=4):
    """지금 흑이 둘 수 없는 빈 칸 목록 [(x, y, 종류)]. 돌 근처만 확인한다."""
    near = set()
    for y in range(SIZE):
        for x in range(SIZE):
            if board[y][x] == BLACK:
                for dy in range(-reach, reach + 1):
                    for dx in range(-reach, reach + 1):
                        nx, ny = x + dx, y + dy
                        if _in(nx, ny) and board[ny][nx] == 0:
                            near.add((nx, ny))
    out = []
    for x, y in sorted(near):
        reason = forbidden_reason(board, x, y)
        if reason:
            out.append((x, y, reason))
    return out
