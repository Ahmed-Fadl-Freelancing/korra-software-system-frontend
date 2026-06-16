import { ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinearIssues, getStateColor, LINEAR_PRIORITY_LABEL } from "@/hooks/useLinear";
import { LinearIssue } from "@/types";

const PRIORITY_DOT: Record<number, string> = {
  0: "bg-slate-300",
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-blue-300",
};

function IssueRow({ issue }: { issue: LinearIssue }) {
  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[issue.priority] ?? "bg-slate-300"}`}
            title={LINEAR_PRIORITY_LABEL[issue.priority]}
          />
          <span className="truncate text-sm font-medium text-slate-900">{issue.title}</span>
        </div>
        <div className="flex items-center gap-2 pl-4">
          <span className="text-xs text-slate-400">{issue.identifier}</span>
          {issue.assignee && (
            <span className="text-xs text-slate-400">· {issue.assignee.name}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge className={`text-xs ${getStateColor(issue.state.name)}`}>
          {issue.state.name}
        </Badge>
        <ExternalLink className="h-3 w-3 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </a>
  );
}

export function LinearIssuesWidget() {
  const { data: issues, isLoading, isError, refetch, isFetching } = useLinearIssues();

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">L</span>
          Linear Issues
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-slate-700"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-2 pb-4">
        {isLoading && (
          <>
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </>
        )}

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Could not load Linear issues. Check that LINEAR_API_KEY is set on the backend.
          </div>
        )}

        {!isLoading && !isError && issues?.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No issues found</p>
        )}

        {issues?.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </CardContent>
    </Card>
  );
}
