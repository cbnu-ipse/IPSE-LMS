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
    path("memory-match/", views.memory_match_view, name="memory_match"),
    path("memory-match/score/", views.save_memory_match_score, name="memory_match_score"),
    path("memory-match/ranking/", views.memory_match_ranking, name="memory_match_ranking"),
    path("number-speed/", views.number_speed_view, name="number_speed"),
    path("number-speed/score/", views.save_number_speed_score, name="number_speed_score"),
    path("number-speed/ranking/", views.number_speed_ranking, name="number_speed_ranking"),
    path("pattern-recall/", views.pattern_recall_view, name="pattern_recall"),
    path("pattern-recall/score/", views.save_pattern_recall_score, name="pattern_recall_score"),
    path("pattern-recall/ranking/", views.pattern_recall_ranking, name="pattern_recall_ranking"),
    path("slot/ranking/", views.slot_ranking, name="slot_ranking"),
    path("ranking/", views.game_ranking_view, name="game_ranking"),
    path("season-reward/dismiss/", views.dismiss_season_reward, name="season_reward_dismiss"),
]

if settings.DEBUG:
    urlpatterns += [
        path("slot/debug-spin/", views.slot_debug_spin, name="slot_debug_spin"),
        path("season-reward/debug/", views.season_reward_debug, name="season_reward_debug"),
    ]
