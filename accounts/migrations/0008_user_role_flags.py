from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0007_student_verification_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_president",
            field=models.BooleanField(default=False, verbose_name="회장"),
        ),
        migrations.AddField(
            model_name="user",
            name="is_vice_president",
            field=models.BooleanField(default=False, verbose_name="부회장"),
        ),
        migrations.AddField(
            model_name="user",
            name="is_executive",
            field=models.BooleanField(default=False, verbose_name="임원진"),
        ),
    ]
