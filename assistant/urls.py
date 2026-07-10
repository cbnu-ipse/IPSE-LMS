from django.urls import path

from . import views

app_name = "assistant"

urlpatterns = [
    path("message/", views.chat_message_view, name="chat_message"),
    path("history/", views.chat_history_view, name="chat_history"),
]
