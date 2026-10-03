"""
회원 상태 변경: 졸업생 전환(신청 → 운영진 승인), 회원탈퇴(모든 데이터 삭제).

    POST /accounts/graduation/apply/            졸업생 전환 신청 (운영진에게 알림)
    POST /accounts/graduation/cancel/           대기 중인 내 신청 취소
    GET  /accounts/graduation-requests/         운영진: 신청 목록
    POST /accounts/graduation-requests/<id>/    운영진: 승인/거절 (신청자에게 알림)
    GET/POST /accounts/withdraw/                회원탈퇴 (비밀번호 + 확인 문구)
"""
import logging

from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .friends import notify
from .models import GraduationRequest, User

logger = logging.getLogger(__name__)

WITHDRAW_CONFIRM_TEXT = "회원탈퇴"
GRADUATION_REQUESTS_LINK = "/accounts/graduation-requests/"
PROFILE_LINK = "/accounts/profile/"


def can_review_graduation(user):
    return user.is_authenticated and (
        user.is_superuser or user.is_staff or user.is_president or user.is_vice_president or user.is_executive
    )


def _reviewers():
    return User.objects.filter(is_active=True, is_bot=False).filter(
        Q(is_superuser=True) | Q(is_president=True) | Q(is_vice_president=True) | Q(is_executive=True)
    )


# ── 졸업생 전환 ──────────────────────────────────────────────────────────────

@login_required
@require_POST
def graduation_apply(request):
    user = request.user
    if user.is_graduate:
        messages.info(request, "이미 졸업생입니다.")
        return redirect("profile")
    with transaction.atomic():
        User.objects.select_for_update().get(pk=user.pk)
        if GraduationRequest.objects.filter(user=user, status="pending").exists():
            messages.info(request, "이미 신청해 운영진 승인을 기다리는 중입니다.")
            return redirect("profile")
        GraduationRequest.objects.create(user=user, message=(request.POST.get("message") or "").strip()[:200])
        for reviewer in _reviewers().exclude(pk=user.pk):
            notify(reviewer, user, "graduation_request",
                   f"{user.display_chat_name}님이 졸업생 전환을 신청했어요.", GRADUATION_REQUESTS_LINK)
    messages.success(request, "졸업생 전환을 신청했습니다. 운영진이 승인하면 알림으로 알려드려요.")
    return redirect("profile")


@login_required
@require_POST
def graduation_cancel(request):
    GraduationRequest.objects.filter(user=request.user, status="pending").delete()
    messages.success(request, "졸업생 전환 신청을 취소했습니다.")
    return redirect("profile")


@login_required
def graduation_requests(request):
    if not can_review_graduation(request.user):
        return HttpResponseForbidden("운영진만 볼 수 있습니다.")
    qs = GraduationRequest.objects.select_related("user", "user__student", "reviewed_by")
    return render(request, "accounts/graduation_requests.html", {
        "title": "졸업생 전환 신청",
        "pending": qs.filter(status="pending").order_by("created_at"),
        "processed": qs.exclude(status="pending")[:30],
    })


@login_required
@require_POST
def graduation_review(request, request_id):
    if not can_review_graduation(request.user):
        return HttpResponseForbidden("운영진만 처리할 수 있습니다.")
    approve = request.POST.get("action") == "approve"
    with transaction.atomic():
        req = get_object_or_404(GraduationRequest.objects.select_for_update(), pk=request_id)
        if req.status != "pending":
            messages.info(request, "이미 처리된 신청입니다.")
            return redirect("graduation_requests")
        req.status = "approved" if approve else "rejected"
        req.reviewed_by = request.user
        req.reviewed_at = timezone.now()
        req.save(update_fields=["status", "reviewed_by", "reviewed_at"])
        if approve:
            User.objects.filter(pk=req.user_id).update(is_graduate=True, graduated_at=timezone.now())
        notify(req.user, request.user, "graduation_result",
               "졸업생 전환이 승인되었어요. 이제 이름 옆에 졸업생 마크가 표시됩니다." if approve
               else "졸업생 전환 신청이 반려되었어요. 궁금한 점은 운영진에게 문의해주세요.", PROFILE_LINK)
    messages.success(request, f"{req.user.display_chat_name}님의 신청을 {'승인' if approve else '반려'}했습니다.")
    return redirect("graduation_requests")


# ── 회원탈퇴 ─────────────────────────────────────────────────────────────────

def withdraw_blockers(user):
    """탈퇴 전에 운영진에게 넘겨야 하는 것들. 비어 있으면 탈퇴 가능."""
    from course.models import Course
    from game.models import GostopSeat, PokerSeat, YachtSeat
    from problems.models import Problem
    reasons = []
    if user.is_superuser or user.is_staff:
        reasons.append("관리자 계정은 탈퇴할 수 없습니다. 다른 관리자에게 권한을 넘긴 뒤 관리자 페이지에서 정리해주세요.")
    if Course.objects.filter(instructor=user).exists():
        reasons.append("담당 중인 강의가 있습니다. 운영진에게 강의 담당자 변경을 요청해주세요.")
    if Problem.objects.filter(author_id=user.pk).exists():
        reasons.append("출제한 저지 문제가 있습니다. 운영진에게 출제자 변경을 요청해주세요.")
    if PokerSeat.objects.filter(user=user).exists() or GostopSeat.objects.filter(user=user).exists() \
            or YachtSeat.objects.filter(user=user).exists():
        reasons.append("놀이터 게임 방에 앉아 있습니다. 방에서 나간 뒤 다시 시도해주세요.")
    return reasons


def delete_user_completely(user):
    """회원과 관련된 데이터를 모두 지운다.
    대부분은 User 삭제에 연쇄(CASCADE)로 지워지고, 연쇄되지 않는 것(저지 DB 기록, 익명 처리로 남는
    설문 응답)과 개인 파일(프로필 사진, 인증 서류)은 여기서 직접 지운다."""
    from community.models import SurveyResponse
    from contest.models import ContestParticipant, ContestSubmission
    from problems.models import ProblemComment, SolveRecord
    uid = user.pk
    # 저지 DB(beta_judge)는 별도 DB라 연쇄 삭제가 닿지 않는다
    for model in (ContestSubmission, ContestParticipant, SolveRecord):
        model.objects.filter(user_id=uid).delete()
    ProblemComment.objects.filter(author_id=uid).delete()
    files = []
    if user.picture and user.picture.name and user.picture.name != "default.png":
        files.append(user.picture)
    student = getattr(user, "student", None) if hasattr(user, "student") else None
    if student and student.verification_document:
        files.append(student.verification_document)
    with transaction.atomic():
        SurveyResponse.objects.filter(respondent_id=uid).delete()
        User.objects.get(pk=uid).delete()
    for f in files:
        try:
            f.storage.delete(f.name)
        except Exception:
            logger.warning("withdraw: failed to delete file %s", f.name)


@login_required
def withdraw(request):
    user = request.user
    blockers = withdraw_blockers(user)
    if request.method == "POST" and not blockers:
        if not user.check_password(request.POST.get("password") or ""):
            messages.error(request, "비밀번호가 올바르지 않습니다.")
        elif (request.POST.get("confirm") or "").strip() != WITHDRAW_CONFIRM_TEXT:
            messages.error(request, f"확인 문구 '{WITHDRAW_CONFIRM_TEXT}'를 정확히 입력해주세요.")
        else:
            logout(request)
            delete_user_completely(user)
            messages.success(request, "회원탈퇴가 완료되었습니다. 그동안 함께해주셔서 감사합니다.")
            return redirect("/")
    return render(request, "accounts/withdraw.html", {
        "title": "회원탈퇴", "blockers": blockers, "confirm_text": WITHDRAW_CONFIRM_TEXT,
    })
