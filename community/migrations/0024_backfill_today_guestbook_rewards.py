"""할로윈 이벤트 초기에 못 받은 방명록 보상을 채운다 (배포 시 한 번만 돈다).

이벤트 초기(EVENT_START_DAY ~ 배포 전날)엔 방명록 보상이 낙엽 대신 사탕이었다:
  - 그 기간에 방명록을 쓰고 낙엽을 못 받은 날마다 낙엽 1개 (사탕은 그때 이미 받았다)
  - 배포 당일 이미 쓴 사람은 그날 못 받은 몫(낙엽·사탕)을 give_guestbook_rewards로
지급 로직(낙엽 해시 체인, 사탕 하루 상한)을 그대로 쓰려고 실제 모델·함수를 부른다.
날짜별 소급 지급은 설명에 날짜를 남겨 다시 돌아도 중복 지급하지 않는다.
"""
from datetime import date, datetime, timedelta, timezone

from django.db import migrations

EVENT_START_DAY = date(2026, 10, 8)  # 할로윈 사탕 이벤트 배포일 (PR #161, KST)
KST = timedelta(hours=9)


def _day_range(day):
    start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc) - KST
    return start, start + timedelta(days=1)


def backfill(apps, schema_editor):
    from accounts.models import LeafTransaction, User
    from community.models import Guestbook
    from community.views import _kst_day_utc_range, give_guestbook_rewards

    kst_start, kst_end, today = _kst_day_utc_range()

    # 1) 이벤트 시작일 ~ 어제: 방명록을 썼는데 낙엽을 못 받은 날 → 낙엽 1개
    day = EVENT_START_DAY
    while day < today:
        start, end = _day_range(day)
        marker = f"방명록 작성 보상 ({day.isoformat()} 소급)"
        author_ids = set(Guestbook.objects.filter(created_at__gte=start, created_at__lt=end)
                         .values_list("author_id", flat=True))
        for user in User.objects.filter(pk__in=author_ids, is_active=True):
            got = LeafTransaction.objects.filter(user=user, transaction_type="guestbook").filter(
                created_at__gte=start, created_at__lt=end).exists()
            if got or LeafTransaction.objects.filter(user=user, transaction_type="guestbook", description=marker).exists():
                continue
            user.adjust_leaves(amount=1, transaction_type="guestbook", description=marker)
        day += timedelta(days=1)

    # 2) 배포 당일: 이미 쓴 사람에게 그날 못 받은 몫 (낙엽·사탕)
    author_ids = set(Guestbook.objects.filter(created_at__gte=kst_start, created_at__lt=kst_end)
                     .values_list("author_id", flat=True))
    for user in User.objects.filter(pk__in=author_ids, is_active=True):
        give_guestbook_rewards(user, kst_start, kst_end)


class Migration(migrations.Migration):
    dependencies = [
        ("community", "0023_add_new_boards"),
        ("accounts", "0021_treats"),
    ]

    operations = [
        migrations.RunPython(backfill, migrations.RunPython.noop),
    ]
