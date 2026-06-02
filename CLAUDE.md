# CLAUDE.md — Korra Frontend

> Claude Code reads this file automatically at session start.
> Copilot reads `.github/copilot-instructions.md`.

## Repo
`korra-software-system-frontend` — React 18 + Vite + TypeScript + Tailwind + shadcn/ui

## Counterpart
`Korra-Software-System-Backend` — Django + DRF + Supabase PostgreSQL.
**Backend PROGRESS.md lives in that repo.** Do not assume backend tasks are tracked here.

## Start of every session — mandatory steps
1. Read `PROGRESS.md` — identify the **Active** milestone and current branch.
2. Read the task list under the Active milestone — this is the source of truth.
3. Implement tasks one by one using the workflow below.

## Per-Task Workflow (execute for each task)

**For each task (e.g., M2-1, M2-2, ...):**

1. **Create Linear Issue** (via MCP Linear API)
   - Title: Task name from PROGRESS.md (e.g., "Integrate @supabase/supabase-js")
   - Description: Include acceptance criteria from PROGRESS.md
   - Link to Epic if exists
   - Get the Linear issue ID (e.g., KORR-123)

2. **Create Feature Branch**
   - Branch name: `feat/ISSUE-ID-short-desc` (e.g., `feat/KORR-123-supabase-integration`)
   - Base: `main` (or active milestone branch if different)
   - Command: `git checkout -b feat/ISSUE-ID-desc`

3. **Implement the Task**
   - Write all code following conventions in this file
   - Test locally (run dev server, verify no errors)
   - Follow TypeScript strict mode, use existing patterns

4. **Commit with Conventional Commits**
   - Format: `<type>(scope): description`
   - Types: feat, fix, docs, style, refactor, test, chore
   - Example: `feat(auth): integrate supabase client`
   - Command: `git add . && git commit -m "..."`

5. **Push and Create PR**
   - Push: `git push origin feat/ISSUE-ID-desc`
   - Create PR: `gh pr create --draft --title "feat(scope): description" --body "Closes ISSUE-ID\n\n[Description]\n\nAcceptance Criteria:\n- [ ] ..." --base main`
   - PR is created as DRAFT (waits for user approval)

6. **Update PROGRESS.md**
   - Mark task as `[x]` done
   - Add comment: `<!-- PR: #123, Linear: ISSUE-ID, done: 2026-06-02 -->`
   - Commit: `docs(progress): mark M2-X complete`

7. **Notify User and Wait**
   - Message: "✅ PR #123 ready for review: [link to PR]"
   - Wait for user to review, approve, and tell you to merge
   - After user says "merge", run: `gh pr merge <PR-number> --squash --delete-branch`

8. **Move to Next Task**
   - Return to step 1 with the next task from PROGRESS.md

## Source of Truth
- **Tasks**: `PROGRESS.md` under the Active milestone section
- **Architecture rules**: This file (CLAUDE.md)
- **Database schema**: See `.github/copilot-instructions.md` for enums and table structure

## Architecture constraints (never violate)
- Django is **stateless**. It never issues sessions or tokens. Auth = Supabase JWT only.
- All requests to Django MUST go through `src/lib/api-client.ts` (interceptor attaches JWT).
- User authorization: `user_profiles` (FK to `departments`) + many-to-many `user_roles` → `roles`. Never use JWT claims.
- PDFs are uploaded to `POST /api/documents/upload/` and processed **only** in Django.
- Extraction status values: `success` | `partial` | `failed` — handle all three states.

## Database enums (exact string values)
`document_type`: offer | submittal | rfq  
`project_status`: won | lost | technicalApproval | onHold | withDifferentContractor | tenderingPhase | cancelled | finalNegotiation  
`project_application`: Industrial | Commercial | Health | Residential  
`project_scope`: Supply | SupplyInstallation | Maintenance | Retrofit | Other

## Code conventions
| What | Convention |
|------|-----------|
| Components | `PascalCase.tsx` in `src/components/` |
| Pages | `PascalCase.tsx` in `src/pages/` |
| Hooks | `use-kebab-case.ts` in `src/hooks/` |
| API calls | `src/lib/api-client.ts` only — no raw fetch/axios in components |
| UI | `src/components/ui/` (shadcn) — no new UI libs without asking |
| State | React Context for global, useState/useReducer locally. No Redux. |
| Styling | Tailwind only — no inline styles, no CSS modules |

## Hard "never do" list
- Never bypass `ProtectedRoute` or `RoleGuard`
- Never hardcode user IDs, API keys, or secrets
- Never process PDFs on the frontend
- Never install duplicate UI libraries
- Never assume Django sessions exist

## Stack
React 18, TypeScript 5, Vite 5, @supabase/supabase-js, Tailwind 3, shadcn/ui,
react-router-dom v6, react-hook-form, zod
