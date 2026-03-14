"""
Authorization helpers – local RLS behaviour.

These operate on the enriched profile dict attached by the identity middleware/view,
or can be called with a raw profile dict.
"""

from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from accounts.models import UserProfile


def _roles(profile: "UserProfile") -> list[str]:
    """Return cached role codes for a profile."""
    if not hasattr(profile, "_role_codes"):
        from accounts.models import UserRole

        profile._role_codes = list(
            UserRole.objects.filter(user_id=profile.user_id)
            .values_list("role__code", flat=True)
        )
    return profile._role_codes


def has_role(profile: "UserProfile", role: str) -> bool:
    return role in _roles(profile)


def is_manager(profile: "UserProfile") -> bool:
    return has_role(profile, "manager")


def is_admin(profile: "UserProfile") -> bool:
    return has_role(profile, "admin")


def is_sales_dept(profile: "UserProfile") -> bool:
    return profile.department.name == "sales"


def is_tech_dept(profile: "UserProfile") -> bool:
    return profile.department.name == "tech_office"


def get_profile_for_request(request) -> "UserProfile":
    """Load and cache the UserProfile for the authenticated request."""
    if hasattr(request, "_cached_profile"):
        return request._cached_profile

    from accounts.models import UserProfile as UP

    try:
        profile = UP.objects.select_related("department").get(
            user_id=request.user.id
        )
    except UP.DoesNotExist:
        profile = None

    request._cached_profile = profile
    return profile
