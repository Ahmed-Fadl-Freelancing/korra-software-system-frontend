from rest_framework import serializers
from documents.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ["id", "created_at", "uploaded_by_user_id"]


class SignedUploadRequestSerializer(serializers.Serializer):
    opportunity_id = serializers.UUIDField()
    filename = serializers.CharField()
    content_type = serializers.CharField(default="application/pdf")
