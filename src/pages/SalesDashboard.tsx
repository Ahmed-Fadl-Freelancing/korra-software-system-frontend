import { useNavigate, Link } from "react-router-dom";
import { stubTasks, stubOpportunities } from "@/lib/stub-data";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/ui/kpi-card";
import { TaskCard } from "@/components/TaskCard";
import { ManagerWidgets } from "@/components/dashboard/ManagerWidgets";
import { PipelineTrendCard } from "@/components/dashboard/PipelineTrendCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FolderOpen, Clock, FileCheck, Trophy, PlusCircle, ArrowRight, Inbox as InboxIcon,
} from "lucide-react";

// Dashboard runs on stub data for now, deliberately -- no /tasks or /opportunities calls here yet.
// Swap these two lines for real fetches when the Opportunity section work wires this page up for real.
const tasks = stubTasks;
const opps = stubOpportunities;

export default function SalesDashboard() {
  const navigate = useNavigate();
  const { isManager } = useAuth();

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Opportunities" value={opps.length} icon={FolderOpen} trend="+2 this week" trendDirection="up" />
        <KpiCard label="Waiting on Tech" value={1} icon={Clock} trend="Same as last week" trendDirection="flat" />
        <KpiCard label="Offers Ready" value={2} icon={FileCheck} trend="+2 this week" trendDirection="up" />
        <KpiCard label="Awarded This Month" value={1} icon={Trophy} trend="-1 vs last month" trendDirection="down" />
      </div>

      {/* Pipeline Trend */}
      <PipelineTrendCard />

      {/* Manager Widgets */}
      {isManager && <ManagerWidgets />}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">My Urgent Tasks</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate("/app/inbox")}>
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {urgentTasks.length === 0 ? (
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
          {opps.length === 0 ? (
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
