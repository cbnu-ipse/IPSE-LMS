from django.urls import path

from . import views

app_name = "mypage"

urlpatterns = [
    path("", views.document_list, name="document_list"),
    path("learning/", views.learning_overview, name="learning"),
    path("estimate/", views.upload_estimate, name="upload_estimate"),
    path("folder/create/", views.folder_create, name="folder_create"),
    path("folder/<int:pk>/rename/", views.folder_rename, name="folder_rename"),
    path("folder/<int:pk>/delete/", views.folder_delete, name="folder_delete"),
    path("folder/<int:folder_id>/", views.document_list, name="document_list"),
    path("cram/create/", views.cram_note_create, name="cram_note_create"),
    path("mock/create/", views.mock_exam_create, name="mock_exam_create"),
    path("mock/<int:pk>/", views.mock_exam, name="mock_exam"),
    path("wrong/", views.wrong_notes, name="wrong_notes"),
    path("wrong/<int:pk>/answer/", views.wrong_note_answer, name="wrong_note_answer"),
    path("wrong/<int:pk>/remove/", views.wrong_note_remove, name="wrong_note_remove"),
    path("<int:pk>/", views.document_preview, name="document_preview"),
    path("<int:pk>/status/", views.document_status, name="document_status"),
    path("<int:pk>/generate/", views.generate_question_view, name="generate_question"),
    path("<int:pk>/answer/<int:question_id>/", views.submit_answer_view, name="submit_answer"),
    path("<int:pk>/resummarize/", views.document_resummarize, name="document_resummarize"),
    path("<int:pk>/rename/", views.document_rename, name="document_rename"),
    path("<int:pk>/move/", views.document_move, name="document_move"),
    path("<int:pk>/delete/", views.document_delete, name="document_delete"),
]
