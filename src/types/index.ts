export type RoleCode = "sales" | "engineer" | "manager" | "admin";
export type DepartmentName = "sales" | "tech_office";

export interface Department {
  id: string;
  name: DepartmentName;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  department: Department;
  roles: RoleCode[];
}

export interface Task {
  id: string;
  title: string;
  opportunity_name: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  due_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string;
}

export interface Opportunity {
  id: string;
  project_name: string;
  email_body: string;
  contractor: string;
  owner: string;
  consultant: string;
  status: string;
  created_at: string;
  documents: DocumentMeta[];
}

export interface DocumentMeta {
  id: string;
  filename: string;
  url?: string;
  uploaded_at: string;
}

export interface SignedUploadUrl {
  signed_url: string;
  document_id: string;
}

export interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  user_name?: string;
  note?: string;
}
