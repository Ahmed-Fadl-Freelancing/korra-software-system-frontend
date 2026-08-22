> **Status: ✅ Done** (2026-08-22, on `claude/korra-project-setup-sumr8a`) — `CreateOpportunity.tsx`
> rebuilt with real `Select` dropdowns (application/scope/product family) and inputs, wired to
> `POST /opportunities/manual` (backend task 003), and now genuinely uploads files to Supabase
> Storage + registers them via `POST /documents/` instead of the old silent-stub-on-failure
> fallback. Contractor/owner/consultant are free-text inputs (get-or-created by name server-side),
> not a lookup/autocomplete UI — a deliberate scope cut per the user's explicit request to swap
> real PDF extraction for plain form fields "to test the flow and data integration," not a missed
> requirement. Also fixed two pre-existing contract bugs found while wiring this up:
> `SignedUploadUrl`'s type didn't match what the backend actually returns (`{signed_url, token,
> path}`, not `{signed_url, document_id}`), and `apiClient.uploadToSignedUrl` sent a raw binary PUT
> body where Supabase Storage's signed-upload endpoint expects multipart form-data under a `file`
> field (confirmed against the installed `storage3` Python client's source, since neither could be
> verified live — see below).
>
> Not live-verified end-to-end from within the sandbox that built this (outbound network to
> `*.supabase.co` is blocked there) — typecheck and production build both pass with no new errors
> beyond the pre-existing ones task 002 already owns. **You'll need to actually run this locally
> against real Supabase to confirm the physical upload works** — the multipart-vs-binary fix above
> is evidence-based (real client library source) but unverified against the live API from here.

# 004 — Rebuild manual opportunity intake against the real schema (Path B)

## Goal
`CreateOpportunity.tsx` exists and technically works end-to-end today (form → `POST /opportunities` →
file upload → Linear issue creation), but its form fields don't match what the database actually
requires. It collects `project_name`, `email_body`, `contractor`, `owner`, `consultant` as free-text
strings (`CreateOpportunity.tsx:19-25`). The real `projects` table
(`DB data/schema.sql:77-104` in the backend repo) requires `name` (not `project_name`),
`contractor_id`/`owner_id`/`consultant_id` as UUID foreign keys to lookup tables — not free text —
plus `application`, `scope`, and `product_id`, all non-nullable, none of which this form collects at
all. There's no `email_body` column anywhere in the schema. ISSUES.md's KOR-56 (Zod schema, dynamic
product-family fields for Chiller/Pump/Generator) is entirely unbuilt despite `zod` already being an
installed dependency.

## Relevant files
- `src/pages/CreateOpportunity.tsx` — the file to rebuild.
- `src/types/index.ts` — canonical `Project` shape to conform to (same type frontend task 002 aligns
  every other page to — do this task after 002, or at minimum use the post-002 type shape, not the
  pre-002 one).
- `zod` (`package.json` dependency, currently unused anywhere in the codebase — this is the first real
  use of it) + `react-hook-form`/`@hookform/resolvers` (also installed, also currently unused — every
  existing form in this repo uses raw `useState`; this task can be the first to actually use the
  installed form-handling stack, or you can stick with `useState` if that's simpler for a form this
  size — your call, but note `ISSUES.md` KOR-56-2 explicitly calls for a Zod schema, so at least that
  part should land).

## What to build
- Real fields matching what `POST /opportunities/manual` will require (backend task 003) — name,
  application (enum select), scope (enum select), product family + dynamic fields depending on family
  (Chiller/Pump/Generator — `ISSUES.md` KOR-56-2's "dynamic product fields" requirement; check what
  field set the backend's `Product`/family-specific tables actually expect once task 003 defines them,
  don't invent field names speculatively).
- Contractor/owner/consultant as selectable references to existing records, not free text — this
  likely needs a lookup/autocomplete against `contractors`/`owners`/`consultants` (no existing endpoint
  for listing these exists yet either; check with backend task 003's author or file a small follow-up
  endpoint request if one wasn't included — a simple `GET` list endpoint for each lookup table is a
  small addition, flag it rather than working around its absence with more free text).
- A Zod schema validating the form shape before submit, giving real inline error messages instead of
  relying entirely on backend 400s.
- Wire to real `POST /opportunities/manual` (not the current plain `POST /opportunities`, which per
  `PROJECT_FLOW.md §4` is Path A's endpoint, not Path B's).

## Acceptance criteria
- Every field the DB requires as non-nullable is collected by the form (no more silent 400s on
  submit because the payload doesn't include `application`/`scope`/`product_id`).
- Contractor/owner/consultant are real references (by id), not free-text strings passed as if they
  were names.
- Zod validation gives inline errors for missing/invalid required fields before hitting the network.
- Successful submit creates a real opportunity via `POST /opportunities/manual` and navigates to its
  detail page, which (after frontend task 002) correctly renders the object shape returned.
- Remove the `console.warn("Django POST /opportunities unavailable, using stub ID")` client-side-fake-
  ID fallback (`CreateOpportunity.tsx:41-43`) and the silent upload-stub fallback
  (`CreateOpportunity.tsx:60`) — once the real backend endpoint exists (task 003), a failed create
  should show a real error to the user, not silently pretend to succeed with a fake ID.

## Cross-repo dependency
Hard blocker: depends on backend task 003 (`POST /opportunities/manual` must exist for real, and the
lookup tables for contractor/owner/consultant need at least a list endpoint — confirm this exists or
file it as a small addition to task 003 before starting the UI work that depends on it).
