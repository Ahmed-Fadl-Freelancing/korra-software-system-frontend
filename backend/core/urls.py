from django.urls import include, path

urlpatterns = [
    path("", include("accounts.urls")),
    path("", include("workflow.urls")),
    path("", include("opportunities.urls")),
    path("", include("documents.urls")),
    path("", include("rpa.urls")),
]
