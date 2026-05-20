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
]