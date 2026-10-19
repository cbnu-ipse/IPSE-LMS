from django.contrib import admin

from .models import ActivityLog, AIUsage, Schedule


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "action_type", "course", "created_at")
    list_filter = ("action_type", "created_at")
    search_fields = ("user__username", "message", "course__title")


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "is_global", "start_date", "end_date", "recurrence_type", "recurrence_group")
    list_filter = ("is_global", "start_date", "recurrence_type")
    search_fields = ("title", "description", "user__username", "recurrence_group")



@admin.register(AIUsage)
class AIUsageAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "task", "model", "prompt_tokens", "cached_tokens", "completion_tokens",
                    "counts_as_request")
    list_filter = ("task", "model", "created_at")
    search_fields = ("user__username",)
    readonly_fields = [f.name for f in AIUsage._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
