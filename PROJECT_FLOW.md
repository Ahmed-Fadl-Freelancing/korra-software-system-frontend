# Korra System: Unified Project Flow

## 1. Overview
The Korra System manages "Opportunities" (Projects) through two primary paths: **Path A (PDF Ingestion)** and **Path B (Manual Entry)**.

## 2. Authentication & Identity
- **Provider:** Supabase (Auth & DB).
- **Handshake:** 
  1. Frontend logs in via Supabase.
  2. Frontend sends Supabase JWT in `Authorization: Bearer` header to Backend.
  3. Backend validates JWT against Supabase public keys and hydrates user session.
  4. Backend `/me` endpoint returns role (Manager/user) and department (Sales/Tech).

## 3. Opportunity Lifecycle

### Path A: PDF Extractions (Milestone 3)
1. **Upload:** User (Sales) drags PDF into Frontend.
2. **Analysis:** Frontend sends file to Backend `/opportunities/extract`.
3. **Extraction:** Backend triggers RPA/LLM to parse PDF fields.
4. **Validation:** Backend returns parsed data to Frontend with "Confidence Scores".
5. **Review:** User confirms/edits data and hits "Create".
6. **Persistence:** Backend creates record in Postgres.

### Path B: Manual Entry (Milestone 3B)
1. **Creation:** User (Sales) opens "New Opportunity" form.
2. **Submission:** User fills all fields (Client, Scope, Value, etc.).
3. **Logic:** Backend receives JSON, validates via Zod/Django-Rest-Schema, and creates record.

## 4. Role-Based Flow
- **Sales Rep:** Creates Opportunities (Path A or B). Views own dashboard.
- **Tech Office:** Receives "Draft" opportunities for technical review and cost estimation.
- **Manager:** Views aggregate KPIs (Win rate, Pipeline value) across all departments.

## 5. Integration Points
- **Frontend -> Backend:** All domain-specific logic (Opportunities, Extraction, Analytics).
- **Backend -> Supabase:** Direct DB writes for complex relations.
- **Frontend -> Supabase:** Real-time subscriptions for status updates.
