from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views import defaults as default_views
import community.views

urlpatterns = [
    path("", include("core.urls")),
    path(settings.ADMIN_PATH, admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("course/", include("course.urls")),
    path("quiz/", include("quiz.urls")),
    path("contest/", include("contest.urls")),
    path("problems/", include("problems.urls")),
    path("community/", include("community.urls")),
    path("ranking/", include("ranking.urls")),
    path("accounts/api/", include("accounts.api.urls", namespace="accounts-api")),
    path("compiler/", include("compiler.urls")),
    path("recruit/<int:form_id>/", community.views.recruit_apply, name="recruit_apply"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [
        path("400/", default_views.bad_request, kwargs={"exception": Exception("Bad Request")}),
        path("403/", default_views.permission_denied, kwargs={"exception": Exception("Permission Denied")}),
        path("404/", default_views.page_not_found, kwargs={"exception": Exception("Page not Found")}),
        path("500/", default_views.server_error),
    ]