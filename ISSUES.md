# Korra System — Unified Issue Tracker

> This file is the single source of truth for ALL issues across both the **Frontend** and **Backend** repositories.
> AI agents must read this before starting any work to stay aligned with the full system flow.

---

## Brand Identity & Design System

**Company card palette: Blue · White · Silver**

| Token | Value | Usage |
|-------|-------|-------|
| Primary (Blue) | `#1E3A8A` (Tailwind `blue-900`) | Buttons, active nav, links, badges |
| Primary-light | `#3B82F6` (Tailwind `blue-500`) | Hover states, highlights, charts |
| Surface (White) | `#FFFFFF` | Card backgrounds, modals |
| Surface-muted | `#F8FAFC` (Tailwind `slate-50`) | Page background |
| Silver/Border | `#CBD5E1` (Tailwind `slate-300`) | Borders, dividers, skeleton |
| Silver-dark | `#94A3B8` (Tailwind `slate-400`) | Muted text, sub-labels |
| Text-primary | `#0F172A` (Tailwind `slate-950`) | Headings |
| Text-muted | `#64748B` (Tailwind `slate-500`) | Body / description text |

**Rules:**
- Cards must use white background with a silver (`slate-200`) border — never a colored background.
- Primary action buttons always use the blue (`blue-800` / `blue-900`) palette.
- Sidebar active items use `blue-50` background with `blue-700` text.
- Avoid warm colors (red/orange/yellow) except for destructive actions and status indicators.

---

## How to Use
- **Frontend dev:** implement all `[FE]` tagged issues.
- **Backend dev:** implement all `[BE]` tagged issues.
- **Both:** issues tagged `[FE+BE]` require coordination.
- Update status as work progresses: `[ ]` → `[/]` (in-progress) → `[x]` (done) → `[r]` (in review).

---

## KOR-117–121: User Profile & Department Routing
> Branch: `feat/UserProfile`
> Deferred from KOR-53 — GET /me call, real user state, department-based navigation.

| # | Tag | Task | Status |
|---|-----|------|--------|
| 117 | [FE] | `GET /me` — call after login/signup; populate AuthContext with real profile | `[ ]` |
| 118 | [FE] | AuthContext — replace null stubs with real `user`, `hasDepartment`, `hasRole`, `isManager`, `departmentName` | `[ ]` |
| 119 | [FE] | `DepartmentRedirect` — wire back into `/app` index route; Sales → `/app/sales`, Tech Office → `/app/tech`, null → `/pending` | `[ ]` |
| 120 | [FE] | `ProtectedRoute` — restore department null guard + role/section guards (removed in KOR-53) | `[ ]` |
| 121 | [FE] | Topbar — display `full_name`, department badge, `isManager` badge from AuthContext | `[ ]` |

---

## KOR-53: Auth Foundation
> Branch: `feat/Auth-KOR-53` — ✅ Merged to main

| # | Tag | Task | Status |
|---|-----|------|--------|
| 53-1 | [FE] | Integrate `@supabase/supabase-js`, create singleton client | `[x]` |
| 53-2 | [FE] | `AuthContext` — expose `session`, `user`, `signIn`, `signUp`, `signOut` | `[r]` |
| 53-3 | [FE] | `signOut` must call `supabase.auth.signOut()` AND clear `localStorage` JWT keys | `[r]` |
| 53-4 | [FE] | Login page — email/password `signInWithPassword` | `[r]` |
| 53-5 | [FE] | Signup page — email/password/name `signUp` | `[r]` |
| 53-6 | [FE] | `ProtectedRoute` — redirect to `/login` if no session | `[x]` |
| 53-7 | [FE] | `RoleGuard` — redirect to department home if wrong role | `[x]` |
| 53-8 | [FE] | `api-client.ts` — attach `Authorization: Bearer <JWT>` on every request | `[x]` |
| 53-9 | [BE] | Supabase JWT middleware — validate `Authorization: Bearer` using Supabase JWKS | `[ ]` |
| 53-10 | [BE] | `GET /me` — return `UserProfile` (id, email, name, department, roles) from DB | `[ ]` |
| 53-11 | [FE+BE] | `AuthContext.fetchUserProfile` calls `GET /me`; falls back to stub if backend unavailable | `[x]` |

---

## KOR-54: App Layout
> Branch: `feat/app-layout-KOR-54`

| # | Tag | Task | Status |
|---|-----|------|--------|
| 54-1 | [FE] | `AppLayout` — wraps `Sidebar` + `Topbar` + `<Outlet>` | `[x]` |
| 54-2 | [FE] | `AppSidebar` — role-based nav items (Sales / Tech / Manager) | `[x]` |
| 54-3 | [FE] | Sidebar collapse support (icon mode) | `[x]` |
| 54-4 | [FE] | `Topbar` — user name, department badge, manager badge, logout button | `[x]` |
| 54-5 | [FE] | Mobile responsiveness for sidebar | `[ ]` |

---

## KOR-55: Opportunity Intake — PDF Extraction (Path A)
> Branch: `feat/opp-intake-pdf-KOR-55`

| # | Tag | Task | Status |
|---|-----|------|--------|
| 55-1 | [FE] | Drag-and-drop PDF upload component | `[ ]` |
| 55-2 | [FE] | Call `POST /opportunities/extract` with FormData | `[ ]` |
| 55-3 | [FE] | Extraction status states: idle / uploading / extracting / done / failed | `[ ]` |
| 55-4 | [FE] | Data review form — display extracted fields with confidence indicators | `[ ]` |
| 55-5 | [FE] | "Confirm & Create" action — call `POST /opportunities` with reviewed data | `[ ]` |
| 55-6 | [BE] | `POST /opportunities/extract` — accept PDF, trigger RPA/LLM extraction | `[ ]` |
| 55-7 | [BE] | Return extracted fields + confidence scores JSON | `[ ]` |
| 55-8 | [BE] | `POST /opportunities` — create record in Postgres, set status `draft` | `[ ]` |

---

## KOR-56: Opportunity Intake — Manual Creation (Path B)
> Branch: `feat/opp-intake-manual-KOR-56`

| # | Tag | Task | Status |
|---|-----|------|--------|
| 56-1 | [FE] | Multi-step or tabbed `CreateOpportunity` form | `[ ]` |
| 56-2 | [FE] | Zod schema for full opportunity (client, scope, value, product type, etc.) | `[ ]` |
| 56-3 | [FE] | Dynamic product fields: Chiller / Pump / Generator conditional sections | `[ ]` |
| 56-4 | [FE] | Submit calls `POST /opportunities` | `[ ]` |
| 56-5 | [BE] | `POST /opportunities` validation with DRF serializer | `[ ]` |
| 56-6 | [BE] | Enforce Sales-role requirement via JWT middleware | `[ ]` |

---

## KOR-57: Dashboard & Reporting
> Branch: `feat/dashboard-KOR-57`

| # | Tag | Task | Status |
|---|-----|------|--------|
| 57-1 | [FE] | Manager KPI cards (total opportunities, win rate, pipeline value) | `[ ]` |
| 57-2 | [FE] | Charts using Recharts / shadcn chart | `[ ]` |
| 57-3 | [FE] | Export to Excel button | `[ ]` |
| 57-4 | [BE] | `GET /analytics/summary` — aggregate opportunity stats per manager | `[ ]` |
| 57-5 | [BE] | `GET /analytics/export` — return Excel-formatted data | `[ ]` |

---

## KOR-58: Security & Realtime
> Branch: `feat/security-realtime-KOR-58`

| # | Tag | Task | Status |
|---|-----|------|--------|
| 58-1 | [FE] | Handle 403 responses from backend (RLS rejection) — show proper error | `[ ]` |
| 58-2 | [FE] | Supabase Realtime subscription on opportunity `status` column | `[ ]` |
| 58-3 | [FE] | Update UI when RPA processing completes (status: `processing` → `ready`) | `[ ]` |
| 58-4 | [BE] | Enforce Supabase RLS policies on all tables | `[ ]` |
| 58-5 | [BE] | Return `403` with structured error when RLS rejects a request | `[ ]` |
