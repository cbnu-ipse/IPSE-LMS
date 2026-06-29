import random
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db import transaction
from .models import SlotPlayLog, LobbyChatMessage, AppleGameScore
from accounts.models import User

# ─────────────────────────────────────────────────────────────────────────────
# 실물 슬롯머신 릴 구성 (Virtual Reel / Strip)
#
# 실제 슬롯머신은 "가상 릴(Virtual Reel)" 기법을 사용합니다.
# 물리 릴에는 예: 22개 심볼이 있지만, 가상 릴에는 수십~수백 칸이 매핑됩니다.
# 희귀 심볼일수록 가상 릴에서 적은 슬롯을 차지 → 낮은 확률.
#
# 심볼 ID:
#   0 = 🌱 새싹     (매우 흔함)
#   1 = 🍃 잎새     (흔함)
#   2 = 💻 코딩     (보통)
#   3 = ⚡ 번개     (다소 드묾)
#   4 = 🎯 챌린지   (드묾)
#   5 = 🚀 잭팟     (매우 드묾 - 잭팟)
#
# RTP(Return to Player) 목표: ~88% (실물 머신 평균 85~95%)
# ─────────────────────────────────────────────────────────────────────────────

# 가상 릴 스트립 (각 릴마다 다르게 설정해 독립 확률 구현)
VIRTUAL_REEL_1 = (
    [0]*12 + [1]*9 + [2]*7 + [3]*5 + [4]*3 + [5]*1  # 총 37칸
)
VIRTUAL_REEL_2 = (
    [0]*11 + [1]*9 + [2]*7 + [3]*5 + [4]*3 + [5]*1  # 총 36칸
)
VIRTUAL_REEL_3 = (
    [0]*10 + [1]*9 + [2]*7 + [3]*5 + [4]*3 + [5]*1  # 총 35칸
)

# 당첨 테이블 (3줄 일치 기준)
# { symbol_id: (grade, reward_leaves) }
WIN_TABLE = {
    5: ("S", 100),   # 💎💎💎 잭팟
    4: ("A", 30),    # ⭐⭐⭐
    3: ("B", 15),    # 🔔🔔🔔
    2: ("C", 8),     # 🍊🍊🍊
    1: ("D", 4),     # 🍋🍋🍋
    0: ("E", 2),     # 🍒🍒🍒
}


def _spin_reels():
    """
    3개 릴을 독립적으로 돌려 각 릴의 중앙 심볼 ID를 반환.
    실물 슬롯처럼 가상 릴 인덱스를 랜덤 선택.
    반환: (s1, s2, s3) — 각 릴 중앙에 보이는 심볼 ID
    """
    idx1 = random.randrange(len(VIRTUAL_REEL_1))
    idx2 = random.randrange(len(VIRTUAL_REEL_2))
    idx3 = random.randrange(len(VIRTUAL_REEL_3))
    return VIRTUAL_REEL_1[idx1], VIRTUAL_REEL_2[idx2], VIRTUAL_REEL_3[idx3]


def _evaluate(s1, s2, s3):
    """3 심볼이 모두 같으면 (grade, reward) 반환, 아니면 ('F', 0)"""
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
                "score": gv,  # community_ranking 템플릿 호환
            }
    rows = sorted(user_best.values(), key=lambda r: -r["grade_val"])
    return _assign_ranks(rows[:top_n], "grade_val")


def get_apple_ranking(top_n=10):
    from django.db.models import Max
    qs = (
        AppleGameScore.objects
        .values("user")
        .annotate(best=Max("score"))
        .filter(best__gt=0)
        .order_by("-best")
    )
    user_ids = [entry["user"] for entry in qs]
    score_map = {entry["user"]: entry["best"] for entry in qs}
    users = User.objects.filter(pk__in=user_ids).select_related("student")
    rows = [{"user": u, "score": score_map[u.pk]} for u in users]
    rows.sort(key=lambda r: -r["score"])
    return _assign_ranks(rows[:top_n], "score")


# ─────────────────────────────────────────────────────────────────────────────

@login_required
def apple_game_view(request):
    """사과게임 (합 10 퍼즐)"""
    latest = LobbyChatMessage.objects.select_related("user").order_by("-created_at")[:50]
    chat_messages = list(latest)[::-1]
    return render(request, "game/apple_game.html", {"title": "사과게임", "chat_messages": chat_messages})


@login_required
@require_POST
def save_apple_score(request):
    """사과게임 점수 저장"""
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
    """사과게임 TOP 10 랭킹 JSON"""
    rows = get_apple_ranking(10)
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
    return JsonResponse({"ranking": data})


@login_required
def slot_ranking(request):
    """슬롯머신 TOP 10 랭킹 JSON"""
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
    """게임 서브도메인 전용 랭킹 페이지"""
    board = request.GET.get("board", "slot_game").strip()
    query = request.GET.get("q", "").strip()

    if board not in {"slot_game", "apple_game"}:
        board = "slot_game"

    BOARD_LABELS = {
        "slot_game": "슬롯머신 랭킹",
        "apple_game": "사과게임 랭킹",
    }
    board_label = BOARD_LABELS[board]

    if board == "slot_game":
        ranking_rows = get_slot_ranking(top_n=None)
    else:
        ranking_rows = get_apple_ranking(top_n=None)

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
    })


@login_required
def lobby_view(request):
    """게임 서브도메인의 로비 (Roblox 스타일 게임 목록)"""
    latest_messages = LobbyChatMessage.objects.select_related("user").order_by("-created_at")[:50]
    chat_messages = list(latest_messages)[::-1]
    context = {
        "title": "IPSE 놀이터",
        "chat_messages": chat_messages,
    }
    return render(request, "game/lobby.html", context)


@login_required
def slot_machine_view(request):
    """낙엽 슬롯머신 게임 페이지"""
    today = timezone.localdate()
    played_today_count = SlotPlayLog.objects.filter(user=request.user, played_date=today).count()

    latest = LobbyChatMessage.objects.select_related("user").order_by("-created_at")[:50]
    context = {
        "title": "낙엽 슬롯머신",
        "played_today_count": played_today_count,
        "chat_messages": list(latest)[::-1],
    }
    return render(request, "game/slot_machine.html", context)


@login_required
def slot_status(request):
    """현재 슬롯머신 플레이 상태 조회 API"""
    today = timezone.localdate()
    played_today_count = SlotPlayLog.objects.filter(user=request.user, played_date=today).count()
    return JsonResponse({
        "played_today": played_today_count,
        "leaves": request.user.leaves,
    })


@login_required
@require_POST
def slot_spin(request):
    """슬롯머신 스핀 구동 API (일일 1회 제한, 무료 제공)"""
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

        # 실물 슬롯머신 방식으로 결과 추첨
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

        SlotPlayLog.objects.create(
            user=user_db,
            result_grade=grade,
            result_reward=reward,
        )

        user_db.refresh_from_db()

        return JsonResponse({
            "status": "success",
            "grade": grade,
            "reward": reward,
            "reels": [s1, s2, s3],          # 실제 결과 심볼 ID
            "leaves": user_db.leaves,
            "played_today": played_today_count + 1,
        })


# ─── 디버그 전용: 강제 등급 스핀 (DEBUG=True 환경에서만 URL 등록됨) ────────────
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

    # 심볼 ID 매핑 (같은 심볼 3개로 구성)
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
