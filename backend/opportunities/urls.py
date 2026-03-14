from django.urls import path
from opportunities import views

urlpatterns = [
    path("opportunities", views.opportunity_list),
    path("opportunities/create", views.opportunity_create),
    path("opportunities/<uuid:pk>", views.opportunity_detail),
]
