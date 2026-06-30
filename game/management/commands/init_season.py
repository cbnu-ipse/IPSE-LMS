"""
Management command to bootstrap game seasons for first deployment.

Usage:
    python manage.py init_season              # close current, create next month's season
    python manage.py init_season --month 2026-07   # close current, create July 2026
    python manage.py init_season --dry-run    # preview only
"""
import calendar
from datetime import date

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone


class Command(BaseCommand):
    help = "시즌 초기화: 현재 활성 시즌을 보상 없이 종료하고 지정 월의 새 시즌을 생성합니다."

    def add_arguments(self, parser):
        parser.add_argument(
            "--month",
            type=str,
            default=None,
            help="시작할 시즌 월 (YYYY-MM). 생략 시 다음 달 시즌 생성.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="실제로 변경하지 않고 결과만 미리 확인합니다.",
        )

    def handle(self, *args, **options):
        from game.models import GameSeason

        dry_run = options["dry_run"]
        month_str = options["month"]

        # 대상 월 결정
        today = timezone.localdate()
        if month_str:
            try:
                year, month = [int(x) for x in month_str.split("-")]
            except (ValueError, AttributeError):
                raise CommandError("--month 형식이 올바르지 않습니다. 예: 2026-07")
        else:
            # 기본: 다음 달
            if today.month == 12:
                year, month = today.year + 1, 1
            else:
                year, month = today.year, today.month + 1

        start = date(year, month, 1)
        end = date(year, month, calendar.monthrange(year, month)[1])
        new_label = start.strftime("%Y년 %m월")

        self.stdout.write(f"대상 시즌: {new_label} ({start} ~ {end})")

        # 현재 활성 시즌 종료 (보상 지급 없음)
        active_qs = GameSeason.objects.filter(is_active=True)
        if active_qs.exists():
            for s in active_qs:
                self.stdout.write(
                    f"  [종료] 시즌 {s.number} ({s.label}) — 보상 없이 마감"
                )
            if not dry_run:
                active_qs.update(is_active=False, rewards_distributed=True)
        else:
            self.stdout.write("  활성 시즌 없음.")

        # 이미 해당 월 시즌이 존재하는지 확인
        existing = GameSeason.objects.filter(start_date=start).first()
        if existing:
            self.stdout.write(
                f"  [기존] 시즌 {existing.number} ({existing.label})이 이미 존재합니다."
            )
            if not dry_run:
                existing.is_active = True
                existing.rewards_distributed = False
                existing.save(update_fields=["is_active", "rewards_distributed"])
                self.stdout.write(self.style.SUCCESS(f"  → 시즌 {existing.number} 활성화 완료."))
        else:
            last = GameSeason.objects.order_by("-number").first()
            number = last.number + 1 if last else 1
            self.stdout.write(f"  [생성] 시즌 {number} ({new_label})")
            if not dry_run:
                GameSeason.objects.create(
                    number=number,
                    start_date=start,
                    end_date=end,
                    is_active=True,
                )
                self.stdout.write(self.style.SUCCESS(f"  → 시즌 {number} 생성 완료."))

        if dry_run:
            self.stdout.write(self.style.WARNING("dry-run 모드 — 실제 변경 없음."))
        else:
            self.stdout.write(self.style.SUCCESS("init_season 완료."))
