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


def ai_cost(request):
    """버튼에 보일 AI 크레딧 비용 {작업: 비용}. 크레딧 없이 쓰는 사용자(강의자·운영진·관리자)와 비로그인은 빈 값."""
    from django.conf import settings

    from .ai import _is_exempt

    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated or _is_exempt(user):
        return {'ai_cost': {}}
    return {'ai_cost': {task: cost for task, cost in settings.AI_CREDIT_COSTS.items() if cost}}


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

