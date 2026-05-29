from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Student, LMSToken


@admin.action(description="선택한 사용자 계정을 승인합니다 (is_active=True)")
def approve_users(modeladmin, request, queryset):
    updated = queryset.filter(is_active=False).update(is_active=True)
    modeladmin.message_user(request, f"{updated}명의 계정이 승인되었습니다.")


@admin.action(description="선택한 사용자 계정을 비활성화합니다 (is_active=False)")
def deactivate_users(modeladmin, request, queryset):
    updated = queryset.filter(is_active=True).update(is_active=False)
    modeladmin.message_user(request, f"{updated}명의 계정이 비활성화되었습니다.")


@admin.action(description="선택한 학생의 동아리원 인증을 완료합니다 (is_verified=True)")
def verify_students(modeladmin, request, queryset):
    updated = queryset.filter(is_verified=False).update(is_verified=True)
    modeladmin.message_user(request, f"{updated}명의 동아리원 인증이 완료되었습니다.")


@admin.action(description="선택한 학생의 동아리원 인증을 취소합니다 (is_verified=False)")
def unverify_students(modeladmin, request, queryset):
    updated = queryset.filter(is_verified=True).update(is_verified=False)
    modeladmin.message_user(request, f"{updated}명의 인증이 취소되었습니다.")


# 1. 기본 사용자(User) 관리 설정
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 'is_student', 'is_lecturer', 'is_staff', 'is_president', 'is_vice_president', 'is_executive')
    list_filter = ('is_active', 'is_student', 'is_lecturer', 'is_staff', 'is_president', 'is_vice_president', 'is_executive')
    actions = [approve_users, deactivate_users]
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('is_student', 'is_lecturer', 'gender', 'phone', 'address', 'picture')}),
        ('동아리 역할 뱃지', {'fields': ('is_president', 'is_vice_president', 'is_executive')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('is_student', 'is_lecturer', 'gender', 'phone', 'address', 'picture')}),
    )


# 2. 학생(Student) 관리 설정
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student', 'get_id_no', 'get_is_active', 'is_verified', 'get_document_link')
    list_filter = ('student__is_active', 'is_verified')
    search_fields = ('student__username', 'student__first_name')
    actions = [verify_students, unverify_students]

    def get_id_no(self, obj):
        return obj.student.username
    get_id_no.short_description = '학번'

    def get_is_active(self, obj):
        return obj.student.is_active
    get_is_active.short_description = '계정 승인'
    get_is_active.boolean = True

    def get_document_link(self, obj):
        if obj.verification_document:
            return format_html(
                '<a href="{}" target="_blank">서류 보기</a>',
                obj.verification_document.url,
            )
        return "—"
    get_document_link.short_description = '인증 서류'


# 관리자 페이지에 등록
admin.site.register(User, CustomUserAdmin)
admin.site.register(Student, StudentAdmin)


@admin.register(LMSToken)
class LMSTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'lms_username', 'moodle_user_id', 'created_at', 'last_used_at')
    search_fields = ('user__username', 'lms_username')
    readonly_fields = ('token', 'created_at', 'last_used_at')