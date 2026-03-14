from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.helpers import get_profile_for_request, is_admin, is_manager
from accounts.permissions import HasProfile
from workflow.models import Task
from workflow.serializers import TaskSerializer


@api_view(["GET"])
@permission_classes([HasProfile])
def task_list(request):
    profile = get_profile_for_request(request)

    if is_admin(profile):
        qs = Task.objects.all()
    elif is_manager(profile):
        # Manager sees all tasks for their department's opportunities
        from opportunities.models import Opportunity

        dept_opp_ids = Opportunity.objects.filter(
            department_id=profile.department_id
        ).values_list("id", flat=True)
        qs = Task.objects.filter(opportunity_id__in=dept_opp_ids)
    else:
        qs = Task.objects.filter(assigned_to_user_id=profile.user_id)

    return Response(TaskSerializer(qs, many=True).data)
