import json
import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)

UIPATH_SHARED_SECRET = None  # Set via env if needed


@api_view(["POST"])
@permission_classes([AllowAny])
def uipath_webhook(request):
    # Optional shared-secret verification
    if UIPATH_SHARED_SECRET:
        header_secret = request.META.get("HTTP_X_UIPATH_SECRET", "")
        if header_secret != UIPATH_SHARED_SECRET:
            return Response({"code": "UNAUTHORIZED"}, status=401)

    payload = request.data
    logger.info("UiPath webhook received: %s", json.dumps(payload, default=str)[:500])
    # TODO: persist payload to a webhook_events table
    return Response({"status": "received"})
