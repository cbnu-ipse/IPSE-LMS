from django.db import models
from django.conf import settings

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
        return f"{self.user.username} - {self.result_grade}(+{self.result_reward}) at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
