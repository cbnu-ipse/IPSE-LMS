from django.urls import path

from . import views

app_name = "assistant"

urlpatterns = [
    path("message/", views.chat_message_view, name="chat_message"),
    path("history/", views.chat_history_view, name="chat_history"),
    path("sessions/", views.session_list_view, name="sessions"),
    path("sessions/new/", views.session_create_view, name="session_create"),
    path("sessions/<int:session_id>/rename/", views.session_rename_view, name="session_rename"),
    path("sessions/<int:session_id>/delete/", views.session_delete_view, name="session_delete"),
]
