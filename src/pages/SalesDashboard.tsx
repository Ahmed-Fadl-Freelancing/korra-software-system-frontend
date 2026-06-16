import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubTasks, stubOpportunities } from "@/lib/stub-data";
import { Task, Opportunity } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/ui/kpi-card";
import { KpiSkeleton, CardListSkeleton } from "@/components/ui/page-skeleton";
import { TaskCard } from "@/components/TaskCard";
import { ManagerWidgets } from "@/components/dashboard/ManagerWidgets";
import { LinearIssuesWidget } from "@/components/dashboard/LinearIssuesWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FolderOpen, Clock, FileCheck, Trophy, PlusCircle, ArrowRight, Inbox as InboxIcon,
} from "lucide-react";

export default function SalesDashboard() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiClient.get<Task[]>("/tasks").catch(() => stubTasks),
      apiClient.get<Opportunity[]>("/opportunities").catch(() => stubOpportunities),
    ]).then(([t, o]) => {
      setTasks((t as any).value || stubTasks);
      setOpps((o as any).value || stubOpportunities);
      setLoading(false);
    });
  }, []);

  const urgentTasks = tasks
    .filter((t) => t.priority === "urgent" || t.priority === "high")
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your sales pipeline</p>
        </div>
        <Button onClick={() => navigate("/app/opportunities/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Opportunity
        </Button>
      </div>

      {/* KPI Strip */}
      {loading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Open Opportunities" value={opps.length} icon={FolderOpen} trend="+2 this week" />
          <KpiCard label="Waiting on Tech" value={1} icon={Clock} />
          <KpiCard label="Offers Ready" value={0} icon={FileCheck} />
          <KpiCard label="Awarded This Month" value={0} icon={Trophy} />
        </div>
      )}

      {/* Manager Widgets */}
      {isManager && <ManagerWidgets />}

      {/* Linear Issues */}
      <LinearIssuesWidget />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">My Urgent Tasks</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate("/app/inbox")}>
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {loading ? (
            <CardListSkeleton count={2} />
          ) : urgentTasks.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title="All clear"
              description="No urgent tasks right now."
            />
          ) : (
            <div className="grid gap-3">
              {urgentTasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Opportunities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recently Updated</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate("/app/opportunities")}>
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {loading ? (
            <CardListSkeleton count={2} />
          ) : opps.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No opportunities"
              description="Create your first opportunity to get started."
              actionLabel="Create Opportunity"
              onAction={() => navigate("/app/opportunities/new")}
            />
          ) : (
            <div className="grid gap-3">
              {opps.slice(0, 4).map((opp) => (
                <Link key={opp.id} to={`/app/opportunities/${opp.id}`}>
                  <Card className="transition-all hover:shadow-md hover:border-primary/20">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{opp.project_name}</p>
                        <p className="text-xs text-muted-foreground">{opp.contractor || "No contractor"}</p>
                      </div>
                      <Badge variant="outline">{opp.status}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
