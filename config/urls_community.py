from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views import defaults as default_views
import community.views
from game.views import dismiss_season_reward

urlpatterns = [
    path("", include("core.urls")),
    path(settings.ADMIN_PATH, admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("community/", include("community.urls")),
    path("schedules/", include("schedules.urls")),
    path("ranking/", include("ranking.urls")),
    path("course/", include("course.urls")),
    path("accounts/api/", include("accounts.api.urls", namespace="accounts-api")),
    path("recruit/<int:form_id>/", community.views.recruit_apply, name="recruit_apply"),
    path("season-reward/dismiss/", dismiss_season_reward, name="season_reward_dismiss"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [
        path("400/", default_views.bad_request, kwargs={"exception": Exception("Bad Request")}),
        path("403/", default_views.permission_denied, kwargs={"exception": Exception("Permission Denied")}),
        path("404/", default_views.page_not_found, kwargs={"exception": Exception("Page not Found")}),
        path("500/", default_views.server_error),
    ]
