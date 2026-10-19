from django.urls import path

from . import views

app_name = "mypage"

urlpatterns = [
    path("", views.document_list, name="document_list"),
    path("learning/", views.learning_overview, name="learning"),
    path("folder/create/", views.folder_create, name="folder_create"),
    path("folder/<int:pk>/delete/", views.folder_delete, name="folder_delete"),
    path("folder/<int:folder_id>/", views.document_list, name="document_list"),
    path("<int:pk>/", views.document_preview, name="document_preview"),
    path("<int:pk>/status/", views.document_status, name="document_status"),
    path("<int:pk>/generate/", views.generate_question_view, name="generate_question"),
    path("<int:pk>/answer/<int:question_id>/", views.submit_answer_view, name="submit_answer"),
    path("<int:pk>/resummarize/", views.document_resummarize, name="document_resummarize"),
    path("<int:pk>/delete/", views.document_delete, name="document_delete"),
]
