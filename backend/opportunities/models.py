import uuid
from django.db import models


class Opportunity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_name = models.TextField()
    email_body = models.TextField(blank=True, default="")
    contractor_id = models.UUIDField(null=True, blank=True)
    owner_id = models.UUIDField(null=True, blank=True)
    consultant_id = models.UUIDField(null=True, blank=True)
    created_by_user_id = models.UUIDField()
    assigned_engineer_user_id = models.UUIDField(null=True, blank=True)
    department_id = models.UUIDField()
    status = models.TextField(default="NEW")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "opportunities"
        ordering = ["-created_at"]

    def __str__(self):
        return self.project_name
