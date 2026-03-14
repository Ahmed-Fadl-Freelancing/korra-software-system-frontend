"""
Supabase Storage helper – generates signed upload/download URLs server-side
using the service_role key. Never exposed to the client.
"""

import uuid

import requests
from django.conf import settings


def _headers():
    return {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    }


def create_signed_upload_url(
    bucket: str, opportunity_id: str, filename: str
) -> dict:
    """
    Generate a signed upload URL for Supabase Storage.
    Returns {"signed_url": str, "path": str, "token": str}.
    """
    path = f"{opportunity_id}/{uuid.uuid4().hex}_{filename}"
    url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/upload/sign"
        f"/{bucket}/{path}"
    )
    resp = requests.post(url, headers=_headers(), json={})
    resp.raise_for_status()
    data = resp.json()
    # Supabase returns a relative signedURL; make absolute
    signed = data.get("signedURL") or data.get("signed_url", "")
    if signed.startswith("/"):
        signed = f"{settings.SUPABASE_URL}/storage/v1{signed}"
    return {"signed_url": signed, "path": path}


def create_signed_download_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    """Return a time-limited signed download URL."""
    url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/sign"
        f"/{bucket}/{path}"
    )
    resp = requests.post(url, headers=_headers(), json={"expiresIn": expires_in})
    resp.raise_for_status()
    data = resp.json()
    signed = data.get("signedURL") or data.get("signed_url", "")
    if signed.startswith("/"):
        signed = f"{settings.SUPABASE_URL}/storage/v1{signed}"
    return signed
