from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0008_user_role_flags"),
    ]

    operations = [
        migrations.CreateModel(
            name="LMSToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("token", models.CharField(max_length=200, verbose_name="LMS 토큰")),
                ("lms_username", models.CharField(blank=True, max_length=100, verbose_name="LMS 아이디")),
                ("moodle_user_id", models.IntegerField(blank=True, null=True, verbose_name="Moodle 사용자 ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="연동 일시")),
                ("last_used_at", models.DateTimeField(auto_now=True, verbose_name="마지막 사용")),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lms_token",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="사용자",
                    ),
                ),
            ],
            options={"verbose_name": "LMS 토큰", "verbose_name_plural": "LMS 토큰"},
        ),
    ]
