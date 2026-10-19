"""채점 대기열. 웹은 제출을 JudgeTask(QUEUED)로 넣기만 하고, judge_worker 컨테이너
(manage.py run_judge_worker)가 하나씩 꺼내 채점한다."""
import logging
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from .executors import RunnerUnavailable
from .judge import run_judge
from .models import JudgeTask

logger = logging.getLogger(__name__)
DB = "beta_judge"
STALE_AFTER = timedelta(minutes=5)  # 워커가 죽어 RUNNING으로 남은 작업은 이 시간이 지나면 다시 대기열로


def requeue_stale_tasks(now=None):
    now = now or timezone.now()
    return JudgeTask.objects.using(DB).filter(status="RUNNING", started_at__lt=now - STALE_AFTER).update(
        status="QUEUED", error_message="워커 중단으로 다시 대기열에 넣었습니다.")


def claim_next_task():
    """가장 오래된 대기 작업 하나를 RUNNING으로 바꿔 가져온다 (여러 워커가 같은 작업을 잡지 않도록 행 잠금)."""
    with transaction.atomic(using=DB):
        task = (JudgeTask.objects.using(DB).select_for_update(skip_locked=True)
                .filter(status="QUEUED").order_by("id").first())
        if not task:
            return None
        task.status = "RUNNING"
        task.started_at = timezone.now()
        task.save(update_fields=["status", "started_at"])
    return task


def process_next_task():
    """작업 하나를 처리한다. 처리했으면 True, 대기 작업이 없으면 False.
    실행기에 닿지 못하면 작업을 대기열로 되돌리고 RunnerUnavailable을 올린다."""
    task = claim_next_task()
    if not task:
        return False
    submission = task.submission
    try:
        run_judge(submission)
    except RunnerUnavailable as exc:
        JudgeTask.objects.using(DB).filter(pk=task.pk).update(status="QUEUED", started_at=None,
                                                             error_message=f"실행기 연결 실패: {exc}"[:500])
        raise
    return True
