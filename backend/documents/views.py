from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.helpers import get_profile_for_request, is_admin
from accounts.permissions import HasProfile
from documents.models import Document
from documents.serializers import DocumentSerializer, SignedUploadRequestSerializer
from documents.services.storage import create_signed_download_url, create_signed_upload_url
from opportunities.models import Opportunity


def _can_access_opportunity(profile, opportunity_id):
    """Check if user is allowed to interact with this opportunity."""
    if is_admin(profile):
        return True
    return Opportunity.objects.filter(
        pk=opportunity_id,
        department_id=profile.department_id,
    ).exists()


@api_view(["POST"])
@permission_classes([HasProfile])
def signed_upload_url(request):
    ser = SignedUploadRequestSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    profile = get_profile_for_request(request)
    opp_id = str(ser.validated_data["opportunity_id"])

    if not _can_access_opportunity(profile, opp_id):
        return Response(
            {"code": "FORBIDDEN", "detail": "No access to this opportunity."},
            status=status.HTTP_403_FORBIDDEN,
        )

    result = create_signed_upload_url(
        bucket="documents",
        opportunity_id=opp_id,
        filename=ser.validated_data["filename"],
    )
    return Response({"signed_url": result["signed_url"], "path": result["path"]})


@api_view(["GET"])
@permission_classes([HasProfile])
def signed_download_url(request, pk):
    profile = get_profile_for_request(request)
    try:
        doc = Document.objects.get(pk=pk)
    except Document.DoesNotExist:
        return Response({"code": "NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    if not _can_access_opportunity(profile, doc.opportunity_id):
        return Response({"code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

    url = create_signed_download_url(bucket=doc.bucket, path=doc.path)
    return Response({"url": url})


@api_view(["POST"])
@permission_classes([HasProfile])
def document_register(request):
    profile = get_profile_for_request(request)
    data = request.data.copy()
    opp_id = data.get("opportunity_id")

    if not _can_access_opportunity(profile, opp_id):
        return Response({"code": "FORBIDDEN"}, status=status.HTTP_403_FORBIDDEN)

    ser = DocumentSerializer(data=data)
    ser.is_valid(raise_exception=True)
    ser.save(uploaded_by_user_id=profile.user_id)
    return Response(ser.data, status=status.HTTP_201_CREATED)
