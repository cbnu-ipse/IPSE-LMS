"""장기 AI — 연습 상대. 모든 수를 두어 본 뒤 (잡은 말 가치) - (상대가 바로 되잡을 수 있는 가장 큰 말 가치)
로 점수를 매기고, 장군은 가산점, 외통수는 최고점으로 친다. 숨은 정보가 없는 게임이라 판만 보고 두며,
점수가 비슷하면 무작위로 골라 늘 같은 수를 두지 않는다. 깊이 1.5수 정도라 강하지는 않다."""
import random

from . import janggi_rules as rules

JITTER = 0.6


def _best_reply_loss(board, side):
    """상대(side)가 한 수로 잡을 수 있는 가장 큰 말의 가치 (자기 궁 안전은 따지지 않는 근사)."""
    best = 0
    for y in range(rules.ROWS):
        for x in range(rules.COLS):
            piece = board[y][x]
            if piece and rules.side_of(piece) == side:
                for tx, ty in rules.pseudo_moves(board, x, y):
                    target = board[ty][tx]
                    if target:
                        best = max(best, rules.VALUES[rules.piece_type(target)])
    return best


def choose_move(board, side, rng=None):
    """(fx, fy, tx, ty). 둘 수 있는 수가 없으면 None."""
    rng = rng or random.Random()
    moves = [(fx, fy, tx, ty) for (fx, fy), targets in rules.all_legal_moves(board, side).items() for tx, ty in targets]
    if not moves:
        return None
    scored = []
    for fx, fy, tx, ty in moves:
        nb, captured = rules.apply_move(board, fx, fy, tx, ty)
        gain = rules.VALUES[rules.piece_type(captured)] if captured else 0
        loss = _best_reply_loss(nb, 1 - side)
        score = gain - loss + (0.5 if rules.in_check(nb, 1 - side) else 0) + rng.uniform(0, JITTER)
        # 조금씩 앞으로 나아가게 (졸/병과 차·포·마의 전진)
        forward = (fy - ty) if side == rules.CHO else (ty - fy)
        if rules.piece_type(board[fy][fx]) in "PRHC":
            score += 0.05 * forward
        scored.append((score, (fx, fy, tx, ty), nb))
    scored.sort(key=lambda s: -s[0])
    for score, move, nb in scored[:6]:                    # 상위 몇 개만 외통수인지 확인 (비싼 계산)
        if not rules.all_legal_moves(nb, 1 - side):
            return move
    return scored[0][1]
