from django.urls import path
from documents import views

urlpatterns = [
    path("documents/signed-upload-url", views.signed_upload_url),
    path("documents/<uuid:pk>/signed-download-url", views.signed_download_url),
    path("documents", views.document_register),
]
