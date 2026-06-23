from django.contrib import admin
from .models import SlotPlayLog

@admin.register(SlotPlayLog)
class SlotPlayLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "played_date", "result_grade", "result_reward", "created_at")
    list_filter = ("result_grade", "played_date")
    search_fields = ("user__username", "result_grade")
