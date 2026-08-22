# 001 — KOR-117–121: User Profile & Department Routing

## Goal
This is `PROGRESS.md`'s current "▶ NEXT UP" item, on branch `feat/UserProfile`. As of 2026-08-21 the
branch contains **only a docs commit** (`1f7abe0`, adds the KOR-117–121 table to `ISSUES.md` and
updates `PROGRESS.md`) — zero implementation work has actually landed despite the status saying
"🔧 In Progress". The backend side this depends on (`GET /me`) is fully implemented and merged to
`main` already — this is pure frontend work with no backend blocker.

## Relevant files
- `src/contexts/AuthContext.tsx` — the core of this task. Currently: no `GET /me` call exists at all
  (grep confirms it — a prior commit `7880ad0` explicitly *removed* it during KOR-53). The context's
  provided value hardcodes `user: null`, `isStubMode: false`, `hasDepartment: () => false`,
  `hasRole: () => false`, `isManager: false`, `departmentName: null` regardless of actual auth state
  (lines ~116-128) — every consumer of these is currently dead code by construction.
- `src/components/DepartmentRedirect.tsx` — already fully built, but **not imported or used anywhere**
  in `src/App.tsx`. The `/app` index route currently uses a static
  `<Navigate to="/app/sales" replace />` as a placeholder (`App.tsx:41`).
- `src/components/ProtectedRoute.tsx` — currently only checks `isAuthenticated`/`loading`; no route in
  `App.tsx` uses it for department or role scoping (any authenticated user can navigate directly to
  `/app/sales`, `/app/tech`, etc. today).
- `src/components/RoleGuard.tsx` — fully built, **zero usages anywhere** (grep-confirmed).
- `src/pages/PendingActivation.tsx` — fully built page, but **not registered in `src/App.tsx`'s
  routes at all**. Visiting `/pending` today 404s to the catch-all `NotFound` route.
- `src/components/layout/Topbar.tsx` — reads `user.department.name` unguarded for null
  (`Topbar.tsx:19`) and `user.name` (`Topbar.tsx:29`, but `UserProfile` has no `name` field, only
  `full_name` — this is a real bug waiting to fire the moment `user` becomes non-null).
- `src/components/layout/AppSidebar.tsx` — calls `hasDepartment("sales")`/`hasDepartment("tech_office")`
  with lowercase snake_case string literals (`AppSidebar.tsx:27-28,87`); the real `DepartmentName`
  union (`src/types/index.ts`) is `"Sales" | "Tech Office"` — these calls can never match a real
  backend response. Also `hasRole("engineer")` at `AppSidebar.tsx:47` — the real `RoleCode` union has
  no `"engineer"` value, the correct one is `"tech_engineer"`.

## What to build
1. Add a real `GET /me` call in `AuthContext` (via `apiClient.get`, matching the wrapper's existing
   pattern) — call it once on mount when a token is present, and again right after a successful
   `signIn`. Populate real `user` state from the response.
2. Compute `hasDepartment`, `hasRole`, `isManager`, `departmentName` from the real `user` state instead
   of hardcoded stubs. Note the exact `GET /me` response contract per `PROJECT_FLOW.md §2.4`:
   `{ user_id, employee_code, full_name, department: {id,name}|null, roles: [] }` — **no `email` or
   `job_title` fields**. `src/types/index.ts`'s `UserProfile` interface currently declares `email`,
   `job_title`, and `is_active` as if `/me` returns them — it doesn't. Get `email` from the decoded
   JWT (or wherever it's already available client-side) instead, and either drop `job_title`/
   `is_active` from the type or mark them optional/sourced-elsewhere — don't leave the type claiming
   `/me` populates fields it never will.
3. Wire `DepartmentRedirect` into the `/app` index route, replacing the static
   `<Navigate to="/app/sales" />` placeholder.
4. Register `/pending` in `App.tsx` pointing at the existing `PendingActivation` page.
5. Add department/role scoping to `/app/sales`, `/app/tech`, `/app/engineering` (and any other
   department-specific route) using `RoleGuard`/`ProtectedRoute` with real checks now that `hasDepartment`/
   `hasRole` work for real.
6. Fix the hardcoded string mismatches: `AppSidebar.tsx`'s `hasDepartment("sales")` →
   `hasDepartment("Sales")` (and `"tech_office"` → `"Tech Office"`), `hasRole("engineer")` →
   `hasRole("tech_engineer")` (both in `AppSidebar.tsx` and `TechDashboard.tsx:41`, same bug there).
7. Fix `Topbar.tsx`: `user.name` → `user.full_name`; guard `user.department?.name` (department can
   legitimately be `null` for a pending-activation user — that's exactly the case `/pending` exists
   for, so this null case is not an edge case, it's an expected state).

## Acceptance criteria
- Logging in populates real `user`/`department`/`roles` state from `GET /me`, verified by inspecting
  React DevTools or a console log, not just "the code compiles."
- A user with `department: null` from `/me` (freshly signed up, not yet assigned) lands on `/pending`,
  not on a crash or a department dashboard.
- `AppSidebar`/`Topbar`/`TechDashboard` no longer contain any hardcoded lowercase department/role
  string literal — everything imports and uses the exact `DepartmentName`/`RoleCode` union values.
- Navigating directly to `/app/tech` as a Sales-department user is blocked (redirected or denied),
  not silently allowed.
- `src/types/index.ts`'s `UserProfile` interface accurately reflects what `GET /me` actually returns.
- `PROGRESS.md`/`ISSUES.md` status for KOR-117–121 updated to reflect real completion once done
  (currently claims "In Progress" with a checkbox — `53-11` — that's already stale/inaccurate,
  correct that while you're in these files).

## Cross-repo dependency
None — `GET /me` is already fully implemented and merged on the backend. Pure frontend task.
