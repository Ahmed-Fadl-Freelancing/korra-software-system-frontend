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
| Auth | Supabase JWT. `AuthContext` exposes `signIn`, `signUp`, `signOut`. `signOut` calls `supabase.auth.signOut()` + clears `localStorage`. |
| API | `api-client.ts` — attaches `Authorization: Bearer <JWT>` to every Django request. Falls back to stub if backend unavailable. |
| Routing | `ProtectedRoute` (session guard) + `RoleGuard` (role guard). Never trust JWT claims for role — use `/me` response. |
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

React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Shadcn UI, React Router 6, React Query, Supabase JS, Zod, Lucide React.

---

## Hard "Never Do" List

- Never call Supabase APIs directly from pages — go through `AuthContext` or `apiClient`.
- Never store the JWT in a custom `localStorage` key — Supabase SDK manages it.
- Never process PDFs on the frontend.
- Never hardcode `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, or any secret.
- **Never merge a PR** — wait for the human reviewer.

## 🚨 IMPORTANT: NO DIRECT SUPABASE AUTH
The frontend must NEVER call `supabase.auth.signInWithPassword` or `supabase.auth.signUp` directly.
All authentication requests must go through the **Backend (Django proxy)** endpoints:
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/logout`
The `AuthContext` is responsible for calling these and syncing the returned tokens with the local Supabase client.
