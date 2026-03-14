"""
Read-only Django models mapped to existing Supabase tables.

These models are NOT managed by Django migrations (managed = False).
They exist so we can query user_profiles, departments, and roles via the ORM.
"""

import uuid
from django.db import models


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.TextField()
    manager_user_id = models.UUIDField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "departments"

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user_id = models.UUIDField(primary_key=True)
    employee_code = models.TextField(unique=True)
    full_name = models.TextField()
    department = models.ForeignKey(
        Department, on_delete=models.DO_NOTHING, db_column="department_id"
    )

    class Meta:
        managed = False
        db_table = "user_profiles"

    def __str__(self):
        return self.full_name


class Role(models.Model):
    code = models.TextField(primary_key=True)

    class Meta:
        managed = False
        db_table = "roles"

    def __str__(self):
        return self.code


class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user_id = models.UUIDField()
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, db_column="role_id")

    class Meta:
        managed = False
        db_table = "user_roles"
        unique_together = [("user_id", "role")]
