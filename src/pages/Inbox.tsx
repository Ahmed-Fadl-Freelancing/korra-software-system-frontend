import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { stubTasks } from "@/lib/stub-data";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/types";
import { CardListSkeleton } from "@/components/ui/page-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox as InboxIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Inbox() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ tasks: Task[] }>("/tasks")
      .then((res) => setTasks(res.tasks))
      .catch(() => setTasks(stubTasks))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (status: string) =>
    status === "all" ? tasks : tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">Tasks assigned to you</p>
      </div>

      {loading ? (
        <CardListSkeleton count={4} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="Inbox zero!"
          description="You have no tasks assigned. Enjoy the break."
        />
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          {["all", "pending", "in_progress", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {byStatus(tab).length === 0 ? (
                <EmptyState
                  icon={InboxIcon}
                  title="Nothing here"
                  description={`No ${tab === "all" ? "" : tab.replace("_", " ")} tasks.`}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {byStatus(tab).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
