# 📋 KORRA SOFTWARE SYSTEM - Master Implementation Plan

**Project Overview:** Automating Korra's sales and technical office workflows, transitioning from manual Excel tracking to a streamlined web platform with RPA integration.

**Repositories:**
1. `korra-software-system-frontend` (React)
2. `Korra-Software-System-Backend` (Django) + Supabase (Database & Auth)

---

## 🏗️ Core Architecture Decisions
* **Authentication:** Handled by Supabase on the frontend. React gets the JWT and passes it in the `Authorization: Bearer` header. Django acts as a stateless API, validating the JWT using the Supabase JWT Secret. 
* **Role Management:** Handled via a custom `profile` table in the database mapping to the authenticated user.
* **Database & Security:** Supabase PostgreSQL. RLS (Row Level Security) will be applied using custom SQL scripts based on a JSON configuration of departments/roles.
* **PDF Processing:** React sends the file to Django. Django saves it and extracts data using `pymupdf`.
* **Data Fallback:** If PDF extraction fails or yields corrupted data, the React UI will present manual input fields to correct the payload before RPA handoff.
* **Audit Trail:** A `project_status_history` table will track every status change made by users for operational monitoring.

---

## 🗺️ Implementation Milestones

### Milestone 1: Backend Foundation & Auth (Django)
* **Objective:** Set up the Django project, database connections, and stateless authentication.
* **Tasks:**
    * Initialize Django project and connect it to the Supabase PostgreSQL connection string.
    * Implement a custom Authentication Middleware/Backend in Django to decode and validate Supabase JWTs.
    * Create the base models mapping to the database schema (`profile`, `project_status_history`, and the provided enums: `document_type`, `project_status`, etc.).
    * Setup Django REST Framework (DRF) or Ninja to handle API routing.

### Milestone 2: Frontend Foundation & Auth (React)
* **Objective:** Scaffold the React app and establish the secure connection to Supabase and Django.
* **Tasks:**
    * Initialize React app (Vite/Next.js).
    * Integrate `@supabase/supabase-js` for frontend login/authentication.
    * Create an Axios/Fetch interceptor that automatically attaches the Supabase JWT to all outbound requests targeting the Django backend.
    * Build the Login UI and basic role-based routing (checking the `profile` table).

### Milestone 3: Document Ingestion Pipeline (Django & React)
* **Objective:** Enable users to upload PDFs and extract the data automatically.
* **Tasks (Backend):**
    * Create an API endpoint (`POST /api/documents/upload/`) to accept PDF files.
    * Implement `pymupdf` logic to parse the uploaded file.
    * Return a JSON payload of the extracted data, alongside an "extraction status" (Success, Partial, Failed).
* **Tasks (Frontend):**
    * Build the drag-and-drop PDF upload interface for Sales Engineers.
    * Build the "Data Validation UI": A form populated by the backend's extracted JSON. If extraction failed/partial, the user must manually fill/correct these fields.

### Milestone 4: Database Security & Auditing (Supabase SQL)
* **Objective:** Lock down the database and establish the tracking history.
* **Tasks (SQL Editor / Migrations):**
    * Write the RLS policies in raw SQL applying custom logic based on the user's `profile` role/department.
    * Create a PostgreSQL trigger that automatically inserts a record into `project_status_history` whenever a `project` row's status changes.

### Milestone 5: UiPath RPA Integration [TODO]
* *Pending architectural decisions regarding webhooks, polling, or Orchestrator API integration. UI needs a "Processing" state to handle RPA latency.*

### Milestone 6: Data Warehouse (DW) Sync [TODO]
* *Future implementation to sync production data into the empty fact schema for operational analysis.*

---

## 🤖 Instructions for AI Assistant:
When I ask you to work on this project, I will specify which **Repository** and **Milestone** we are tackling. 
1. Do not assume stateful sessions in Django; strictly rely on the Supabase JWT.
2. Adhere to the provided database Enums for all status and type fields.
3. Write clean, modular code. If I ask you to generate Linear issues, output them as a bulleted checklist with clear acceptance criteria.
