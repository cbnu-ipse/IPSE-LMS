# problems/signals.py
from django.db.models.signals import post_save, pre_delete
from django.db.models import Sum
from django.dispatch import receiver
from .models import SolveRecord, Problem

@receiver(post_save, sender=SolveRecord)
def update_user_ranking_points(sender, instance, created, **kwargs):
    # 상태가 'SOLVED'로 변경되었을 때만 점수 가산
    if instance.status == 'SOLVED':
        profile = instance.user
        total = SolveRecord.objects.filter(
            user=instance.user,
            status='SOLVED',
        ).aggregate(total=Sum('problem__points'))['total']
        profile.total_points = total or 0
        profile.save(update_fields=['total_points'])


@receiver(pre_delete, sender=Problem)
def cascade_delete_activity_logs(sender, instance, **kwargs):
    """Problem은 beta_judge DB에 있어 core.ActivityLog(default DB)로의 자동 CASCADE가
    DB 경계를 넘지 못한다. Problem 삭제 시 관련 활동 기록을 수동으로 정리한다."""
    from core.models import ActivityLog

    ActivityLog.objects.filter(problem=instance).delete()