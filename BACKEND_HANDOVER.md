# Backend Handoff & Synchronization Guide

This document serves as the "Source of Truth" for the Django Backend repository to ensure it remains perfectly synchronized with the React Frontend.

## 1. Project Context
- **Project Name:** Korra Software System
- **Current Phase:** Milestone 2 (Auth Foundation & App Layout) COMPLETE on Frontend.
- **Frontend Status:** Ready for data integration. All API calls use `apiClient` which attaches the Supabase JWT.
- **Backend Responsibility:** Validate Supabase JWTs, enforce RLS-equivalent logic in DRF, and serve the core business logic.

## 2. Technical Requirements
- **Auth:** Must use `djangorestframework-simplejwt` or a custom middleware to validate `Authorization: Bearer <Supabase_JWT>`.
- **API Base:** `http://localhost:8000` (configurable via `.env`).
- **Pathing:**
  - Base URL should match the Frontend `VITE_DJANGO_API_BASE_URL`.
  - Required endpoint immediately: `/me` (GET) returning `UserProfile`.

## 3. Required Synchronization Files (Create in Backend Repo)

### A. `.github/copilot-instructions.md` (Copy exactly)
```markdown
# GitHub Copilot Instructions - Korra Backend

## CRITICAL: GitHub Workflow Rules
- **DO NOT** merge pull requests to the `main` branch automatically.
- After creating a Pull Request, **STOP** and wait for the user to review and merge it manually.
- NEVER use `gh pr merge` or any merge command on the `main` branch.

## Technical Rules
- Python (Django + DRF).
- Supabase JWT Validation.
- Conventional Commits: `feat(scope): description`.
- Reference Linear IDs in commits (e.g., `KOR-53`).
```

### B. `PROGRESS.md` (Shared View)
Keep this in sync with the Frontend `PROGRESS.md`.
```markdown
# Progress Matrix (Backend)

## Milestone 2: Auth Sync
- [/] KOR-53: [FEAT] Auth Foundation — Support Supabase JWT
  - [ ] Middleware for JWT Validation
  - [ ] `/me` endpoint for Profile hydration
- [ ] KOR-54: [FEAT] App Layout Support

## Milestone 3: Opportunity Ingestion
- [ ] KOR-55: [FEAT] Opportunity Intake — PDF Extraction Logic
- [ ] KOR-56: [FEAT] Opportunity Intake — Manual Creation API
```

## 4. Linear Integration
The backend should use the same Linear project: **Korra Frontend App** (Note: Team "Korrra").
- **Issue Creation:** Use the `scripts/linear-issues.mjs` pattern if you need to create backend-specific tasks, but prefer using the existing feature-compacted IDs (KOR-53 to KOR-58) to ensure cross-repo feature delivery.

## 5. Current State Summary
The Frontend is **Ready for Work**. The Supabase client is configured, and the `AuthContext` is waiting for the Backend `/me` endpoint to return a valid profile. If the Backend is not ready, the Frontend uses a `STUB_USER` fallback.

**Immediate Action for Backend:**
1. Setup Django Project.
2. Implement Supabase JWT validation.
3. Create `GET /me` endpoint.

## 6. Project Flow Reference
Refer to `PROJECT_FLOW.md` for the technical lifecycle of Opportunities and the dual-path ingestion logic (PDF vs Manual).
