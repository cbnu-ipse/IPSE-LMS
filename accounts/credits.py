"""
학습 모듈(judge 사이트)에서 쓰는 재화 "크레딧".

- 낙엽·사탕과 별개의 재화다. 잔액은 User.credits, 모든 변동은 CreditTransaction 원장에 남는다.
- 잔액 변경과 원장 기록은 한 트랜잭션에서 유저 행을 잠근 채 처리해, 동시에 써도 잔액이 어긋나지 않는다.
- 획득 경로(문제 풀이 보상 등)는 아직 없다. 경로가 생기면 그쪽에서 grant()를, 사용처에서 spend()를 부르면 된다.
"""
from django.db import transaction

from .models import CreditTransaction, User

GENESIS = "genesis"


class InsufficientCredits(ValueError):
    pass


def _apply(user, amount, transaction_type, description):
    """유저 행을 잠그고 잔액을 바꾼 뒤 원장에 한 줄 남긴다. 새 잔액을 반환하고 user 객체의 값도 갱신한다."""
    if not isinstance(amount, int) or isinstance(amount, bool) or amount == 0:
        raise ValueError("크레딧 수량이 올바르지 않습니다.")
    with transaction.atomic():
        locked = User.objects.select_for_update().get(pk=user.pk)
        balance = locked.credits + amount
        if balance < 0:
            raise InsufficientCredits("크레딧이 부족합니다.")
        last = CreditTransaction.objects.filter(user_id=locked.pk).order_by("-id").first()
        tx = CreditTransaction(user=locked, amount=amount, balance_after=balance,
                               transaction_type=transaction_type, description=description[:255],
                               previous_hash=last.hash if last else GENESIS)
        tx.hash = tx.calculate_hash()
        tx.save()
        locked.credits = balance
        locked.save(update_fields=["credits"])
    user.credits = balance
    return balance


def grant(user, amount, transaction_type, description=""):
    """크레딧을 준다 (amount > 0). 새 잔액을 반환한다."""
    if not isinstance(amount, int) or amount <= 0:
        raise ValueError("지급할 크레딧 수량이 올바르지 않습니다.")
    return _apply(user, amount, transaction_type, description)


def spend(user, amount, transaction_type, description=""):
    """크레딧을 쓴다 (amount > 0). 잔액이 모자라면 InsufficientCredits. 새 잔액을 반환한다."""
    if not isinstance(amount, int) or amount <= 0:
        raise ValueError("사용할 크레딧 수량이 올바르지 않습니다.")
    return _apply(user, -amount, transaction_type, description)


def verify_ledger(user):
    """원장의 해시 체인과 잔액 흐름이 끊기지 않았고 User.credits와 같은지 확인한다. 이상이 없으면 True."""
    prev_hash, balance = GENESIS, 0
    for tx in CreditTransaction.objects.filter(user_id=user.pk).order_by("id"):
        balance += tx.amount
        if tx.previous_hash != prev_hash or tx.hash != tx.calculate_hash() or tx.balance_after != balance:
            return False
        prev_hash = tx.hash
    return balance == User.objects.values_list("credits", flat=True).get(pk=user.pk)
