// ─── Auth & Identity ──────────────────────────────────────────────────────────

export type RoleCode = "sales_engineer" | "tech_engineer" | "manager" | "admin";
export type DepartmentName = "Sales" | "Tech Office";

export type JobTitleLevel =
  | "Junior Engineer"
  | "Senior Engineer"
  | "Lead Engineer"
  | "Section Head"
  | "Department Manager"
  | "General Manager"
  | "Director"
  | "Board Member";

export interface Department {
  id: string;
  name: DepartmentName;
}

// The literal GET /me response contract (PROJECT_FLOW.md §2.4) — no email or job_title;
// those aren't returned by this endpoint (email comes from the JWT instead, see AuthContext).
export interface MeResponse {
  user_id: string;
  employee_code: string;
  full_name: string;
  department: Department | null;
  roles: RoleCode[];
}

// App-internal profile shape: MeResponse plus the email claim read from the JWT.
export interface UserProfile extends MeResponse {
  email: string;
}

// ─── Projects (shown as "Opportunities" in UI) ────────────────────────────────

export type ProjectStatus =
  | "tenderingPhase"
  | "technicalApproval"
  | "finalNegotiation"
  | "won"
  | "lost"
  | "onHold"
  | "withDifferentContractor"
  | "cancelled";

export type ProductFamily = "Chiller" | "Pump" | "Generator";
export type ProjectScope = "Supply" | "SupplyInstallation" | "Maintenance" | "Retrofit" | "Other";
export type ProjectApplication = "Industrial" | "Commercial" | "Health" | "Residential";
export type DocumentType = "offer" | "submittal" | "rfq";

export type WinReason = "price" | "technical" | "relationship" | "service" | "sole_source" | "bundled_deal";
export type LossReason = "price" | "technical" | "relationship" | "delivery_delay" | "response_delay" | "scope_changed" | "bad_experience";

export interface ProjectParty {
  id: string;
  name: string;
}

export interface ProjectUser {
  user_id: string;
  full_name: string;
}

export interface Project {
  id: string;
  name: string;
  contractor: ProjectParty | null;
  consultant: ProjectParty | null;
  owner: ProjectParty | null;
  sales_engineer: ProjectUser;
  tech_engineer: ProjectUser | null;
  application: ProjectApplication;
  scope: ProjectScope;
  status: ProjectStatus;
  product: { id: string; family: ProductFamily; model_code: string } | null;
  extracted_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Keep "Opportunity" as an alias — UI uses this label
export type Opportunity = Project;

// ─── Documents ────────────────────────────────────────────────────────────────

export interface DocumentMeta {
  id: string;
  filename: string;
  doc_type: DocumentType;
  version: number;
  is_current: boolean;
  url?: string;
  created_at: string;
}

// Matches Django's SignedUploadUrlView response — passes through Supabase Storage's
// create_signed_upload_url() result verbatim: { signed_url, token, path }. No document_id
// here — POST /documents/ (after the upload) is what creates the actual Document row/id.
export interface SignedUploadUrl {
  signed_url: string;
  token: string;
  path: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  opportunity_name: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  due_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  from_status: ProjectStatus | null;
  to_status: ProjectStatus;
  changed_at: string;
  user_name?: string;
  notes?: string;
}

// ─── Linear ───────────────────────────────────────────────────────────────────

export interface LinearIssueState {
  id: string;
  name: string;
  type: string;
}

export interface LinearIssueAssignee {
  id: string;
  name: string;
  email: string;
}

export interface LinearIssueLabel {
  id: string;
  name: string;
  color: string;
}

export type LinearPriority = 0 | 1 | 2 | 3 | 4;

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority: LinearPriority;
  url: string;
  createdAt: string;
  updatedAt: string;
  state: LinearIssueState;
  assignee?: LinearIssueAssignee;
  labels: { nodes: LinearIssueLabel[] };
}
