"""
AI 주간 사용 한도. 사용자마다 매주 월요일 0시(KST)에 초기화되는 한도 안에서만 AI 기능을 쓸 수 있다.

- 사용량은 AI를 실제로 부른 기록(AIUsage)의 토큰을 모델 단가(AI_MODEL_PRICES)로 환산한 '점수'를 합친 것이다.
  점수 1 = AI_POINT_USD(약 0.0018달러). 한도는 AI_WEEKLY_LIMIT_POINTS점이고, 화면에는 % 게이지로 보여 준다.
- 호출 전에는 이미 한도를 다 썼는지(또는 시작하려는 작업이 남은 한도를 넘는지)만 확인한다. 호출은 끝까지 가고 그만큼이 사용량에 더해진다.
- 강의자와 시스템 작업(user=None)은 한도가 없다 (core.ai._is_exempt). 강의자도 사용량은 볼 수 있다(100%를 넘어도 막히지 않을 뿐).
- 한도를 넘은 만큼은 크레딧(User.credits, 1크레딧 = 1점)으로 낸다. 크레딧은 이월되고 만료되지 않으며, 지급은 관리자(accounts/grants.py)·보상 코드가 한다.
  호출이 끝나 사용량이 기록될 때마다 settle_overage()가 '이번 주 초과 점수(올림) - 이번 주 이미 낸 크레딧'을 잔액 안에서 차감한다.
  잔액이 모자라도 이미 진행 중인 호출은 끊지 않는다 (남은 만큼만 내고, 모자란 분은 다음에 크레딧이 생기면 이어서 낸다).
- 작업의 예상 점수는 AI_CREDIT_COSTS(AI_COST_<작업>)를 쓴다. 비용 표시·시작 전 확인용이고, 실제 사용량은 토큰으로 센다.
"""
import math
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone


def week_start(now=None):
    """이번 주 월요일 0시 (KST)."""
    local = timezone.localtime(now or timezone.now())
    return (local - timedelta(days=local.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)


def next_reset(now=None):
    return week_start(now) + timedelta(days=7)


def price_for(model):
    """(입력, 출력, 캐시 입력) 100만 토큰당 달러. 모르는 모델은 비싼 쪽(AI_DEFAULT_PRICE)으로 센다."""
    return settings.AI_MODEL_PRICES.get(model) or settings.AI_DEFAULT_PRICE


def points_for_tokens(model, prompt_tokens, cached_tokens, completion_tokens):
    price_in, price_out, price_cached = price_for(model)
    fresh = max((prompt_tokens or 0) - (cached_tokens or 0), 0)
    usd = (fresh * price_in + (cached_tokens or 0) * price_cached + (completion_tokens or 0) * price_out) / 1_000_000
    return usd / settings.AI_POINT_USD


def used_points(user, now=None):
    from .models import AIUsage

    rows = (AIUsage.objects.filter(user=user, created_at__gte=week_start(now))
            .values("model").annotate(p=Sum("prompt_tokens"), c=Sum("cached_tokens"), o=Sum("completion_tokens")))
    return sum(points_for_tokens(r["model"], r["p"], r["c"], r["o"]) for r in rows)


def limit_points():
    return settings.AI_WEEKLY_LIMIT_POINTS


def percent_label(points, limit=None):
    """점수를 한도 대비 %로: 1% 미만은 '<1', 10% 미만은 소수 한 자리, 그 이상은 정수."""
    limit = limit or limit_points()
    if not limit:
        return "0"
    pct = points / limit * 100
    if pct <= 0:
        return "0"
    if pct < 1:
        return "<1"
    return f"{pct:.1f}" if pct < 10 else str(round(pct))


def credit_balance(user):
    from accounts.models import User

    return User.objects.filter(pk=user.pk).values_list("credits", flat=True).first() or 0


def overage_points(user, now=None):
    """이번 주 한도를 넘어 쓴 점수 (올림)."""
    return math.ceil(max(used_points(user, now) - limit_points(), 0) - 1e-9)


def credits_paid(user, now=None):
    """이번 주 초과분으로 이미 낸 크레딧."""
    from accounts.models import CreditTransaction

    total = CreditTransaction.objects.filter(user=user, transaction_type="ai_usage", created_at__gte=week_start(now)).aggregate(s=Sum("amount"))["s"]
    return -(total or 0)


def settle_overage(user, now=None):
    """한도를 넘어 쓴 만큼의 크레딧을 잔액 안에서 차감한다 (낸 만큼은 다시 내지 않아 몇 번을 불러도 안전). 낸 크레딧을 돌려준다."""
    from accounts import credits
    from accounts.models import User

    with transaction.atomic():
        User.objects.select_for_update().get(pk=user.pk)       # 같은 사용자의 정산이 겹쳐 두 번 차감되지 않게 줄 세운다
        due = overage_points(user, now) - credits_paid(user, now)
        pay = min(due, credit_balance(user))
        if pay <= 0:
            return 0
        credits.spend(user, pay, "ai_usage", f"AI 주간 사용 한도 초과분 {pay}점")
        return pay


def info(user, now=None):
    """화면에 보일 사용량 {used, limit, remaining, percent(막대용 0~100 정수), label, reset_at, unlimited,
    credits(크레딧 잔액), overage(이번 주 한도 초과 점수), using_credits(한도를 넘어 크레딧을 쓰는 중), available(한도+크레딧으로 더 쓸 수 있는 점수)}.
    강의자도 사용량을 볼 수 있다 (한도가 없어 100%를 넘어도 막히지 않을 뿐: unlimited=True, label은 100을 넘을 수 있다).
    시스템 작업(user=None)은 None."""
    from .ai import _is_exempt

    if not getattr(user, "pk", None):
        return None
    limit = limit_points()
    used = used_points(user, now)
    credits_left = credit_balance(user)
    overage = overage_points(user, now)
    debt = max(overage - credits_paid(user, now), 0)       # 이미 넘게 썼는데 크레딧이 모자라 아직 못 낸 분
    return {
        "credits": credits_left, "using_credits": used > limit, "overage": overage,
        "used": used, "limit": limit, "remaining": max(limit - used, 0),
        "available": max(max(limit - used, 0) + credits_left - debt, 0),
        "percent": min(int(used / limit * 100), 100) if limit else 0, "label": percent_label(used, limit),
        "reset_at": next_reset(now), "unlimited": _is_exempt(user),
    }
