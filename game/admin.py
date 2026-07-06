from django.contrib import admin
from .models import SlotPlayLog, AppleGameScore, GameSeason, SeasonRewardClaim, MemoryMatchScore, NumberSpeedScore, PatternRecallScore, BalanceGameScore


@admin.register(GameSeason)
class GameSeasonAdmin(admin.ModelAdmin):
    list_display = ("number", "start_date", "end_date", "is_active", "rewards_distributed", "days_remaining_display")
    list_filter = ("is_active", "rewards_distributed")
    readonly_fields = ("created_at",)
    ordering = ("-number",)

    @admin.display(description="남은 일수")
    def days_remaining_display(self, obj):
        return f"{obj.days_remaining}일" if not obj.is_ended else "종료"


@admin.register(SlotPlayLog)
class SlotPlayLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "played_date", "result_grade", "result_reward", "created_at")
    list_filter = ("result_grade", "played_date")
    search_fields = ("user__username", "result_grade")


@admin.register(AppleGameScore)
class AppleGameScoreAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "played_at")
    list_filter = ("played_at",)
    search_fields = ("user__username",)
    ordering = ("-score",)


@admin.register(SeasonRewardClaim)
class SeasonRewardClaimAdmin(admin.ModelAdmin):
    list_display = ("user", "season_label", "board", "rank", "reward", "shown", "created_at")
    list_filter = ("shown", "board", "rank")
    search_fields = ("user__username", "season_label")
    ordering = ("-created_at",)


@admin.register(MemoryMatchScore)
class MemoryMatchScoreAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "moves", "time_seconds", "played_at")
    list_filter = ("played_at",)
    search_fields = ("user__username",)
    ordering = ("-score",)


@admin.register(NumberSpeedScore)
class NumberSpeedScoreAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "mistakes", "time_ms", "played_at")
    list_filter = ("played_at",)
    search_fields = ("user__username",)
    ordering = ("-score",)


@admin.register(PatternRecallScore)
class PatternRecallScoreAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "level", "played_at")
    list_filter = ("played_at",)
    search_fields = ("user__username",)
    ordering = ("-score",)


@admin.register(BalanceGameScore)
class BalanceGameScoreAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "survived_ms", "stage", "played_at")
    list_filter = ("played_at",)
    search_fields = ("user__username",)
    ordering = ("-score",)
