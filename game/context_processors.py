def pending_season_reward(request):
    """로그인한 사용자의 미확인 시즌 보상 정산 클레임을 컨텍스트에 주입한다."""
    if not request.user.is_authenticated:
        return {}
    from game.models import GameSeason, SeasonRewardClaim
    # 게임/랭킹 페이지를 방문해야만 시즌 종료가 확인되던 문제 방지 - 모든 페이지 접속 시 확인
    GameSeason.get_or_create_current()
    claim = SeasonRewardClaim.objects.filter(user=request.user, shown=False).first()
    return {"pending_season_reward": claim}
