from django_hosts import patterns, host

host_patterns = patterns(
    '',
    # 대회/문제풀이 전용 서브도메인 (예: judge.cbnu-ipse.co.kr, judge.localhost)
    host(r'judge', 'config.urls_judge', name='judge'),

    # 게임 전용 서브도메인 (예: game.cbnu-ipse.co.kr, game.localhost)
    host(r'game', 'config.urls_game', name='game'),

    # 커뮤니티/동아리 전용 메인 도메인 (예: cbnu-ipse.co.kr, localhost)
    host(r'(www)?', 'config.urls_community', name='community'),
)
