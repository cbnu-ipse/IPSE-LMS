from django.shortcuts import render, redirect, get_object_or_404
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
from .models import Student, User, LMSToken
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


# ─── Profile Views ────────────────────────────────────────────────────────────

@login_required
def profile(request):
    """로그인한 사용자의 프로필 페이지"""
    user = request.user
    courses = None
    if user.is_lecturer:
        from course.models import Course
        courses = Course.objects.filter(allocated_course__lecturer=user)

    student_obj = None
    if user.is_student:
        student_obj = getattr(user, 'student', None)

    return render(request, 'accounts/profile.html', {
        'title': '내 프로필',
        'courses': courses,
        'level': student_obj,
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
    profile_user = get_object_or_404(User, pk=user_id)
    courses = None
    if profile_user.is_lecturer:
        from course.models import Course
        courses = Course.objects.filter(allocated_course__lecturer=profile_user)

    student_obj = None
    if profile_user.is_student:
        student_obj = getattr(profile_user, 'student', None)

    return render(request, 'accounts/profile_single.html', {
        'title': profile_user.display_name,
        'user': profile_user,
        'courses': courses,
        'level': student_obj,
        'student': student_obj,
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
                        if not duedate_ts:
                            skipped += 1
                            continue
                        external_id = f"lms:assign:{assign['id']}"
                        if Schedule.objects.filter(user=request.user, external_id=external_id).exists():
                            skipped += 1
                            continue
                        due_dt = datetime.datetime.fromtimestamp(duedate_ts, tz=datetime.timezone.utc)
                        Schedule.objects.create(
                            user=request.user,
                            title=f"[과제] {assign['name']}",
                            description=f"{course_name}\n마감: {due_dt.strftime('%Y-%m-%d %H:%M')}",
                            start_date=due_dt,
                            end_date=None,
                            is_global=False,
                            external_id=external_id,
                        )
                        imported += 1
                messages.success(request, f"과제 {imported}개를 캘린더에 추가했습니다. (중복 {skipped}개 건너뜀)")
            except Exception as e:
                messages.error(request, f"과제 가져오기 실패: {e}")
            return redirect("lms_page")

    # ── GET: 성적 조회 ─────────────────────────────────────────────
    grade_courses = []
    error_msg = None
    if lms_token_obj:
        try:
            token = lms_token_obj.token
            moodle_uid = lms_token_obj.moodle_user_id
            courses = _lms_call(token, "core_enrol_get_users_courses", userid=moodle_uid)
            for course in courses:
                try:
                    grade_items = _lms_call(
                        token,
                        "gradereport_user_get_grade_items",
                        courseid=course["id"],
                        userid=moodle_uid,
                    )
                    items = grade_items.get("usergrades", [{}])[0].get("gradeitems", [])
                    grade_courses.append({
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
                    })
                except Exception:
                    grade_courses.append({"name": course["fullname"], "items": []})
        except Exception as e:
            error_msg = str(e)

    return render(request, "accounts/lms.html", {
        "lms_token": lms_token_obj,
        "grade_courses": grade_courses,
        "error_msg": error_msg,
    })