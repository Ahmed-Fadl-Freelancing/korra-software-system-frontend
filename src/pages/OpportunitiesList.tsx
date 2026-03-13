import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubOpportunities } from "@/lib/stub-data";
import { Opportunity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardListSkeleton } from "@/components/ui/page-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen, PlusCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasDepartment } = useAuth();

  useEffect(() => {
    apiClient
      .get<Opportunity[]>("/opportunities")
      .then(setOpportunities)
      .catch(() => setOpportunities(stubOpportunities))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-sm text-muted-foreground">{opportunities.length} total opportunities</p>
        </div>
        {hasDepartment("sales") && (
          <Button onClick={() => navigate("/app/opportunities/new")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Opportunity
          </Button>
        )}
      </div>

      {loading ? (
        <CardListSkeleton count={6} />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No opportunities yet"
          description="Create your first opportunity to get started with the pipeline."
          actionLabel={hasDepartment("sales") ? "Create Opportunity" : undefined}
          onAction={hasDepartment("sales") ? () => navigate("/app/opportunities/new") : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <Link key={opp.id} to={`/app/opportunities/${opp.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-primary/20 h-full">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm font-semibold truncate">{opp.project_name}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{opp.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Contractor</span>
                      <p>{opp.contractor || "—"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Owner</span>
                      <p>{opp.owner || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {opp.documents.length} document{opp.documents.length !== 1 ? "s" : ""}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
