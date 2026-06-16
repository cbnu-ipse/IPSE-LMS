# Generated manually

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('community', '0014_communitycommentdislike_communitycommentlike_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GatheringLeaveLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('left_at', models.DateTimeField(auto_now=True, verbose_name='참가취소일시')),
                ('gathering', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leave_logs', to='community.gatheringevent', verbose_name='번개 모임')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gathering_leave_logs', to=settings.AUTH_USER_MODEL, verbose_name='사용자')),
            ],
            options={
                'verbose_name': '모임 참가 취소 로그',
                'verbose_name_plural': '모임 참가 취소 로그 목록',
                'unique_together': {('gathering', 'user')},
            },
        ),
    ]
