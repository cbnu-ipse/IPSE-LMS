import random
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db import transaction
from .models import SlotPlayLog, LobbyChatMessage
from accounts.models import User, LeafTransaction

# ─────────────────────────────────────────────────────────────────────────────
# 실물 슬롯머신 릴 구성 (Virtual Reel / Strip)
#
# 실제 슬롯머신은 "가상 릴(Virtual Reel)" 기법을 사용합니다.
# 물리 릴에는 예: 22개 심볼이 있지만, 가상 릴에는 수십~수백 칸이 매핑됩니다.
# 희귀 심볼일수록 가상 릴에서 적은 슬롯을 차지 → 낮은 확률.
#
# 심볼 ID:
#   0 = 🍒 체리     (매우 흔함)
#   1 = 🍋 레몬     (흔함)
#   2 = 🍊 오렌지   (보통)
#   3 = 🔔 벨       (다소 드묾)
#   4 = ⭐ 스타     (드묾)
#   5 = 💎 다이아   (매우 드묾 - 잭팟)
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


# ─────────────────────────────────────────────────────────────────────────────

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

    is_embedded = request.GET.get("embed", "false").lower() == "true"

    context = {
        "title": "낙엽 슬롯머신",
        "played_today_count": played_today_count,
        "is_embedded": is_embedded,
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