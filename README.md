# Korra Software System — Frontend

React/TypeScript client for **Korra**, an internal sales/tech-office opportunity-tracking
system. It gives Sales Engineers, Tech Office Engineers, and Managers role-scoped
dashboards for tracking opportunities from tendering through to won/lost, along with
document handling and a task inbox.

Companion repo: [`Korra-Software-System-Backend`](https://github.com/Ahmed-Fadl-Freelancing/Korra-Software-System-Backend) (Django REST API).

## Stack

Vite · TypeScript · React 18 · React Router · shadcn/ui (Radix) · Tailwind CSS · Vitest + Playwright

## Architecture

- **Auth is JWT-based against the backend, not Supabase directly** — the frontend
  never imports `@supabase/supabase-js` or talks to Supabase itself; all data flows
  through the Django API (`src/lib/api-client.ts`).
- Route access is gated by `ProtectedRoute` / `RoleGuard`, matching the department
  and role model defined in the backend (`Sales`, `Tech Office`, `manager`, `admin`).
- `AuthContext` hydrates the current user/session; `useLinear` integrates with Linear
  for issue-linked views.

## Key Routes

| Path | Page |
|---|---|
| `/login`, `/signup` | Auth |
| `/app/sales` | Sales dashboard |
| `/app/tech` | Tech office dashboard |
| `/app/inbox` | Task inbox |
| `/app/opportunities`, `/opportunities/:id`, `/opportunities/new` | Opportunity list / detail / create |
| `/app/engineering` | Engineering area (protected) |
| `/app/offers`, `/outcomes`, `/shortlists`, `/pricing` | Placeholder pages for upcoming features |

## Design System

Brand palette is blue/white/silver — see `ISSUES.md` for the full token table
(primary blue `#1E3A8A`, surfaces white/`slate-50`, borders `slate-300`). Cards use
white backgrounds with silver borders; warm colors are reserved for destructive/status
states.

## Getting Started

```bash
npm i
cp .env.example .env   # point VITE_API_URL at the backend
npm run dev
```

```bash
npm run build      # production build
npm run lint        # eslint
npm run test         # vitest
```

## Project Docs

- `PROJECT_FLOW.md` — canonical schema/enum/business-logic reference shared with the backend
- `PROGRESS.md` — cross-repo milestone tracker (kept in sync with the backend repo)
- `ISSUES.md` — unified issue tracker and design-system tokens
- Work is tracked in Linear (team **Korra**, key `KOR`); one PR per feature, reviewed by a human before merge.

## Status

Actively in development. See `PROGRESS.md` for the current milestone and what's next.
