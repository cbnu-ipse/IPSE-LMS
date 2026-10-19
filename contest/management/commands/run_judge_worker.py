import logging
import time

from django.core.management.base import BaseCommand
from django.db import close_old_connections

from contest.executors import RunnerUnavailable
from contest.tasks import process_next_task, requeue_stale_tasks

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "채점 대기열(JudgeTask)을 처리하는 워커. judge_worker 컨테이너에서 실행한다."

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true", help="대기 작업을 모두 처리하고 종료한다 (테스트·수동 실행용)")
        parser.add_argument("--idle", type=float, default=1.0, help="대기 작업이 없을 때 쉬는 시간(초)")

    def handle(self, *args, once=False, idle=1.0, **options):
        self.stdout.write("judge worker started")
        backoff = 0
        last_stale_check = 0.0
        while True:
            try:
                if time.monotonic() - last_stale_check > 60:
                    requeue_stale_tasks()
                    last_stale_check = time.monotonic()
                worked = process_next_task()
                backoff = 0
            except RunnerUnavailable as exc:
                backoff = min(30, backoff * 2 or 2)
                logger.warning("judge runner unavailable, retry in %ss: %s", backoff, exc)
                if once:
                    return
                time.sleep(backoff)
                continue
            except Exception:
                logger.exception("judge worker tick failed")
                close_old_connections()
                time.sleep(5)
                continue
            if not worked:
                if once:
                    return
                close_old_connections()
                time.sleep(idle)
