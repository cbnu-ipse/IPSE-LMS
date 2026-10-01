"""AI 플레이어 계정 (포커·고스톱·요트 공용)."""
from accounts.models import User


def free_bot():
    """지금 어느 게임에도 앉지 않은 AI 계정 (없으면 만든다). 트랜잭션 안에서 호출."""
    bot = (User.objects.filter(is_bot=True, gostop_seat__isnull=True, poker_seats__isnull=True,
                               yacht_seat__isnull=True)
           .order_by("id").first())
    if bot:
        return bot
    n = User.objects.filter(is_bot=True).count() + 1
    bot = User(username=f"AI-{n}", is_bot=True, is_active=False)
    bot.set_unusable_password()
    bot.save()
    return bot
