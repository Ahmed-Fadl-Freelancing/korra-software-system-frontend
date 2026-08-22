# 002 — Fix Opportunity/Project type mismatches across pages

## Goal
`src/types/index.ts`'s `Project`/`Opportunity` type was updated to match the real DB schema in commit
`7487345` ("align UserProfile and Project with DB schema, KOR-53") — but the pages/components that
*consume* opportunity data were never migrated to match. The result: `stub-data.ts` and essentially
every opportunity-related page currently reference fields that don't exist on the type they claim to
be typed as. This predates any new backend work (backend task 003) and should be fixed independently
— it's pure frontend technical debt, not something blocked on a new endpoint.

This repo has no `typecheck` script yet (frontend task 006 adds one) — these mismatches were traced
by hand from source, not caught by CI. Consider running `npx tsc --noEmit -p tsconfig.app.json`
manually before and after this task to confirm you've actually caught everything and haven't
introduced new errors.

## The canonical type (don't change this — conform everything else to it)
`src/types/index.ts:62-77`, `Project` (aliased as `Opportunity`):
```ts
interface Project {
  id: string; name: string;
  contractor: ProjectParty | null; consultant: ProjectParty | null; owner: ProjectParty | null;
  sales_engineer: ProjectUser; tech_engineer: ProjectUser | null;
  application: ProjectApplication; scope: ProjectScope; status: ProjectStatus;
  product: { id: string; family: ProductFamily; model_code: string } | null;
  extracted_data: Record<string, unknown>;
  created_at: string; updated_at: string;
}
```
`ProjectStatus` is the real 8-value enum: `tenderingPhase | technicalApproval | finalNegotiation |
won | lost | onHold | withDifferentContractor | cancelled`.

## Files with mismatched field access (fix each to use the canonical shape above)
- `src/lib/stub-data.ts:52-90` — the mock `Opportunity` objects use `project_name`, `email_body`,
  `contractor: string`, `owner: string`, `consultant: string`, `status: "in_review" | "draft"` (not a
  real enum value), and a `documents: {...}[]` field that doesn't exist on `Project` at all. Rewrite
  the mock data to match the real shape.
- `src/pages/SalesDashboard.tsx:124-127` — reads `opp.project_name`, `opp.contractor` as a plain
  string.
- `src/pages/TechDashboard.tsx:91-96` — same pattern, plus status-tab filters at lines 32,73-76
  comparing against `"in_review"`/`"draft"`, neither of which is in the real `ProjectStatus` enum —
  fix the tab logic to filter on real status values instead.
- `src/pages/OpportunitiesList.tsx:62,69,73,78` — `opp.project_name`, `opp.contractor`, `opp.owner`,
  `opp.documents.length`.
- `src/pages/OpportunityDetail.tsx:55,70,74,78,194,197,201` — `opp.project_name`, `opp.contractor`,
  `opp.owner`, `opp.consultant`, `opp.documents`.
- `src/pages/Engineering.tsx:49,55` — `opp.project_name`, `opp.documents.length`.
- `src/components/opportunity/Timeline.tsx:5-9` — the `stubTimeline` literal is typed `TimelineEvent[]`
  but uses fields `status`/`timestamp`/`note` instead of the real `TimelineEvent` shape
  (`from_status`, `to_status`, `changed_at`, `notes` — see `src/types/index.ts:113-119`). Also note
  `OpportunityDetail.tsx:228` calls `<Timeline />` with no `events` prop at all, so it always renders
  fake data regardless — once this fix lands, either pass real `events` from a real
  `project_status_history` fetch (may need to wait on a backend endpoint for that — check if one
  exists before building it) or leave the default-stub behavior in place but at least make the stub
  itself type-correct.

## Note on `contractor`/`owner`/`consultant` being objects, not strings
The canonical type has these as `ProjectParty | null` (an object, presumably `{id, name}` — check
`src/types/index.ts`'s `ProjectParty` definition for the exact shape), not plain strings. Every page
listed above currently renders them as if they were strings. Update the JSX to read `.name` (or
whatever the actual `ProjectParty` field is) off the object, with a null-check since the type is
nullable.

## Acceptance criteria
- `npx tsc --noEmit -p tsconfig.app.json` reports no errors related to `Opportunity`/`Project` field
  access in any of the files listed above (there may be unrelated pre-existing errors elsewhere —
  don't feel obligated to fix those in this task, just confirm you haven't left any *new* or
  *opportunity-shape-related* ones).
- `stub-data.ts`'s mock data uses real `ProjectStatus` values, not `"in_review"`/`"draft"`.
- No page reads `opp.project_name`, `opp.documents`, or treats `opp.contractor`/`owner`/`consultant`
  as a plain string.
- `Timeline.tsx`'s stub data matches the real `TimelineEvent` shape.
- Visually verify (`npm run dev`) that `OpportunitiesList`, `OpportunityDetail`, `SalesDashboard`,
  `TechDashboard`, `Engineering` still render sensibly against the (still-stubbed, until backend task
  003 lands) mock data after the field renames — this is a refactor, the pages should look the same,
  just be reading the right field names.

## Cross-repo dependency
None. Independent of backend work — this is fixing a pre-existing internal inconsistency between this
repo's own type declarations and its own page code.
