"""업데이트 당일 이미 방명록을 쓴 사람에게 그날 못 받은 방명록 보상을 준다.

이벤트 초기엔 방명록 보상이 낙엽 대신 사탕이었다 → 오늘 사탕만 받은 사람은 낙엽 1개를,
(혹시) 낙엽만 받은 사람은 사탕을 받는다. 지급 로직(하루 1회 확인, 사탕 하루 상한, 낙엽 해시 체인)을 그대로
쓰려고 실제 모델·함수를 부른다 — 배포 시 한 번만 돈다.
"""
from django.db import migrations


def backfill(apps, schema_editor):
    from accounts.models import User
    from community.models import Guestbook
    from community.views import _kst_day_utc_range, give_guestbook_rewards

    kst_start, kst_end, _ = _kst_day_utc_range()
    author_ids = (Guestbook.objects.filter(created_at__gte=kst_start, created_at__lt=kst_end)
                  .values_list("author_id", flat=True).distinct())
    for user in User.objects.filter(pk__in=list(author_ids), is_active=True):
        give_guestbook_rewards(user, kst_start, kst_end)


class Migration(migrations.Migration):
    dependencies = [
        ("community", "0023_add_new_boards"),
        ("accounts", "0021_treats"),
    ]

    operations = [
        migrations.RunPython(backfill, migrations.RunPython.noop),
    ]
