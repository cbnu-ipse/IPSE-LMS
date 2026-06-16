# Generated manually

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_leafcode_leafcodeusage'),
        ('community', '0011_communitypost_communitycomment_gatheringevent_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='notify_gathering_all',
            field=models.BooleanField(default=True, verbose_name='전체 번개 모임 알림 받기'),
        ),
        migrations.AddField(
            model_name='student',
            name='notify_gathering_joined',
            field=models.BooleanField(default=True, verbose_name='참여 중인 번개 모임 알림 받기'),
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('gathering_created', '새 번개 모임 개설'), ('gathering_join', '모임 참여 신청'), ('gathering_leave', '모임 참여 취소'), ('gathering_comment', '모임 댓글 등록'), ('gathering_update', '모임 정보 변경'), ('gathering_cancel', '모임 취소')], max_length=20, verbose_name='알림 유형')),
                ('message', models.CharField(max_length=255, verbose_name='알림 메시지')),
                ('is_read', models.BooleanField(default=False, verbose_name='읽음 여부')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='생성일시')),
                ('gathering', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='community.gatheringevent', verbose_name='관련 번개 모임')),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL, verbose_name='수신자')),
                ('sender', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications_sent', to=settings.AUTH_USER_MODEL, verbose_name='송신자')),
            ],
            options={
                'verbose_name': '알림',
                'verbose_name_plural': '알림 목록',
                'ordering': ['-created_at'],
            },
        ),
    ]
