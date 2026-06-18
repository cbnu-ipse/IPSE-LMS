from django.db import models
from django.conf import settings

class TimetableSubject(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='timetable_subjects'
    )
    subject_name = models.CharField(max_length=100, verbose_name="과목명")
    professor = models.CharField(max_length=100, blank=True, verbose_name="교수명")
    classroom = models.CharField(max_length=100, blank=True, verbose_name="강의실")
    day_of_week = models.IntegerField(
        choices=[(0, '월'), (1, '화'), (2, '수'), (3, '목'), (4, '금')],
        verbose_name="요일"
    )
    start_time = models.TimeField(verbose_name="시작 시간")
    end_time = models.TimeField(verbose_name="종료 시간")
    color = models.CharField(max_length=50, blank=True, verbose_name="테마 색상")

    class Meta:
        verbose_name = "시간표 과목"
        verbose_name_plural = "시간표 과목 목록"

    def __str__(self):
        return f"[{self.user.username}] {self.subject_name}"
