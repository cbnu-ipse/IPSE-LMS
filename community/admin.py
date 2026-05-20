from django.contrib import admin
from django.utils.html import format_html
from .models import NewsAndEvents, NewsAndEventsComment, Poll, PollChoice, PollVote


class PollChoiceInline(admin.TabularInline):
    model = PollChoice
    extra = 2
    readonly_fields = ('vote_count_display',)

    def vote_count_display(self, obj):
        return obj.vote_count if obj.pk else '-'
    vote_count_display.short_description = '투표 수'


class PollVoteInline(admin.TabularInline):
    model = PollVote
    readonly_fields = ('voter_display', 'choice', 'voted_at')
    fields = ('voter_display', 'choice', 'voted_at')
    extra = 0
    can_delete = False

    def voter_display(self, obj):
        full = obj.voter.get_full_name()
        return f"{full} ({obj.voter.username})" if full else obj.voter.username
    voter_display.short_description = '투표자'


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'status_display', 'is_multiple', 'is_anonymous', 'participant_count', 'starts_at', 'ends_at', 'created_at')
    list_filter = ('is_active', 'is_multiple', 'is_anonymous')
    search_fields = ('title', 'created_by__username', 'created_by__first_name')
    inlines = [PollChoiceInline, PollVoteInline]

    def status_display(self, obj):
        if obj.is_closed:
            return format_html('<span style="color:#ef4444;font-weight:600;">✕ 마감</span>')
        return format_html('<span style="color:#10b981;font-weight:600;">✓ 진행중</span>')
    status_display.short_description = '상태'

    def participant_count(self, obj):
        return obj.total_voters
    participant_count.short_description = '참여자 수'


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ('poll', 'voter_display', 'choice_text', 'voted_at')
    list_filter = ('poll',)
    search_fields = ('voter__username', 'voter__first_name', 'voter__last_name', 'poll__title', 'choice__text')
    ordering = ('-voted_at',)
    readonly_fields = ('poll', 'choice', 'voter', 'voted_at')

    def voter_display(self, obj):
        full = obj.voter.get_full_name()
        return f"{full} ({obj.voter.username})" if full else obj.voter.username
    voter_display.short_description = '투표자'

    def choice_text(self, obj):
        return obj.choice.text
    choice_text.short_description = '선택 항목'


admin.site.register(NewsAndEvents)
admin.site.register(NewsAndEventsComment)
