#!/usr/bin/env node
/**
 * linear-issues.mjs
 * Creates feature-compacted issues in Linear for the Korra Frontend project.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

let API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) {
  try {
    const envContent = readFileSync(join(rootDir, '.env'), 'utf-8');
    const lines = envContent.split('\n');
    const line = lines.find(l => l.startsWith('LINEAR_API_KEY='));
    if (line) API_KEY = line.split('=')[1].trim();
  } catch (_) {}
}

if (!API_KEY) {
  console.error('Error: LINEAR_API_KEY not found.');
  process.exit(1);
}

const TEAM_NAME    = 'Korrra';
const PROJECT_NAME = 'Korra Frontend App';

async function gql(query, variables = {}) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) { console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2)); process.exit(1); }
  return json.data;
}

const ISSUES = [
  {
    title: '[FEAT] Auth Foundation — Supabase, Context, Login, Guards',
    description: 'Implement full authentication flow and protected routing.\n\n**Included tasks:**\n- Integrate @supabase/supabase-js\n- Implement AuthContext (session, profile, signIn, signOut)\n- API client interceptor (attach JWT)\n- Build Login page\n- Implement ProtectedRoute\n- Implement RoleGuard\n- Configure role-based routing shell',
    priority: 1,
  },
  {
    title: '[FEAT] App Layout — Sidebar, Topbar, Navigation',
    description: 'Build the main structural layout of the application.\n\n**Included tasks:**\n- Build AppLayout component\n- Build Sidebar with active-route highlighting and role-based filtering\n- Build Topbar\n- Mobile responsiveness',
    priority: 2,
  },
  {
    title: '[FEAT] Opportunity Intake — PDF Extraction & Validation (Path A)',
    description: 'Build the PDF ingestion pipeline UI.\n\n**Included tasks:**\n- Drag-and-drop PDF upload\n- Call Django extraction API\n- Handle status states (success/partial/failed)\n- Data review form with confidence indicators',
    priority: 1,
  },
  {
    title: '[FEAT] Opportunity Intake — Manual Creation (Path B)',
    description: 'Build the complete manual entry path for opportunities.\n\n**Included tasks:**\n- Define full opportunity zod schema\n- Build manual CreateOpportunity form (all project fields)\n- Conditional product fields (Chiller/Pump/Generator)',
    priority: 1,
  },
  {
    title: '[FEAT] Dashboard & Reporting — KPIs & Excel Export',
    description: 'Implement manager view and reporting features.\n\n**Included tasks:**\n- Manager KPI charts (Win rate, pipeline value)\n- Export-to-Excel for manager reports',
    priority: 3,
  },
  {
    title: '[FEAT] Security & Realtime — RLS verification & RPA Polling',
    description: 'Add security validation and realtime status updates.\n\n**Included tasks:**\n- Handle 403 / RLS-rejected responses\n- Supabase Realtime subscription for RPA status completion',
    priority: 2,
  }
];

async function run() {
  const teamsData = await gql(`query { teams { nodes { id name } } }`);
  const team = teamsData.teams.nodes.find(t => t.name === TEAM_NAME);
  const allProjectsData = await gql(`query { projects { nodes { id name } } }`);
  const project = allProjectsData.projects.nodes.find(p => p.name === PROJECT_NAME);

  console.log(`\nCreating ${ISSUES.length} compacted issues in "${PROJECT_NAME}"...\n`);

  for (const issue of ISSUES) {
    const created = await gql(`
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id identifier title url }
        }
      }
    `, {
      input: {
        teamId: team.id,
        projectId: project.id,
        title: issue.title,
        description: issue.description ?? '',
        priority: issue.priority ?? 0,
      },
    });
    const i = created.issueCreate.issue;
    console.log(`  ✅ ${i.identifier}  ${i.title}`);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
