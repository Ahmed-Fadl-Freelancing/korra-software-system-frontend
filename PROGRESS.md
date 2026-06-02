# Korra Frontend — Progress Checklist

> **Scope:** `korra-software-system-frontend` (React/Vite)
> Counterpart: See `Korra-Software-System-Backend/PROGRESS.md` for backend tasks.
> Last updated: auto-updated by AI assistant on each session.

## 🚀 Current Work

**Active Branch:** `main` (no milestone in progress)  
**Active Milestone:** Milestone 2 — Frontend Foundation & Auth  
**Linear Epic:** (will be created when milestone starts)  
**GitHub PR:** (will be created when implementation begins)  

---

## Milestone 2 — Frontend Foundation & Auth ✦ Active

- [x] **M2-1** Initialize React app with Vite + TypeScript <!-- Linear: KOR-5, done: 2025-05-22 -->
- [ ] **M2-2** Integrate `@supabase/supabase-js`; expose `supabase` client via `src/lib/supabase.ts` <!-- Linear: KOR-6 -->
- [ ] **M2-3** Create `AuthContext` — manages session, exposes `user`, `profile`, `signIn`, `signOut` <!-- Linear: KOR-7 -->
- [ ] **M2-4** Axios/Fetch interceptor: auto-attach Supabase JWT to every Django API request <!-- Linear: KOR-8 -->
- [ ] **M2-5** Build `Login` page UI (email + password, Supabase auth) <!-- Linear: KOR-9 -->
- [ ] **M2-6** Implement `ProtectedRoute` — redirect unauthenticated users to `/login` <!-- Linear: KOR-10 -->
- [ ] **M2-7** Implement `RoleGuard` — restrict pages by `profile.department` / `profile.role` <!-- Linear: KOR-11 -->
- [ ] **M2-8** Role-based routing shell: Sales Engineer route, Technical route, Manager route <!-- Linear: KOR-12 -->
- [ ] **M2-9** Build `AppLayout` (sidebar + topbar) with active-route highlighting <!-- Linear: KOR-13 -->
- [ ] **M2-10** Seed stub data for local dev (no backend required yet) <!-- Linear: KOR-14 -->

---

## Milestone 3 — Document Ingestion UI ✦ Planned

- [ ] **M3-1** Build drag-and-drop PDF upload component (`src/components/FileUpload.tsx`)
- [ ] **M3-2** Call `POST /api/documents/upload/` and handle response states (loading, success, partial, failed)
- [ ] **M3-3** Build "Data Validation UI" — form pre-filled from backend JSON extraction
- [ ] **M3-4** If extraction status is `partial` or `failed`, enable all fields for manual correction
- [ ] **M3-5** On submit, call opportunity creation endpoint with validated payload
- [ ] **M3-6** Show extraction confidence indicators per field (green/yellow/red)

---

## Milestone 4 — Database Security UI (Supabase RLS — read-only on frontend)

- [ ] **M4-1** Verify frontend can only read rows that pass RLS (integration test with real Supabase)
- [ ] **M4-2** Handle 403/RLS-rejected responses gracefully in the UI

---

## Milestone 5 — UiPath RPA Integration UI ✦ TODO

- [ ] **M5-1** Add `Processing` status state to opportunity cards
- [ ] **M5-2** Poll or subscribe (Supabase realtime) for RPA completion events
- [ ] **M5-3** Display RPA error state with retry option

---

## Milestone 6 — Data Warehouse Views ✦ TODO

- [ ] **M6-1** Manager dashboard: charts/KPIs sourced from DW sync endpoints
- [ ] **M6-2** Export-to-Excel feature for manager reports

---

## Completed

<!-- Move items here with [x] and a completion date when done -->
