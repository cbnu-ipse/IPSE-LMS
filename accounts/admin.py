from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import (
    User, Student, LMSToken, LeafTransaction, LeafCode, LeafCodeUsage, Notification, Friendship, GraduationRequest,
)


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
    list_display = ('username', 'email', 'first_name', 'last_name', 'leaves', 'is_active', 'is_student', 'is_lecturer', 'is_staff', 'is_president', 'is_vice_president', 'is_executive', 'is_graduate')
    list_filter = ('is_active', 'is_student', 'is_lecturer', 'is_staff', 'is_president', 'is_vice_president', 'is_executive', 'is_graduate')
    actions = [approve_users, deactivate_users]
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('is_student', 'is_lecturer', 'gender', 'phone', 'address', 'picture', 'leaves')}),
        ('동아리 역할 뱃지', {'fields': ('is_president', 'is_vice_president', 'is_executive')}),
        ('졸업생', {'fields': ('is_graduate', 'graduated_at')}),
    )

    # 회원 삭제는 회원탈퇴와 같은 방식으로: 연쇄 삭제가 닿지 않는 저지 DB 기록·개인 파일까지 지운다
    def delete_model(self, request, obj):
        from .membership import delete_user_completely
        delete_user_completely(obj)

    def delete_queryset(self, request, queryset):
        from .membership import delete_user_completely
        for user in list(queryset):
            delete_user_completely(user)
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


class DeletedWithUserOnlyMixin:
    """원장(낙엽 거래·보상 코드 사용 이력)은 하나씩 지우거나 고칠 수 없다. 단 관리자가 회원을 삭제할 때
    그 회원의 기록이 함께 지워지는 것은 허용한다 — 막혀 있으면 회원 삭제 자체가 "권한 없음"으로 실패했다.
    (낙엽 거래 해시 체인은 회원별이라 다른 회원 기록 검증에는 영향이 없다.)"""
    USER_DELETE_URLS = ("accounts_user_delete", "accounts_user_changelist")

    def has_delete_permission(self, request, obj=None):
        match = getattr(request, "resolver_match", None)
        return bool(request.user.is_superuser and match and match.url_name in self.USER_DELETE_URLS)


@admin.register(LeafTransaction)
class LeafTransactionAdmin(DeletedWithUserOnlyMixin, admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'description', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username', 'description')
    readonly_fields = ('user', 'amount', 'transaction_type', 'description', 'created_at', 'previous_hash', 'hash')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(LeafCode)
class LeafCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'amount', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('code',)


@admin.register(LeafCodeUsage)
class LeafCodeUsageAdmin(DeletedWithUserOnlyMixin, admin.ModelAdmin):
    list_display = ('user', 'leaf_code', 'used_at')
    list_filter = ('used_at',)
    search_fields = ('user__username', 'leaf_code__code')
    readonly_fields = ('user', 'leaf_code', 'used_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'sender', 'notification_type', 'message', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'sender__username', 'message')

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("from_user", "to_user", "status", "created_at", "accepted_at")
    list_filter = ("status",)
    search_fields = ("from_user__username", "to_user__username")


@admin.action(description="선택한 졸업생 전환 신청을 승인합니다")
def approve_graduation(modeladmin, request, queryset):
    from django.utils import timezone
    now = timezone.now()
    pending = list(queryset.filter(status="pending"))
    for req in pending:
        req.status, req.reviewed_by, req.reviewed_at = "approved", request.user, now
        req.save(update_fields=["status", "reviewed_by", "reviewed_at"])
        User.objects.filter(pk=req.user_id).update(is_graduate=True, graduated_at=now)
    modeladmin.message_user(request, f"{len(pending)}건을 승인했습니다.")


@admin.register(GraduationRequest)
class GraduationRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "message", "created_at", "reviewed_by", "reviewed_at")
    list_filter = ("status",)
    search_fields = ("user__username", "user__first_name", "user__last_name")
    actions = [approve_graduation]
