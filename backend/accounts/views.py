from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.helpers import _roles, get_profile_for_request
from accounts.serializers import MeSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    profile = get_profile_for_request(request)
    if profile is None:
        return Response(
            {"code": "PROFILE_NOT_FOUND", "detail": "User profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    data = {
        "user_id": str(profile.user_id),
        "employee_code": profile.employee_code,
        "full_name": profile.full_name,
        "department": {
            "id": str(profile.department.id),
            "name": profile.department.name,
        },
        "roles": _roles(profile),
    }
    serializer = MeSerializer(data)
    return Response(serializer.data)
