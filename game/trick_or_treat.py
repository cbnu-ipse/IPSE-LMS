"""
트릭 오어 트릿: 사탕 골목 지도 — 할로윈 이벤트 사탕(🍬)을 얻는 실력 게임 (운 요소 없음).

한 판:
  - 6×6 동네 지도. 집마다 사탕 개수(1~5)가 적혀 있고, 👻 귀신 집은 지나갈 수 없다. 🏠 출발점에서 시작한다.
  - 최대 MOVES걸음(상하좌우, 같은 칸 다시 밟기 금지) 안에 사탕을 최대한 많이 모으는 경로를 그린다. 제한 시간 TIME_LIMIT초.
  - 서버가 가능한 모든 경로로 최고 점수를 미리 계산해 두고, 제출한 경로를 검증해 최고 점수 대비 비율로 사탕을 준다
    (100% → 3개, 85%↑ → 2개, 70%↑ → 1개). 하루 사탕 상한(accounts.treats) 안에서만 실제로 받는다.
지도는 서버가 만들고 경로 합법성·시간을 서버가 확인한다. 플레이 횟수 제한은 없다.
"""
import random
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from accounts import treats
from .models import TrickOrTreatLog, TrickOrTreatRun

SIZE = 6
MOVES = 10
TIME_LIMIT = 60          # 초
TIME_GRACE = 3           # 네트워크 지연 여유
HAUNTED = -1             # 지나갈 수 없는 칸
START = (SIZE - 1, 0)    # 왼쪽 아래
REWARDS = ((1.0, 3), (0.85, 2), (0.7, 1))   # (최고 점수 대비 비율 이상, 사탕)
_rng = random.SystemRandom()


def _neighbors(r, c):
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < SIZE and 0 <= nc < SIZE:
            yield nr, nc


def best_route(board, start=START, moves=MOVES):
    """가능한 모든 경로(같은 칸 재방문 없음) 중 사탕 최대 (점수, 경로)."""
    best = [0, []]
    path = []
    seen = {start}

    def dfs(pos, left, score):
        if score > best[0]:
            best[0], best[1] = score, list(path)
        if not left:
            return
        for nxt in _neighbors(*pos):
            v = board[nxt[0]][nxt[1]]
            if nxt in seen or v == HAUNTED:
                continue
            seen.add(nxt)
            path.append(nxt)
            dfs(nxt, left - 1, score + v)
            path.pop()
            seen.discard(nxt)

    dfs(start, moves, 0)
    return best[0], [list(p) for p in best[1]]


def make_board(rng=None):
    """귀신 집 6~8채, 빈 길 일부, 나머지는 사탕 1~5. 출발점 바로 옆은 막지 않는다."""
    rng = rng or _rng
    while True:
        board = [[rng.choices((1, 2, 3, 4, 5, 0), weights=(5, 5, 4, 3, 2, 4))[0] for _ in range(SIZE)] for _ in range(SIZE)]
        cells = [(r, c) for r in range(SIZE) for c in range(SIZE)
                 if (r, c) != START and abs(r - START[0]) + abs(c - START[1]) > 1]
        for r, c in rng.sample(cells, rng.randint(6, 8)):
            board[r][c] = HAUNTED
        board[START[0]][START[1]] = 0
        best, route = best_route(board)
        if best >= 15 and len(route) == MOVES:  # 너무 막힌 지도는 다시
            return board, best


def check_route(board, route):
    """제출 경로가 규칙에 맞으면 모은 사탕 수, 아니면 None."""
    if not isinstance(route, list) or len(route) > MOVES:
        return None
    pos, seen, score = START, {START}, 0
    for step in route:
        try:
            r, c = int(step[0]), int(step[1])
        except (TypeError, ValueError, IndexError):
            return None
        if (r, c) not in set(_neighbors(*pos)) or (r, c) in seen or board[r][c] == HAUNTED:
            return None
        seen.add((r, c))
        score += board[r][c]
        pos = (r, c)
    return score


def reward_for(score, best):
    ratio = score / best if best else 0
    return next((n for threshold, n in REWARDS if ratio >= threshold - 1e-9), 0)


def state_for(user):
    run = TrickOrTreatRun.objects.filter(user=user).first()
    active = treats.event_active()
    left = None
    if run:
        left = max(0, round((run.created_at + timedelta(seconds=TIME_LIMIT) - timezone.now()).total_seconds()))
    return {
        "event_active": active,
        "treats": user.__class__.objects.filter(pk=user.pk).values_list("treats", flat=True).first() or 0,
        "remaining_today": treats.remaining_today(user) if active else 0,
        "daily_cap": treats.TREAT_DAILY_CAP,
        "size": SIZE, "moves": MOVES, "time_limit": TIME_LIMIT, "start": list(START),
        "rewards": [{"ratio": round(t * 100), "treats": n} for t, n in REWARDS],
        "run": None if not run else {"board": run.board, "seconds_left": left},
    }


def start(user):
    """새 지도로 한 판 시작 (진행 중인 판이 있으면 새 지도로 바꾼다)."""
    if not treats.event_active():
        return False, "할로윈 이벤트가 끝났어요."
    board, best = make_board()
    with transaction.atomic():
        TrickOrTreatRun.objects.filter(user=user).delete()
        TrickOrTreatRun.objects.create(user=user, board=board, best=best)
    return True, None


def submit(user, route):
    """경로를 제출한다. (ok, {"score", "best", "best_route", "granted", "late"})"""
    if not treats.event_active():
        return False, "할로윈 이벤트가 끝났어요."
    with transaction.atomic():
        run = TrickOrTreatRun.objects.select_for_update().filter(user=user).first()
        if not run:
            return False, "진행 중인 판이 없습니다."
        score = check_route(run.board, route)
        if score is None:
            return False, "규칙에 맞지 않는 경로입니다."
        elapsed = (timezone.now() - run.created_at).total_seconds()
        late = elapsed > TIME_LIMIT + TIME_GRACE
        earned = 0 if late else reward_for(score, run.best)
        granted = treats.grant(user, earned, "trick_or_treat", f"사탕 골목 지도 {score}/{run.best}") if earned else 0
        _, route_best = best_route(run.board)
        TrickOrTreatLog.objects.create(user=user, score=score, best=run.best, earned=earned, granted=granted,
                                       seconds=round(elapsed))
        run.delete()
    return True, {"score": score, "best": run.best, "best_route": route_best, "earned": earned,
                  "granted": granted, "late": late}
