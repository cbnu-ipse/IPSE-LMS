"""
사과게임 시즌 종료 3일 전 / 1일 전 상태를 콘솔에 출력하는 관리 커맨드.
게임 시즌 종료 알림은 발송하지 않습니다(게시글 댓글/번개모임 알림만 유지).

cron 설정 예시 (매일 09:00 KST = 00:00 UTC):
  0 0 * * * /path/.venv/bin/python manage.py notify_season_ending
"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "사과게임 시즌 종료 3일/1일 전 상태를 콘솔에 출력합니다 (알림은 발송하지 않음)."

    def handle(self, *args, **options):
        from game.models import GameSeason

        season = GameSeason.objects.filter(is_active=True).first()
        if not season:
            self.stdout.write("활성 시즌이 없습니다.")
            return

        days = season.days_remaining
        if days not in (3, 1):
            self.stdout.write(f"시즌 {season.number} 남은 일수: {days}일 — 알림 대상 아님.")
            return

        self.stdout.write(f"시즌 {season.number} 종료 {days}일 전 (알림 미발송)")
