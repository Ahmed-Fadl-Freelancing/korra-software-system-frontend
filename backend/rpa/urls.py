from django.urls import path
from rpa import views

urlpatterns = [
    path("webhooks/uipath", views.uipath_webhook),
]
