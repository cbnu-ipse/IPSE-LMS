def pending_season_reward(request):
    """로그인한 사용자의 미확인 시즌 보상 정산 클레임을 컨텍스트에 주입한다."""
    if not request.user.is_authenticated:
        return {}
    from game.models import SeasonRewardClaim
    claim = SeasonRewardClaim.objects.filter(user=request.user, shown=False).first()
    return {"pending_season_reward": claim}
