from rest_framework import serializers


class DepartmentSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()


class MeSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    employee_code = serializers.CharField()
    full_name = serializers.CharField()
    department = DepartmentSerializer()
    roles = serializers.ListField(child=serializers.CharField())
