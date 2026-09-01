import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as linearClient from "@/lib/linear-client";
import { LinearPriority } from "@/types";

const QUERY_KEY = ["linear", "issues"] as const;
const TEAM_KEY = "KOR";

// ---------------------------------------------------------------------------
// Create issue
// ---------------------------------------------------------------------------

interface CreateIssueInput {
  title: string;
  description?: string;
  priority?: LinearPriority;
}

export function useCreateLinearIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIssueInput) =>
      linearClient.createLinearIssue(
        input.title,
        input.description || "",
        TEAM_KEY,
        input.priority || 3
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// Update issue status
// ---------------------------------------------------------------------------

interface UpdateStatusInput {
  issueId: string;
  status: string;
}

export function useUpdateLinearIssueStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, status }: UpdateStatusInput) =>
      linearClient.updateIssueStatus(issueId, status, TEAM_KEY),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const LINEAR_PRIORITY_LABEL: Record<number, string> = {
  0: "No priority",
  1: "Urgent",
  2: "High",
  3: "Medium",
  4: "Low",
};

export const LINEAR_STATE_COLOR: Record<string, string> = {
  backlog: "bg-slate-200 text-slate-700",
  unstarted: "bg-slate-200 text-slate-700",
  started: "bg-blue-100 text-blue-700",
  "in progress": "bg-blue-100 text-blue-700",
  "in review": "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export function getStateColor(stateName: string): string {
  return LINEAR_STATE_COLOR[stateName.toLowerCase()] ?? "bg-slate-100 text-slate-600";
}
