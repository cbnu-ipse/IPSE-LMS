"""
할로윈 이벤트 사탕(🍬 treat).

- 기간: 배포 시점부터 TREAT_EVENT_END(2026-10-31 00:00 KST, 30일 → 31일 넘어가는 자정)까지.
- 얻는 곳: 방명록(하루 첫 글, 낙엽 대신) + 놀이터 "트릭 오어 트릿" 게임. 둘을 합쳐 하루(KST) TREAT_DAILY_CAP개까지.
- 순위: 마감 시각까지 받은 사탕 합계 TOP 10 (운영진 포함). 동점이면 그 점수에 먼저 도달한 사람이 앞선다.
- 환전: 기간 중엔 불가. 끝난 뒤 사탕 1 = 낙엽 1.
"""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.db import transaction
from django.db.models import Max, Sum
from django.utils import timezone

KST = ZoneInfo("Asia/Seoul")
TREAT_EVENT_END = datetime(2026, 10, 31, 0, 0, tzinfo=KST)
TREAT_DAILY_CAP = 10
TREAT_GUESTBOOK = 2           # 방명록 하루 첫 글
TREAT_TO_LEAF_RATE = 1        # 이벤트 후 사탕 1개 = 낙엽 1개
TREAT_RANKING_SIZE = 10


def event_active(now=None):
    return (now or timezone.now()) < TREAT_EVENT_END


def _kst_day_start(now=None):
    local = (now or timezone.now()).astimezone(KST)
    return local.replace(hour=0, minute=0, second=0, microsecond=0)


def earned_today(user, now=None):
    from .models import TreatTransaction
    start = _kst_day_start(now)
    return TreatTransaction.objects.filter(
        user=user, amount__gt=0, created_at__gte=start, created_at__lt=start + timedelta(days=1),
    ).aggregate(s=Sum("amount"))["s"] or 0


def remaining_today(user, now=None):
    return max(0, TREAT_DAILY_CAP - earned_today(user, now))


def grant(user, amount, transaction_type, description=""):
    """이벤트 기간이면 하루 상한 안에서 사탕을 준다. 실제로 준 개수를 반환 (기간 밖이거나 상한이면 0).
    호출하는 쪽 트랜잭션 안에서 불러도 되고, 같은 유저의 동시 지급은 유저 행 잠금으로 직렬화한다."""
    from .models import TreatTransaction, User
    if amount <= 0 or not event_active():
        return 0
    with transaction.atomic():
        u = User.objects.select_for_update().get(pk=user.pk)
        given = min(amount, remaining_today(u))
        if given <= 0:
            return 0
        TreatTransaction.objects.create(user=u, amount=given, transaction_type=transaction_type, description=description)
        u.treats += given
        u.save(update_fields=["treats"])
    user.treats = u.treats
    return given


def exchange_to_leaves(user, amount):
    """이벤트가 끝난 뒤 사탕을 낙엽으로 바꾼다. (ok, 메시지)"""
    from .models import TreatTransaction, User
    if event_active():
        return False, "사탕은 이벤트가 끝난 뒤(10월 31일 0시부터) 낙엽으로 바꿀 수 있어요."
    try:
        amount = int(amount)
    except (TypeError, ValueError):
        return False, "바꿀 사탕 수가 올바르지 않습니다."
    if amount <= 0:
        return False, "바꿀 사탕 수가 올바르지 않습니다."
    with transaction.atomic():
        u = User.objects.select_for_update().get(pk=user.pk)
        if u.treats < amount:
            return False, "가진 사탕보다 많이 바꿀 수 없습니다."
        u.treats -= amount
        u.save(update_fields=["treats"])
        TreatTransaction.objects.create(user=u, amount=-amount, transaction_type="exchange",
                                        description=f"낙엽 {amount * TREAT_TO_LEAF_RATE}개로 환전")
        u.adjust_leaves(amount * TREAT_TO_LEAF_RATE, "treat_exchange", f"사탕 {amount}개 환전")
    return True, f"사탕 {amount}개를 낙엽 {amount * TREAT_TO_LEAF_RATE}개로 바꿨어요."


def ranking(limit=None):
    """마감 시각까지 받은 사탕 합계 순위. [{"rank", "user", "treats", "reached_at"}]
    (기간 중엔 환전이 없어 합계 = 보유량, 끝난 뒤 환전해도 순위는 그대로)"""
    from .models import TreatTransaction, User
    rows = (TreatTransaction.objects.filter(amount__gt=0, created_at__lt=TREAT_EVENT_END)
            .values("user_id").annotate(total=Sum("amount"), reached_at=Max("created_at"))
            .filter(total__gt=0).order_by("-total", "reached_at"))
    if limit:
        rows = rows[:limit]
    rows = list(rows)
    users = User.objects.select_related("student").in_bulk([r["user_id"] for r in rows])
    out = []
    for i, r in enumerate(rows):
        u = users.get(r["user_id"])
        if u:
            out.append({"rank": i + 1, "user": u, "treats": r["total"], "reached_at": r["reached_at"]})
    return out


def my_rank(user):
    for row in ranking():
        if row["user"].pk == user.pk:
            return row["rank"]
    return None
