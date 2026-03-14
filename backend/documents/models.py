import uuid
from django.db import models


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    opportunity_id = models.UUIDField()
    bucket = models.TextField(default="documents")
    path = models.TextField()
    filename = models.TextField()
    content_type = models.TextField(default="application/pdf")
    uploaded_by_user_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "documents"
        ordering = ["-created_at"]

    def __str__(self):
        return self.filename
