from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.helpers import (
    get_profile_for_request,
    has_role,
    is_admin,
    is_manager,
)
from accounts.permissions import HasProfile, IsSalesDepartment
from opportunities.models import Opportunity
from opportunities.serializers import (
    OpportunityCreateSerializer,
    OpportunityDetailSerializer,
    OpportunityListSerializer,
)


def _visible_opportunities(profile):
    """Return queryset filtered by local-RLS rules."""
    if is_admin(profile):
        return Opportunity.objects.all()
    qs = Opportunity.objects.filter(department_id=profile.department_id)
    if not is_manager(profile):
        qs = qs.filter(
            models_Q_or(
                created_by_user_id=profile.user_id,
                assigned_engineer_user_id=profile.user_id,
            )
        )
    return qs


def models_Q_or(**kwargs):
    from django.db.models import Q

    q = Q()
    for k, v in kwargs.items():
        q |= Q(**{k: v})
    return q


@api_view(["GET"])
@permission_classes([HasProfile])
def opportunity_list(request):
    profile = get_profile_for_request(request)
    qs = _visible_opportunities(profile)
    return Response(OpportunityListSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([HasProfile, IsSalesDepartment])
def opportunity_create(request):
    profile = get_profile_for_request(request)
    serializer = OpportunityCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    opp = serializer.save(
        created_by_user_id=profile.user_id,
        department_id=profile.department_id,
    )
    return Response(
        OpportunityDetailSerializer(opp).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([HasProfile])
def opportunity_detail(request, pk):
    profile = get_profile_for_request(request)
    qs = _visible_opportunities(profile)
    try:
        opp = qs.get(pk=pk)
    except Opportunity.DoesNotExist:
        return Response(
            {"code": "NOT_FOUND", "detail": "Opportunity not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(OpportunityDetailSerializer(opp).data)
