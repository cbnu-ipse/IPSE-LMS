"""
권한이 있는 사람이 홈페이지에서 회원에게 재화(낙엽·크레딧)를 지급한다.

- 지급 권한: 관리자 계정이거나 Django 권한 accounts.grant_currency를 가진 사람 (관리자 화면의 사용자/그룹에서 부여).
- 한 번에 지급할 수 있는 양에 상한이 있다 (settings.CURRENCY_GRANT_MAX). 자기 자신에게는 지급할 수 없다.
- 지급은 잔액 변경(낙엽·크레딧 원장)과 지급 기록(CurrencyGrant)을 한 트랜잭션으로 처리하고, 받은 사람에게 알림을 보낸다.
  받은 사람이 접속하면 확인 창이 한 번 뜬다 (templates/base.html).
"""
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from . import credits
from .friends import notify
from .models import CurrencyGrant, User

PERMISSION = "accounts.grant_currency"


class GrantError(ValueError):
    """사용자에게 그대로 보여줘도 되는 지급 실패 사유."""


def can_grant(user):
    return bool(getattr(user, "is_authenticated", False) and user.is_active and (user.is_superuser or user.has_perm(PERMISSION)))


def search_recipients(query, limit=8):
    """지급 대상 검색: 학번·이름·닉네임. 봇과 비활성 계정은 뺀다."""
    query = (query or "").strip()
    if not query:
        return []
    match = (Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query)
             | Q(student__nickname__icontains=query))
    return list(User.objects.filter(match, is_active=True, is_bot=False).select_related("student")
                .distinct().order_by("username")[:limit])


def grant_currency(grantor, recipient, currency, amount, reason=""):
    """재화를 지급하고 알림을 보낸다. 실패하면 GrantError."""
    if not can_grant(grantor):
        raise GrantError("재화를 지급할 권한이 없습니다.")
    if currency not in CurrencyGrant.Currency.values:
        raise GrantError("지급할 재화를 선택해주세요.")
    try:
        amount = int(amount)
    except (TypeError, ValueError):
        raise GrantError("수량을 숫자로 입력해주세요.")
    maximum = settings.CURRENCY_GRANT_MAX[currency]
    if not 1 <= amount <= maximum:
        raise GrantError(f"한 번에 1~{maximum}개까지 지급할 수 있습니다.")
    if recipient.pk == grantor.pk:
        raise GrantError("자기 자신에게는 지급할 수 없습니다.")
    if not recipient.is_active or recipient.is_bot:
        raise GrantError("지급할 수 없는 계정입니다.")
    reason = (reason or "").strip()[:100]
    label = CurrencyGrant.Currency(currency).label
    description = f"{grantor.display_name} 지급" + (f": {reason}" if reason else "")
    with transaction.atomic():
        if currency == CurrencyGrant.Currency.CREDIT:
            credits.grant(recipient, amount, "admin_grant", description)
        else:
            recipient.adjust_leaves(amount, "admin_grant", description)
        grant = CurrencyGrant.objects.create(recipient=recipient, granted_by=grantor, currency=currency,
                                             amount=amount, reason=reason)
    try:
        notify(recipient, grantor, "currency_grant",
               f"{label} {amount}개가 지급되었어요" + (f" ({reason})" if reason else ""), link="/accounts/profile/")
    except Exception:       # 알림 실패가 이미 끝난 지급을 되돌리지 않게
        pass
    return grant


def pending_for(user, limit=5):
    """아직 안내 창으로 보여 주지 않은 지급 내역 (오래된 순)."""
    return list(CurrencyGrant.objects.filter(recipient=user, seen_at__isnull=True).select_related("granted_by")
                .order_by("id")[:limit])


def mark_seen(user):
    return CurrencyGrant.objects.filter(recipient=user, seen_at__isnull=True).update(seen_at=timezone.now())
