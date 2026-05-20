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

    def __str__(self):
        return f"{self.voter} → {self.choice}"