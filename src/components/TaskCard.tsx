import { CalendarDays, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<Task["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <Badge variant="outline" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{task.opportunity_name}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            {statusLabels[task.status]}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
