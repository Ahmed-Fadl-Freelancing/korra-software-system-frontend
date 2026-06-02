# GitHub Copilot — Korra Frontend Instructions

## Project Identity
- **Repo:** `korra-software-system-frontend` (React 18 + Vite + TypeScript + Tailwind + shadcn/ui)
- **Counterpart repo:** `Korra-Software-System-Backend` (Django + DRF + Supabase PostgreSQL)
- **Auth:** Supabase on the frontend. React gets the JWT → passes it in `Authorization: Bearer` header to Django. Django is **stateless** — it only validates the JWT, never issues sessions.

## Architecture Rules (never violate these)
1. Django never manages sessions or issues tokens. All auth state lives in Supabase.
2. Every outbound API call to Django must include the Supabase JWT via the interceptor in `src/lib/api-client.ts`.
3. Role/department checks happen via `user_profiles` table (FK to `departments` and many-to-many `user_roles` → `roles`). Never use JWT claims for authorization.
4. Use the existing `src/contexts/AuthContext.tsx` for any auth-related state.
5. PDF files are sent to `POST /api/documents/upload/` — **never** processed on the frontend.
6. Extraction status from backend is one of: `success`, `partial`, `failed`. Handle all three.

## Database Enums (use exactly these values)
**Document Types:** `offer`, `submittal`, `rfq`  
**Project Status:** `won`, `lost`, `technicalApproval`, `onHold`, `withDifferentContractor`, `tenderingPhase`, `cancelled`, `finalNegotiation`  
**Project Application:** `Industrial`, `Commercial`, `Health`, `Residential`  
**Project Scope:** `Supply`, `SupplyInstallation`, `Maintenance`, `Retrofit`, `Other`  
**Product Family:** `Chiller`, `Pump`, `Generator`  
**Chiller Condenser:** `AirCooled`, `WaterCooled`  
**Chiller Compressor:** `Centrifugal`, `Screw`, `Scroll`, `Reciprocating`  
**Win Reasons:** `price`, `technical`, `relationship`, `service`, `sole_source`, `bundled_deal`  
**Loss Reasons:** `price`, `technical`, `relationship`, `delivery_delay`, `response_delay`, `scope_changed`, `bad_experience`

## Database Tables (key fields)
- `user_profiles`: `user_id` (PK), `employee_code`, `full_name`, `department_id` (FK), `job_title`, `is_active`
- `departments`: `id`, `name`, `manager_user_id`
- `roles`: `id`, `code`, `name`
- `user_roles`: many-to-many (user ↔ role)
- `projects`: `id`, `name`, `application`, `scope`, `status`, `sales_eng_id`, `tech_off_eng_id`, `product_id`, `extracted_data` (JSONB), `selection_data` (JSONB)
- `documents`: `id`, `project_id`, `doc_type`, `version`, `bucket`, `path`, `filename`, `is_current`
- `project_status_history`: audit trail of status changes with win/loss reasons

## Progress Tracking & Workflow

**Source of Truth:** `PROGRESS.md` — Read the Active milestone section for task list.

### Per-Task Workflow

For each task (M2-1, M2-2, etc.):

1. **Create Linear Issue** (MCP Linear API)
   - Use task name + acceptance criteria from PROGRESS.md
   - Get Linear issue ID (e.g., KORR-123)

2. **Create Feature Branch**
   - Pattern: `feat/ISSUE-ID-short-description`
   - Example: `feat/KORR-123-supabase-client`
   - Command: `git checkout -b feat/ISSUE-ID-desc`

3. **Implement Task**
   - Write code following conventions below
   - Test locally (no errors in dev server)

4. **Commit (Conventional Commits)**
   - Format: `<type>(scope): description`
   - Types: feat, fix, docs, style, refactor, test, chore
   - Example: `feat(auth): add supabase client configuration`

5. **Create PR (Draft)**
   - Push: `git push origin feat/ISSUE-ID-desc`
   - PR: `gh pr create --draft --title "..." --body "Closes ISSUE-ID" --base main`
   - Status: Draft (wait for user approval)

6. **Update PROGRESS.md**
   - Mark `[x]` task done
   - Add comment: `<!-- PR: #123, Linear: ISSUE-ID, done: YYYY-MM-DD -->`

7. **Wait for Approval**
   - User reviews PR → approves → says "merge"
   - Then: `gh pr merge <PR-number> --squash --delete-branch`

8. **Next Task**
   - Move to next unchecked task in PROGRESS.md

**One PR per task** — granular, easy to review.

## Code Conventions
- Components: `PascalCase.tsx` in `src/components/`
- Pages: `PascalCase.tsx` in `src/pages/`
- Hooks: `use-kebab-case.ts` in `src/hooks/`
- API calls: centralized in `src/lib/api-client.ts` — never call `fetch`/`axios` directly in components
- UI primitives: use `src/components/ui/` (shadcn) — do not install duplicate UI libraries
- State: React Context for global state, `useState`/`useReducer` locally — no Redux
- Styling: Tailwind utility classes only — no inline styles, no CSS modules

## Stack Versions
- React 18, TypeScript 5, Vite 5
- `@supabase/supabase-js` for auth
- Tailwind CSS 3 + shadcn/ui
- `react-router-dom` v6 for routing
- `react-hook-form` + `zod` for forms and validation

## What NOT to do
- Do not add new UI libraries without asking
- Do not bypass `ProtectedRoute` or `RoleGuard`
- Do not hardcode user IDs, API keys, or secrets
- Do not process PDFs on the frontend
- Do not assume Django sessions exist
