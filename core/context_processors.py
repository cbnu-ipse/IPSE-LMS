from django.utils import timezone
from django.db.models import Q
from community.models import RecruitmentForm

def active_recruitments(request):
    """현재 모집 기간 중이고 활성화되어 있는 모집 폼을 템플릿 컨텍스트에 추가"""
    now = timezone.now()
    active_forms = RecruitmentForm.objects.filter(is_active=True).filter(
        Q(opens_at__isnull=True) | Q(opens_at__lte=now)
    ).filter(
        Q(closes_at__isnull=True) | Q(closes_at__gte=now)
    )
    return {
        'active_recruitment_form': active_forms.first(),
    }


def vapid_settings(request):
    """VAPID 웹 푸시 공개키를 템플릿에 추가"""
    from django.conf import settings
    return {
        'VAPID_PUBLIC_KEY': getattr(settings, 'VAPID_PUBLIC_KEY', ''),
    }


def ai_usage(request):
    """헤더에 보일 이번 주 AI 사용량 {used, limit, percent, label, reset_at}. 로그인한 사용자만, 한도가 없는 사용자(강의자)는 None."""
    from . import usage

    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return {'ai_usage': None}
    if not hasattr(request, '_ai_usage'):      # 한 요청에서 한 번만 센다
        request._ai_usage = usage.info(user)
    return {'ai_usage': request._ai_usage}


def ai_cost(request):
    """작업별 예상 사용량 점수 {작업: 점수} (AI_COST_<작업>). 시작 전 확인과 화면 계산용이고, 실제 사용량은 토큰으로 센다."""
    from django.conf import settings

    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return {'ai_cost': {}}
    costs = {task: cost for task, cost in settings.AI_CREDIT_COSTS.items() if cost}
    if costs.get('summary'):   # 자료 하나는 길이에 따라 여러 조각이 되므로 최대 비용도 보여 준다 (업로드 버튼)
        from mypage.ai import SUMMARY_MAX_CHUNKS
        costs['summary_max'] = costs['summary'] * SUMMARY_MAX_CHUNKS
    return {'ai_cost': costs}


_JUDGE_PATH_PREFIXES = ('/course/', '/quiz/', '/contest/', '/problems/', '/compiler/', '/mypage/')


def site_section(request):
    """구 judge/game 서브도메인이 담당하던 영역을 현재 경로 기준으로 구분해 템플릿에 전달"""
    path = request.path
    if path.startswith(_JUDGE_PATH_PREFIXES) or (path.startswith('/ranking/') and not path.startswith('/ranking/community/')):
        section = 'judge'  # 문제·대회 랭킹은 judge 메뉴 안에서 보여야 한다 (커뮤니티 랭킹만 잎새 쪽)
    elif path.startswith('/game/'):
        section = 'game'
    else:
        section = 'community'
    return {'site_section': section}

