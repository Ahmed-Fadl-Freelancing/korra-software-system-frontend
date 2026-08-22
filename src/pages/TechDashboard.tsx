import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubOpportunities } from "@/lib/stub-data";
import { Opportunity } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/ui/kpi-card";
import { KpiSkeleton, CardListSkeleton } from "@/components/ui/page-skeleton";
import { ManagerWidgets } from "@/components/dashboard/ManagerWidgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileSearch, CheckCircle, Layers, DollarSign, Wrench, ArrowRight, FolderOpen,
} from "lucide-react";

export default function TechDashboard() {
  const navigate = useNavigate();
  const { isManager, hasRole } = useAuth();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Opportunity[]>("/engineering/queue")
      .catch(() => stubOpportunities)
      .then((data) => { setOpps(data); setLoading(false); });
  }, []);

  const byStatus = (status: string) => opps.filter((o) => o.status === status || status === "all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tech Office Dashboard</h1>
          <p className="text-sm text-muted-foreground">Engineering queue and verification pipeline</p>
        </div>
        {hasRole("tech_engineer") && (
          <Button onClick={() => navigate("/app/engineering")} className="gap-2">
            <Wrench className="h-4 w-4" />
            Engineering Workbench
          </Button>
        )}
      </div>

      {/* KPI Strip */}
      {loading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="New Requests" value={opps.length} icon={FileSearch} trend="+3 today" />
          <KpiCard label="Pending Verification" value={1} icon={CheckCircle} />
          <KpiCard label="Awaiting Portal Selection" value={1} icon={Layers} />
          <KpiCard label="Pricing Needed" value={0} icon={DollarSign} />
        </div>
      )}

      {/* Manager Widgets */}
      {isManager && <ManagerWidgets />}

      {/* Queue Tabs */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Queue</h2>
        {loading ? (
          <CardListSkeleton />
        ) : (
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
        )}
      </div>
    </div>
  );
}
