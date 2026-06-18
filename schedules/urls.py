from django.urls import path
from . import views

urlpatterns = [
    path('timetable/', views.timetable_view, name='timetable'),
    path('api/timetable/add/', views.add_timetable_subject_api, name='add_timetable_subject_api'),
    path('api/timetable/delete/<int:subject_id>/', views.delete_timetable_subject_api, name='delete_timetable_subject_api'),
    path('api/timetable/import/', views.import_everytime_timetable_api, name='import_everytime_timetable_api'),
]
