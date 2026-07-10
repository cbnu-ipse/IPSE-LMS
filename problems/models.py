from django.db import models
from django.conf import settings
from django.urls import reverse
from course.models import CourseCategory
import os


class Problem(models.Model):
    DIFFICULTY_CHOICES = [(i, f"Level {i}") for i in range(1, 11)]

    title = models.CharField(max_length=200, verbose_name="문제 제목")
    category = models.ForeignKey(
        CourseCategory,
        # beta_judge DB로 분리되어 있어 Django가 cross-db SET_NULL을 처리할 수 없음.
        # 실제 정리는 course/signals.py의 pre_delete 핸들러가 수행한다.
        on_delete=models.DO_NOTHING,
        null=True,
        verbose_name="분야",
        db_constraint=False,
    )
    difficulty = models.IntegerField(
        choices=DIFFICULTY_CHOICES,
        default=1,
        verbose_name="난이도",
    )
    points = models.IntegerField(default=100, verbose_name="보상 포인트")
    description = models.TextField(verbose_name="문제 설명")
    flag = models.CharField(max_length=100, verbose_name="정답(Flag)")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        # beta_judge DB로 분리되어 있어 Django가 cross-db CASCADE를 처리할 수 없음.
        # 실제 정리는 accounts/signals.py의 pre_delete 핸들러가 수행한다.
        on_delete=models.DO_NOTHING,
        verbose_name="출제자",
        db_constraint=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        category_title = self.category.title if self.category else "미분류"
        return f"[{category_title}] {self.title}"

    def get_absolute_url(self):
        return reverse("problem_detail", kwargs={"pk": self.pk})


class SolveRecord(models.Model):
    STATUS_CHOICES = [
        ("TODO", "시도 전"),
        ("ATTEMPT", "시도 중"),
        ("SOLVED", "해결"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        # beta_judge DB로 분리되어 있어 Django가 cross-db CASCADE를 처리할 수 없음.
        # 실제 정리는 accounts/signals.py의 pre_delete 핸들러가 수행한다.
        on_delete=models.DO_NOTHING,
        related_name="solve_records",
        db_constraint=False,
    )
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="TODO")
    solved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "problem")
        ordering = ["-solved_at"]

    def __str__(self):
        return f"{self.user} - {self.problem} - {self.status}"


class ProblemAttachment(models.Model):
    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    file = models.FileField(upload_to="problem_files/", verbose_name="첨부파일")

    @property
    def filename(self):
        return os.path.basename(self.file.name)


class ProblemComment(models.Model):
    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    # beta_judge DB로 분리되어 있어 Django가 cross-db CASCADE를 처리할 수 없음.
    # 실제 정리는 accounts/signals.py의 pre_delete 핸들러가 수행한다.
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, db_constraint=False)
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author} - {self.problem}"