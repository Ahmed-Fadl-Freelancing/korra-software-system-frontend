from django.urls import path
from workflow import views

urlpatterns = [
    path("tasks", views.task_list),
]
