# 003 — PDF Extraction intake UI (Path A)

## Goal
KOR-55 in `ISSUES.md` — there is currently **zero frontend code** for this flow. No drag-and-drop-
with-confidence-review component, no polling logic, no extraction-status state machine
(idle/uploading/extracting/done/failed). `CreateOpportunity.tsx` today only implements the manual
form (Path B) plus a bare file-upload bundled into the same submit — that's not this flow, it's Path B
with attachments.

## Before starting — resolve the endpoint naming conflict
Three different names exist across the two repos for the same trigger endpoint:
`POST /pdf-extraction/` (this repo's `PROJECT_FLOW.md §4.2`), `POST /pdf-extraction/jobs/` (actual
backend code), `POST /opportunities/extract` (this repo's `ISSUES.md` KOR-55-2). **Check backend task
001's outcome first** — it settles on one canonical name and updates the backend's docs accordingly.
Update this repo's `PROJECT_FLOW.md`/`ISSUES.md` to match before writing any code against a specific
path, so you're not building against a name that's about to be corrected out from under you.

## Backend contract to build against (once backend task 002 has landed — see dependency below)
Per `PROJECT_FLOW.md §4.2` (Path A) and the backend's actual implementation
(`pdf_extraction/views.py`):
1. `POST /documents/signed-upload-url` (already implemented, working today) → get a signed URL.
2. `PUT` the file to that signed URL (use `apiClient.uploadToSignedUrl`, already implemented in
   `src/lib/api-client.ts:135-142` — reuse it, don't reinvent).
3. `POST <the canonical pdf-extraction endpoint>` with the uploaded file's bucket/path → get back a
   job id.
4. Poll `GET <endpoint>/<job_id>/` until `status` is `done` or `failed`. The response shape when
   done: `{status: "success"|"partial"|"failed", fields: {...}, confidence: {...}}` per `CLAUDE.md`'s
   documented extraction response shape (backend repo).
5. Show the user the extracted fields with confidence indicators for review/correction before final
   submit.
6. On confirm, `POST /opportunities` (not `/opportunities/manual` — that's Path B) with the
   reviewed/corrected fields, referencing the extraction job.

## What to build
- A new page or a mode within `CreateOpportunity.tsx` (your call which reads better — could be a
  `/app/opportunities/new/extract` route, or a tab/toggle on the existing create page) implementing
  the upload → poll → review → submit flow above.
- Polling: use React Query's built-in polling (`refetchInterval`) against the job-status endpoint
  rather than hand-rolling a `setInterval` — matches this repo's existing "React Query for server
  state" convention (`korra-project/CLAUDE.md`).
- A clear UI state machine: idle → uploading → extracting (with visible progress/spinner) → review
  (editable fields, confidence shown per-field, e.g. a warning badge on low-confidence fields) →
  submitting → done, with a failure state at any step that lets the user retry or fall back to manual
  entry (Path B) instead.
- Field types in the review step should match the canonical `Project` type
  (`src/types/index.ts` — after frontend task 002's cleanup) — don't invent a parallel shape.

## Acceptance criteria
- A user can upload a PDF, see extraction progress, review extracted fields with confidence
  indicators, correct any field, and submit to create a real opportunity — full path A working
  end-to-end against a real (not stubbed) backend.
- Low-confidence fields are visually distinguished from high-confidence ones (exact threshold/UI
  treatment is your call — just don't present all fields as equally trustworthy).
- A failed extraction gives the user a clear path forward (retry, or fall through to the manual form)
  rather than a dead end.
- No hardcoded/stub data — this task only makes sense against the real backend endpoints.

## Cross-repo dependency
Hard blocker: depends on backend task 002 (`fetch_pdf`/`parse_pdf` actually implemented — today they
unconditionally fail, so there's nothing real to poll against) and backend task 001 (endpoint naming
settled). Don't start UI work assuming the backend pipeline works until task 002 is confirmed done —
check `korra-project/PLAN.md` or the backend repo's task file status first.
