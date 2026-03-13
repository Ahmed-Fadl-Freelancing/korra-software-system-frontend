import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubOpportunities } from "@/lib/stub-data";
import { Opportunity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardListSkeleton } from "@/components/ui/page-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Wrench, FileText } from "lucide-react";

export default function Engineering() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Opportunity[]>("/engineering/queue")
      .then(setItems)
      .catch(() => setItems(stubOpportunities))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Engineering Workbench</h1>
        <p className="text-sm text-muted-foreground">
          Opportunities requiring verification or model selection
        </p>
      </div>
      {loading ? (
        <CardListSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Queue is empty"
          description="No opportunities need engineering attention right now."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((opp) => (
            <Link key={opp.id} to={`/app/opportunities/${opp.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-primary/20 h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold">{opp.project_name}</p>
                    </div>
                    <Badge variant="outline">{opp.status}</Badge>
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
