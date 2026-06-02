#!/usr/bin/env node
/**
 * linear-issues.mjs
 * Creates Epics + Issues in Linear for the Korra project.
 *
 * Prerequisites:
 *   1. Get a Linear API key from: https://linear.app/settings/api
 *   2. Create `.env.linear` file in project root with: LINEAR_API_KEY=your-key-here
 *   3. Run: node scripts/linear-issues.mjs
 *
 * What it does:
 *   - Finds the "Korrra" workspace team "Korra Frontend App" and "Korra Backend App"
 *   - Creates one Epic per milestone
 *   - Creates issues under each epic for every task
 *
 * To target only one project, set TARGET=frontend or TARGET=backend env var.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Load .env.linear file
let API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) {
  try {
    const envContent = readFileSync(join(rootDir, '.env.linear'), 'utf-8');
    const match = envContent.match(/LINEAR_API_KEY=(.+)/);
    if (match) API_KEY = match[1].trim();
  } catch (err) {
    // .env.linear doesn't exist; fallback to env var
  }
}

const TARGET = process.env.TARGET; // 'frontend' | 'backend' | undefined (= both)

if (!API_KEY) {
  console.error("Error: LINEAR_API_KEY not found.");
  console.error("Either set LINEAR_API_KEY env var or create .env.linear file with:");
  console.error("  LINEAR_API_KEY=lin_api_xxxxx");
  process.exit(1);
}

async function linearGql(query, variables = {}) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }
  return json.data;
}

// ──────────────────────────────────────────────
// Issue definitions
// Each entry: { title, description, priority (0=none,1=urgent,2=high,3=medium,4=low) }
// ──────────────────────────────────────────────

const FRONTEND_MILESTONES = [
  {
    epic: "M2 — Frontend Foundation & Auth",
    issues: [
      {
        title: "Scaffold Vite + React 18 + TypeScript project",
        description:
          "Initialize the project with Vite, React 18, TypeScript 5. Configure tsconfig paths. Verify `npm run dev` works.\n\n**Acceptance criteria:**\n- `npm run dev` starts without errors\n- Strict TypeScript mode on\n- Absolute imports configured (`@/` → `src/`)",
        priority: 1,
      },
      {
        title: "Integrate @supabase/supabase-js and expose supabase client",
        description:
          "Create `src/lib/supabase.ts` that initialises the Supabase client from env vars.\n\n**Acceptance criteria:**\n- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are the only secrets\n- No API keys hardcoded\n- Client exported as singleton",
        priority: 1,
      },
      {
        title: "Implement AuthContext — session, profile, signIn, signOut",
        description:
          "Create `src/contexts/AuthContext.tsx`.\n\n**Acceptance criteria:**\n- Exposes `user` (Supabase User), `profile` (from `profile` table), `signIn(email, password)`, `signOut()`\n- On sign-in fetches the user's row from `profile` table\n- Loading state while resolving session\n- No JWT claims used for role checks",
        priority: 1,
      },
      {
        title: "API client interceptor — attach Supabase JWT to all Django requests",
        description:
          "Create / update `src/lib/api-client.ts`.\n\n**Acceptance criteria:**\n- Every request to the Django base URL includes `Authorization: Bearer <jwt>`\n- JWT is sourced from `supabase.auth.getSession()` at request time (always fresh)\n- No other file calls `fetch` or `axios` directly",
        priority: 1,
      },
      {
        title: "Build Login page — email + password via Supabase",
        description:
          "Create `src/pages/Login.tsx`.\n\n**Acceptance criteria:**\n- Uses `react-hook-form` + `zod` for validation\n- Calls `AuthContext.signIn`\n- Shows inline error message on failure\n- Redirects to dashboard on success\n- No session cookies; JWT only",
        priority: 2,
      },
      {
        title: "Implement ProtectedRoute — redirect unauthenticated users",
        description:
          "Create `src/components/ProtectedRoute.tsx`.\n\n**Acceptance criteria:**\n- Wraps any route; redirects to `/login` if no session\n- Passes through children when authenticated\n- Shows loading spinner while session is resolving",
        priority: 2,
      },
      {
        title: "Implement RoleGuard — restrict pages by profile role/department",
        description:
          "Create `src/components/RoleGuard.tsx`.\n\n**Acceptance criteria:**\n- Accepts `allowedRoles` and/or `allowedDepartments` props\n- Reads from `AuthContext.profile`\n- Redirects to `/unauthorized` (or shows 403 page) if not allowed\n- Role check uses `profile` table values only — NOT JWT claims",
        priority: 2,
      },
      {
        title: "Role-based routing shell — Sales, Technical, Manager routes",
        description:
          "Configure `react-router-dom` v6 routes in `App.tsx`.\n\n**Acceptance criteria:**\n- `/sales/*` guarded by `RoleGuard allowedDepartments=['sales']`\n- `/technical/*` guarded by `RoleGuard allowedDepartments=['technical']`\n- `/manager/*` guarded by `RoleGuard allowedRoles=['manager']`\n- Shared routes (Inbox, etc.) accessible to all authenticated users",
        priority: 2,
      },
      {
        title: "Build AppLayout — sidebar + topbar with active-route highlighting",
        description:
          "Create `src/components/layout/AppLayout.tsx`, `AppSidebar.tsx`, `Topbar.tsx`.\n\n**Acceptance criteria:**\n- Sidebar links are filtered by current user's role/department\n- Active route link is highlighted\n- Mobile responsive: sidebar collapses to hamburger menu\n- Uses shadcn/ui primitives only",
        priority: 3,
      },
      {
        title: "Seed stub data for local development without backend",
        description:
          "Create `src/lib/stub-data.ts`.\n\n**Acceptance criteria:**\n- Stub data matches real Django API response shape\n- Api-client has a `USE_STUBS` flag (driven by env var) that returns stubs instead of real HTTP calls\n- No stub imports in production build",
        priority: 3,
      },
    ],
  },
  {
    epic: "M3 — Document Ingestion UI",
    issues: [
      {
        title: "Drag-and-drop PDF upload component",
        description:
          "Create `src/components/FileUpload.tsx`.\n\n**Acceptance criteria:**\n- Accepts PDF files only; rejects other MIME types with a toast error\n- Shows upload progress\n- On success emits the backend response (extracted JSON + status) to parent\n- Uses no external file-uploader lib; native HTML5 drag-drop + shadcn",
        priority: 1,
      },
      {
        title: "Call POST /api/documents/upload/ and handle all status states",
        description:
          "Wire `FileUpload` to the API client.\n\n**Acceptance criteria:**\n- Calls `POST /api/documents/upload/` via `api-client.ts`\n- Three states handled: `success`, `partial`, `failed`\n- Each state shows a distinct UI (green banner / yellow warning / red error)\n- Network errors handled gracefully with retry button",
        priority: 1,
      },
      {
        title: "Data Validation UI — form pre-filled from extracted JSON",
        description:
          "Build the review/correction form shown after PDF processing.\n\n**Acceptance criteria:**\n- Form fields map 1:1 to the extracted JSON payload keys\n- Fields are pre-filled with extracted values\n- If status is `partial` or `failed`, all fields are editable\n- If status is `success`, fields are read-only with an 'Edit' toggle\n- Uses `react-hook-form` + `zod`; no raw state",
        priority: 1,
      },
      {
        title: "Extraction confidence indicators per field",
        description:
          "Show a coloured dot/icon next to each extracted field.\n\n**Acceptance criteria:**\n- Green = high confidence, Yellow = low confidence, Red = not extracted\n- Confidence comes from backend response per-field metadata\n- Screen-reader accessible (aria-label)",
        priority: 3,
      },
      {
        title: "Submit validated payload to opportunity creation endpoint",
        description:
          "On form submit, call the opportunity creation API.\n\n**Acceptance criteria:**\n- All required fields validated with zod before submit\n- Calls the correct endpoint via `api-client.ts`\n- On success, redirects to the new opportunity detail page\n- On failure, shows inline field errors",
        priority: 2,
      },
    ],
  },
  {
    epic: "M4 — Database Security UI (RLS Verification)",
    issues: [
      {
        title: "Integration test: frontend only reads RLS-permitted rows",
        description:
          "Verify RLS is enforced from the React perspective.\n\n**Acceptance criteria:**\n- Playwright test: user A cannot see user B's department data\n- Test runs against the real Supabase staging environment\n- CI passes",
        priority: 2,
      },
      {
        title: "Handle 403 / RLS-rejected API responses gracefully",
        description:
          "Ensure the UI does not crash on permission-denied responses.\n\n**Acceptance criteria:**\n- 403 responses trigger a toast 'You don't have permission for this action'\n- No unhandled promise rejections in console\n- User is NOT logged out; session is preserved",
        priority: 2,
      },
    ],
  },
  {
    epic: "M5 — RPA Integration UI",
    issues: [
      {
        title: "Add Processing status state to opportunity cards",
        description:
          "Opportunity cards need to show a 'Processing by RPA' state.\n\n**Acceptance criteria:**\n- New `processing` card variant with spinner animation\n- Status sourced from `project_status` enum value\n- Does not break existing status variants",
        priority: 3,
      },
      {
        title: "Poll or subscribe (Supabase Realtime) for RPA completion",
        description:
          "Update the UI automatically when RPA finishes.\n\n**Acceptance criteria:**\n- Option A: Supabase Realtime subscription on `project` table for the current user's rows\n- Option B: polling every 10s (fallback if Realtime is not enabled)\n- On completion, card transitions to new status without page reload",
        priority: 3,
      },
      {
        title: "RPA error state with retry option",
        description:
          "Show a recoverable error state when RPA fails.\n\n**Acceptance criteria:**\n- Distinct 'RPA Failed' card state with error message\n- 'Retry' button triggers re-submission\n- Retry calls the correct API endpoint",
        priority: 3,
      },
    ],
  },
  {
    epic: "M6 — Data Warehouse Manager Views",
    issues: [
      {
        title: "Manager dashboard — KPI charts from DW sync endpoints",
        description:
          "Build `src/pages/SalesDashboard.tsx` and `TechDashboard.tsx` KPI sections.\n\n**Acceptance criteria:**\n- Data fetched from DW endpoints via `api-client.ts`\n- Uses shadcn/ui chart primitives (recharts)\n- Loading skeleton shown while fetching\n- No hardcoded mock data in production build",
        priority: 3,
      },
      {
        title: "Export-to-Excel for manager reports",
        description:
          "Allow managers to download dashboard data as `.xlsx`.\n\n**Acceptance criteria:**\n- Uses `xlsx` (sheetjs) package\n- Export button visible only to users with manager role\n- Exported file name includes current date",
        priority: 4,
      },
    ],
  },
];

const BACKEND_MILESTONES = [
  {
    epic: "M1 — Backend Foundation & Auth (Django)",
    issues: [
      {
        title: "Initialize Django project and connect Supabase PostgreSQL",
        description:
          "Bootstrap the Django project and point `DATABASES` at Supabase's PostgreSQL connection string.\n\n**Acceptance criteria:**\n- `python manage.py migrate` runs cleanly\n- Connection string sourced from env var `DATABASE_URL`\n- No secrets in source code",
        priority: 1,
      },
      {
        title: "Implement Supabase JWT validation middleware",
        description:
          "Django must validate the Supabase JWT on every request (stateless).\n\n**Acceptance criteria:**\n- Middleware decodes JWT using Supabase JWT Secret (`SUPABASE_JWT_SECRET` env var)\n- Sets `request.user` to a lightweight object with `id` and `role`\n- Returns 401 for missing / invalid / expired tokens\n- No session or cookie creation",
        priority: 1,
      },
      {
        title: "Create base models: profile, project, project_status_history",
        description:
          "Map models to the Supabase schema.\n\n**Acceptance criteria:**\n- `Profile` model: fields match `profile` table (provide schema.sql)\n- `Project` model: uses `project_status` enum\n- `ProjectStatusHistory` model: FK to `Project`, stores old/new status + user + timestamp\n- All enums use the exact string values from `schema.sql`",
        priority: 1,
      },
      {
        title: "Setup DRF or Django-Ninja routing",
        description:
          "Choose and configure the API framework.\n\n**Acceptance criteria:**\n- All endpoints prefixed with `/api/`\n- OpenAPI / Swagger docs available at `/api/docs/`\n- JWT middleware applied globally to all API routes\n- Health check endpoint `GET /api/health/` returns 200",
        priority: 1,
      },
    ],
  },
  {
    epic: "M3 — Document Ingestion Pipeline (Django)",
    issues: [
      {
        title: "POST /api/documents/upload/ — accept and store PDF",
        description:
          "Create the file upload endpoint.\n\n**Acceptance criteria:**\n- Accepts `multipart/form-data` with a `file` field\n- Validates MIME type is `application/pdf`; rejects others with 400\n- Saves file to storage (local or Supabase Storage bucket)\n- Returns `{ document_id, status: 'queued' }` immediately",
        priority: 1,
      },
      {
        title: "PyMuPDF extraction logic — parse uploaded PDF",
        description:
          "Implement the extraction service.\n\n**Acceptance criteria:**\n- Uses `pymupdf` (fitz) to extract text and structured data\n- Returns a JSON payload mapping field names to extracted values\n- Returns an extraction status: `success`, `partial`, or `failed`\n- Per-field confidence score included in response\n- Handles corrupt / password-protected PDFs without crashing (returns `failed`)",
        priority: 1,
      },
      {
        title: "Return extraction result with status (success/partial/failed)",
        description:
          "Wire extraction result into the API response.\n\n**Acceptance criteria:**\n- Response schema: `{ document_id, status, fields: { [key]: { value, confidence } } }`\n- `status` is exactly one of `success | partial | failed`\n- Endpoint documented in OpenAPI",
        priority: 1,
      },
    ],
  },
  {
    epic: "M4 — Database Security & Auditing (Supabase SQL)",
    issues: [
      {
        title: "Write RLS policies for all tables based on profile role/department",
        description:
          "Create SQL migration for Row Level Security.\n\n**Acceptance criteria:**\n- RLS enabled on `project`, `document`, `profile` tables\n- Sales Engineers can only read/write rows in their department\n- Managers can read all rows\n- Policies tested with `SET ROLE` in Supabase SQL editor",
        priority: 1,
      },
      {
        title: "PostgreSQL trigger: insert into project_status_history on status change",
        description:
          "Implement the audit trail trigger.\n\n**Acceptance criteria:**\n- Trigger fires on `UPDATE` of `project.status`\n- Inserts old status, new status, `auth.uid()`, and `now()` into `project_status_history`\n- Works correctly when status changes multiple times\n- Tested with a manual SQL update",
        priority: 2,
      },
    ],
  },
];

// ──────────────────────────────────────────────
// Helper: find team ID by name
// ──────────────────────────────────────────────
async function getTeamId(teamName) {
  const data = await linearGql(`
    query {
      teams {
        nodes { id name }
      }
    }
  `);
  const team = data.teams.nodes.find((t) =>
    t.name.toLowerCase().includes(teamName.toLowerCase())
  );
  if (!team) {
    console.error(
      `Team "${teamName}" not found. Available:`,
      data.teams.nodes.map((t) => t.name)
    );
    process.exit(1);
  }
  return team.id;
}

// ──────────────────────────────────────────────
// Helper: create a project (used as Epic)
// ──────────────────────────────────────────────
async function createProject(teamId, name, description) {
  const data = await linearGql(
    `
    mutation CreateProject($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        success
        project { id name }
      }
    }
  `,
    {
      input: {
        teamIds: [teamId],
        name,
        description: description ?? "",
      },
    }
  );
  return data.projectCreate.project;
}

// ──────────────────────────────────────────────
// Helper: create an issue
// ──────────────────────────────────────────────
async function createIssue(teamId, projectId, { title, description, priority }) {
  const data = await linearGql(
    `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id title url }
      }
    }
  `,
    {
      input: {
        teamId,
        projectId,
        title,
        description: description ?? "",
        priority: priority ?? 0,
      },
    }
  );
  return data.issueCreate.issue;
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function run() {
  const jobs = [];

  if (!TARGET || TARGET === "frontend") {
    jobs.push({ teamName: "Korrra", milestones: FRONTEND_MILESTONES });
  }
  if (!TARGET || TARGET === "backend") {
    jobs.push({ teamName: "Korra Backend App", milestones: BACKEND_MILESTONES });
  }

  for (const { teamName, milestones } of jobs) {
    console.log(`\n📋 Processing team: ${teamName}`);
    const teamId = await getTeamId(teamName);

    for (const milestone of milestones) {
      console.log(`  🏗  Creating project (epic): ${milestone.epic}`);
      const project = await createProject(teamId, milestone.epic);

      for (const issue of milestone.issues) {
        const created = await createIssue(teamId, project.id, issue);
        console.log(`    ✅ ${created.title} — ${created.url}`);
      }
    }
  }

  console.log("\n✨ Done! All issues created in Linear.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
