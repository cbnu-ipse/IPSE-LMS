from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_activitylog_problem_and_constraints"),
    ]

    operations = [
        migrations.AddField(
            model_name="schedule",
            name="external_id",
            field=models.CharField(blank=True, default="", max_length=100, verbose_name="외부 ID"),
        ),
    ]
