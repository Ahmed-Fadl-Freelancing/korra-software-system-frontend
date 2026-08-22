# 006 — Remove unused Supabase dependency, secure exposed Linear key, add typecheck

## Goal
A cluster of small, independent hygiene fixes found during a full code read (2026-08-21). No
cross-repo dependency, no ordering constraint against any other frontend task — pick up whenever
convenient.

## Items

### 1. Remove the unused `@supabase/supabase-js` dependency
`package.json:44` still lists `"@supabase/supabase-js": "^2.99.1"` as a runtime dependency, despite
this repo's own hard rule ("NO SUPABASE IN FRONTEND — EVER", `CLAUDE.md`) forbidding it. `src/lib/
supabase.ts` is an explicitly-deprecated stub file (header comment: "DEPRECATED — do NOT import this
file", empty export) and grep confirms it's not imported anywhere else in `src/`. Remove the package
from `package.json` (and run `npm install`/`bun install` to update the lockfile), delete
`src/lib/supabase.ts`, and confirm the build still succeeds afterward.

### 2. `VITE_LINEAR_API_KEY` is exposed in the shipped browser bundle
`src/lib/linear-client.ts:3` reads `import.meta.env.VITE_LINEAR_API_KEY` and uses it directly for
browser-side GraphQL calls to Linear. Vite inlines every `VITE_`-prefixed env var into the built JS
bundle at build time — this key is extractable by anyone who opens devtools on the deployed app.
Decide on a fix: either (a) proxy Linear API calls through the Django backend (which already has its
own `LINEAR_API_KEY` env var and an unused `linear_service.py` GraphQL client sitting in the backend
repo — see backend task 006 item 5, which separately flags that file as dead code; wiring this up
could resolve both issues at once, worth coordinating), or (b) if direct-from-browser Linear calls are
an intentional, accepted tradeoff (e.g. a low-privilege API key scoped narrowly), document that
decision explicitly rather than leaving it as an apparent oversight. Don't silently leave this as-is
without at least a decision being made and recorded.

### 3. Add a `typecheck` script
`package.json`'s `scripts` has `dev`/`build`/`lint`/`test`/`test:watch` but no `tsc --noEmit`
equivalent. Add one (`"typecheck": "tsc --noEmit -p tsconfig.app.json"` or similar). This matters
concretely: frontend task 002 catalogs real type mismatches (`stub-data.ts` and most opportunity
pages reference fields that don't exist on the canonical `Project` type) that ESLint's current config
wouldn't catch (`@typescript-eslint/no-unused-vars` is explicitly off, and ESLint doesn't do full
structural type-checking the way `tsc` does) — those went unnoticed because nothing runs `tsc`
anywhere in this repo's tooling today.

### 4. Package manager inconsistency
Both `bun.lockb`/`bun.lock` and `package-lock.json` are committed simultaneously. Pick one (check
with the human if there's a preference; `bun.lock` being the newer of the two Bun lockfiles present
suggests Bun may be the intended one) and remove the other, so future installs don't silently drift
between two different resolved dependency trees depending on which tool a contributor happens to run.

## Acceptance criteria
- `@supabase/supabase-js` is gone from `package.json` and `node_modules`; `src/lib/supabase.ts` is
  deleted; `npm run build` still succeeds.
- The `VITE_LINEAR_API_KEY` exposure has an explicit resolution — either backend-proxied, or a
  documented accepted-risk decision (e.g. a comment in `.env.example` and/or a note in
  `korra-project/PLAN.md`).
- `npm run typecheck` (or whatever it's named) exists and running it against the current codebase is
  informative (it's fine if it still reports pre-existing errors this task doesn't fix — just confirm
  it runs and reports something real).
- Only one package-manager lockfile remains committed.

## Cross-repo dependency
Item 2's backend-proxy option would depend on backend task 006 (or a fresh small backend task) wiring
up the currently-dead `linear` Django app — not a hard blocker, since the accepted-risk-documentation
option requires no backend change at all.
