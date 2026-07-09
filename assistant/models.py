from django.conf import settings
from django.db import models


class ChatSession(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assistant_session")
    summary = models.TextField(blank=True, verbose_name="오래된 대화 압축 요약")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} 어시스턴트 세션"


class ChatMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user", "사용자"
        ASSISTANT = "assistant", "어시스턴트"

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=Role.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:30]}"
