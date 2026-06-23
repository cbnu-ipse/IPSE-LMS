import random
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db import transaction
from .models import SlotPlayLog
from accounts.models import User, LeafTransaction

@login_required
def lobby_view(request):
    """게임 서브도메인의 로비 (Roblox 스타일 게임 목록)"""
    context = {
        "title": "IPSE 놀이터",
    }
    return render(request, "game/lobby.html", context)

@login_required
def slot_machine_view(request):
    """학점 캡슐 슬롯머신 게임 페이지"""
    today = timezone.localdate()
    played_today_count = SlotPlayLog.objects.filter(user=request.user, played_date=today).count()
    remaining_count = max(0, 5 - played_today_count)

    context = {
        "title": "학점 캡슐 슬롯머신",
        "remaining_count": remaining_count,
        "played_today_count": played_today_count,
    }
    return render(request, "game/slot_machine.html", context)

@login_required
def slot_status(request):
    """현재 슬롯머신 플레이 상태 조회 API"""
    today = timezone.localdate()
    played_today_count = SlotPlayLog.objects.filter(user=request.user, played_date=today).count()
    remaining_count = max(0, 5 - played_today_count)
    return JsonResponse({
        "played_today": played_today_count,
        "remaining": remaining_count,
        "leaves": request.user.leaves,
    })

@login_required
@require_POST
def slot_spin(request):
    """슬롯머신 스핀 구동 API (일일 1회 제한, 무료 제공)"""
    user = request.user
    today = timezone.localdate()

    with transaction.atomic():
        # 1. 락을 걸고 사용자 정보 조회 및 검증
        user_db = User.objects.select_for_update().get(id=user.id)
        
        played_today_count = SlotPlayLog.objects.filter(user=user_db, played_date=today).count()
        
        # 1-1. 일일 1회 제한 검증
        if played_today_count >= 1:
            return JsonResponse({"status": "error", "message": "오늘은 이미 무료 캡슐 뽑기를 진행하셨습니다. 내일 다시 참여해 주세요!"}, status=400)

        cost = 0  # 1회 무료

        # 3. 보상 확률 추첨 (S: 0.01%, A: 1%, B: 10%, F: 88.99%)
        rand_val = random.uniform(0, 100)
        
        if rand_val <= 0.01:
            grade = "S"
            reward = 100
            description = "슬롯머신 대박 당첨 (S등급)"
        elif rand_val <= 1.01: # 0.01 ~ 1.01 (1% 구간)
            grade = "A"
            reward = 50
            description = "슬롯머신 당첨 (A등급)"
        elif rand_val <= 11.01: # 1.01 ~ 11.01 (10% 구간)
            grade = "B"
            reward = 5
            description = "슬롯머신 당첨 (B등급)"
        else:
            grade = "F"
            reward = 0
            description = "슬롯머신 꽝"

        # 4. 당첨 시 보상 낙엽 지급 및 트랜잭션 기록
        if reward > 0:
            user_db.adjust_leaves(reward, "SLOT_MACHINE_REWARD", description)

        # 5. 플레이 로그 생성
        log = SlotPlayLog.objects.create(
            user=user_db,
            result_grade=grade,
            result_reward=reward
        )

        # 6. 최종 갱신된 사용자의 낙엽 수량 조회
        user_db.refresh_from_db()

        # 프론트엔드 릴 애니메이션 매칭용 인덱스 생성
        reels = []
        if grade == "S":
            reels = [0, 0, 0] # 황금 은행잎
        elif grade == "A":
            reels = [1, 1, 1] # 초록 단풍잎
        elif grade == "B":
            reels = [2, 2, 2] # 붉은 단풍잎
        else:
            # 꽝일 때는 무작위로 릴 설정 (세 개가 동일하지 않도록)
            while True:
                r1 = random.choice([0, 1, 2, 3])
                r2 = random.choice([0, 1, 2, 3])
                r3 = random.choice([0, 1, 2, 3])
                if not (r1 == r2 == r3):
                    reels = [r1, r2, r3]
                    break

        return JsonResponse({
            "status": "success",
            "grade": grade,
            "reward": reward,
            "reels": reels,
            "leaves": user_db.leaves,
            "played_today": played_today_count + 1,
            "cost": cost,
        })
