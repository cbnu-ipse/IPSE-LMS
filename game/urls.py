from django.urls import path
from django.conf import settings
from . import views

urlpatterns = [
    path("", views.lobby_view, name="game_lobby"),
    path("slot-machine/", views.slot_machine_view, name="slot_machine"),
    path("slot/status/", views.slot_status, name="slot_status"),
    path("slot/spin/", views.slot_spin, name="slot_spin"),
]

if settings.DEBUG:
    urlpatterns += [
        path("slot/debug-spin/", views.slot_debug_spin, name="slot_debug_spin"),
    ]
