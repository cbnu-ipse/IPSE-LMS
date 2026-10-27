"""
AI 주간 사용 한도 (크레딧 대신). 사용자마다 매주 월요일 0시(KST)에 초기화되는 한도 안에서만 AI 기능을 쓸 수 있다.

- 사용량은 AI를 실제로 부른 기록(AIUsage)의 토큰을 모델 단가(AI_MODEL_PRICES)로 환산한 '점수'를 합친 것이다.
  점수 1 = AI_POINT_USD(약 0.0018달러). 한도는 AI_WEEKLY_LIMIT_POINTS점이고, 화면에는 % 게이지로 보여 준다.
- 호출 전에는 이미 한도를 다 썼는지(또는 시작하려는 작업이 남은 한도를 넘는지)만 확인한다. 호출은 끝까지 가고 그만큼이 사용량에 더해진다.
- 강의자와 시스템 작업(user=None)은 한도가 없다 (core.ai._is_exempt).
- 작업의 예상 점수는 AI_CREDIT_COSTS(AI_COST_<작업>)를 쓴다. 비용 표시·시작 전 확인용이고, 실제 사용량은 토큰으로 센다.
"""
from datetime import timedelta

from django.conf import settings
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


def info(user, now=None):
    """화면에 보일 사용량 {used, limit, percent(0~100 정수), label, remaining, reset_at}. 한도가 없는 사용자(강의자 등)는 None."""
    from .ai import _is_exempt

    if _is_exempt(user) or not getattr(user, "pk", None):
        return None
    limit = limit_points()
    used = used_points(user, now)
    return {
        "used": used, "limit": limit, "remaining": max(limit - used, 0),
        "percent": min(int(used / limit * 100), 100) if limit else 0, "label": percent_label(used, limit),
        "reset_at": next_reset(now),
    }
