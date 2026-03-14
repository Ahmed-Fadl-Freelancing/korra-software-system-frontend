"""
DRF permission classes implementing local-RLS rules.
"""

from rest_framework.permissions import BasePermission

from accounts.helpers import get_profile_for_request, has_role, is_sales_dept


class HasProfile(BasePermission):
    """User must have a row in public.user_profiles."""

    def has_permission(self, request, view):
        return get_profile_for_request(request) is not None


class IsSalesDepartment(BasePermission):
    message = "Only Sales department members can perform this action."

    def has_permission(self, request, view):
        profile = get_profile_for_request(request)
        return profile is not None and is_sales_dept(profile)


class IsAdmin(BasePermission):
    message = "Admin role required."

    def has_permission(self, request, view):
        profile = get_profile_for_request(request)
        return profile is not None and has_role(profile, "admin")
