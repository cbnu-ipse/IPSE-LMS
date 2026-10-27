"""주간 사용 한도를 쓰는 테스트가 함께 쓰는 도우미."""
from django.utils import timezone

from . import usage
from .models import AIUsage


def use_up(user, points, when=None):
    """이번 주(또는 when) 이 사용자의 AI 사용량을 points점만큼 쌓는다 (gemini-3.6-flash 출력 토큰으로 환산한 기록 한 줄)."""
    price_out = usage.price_for("gemini-3.6-flash")[1]
    tokens = int(points * (usage.settings.AI_POINT_USD * 1_000_000 / price_out))
    return AIUsage.objects.create(user=user, task="summary", model="gemini-3.6-flash", completion_tokens=tokens,
                                  created_at=when or timezone.now())
