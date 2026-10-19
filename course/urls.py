from django.urls import path
from . import views, views_studio

urlpatterns = [
    path('', views.course_list, name='course_list'),
    # 강의 생성 탭 (강의자 전용) — '<slug>/'보다 먼저 와야 한다
    path('studio/', views_studio.studio_list, name='course_studio'),
    path('studio/topic/', views_studio.studio_topic, name='course_studio_topic'),
    path('studio/topic/build/', views_studio.studio_topic_build, name='course_studio_topic_build'),
    path('studio/<int:pk>/', views_studio.studio_detail, name='course_studio_detail'),
    path('studio/<int:pk>/preview/<int:ci>/<int:si>/', views_studio.studio_preview, name='course_studio_preview'),
    path('studio/<int:pk>/<str:action>/', views_studio.studio_action, name='course_studio_action'),
    path('studio/course/<str:slug>/edit/', views_studio.studio_start_edit, name='course_studio_start_edit'),
    path('create/', views.course_create, name='course_create'),
    path('<str:slug>/', views.course_detail, name='course_detail'),
    path('<str:slug>/edit/', views.course_edit, name='course_edit'),
    path('<str:slug>/delete/', views.course_delete, name='course_delete'),
    path('<str:slug>/update-summary/', views.course_update_summary, name='course_update_summary'),
    path('<str:course_slug>/lesson/create/', views.lesson_create, name='lesson_create'),
    path('<str:course_slug>/lesson/<int:lesson_pk>/', views.lesson_detail, name='lesson_detail'),
    path('<str:course_slug>/lesson/<int:lesson_pk>/edit/', views.lesson_edit, name='lesson_edit'),
    path('<str:course_slug>/lesson/<int:lesson_pk>/quiz/', views.lesson_quiz_submit, name='lesson_quiz_submit'),
    path('lesson/<int:lesson_pk>/delete/', views.lesson_delete, name='lesson_delete'),
]
