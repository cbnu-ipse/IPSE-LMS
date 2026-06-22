from django.db import models
from django.conf import settings
from django.utils import timezone

POST = (
    ('News', 'News'),
    ('Event', 'Event'),
)

class NewsAndEventsManager(models.Manager):
    pass # 기존에 특별한 로직이 없었다면 이렇게 두면 돼!

class NewsAndEvents(models.Model):
    title = models.CharField(max_length=200, null=True, verbose_name="제목")
    summary = models.TextField(max_length=200, blank=True, null=True, verbose_name="내용 요약")
    posted_as = models.CharField(choices=POST, max_length=10, verbose_name="게시글 분류")
    updated_date = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)
    upload_time = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    event_date = models.DateField(null=True, blank=True, verbose_name="행사 진행 일자 (Event용)")
    thumbnail = models.ImageField(upload_to='activities/thumbnails/', null=True, blank=True, verbose_name="썸네일")
    objects = NewsAndEventsManager()

    def __str__(self):
        return self.title


class NewsAndEventsComment(models.Model):
    post = models.ForeignKey(
        NewsAndEvents,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author} - {self.post}"


# ─────────────────────────────────────────────
# 투표 (Poll)
# ─────────────────────────────────────────────

class Poll(models.Model):
    title = models.CharField(max_length=200, verbose_name="투표 제목")
    description = models.TextField(blank=True, verbose_name="설명")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="polls_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    starts_at = models.DateTimeField(null=True, blank=True, verbose_name="시작 일시")
    ends_at = models.DateTimeField(null=True, blank=True, verbose_name="마감 일시")
    is_multiple = models.BooleanField(default=False, verbose_name="복수 선택 허용")
    is_anonymous = models.BooleanField(default=False, verbose_name="익명 투표")
    is_active = models.BooleanField(default=True, verbose_name="활성 여부")
    show_as_notice = models.BooleanField(default=False, verbose_name="공지사항에 표시")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def is_closed(self):
        if not self.is_active:
            return True
        if self.ends_at and timezone.now() > self.ends_at:
            return True
        return False

    @property
    def total_voters(self):
        return self.votes.values("voter").distinct().count()


class PollChoice(models.Model):
    poll = models.ForeignKey(Poll, related_name="choices", on_delete=models.CASCADE)
    text = models.CharField(max_length=300, verbose_name="선택 항목")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "pk"]

    def __str__(self):
        return f"{self.poll.title} — {self.text}"

    @property
    def vote_count(self):
        return self.votes.count()


class PollVote(models.Model):
    poll = models.ForeignKey(Poll, related_name="votes", on_delete=models.CASCADE)
    choice = models.ForeignKey(PollChoice, related_name="votes", on_delete=models.CASCADE)
    voter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="poll_votes",
    )
    voted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("poll", "voter", "choice")


class PollComment(models.Model):
    poll = models.ForeignKey(Poll, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author} - {self.poll}"


# ─────────────────────────────────────────────
# 설문 (Survey)
# ─────────────────────────────────────────────

class Survey(models.Model):
    title = models.CharField(max_length=200, verbose_name="설문 제목")
    description = models.TextField(blank=True, verbose_name="설명")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="surveys_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    starts_at = models.DateTimeField(null=True, blank=True, verbose_name="시작 일시")
    ends_at = models.DateTimeField(null=True, blank=True, verbose_name="종료 일시")
    is_active = models.BooleanField(default=True, verbose_name="활성 여부")
    allow_duplicate_response = models.BooleanField(default=False, verbose_name="중복 응답 허용")
    is_anonymous = models.BooleanField(default=False, verbose_name="익명 응답")
    post = models.OneToOneField(
        'CommunityPost',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='survey',
        verbose_name="연관 게시글"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def is_closed(self):
        if not self.is_active:
            return True
        if self.ends_at and timezone.now() > self.ends_at:
            return True
        return False

    @property
    def response_count(self):
        return self.responses.values("respondent").distinct().count() if not self.is_anonymous else self.responses.count()


class SurveyQuestion(models.Model):
    QUESTION_TYPES = (
        ('CHOICE', '객관식'),
        ('TEXT', '주관식'),
        ('SCALE', '척도형 (1~5점)'),
    )

    survey = models.ForeignKey(Survey, related_name="questions", on_delete=models.CASCADE)
    question_text = models.TextField(verbose_name="질문")
    question_description = models.TextField(blank=True, verbose_name="질문 설명")
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES, default='CHOICE')
    required = models.BooleanField(default=True, verbose_name="필수 응답")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "pk"]

    def __str__(self):
        return f"[{self.survey.title}] {self.question_text}"


class SurveyQuestionChoice(models.Model):
    question = models.ForeignKey(SurveyQuestion, related_name="choices", on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=300, verbose_name="선택지")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "pk"]

    def __str__(self):
        return f"{self.question.question_text} — {self.choice_text}"


class SurveyResponse(models.Model):
    survey = models.ForeignKey(Survey, related_name="responses", on_delete=models.CASCADE)
    respondent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="survey_responses",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        respondent_name = self.respondent.display_name if self.respondent else "(익명)"
        return f"{self.survey.title} — {respondent_name}"


class SurveyAnswer(models.Model):
    response = models.ForeignKey(SurveyResponse, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE)
    choice = models.ForeignKey(
        SurveyQuestionChoice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    text_answer = models.TextField(blank=True, verbose_name="텍스트 답변")
    scale_answer = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="척도 답변 (1~5)")

    class Meta:
        unique_together = ("response", "question")

    def __str__(self):
        return f"{self.response} — {self.question.question_text}"


class SurveyComment(models.Model):
    survey = models.ForeignKey(Survey, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author} - {self.survey}"


# ─────────────────────────────────────────────
# 동아리 부원 모집 (Recruitment)
# ─────────────────────────────────────────────

class RecruitmentForm(models.Model):
    """모집 폼 (어드민이 생성/관리)"""
    title = models.CharField(max_length=200, verbose_name="모집 제목")
    description = models.TextField(blank=True, verbose_name="모집 설명")
    is_active = models.BooleanField(default=True, verbose_name="활성 여부")
    opens_at = models.DateTimeField(null=True, blank=True, verbose_name="시작 일시")
    closes_at = models.DateTimeField(null=True, blank=True, verbose_name="마감 일시")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recruitments_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def is_closed(self):
        if not self.is_active:
            return True
        if self.closes_at and timezone.now() > self.closes_at:
            return True
        if self.opens_at and timezone.now() < self.opens_at:
            return True
        return False


class RecruitmentApplication(models.Model):
    """지원서 제출 (로그인 불필요)"""
    form = models.ForeignKey(
        RecruitmentForm,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    name = models.CharField(max_length=50, verbose_name="이름")
    student_id = models.CharField(max_length=20, verbose_name="학번")
    department = models.CharField(max_length=100, verbose_name="학과")
    contact = models.CharField(max_length=50, verbose_name="연락처")
    motivation = models.TextField(verbose_name="지원 동기")
    submitted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="제출 IP")

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.form.title} — {self.name}({self.student_id})"


class CommunityPost(models.Model):
    title = models.CharField(max_length=200, verbose_name="제목")
    content = models.TextField(verbose_name="내용")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_posts",
        verbose_name="작성자"
    )
    views = models.PositiveIntegerField(default=0, verbose_name="조회수")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    is_notice = models.BooleanField(default=False, verbose_name="공지사항 여부")
    is_pinned = models.BooleanField(default=False, verbose_name="상단 고정 여부")
    category = models.CharField(
        max_length=20,
        choices=[('free', '자유게시판'), ('feedback', '피드백게시판')],
        default='free',
        verbose_name="게시판 분류"
    )
    is_anonymous = models.BooleanField(default=False, verbose_name="익명 게시")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def dislike_count(self):
        return self.dislikes.count()

    @property
    def comment_count(self):
        return self.community_comments.count()


class CommunityPostLike(models.Model):
    post = models.ForeignKey(
        CommunityPost,
        on_delete=models.CASCADE,
        related_name="likes",
        verbose_name="게시글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_post_likes",
        verbose_name="사용자"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="추천일시")

    class Meta:
        unique_together = ("post", "user")
        verbose_name = "게시글 추천"
        verbose_name_plural = "게시글 추천 목록"

    def __str__(self):
        return f"{self.user} liked {self.post}"


class CommunityComment(models.Model):
    post = models.ForeignKey(
        CommunityPost,
        on_delete=models.CASCADE,
        related_name="community_comments",
        verbose_name="게시글"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name='상위 댓글'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="작성자"
    )
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일시")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author} - {self.post}"

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def dislike_count(self):
        return self.dislikes.count()


class CommunityPostDislike(models.Model):
    post = models.ForeignKey(
        CommunityPost,
        on_delete=models.CASCADE,
        related_name="dislikes",
        verbose_name="게시글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_post_dislikes",
        verbose_name="사용자"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="비추천일시")

    class Meta:
        unique_together = ("post", "user")
        verbose_name = "게시글 비추천"
        verbose_name_plural = "게시글 비추천 목록"

    def __str__(self):
        return f"{self.user} disliked {self.post}"


class CommunityCommentLike(models.Model):
    comment = models.ForeignKey(
        CommunityComment,
        on_delete=models.CASCADE,
        related_name="likes",
        verbose_name="댓글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_comment_likes",
        verbose_name="사용자"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="추천일시")

    class Meta:
        unique_together = ("comment", "user")
        verbose_name = "댓글 추천"
        verbose_name_plural = "댓글 추천 목록"


class CommunityCommentDislike(models.Model):
    comment = models.ForeignKey(
        CommunityComment,
        on_delete=models.CASCADE,
        related_name="dislikes",
        verbose_name="댓글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_comment_dislikes",
        verbose_name="사용자"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="비추천일시")

    class Meta:
        unique_together = ("comment", "user")
        verbose_name = "댓글 비추천"
        verbose_name_plural = "댓글 비추천 목록"


class GatheringEvent(models.Model):
    title = models.CharField(max_length=200, verbose_name="모임 제목")
    description = models.TextField(verbose_name="모임 상세 설명")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gatherings_created",
        verbose_name="개설자"
    )
    event_date = models.DateTimeField(verbose_name="모임 일시")
    location = models.CharField(max_length=200, verbose_name="모임 장소")
    max_participants = models.PositiveIntegerField(verbose_name="최대 정원")
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="gathering_events",
        blank=True,
        verbose_name="참여자 목록"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="개설일시")
    is_canceled = models.BooleanField(default=False, verbose_name="취소 여부")
    category = models.CharField(
        max_length=10,
        choices=[('study', '스터디'), ('drink', '술')],
        default='study',
        verbose_name="모임 종류"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def participant_count(self):
        return self.participants.count()

    @property
    def is_full(self):
        return self.participant_count >= self.max_participants


class GatheringComment(models.Model):
    gathering = models.ForeignKey(
        GatheringEvent,
        on_delete=models.CASCADE,
        related_name="gathering_comments",
        verbose_name="번개 모임"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name='상위 댓글'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="작성자"
    )
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일시")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author} - {self.gathering}"

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def dislike_count(self):
        return self.dislikes.count()


class GatheringCommentLike(models.Model):
    comment = models.ForeignKey(
        GatheringComment,
        on_delete=models.CASCADE,
        related_name="likes",
        verbose_name="댓글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gathering_comment_likes",
        verbose_name="사용자"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="추천일시")

    class Meta:
        unique_together = ("comment", "user")
        verbose_name = "댓글 추천"
        verbose_name_plural = "댓글 추천 목록"


class GatheringCommentDislike(models.Model):
    comment = models.ForeignKey(
        GatheringComment,
        on_delete=models.CASCADE,
        related_name="dislikes",
        verbose_name="댓글"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gathering_comment_dislikes",
        verbose_name="사용자"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="비추천일시")

    class Meta:
        unique_together = ("comment", "user")
        verbose_name = "댓글 비추천"
        verbose_name_plural = "댓글 비추천 목록"


class GatheringLeaveLog(models.Model):
    """번개 모임 참가 취소 로그 (쿨타임 1시간 제한용)"""
    gathering = models.ForeignKey(
        GatheringEvent,
        on_delete=models.CASCADE,
        related_name='leave_logs',
        verbose_name="번개 모임"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gathering_leave_logs',
        verbose_name="사용자"
    )
    left_at = models.DateTimeField(auto_now=True, verbose_name="참가취소일시")

    class Meta:
        unique_together = ('gathering', 'user')
        verbose_name = "모임 참가 취소 로그"
        verbose_name_plural = "모임 참가 취소 로그 목록"

    def __str__(self):
        return f"{self.user.username} - {self.gathering.title} (Left: {self.left_at})"


class CommunityPostAttachment(models.Model):
    post = models.ForeignKey(
        'CommunityPost',
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name="게시글"
    )
    file = models.FileField(
        upload_to='post_attachments/%Y/%m/%d/',
        verbose_name="첨부파일"
    )
    filename = models.CharField(max_length=255, verbose_name="파일명")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="등록일시")

    class Meta:
        verbose_name = "게시글 첨부파일"
        verbose_name_plural = "게시글 첨부파일 목록"

    def __str__(self):
        return self.filename