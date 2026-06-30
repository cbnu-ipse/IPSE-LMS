import random
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db import transaction
from .models import SlotPlayLog, LobbyChatMessage, AppleGameScore, GameSeason
from accounts.models import User

# ─────────────────────────────────────────────────────────────────────────────
# 실물 슬롯머신 릴 구성 (Virtual Reel / Strip)
#
# 심볼 ID:
#   0 = 🌱 새싹  1 = 🍃 잎새  2 = 💻 코딩
#   3 = ⚡ 번개  4 = 🎯 챌린지  5 = 🚀 잭팟
# RTP 목표: ~88%
# ─────────────────────────────────────────────────────────────────────────────

VIRTUAL_REEL_1 = [0]*12 + [1]*9 + [2]*7 + [3]*5 + [4]*3 + [5]*1
VIRTUAL_REEL_2 = [0]*11 + [1]*9 + [2]*7 + [3]*5 + [4]*3 + [5]*1
VIRTUAL_REEL_3 = [0]*10 + [1]*9 + [2]*7 + [3]*5 + [4]*3 + [5]*1

WIN_TABLE = {
    5: ("S", 100),
    4: ("A", 30),
    3: ("B", 15),
    2: ("C", 8),
    1: ("D", 4),
    0: ("E", 2),
}

# 사과게임 시즌 랭킹 보상 (순위 → 낙엽 수량)
SEASON_RANK_REWARDS = {1: 100, 2: 50, 3: 5}


def _spin_reels():
    idx1 = random.randrange(len(VIRTUAL_REEL_1))
    idx2 = random.randrange(len(VIRTUAL_REEL_2))
    idx3 = random.randrange(len(VIRTUAL_REEL_3))
    return VIRTUAL_REEL_1[idx1], VIRTUAL_REEL_2[idx2], VIRTUAL_REEL_3[idx3]


def _evaluate(s1, s2, s3):
    if s1 == s2 == s3:
        return WIN_TABLE.get(s1, ("F", 0))
    return "F", 0


# ── 랭킹 헬퍼 ────────────────────────────────────────────────────────────────

GRADE_ORDER = {"S": 6, "A": 5, "B": 4, "C": 3, "D": 2, "E": 1, "F": 0}
GRADE_DISPLAY = {
    "S": "🚀 잭팟",
    "A": "🎯 챌린지",
    "B": "⚡ 번개",
    "C": "💻 코딩",
    "D": "🍃 잎새",
    "E": "🌱 새싹",
}


def _assign_ranks(rows, key):
    """공동 순위 부여 (1,1,3,4... 방식)"""
    for i, row in enumerate(rows):
        if i == 0 or row[key] != rows[i - 1][key]:
            row["rank"] = i + 1
        else:
            row["rank"] = rows[i - 1]["rank"]
    return rows


def get_slot_ranking(top_n=10):
    """슬롯머신 전체 기간 최고 등급 랭킹 (시즌 없음)."""
    logs = (
        SlotPlayLog.objects
        .filter(result_grade__in=list(GRADE_ORDER.keys()))
        .exclude(result_grade="F")
        .select_related("user", "user__student")
        .order_by("played_date")
    )
    user_best = {}
    for log in logs:
        uid = log.user_id
        gv = GRADE_ORDER.get(log.result_grade, 0)
        if uid not in user_best or gv > user_best[uid]["grade_val"]:
            user_best[uid] = {
                "user": log.user,
                "grade": log.result_grade,
                "grade_val": gv,
                "grade_display": GRADE_DISPLAY.get(log.result_grade, log.result_grade),
                "score": gv,
            }
    rows = sorted(user_best.values(), key=lambda r: -r["grade_val"])
    result = rows if top_n is None else rows[:top_n]
    return _assign_ranks(result, "grade_val")


def get_apple_ranking(top_n=10, season=None):
    """사과게임 최고 점수 랭킹. season 지정 시 해당 시즌 기간만 집계."""
    from django.db.models import Max
    qs = AppleGameScore.objects.values("user")
    if season is not None:
        qs = qs.filter(
            played_at__date__gte=season.start_date,
            played_at__date__lte=season.end_date,
        )
    qs = qs.annotate(best=Max("score")).filter(best__gt=0).order_by("-best")

    user_ids = [entry["user"] for entry in qs]
    score_map = {entry["user"]: entry["best"] for entry in qs}
    users = User.objects.filter(pk__in=user_ids).select_related("student")
    rows = [{"user": u, "score": score_map[u.pk]} for u in users]
    rows.sort(key=lambda r: -r["score"])
    result = rows if top_n is None else rows[:top_n]
    return _assign_ranks(result, "score")


# ─────────────────────────────────────────────────────────────────────────────

@login_required
def apple_game_view(request):
    latest = LobbyChatMessage.objects.select_related("user").order_by("-created_at")[:50]
    chat_messages = list(latest)[::-1]
    return render(request, "game/apple_game.html", {"title": "사과게임", "chat_messages": chat_messages})


@login_required
@require_POST
def save_apple_score(request):
    try:
        score = int(request.POST.get("score", 0))
    except (TypeError, ValueError):
        return JsonResponse({"ok": False, "error": "invalid score"}, status=400)
    if score < 0:
        return JsonResponse({"ok": False, "error": "invalid score"}, status=400)
    AppleGameScore.objects.create(user=request.user, score=score)
    return JsonResponse({"ok": True})


@login_required
def apple_game_ranking(request):
    """사과게임 TOP 10 랭킹 JSON (현재 시즌 기준)."""
    season = GameSeason.get_or_create_current()
    rows = get_apple_ranking(10, season=season)
    data = [
        {
            "rank": r["rank"],
            "name": r["user"].display_name,
            "picture": r["user"].get_picture(),
            "score": r["score"],
            "is_me": r["user"].id == request.user.id,
        }
        for r in rows
    ]
    return JsonResponse({"ranking": data, "season": season.number})


@login_required
def slot_ranking(request):
    """슬롯머신 TOP 10 랭킹 JSON (전체 기간)."""
    rows = get_slot_ranking(10)
    data = [
        {
            "rank": r["rank"],
            "name": r["user"].display_name,
            "picture": r["user"].get_picture(),
            "grade": r["grade"],
            "grade_display": r["grade_display"],
            "is_me": r["user"].id == request.user.id,
        }
        for r in rows
    ]
    return JsonResponse({"ranking": data})


@login_required
def game_ranking_view(request):
    """게임 서브도메인 전용 랭킹 페이지."""
    board = request.GET.get("board", "apple_game").strip()
    query = request.GET.get("q", "").strip()
    season_number = request.GET.get("season", "").strip()

    if board not in {"slot_game", "apple_game"}:
        board = "apple_game"

    BOARD_LABELS = {
        "slot_game": "슬롯머신 랭킹",
        "apple_game": "사과게임 랭킹",
    }
    board_label = BOARD_LABELS[board]

    # 슬롯머신은 전체 기간 / 시즌 없음
    if board == "slot_game":
        ranking_rows = get_slot_ranking(top_n=None)
        current_season = None
        selected_season = None
        all_seasons = []
    else:
        current_season = GameSeason.get_or_create_current()

        if season_number and season_number.isdigit():
            try:
                selected_season = GameSeason.objects.get(number=int(season_number))
            except GameSeason.DoesNotExist:
                selected_season = current_season
        else:
            selected_season = current_season

        ranking_rows = get_apple_ranking(top_n=None, season=selected_season)
        all_seasons = list(GameSeason.objects.order_by("-number"))

    if query:
        q_lower = query.lower()
        ranking_rows = [
            r for r in ranking_rows
            if q_lower in r["user"].display_name.lower()
            or (
                hasattr(r["user"], "student")
                and r["user"].student
                and q_lower in (r["user"].student.nickname or "").lower()
            )
        ]

    return render(request, "game/ranking.html", {
        "title": "게임 랭킹",
        "board": board,
        "board_label": board_label,
        "query": query,
        "ranking_rows": ranking_rows,
        "top_rows": ranking_rows[:3],
        "current_season": current_season,
        "selected_season": selected_season,
        "all_seasons": all_seasons,
        "season_rank_rewards": SEASON_RANK_REWARDS,
    })


@login_required
def lobby_view(request):
    latest_messages = LobbyChatMessage.objects.select_related("user").order_by("-created_at")[:50]
    chat_messages = list(latest_messages)[::-1]
    return render(request, "game/lobby.html", {
        "title": "IPSE 놀이터",
        "chat_messages": chat_messages,
    })


@login_required
def slot_machine_view(request):
    today = timezone.localdate()
    played_today_count = SlotPlayLog.objects.filter(user=request.user, played_date=today).count()
    latest = LobbyChatMessage.objects.select_related("user").order_by("-created_at")[:50]
    return render(request, "game/slot_machine.html", {
        "title": "낙엽 슬롯머신",
        "played_today_count": played_today_count,
        "chat_messages": list(latest)[::-1],
    })


@login_required
def slot_status(request):
    today = timezone.localdate()
    played_today_count = SlotPlayLog.objects.filter(user=request.user, played_date=today).count()
    return JsonResponse({
        "played_today": played_today_count,
        "leaves": request.user.leaves,
    })


@login_required
@require_POST
def slot_spin(request):
    """슬롯머신 스핀 API (일일 1회 제한, 무료 제공)."""
    user = request.user
    today = timezone.localdate()

    with transaction.atomic():
        user_db = User.objects.select_for_update().get(id=user.id)
        played_today_count = SlotPlayLog.objects.filter(user=user_db, played_date=today).count()

        if played_today_count >= 1:
            return JsonResponse(
                {"status": "error", "message": "오늘은 이미 무료 캡슐 뽑기를 진행하셨습니다. 내일 다시 참여해 주세요!"},
                status=400
            )

        s1, s2, s3 = _spin_reels()
        grade, reward = _evaluate(s1, s2, s3)

        description_map = {
            "S": "슬롯머신 💎 잭팟 (S등급)",
            "A": "슬롯머신 ⭐ 당첨 (A등급)",
            "B": "슬롯머신 🔔 당첨 (B등급)",
            "C": "슬롯머신 🍊 당첨 (C등급)",
            "D": "슬롯머신 🍋 당첨 (D등급)",
            "E": "슬롯머신 🍒 당첨 (E등급)",
            "F": "슬롯머신 꽝",
        }

        if reward > 0:
            user_db.adjust_leaves(reward, "SLOT_MACHINE_REWARD", description_map.get(grade, "슬롯머신 당첨"))

        SlotPlayLog.objects.create(user=user_db, result_grade=grade, result_reward=reward)
        user_db.refresh_from_db()

        return JsonResponse({
            "status": "success",
            "grade": grade,
            "reward": reward,
            "reels": [s1, s2, s3],
            "leaves": user_db.leaves,
            "played_today": played_today_count + 1,
        })


@login_required
@require_POST
def slot_debug_spin(request):
    from django.conf import settings
    if not settings.DEBUG:
        return JsonResponse({"error": "forbidden"}, status=403)

    grade = request.POST.get("grade", "S").upper()
    if grade not in ("S", "A", "B", "C", "D", "E", "F"):
        return JsonResponse({"error": "invalid grade"}, status=400)

    today = timezone.localdate()
    reward = {"S": 100, "A": 30, "B": 15, "C": 8, "D": 4, "E": 2, "F": 0}.get(grade, 0)
    symbol_map = {"S": 5, "A": 4, "B": 3, "C": 2, "D": 1, "E": 0, "F": 0}
    sym = symbol_map[grade]
    s1, s2, s3 = (sym, sym, sym) if grade != "F" else (0, 1, 2)

    with transaction.atomic():
        user_db = User.objects.select_for_update().get(id=request.user.id)
        SlotPlayLog.objects.filter(user=user_db, played_date=today).delete()

        if reward > 0:
            user_db.adjust_leaves(reward, "SLOT_MACHINE_REWARD", f"[DEBUG] 슬롯머신 {grade}등급")

        SlotPlayLog.objects.create(user=user_db, result_grade=grade, result_reward=reward)
        user_db.refresh_from_db()

    return JsonResponse({
        "status": "success",
        "grade": grade,
        "reward": reward,
        "reels": [s1, s2, s3],
        "leaves": user_db.leaves,
        "played_today": 1,
    })

@login_required
@require_POST
def dismiss_season_reward(request):
    """월말정산 모달 확인 처리 — 미확인 클레임 중 가장 오래된 것을 shown=True 로 변경."""
    from .models import SeasonRewardClaim
    SeasonRewardClaim.objects.filter(user=request.user, shown=False).update(shown=True)
    return JsonResponse({"ok": True})

@login_required
def season_reward_debug(request):
    from django.conf import settings as django_settings
    if not django_settings.DEBUG:
        return JsonResponse({"error": "forbidden"}, status=403)
    from .models import SeasonRewardClaim
    rank = int(request.GET.get("rank", 1))
    reward = {1: 100, 2: 50, 3: 5}.get(rank, 100)
    SeasonRewardClaim.objects.create(
        user=request.user,
        season_label="2026년 06월",
        rank=rank,
        reward=reward,
    )
    from django.shortcuts import redirect
    return redirect(request.GET.get("next", "/"))
