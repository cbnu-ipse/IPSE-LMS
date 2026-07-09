from django.contrib import admin

from .models import GeneratedQuestion, PersonalDocument, PersonalFolder


@admin.register(PersonalFolder)
class PersonalFolderAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "created_at"]
    search_fields = ["name", "user__username"]


@admin.register(PersonalDocument)
class PersonalDocumentAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "folder", "uploaded_at"]
    list_filter = ["uploaded_at"]
    search_fields = ["title", "user__username"]


@admin.register(GeneratedQuestion)
class GeneratedQuestionAdmin(admin.ModelAdmin):
    list_display = ["document", "question_type", "created_at"]
    list_filter = ["question_type"]
