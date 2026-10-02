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


# ─────────────────────────────────────────────────────────────────────────────
# 온라인 포커 (텍사스 홀덤, 8인 고정 테이블 1개)
#
# 다른 미니게임과 달리 플레이어끼리 낙엽을 걸고 뺏고 따는 제로섬 베팅이라
# 별도의 시즌 랭킹/점수 모델이 아닌, 실시간 테이블 상태를 DB에 영속화하는
# 구조로 만든다. 실제 상태머신 로직은 game/poker_engine.py 에 있다.
# ─────────────────────────────────────────────────────────────────────────────

# ── 방 단계 (포커·고스톱·요트 공통) ──────────────────────────────────────────
# 방을 만들 때 초보/중수/고수 중 고른다. 판돈 크기와 AI 난이도(AI 플레이어, 자리 비운 사람
# 대신 두기 모두)가 단계를 따른다.
GAME_TIERS = ("beginner", "intermediate", "expert")
TIER_CHOICES = [("beginner", "초보"), ("intermediate", "중수"), ("expert", "고수")]
TIER_LABELS = dict(TIER_CHOICES)
TIER_AI_LEVEL = {"beginner": "easy", "intermediate": "normal", "expert": "hard"}

POKER_CAPACITIES = (2, 4, 6)  # 방장이 고르는 좌석 수
POKER_CHIPS_PER_LEAF = 1000  # 1낙엽 = 1000칩 환전 비율
# 단계별로 들고 앉는 칩 범위와 블라인드 (블라인드 = 최소 칩의 1/50, 1/100).
# 보관 칩 전부를 들고 앉되 그 단계 최대치까지만 (고수는 무제한).
POKER_TIERS = {
    "beginner": {"min": 1000, "max": 9999, "sb": 10, "bb": 20},
    "intermediate": {"min": 10000, "max": 99999, "sb": 100, "bb": 200},
    "expert": {"min": 100000, "max": None, "sb": 1000, "bb": 2000},
}


class PokerTable(models.Model):
    """포커 방 하나. 방을 만든 사람이 단계를 고르고, 사람이 모두 나가면 방이 지워진다."""
    STATUS_CHOICES = [("waiting", "대기 중"), ("playing", "진행 중")]
    ROUND_CHOICES = [
        ("preflop", "프리플랍"), ("flop", "플랍"), ("turn", "턴"),
        ("river", "리버"), ("showdown", "쇼다운"),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="waiting")
    round = models.CharField(max_length=10, choices=ROUND_CHOICES, default="preflop")
    dealer_seat = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="딜러 버튼 자리")
    current_turn_seat = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="현재 차례 자리")
    turn_deadline = models.DateTimeField(null=True, blank=True, verbose_name="현재 차례 제한시각")
    next_hand_at = models.DateTimeField(null=True, blank=True, verbose_name="다음 핸드 시작 예정시각")
    pot = models.PositiveIntegerField(default=0, verbose_name="팟")
    current_bet = models.PositiveIntegerField(default=0, verbose_name="현재 스트리트 콜 금액")
    min_raise = models.PositiveIntegerField(default=0, verbose_name="최소 레이즈 단위")
    community_cards = models.JSONField(default=list, blank=True, verbose_name="커뮤니티 카드")
    deck = models.JSONField(default=list, blank=True, verbose_name="남은 덱 (서버 전용)")
    hand_number = models.PositiveIntegerField(default=0, verbose_name="핸드 번호")
    last_result = models.JSONField(default=dict, blank=True, verbose_name="직전 핸드 결과 요약")
    tier = models.CharField(max_length=12, choices=TIER_CHOICES, default="intermediate", verbose_name="단계")
    capacity = models.PositiveSmallIntegerField(default=6, verbose_name="좌석 수")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "포커 방"
        verbose_name_plural = "포커 방 목록"

    def __str__(self):
        return f"포커 {self.pk}번 방 ({TIER_LABELS.get(self.tier)}, {self.get_status_display()})"

    @property
    def tier_config(self):
        return POKER_TIERS.get(self.tier, POKER_TIERS["intermediate"])

    @classmethod
    def create_with_seats(cls, tier, capacity=6):
        table = cls.objects.create(tier=tier, capacity=capacity, min_raise=POKER_TIERS[tier]["bb"])
        PokerSeat.objects.bulk_create([PokerSeat(table=table, seat_number=n) for n in range(capacity)])
        return table


class PokerSeat(models.Model):
    STATUS_CHOICES = [
        ("empty", "빈 자리"), ("active", "참여 중"), ("folded", "폴드"),
        ("all_in", "올인"), ("out", "이번 핸드 미참여"),
    ]
    table = models.ForeignKey(PokerTable, on_delete=models.CASCADE, related_name="seats")
    seat_number = models.PositiveSmallIntegerField(verbose_name="자리 번호")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="poker_seats", verbose_name="사용자"
    )
    stack = models.PositiveIntegerField(default=0, verbose_name="보유 스택")
    current_bet = models.PositiveIntegerField(default=0, verbose_name="이번 스트리트 베팅액")
    contributed_total = models.PositiveIntegerField(default=0, verbose_name="이번 핸드 누적 베팅액")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="empty")
    hole_cards = models.JSONField(default=list, blank=True, verbose_name="홀 카드")
    has_acted_this_street = models.BooleanField(default=False)
    consecutive_timeouts = models.PositiveSmallIntegerField(default=0, verbose_name="연속 시간초과 횟수")
    leaving_after_hand = models.BooleanField(default=False, verbose_name="핸드 종료 후 퇴장 예정")
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["seat_number"]
        unique_together = [("table", "seat_number")]
        verbose_name = "포커 좌석"
        verbose_name_plural = "포커 좌석 목록"

    def __str__(self):
        who = self.user.username if self.user_id else "빈 자리"
        return f"{self.seat_number}번 - {who}"


class PokerHandLog(models.Model):
    """낙엽 이동 자체는 LeafTransaction 원장이 기록하므로, 여기서는 핸드 결과만 남긴다."""
    # 방이 지워져도 핸드 기록은 남긴다
    table = models.ForeignKey(PokerTable, on_delete=models.SET_NULL, null=True, blank=True, related_name="hand_logs")
    hand_number = models.PositiveIntegerField()
    pot = models.PositiveIntegerField()
    community_cards = models.JSONField(default=list, blank=True)
    winners = models.JSONField(default=list, blank=True)  # [{"username", "amount", "hand_desc", "seat_number"}]
    ended_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-ended_at"]
        verbose_name = "포커 핸드 기록"
        verbose_name_plural = "포커 핸드 기록 목록"

    def __str__(self):
        return f"#{self.hand_number} - 팟 {self.pot}"


class PokerChipWallet(models.Model):
    """자리에서 일어날 때 칩을 낙엽으로 강제 환급하지 않고 여기 보관한다.
    좌석에 앉아있지 않아도 언제든 이 잔액을 낙엽으로 환전할 수 있다."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="poker_wallet"
    )
    chips = models.PositiveIntegerField(default=0, verbose_name="보관 칩")

    class Meta:
        verbose_name = "포커 칩 지갑"
        verbose_name_plural = "포커 칩 지갑 목록"

    def __str__(self):
        return f"{self.user} - {self.chips}칩"


# ─────────────────────────────────────────────────────────────────────────────
# 하이로우(Hi-Lo) — 낙엽을 직접 베팅에 쓰는 푸시유어럭(push-your-luck) 카드 게임.
#
# 무늬 없이 랭크(2~14, A=14)만 있는 카드를 매번 새로 뽑는다(리셰플 없이 매번
# 13가지 랭크 중 균등 추첨 — 덱 소진/카드 카운팅을 신경 쓸 필요가 없어지므로
# 의도적으로 단순화했다). 직전 카드보다 높다/낮다를 맞히면 배당이 붙고, 언제든
# 캐시아웃하거나 계속 이어갈 수 있다. 슬롯머신처럼 상태머신이 단순해 별도
# engine 모듈 없이 game/views.py 안에서 처리한다.
# ─────────────────────────────────────────────────────────────────────────────

HIGHLOW_MIN_BET = 5
HIGHLOW_MAX_BET = 300
HIGHLOW_RTP = 0.92  # 배당 공식에 곱하는 목표 환급률 (하우스 엣지 확보용)


class HighLowSession(models.Model):
    """진행 중인 하이로우 한 판의 상태. 유저당 최대 1개(동시에 두 판 불가)."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="highlow_session", verbose_name="사용자"
    )
    bet = models.PositiveIntegerField(verbose_name="베팅 낙엽")
    current_rank = models.PositiveSmallIntegerField(verbose_name="현재 카드 랭크 (2~14, 11~14=J/Q/K/A)")
    streak = models.PositiveIntegerField(default=0, verbose_name="연속 성공 횟수")
    potential_payout = models.PositiveIntegerField(default=0, verbose_name="지금 캐시아웃 시 받을 낙엽")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "하이로우 진행 상태"
        verbose_name_plural = "하이로우 진행 상태 목록"

    def __str__(self):
        return f"{self.user} - 베팅 {self.bet}, {self.streak}연속"


class HighLowPlayLog(models.Model):
    """하이로우 한 판이 끝난 기록 (캐시아웃/실패). 최고 연속 기록 랭킹에 사용."""
    RESULT_CHOICES = [("cashed_out", "캐시아웃"), ("busted", "실패")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="highlow_play_logs", verbose_name="사용자"
    )
    bet = models.PositiveIntegerField(verbose_name="베팅 낙엽")
    streak = models.PositiveIntegerField(default=0, verbose_name="연속 성공 횟수")
    payout = models.PositiveIntegerField(default=0, verbose_name="정산 낙엽")
    result = models.CharField(max_length=10, choices=RESULT_CHOICES, verbose_name="결과")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="종료 시각")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "하이로우 플레이 기록"
        verbose_name_plural = "하이로우 플레이 기록 목록"

    def __str__(self):
        return f"{self.user} - {self.streak}연속 ({self.get_result_display()})"


# ─────────────────────────────────────────────────────────────────────────────
# 하우스 계좌 — AI(봇) 플레이어가 쓰는 칩. 봇은 여기서 칩을 가지고 앉고, 자리를 떠나면
# 남은 칩이 여기로 돌아온다. 그래서 봇이 따고 잃은 칩까지 전체 칩 총량이 보존된다.
# 잔고가 모자라면 봇을 부를 수 없다 (관리자 페이지에서 잔고 조정).
# ─────────────────────────────────────────────────────────────────────────────

HOUSE_INITIAL_CHIPS = 500 * POKER_CHIPS_PER_LEAF  # 처음 만들어질 때 잔고 (500낙엽어치)


class HouseBank(models.Model):
    chips = models.BigIntegerField(default=0, verbose_name="하우스 칩")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "하우스 계좌"
        verbose_name_plural = "하우스 계좌"

    def __str__(self):
        return f"하우스 {self.chips:,}칩"

    @classmethod
    def locked(cls):
        """싱글턴(pk=1)을 보장하고 행 잠금으로 가져온다. transaction.atomic() 안에서 호출."""
        cls.objects.get_or_create(pk=1, defaults={"chips": HOUSE_INITIAL_CHIPS})
        return cls.objects.select_for_update().get(pk=1)


# ─────────────────────────────────────────────────────────────────────────────
# 고스톱 — 방 여러 개, 방마다 맞고(2인) 또는 고스톱(3인) 모드. 판돈은 포커와
# 같은 칩 지갑(PokerChipWallet).
#
# 입장 시 보관 칩 전부를 지갑에서 좌석 스택으로 옮기고(최소 바이인 필요), 판마다 점수 × 점당 칩을
# 스택끼리 정산한다. 퇴장 시 남은 스택은 지갑으로 돌아간다. 한 판의 진행
# 상태(덱/손패/바닥/먹은 패 등)는 전부 GostopRoom.state JSON 하나에 담는다.
# 실제 규칙/상태머신은 game/gostop_engine.py 에 있다.
# ─────────────────────────────────────────────────────────────────────────────

# 단계별 점당 칩. 입장할 때 보관 칩 전부를 단계 상한까지 가져가고(포커와 같은 범위), 최소 입장 칩은 점당의 100배.
GOSTOP_TIER_POINT_CHIPS = {"beginner": 10, "intermediate": 100, "expert": 1000}
GOSTOP_BUY_IN_POINTS = 100
GOSTOP_TIER_MAX_CHIPS = {"beginner": 9999, "intermediate": 99999, "expert": None}  # None = 무제한


class GostopRoom(models.Model):
    MODE_CHOICES = [("matgo", "맞고 (2인)"), ("gostop", "고스톱 (3인)")]
    STATUS_CHOICES = [("waiting", "대기 중"), ("playing", "진행 중")]

    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default="matgo")
    tier = models.CharField(max_length=12, choices=TIER_CHOICES, default="intermediate", verbose_name="단계")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="waiting")
    state = models.JSONField(default=dict, blank=True, verbose_name="판 진행 상태 (서버 전용)")
    turn_deadline = models.DateTimeField(null=True, blank=True, verbose_name="현재 차례 제한시각")
    next_game_at = models.DateTimeField(null=True, blank=True, verbose_name="다음 판 시작 예정시각")
    carry_multiplier = models.PositiveSmallIntegerField(default=1, verbose_name="나가리 누적 배수")
    next_first = models.PositiveSmallIntegerField(default=0, verbose_name="다음 판 선 (좌석 번호)")
    last_result = models.JSONField(default=dict, blank=True, verbose_name="직전 판 결과 요약")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "고스톱 방"
        verbose_name_plural = "고스톱 방 목록"

    def __str__(self):
        return f"{self.get_mode_display()} {self.pk}번 방 ({TIER_LABELS.get(self.tier)}, {self.get_status_display()})"

    @property
    def chips_per_point(self):
        return GOSTOP_TIER_POINT_CHIPS.get(self.tier, 100)

    @property
    def buy_in(self):
        return self.chips_per_point * GOSTOP_BUY_IN_POINTS

    @property
    def max_chips(self):
        return GOSTOP_TIER_MAX_CHIPS.get(self.tier)


class GostopSeat(models.Model):
    """좌석 번호는 항상 0부터 빈틈없이 채운다 (= 판 진행 상태의 side 번호). 0번이 방장."""
    room = models.ForeignKey(GostopRoom, on_delete=models.CASCADE, related_name="seats")
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gostop_seat", verbose_name="사용자"
    )
    seat = models.PositiveSmallIntegerField(verbose_name="좌석 번호")
    stack = models.PositiveIntegerField(default=0, verbose_name="보유 스택")

    class Meta:
        ordering = ["room", "seat"]
        unique_together = [("room", "seat")]
        verbose_name = "고스톱 좌석"
        verbose_name_plural = "고스톱 좌석 목록"

    def __str__(self):
        return f"{self.room_id}번 방 {self.seat}번 - {self.user}"


class GostopGameLog(models.Model):
    """칩 이동 결과만 남긴다. 나가리 판은 winner가 비어 있다. 패자별 지불 내역은 detail."""
    room_number = models.PositiveIntegerField(verbose_name="방 번호")
    mode = models.CharField(max_length=10, default="matgo")
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="gostop_wins", verbose_name="승자"
    )
    chips = models.PositiveIntegerField(default=0, verbose_name="승자가 받은 칩")
    detail = models.JSONField(default=dict, blank=True, verbose_name="점수/지불 내역")
    ended_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-ended_at"]
        verbose_name = "고스톱 판 기록"
        verbose_name_plural = "고스톱 판 기록 목록"

    def __str__(self):
        return f"{self.room_number}번 방 - {self.chips}칩"


# ─────────────────────────────────────────────────────────────────────────────
# 요트 다이스 — 2~4인 방, 판 시작 때 각자 참가비(칩 지갑, AI는 하우스 계좌)를 내고
# 1등이 판돈을 가져간다(동점이면 나눔). 판 진행 상태는 YachtRoom.state JSON 하나에,
# 규칙/상태머신은 game/yacht_engine.py, AI는 game/yacht_ai.py.
# ─────────────────────────────────────────────────────────────────────────────

YACHT_STAKES = (1000, 5000, 10000)  # 방장이 고를 수 있는 참가비(칩) = 초보/중수/고수
YACHT_STAKE_TIERS = dict(zip(YACHT_STAKES, GAME_TIERS))


class YachtRoom(models.Model):
    STATUS_CHOICES = [("waiting", "대기 중"), ("playing", "진행 중")]

    capacity = models.PositiveSmallIntegerField(default=2, verbose_name="정원 (2~4)")
    stake = models.PositiveIntegerField(default=YACHT_STAKES[0], verbose_name="참가비(칩)")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="waiting")
    state = models.JSONField(default=dict, blank=True, verbose_name="판 진행 상태")
    pot = models.PositiveIntegerField(default=0, verbose_name="이번 판 판돈")
    turn_deadline = models.DateTimeField(null=True, blank=True, verbose_name="현재 차례 제한시각")
    next_game_at = models.DateTimeField(null=True, blank=True, verbose_name="다음 판 시작 예정시각")
    last_result = models.JSONField(default=dict, blank=True, verbose_name="직전 판 결과 요약")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "요트 방"
        verbose_name_plural = "요트 방 목록"

    def __str__(self):
        return f"요트 {self.pk}번 방 ({self.capacity}인, {self.stake}칩)"


class YachtSeat(models.Model):
    """좌석 번호는 0부터 빈틈없이 (= 판 진행 상태의 side 번호). 0번이 방장."""
    room = models.ForeignKey(YachtRoom, on_delete=models.CASCADE, related_name="seats")
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="yacht_seat", verbose_name="사용자"
    )
    seat = models.PositiveSmallIntegerField(verbose_name="좌석 번호")

    class Meta:
        ordering = ["room", "seat"]
        unique_together = [("room", "seat")]
        verbose_name = "요트 좌석"
        verbose_name_plural = "요트 좌석 목록"

    def __str__(self):
        return f"{self.room_id}번 방 {self.seat}번 - {self.user}"


class YachtGameLog(models.Model):
    room_number = models.PositiveIntegerField(verbose_name="방 번호")
    pot = models.PositiveIntegerField(default=0, verbose_name="판돈")
    detail = models.JSONField(default=dict, blank=True, verbose_name="점수/지급 내역")
    ended_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-ended_at"]
        verbose_name = "요트 판 기록"
        verbose_name_plural = "요트 판 기록 목록"

    def __str__(self):
        return f"{self.room_number}번 방 - 판돈 {self.pot}칩"
