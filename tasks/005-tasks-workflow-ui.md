# 005 — Task creation/detail/status-update UI

## Goal
Today, `Inbox.tsx` and `SalesDashboard.tsx`'s "Urgent Tasks" widget render `Task` objects fetched from
`GET /tasks`, but there is no task-creation UI, no task-detail view, and no way to update a task's
status — read-only display only, and entirely dependent on `stub-data.ts`'s fake `stubTasks` today
since the real endpoint is still a backend stub.

## Relevant files
- `src/pages/Inbox.tsx`, `src/pages/SalesDashboard.tsx` — existing read-only consumers, both `.catch()`
  into `stubTasks` on failure (this fallback should stay as a network-failure safety net, but stop
  being the *only* code path once the real endpoint exists).
- `src/types/index.ts`'s `Task` interface — currently: `id, title, opportunity_name, status
  ("pending"|"in_progress"|"completed"|"blocked"), due_date, priority ("low"|"medium"|"high"|"urgent"),
  assigned_to`. **Confirm this still matches whatever schema backend task 004 actually lands on** — this
  type was invented by the frontend before any backend `workflow_tasks` table existed (there was no DB
  schema to check it against at type-definition time), so treat it as a draft to reconcile against the
  real schema, not settled truth. If backend task 004's schema differs, update this type to match — the
  backend's real DB schema wins.
- `src/components/TaskCard.tsx` — existing display component, check whether it needs updates for the
  new detail/edit affordances this task adds.

## What to build
- A task-detail view (new page, or a modal/drawer off `TaskCard` — your call) showing full task
  info.
- A status-update control (dropdown/buttons cycling through the real status enum) that calls
  `PATCH /tasks/{id}` and reflects the change immediately (optimistic update via React Query, with
  rollback on failure, is the idiomatic pattern here — matches the "React Query for server state"
  convention).
- A task-creation form/flow calling `POST /tasks` — check with backend task 004 what fields are
  actually required (assignee, due date, priority, linked opportunity at minimum, per the `Task`
  type's existing fields).
- Consider whether task creation should be reachable from an opportunity's detail page (create a
  follow-up task tied to that opportunity) in addition to (or instead of) a standalone task list —
  `opportunity_name`/`opportunity_id` being on every `Task` suggests tasks are meant to always be tied
  to an opportunity; if so, creating one from `OpportunityDetail.tsx` may be the more natural entry
  point than a bare standalone form.

## Acceptance criteria
- A user can view a task's full detail, change its status, and see the change persist (reload the
  page and confirm it stuck — not just an optimistic UI update that silently reverts on refresh).
- A user can create a new task against a real opportunity.
- `stubTasks` fallback in `Inbox.tsx`/`SalesDashboard.tsx` remains only as a network-failure
  degradation path, not the primary code path (i.e., confirm the real endpoint is actually being hit
  successfully in normal operation, not silently failing and always falling back).

## Cross-repo dependency
Hard blocker: depends on backend task 004 (schema design + `GET/POST /tasks`, `PATCH /tasks/{id}`
must exist for real — today `GET /tasks` is a stub returning an empty array, and no `workflow_tasks`
table exists in the DB at all yet).
