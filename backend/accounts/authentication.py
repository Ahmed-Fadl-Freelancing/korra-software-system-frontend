"""
Supabase JWT (HS256) authentication for DRF.

Reads the Authorization: Bearer <token> header, verifies the signature
locally using SUPABASE_JWT_SECRET, and attaches a lightweight user object
to request.user. No network calls to Supabase are made.
"""

import jwt
from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication


class SupabaseUser:
    """Minimal user object attached to request.user after JWT verification."""

    def __init__(self, uid: str, email: str | None = None):
        self.id = uid
        self.pk = uid
        self.email = email or ""
        self.is_authenticated = True

    def __str__(self):
        return self.email or self.id


class SupabaseJWTAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith(f"{self.keyword} "):
            return None

        token = auth_header[len(self.keyword) + 1 :]
        secret = settings.SUPABASE_JWT_SECRET
        if not secret:
            raise exceptions.AuthenticationFailed("Server JWT secret not configured.")

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"require": ["exp", "sub"]},
                audience="authenticated",
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired.")
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token: {e}")

        uid = payload.get("sub")
        email = payload.get("email")
        return (SupabaseUser(uid, email), payload)
