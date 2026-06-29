from django.urls import path
from django.conf import settings
from . import views

urlpatterns = [
    path("", views.lobby_view, name="game_lobby"),
    path("slot-machine/", views.slot_machine_view, name="slot_machine"),
    path("slot/status/", views.slot_status, name="slot_status"),
    path("slot/spin/", views.slot_spin, name="slot_spin"),
    path("apple-game/", views.apple_game_view, name="apple_game"),
    path("apple-game/score/", views.save_apple_score, name="apple_game_score"),
    path("apple-game/ranking/", views.apple_game_ranking, name="apple_game_ranking"),
    path("slot/ranking/", views.slot_ranking, name="slot_ranking"),
    path("ranking/", views.game_ranking_view, name="game_ranking"),
]

if settings.DEBUG:
    urlpatterns += [
        path("slot/debug-spin/", views.slot_debug_spin, name="slot_debug_spin"),
    ]
