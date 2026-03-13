import { CalendarDays, AlertCircle, Clock, CheckCircle2, XOctagon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";

const priorityConfig: Record<Task["priority"], { class: string; label: string }> = {
  low: { class: "bg-muted text-muted-foreground", label: "Low" },
  medium: { class: "bg-primary/10 text-primary", label: "Medium" },
  high: { class: "bg-warning/10 text-warning", label: "High" },
  urgent: { class: "bg-destructive/10 text-destructive", label: "Urgent" },
};

const statusConfig: Record<Task["status"], { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  pending: { icon: Clock, label: "Pending" },
  in_progress: { icon: AlertCircle, label: "In Progress" },
  completed: { icon: CheckCircle2, label: "Completed" },
  blocked: { icon: XOctagon, label: "Blocked" },
};

export function TaskCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  return (
    <Card className="transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight">{task.title}</h3>
          <Badge variant="secondary" className={`shrink-0 text-[10px] ${priority.class}`}>
            {priority.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{task.opportunity_name}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
