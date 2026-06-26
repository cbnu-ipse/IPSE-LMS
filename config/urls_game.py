from django.urls import path, include
from django.conf import settings
from django.contrib import admin

urlpatterns = [
    path("", include("game.urls")),
    path("", include("core.urls")),
    path("accounts/", include("accounts.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
]
