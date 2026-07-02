from django.shortcuts import render, redirect, get_object_or_404
from django.db import transaction
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.views import LoginView
from .forms import StudentSignUpForm, KoreanAuthenticationForm
import json
import urllib.request
import urllib.parse
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import PasswordResetView
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import reverse_lazy
from django.core.mail import BadHeaderError
from .models import Student, User, LMSToken, LeafCode, LeafCodeUsage
from core.models import Schedule
from .forms import (
    EmailValidationOnForgotPassword,
    ProfileUpdateForm,
    StaffAddForm,
    StudentEditForm,
    StaffEditForm,
    AdminStudentAddForm,
    StudentLevelForm,
)
from .filters import StudentFilter, LecturerFilter


class KoreanLoginView(LoginView):
    authentication_form = KoreanAuthenticationForm


def register(request):
    if request.method == 'POST':
        form = StudentSignUpForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.info(
                request,
                "회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다."
            )
            return redirect('login')
        else:
            messages.error(request, "입력하신 정보를 다시 확인해 주세요.")
    else:
        form = StudentSignUpForm()

    return render(request, 'registration/register.html', {'form': form})


class UserPasswordResetView(PasswordResetView):
    template_name = "registration/password_reset.html"
    email_template_name = "registration/password_reset_email.txt"
    html_email_template_name = "registration/password_reset_email_html.html"
    subject_template_name = "registration/password_reset_subject.txt"
    form_class = EmailValidationOnForgotPassword
    success_url = reverse_lazy("password_reset_done")

    def form_valid(self, form):
        try:
            return super().form_valid(form)
        except (ConnectionError, TimeoutError, OSError, BadHeaderError):
            messages.error(
                self.request,
                "이메일 전송에 실패했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해 주세요.",
            )
            return self.form_invalid(form)

@login_required
@require_POST
def update_profile_api(request):
    """비동기(Fetch API)로 프로필 정보를 업데이트하는 JSON 엔드포인트"""
    try:
        # 1. 프론트엔드에서 보낸 JSON 데이터 파싱
        data = json.loads(request.body)
        
        # 2. 유저와 연결된 Student 객체 가져오기 (없으면 안전하게 생성)
        student, created = Student.objects.get_or_create(student=request.user)
        
        # 3. 데이터 업데이트
        nickname = data.get('nickname', student.nickname).strip()
        if len(nickname) > 30:
            return JsonResponse({"status": "error", "message": "닉네임은 30자 이하로 입력해주세요."}, status=400)

        student.nickname = nickname
        student.bio = data.get('bio', student.bio)
        student.github_url = data.get('github_url', student.github_url)
        student.blog_url = data.get('blog_url', student.blog_url)
        student.save()
        
        # 4. 성공 JSON 응답
        return JsonResponse({"status": "success", "message": "프로필이 업데이트되었습니다."})
        
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)

@login_required
@require_POST
def update_profile_picture(request):
    """프로필 이미지를 비동기로 업로드하거나 삭제하는 뷰"""
    user = request.user
    action = request.POST.get('action')

    try:
        if action == 'upload' and 'picture' in request.FILES:
            # 1. 사용자가 이미지를 올린 경우
            user.picture = request.FILES['picture']
            user.save() # models.py에 정의해둔 썸네일 리사이징 로직이 자동 실행됨
            
        elif action == 'delete':
            # 2. X 버튼을 눌러 삭제한 경우 (null로 만들거나 default 이미지로 리셋)
            # models.py에서 default="default.png"로 설정해두었으므로 빈 값을 넣으면 기본 처리됨
            user.picture.delete(save=False) # 기존 물리 파일 삭제 (선택 사항)
            user.picture = "default.png"
            user.save()
            
        # 업데이트된 이미지의 URL을 프론트엔드로 반환하여 화면을 갱신시킴
        return JsonResponse({"status": "success", "image_url": user.get_picture()})
        
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


@login_required
@require_POST
def redeem_code_api(request):
    """보상 코드를 검증하고 사용자에게 낙엽을 지급합니다."""
    try:
        data = json.loads(request.body)
        code_input = data.get("code", "").strip()
        
        if not code_input:
            return JsonResponse({"status": "error", "message": "코드를 입력해 주세요."}, status=400)
            
        with transaction.atomic():
            # 1. 활성화된 코드 정보 락을 걸고 조회
            leaf_code = LeafCode.objects.filter(code=code_input, is_active=True).select_for_update().first()
            if not leaf_code:
                return JsonResponse({"status": "error", "message": "유효하지 않거나 만료된 코드입니다."}, status=400)
                
            # 2. 이미 사용했는지 확인
            already_used = LeafCodeUsage.objects.filter(user=request.user, leaf_code=leaf_code).exists()
            if already_used:
                return JsonResponse({"status": "error", "message": "이미 사용한 보상 코드입니다."}, status=400)
                
            # 3. 사용 이력 등록 및 낙엽 지급
            LeafCodeUsage.objects.create(user=request.user, leaf_code=leaf_code)
            request.user.adjust_leaves(
                amount=leaf_code.amount,
                transaction_type="code_redemption",
                description=f"보상 코드 등록: {leaf_code.code}"
            )
            
        # 갱신된 사용자의 보유 낙엽량 반환
        request.user.refresh_from_db()
        return JsonResponse({
            "status": "success", 
            "message": f"성공적으로 {leaf_code.amount}개의 낙엽이 지급되었습니다.",
            "leaves": request.user.leaves
        })
        
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


# ─── Profile Views ────────────────────────────────────────────────────────────

@login_required
def profile(request):
    """로그인한 사용자의 프로필 페이지"""
    from django.utils import timezone
    from datetime import timedelta
    from .models import Attendance, get_attendance_streak

    user = request.user
    courses = None
    if user.is_lecturer:
        from course.models import Course
        courses = Course.objects.filter(instructor=user)

    student_obj = None
    if user.is_student:
        student_obj = getattr(user, 'student', None)

    leaf_transactions = user.leaf_transactions.all().order_by('-created_at')[:10]

    # 출석 히트맵 데이터 준비 (GitHub contribution 스타일, KST 기준 52주)
    from datetime import date as dt_date, timedelta as td
    kst_now = timezone.now() + timedelta(hours=9)
    today_kst = kst_now.date()

    # 51주 전 월요일부터 시작
    start_date = today_kst - td(weeks=51)
    start_date -= td(days=start_date.weekday())  # 월요일로 정렬

    all_attendance = set(
        Attendance.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=today_kst,
        ).values_list('date', flat=True)
    )

    MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
    heatmap_weeks = []
    month_labels = []
    current_month = None
    cur = start_date

    for col in range(52):
        week_cells = []
        for row in range(7):  # 0=월 ... 6=일
            d = cur + td(days=row)
            is_future = d > today_kst
            week_cells.append({
                'date': d.isoformat(),
                'day': d.day,
                'month': d.month,
                'attended': (not is_future) and (d in all_attendance),
                'is_today': d == today_kst,
                'is_future': is_future,
            })
            if row == 0 and d.month != current_month:
                month_labels.append({'col': col, 'label': MONTH_NAMES[d.month - 1]})
                current_month = d.month
        heatmap_weeks.append(week_cells)
        cur += td(weeks=1)

    total_attendance = Attendance.objects.filter(user=user).count()
    already_attended_today = today_kst in all_attendance

    # 오늘 출석했으면 오늘 기준, 아직 안 했으면 어제 기준으로 연속 출석 계산
    if already_attended_today:
        streak = get_attendance_streak(user, today_kst)
        streak_is_current = True
    else:
        yesterday_kst = today_kst - td(days=1)
        streak = get_attendance_streak(user, yesterday_kst)
        streak_is_current = False

    from django.conf import settings
    return render(request, 'accounts/profile.html', {
        'title': '내 프로필',
        'courses': courses,
        'level': student_obj,
        'leaf_transactions': leaf_transactions,
        'heatmap_weeks': heatmap_weeks,
        'month_labels': month_labels,
        'today_kst': today_kst,
        'total_attendance': total_attendance,
        'streak': streak,
        'streak_is_current': streak_is_current,
        'already_attended_today': already_attended_today,
        'is_debug': settings.DEBUG,
    })


@login_required
def edit_profile(request):
    """로그인한 사용자의 프로필 수정 폼"""
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "프로필이 업데이트되었습니다.")
            return redirect('profile')
    else:
        form = ProfileUpdateForm(instance=request.user)

    return render(request, 'setting/profile_info_change.html', {
        'title': '프로필 수정',
        'form': form,
    })


@login_required
def profile_single(request, user_id):
    """특정 사용자의 프로필 페이지 (관리자: 편집 버튼 포함)"""
    from django.utils import timezone
    from datetime import timedelta
    from .models import Attendance, get_attendance_streak

    profile_user = get_object_or_404(User, pk=user_id)
    courses = None
    if profile_user.is_lecturer:
        from course.models import Course
        courses = Course.objects.filter(instructor=profile_user)

    student_obj = None
    if profile_user.is_student:
        student_obj = getattr(profile_user, 'student', None)

    leaf_transactions = profile_user.leaf_transactions.all().order_by('-created_at')[:10]

    kst_now = timezone.now() + timedelta(hours=9)
    today_kst = kst_now.date()

    from datetime import date as dt_date, timedelta as td
    start_date = today_kst - td(weeks=51)
    start_date -= td(days=start_date.weekday())

    all_attendance = set(
        Attendance.objects.filter(
            user=profile_user,
            date__gte=start_date,
            date__lte=today_kst,
        ).values_list('date', flat=True)
    )

    MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
    heatmap_weeks = []
    month_labels = []
    current_month = None
    cur = start_date

    for col in range(52):
        week_cells = []
        for row in range(7):
            d = cur + td(days=row)
            is_future = d > today_kst
            week_cells.append({
                'date': d.isoformat(),
                'day': d.day,
                'month': d.month,
                'attended': (not is_future) and (d in all_attendance),
                'is_today': d == today_kst,
                'is_future': is_future,
            })
            if row == 0 and d.month != current_month:
                month_labels.append({'col': col, 'label': MONTH_NAMES[d.month - 1]})
                current_month = d.month
        heatmap_weeks.append(week_cells)
        cur += td(weeks=1)

    total_attendance = Attendance.objects.filter(user=profile_user).count()
    streak = get_attendance_streak(profile_user, today_kst)

    return render(request, 'accounts/profile_single.html', {
        'title': profile_user.display_name,
        'user': profile_user,
        'courses': courses,
        'level': student_obj,
        'student': student_obj,
        'leaf_transactions': leaf_transactions,
        'heatmap_weeks': heatmap_weeks,
        'month_labels': month_labels,
        'today_kst': today_kst,
        'total_attendance': total_attendance,
        'streak': streak,
        'already_attended_today': False,
    })


# ─── Student Management (Admin Only) ─────────────────────────────────────────

@login_required
@staff_member_required
def student_list(request):
    """학생 목록 페이지 (운영진 이상)"""
    students = Student.objects.select_related('student').all()
    student_filter = StudentFilter(request.GET, queryset=students)
    return render(request, 'accounts/student_list.html', {
        'title': '학생 목록',
        'filter': student_filter,
    })


@login_required
@staff_member_required
def lecturer_list(request):
    """운영진 목록 페이지 (운영진 이상)"""
    lecturers = User.objects.filter(is_lecturer=True)
    lecturer_filter = LecturerFilter(request.GET, queryset=lecturers)
    return render(request, 'accounts/lecturer_list.html', {
        'title': '운영진 목록',
        'filter': lecturer_filter,
    })


@login_required
def add_student(request):
    """관리자: 학생 계정 생성"""
    if not request.user.is_superuser:
        messages.error(request, "접근 권한이 없습니다.")
        return redirect('student_list')

    if request.method == 'POST':
        form = AdminStudentAddForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "학생 계정이 생성되었습니다.")
            return redirect('student_list')
    else:
        form = AdminStudentAddForm()

    return render(request, 'accounts/add_student.html', {
        'title': '학생 추가',
        'form': form,
    })


@login_required
def add_lecturer(request):
    """관리자: 운영진 계정 생성"""
    if not request.user.is_superuser:
        messages.error(request, "접근 권한이 없습니다.")
        return redirect('lecturer_list')

    if request.method == 'POST':
        form = StaffAddForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "운영진 계정이 생성되었습니다.")
            return redirect('lecturer_list')
    else:
        form = StaffAddForm()

    return render(request, 'accounts/add_staff.html', {
        'title': '운영진 추가',
        'form': form,
    })


@login_required
def student_edit(request, pk):
    """관리자: 학생 정보 수정"""
    if not request.user.is_superuser:
        messages.error(request, "접근 권한이 없습니다.")
        return redirect('student_list')

    student_user = get_object_or_404(User, pk=pk, is_student=True)
    if request.method == 'POST':
        form = StudentEditForm(request.POST, request.FILES, instance=student_user)
        if form.is_valid():
            form.save()
            messages.success(request, "학생 정보가 업데이트되었습니다.")
            return redirect('profile_single', user_id=pk)
    else:
        form = StudentEditForm(instance=student_user)

    return render(request, 'accounts/edit_student.html', {
        'title': '학생 정보 수정',
        'form': form,
    })


@login_required
def staff_edit(request, pk):
    """관리자: 운영진 정보 수정"""
    if not request.user.is_superuser:
        messages.error(request, "접근 권한이 없습니다.")
        return redirect('lecturer_list')

    lecturer_user = get_object_or_404(User, pk=pk, is_lecturer=True)
    if request.method == 'POST':
        form = StaffEditForm(request.POST, request.FILES, instance=lecturer_user)
        if form.is_valid():
            form.save()
            messages.success(request, "운영진 정보가 업데이트되었습니다.")
            return redirect('profile_single', user_id=pk)
    else:
        form = StaffEditForm(instance=lecturer_user)

    return render(request, 'accounts/edit_lecturer.html', {
        'title': '운영진 정보 수정',
        'form': form,
    })


@login_required
def student_delete(request, pk):
    """관리자: 학생 계정 삭제 (확인 후 삭제)"""
    if not request.user.is_superuser:
        messages.error(request, "접근 권한이 없습니다.")
        return redirect('student_list')

    student_obj = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        student_obj.student.delete()
        messages.success(request, "학생 계정이 삭제되었습니다.")
        return redirect('student_list')

    return render(request, 'accounts/confirm_delete.html', {
        'title': '학생 삭제 확인',
        'object_name': student_obj.student.get_full_name,
        'cancel_url': 'student_list',
    })


@login_required
def lecturer_delete(request, pk):
    """관리자: 운영진 계정 삭제 (확인 후 삭제)"""
    if not request.user.is_superuser:
        messages.error(request, "접근 권한이 없습니다.")
        return redirect('lecturer_list')

    lecturer_user = get_object_or_404(User, pk=pk, is_lecturer=True)
    if request.method == 'POST':
        lecturer_user.delete()
        messages.success(request, "운영진 계정이 삭제되었습니다.")
        return redirect('lecturer_list')

    return render(request, 'accounts/confirm_delete.html', {
        'title': '운영진 삭제 확인',
        'object_name': lecturer_user.get_full_name,
        'cancel_url': 'lecturer_list',
    })


@login_required
def student_program_edit(request, pk):
    """관리자: 학생 레벨 및 추가 정보 수정"""
    if not request.user.is_superuser:
        messages.error(request, "접근 권한이 없습니다.")
        return redirect('student_list')

    student_obj = get_object_or_404(Student, student__pk=pk)
    if request.method == 'POST':
        form = StudentLevelForm(request.POST, instance=student_obj)
        if form.is_valid():
            form.save()
            messages.success(request, "학생 정보가 업데이트되었습니다.")
            return redirect('profile_single', user_id=pk)
    else:
        form = StudentLevelForm(instance=student_obj)

    return render(request, 'accounts/edit_student_program.html', {
        'title': '학생 레벨 수정',
        'form': form,
        'student': student_obj,
    })


# ─── PDF Print Views ──────────────────────────────────────────────────────────

@login_required
@staff_member_required
def student_list_pdf(request):
    """학생 목록 인쇄용 페이지"""
    students = Student.objects.select_related('student').all()
    return render(request, 'accounts/student_list_pdf.html', {
        'title': '학생 목록',
        'students': students,
    })


@login_required
@staff_member_required
def lecturer_list_pdf(request):
    """운영진 목록 인쇄용 페이지"""
    lecturers = User.objects.filter(is_lecturer=True)
    return render(request, 'accounts/lecturer_list_pdf.html', {
        'title': '운영진 목록',
        'lecturers': lecturers,
    })


# ─── LMS API Integration ──────────────────────────────────────────────────────

LMS_TOKEN_URL = "https://lms.chungbuk.ac.kr/login/token.php"
LMS_API_URL   = "https://lms.chungbuk.ac.kr/webservice/rest/server.php"


def _lms_call(token, wsfunction, **params):
    """Moodle REST API를 호출하고 JSON 결과를 반환합니다. 실패 시 예외를 발생시킵니다."""
    payload = {"wstoken": token, "wsfunction": wsfunction, "moodlewsrestformat": "json"}
    payload.update(params)
    data = urllib.parse.urlencode(payload).encode()
    req = urllib.request.Request(LMS_API_URL, data=data, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read())
    if isinstance(result, dict) and result.get("exception"):
        raise ValueError(result.get("message", "LMS API 오류"))
    return result



def _current_semester_start():
    from django.utils import timezone
    now = timezone.now()
    if 3 <= now.month <= 8:
        return now.replace(month=3, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif now.month >= 9:
        return now.replace(month=9, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        return now.replace(year=now.year - 1, month=9, day=1, hour=0, minute=0, second=0, microsecond=0)


@login_required
def lms_page(request):
    """LMS 연동 페이지: 연결/해제, 성적 조회, 과제 가져오기"""
    lms_token_obj = getattr(request.user, "lms_token", None)

    if request.method == "POST":
        action = request.POST.get("action")

        # ── 연결 ──────────────────────────────────────────────────
        if action == "connect":
            lms_id = request.POST.get("lms_id", "").strip()
            lms_pw = request.POST.get("lms_pw", "").strip()
            if not lms_id or not lms_pw:
                messages.error(request, "아이디와 비밀번호를 모두 입력해주세요.")
                return redirect("lms_page")
            try:
                params = urllib.parse.urlencode({
                    "username": lms_id,
                    "password": lms_pw,
                    "service": "moodle_mobile_app",
                }).encode()
                req = urllib.request.Request(LMS_TOKEN_URL, data=params, method="POST")
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read())
                if "token" not in data:
                    messages.error(request, "LMS 로그인 실패: 아이디 또는 비밀번호를 확인해주세요.")
                    return redirect("lms_page")
                token = data["token"]
                # Moodle 사용자 ID 가져오기
                site_info = _lms_call(token, "core_webservice_get_site_info")
                moodle_uid = site_info.get("userid")
                if lms_token_obj:
                    lms_token_obj.token = token
                    lms_token_obj.lms_username = lms_id
                    lms_token_obj.moodle_user_id = moodle_uid
                    lms_token_obj.save()
                else:
                    LMSToken.objects.create(
                        user=request.user,
                        token=token,
                        lms_username=lms_id,
                        moodle_user_id=moodle_uid,
                    )
                messages.success(request, "충북대 LMS에 성공적으로 연동되었습니다.")
            except Exception as e:
                messages.error(request, f"연동 중 오류가 발생했습니다: {e}")
            return redirect("lms_page")

        # ── 연결 해제 ──────────────────────────────────────────────
        if action == "disconnect" and lms_token_obj:
            lms_token_obj.delete()
            messages.success(request, "LMS 연동이 해제되었습니다.")
            return redirect("lms_page")

        # ── 과제 캘린더 가져오기 ───────────────────────────────────
        if action == "import_assignments" and lms_token_obj:
            token = lms_token_obj.token
            moodle_uid = lms_token_obj.moodle_user_id
            try:
                courses = _lms_call(token, "core_enrol_get_users_courses", userid=moodle_uid)
                semester_ts = int(_current_semester_start().timestamp())
                # 강좌 종료일 enddate로 필터링하지 않고, 모든 강좌의 과제를 조회한 후 과제 마감일(duedate)로 필터링합니다.
                course_ids = [c["id"] for c in courses]
                if not course_ids:
                    messages.info(request, "등록된 강의가 없습니다.")
                    return redirect("lms_page")
                # mod_assign_get_assignments는 courseids[] 배열을 받음
                params = {f"courseids[{i}]": cid for i, cid in enumerate(course_ids)}
                assign_data = _lms_call(token, "mod_assign_get_assignments", **params)
                imported = 0
                skipped = 0
                from django.utils import timezone
                import datetime
                for course in assign_data.get("courses", []):
                    course_name = course["fullname"]
                    for assign in course.get("assignments", []):
                        duedate_ts = assign.get("duedate", 0)
                        if not duedate_ts or duedate_ts < semester_ts:
                            skipped += 1
                            continue
                        external_id = f"lms:assign:{assign['id']}"
                        
                        is_completed = False
                        try:
                            sub_status = _lms_call(token, "mod_assign_get_submission_status", assignid=assign['id'])
                            lastattempt = sub_status.get("lastattempt", {})
                            submission = lastattempt.get("submission") or sub_status.get("submission") or {}
                            teamsubmission = lastattempt.get("teamsubmission") or sub_status.get("teamsubmission") or {}
                            
                            sub_status_str = ""
                            if submission:
                                sub_status_str = submission.get("status", "")
                            elif teamsubmission:
                                sub_status_str = teamsubmission.get("status", "")
                                
                            if sub_status_str == "submitted" or sub_status.get("feedback", {}).get("grade"):
                                is_completed = True
                            else:
                                # draft 상태이거나 기타 상태여도 실제 파일 또는 온라인 텍스트가 들어가 있는 경우 제출 완료로 인정
                                has_files_or_text = False
                                for plugin in submission.get("plugins", []):
                                    p_type = plugin.get("type", "")
                                    if p_type == "file":
                                        for area in plugin.get("fileareas", []):
                                            if area.get("files"):
                                                has_files_or_text = True
                                                break
                                    elif p_type == "onlinetext":
                                        for field in plugin.get("editorfields", []):
                                            if field.get("value", "").strip():
                                                has_files_or_text = True
                                                break
                                    if has_files_or_text:
                                        break
                                if has_files_or_text:
                                    is_completed = True
                        except Exception:
                            pass

                        import zoneinfo
                        kst = zoneinfo.ZoneInfo("Asia/Seoul")
                        due_dt = datetime.datetime.fromtimestamp(duedate_ts, tz=datetime.timezone.utc)
                        due_dt_kst = due_dt.astimezone(kst)
                        
                        # 한국 시각 기준 00:00(자정) 마감인 과제는 전날 마감 일정으로 1분 차감 보정 (사용자 경험 개선)
                        if due_dt_kst.hour == 0 and due_dt_kst.minute == 0:
                            due_dt_kst = due_dt_kst - datetime.timedelta(minutes=1)
                            due_dt = due_dt - datetime.timedelta(minutes=1)
                        
                        # Store rich description in JSON format
                        attachments = []
                        for att in assign.get("introattachments", []):
                            attachments.append({
                                "filename": att.get("filename"),
                                "fileurl": att.get("fileurl"),
                                "filesize": att.get("filesize"),
                            })
                        
                        desc_data = {
                            "course_name": course_name,
                            "intro": assign.get("intro", ""),
                            "duedate": due_dt_kst.strftime("%Y-%m-%d %H:%M"),
                            "attachments": attachments,
                            "cmid": assign.get("cmid"),
                        }
                        description_json = json.dumps(desc_data, ensure_ascii=False)

                        existing = Schedule.objects.filter(user=request.user, external_id=external_id).first()
                        has_changed = False
                        if existing:
                            if (existing.description != description_json or 
                                existing.is_completed != is_completed or 
                                existing.title != assign['name']):
                                has_changed = True

                        schedule_obj, created = Schedule.objects.update_or_create(
                            user=request.user,
                            external_id=external_id,
                            defaults={
                                "title": assign['name'],
                                "description": description_json,
                                "start_date": due_dt,
                                "end_date": None,
                                "is_global": False,
                                "is_completed": is_completed,
                            }
                        )
                        if created or has_changed:
                            imported += 1
                        else:
                            skipped += 1
                messages.success(request, f"과제 {imported}개를 캘린더에 추가했습니다. (중복/지난 학기 {skipped}개 건너뜀)")
            except Exception as e:
                messages.error(request, f"과제 가져오기 실패: {e}")
            return redirect("lms_page")

    # ── GET: 성적 조회 ─────────────────────────────────────────────
    grade_semesters = {}
    error_msg = None
    if lms_token_obj:
        try:
            token = lms_token_obj.token
            moodle_uid = lms_token_obj.moodle_user_id
            courses = _lms_call(token, "core_enrol_get_users_courses", userid=moodle_uid)
            
            import datetime
            def _get_semester(ts):
                try:
                    # ts: unix timestamp
                    dt = datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc)
                    if 3 <= dt.month <= 8:
                        return (dt.year, 1)
                    elif dt.month >= 9:
                        return (dt.year, 2)
                    else:
                        return (dt.year - 1, 2)
                except Exception:
                    now = datetime.datetime.now()
                    return (now.year, 1)

            for course in courses:
                startdate = course.get("startdate", 0)
                sem = _get_semester(startdate)
                
                try:
                    grade_items = _lms_call(
                        token,
                        "gradereport_user_get_grade_items",
                        courseid=course["id"],
                        userid=moodle_uid,
                    )
                    items = grade_items.get("usergrades", [{}])[0].get("gradeitems", [])
                    course_data = {
                        "name": course["fullname"],
                        "items": [
                            {
                                "name": it.get("itemname") or "최종 점수",
                                "grade": it.get("gradeformatted", "-"),
                                "max": it.get("grademax"),
                                "pass": it.get("gradehiddenbydate", False) is False,
                            }
                            for it in items
                        ],
                    }
                except Exception:
                    course_data = {"name": course["fullname"], "items": []}
                
                if sem not in grade_semesters:
                    grade_semesters[sem] = []
                grade_semesters[sem].append(course_data)
        except Exception as e:
            error_msg = str(e)

    sorted_semesters = []
    for sem in sorted(grade_semesters.keys(), key=lambda x: (x[0], x[1]), reverse=True):
        sorted_semesters.append({
            "semester_name": f"{sem[0]}학년도 {sem[1]}학기",
            "courses": grade_semesters[sem]
        })

    return render(request, "accounts/lms.html", {
        "lms_token": lms_token_obj,
        "sorted_semesters": sorted_semesters,
        "error_msg": error_msg,
    })
# ─── LMS 과제 가져오기 JSON API (비동기 로딩 버튼용) ─────────────────────────

@login_required
@require_POST
def lms_import_assignments_api(request):
    """과제 가져오기를 비동기로 처리하고 JSON으로 결과를 반환합니다."""
    lms_token_obj = getattr(request.user, "lms_token", None)
    if not lms_token_obj:
        return JsonResponse({"status": "error", "message": "LMS 연동이 되어있지 않습니다."}, status=400)
    try:
        import datetime
        token = lms_token_obj.token
        moodle_uid = lms_token_obj.moodle_user_id
        courses = _lms_call(token, "core_enrol_get_users_courses", userid=moodle_uid)

        # 강좌 종료일 enddate로 필터링하지 않고, 모든 강좌의 과제를 조회한 후 과제 마감일(duedate)로 필터링합니다.
        semester_ts = int(_current_semester_start().timestamp())
        course_ids = [c["id"] for c in courses]
        if not course_ids:
            return JsonResponse({
                "status": "ok", "imported": 0, "skipped": 0,
                "message": "등록된 강의가 없습니다.",
            })

        params = {f"courseids[{i}]": cid for i, cid in enumerate(course_ids)}
        assign_data = _lms_call(token, "mod_assign_get_assignments", **params)

        imported = 0
        skipped = 0
        for course in assign_data.get("courses", []):
            course_name = course["fullname"]
            for assign in course.get("assignments", []):
                duedate_ts = assign.get("duedate", 0)
                if not duedate_ts or duedate_ts < semester_ts:
                    skipped += 1
                    continue
                external_id = "lms:assign:{}".format(assign["id"])
                
                is_completed = False
                try:
                    sub_status = _lms_call(token, "mod_assign_get_submission_status", assignid=assign["id"])
                    lastattempt = sub_status.get("lastattempt", {})
                    submission = lastattempt.get("submission") or sub_status.get("submission") or {}
                    teamsubmission = lastattempt.get("teamsubmission") or sub_status.get("teamsubmission") or {}
                    
                    sub_status_str = ""
                    if submission:
                        sub_status_str = submission.get("status", "")
                    elif teamsubmission:
                        sub_status_str = teamsubmission.get("status", "")
                        
                    if sub_status_str == "submitted" or sub_status.get("feedback", {}).get("grade"):
                        is_completed = True
                    else:
                        # draft 상태이거나 기타 상태여도 실제 파일 또는 온라인 텍스트가 들어가 있는 경우 제출 완료로 인정
                        has_files_or_text = False
                        for plugin in submission.get("plugins", []):
                            p_type = plugin.get("type", "")
                            if p_type == "file":
                                for area in plugin.get("fileareas", []):
                                    if area.get("files"):
                                        has_files_or_text = True
                                        break
                            elif p_type == "onlinetext":
                                for field in plugin.get("editorfields", []):
                                    if field.get("value", "").strip():
                                        has_files_or_text = True
                                        break
                            if has_files_or_text:
                                break
                        if has_files_or_text:
                            is_completed = True
                except Exception:
                    pass

                import zoneinfo
                kst = zoneinfo.ZoneInfo("Asia/Seoul")
                due_dt = datetime.datetime.fromtimestamp(duedate_ts, tz=datetime.timezone.utc)
                due_dt_kst = due_dt.astimezone(kst)

                # 한국 시각 기준 00:00(자정) 마감인 과제는 전날 마감 일정으로 1분 차감 보정 (사용자 경험 개선)
                if due_dt_kst.hour == 0 and due_dt_kst.minute == 0:
                    due_dt_kst = due_dt_kst - datetime.timedelta(minutes=1)
                    due_dt = due_dt - datetime.timedelta(minutes=1)

                # Store rich description in JSON format
                attachments = []
                for att in assign.get("introattachments", []):
                    attachments.append({
                        "filename": att.get("filename"),
                        "fileurl": att.get("fileurl"),
                        "filesize": att.get("filesize"),
                    })

                desc_data = {
                    "course_name": course_name,
                    "intro": assign.get("intro", ""),
                    "duedate": due_dt_kst.strftime("%Y-%m-%d %H:%M"),
                    "attachments": attachments,
                    "cmid": assign.get("cmid"),
                }
                description_json = json.dumps(desc_data, ensure_ascii=False)

                existing = Schedule.objects.filter(user=request.user, external_id=external_id).first()
                has_changed = False
                if existing:
                    if (existing.description != description_json or 
                        existing.is_completed != is_completed or 
                        existing.title != assign["name"]):
                        has_changed = True

                schedule_obj, created = Schedule.objects.update_or_create(
                    user=request.user,
                    external_id=external_id,
                    defaults={
                        "title": assign["name"],
                        "description": description_json,
                        "start_date": due_dt,
                        "end_date": None,
                        "is_global": False,
                        "is_completed": is_completed,
                    }
                )
                if created or has_changed:
                    imported += 1
                else:
                    skipped += 1

        return JsonResponse({
            "status": "ok",
            "imported": imported,
            "skipped": skipped,
            "message": "과제 {}개를 캘린더에 추가했습니다. (중복/지난 학기 {}개 건너뜀)".format(imported, skipped),
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": "과제 가져오기 실패: {}".format(e)}, status=500)


@login_required
def lms_download_file(request):
    """LMS 첨부파일을 로그인한 유저의 wstoken을 사용하여 프록시 다운로드 처리합니다."""
    file_url = request.GET.get("url")
    if not file_url:
        return HttpResponse("파일 URL이 누락되었습니다.", status=400)
    
    lms_token_obj = getattr(request.user, "lms_token", None)
    if not lms_token_obj:
        return HttpResponse("LMS 연동이 필요합니다.", status=403)
        
    token = lms_token_obj.token
    
    # URL에 token 파라미터 주입
    if "?" in file_url:
        target_url = f"{file_url}&token={token}"
    else:
        target_url = f"{file_url}?token={token}"
        
    try:
        req = urllib.request.Request(target_url, headers={"User-Agent": "MoodleMobile"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            
            # Content-Type 및 헤더 중계
            content_type = resp.headers.get("Content-Type", "application/octet-stream")
            content_disposition = resp.headers.get("Content-Disposition")
            
            response = HttpResponse(content, content_type=content_type)
            if content_disposition:
                response["Content-Disposition"] = content_disposition
            else:
                filename = file_url.split("/")[-1]
                filename = urllib.parse.unquote(filename)
                from django.utils.encoding import escape_uri_path
                response["Content-Disposition"] = f"attachment; filename*=UTF-8''{escape_uri_path(filename)}"
                
            return response
    except Exception as e:
        return HttpResponse(f"파일 다운로드 실패: {e}", status=500)


@login_required
def unread_notification_count_api(request):
    """읽지 않은 알림 개수 반환 (Polling 용)"""
    from .models import Notification
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return JsonResponse({'unread_count': count})


@login_required
def notification_list_api(request):
    """최근 5개의 알림 목록 반환 (드롭다운용)"""
    from .models import Notification
    notifications = Notification.objects.filter(recipient=request.user)[:5]
    
    # 시간 포맷 헬퍼 (예: "방금 전", "5분 전", "1시간 전", "어제" 또는 "날짜")
    def format_relative_time(dt):
        from django.utils import timezone
        import datetime
        now = timezone.now()
        diff = now - dt
        if diff.days == 0:
            if diff.seconds < 60:
                return "방금 전"
            elif diff.seconds < 3600:
                return f"{diff.seconds // 60}분 전"
            else:
                return f"{diff.seconds // 3600}시간 전"
        elif diff.days == 1:
            return "어제"
        elif diff.days < 7:
            return f"{diff.days}일 전"
        else:
            return dt.strftime("%Y-%m-%d")

    data = []
    for n in notifications:
        data.append({
            'id': n.id,
            'notification_type': n.notification_type,
            'message': n.message,
            'is_read': n.is_read,
            'gathering_id': n.gathering_id if n.gathering else None,
            'post_id': n.post_id if n.post else None,
            'created_at_formatted': format_relative_time(n.created_at)
        })
    
    unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return JsonResponse({'notifications': data, 'unread_count': unread_count})


@login_required
def read_and_redirect(request, notification_id):
    """특정 알림 읽음 처리 완료 후 관련 번개 모임 또는 게시글 상세화면으로 redirect

    accounts.urls 는 community/judge/game 세 호스트에 모두 포함되므로 이 뷰는
    어느 서브도메인에서도 호출될 수 있다. 반면 리다이렉트 대상(gathering_list 등)은
    community 서브도메인에만, game_lobby 는 game 서브도메인에만 등록되어 있으므로
    django_hosts 의 reverse 로 호스트를 명시해 절대 URL을 만들어야 한다.
    """
    from .models import Notification
    from django_hosts.resolvers import reverse as host_reverse
    n = get_object_or_404(Notification, id=notification_id, recipient=request.user)
    if not n.is_read:
        n.is_read = True
        n.save(update_fields=['is_read'])

    if n.gathering:
        if n.gathering.is_canceled:
            messages.warning(request, "취소된 모임입니다.")
            return redirect(host_reverse('gathering_list', host='community'))
        return redirect(host_reverse('gathering_detail', host='community', kwargs={'gathering_id': n.gathering.id}))
    elif n.post:
        return redirect(host_reverse('post_detail', host='community', kwargs={'post_id': n.post.id}))
    elif n.notification_type in ('game_season_ending', 'game_season_reward'):
        return redirect(host_reverse('game_lobby', host='game'))
    return redirect(host_reverse('gathering_list', host='community'))


@login_required
@require_POST
def mark_all_as_read_api(request):
    """로그인한 사용자의 모든 미독 알림을 읽음 처리"""
    from .models import Notification
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'success': True})


@login_required
@require_POST
def delete_notification_api(request, notification_id):
    """특정 알림 삭제"""
    from .models import Notification
    n = get_object_or_404(Notification, id=notification_id, recipient=request.user)
    n.delete()
    return JsonResponse({'success': True})


@login_required
@require_POST
def delete_read_notifications_api(request):
    """읽은 알림 일괄 삭제"""
    from .models import Notification
    Notification.objects.filter(recipient=request.user, is_read=True).delete()
    return JsonResponse({'success': True})


@login_required
def notification_center(request):
    """알림 센터 페이지 (전체 알림 조회 및 개별 삭제/필터링)"""
    from .models import Notification
    # 읽지 않음 필터링 여부
    filter_unread = request.GET.get('unread') == 'true'
    
    qs = Notification.objects.filter(recipient=request.user)
    if filter_unread:
        qs = qs.filter(is_read=False)
        
    # 간단한 페이지네이션 (20개씩)
    from django.core.paginator import Paginator
    paginator = Paginator(qs, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'accounts/notifications.html', {
        'title': '알림 센터',
        'page_obj': page_obj,
        'filter_unread': filter_unread,
    })


@login_required
@require_POST
def subscribe_push_api(request):
    """클라이언트 기기의 웹 푸시 구독 정보를 저장/갱신"""
    from .models import PushSubscription
    try:
        data = json.loads(request.body)
        endpoint = data.get('endpoint')
        keys = data.get('keys', {})
        p256dh = keys.get('p256dh')
        auth = keys.get('auth')

        if not endpoint or not p256dh or not auth:
            return JsonResponse({'success': False, 'error': '필수 구독 정보가 누락되었습니다.'}, status=400)

        # 학생 프로필이 없으면 에러
        try:
            student = request.user.student
        except Exception:
            return JsonResponse({'success': False, 'error': '학생 프로필이 등록되어 있지 않습니다.'}, status=400)

        # 기존 구독 정보가 있으면 갱신, 없으면 생성
        subscription, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                'student': student,
                'p256dh': p256dh,
                'auth': auth
            }
        )
        return JsonResponse({'success': True, 'created': created})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
@require_POST
def unsubscribe_push_api(request):
    """클라이언트 기기의 웹 푸시 구독 정보 해제/삭제"""
    from .models import PushSubscription
    try:
        data = json.loads(request.body)
        endpoint = data.get('endpoint')

        if not endpoint:
            return JsonResponse({'success': False, 'error': '엔드포인트 정보가 누락되었습니다.'}, status=400)

        try:
            student = request.user.student
            PushSubscription.objects.filter(student=student, endpoint=endpoint).delete()
            return JsonResponse({'success': True})
        except Exception:
            return JsonResponse({'success': False, 'error': '학생 프로필이 등록되어 있지 않습니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
@require_POST
def attendance_check_api(request):
    """일일 출석 체크 및 낙엽 1개 지급 API (KST 기준 하루 1회 제한 및 동시성 제어 적용)"""
    from django.utils import timezone
    from datetime import timedelta
    from .models import Attendance, User, get_attendance_streak

    # 연속 출석 일수별 보너스 낙엽 정의
    STREAK_BONUSES = {7: 2, 14: 3, 30: 5, 60: 8, 100: 15}

    try:
        # KST(한국 시각) 기준 오늘 날짜 구하기
        kst_now = timezone.now() + timedelta(hours=9)
        today = kst_now.date()

        with transaction.atomic():
            # 동시 출석 요청에 따른 중복 낙엽 지급 방지를 위해 락 획득
            user = User.objects.select_for_update().get(id=request.user.id)

            # 오늘 이미 출석했는지 검사
            already_attended = Attendance.objects.filter(user=user, date=today).exists()
            if already_attended:
                return JsonResponse({'success': False, 'error': '오늘은 이미 출석 체크를 하셨습니다.'}, status=400)

            # 출석 데이터 저장
            Attendance.objects.create(user=user, date=today)

            # 낙엽 보상 1개 지급 (LeafTransaction 해시 체인 자동 생성 포함)
            user.adjust_leaves(
                amount=1,
                transaction_type="attendance",
                description=f"{today.strftime('%Y-%m-%d')} 일일 출석 체크 보상"
            )

            # 연속 출석 streak 계산 (오늘 출석 포함)
            streak = get_attendance_streak(user, today)

            # 연속 출석 마일스톤 보너스 지급
            bonus = STREAK_BONUSES.get(streak, 0)
            bonus_message = ""
            if bonus:
                user.adjust_leaves(
                    amount=bonus,
                    transaction_type="streak_bonus",
                    description=f"{streak}일 연속 출석 보너스"
                )
                bonus_message = f" 🎉 {streak}일 연속 출석 보너스 낙엽 {bonus}개 추가 지급!"

        return JsonResponse({
            'success': True,
            'message': f'출석 체크가 완료되었습니다! 낙엽 1개가 적립되었습니다.{bonus_message}',
            'leaves': user.leaves + 1 + bonus,
            'streak': streak,
            'bonus': bonus,
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)



@login_required
def debug_reset_today(request):
    """[DEBUG 전용] 지정 날짜(기본=오늘 KST)의 방명록·출석 기록을 삭제해 재테스트가 가능하게 합니다."""
    from django.conf import settings
    from django.utils import timezone as dj_tz
    if not settings.DEBUG:
        return JsonResponse({'error': 'DEBUG 모드에서만 사용할 수 있습니다.'}, status=403)

    from datetime import datetime, timezone as py_utc, timedelta, date as dt_date
    from .models import Attendance
    from community.models import Guestbook

    # ?date=YYYY-MM-DD 파라미터가 있으면 그 날짜, 없으면 KST 오늘
    date_param = request.GET.get('date') or request.POST.get('date')
    if date_param:
        try:
            target_date = dt_date.fromisoformat(date_param)
        except ValueError:
            return JsonResponse({'error': '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD).'}, status=400)
    else:
        kst_now = dj_tz.now() + timedelta(hours=9)
        target_date = kst_now.date()

    kst_start = datetime(target_date.year, target_date.month, target_date.day, tzinfo=py_utc.utc) - timedelta(hours=9)
    kst_end = kst_start + timedelta(days=1)

    deleted_attendance, _ = Attendance.objects.filter(user=request.user, date=target_date).delete()
    deleted_guestbook, _ = Guestbook.objects.filter(
        author=request.user,
        created_at__gte=kst_start,
        created_at__lt=kst_end,
    ).delete()

    return JsonResponse({
        'success': True,
        'target_date': target_date.isoformat(),
        'deleted_attendance': deleted_attendance,
        'deleted_guestbook': deleted_guestbook,
    })
