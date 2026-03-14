from rest_framework import serializers
from opportunities.models import Opportunity


class OpportunityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            "id", "project_name", "status", "contractor_id",
            "owner_id", "consultant_id", "created_at", "updated_at",
        ]


class OpportunityDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "created_by_user_id", "department_id"]


class OpportunityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            "project_name", "email_body", "contractor_id",
            "owner_id", "consultant_id",
        ]
