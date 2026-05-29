from django.urls import path
from django.urls import reverse_lazy
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path(
        "login/",
        views.KoreanLoginView.as_view(template_name="registration/login.html"),
        name="login",
    ),
    path(
        "logout/",
        auth_views.LogoutView.as_view(),
        name="logout",
    ),
    path(
        "password_reset/",
        views.UserPasswordResetView.as_view(),
        name="password_reset",
    ),
    path(
        "password_reset/done/",
        auth_views.PasswordResetDoneView.as_view(template_name="registration/password_reset_done.html"),
        name="password_reset_done",
    ),
    path(
        "reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="registration/password_reset_confirm.html",
            success_url=reverse_lazy("password_reset_complete"),
        ),
        name="password_reset_confirm",
    ),
    path(
        "reset/done/",
        auth_views.PasswordResetCompleteView.as_view(template_name="registration/password_reset_complete.html"),
        name="password_reset_complete",
    ),
    path("register/", views.register, name="register"),
    path('profile/update/api/', views.update_profile_api, name='update_profile_api'),
    path('profile/picture/update/', views.update_profile_picture, name='update_profile_picture'),

    # ─── Profile ───────────────────────────────────────────────────────────────
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/<int:user_id>/', views.profile_single, name='profile_single'),
    path(
        'password/change/',
        auth_views.PasswordChangeView.as_view(
            template_name='setting/password_change.html',
            success_url=reverse_lazy('profile'),
        ),
        name='change_password',
    ),

    # ─── Student Management ────────────────────────────────────────────────────
    path('students/', views.student_list, name='student_list'),
    path('students/add/', views.add_student, name='add_student'),
    path('students/<int:pk>/edit/', views.student_edit, name='student_edit'),
    path('students/<int:pk>/delete/', views.student_delete, name='student_delete'),
    path('students/<int:pk>/level/', views.student_program_edit, name='student_program_edit'),
    path('students/pdf/', views.student_list_pdf, name='student_list_pdf'),

    # ─── Lecturer / Staff Management ───────────────────────────────────────────
    path('lecturers/', views.lecturer_list, name='lecturer_list'),
    path('lecturers/add/', views.add_lecturer, name='add_lecturer'),
    path('lecturers/<int:pk>/edit/', views.staff_edit, name='staff_edit'),
    path('lecturers/<int:pk>/delete/', views.lecturer_delete, name='lecturer_delete'),
    path('lecturers/pdf/', views.lecturer_list_pdf, name='lecturer_list_pdf'),

    # ─── LMS Integration ───────────────────────────────────────────────────────
    path('lms/', views.lms_page, name='lms_page'),
]