from django.urls import path
from . import views

urlpatterns = [
    path('', views.community_main, name='community_main'),
    path('post/add/', views.post_add, name='post_add'),
    path('post/<int:post_id>/delete/', views.delete_post, name='delete_post'),
    path('post/<int:post_id>/edit/', views.edit_post, name='edit_post'),
    path('notice/<int:notice_id>/', views.notice_detail, name='notice_detail'),
    path('activity/<int:activity_id>/', views.activity_detail, name='activity_detail'),
    path('upload-image/', views.upload_editor_image, name='upload_editor_image'),
    path('schedules/', views.schedule_list, name='schedule_list'),
    path('schedule/<int:schedule_id>/', views.schedule_detail, name='schedule_detail'),
    # 투표
    path('polls/', views.poll_list, name='poll_list'),
    path('polls/create/', views.poll_create, name='poll_create'),
    path('polls/<int:poll_id>/', views.poll_detail, name='poll_detail'),
    path('polls/<int:poll_id>/toggle/', views.poll_toggle, name='poll_toggle'),
    path('polls/<int:poll_id>/delete/', views.poll_delete, name='poll_delete'),
    path('polls/<int:poll_id>/votes/', views.poll_votes, name='poll_votes'),
    path('polls/<int:poll_id>/edit/', views.poll_edit, name='poll_edit'),
    path('polls/<int:poll_id>/votes/export/', views.poll_votes_export, name='poll_votes_export'),
    # 설문
    path('surveys/', views.survey_list, name='survey_list'),
    path('surveys/create/', views.survey_create, name='survey_create'),
    path('surveys/<int:survey_id>/edit/', views.survey_edit, name='survey_edit'),
    path('surveys/<int:survey_id>/delete/', views.survey_delete, name='survey_delete'),
    path('surveys/<int:survey_id>/', views.survey_detail, name='survey_detail'),
    path('surveys/<int:survey_id>/respond/', views.survey_respond, name='survey_respond'),
    path('surveys/<int:survey_id>/results/', views.survey_results, name='survey_results'),
    path('surveys/<int:survey_id>/results/export/', views.survey_results_export, name='survey_results_export'),
    path('api/surveys/<int:survey_id>/results/', views.survey_results_api, name='survey_results_api'),
    # iCal 캘린더 피드
    path('schedules/calendar.ics', views.global_calendar_feed, name='global_calendar_feed'),
    path('schedules/personal/<str:token>/calendar.ics', views.personal_calendar_feed, name='personal_calendar_feed'),
    path('schedules/subscribe/', views.calendar_subscribe, name='calendar_subscribe'),
]