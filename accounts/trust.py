"""
사용자 신뢰도 (0~100). 여러 사람이 함께 쓰는 족보 학습(출제 스타일·통계)이 잘못 올린 과목·교수 이름이나 가짜 족보에 오염되지 않게 한다.

- 강의자는 저장값과 상관없이 항상 100이다 (effective). 일반 사용자는 50에서 시작한다.
- 신뢰도가 낮은(MIN_TO_LEARN 미만) 사용자의 족보는 학습에 쓰지 않는다. 업로드 자체는 막지 않는다 (오탐으로 정상 사용자가 막히지 않게).
  그 위는 신뢰도가 높을수록 한정된 족보 분량 안에서 먼저 쓰이고 통계에서 더 크게 센다 (weight: 처음 신뢰도 50이 1배, 강의자 100이 2배).
- 점수는 adjust()로만 바꾸고 변동마다 TrustEvent를 남긴다.
  · 강의자·관리자가 자료를 '맞음'으로 확인: +10 / '잘못됨': -25
  · 서버가 짐작한 구분과 사용자가 고른 구분이 일치하는 정상 업로드: +1 (PASSIVE_CAP까지만 — 100은 검토로만 올라간다)
"""
from django.conf import settings
from django.db import transaction

from .models import TrustEvent, User

START = 50
MIN_TO_LEARN = getattr(settings, "TRUST_MIN_TO_LEARN", 40)
APPROVED_DELTA = 10
REJECTED_DELTA = -25
PASSIVE_DELTA = 1
PASSIVE_CAP = 70


def effective(user):
    """실제로 쓰는 신뢰도: 강의자는 항상 100."""
    if user is None:
        return 0
    return 100 if getattr(user, "is_lecturer", False) else int(getattr(user, "trust_score", START))


def weight(user):
    """통계에서 이 사용자의 족보를 세는 크기: 처음 신뢰도(50)면 1, 강의자(100)면 2, 낮으면 그보다 작다."""
    return effective(user) / START


def trusted_for_learning(user):
    return effective(user) >= MIN_TO_LEARN


def adjust(user, delta, reason, document=None, actor=None, cap=100):
    """신뢰도를 delta만큼 바꾼다 (0~cap으로 제한, cap보다 높으면 올리지 않는다). 강의자는 항상 100이라 바꾸지 않는다. 바뀐 점수를 돌려준다."""
    if getattr(user, "is_lecturer", False):
        return 100
    with transaction.atomic():
        locked = User.objects.select_for_update().get(pk=user.pk)
        score = locked.trust_score
        new = max(0, min(score + delta, max(cap, score) if delta > 0 else 100))
        if new == score:
            return score
        locked.trust_score = new
        locked.save(update_fields=["trust_score"])
        TrustEvent.objects.create(user=locked, delta=new - score, score_after=new, reason=reason[:100],
                                  document_id=getattr(document, "pk", None), actor=actor)
    user.trust_score = new
    return new


def reward_clean_upload(user, document=None):
    return adjust(user, PASSIVE_DELTA, "구분이 맞는 정상 업로드", document=document, cap=PASSIVE_CAP)
