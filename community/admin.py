from django.contrib import admin
from django.utils.html import format_html
from .models import (
    NewsAndEvents, NewsAndEventsComment, Poll, PollChoice, PollVote,
    Survey, SurveyQuestion, SurveyQuestionChoice, SurveyResponse, SurveyAnswer, SurveyComment
)


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
        full = obj.voter.get_full_name
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
        full = obj.voter.get_full_name
        return f"{full} ({obj.voter.username})" if full else obj.voter.username
    voter_display.short_description = '투표자'

    def choice_text(self, obj):
        return obj.choice.text
    choice_text.short_description = '선택 항목'


admin.site.register(NewsAndEvents)
admin.site.register(NewsAndEventsComment)


# ─────────────────────────────────────────────
# 설문 (Survey) Admin
# ─────────────────────────────────────────────

class SurveyQuestionChoiceInline(admin.TabularInline):
    model = SurveyQuestionChoice
    extra = 2


class SurveyQuestionInline(admin.TabularInline):
    model = SurveyQuestion
    extra = 1
    fields = ('question_type', 'question_text', 'question_description', 'required', 'order')


class SurveyAnswerInline(admin.TabularInline):
    model = SurveyAnswer
    readonly_fields = ('question', 'choice', 'text_answer', 'scale_answer')
    fields = ('question', 'choice', 'text_answer', 'scale_answer')
    extra = 0
    can_delete = False


class SurveyResponseInline(admin.TabularInline):
    model = SurveyResponse
    readonly_fields = ('respondent', 'created_at')
    fields = ('respondent', 'created_at')
    extra = 0
    can_delete = False


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'status_display', 'response_count', 'allow_duplicate_response', 'is_anonymous', 'starts_at', 'ends_at', 'created_at')
    list_filter = ('is_active', 'allow_duplicate_response', 'is_anonymous')
    search_fields = ('title', 'created_by__username', 'created_by__first_name')
    inlines = [SurveyQuestionInline, SurveyResponseInline]
    readonly_fields = ('created_at', 'response_count')

    def status_display(self, obj):
        if obj.is_closed:
            return format_html('<span style="color:#ef4444;font-weight:600;">✕ 마감</span>')
        return format_html('<span style="color:#10b981;font-weight:600;">✓ 진행중</span>')
    status_display.short_description = '상태'

    fieldsets = (
        ('기본 정보', {
            'fields': ('title', 'description', 'created_by', 'created_at')
        }),
        ('설정', {
            'fields': ('is_active', 'allow_duplicate_response', 'is_anonymous')
        }),
        ('기간 설정', {
            'fields': ('starts_at', 'ends_at')
        }),
        ('통계', {
            'fields': ('response_count',)
        }),
    )


@admin.register(SurveyQuestion)
class SurveyQuestionAdmin(admin.ModelAdmin):
    list_display = ('survey', 'question_type', 'question_text', 'required', 'order')
    list_filter = ('survey', 'question_type', 'required')
    search_fields = ('question_text', 'survey__title')
    ordering = ('survey', 'order')
    inlines = [SurveyQuestionChoiceInline]


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ('survey', 'respondent_display', 'created_at')
    list_filter = ('survey', 'created_at')
    search_fields = ('respondent__username', 'respondent__first_name', 'survey__title')
    readonly_fields = ('survey', 'respondent', 'created_at')
    inlines = [SurveyAnswerInline]
    ordering = ('-created_at',)

    def respondent_display(self, obj):
        if obj.respondent:
            full = obj.respondent.get_full_name
            return f"{full} ({obj.respondent.username})" if full else obj.respondent.username
        return "(익명)"
    respondent_display.short_description = '응답자'


@admin.register(SurveyAnswer)
class SurveyAnswerAdmin(admin.ModelAdmin):
    list_display = ('response', 'question', 'answer_display', 'created_at_display')
    list_filter = ('question__survey',)
    search_fields = ('question__question_text', 'response__survey__title', 'response__respondent__username')
    readonly_fields = ('response', 'question', 'choice', 'text_answer', 'scale_answer')

    def answer_display(self, obj):
        if obj.choice:
            return obj.choice.choice_text
        elif obj.text_answer:
            return obj.text_answer[:50] + ('...' if len(obj.text_answer) > 50 else '')
        elif obj.scale_answer:
            return f"★ {obj.scale_answer}/5"
        return '-'
    answer_display.short_description = '답변'

    def created_at_display(self, obj):
        return obj.response.created_at
    created_at_display.short_description = '응답 시간'


@admin.register(SurveyComment)
class SurveyCommentAdmin(admin.ModelAdmin):
    list_display = ('survey', 'author', 'content_preview', 'created_at')
    list_filter = ('survey', 'created_at')
    search_fields = ('survey__title', 'author__username', 'content')
    ordering = ('-created_at',)

    def content_preview(self, obj):
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
    content_preview.short_description = '댓글 내용'
