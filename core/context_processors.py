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


_JUDGE_PATH_PREFIXES = ('/course/', '/quiz/', '/contest/', '/problems/', '/compiler/')


def site_section(request):
    """구 judge/game 서브도메인이 담당하던 영역을 현재 경로 기준으로 구분해 템플릿에 전달"""
    path = request.path
    if path.startswith(_JUDGE_PATH_PREFIXES):
        section = 'judge'
    elif path.startswith('/game/'):
        section = 'game'
    else:
        section = 'community'
    return {'site_section': section}

