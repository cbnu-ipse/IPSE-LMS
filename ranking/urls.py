from django.urls import path

from .views import ranking_home, community_ranking

app_name = "ranking"

urlpatterns = [
    path("", ranking_home, name="home"),
    path("community/", community_ranking, name="community"),
]
