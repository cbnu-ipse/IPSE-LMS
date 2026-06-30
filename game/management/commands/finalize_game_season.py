"""
사과게임 시즌을 종료하고 상위 3명에게 낙엽 보상과 기기 알림을 전송한 뒤
다음 월 시즌을 자동으로 시작하는 관리 커맨드.

cron 설정 예시 (매월 말일 23:59 KST = 14:59 UTC):
  59 14 28-31 * * /path/.venv/bin/python manage.py finalize_game_season
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from game.models import GameSeason
from game.views import get_apple_ranking, SEASON_RANK_REWARDS


class Command(BaseCommand):
    help = "만료된 사과게임 시즌을 종료하고 상위 3명에게 보상 및 알림을 지급한 뒤 새 시즌을 시작합니다."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="실제 DB 변경 없이 결과만 출력합니다.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        today = timezone.localdate()

        # 오늘이 종료일인 시즌 (말일 23:59 KST cron 기준)
        expired_seasons = GameSeason.objects.filter(
            end_date__lte=today,
            is_active=True,
            rewards_distributed=False,
        ).order_by("number")

        if not expired_seasons.exists():
            self.stdout.write(self.style.SUCCESS("종료 처리할 시즌이 없습니다."))
            return

        for season in expired_seasons:
            self.stdout.write(
                f"\n[시즌 {season.number}] {season.label} ({season.start_date} ~ {season.end_date}) 처리 중..."
            )
            self._distribute_and_notify(season, dry_run)

            if not dry_run:
                season.is_active = False
                season.rewards_distributed = True
                season.save(update_fields=["is_active", "rewards_distributed"])
                self.stdout.write(self.style.SUCCESS(f"  → 시즌 {season.number} 종료 완료."))
            else:
                self.stdout.write("  [DRY RUN] 시즌 종료 처리 건너뜀.")

        if not dry_run:
            new_season = GameSeason.get_or_create_current()
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n새 시즌 {new_season.number} 시작: {new_season.label} "
                    f"({new_season.start_date} ~ {new_season.end_date})"
                )
            )

    def _distribute_and_notify(self, season, dry_run):
        from accounts.models import Notification
        from accounts.utils import send_web_push

        rows = get_apple_ranking(top_n=3, season=season)

        if not rows:
            self.stdout.write("  사과게임: 랭킹 데이터 없음, 보상 건너뜀.")
            return

        for row in rows:
            rank = row["rank"]
            reward = SEASON_RANK_REWARDS.get(rank)
            if reward is None:
                continue

            user = row["user"]
            description = f"[시즌 {season.number}] 사과게임 {rank}위 보상"
            msg = f"{season.label} 사과게임 {rank}위! 낙엽 {reward}개가 지급되었습니다."
            self.stdout.write(f"  사과게임 {rank}위 {user.display_name} → +{reward} 낙엽")

            if not dry_run:
                try:
                    user.adjust_leaves(reward, "SEASON_APPLE_REWARD", description)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"    보상 지급 실패: {e}"))
                    continue

                try:
                    notif = Notification.objects.create(
                        recipient=user,
                        sender=None,
                        notification_type="game_season_reward",
                        message=msg,
                    )
                    send_web_push(notif)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"    알림 전송 실패: {e}"))
