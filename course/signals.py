# course/signals.py
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import CourseCategory


@receiver(pre_delete, sender=CourseCategory)
def clear_judge_problem_category(sender, instance, **kwargs):
    """problems.Problem은 beta_judge DB에 있어 CourseCategory(default DB) 삭제 시
    자동 SET_NULL이 DB 경계를 넘지 못한다. 수동으로 category를 비운다."""
    from problems.models import Problem

    Problem.objects.filter(category=instance).update(category=None)
