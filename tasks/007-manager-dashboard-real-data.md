# 007 — Manager dashboard: replace hardcoded fake data with real API data

## Goal
`src/components/dashboard/ManagerWidgets.tsx` is 100% hardcoded fake data today — `teamWorkload`
(made-up names: Alice/Bob/Charlie/Diana, with made-up task counts) and `bottlenecks` (made-up
opportunity names like "Highway Bridge Renovation" with made-up day counts) — no API call at all, not
even a stub-fallback pattern like the rest of the app uses. It currently never renders in practice
because `isManager` is permanently hardcoded `false` in `AuthContext.tsx` — once frontend task 001
wires up real auth state, manager users will actually see this component for the first time, and it
needs to show real data by then.

## Relevant files
- `src/components/dashboard/ManagerWidgets.tsx` — the component to rebuild.
- `src/pages/SalesDashboard.tsx:68`, `src/pages/TechDashboard.tsx:62` — where it's mounted (gated on
  `isManager`).
- `recharts` (`package.json` dependency, currently installed but unused anywhere in the codebase) —
  `ISSUES.md` KOR-57-2 calls for Recharts/shadcn charts for the KPI visuals; this is a reasonable
  place to actually use it instead of the current static divs standing in for "workload bars."

## What to build
- Replace the hardcoded `teamWorkload`/`bottlenecks` arrays with a real data fetch against
  `GET /analytics/summary` (backend task 007).
- Use React Query for the fetch, matching this repo's established server-state convention.
- Render actual charts (recharts) for whatever the endpoint's response shape naturally visualizes
  (workload-by-engineer as a bar chart, bottleneck opportunities as a sorted list/table — match
  what backend task 007 actually returns rather than assuming the current fake shape is what you'll
  get back).
- Keep a sensible loading/empty/error state — this is exactly the kind of widget that will be shown
  to managers first, so a broken or blank state here is high-visibility.

## Acceptance criteria
- No hardcoded fake names/numbers remain in `ManagerWidgets.tsx`.
- The component renders real data end-to-end once a manager-role user with real opportunities/tasks
  in the system loads their dashboard.
- Loading and error states are handled (don't leave a manager staring at a blank widget with no
  explanation on a slow or failed fetch).

## Cross-repo dependency
Hard blocker: depends on backend task 007 (`GET /analytics/summary` must exist for real). Also
practically depends on frontend task 001 (manager role state needs to be real, not hardcoded false,
for this component to ever actually render during normal use/testing) — do task 001 first if it
hasn't already landed, otherwise you'll have no way to see this component render at all short of
temporarily hacking `isManager` to `true` for testing.
