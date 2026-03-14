import uuid
from django.db import models


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    opportunity_id = models.UUIDField(null=True, blank=True)
    title = models.TextField()
    assigned_to_user_id = models.UUIDField()
    created_by_user_id = models.UUIDField()
    status = models.TextField(default="OPEN")
    due_date = models.DateTimeField(null=True, blank=True)
    priority = models.IntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tasks"
        ordering = ["priority", "-created_at"]

    def __str__(self):
        return self.title
