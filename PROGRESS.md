# Progress Matrix

## Milestone 1: Environment & Architecture (In-Progress)
- [ ] KOR-27: Project Scaffold (React + Vite + Tailwind)
- [ ] Documentation: Project Flow & Implementation Plan

## Milestone 2: Auth & Foundation (In Review)
- [r] KOR-53: [FEAT] Auth Foundation — Supabase, Registry, Login, Logout, Guards
  - [x] Integrate @supabase/supabase-js
  - [x] Implement AuthContext (signIn, signUp, signOut)
  - [x] signOut clears localStorage JWT keys
  - [x] API client interceptor (attach JWT)
  - [x] Build Login & Signup pages
  - [x] Implement ProtectedRoute/RoleGuard
- [ ] KOR-54: [FEAT] App Layout — Sidebar, Topbar, Navigation
  - [ ] Sidebar with role-based filtering
  - [ ] Topbar with Profile/Logout

## Milestone 3: Opportunity Ingestion
- [ ] KOR-55: [FEAT] Opportunity Intake — PDF Extraction & Validation (Path A)
- [ ] KOR-56: [FEAT] Opportunity Intake — Manual Creation (Path B)

## Milestone 4: Operations & Analytics
- [ ] KOR-57: [FEAT] Dashboard & Reporting — KPIs & Excel Export
- [ ] KOR-58: [FEAT] Security & Realtime — RLS verification & RPA Polling
