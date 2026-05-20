from django.contrib import admin
from .models import NewsAndEvents, NewsAndEventsComment, Poll, PollChoice, PollVote


class PollChoiceInline(admin.TabularInline):
    model = PollChoice
    extra = 2


class PollVoteInline(admin.TabularInline):
    model = PollVote
    readonly_fields = ('voter', 'choice', 'voted_at')
    extra = 0
    can_delete = False


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'is_active', 'is_multiple', 'is_anonymous', 'created_at', 'ends_at')
    list_filter = ('is_active', 'is_multiple')
    inlines = [PollChoiceInline, PollVoteInline]


admin.site.register(NewsAndEvents)
admin.site.register(NewsAndEventsComment)
