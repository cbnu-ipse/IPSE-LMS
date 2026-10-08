"""
트릭 오어 트릿 — 할로윈 이벤트 사탕(🍬)을 얻는 놀이터 게임.

한 판:
  - 매 단계 집 3채(환한 호박집 / 촛불 켜진 집 / 으스스한 폐가, 자리는 무작위)가 나오고 하나를 두드린다.
    집마다 주는 사탕과 유령이 나올 확률이 다르고(화면에 그대로 보여준다), 집을 두드릴수록 골목이
    으스스해져 유령 확률이 조금씩 오른다.
  - 사탕이면 자루에 담고 계속, 가끔 왕사탕(2배). 유령이면 자루를 통째로 뺏기고 판이 끝난다.
  - 언제든 "집으로 가기"로 자루를 챙긴다 — 하루 사탕 상한(accounts.treats) 안에서만 실제로 받는다.
결과는 모두 서버가 정한다 (클라이언트는 고른 집 번호만 보낸다). 플레이 횟수 제한은 없다.
"""
import random

from django.db import transaction

from accounts import treats
from .models import TrickOrTreatLog, TrickOrTreatRun

HOUSES = {
    "pumpkin": {"label": "환한 호박집", "emoji": "🎃", "treat": 1, "risk": 0.12},
    "candle": {"label": "촛불 켜진 집", "emoji": "🕯️", "treat": 2, "risk": 0.25},
    "haunted": {"label": "으스스한 폐가", "emoji": "🏚️", "treat": 4, "risk": 0.45},
}
RISK_PER_STEP = 0.03     # 집을 하나 두드릴 때마다 오르는 유령 확률
MAX_RISK = 0.9
BIG_TREAT_CHANCE = 0.08  # 왕사탕(2배)
_rng = random.SystemRandom()


def risk_of(kind, step):
    return min(MAX_RISK, HOUSES[kind]["risk"] + RISK_PER_STEP * step)


def _new_offers(rng=None):
    kinds = list(HOUSES)
    (rng or _rng).shuffle(kinds)
    return kinds


def state_for(user):
    run = TrickOrTreatRun.objects.filter(user=user).first()
    active = treats.event_active()
    return {
        "event_active": active,
        "treats": user.__class__.objects.filter(pk=user.pk).values_list("treats", flat=True).first() or 0,
        "remaining_today": treats.remaining_today(user) if active else 0,
        "daily_cap": treats.TREAT_DAILY_CAP,
        "run": None if not run else {
            "bag": run.bag, "step": run.step,
            "houses": [dict(kind=k, label=HOUSES[k]["label"], emoji=HOUSES[k]["emoji"], treat=HOUSES[k]["treat"],
                            risk=round(risk_of(k, run.step) * 100)) for k in run.offers],
        },
    }


def start(user):
    if not treats.event_active():
        return False, "할로윈 이벤트가 끝났어요."
    with transaction.atomic():
        run, created = TrickOrTreatRun.objects.select_for_update().get_or_create(
            user=user, defaults={"offers": _new_offers()})
    return True, None


def knock(user, index, rng=None):
    """index번째 집을 두드린다. (ok, 결과 dict 또는 오류 메시지)"""
    rng = rng or _rng
    if not treats.event_active():
        return False, "할로윈 이벤트가 끝났어요."
    try:
        index = int(index)
    except (TypeError, ValueError):
        return False, "잘못된 요청입니다."
    with transaction.atomic():
        run = TrickOrTreatRun.objects.select_for_update().filter(user=user).first()
        if not run:
            return False, "진행 중인 판이 없습니다."
        if not 0 <= index < len(run.offers):
            return False, "잘못된 요청입니다."
        kind = run.offers[index]
        if rng.random() < risk_of(kind, run.step):
            TrickOrTreatLog.objects.create(user=user, bag=run.bag, steps=run.step + 1, result="ghost")
            lost = run.bag
            run.delete()
            return True, {"outcome": "ghost", "kind": kind, "lost": lost}
        gained = HOUSES[kind]["treat"]
        big = rng.random() < BIG_TREAT_CHANCE
        if big:
            gained *= 2
        run.bag += gained
        run.step += 1
        run.offers = _new_offers(rng)
        run.save(update_fields=["bag", "step", "offers"])
    return True, {"outcome": "treat", "kind": kind, "gained": gained, "big": big}


def go_home(user):
    """자루를 챙긴다: 하루 상한 안에서 사탕을 받는다. (ok, {"bag", "granted"})"""
    with transaction.atomic():
        run = TrickOrTreatRun.objects.select_for_update().filter(user=user).first()
        if not run:
            return False, "진행 중인 판이 없습니다."
        bag, steps = run.bag, run.step
        granted = treats.grant(user, bag, "trick_or_treat", f"트릭 오어 트릿 ({steps}집, 자루 {bag}개)") if bag else 0
        TrickOrTreatLog.objects.create(user=user, bag=bag, steps=steps, result="home", granted=granted)
        run.delete()
    return True, {"bag": bag, "granted": granted}
