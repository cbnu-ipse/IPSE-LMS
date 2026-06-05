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