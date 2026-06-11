from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import json
from django.http import JsonResponse, HttpResponse
from django.template.loader import render_to_string
from django.views.decorators.http import require_POST
from django.db.models import Q
from community.models import NewsAndEvents, Poll
from .models import ActivityLog, Schedule 
from ranking.utils import sync_user_profile_metrics


def introduce_view(request):
    """소개 페이지 렌더링"""
    return render(request, "introduce.html")


def _current_semester_start():
    from django.utils import timezone
    now = timezone.now()
    if 3 <= now.month <= 8:
        return now.replace(month=3, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif now.month >= 9:
        return now.replace(month=9, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        return now.replace(year=now.year - 1, month=9, day=1, hour=0, minute=0, second=0, microsecond=0)


# ########################################################
# 1. IPSE 메인 대시보드 (Traffic Controller)
# ########################################################
@login_required
def home_view(request):
    """유저의 로그인 상태를 확인하고 대시보드에 필요한 모든 데이터를 공급함"""
    
    # 1. 오른쪽 위 공지사항 (News)
    notices = NewsAndEvents.objects.filter(posted_as='News').order_by('-upload_time')[:5]

    # 1b. 진행 중인 투표 (홈 새로운 소식 섹션용)
    from django.utils import timezone
    active_polls = Poll.objects.filter(is_active=True).exclude(
        ends_at__lte=timezone.now()
    ).order_by('-created_at')[:3]
    
    # 2. 왼쪽 아래 달력용 데이터 (Event)
    events = NewsAndEvents.objects.filter(posted_as='Event').order_by('-upload_time')[:5]
    
    # 3. 오른쪽 아래 활동 내역 (해당 유저의 활동만)
    activity_logs = ActivityLog.objects.filter(user=request.user)[:10]
    metrics = sync_user_profile_metrics(request.user)

    # 4. 미완료된 LMS 과제 일정 (마감일 기준 오름차순, 이번 학기 과제만 최대 5개)
    semester_start = _current_semester_start()
    incomplete_assignments = Schedule.objects.filter(
        user=request.user,
        external_id__startswith='lms:',
        is_completed=False,
        start_date__gte=semester_start
    ).order_by('start_date')[:5]

    for assign in incomplete_assignments:
        desc = assign.description or ""
        if desc.startswith('{'):
            try:
                import json
                data = json.loads(desc)
                assign.course_name = data.get("course_name", "과목 정보 없음")
                assign.intro = data.get("intro", "")
                assign.attachments = data.get("attachments", [])
            except:
                assign.course_name = desc.split('\n')[0] if desc else "과목 정보 없음"
                assign.intro = ""
                assign.attachments = []
        else:
            assign.course_name = desc.split('\n')[0] if desc else "과목 정보 없음"
            assign.intro = ""
            assign.attachments = []

    # 하루 1회 백그라운드 LMS 자동 연동 트리거 체크 (자동 로그인 세션 대응)
    import datetime
    today_str = datetime.date.today().isoformat()
    last_sync = request.session.get('last_lms_sync_date')
    trigger_lms_sync = False

    # 마지막 동기화 날짜가 오늘이 아니거나, 수동 로그인 직후(just_logged_in)인 경우 트리거
    if last_sync != today_str or request.session.get('just_logged_in'):
        trigger_lms_sync = True
        request.session['last_lms_sync_date'] = today_str
        request.session['just_logged_in'] = False

    context = {
        'notices': notices,
        'active_polls': active_polls,
        'events': events,
        'activity_logs': activity_logs,
        'incomplete_assignments': incomplete_assignments,
        'learning_level': metrics['level'],
        'problem_points': metrics['problem_points'],
        'contest_wins': metrics['contest_wins'],
        'trigger_lms_sync': trigger_lms_sync,
        'title': 'IPSE AI Academy 대시보드'
    }
    return render(request, 'core/index.html', context)

# ... (이 아래 get_schedules_api 등 달력 로직은 기존 코드 100% 그대로 유지!) ...

@login_required
def get_schedules_api(request):
    """달력에 표시할 일정들을 JSON으로 반환하는 API"""
    semester_start = _current_semester_start()

    all_schedules = Schedule.objects.filter(Q(is_global=True) | Q(user=request.user)).distinct()
    # LMS 과제(external_id=lms:assign:...)는 현재 학기 이후 마감인 것만 표시
    schedules = [
        s for s in all_schedules
        if not s.external_id.startswith("lms:assign:") or s.start_date >= semester_start
    ]

    events = []
    for s in schedules:
        is_lms = s.external_id.startswith("lms:")
        if is_lms:
            color = '#cbd5e1' if s.is_completed else '#f97316'
        else:
            color = '#10b981' if s.is_global else '#a855f7'

        desc_val = s.description or ""
        if is_lms and desc_val.startswith('{'):
            try:
                import json
                desc_val = json.loads(desc_val)
            except:
                pass

        # 하루 종일 이벤트: end가 없고 시작 시각이 자정(00:00:00)인 경우
        end_val = s.end_date.isoformat() if s.end_date else None
        if is_lms:
            # LMS 과제인 경우, 한국 표준시(KST) 기준으로 날짜를 파싱하여 종일 일정(allDay)으로 내려보냅니다.
            # 이를 통해 FullCalendar 타임존 및 듀레이션 해석 버그로 인해 다음날까지 막대가 걸쳐지는 현상을 원천 방지합니다.
            import zoneinfo
            kst = zoneinfo.ZoneInfo("Asia/Seoul")
            kst_start = s.start_date.astimezone(kst)
            start_val = kst_start.date().isoformat()
            end_val = None
            is_all_day_event = True
        else:
            is_all_day_event = (s.end_date is None and s.start_date.hour == 0
                                and s.start_date.minute == 0 and s.start_date.second == 0)
            start_val = s.start_date.date().isoformat() if is_all_day_event else s.start_date.isoformat()
            is_all_day_event = bool(is_all_day_event)

        events.append({
            'id': s.id,
            'title': s.title,
            'start': start_val,
            'end': end_val,
            'color': color,
            'allDay': is_all_day_event,
            'extendedProps': {
                'description': desc_val,
                'is_global': s.is_global,
                'event_type': 'schedule',
                'is_completed': s.is_completed,
                'is_lms': is_lms,
            }
        })

    return JsonResponse(events, safe=False)

@login_required
@require_POST
def add_schedule_api(request):
    """새로운 일정을 데이터베이스에 저장하는 API"""
    try:
        data = json.loads(request.body)
        is_global = data.get('is_global', False)

        # 💡 보안 검증: 일반 유저가 악의적으로 전체 일정을 만들려고 하면 강제로 개인 일정으로 변경
        if not request.user.is_staff:
            is_global = False

        Schedule.objects.create(
            title=data.get('title'),
            description=data.get('description', ''),
            start_date=data.get('start'),
            end_date=data.get('end'),
            user=request.user,
            is_global=is_global
        )
        return JsonResponse({"status": "success"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)

@login_required
@require_POST
def delete_schedule_api(request, sch_id):
    """일정을 삭제하는 API"""
    try:
        schedule = get_object_or_404(Schedule, id=sch_id)
        
        if schedule.user != request.user and not request.user.is_staff:
            return JsonResponse({"status": "error", "message": "권한이 없습니다."}, status=403)

        schedule.delete()
        return JsonResponse({"status": "success"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)

@login_required
@require_POST
def update_schedule_api(request, sch_id):
    """기존 일정을 수정하는 API"""
    try:
        schedule = get_object_or_404(Schedule, id=sch_id)
        
        # 권한 체크: 내가 쓴 글이거나 관리자(staff)여야만 수정 가능
        if schedule.user != request.user and not request.user.is_staff:
            return JsonResponse({"status": "error", "message": "권한이 없습니다."}, status=403)

        data = json.loads(request.body)
        schedule.title = data.get('title', schedule.title)
        schedule.description = data.get('description', schedule.description)
        schedule.start_date = data.get('start', schedule.start_date)
        schedule.end_date = data.get('end', schedule.end_date)
        
        if request.user.is_staff:
            schedule.is_global = data.get('is_global', schedule.is_global)

        schedule.save()
        return JsonResponse({"status": "success"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


def manifest_json(request):
    content = render_to_string('manifest.json', {}, request=request)
    return HttpResponse(content, content_type='application/manifest+json')


def service_worker(request):
    content = render_to_string('sw.js', {}, request=request)
    response = HttpResponse(content, content_type='application/javascript')
    response['Service-Worker-Allowed'] = '/'
    response['Cache-Control'] = 'no-cache'
    return response


def offline_view(request):
    return render(request, 'offline.html')

