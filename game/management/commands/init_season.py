"""
Management command to bootstrap game seasons for first deployment.

Usage:
    python manage.py init_season                    # close current, create next week's season
    python manage.py init_season --week 2026-07-06   # close current, create the week of 2026-07-06 (Mon~Sun)
    python manage.py init_season --dry-run           # preview only
"""
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone


class Command(BaseCommand):
    help = "시즌 초기화: 현재 활성 시즌을 보상 없이 종료하고 지정 주(월~일)의 새 시즌을 생성합니다."

    def add_arguments(self, parser):
        parser.add_argument(
            "--week",
            type=str,
            default=None,
            help="시작할 시즌 주에 포함되는 날짜 (YYYY-MM-DD). 생략 시 다음 주 시즌 생성.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="실제로 변경하지 않고 결과만 미리 확인합니다.",
        )

    def handle(self, *args, **options):
        from game.models import GameSeason

        dry_run = options["dry_run"]
        week_str = options["week"]

        # 대상 주(월요일 기준) 결정
        today = timezone.localdate()
        if week_str:
            try:
                anchor = datetime.strptime(week_str, "%Y-%m-%d").date()
            except ValueError:
                raise CommandError("--week 형식이 올바르지 않습니다. 예: 2026-07-06")
        else:
            # 기본: 다음 주
            anchor = today + timedelta(days=7)

        start = anchor - timedelta(days=anchor.weekday())
        end = start + timedelta(days=6)
        new_label = f"{start.strftime('%Y.%m.%d')} ~ {end.strftime('%m.%d')}"

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

        # 이미 해당 주 시즌이 존재하는지 확인
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
