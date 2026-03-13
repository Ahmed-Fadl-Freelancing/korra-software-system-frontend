import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { stubTasks } from "@/lib/stub-data";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/types";

export default function Inbox() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Task[]>("/tasks")
      .then(setTasks)
      .catch(() => {
        console.warn("Django /tasks unavailable, using stub data");
        setTasks(stubTasks);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Inbox</h1>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks assigned to you.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
