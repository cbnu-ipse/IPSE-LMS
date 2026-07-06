from django.urls import path

from .views import ranking_home, community_ranking, profile_ranking_stats

app_name = "ranking"

urlpatterns = [
    path("", ranking_home, name="home"),
    path("community/", community_ranking, name="community"),
    path("api/profile-stats/<int:user_id>/", profile_ranking_stats, name="profile_stats"),
]
