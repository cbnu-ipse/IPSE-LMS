from django.contrib import admin

from .models import ChatMessage, ChatSession


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ["role", "content", "created_at"]


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ["user", "updated_at"]
    search_fields = ["user__username"]
    inlines = [ChatMessageInline]
