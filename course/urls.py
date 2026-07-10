from django.urls import path
from . import views

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('create/', views.course_create, name='course_create'),
    path('<str:slug>/', views.course_detail, name='course_detail'),
    path('<str:slug>/edit/', views.course_edit, name='course_edit'),
    path('<str:slug>/delete/', views.course_delete, name='course_delete'),
    path('<str:slug>/update-summary/', views.course_update_summary, name='course_update_summary'),
    path('<str:course_slug>/lesson/create/', views.lesson_create, name='lesson_create'),
    path('<str:course_slug>/lesson/<int:lesson_pk>/', views.lesson_detail, name='lesson_detail'),
    path('<str:course_slug>/lesson/<int:lesson_pk>/edit/', views.lesson_edit, name='lesson_edit'),
    path('lesson/<int:lesson_pk>/delete/', views.lesson_delete, name='lesson_delete'),
]
