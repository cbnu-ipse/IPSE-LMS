from django.contrib import admin

from .models import GeneratedQuestion, PersonalDocument, PersonalFolder, Subject


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
    list_display = ["title", "user", "folder", "document_type", "summary_status", "uploaded_at"]
    list_filter = ["uploaded_at", "summary_status", "document_type"]
    search_fields = ["title", "user__username"]


@admin.register(GeneratedQuestion)
class GeneratedQuestionAdmin(admin.ModelAdmin):
    list_display = ["document", "question_type", "status", "created_at"]
    list_filter = ["question_type", "status"]
