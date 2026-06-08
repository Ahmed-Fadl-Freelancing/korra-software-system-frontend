# CLAUDE.md — Korra Frontend (Claude reads this)

> **Body is kept IDENTICAL to `.github/copilot-instructions.md`.**
> When you change AI rules, update **both** files so Claude and Copilot share the same rulebook.
> Cross-repo roadmap lives in `PROGRESS.md` (must be identical in both repos).

---

## ⛔ HARD RULES — READ FIRST

1. **NEVER** run `gh pr merge` or any merge/auto-merge command.
2. **NEVER** push directly to `main`. All work goes through feature branches.
3. One PR **per feature milestone** — not per issue. Create the PR, then **STOP** and wait for the human to merge.
4. Always work on the correct feature branch. Check `PROGRESS.md` → **▶ NEXT UP** before coding.

---

## 🚨 NO SUPABASE IN FRONTEND — EVER

The frontend does **NOT** import `@supabase/supabase-js`, does **NOT** create a Supabase client, and does **NOT** call any Supabase SDK methods.

**The only service the frontend talks to is the Django backend:**
```
VITE_DJANGO_API_BASE_URL=http://localhost:8000
```

All auth flows go through:
- `POST /auth/login`    → `{email, password}` → `200 {access_token, refresh_token, ...}`
- `POST /auth/signup`   → `{email, password, full_name}` → `201 {user, session?}`
- `POST /auth/refresh`  → `{refresh_token}` → `200 {access_token, ...}`
- `POST /auth/logout`   → `Authorization: Bearer <jwt>` → `204`

Tokens are stored **only** in `localStorage` under keys `korra_access_token` and `korra_refresh_token`, managed exclusively by `api-client.ts`.

---

## Session Start — Mandatory Checklist

1. Read `PROGRESS.md` → find **▶ NEXT UP**. If it is tagged `[BE]`, note it but work on the `[FE]` item.
2. Read `ISSUES.md` → read the **Brand Identity** section before touching any UI.
3. Check out or create the correct feature branch: `feat/<Name>` (PascalCase).
4. Implement issues one by one, commit after each: `feat(scope): description (KOR-XX)`.
5. When all issues in the milestone group are done: push → open ONE PR targeting `main` → **STOP**.
6. Update `PROGRESS.md` (flip status to `In Review`) and copy the file to the backend repo.

---

## Repos

| Repo | Stack |
|------|-------|
| **Frontend** (`korra-software-system-frontend`) | React 18 + Vite + TypeScript + Tailwind + Shadcn UI |
| **Backend** (`Korra-Software-System-Backend`) | Django 4.2 + DRF + Supabase PostgreSQL |
| **Linear** | Team **Korrra** (key `KOR`) — reference KOR id in every commit |

---

## Branch Naming

- New work: `feat/<Name>` in PascalCase — e.g. `feat/Auth`, `feat/OpportunityIntake`.
- Historical merged branches used `feature/<name>` — leave those as-is.

---

## Frontend Architecture

| Layer | Detail |
|-------|--------|
| Auth | Django proxy only. `AuthContext` calls backend `/auth/*`. Tokens in `localStorage`. |
| API | `api-client.ts` — reads `korra_access_token` from localStorage, attaches `Authorization: Bearer` to every protected Django request. Auto-refreshes on 401. |
| Routing | `ProtectedRoute` checks `isAuthenticated` from `AuthContext`. `RoleGuard` uses `/me` response — never JWT claims. |
| State | React Query for server state. React context for auth only. |
| UI | Shadcn UI components. **Blue + White + Silver palette.** See `ISSUES.md` → Brand Identity. |

---

## Design System (never deviate)

| Rule | Detail |
|------|--------|
| Primary color | Blue — `blue-800` / `blue-900` for buttons and active states |
| Card background | White (`bg-white`) with silver border (`border-slate-200`) |
| Page background | `bg-slate-50` |
| Muted text | `text-slate-500` |
| Destructive | `red-600` only for errors and delete actions |
| Sidebar active | `bg-blue-50 text-blue-700 font-medium` |

---

## Frontend Stack

React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Shadcn UI, React Router 6, React Query, Zod, Lucide React.

**Not in stack:** `@supabase/supabase-js` is not used on the frontend.

---

## Hard "Never Do" List

- **Never** import `@supabase/supabase-js` or `src/lib/supabase.ts` in any component or page.
- **Never** call any Supabase SDK method from the frontend.
- **Never** add `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` to `.env`.
- Never store the JWT in any key other than `korra_access_token` / `korra_refresh_token`.
- Never process PDFs on the frontend.
- Never hardcode any secret or credential.
- **Never merge a PR** — wait for the human reviewer.
