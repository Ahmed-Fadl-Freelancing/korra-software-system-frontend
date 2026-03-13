import { Task, Opportunity } from "@/types";

export const stubTasks: Task[] = [
  {
    id: "1",
    title: "Review technical specifications",
    opportunity_name: "Highway Bridge Renovation",
    status: "pending",
    due_date: "2026-03-18",
    priority: "high",
    assigned_to: "me",
  },
  {
    id: "2",
    title: "Upload contractor documents",
    opportunity_name: "Commercial Building Project",
    status: "in_progress",
    due_date: "2026-03-20",
    priority: "medium",
    assigned_to: "me",
  },
  {
    id: "3",
    title: "Verify structural calculations",
    opportunity_name: "Residential Complex Phase 2",
    status: "pending",
    due_date: "2026-03-15",
    priority: "urgent",
    assigned_to: "me",
  },
  {
    id: "4",
    title: "Prepare offer document",
    opportunity_name: "Municipal Water Treatment",
    status: "completed",
    due_date: "2026-03-12",
    priority: "low",
    assigned_to: "me",
  },
];

export const stubOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    project_name: "Highway Bridge Renovation",
    email_body: "Request for structural assessment...",
    contractor: "BuildCo Ltd",
    owner: "Ministry of Transport",
    consultant: "EngConsult GmbH",
    status: "in_review",
    created_at: "2026-03-01",
    documents: [
      { id: "doc-1", filename: "specs_v2.pdf", uploaded_at: "2026-03-02" },
      { id: "doc-2", filename: "drawings.pdf", uploaded_at: "2026-03-02" },
    ],
  },
  {
    id: "opp-2",
    project_name: "Commercial Building Project",
    email_body: "New commercial building tender...",
    contractor: "Apex Construction",
    owner: "Metro Properties",
    consultant: "Urban Design Inc",
    status: "draft",
    created_at: "2026-03-05",
    documents: [],
  },
];
