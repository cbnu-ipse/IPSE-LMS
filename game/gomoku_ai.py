"""오목 AI — 패턴 점수 휴리스틱. 보드는 15×15 정수 격자 (0 = 빈칸, 1 = 흑, 2 = 백).

각 후보 칸에 "내가 두면 만들어지는 모양"과 "상대가 두면 만들어지는 모양"의 점수를 더해 가장 높은 칸을 둔다.
5목 완성 > 상대 5목 막기 > 열린 4 > 상대 열린 4 막기 > 열린 3 ... 순으로 자연스럽게 우선순위가 정해진다.
숨은 정보가 없는 게임이라 보드만 보고 두며, 같은 점수면 무작위로 골라 늘 같은 수만 두지 않는다.
"""
import random

SIZE = 15
DIRS = ((1, 0), (0, 1), (1, 1), (1, -1))

# (이어진 개수, 열린 끝 수) → 점수
_LINE_SCORE = {
    (5, 0): 100000, (5, 1): 100000, (5, 2): 100000,
    (4, 2): 10000, (4, 1): 1500, (4, 0): 0,
    (3, 2): 1200, (3, 1): 150, (3, 0): 0,
    (2, 2): 120, (2, 1): 15, (2, 0): 0,
    (1, 2): 10, (1, 1): 2, (1, 0): 0,
}


def _run(board, x, y, dx, dy, color):
    """(x, y)에 color를 둔다고 보고, 한 방향에서 이어지는 개수와 막히지 않은 끝 수."""
    count = 1
    ends = 0
    for sign in (1, -1):
        cx, cy = x + dx * sign, y + dy * sign
        while 0 <= cx < SIZE and 0 <= cy < SIZE and board[cy][cx] == color:
            count += 1
            cx, cy = cx + dx * sign, cy + dy * sign
        if 0 <= cx < SIZE and 0 <= cy < SIZE and board[cy][cx] == 0:
            ends += 1
    return count, ends


def _cell_score(board, x, y, color):
    total = 0
    for dx, dy in DIRS:
        count, ends = _run(board, x, y, dx, dy, color)
        total += _LINE_SCORE.get((min(count, 5), ends), 0)
    return total


def _candidates(board, reach=2):
    cells = set()
    for y in range(SIZE):
        for x in range(SIZE):
            if board[y][x]:
                for dy in range(-reach, reach + 1):
                    for dx in range(-reach, reach + 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < SIZE and 0 <= ny < SIZE and board[ny][nx] == 0:
                            cells.add((nx, ny))
    return cells


def choose_move(board, color, rng=None):
    """(x, y). 보드가 비어 있으면 중앙, 꽉 찼으면 None."""
    rng = rng or random.Random()
    cells = _candidates(board)
    if not cells:
        if all(board[y][x] for y in range(SIZE) for x in range(SIZE)):
            return None
        return (SIZE // 2, SIZE // 2)
    other = 2 if color == 1 else 1
    best, best_score = [], -1
    for x, y in cells:
        score = _cell_score(board, x, y, color) * 1.0 + _cell_score(board, x, y, other) * 0.9
        # 중앙에 가까울수록 아주 조금 유리 (같은 점수일 때 가장자리로 흩어지지 않게)
        score += (SIZE - abs(x - SIZE // 2) - abs(y - SIZE // 2)) * 0.01
        if score > best_score + 1e-9:
            best, best_score = [(x, y)], score
        elif abs(score - best_score) <= 1e-9:
            best.append((x, y))
    return rng.choice(best)
