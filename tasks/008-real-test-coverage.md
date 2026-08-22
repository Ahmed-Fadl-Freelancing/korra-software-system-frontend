# 008 — Real test coverage

## Goal
Vitest is configured and wired to a working `npm run test` script, but the only test file that exists
is a trivial placeholder (`src/test/example.test.ts`: `expect(true).toBe(true)`). Playwright is also
configured at the project level (`playwright.config.ts`), but it wraps an external package
(`lovable-agent-playwright-config`) that isn't in `package.json`'s dependencies at all — it's not
runnable outside Lovable's own platform tooling. Net effect: there is no real automated test coverage
in this repo today.

## What to prioritize
Given how much of this repo's current behavior depends on client-side logic with real bugs already
found during code review (frontend tasks 001/002 both catalog concrete mismatches), start with the
areas most likely to regress silently:

1. **`src/lib/api-client.ts`** — the 401-retry-once-then-clear-tokens logic, the `getAccessToken`/
   `setTokens` literal-`"null"`/`"undefined"`-string guards, and the auth-path-skips-bearer-header
   logic are all exactly the kind of subtle state-machine code that's easy to break while touching
   something else later. Unit test with a mocked `fetch`.
2. **`src/contexts/AuthContext.tsx`** (post frontend-task-001 rewrite) — `hasDepartment`/`hasRole`/
   `isManager` derivation from a `GET /me`-shaped response, including the `department: null`
   (pending-activation) case.
3. **`src/components/ProtectedRoute.tsx` / `RoleGuard.tsx` / `DepartmentRedirect.tsx`** (once
   frontend task 001 wires them in for real) — the routing-guard logic is security-relevant (which
   department can see which dashboard) and currently has zero coverage.
4. Component tests (via `@testing-library/react`, already a devDependency) for the pages most prone
   to the type-mismatch bugs frontend task 002 fixes — a regression test that would have caught
   `opp.project_name` vs `opp.name` is more valuable here than broad shallow coverage elsewhere.

## Playwright decision
Decide whether to invest in making Playwright actually runnable outside Lovable's platform (would
need a real `@playwright/test` config not dependent on `lovable-agent-playwright-config`, though the
environment note in `korra-project/CLAUDE.md`/session setup confirms a pre-installed Chromium is
available at `/opt/pw-browsers/chromium` for exactly this kind of use), or accept that e2e coverage
lives elsewhere (manual QA, or deferred) and focus effort on unit/component tests instead. This is a
judgment call worth a line in the PR description either way, not a silent choice.

## Acceptance criteria
- Real assertions exist (not `expect(true).toBe(true)`) covering at minimum items 1–3 above.
- `npm run test` passes.
- A documented decision exists on the Playwright question (either a working minimal e2e config, or an
  explicit note that e2e is out of scope for now and why).

## Cross-repo dependency
None directly, but items 2–3 are much more meaningful to write *after* frontend task 001 lands (no
point writing detailed tests against the current hardcoded-stub `AuthContext` state — test the real
implementation once it exists).
