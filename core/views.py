from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import json
from django.http import JsonResponse, HttpResponse
from django.template.loader import render_to_string
from django.views.decorators.http import require_POST
from django.db.models import Q
from community.models import NewsAndEvents, Survey, CommunityPost, GatheringEvent
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
    from django.utils import timezone
    
    # 1. 오른쪽 위 공지사항 (News) - 상단 고정 체크된 것만 표시
    notices = CommunityPost.objects.filter(is_notice=True, is_pinned=True).order_by('-created_at')[:5]

    # 1d. 진행 중인 번개 모임 (홈 새로운 소식 섹션용)
    active_gatherings = GatheringEvent.objects.filter(
        is_canceled=False,
        event_date__gt=timezone.now()
    ).select_related('author').order_by('event_date')[:3]

    # 1c. 주간 핫 게시물 계산 (최근 7일) - 일정 수치(좋아요 1개 이상 혹은 조회수 5회 이상) 넘은 것 중 TOP 3
    import datetime as dt_module
    seven_days_ago = timezone.now() - dt_module.timedelta(days=7)
    recent_posts = list(CommunityPost.objects.filter(created_at__gte=seven_days_ago, is_notice=False).select_related('author'))
    qualified_posts = [p for p in recent_posts if p.like_count > 0 or p.views >= 5]
    hot_posts = sorted(
        qualified_posts,
        key=lambda p: p.views + (p.comment_count * 5) + (p.like_count * 10),
        reverse=True
    )[:3]
    
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

    import datetime
    import zoneinfo
    kst = zoneinfo.ZoneInfo("Asia/Seoul")
    today = datetime.date.today()

    for assign in incomplete_assignments:
        desc = assign.description or ""
        if desc.startswith('{'):
            try:
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

        # D-Day 계산 (KST 기준)
        assign_date = assign.start_date.astimezone(kst).date()
        delta_days = (assign_date - today).days
        if delta_days == 0:
            assign.d_day_str = "D-Day"
        elif delta_days > 0:
            assign.d_day_str = f"D-{delta_days}"
        else:
            assign.d_day_str = f"D+{abs(delta_days)} (지남)"

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
        'active_gatherings': active_gatherings,
        'hot_posts': hot_posts,
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
    import zoneinfo
    kst = zoneinfo.ZoneInfo("Asia/Seoul")

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
        is_gathering = s.external_id.startswith("gathering:")
        if is_lms:
            color = '#cbd5e1' if s.is_completed else '#f97316'
        else:
            color = '#10b981' if s.is_global else '#a855f7'

        desc_val = s.description or ""
        if is_lms and desc_val.startswith('{'):
            try:
                desc_val = json.loads(desc_val)
            except:
                pass

        # 한국 표준시(KST) 기준으로 날짜/시간을 파싱하여 종일 및 일반 일정 시간대를 일치시킵니다.
        kst_start = s.start_date.astimezone(kst)
        kst_end = s.end_date.astimezone(kst) if s.end_date else None

        if is_lms:
            # LMS 과제는 종일 일정으로 처리
            start_val = kst_start.date().isoformat()
            end_val = None
            is_all_day_event = True
        else:
            is_all_day_event = (s.end_date is None and kst_start.hour == 0
                                and kst_start.minute == 0 and kst_start.second == 0)
            start_val = kst_start.date().isoformat() if is_all_day_event else kst_start.isoformat()
            end_val = kst_end.isoformat() if kst_end else None
            is_all_day_event = bool(is_all_day_event)

        # 번개 모임 ID 추출
        gathering_id = None
        if is_gathering:
            try:
                gathering_id = int(s.external_id.split(':')[1])
            except:
                pass

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
                'event_type': 'gathering' if is_gathering else ('lms' if is_lms else 'schedule'),
                'gathering_id': gathering_id,
                'is_completed': s.is_completed,
                'is_lms': is_lms,
                'recurrence_group': s.recurrence_group,
                'recurrence_type': s.recurrence_type,
            }
        })

    return JsonResponse(events, safe=False)

@login_required
@require_POST
def add_schedule_api(request):
    """새로운 일정을 데이터베이스에 저장하는 API"""
    try:
        import datetime
        import uuid
        import calendar
        from django.utils.dateparse import parse_datetime
        from django.utils import timezone

        def add_months(sourcedate, months):
            month = sourcedate.month - 1 + months
            year = sourcedate.year + month // 12
            month = month % 12 + 1
            day = min(sourcedate.day, calendar.monthrange(year, month)[1])
            return sourcedate.replace(year=year, month=month, day=day)

        def add_years(sourcedate, years):
            try:
                return sourcedate.replace(year=sourcedate.year + years)
            except ValueError:
                return sourcedate.replace(year=sourcedate.year + years, day=28)

        data = json.loads(request.body)
        is_global = data.get('is_global', False)

        # 💡 보안 검증: 일반 유저가 악의적으로 전체 일정을 만들려고 하면 강제로 개인 일정으로 변경
        if not request.user.is_staff:
            is_global = False

        recurrence_type = data.get('recurrence_type', 'NONE')
        recurrence_end_str = data.get('recurrence_end') # YYYY-MM-DD
        
        start_dt = parse_datetime(data.get('start'))
        end_dt = parse_datetime(data.get('end')) if data.get('end') else None

        if start_dt and timezone.is_naive(start_dt):
            start_dt = timezone.make_aware(start_dt)
        if end_dt and timezone.is_naive(end_dt):
            end_dt = timezone.make_aware(end_dt)

        if recurrence_type == 'NONE':
            Schedule.objects.create(
                title=data.get('title'),
                description=data.get('description', ''),
                start_date=start_dt,
                end_date=end_dt,
                user=request.user,
                is_global=is_global
            )
        else:
            recur_group = str(uuid.uuid4())
            # recurrence_end_str가 'YYYY-MM-DD' 형식으로 옴
            recurrence_end = None
            if recurrence_end_str:
                recurrence_end = parse_datetime(recurrence_end_str + "T23:59:59")
                if recurrence_end and timezone.is_naive(recurrence_end):
                    recurrence_end = timezone.make_aware(recurrence_end)

            max_end = start_dt + datetime.timedelta(days=730) # 최대 2년
            if not recurrence_end or recurrence_end > max_end:
                recurrence_end = max_end

            current_start = start_dt
            current_end = end_dt
            duration = (end_dt - start_dt) if end_dt else None

            count = 0
            while current_start <= recurrence_end and count < 100:
                Schedule.objects.create(
                    title=data.get('title'),
                    description=data.get('description', ''),
                    start_date=current_start,
                    end_date=current_end,
                    user=request.user,
                    is_global=is_global,
                    recurrence_type=recurrence_type,
                    recurrence_group=recur_group
                )
                count += 1
                if recurrence_type == 'DAILY':
                    current_start += datetime.timedelta(days=1)
                elif recurrence_type == 'WEEKLY':
                    current_start += datetime.timedelta(weeks=1)
                elif recurrence_type == 'MONTHLY':
                    current_start = add_months(current_start, 1)
                elif recurrence_type == 'YEARLY':
                    current_start = add_years(current_start, 1)
                else:
                    break

                if duration:
                    current_end = current_start + duration
                else:
                    current_end = None

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

        delete_type = 'one'
        try:
            data = json.loads(request.body)
            delete_type = data.get('delete_type', 'one')
        except Exception:
            delete_type = request.POST.get('delete_type', 'one')

        if delete_type == 'all' and schedule.recurrence_group:
            Schedule.objects.filter(recurrence_group=schedule.recurrence_group).delete()
        else:
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
        
        if schedule.user != request.user and not request.user.is_staff:
            return JsonResponse({"status": "error", "message": "권한이 없습니다."}, status=403)

        data = json.loads(request.body)
        update_type = data.get('update_type', 'one')

        new_title = data.get('title', schedule.title)
        new_description = data.get('description', schedule.description)
        new_start_str = data.get('start')
        new_end_str = data.get('end')
        new_is_global = data.get('is_global', schedule.is_global)

        from django.utils.dateparse import parse_datetime
        from django.utils import timezone
        
        new_start = parse_datetime(new_start_str) if new_start_str else None
        new_end = parse_datetime(new_end_str) if new_end_str else None

        if new_start and timezone.is_naive(new_start):
            new_start = timezone.make_aware(new_start)
        if new_end and timezone.is_naive(new_end):
            new_end = timezone.make_aware(new_end)

        if update_type == 'all' and schedule.recurrence_group:
            if new_start:
                time_delta = new_start - schedule.start_date
            else:
                time_delta = None

            group_schedules = Schedule.objects.filter(recurrence_group=schedule.recurrence_group)
            for s in group_schedules:
                s.title = new_title
                s.description = new_description
                if time_delta:
                    s.start_date = s.start_date + time_delta
                    if s.end_date:
                        s.end_date = s.end_date + time_delta
                elif new_end_str is None:
                    s.end_date = None

                if request.user.is_staff:
                    s.is_global = new_is_global
                s.save()
        else:
            schedule.title = new_title
            schedule.description = new_description
            if new_start:
                schedule.start_date = new_start
            if new_end_str is not None:
                schedule.end_date = new_end
            
            if schedule.recurrence_group:
                schedule.recurrence_group = ""
                schedule.recurrence_type = "NONE"

            if request.user.is_staff:
                schedule.is_global = new_is_global
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

