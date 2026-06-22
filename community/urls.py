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
    # 설문조사 API 및 CSV 내보내기
    path('surveys/<int:survey_id>/respond/', views.survey_respond, name='survey_respond'),
    path('surveys/<int:survey_id>/results/export/', views.survey_results_export, name='survey_results_export'),
    path('api/surveys/<int:survey_id>/results/', views.survey_results_api, name='survey_results_api'),
    # iCal 캘린더 피드
    path('schedules/calendar.ics', views.global_calendar_feed, name='global_calendar_feed'),
    path('schedules/personal/<str:token>/calendar.ics', views.personal_calendar_feed, name='personal_calendar_feed'),
    path('schedules/subscribe/', views.calendar_subscribe, name='calendar_subscribe'),
    # 신규 동아리 부원 모집
    path('recruitment/', views.recruit_list, name='recruit_list'),
    path('recruitment/create/', views.recruit_create, name='recruit_create'),
    path('recruitment/<int:form_id>/edit/', views.recruit_edit, name='recruit_edit'),
    path('recruitment/<int:form_id>/manage/', views.recruit_manage, name='recruit_manage'),
    path('recruitment/<int:form_id>/csv/', views.recruit_download_csv, name='recruit_download_csv'),
    
    # ─── 자유 게시판 및 번개 모임 (Meetup) ──────────────────────────────────────
    path('home/', views.community_home, name='community_home'),
    path('board/<int:post_id>/', views.post_detail, name='post_detail'),
    path('board/add/', views.post_create, name='post_create'),
    path('board/<int:post_id>/edit/', views.post_edit, name='post_edit'),
    path('board/attachment/<int:attachment_id>/delete/', views.delete_attachment_api, name='delete_attachment_api'),
    path('board/<int:post_id>/delete/', views.post_delete, name='post_delete'),
    path('meetups/', views.gathering_list, name='gathering_list'),
    path('meetup/<int:gathering_id>/', views.gathering_detail, name='gathering_detail'),
    path('meetup/create/', views.gathering_create, name='gathering_create'),
    path('meetup/<int:gathering_id>/join/', views.gathering_join_toggle, name='gathering_join_toggle'),
    path('meetup/<int:gathering_id>/cancel/', views.gathering_cancel, name='gathering_cancel'),
    path('board/<int:post_id>/like/', views.post_like_toggle, name='post_like_toggle'),
    path('board/<int:post_id>/dislike/', views.post_dislike_toggle, name='post_dislike_toggle'),
    path('comment/<int:comment_id>/like/', views.comment_like_toggle, name='comment_like_toggle'),
    path('comment/<int:comment_id>/dislike/', views.comment_dislike_toggle, name='comment_dislike_toggle'),
    path('meetup/comment/<int:comment_id>/like/', views.gathering_comment_like_toggle, name='gathering_comment_like_toggle'),
    path('meetup/comment/<int:comment_id>/dislike/', views.gathering_comment_dislike_toggle, name='gathering_comment_dislike_toggle'),
    path('api/og-preview/', views.og_preview, name='og_preview'),
]