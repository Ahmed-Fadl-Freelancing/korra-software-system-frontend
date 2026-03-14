# Backend – Django Local-RLS API

Minimal Django + DRF backend that acts as "local RLS" for the internal platform. Authenticates users via Supabase JWT (HS256, verified locally) and enforces department/role-based data access.

## Architecture

- **Auth**: Supabase JWT verified locally using `SUPABASE_JWT_SECRET` (no network calls)
- **Identity**: Reads `public.user_profiles`, `public.departments`, `public.roles`, `public.user_roles` (existing Supabase tables, `managed = False`)
- **Data models**: `opportunities`, `tasks`, `documents` (Django-managed migrations)
- **Storage**: Signed upload/download URLs via Supabase Storage service-role key (server-side only)

## Local-RLS Rules

| Role    | Sees                                              |
| ------- | ------------------------------------------------- |
| Regular | Own tasks + own department's opportunities        |
| Manager | All tasks/opportunities in their department       |
| Admin   | Everything                                        |

## Quick Start

```bash
cp .env.example .env
# Fill in DATABASE_URL, SUPABASE_JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Option A: Docker
docker compose up --build

# Option B: Local
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

## Endpoints

| Method | Path                                  | Auth     | Description                    |
| ------ | ------------------------------------- | -------- | ------------------------------ |
| GET    | `/health`                             | Public   | Health check                   |
| GET    | `/me`                                 | JWT      | Current user profile + roles   |
| GET    | `/tasks`                              | JWT      | My tasks (manager: dept tasks) |
| GET    | `/opportunities`                      | JWT      | Filtered by dept/role          |
| POST   | `/opportunities/create`               | JWT+Sales| Create opportunity             |
| GET    | `/opportunities/<id>`                 | JWT      | Detail (if allowed)            |
| POST   | `/documents/signed-upload-url`        | JWT      | Get signed upload URL          |
| GET    | `/documents/<id>/signed-download-url` | JWT      | Get signed download URL        |
| POST   | `/documents`                          | JWT      | Register document metadata     |
| POST   | `/webhooks/uipath`                    | Optional | UiPath webhook receiver (stub) |
