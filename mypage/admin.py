from django.contrib import admin, messages

from .models import ExamStyle, GeneratedQuestion, MockExam, PersonalDocument, PersonalFolder, Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "code"]
    search_fields = ["name", "code"]


@admin.register(PersonalFolder)
class PersonalFolderAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "created_at"]
    search_fields = ["name", "user__username"]


@admin.register(PersonalDocument)
class PersonalDocumentAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "document_type", "course_name", "professor", "summary_status", "uploaded_at"]
    list_filter = ["uploaded_at", "summary_status", "document_type"]
    search_fields = ["title", "user__username", "course_name", "professor"]
    actions = ["regenerate"]

    @admin.action(description="선택한 자료의 요약·강의 다시 생성 (본문 다시 추출)")
    def regenerate(self, request, queryset):
        from .regenerate import regenerate_in_background

        ids = list(queryset.values_list("pk", flat=True))
        regenerate_in_background(ids)
        self.message_user(request, f"{len(ids)}개 자료를 다시 처리하고 있습니다. 잠시 후 상태를 확인해주세요.", messages.SUCCESS)


@admin.register(GeneratedQuestion)
class GeneratedQuestionAdmin(admin.ModelAdmin):
    list_display = ["document", "question_type", "status", "created_at"]
    list_filter = ["question_type", "status"]


@admin.register(ExamStyle)
class ExamStyleAdmin(admin.ModelAdmin):
    list_display = ["label", "key", "doc_count", "updated_at"]
    search_fields = ["label", "key"]
    readonly_fields = ["source_hash"]


@admin.register(MockExam)
class MockExamAdmin(admin.ModelAdmin):
    list_display = ["user", "course_code", "style_label", "created_at", "submitted_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "course_code"]
