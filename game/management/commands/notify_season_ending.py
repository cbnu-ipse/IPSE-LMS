"""
사과게임 시즌 종료 3일 전 / 1일 전에 이번 시즌 참가자에게
기기 알림을 전송하는 관리 커맨드.

cron 설정 예시 (매일 09:00 KST = 00:00 UTC):
  0 0 * * * /path/.venv/bin/python manage.py notify_season_ending
"""
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "사과게임 시즌 종료 3일/1일 전 기기 알림을 전송합니다."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="실제 알림을 전송하지 않고 대상과 메시지만 출력합니다.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        from game.models import GameSeason

        season = GameSeason.objects.filter(is_active=True).first()
        if not season:
            self.stdout.write("활성 시즌이 없습니다.")
            return

        days = season.days_remaining
        if days not in (3, 1):
            self.stdout.write(f"시즌 {season.number} 남은 일수: {days}일 — 알림 대상 아님.")
            return

        msg = (
            f"{season.label} 사과게임 시즌이 {days}일 후 종료됩니다! "
            f"마지막 기회를 놓치지 마세요."
        )
        self.stdout.write(f"시즌 {season.number} 종료 {days}일 전 알림 전송 예정: \"{msg}\"")

        recipients = self._get_recipients(season)
        self.stdout.write(f"알림 대상: {recipients.count()}명")

        if dry_run:
            for user in recipients:
                self.stdout.write(f"  [DRY RUN] → {user.username}")
            return

        from accounts.models import Notification
        from accounts.utils import send_web_push

        sent = 0
        for user in recipients:
            try:
                notif = Notification.objects.create(
                    recipient=user,
                    sender=None,
                    notification_type="game_season_ending",
                    message=msg,
                )
                send_web_push(notif)
                sent += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  알림 실패 ({user.username}): {e}"))

        self.stdout.write(self.style.SUCCESS(f"알림 전송 완료: {sent}명"))

    def _get_recipients(self, season):
        """이번 시즌에 사과게임을 플레이한 유저 반환."""
        from accounts.models import User
        from game.models import AppleGameScore

        user_ids = (
            AppleGameScore.objects
            .filter(
                played_at__date__gte=season.start_date,
                played_at__date__lte=season.end_date,
            )
            .values_list("user_id", flat=True)
            .distinct()
        )
        return User.objects.filter(pk__in=user_ids)
