from django.conf import settings
from django.db import models


class ChatSession(models.Model):
    """어시스턴트와의 대화 하나. 사용자는 대화를 여러 개 만들어 주제별로 따로 이어갈 수 있다."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assistant_sessions")
    title = models.CharField(max_length=60, blank=True, verbose_name="대화 제목 (비어 있으면 첫 질문으로 자동)")
    summary = models.TextField(blank=True, verbose_name="오래된 대화 압축 요약")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def __str__(self):
        return f"{self.user} · {self.title or '새 대화'}"


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
