import { useNavigate, Link } from "react-router-dom";
import { stubOpportunities } from "@/lib/stub-data";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/ui/kpi-card";
import { ManagerWidgets } from "@/components/dashboard/ManagerWidgets";
import { QueueByStatusCard } from "@/components/dashboard/QueueByStatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileSearch, CheckCircle, Layers, DollarSign, Wrench, FolderOpen,
} from "lucide-react";

// Dashboard runs on stub data for now, deliberately -- no /engineering/queue call here yet.
// Swap this for a real fetch when the Opportunity section work wires this page up for real.
const opps = stubOpportunities;

export default function TechDashboard() {
  const navigate = useNavigate();
  const { isManager, hasRole } = useAuth();

  const byStatus = (status: string) => opps.filter((o) => o.status === status || status === "all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tech Office Dashboard</h1>
          <p className="text-sm text-muted-foreground">Engineering queue and verification pipeline</p>
        </div>
        {hasRole("engineer") && (
          <Button onClick={() => navigate("/app/engineering")} className="gap-2">
            <Wrench className="h-4 w-4" />
            Engineering Workbench
          </Button>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="New Requests" value={opps.length} icon={FileSearch} trend="+3 today" trendDirection="up" />
        <KpiCard label="Pending Verification" value={2} icon={CheckCircle} trend="Same as yesterday" trendDirection="flat" />
        <KpiCard label="Awaiting Portal Selection" value={1} icon={Layers} trend="-1 vs yesterday" trendDirection="down" />
        <KpiCard label="Pricing Needed" value={3} icon={DollarSign} trend="+3 today" trendDirection="up" />
      </div>

      {/* Queue Distribution */}
      <QueueByStatusCard />

      {/* Manager Widgets */}
      {isManager && <ManagerWidgets />}

      {/* Queue Tabs */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Queue</h2>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({opps.length})</TabsTrigger>
            <TabsTrigger value="in_review">In Review</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
          {["all", "in_review", "draft"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {byStatus(tab).length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title="No items"
                  description="Nothing in this queue right now."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {byStatus(tab).map((opp) => (
                    <Link key={opp.id} to={`/app/opportunities/${opp.id}`}>
                      <Card className="transition-all hover:shadow-md hover:border-primary/20">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{opp.project_name}</p>
                            <Badge variant="outline">{opp.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opp.contractor || "—"} · {opp.documents.length} docs
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
