# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_notifications_and_settings'),
    ]

    operations = [
        migrations.CreateModel(
            name='PushSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('endpoint', models.TextField(unique=True, verbose_name='푸시 엔드포인트 URL')),
                ('p256dh', models.TextField(verbose_name='클라이언트 공개키(p256dh)')),
                ('auth', models.TextField(verbose_name='클라이언트 인증 토큰(auth)')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='등록일시')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='push_subscriptions', to='accounts.student', verbose_name='학생 프로필')),
            ],
            options={
                'verbose_name': '웹 푸시 구독',
                'verbose_name_plural': '웹 푸시 구독 목록',
            },
        ),
    ]
