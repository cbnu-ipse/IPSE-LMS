import logging
import threading
from datetime import timedelta

from django.db import models, transaction
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class GameSeason(models.Model):
    number = models.PositiveIntegerField(unique=True, verbose_name="시즌 번호")
    start_date = models.DateField(verbose_name="시작일")  # 매주 월요일
    end_date = models.DateField(verbose_name="종료일")    # 매주 일요일
    is_active = models.BooleanField(default=False, db_index=True, verbose_name="활성 시즌")
    rewards_distributed = models.BooleanField(default=False, verbose_name="보상 지급 완료")
    warned_3d = models.BooleanField(default=False, verbose_name="3일 전 알림 전송")
    warned_1d = models.BooleanField(default=False, verbose_name="1일 전 알림 전송")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-number"]
        verbose_name = "게임 시즌"
        verbose_name_plural = "게임 시즌 목록"

    def __str__(self):
        return f"시즌 {self.number} ({self.label})"

    # ── 공개 API ─────────────────────────────────────────────────────────────

    @classmethod
    def get_or_create_current(cls):
        """
        활성 시즌을 반환한다.
        - 시즌이 이미 종료됐으면 자동으로 마감·보상 지급 후 다음 시즌을 반환.
        - 활성 시즌이 없으면 현재 월 기준으로 새 시즌을 생성해 반환.
        - 종료 3일/1일 전이면 자동으로 경고 알림을 전송한다.
        """
        today = timezone.localdate()

        active = cls.objects.filter(is_active=True).first()

        if active and active.is_ended:
            cls._auto_finalize(active)
            active = None

        if active:
            cls._maybe_send_warning(active)
            return active

        covering = cls.objects.filter(start_date__lte=today, end_date__gte=today).first()
        if covering:
            covering.is_active = True
            covering.save(update_fields=["is_active"])
            cls._maybe_send_warning(covering)
            return covering

        last = cls.objects.order_by("-number").first()
        number = last.number + 1 if last else 1
        start = today - timedelta(days=today.weekday())  # 이번 주 월요일
        end = start + timedelta(days=6)                  # 이번 주 일요일
        return cls.objects.create(
            number=number,
            start_date=start,
            end_date=end,
            is_active=True,
        )

    @classmethod
    def _maybe_send_warning(cls, season):
        """시즌종료 알림은 발송하지 않음 (게시글 댓글/번개모임 알림만 유지)."""
        return

    # ── 프로퍼티 ──────────────────────────────────────────────────────────────

    @property
    def days_remaining(self):
        today = timezone.localdate()
        if today >= self.end_date:
            return 0
        return (self.end_date - today).days

    @property
    def is_ended(self):
        return timezone.localdate() > self.end_date

    @property
    def label(self):
        return f"{self.start_date.strftime('%Y.%m.%d')} ~ {self.end_date.strftime('%m.%d')}"

    # ── 내부 로직 ─────────────────────────────────────────────────────────────

    @classmethod
    def _auto_finalize(cls, season):
        """
        종료된 시즌을 원자적으로 마감하고 보상·알림을 백그라운드 스레드로 처리.
        동시 요청이 들어와도 DB update rowcount로 한 번만 실행됨.
        """
        with transaction.atomic():
            # rewards_distributed=False 조건을 포함해 원자적으로 마감 처리.
            # 동시에 두 요청이 들어오면 둘 중 하나만 updated=1을 얻는다.
            updated = cls.objects.filter(
                pk=season.pk,
                rewards_distributed=False,
            ).update(is_active=False, rewards_distributed=True)

        if updated == 0:
            return  # 이미 다른 요청이 처리 완료

        thread = threading.Thread(
            target=cls._distribute_rewards_and_notify,
            args=(season,),
            daemon=True,
        )
        thread.start()

    @classmethod
    def _distribute_rewards_and_notify(cls, season):
        """사과게임/카드 매칭 상위 3명에게 낙엽을 지급하고 월말정산 UI 클레임을 생성한다."""
        from game.views import get_apple_ranking, get_memory_match_ranking, get_number_speed_ranking, get_pattern_recall_ranking, SEASON_RANK_REWARDS

        RANK_LABELS = {1: "1위", 2: "2위", 3: "3위"}

        cls._distribute_board_rewards(
            season=season,
            board="apple_game",
            board_label="사과게임",
            reward_reason="SEASON_APPLE_REWARD",
            ranking_fn=get_apple_ranking,
            rank_labels=RANK_LABELS,
            reward_table=SEASON_RANK_REWARDS,
        )
        cls._distribute_board_rewards(
            season=season,
            board="memory_match",
            board_label="카드 매칭",
            reward_reason="SEASON_MEMORY_MATCH_REWARD",
            ranking_fn=get_memory_match_ranking,
            rank_labels=RANK_LABELS,
            reward_table=SEASON_RANK_REWARDS,
        )
        cls._distribute_board_rewards(
            season=season,
            board="number_speed",
            board_label="넘버 스피드",
            reward_reason="SEASON_NUMBER_SPEED_REWARD",
            ranking_fn=get_number_speed_ranking,
            rank_labels=RANK_LABELS,
            reward_table=SEASON_RANK_REWARDS,
        )
        cls._distribute_board_rewards(
            season=season,
            board="pattern_recall",
            board_label="패턴 리콜",
            reward_reason="SEASON_PATTERN_RECALL_REWARD",
            ranking_fn=get_pattern_recall_ranking,
            rank_labels=RANK_LABELS,
            reward_table=SEASON_RANK_REWARDS,
        )

        logger.info(f"[GameSeason] 시즌 {season.number} ({season.label}) 자동 마감 완료.")

    @classmethod
    def _distribute_board_rewards(cls, season, board, board_label, reward_reason, ranking_fn, rank_labels, reward_table):
        try:
            rows = ranking_fn(top_n=3, season=season)
        except Exception as e:
            logger.error(f"[GameSeason] {season.label} {board_label} 랭킹 조회 실패: {e}")
            return

        for row in rows:
            rank = row["rank"]
            reward = reward_table.get(rank)
            if reward is None:
                continue

            user = row["user"]
            label = rank_labels.get(rank, f"{rank}위")
            description = f"[시즌 {season.number}] {board_label} {label} 보상"

            try:
                user.adjust_leaves(reward, reward_reason, description)
            except Exception as e:
                logger.error(f"[GameSeason] {user.username} 보상 지급 실패: {e}")
                continue

            # 다음 접속 시 월말정산 모달로 표시 (Notification 아님)
            try:
                SeasonRewardClaim.objects.create(
                    user=user,
                    season_label=season.label,
                    board=board,
                    rank=rank,
                    reward=reward,
                )
            except Exception as e:
                logger.error(f"[GameSeason] {user.username} 정산 클레임 생성 실패: {e}")




class SeasonRewardClaim(models.Model):
    """시즌 보상 지급 후 사용자가 다음 접속 시 표시할 월말정산 UI 데이터."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="season_reward_claims",
        verbose_name="사용자"
    )
    season_label = models.CharField(max_length=50, verbose_name="시즌 표시명")  # "2026년 07월"
    board = models.CharField(
        max_length=20,
        default="apple_game",
        choices=[("apple_game", "마지막 잎새"), ("memory_match", "카드 매칭"), ("number_speed", "넘버 스피드"), ("pattern_recall", "패턴 리콜")],
        verbose_name="게임 종류",
    )
    rank = models.PositiveSmallIntegerField(verbose_name="최종 순위")
    reward = models.PositiveIntegerField(verbose_name="지급 낙엽 수량")
    shown = models.BooleanField(default=False, db_index=True, verbose_name="확인 여부")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "시즌 보상 정산"
        verbose_name_plural = "시즌 보상 정산 목록"

    def __str__(self):
        return f"{self.user.username} - {self.season_label} {self.get_board_display()} {self.rank}위 +{self.reward}"


class SlotPlayLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="slot_play_logs",
        verbose_name="사용자"
    )
    played_date = models.DateField(auto_now_add=True, verbose_name="플레이 일자")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="플레이 시간")
    result_reward = models.PositiveIntegerField(default=0, verbose_name="획득 낙엽 수량")
    result_grade = models.CharField(max_length=2, default="F", verbose_name="결과 등급")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "슬롯머신 플레이 로그"
        verbose_name_plural = "슬롯머신 플레이 로그 목록"

    def __str__(self):
        return f"{self.user.username} - {self.result_grade}(+{self.result_reward}) {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class AppleGameScore(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="apple_game_scores",
        verbose_name="사용자"
    )
    score = models.PositiveIntegerField(default=0, verbose_name="점수")
    played_at = models.DateTimeField(auto_now_add=True, verbose_name="플레이 시각")

    class Meta:
        ordering = ["-score", "played_at"]
        verbose_name = "사과게임 점수"
        verbose_name_plural = "사과게임 점수 목록"

    def __str__(self):
        return f"{self.user.username} - {self.score}점"


class LobbyChatMessage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lobby_chat_messages",
        verbose_name="작성자"
    )
    message = models.TextField(verbose_name="메시지 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성 시각")

    class Meta:
        ordering = ["created_at"]
        verbose_name = "로비 채팅 메시지"
        verbose_name_plural = "로비 채팅 메시지 목록"

    def __str__(self):
        return f"{self.user.username}: {self.message[:30]}"


class MemoryMatchScore(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memory_match_scores",
        verbose_name="사용자"
    )
    score = models.PositiveIntegerField(default=0, verbose_name="점수")
    moves = models.PositiveIntegerField(default=0, verbose_name="이동 횟수")
    time_seconds = models.PositiveIntegerField(default=0, verbose_name="소요 시간(초)")
    played_at = models.DateTimeField(auto_now_add=True, verbose_name="플레이 시각")

    class Meta:
        ordering = ["-score", "played_at"]
        verbose_name = "카드 매칭 점수"
        verbose_name_plural = "카드 매칭 점수 목록"

    def __str__(self):
        return f"{self.user.username} - {self.score}점"


class NumberSpeedScore(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="number_speed_scores",
        verbose_name="사용자"
    )
    score = models.PositiveIntegerField(default=0, verbose_name="점수")
    mistakes = models.PositiveIntegerField(default=0, verbose_name="실수 횟수")
    time_ms = models.PositiveIntegerField(default=0, verbose_name="소요 시간(ms)")
    played_at = models.DateTimeField(auto_now_add=True, verbose_name="플레이 시각")

    class Meta:
        ordering = ["-score", "played_at"]
        verbose_name = "넘버 스피드 점수"
        verbose_name_plural = "넘버 스피드 점수 목록"

    def __str__(self):
        return f"{self.user.username} - {self.score}점"


class PatternRecallScore(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pattern_recall_scores",
        verbose_name="사용자"
    )
    score = models.PositiveIntegerField(default=0, verbose_name="점수")
    level = models.PositiveIntegerField(default=0, verbose_name="도달 레벨")
    played_at = models.DateTimeField(auto_now_add=True, verbose_name="플레이 시각")

    class Meta:
        ordering = ["-score", "played_at"]
        verbose_name = "패턴 리콜 점수"
        verbose_name_plural = "패턴 리콜 점수 목록"

    def __str__(self):
        return f"{self.user.username} - {self.score}점 (Lv.{self.level})"
