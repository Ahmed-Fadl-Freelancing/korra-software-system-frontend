import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubOpportunities } from "@/lib/stub-data";
import { Opportunity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";

export default function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Opportunity[]>("/opportunities")
      .then(setOpportunities)
      .catch(() => {
        setOpportunities(stubOpportunities);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Opportunities</h1>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : opportunities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No opportunities yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <Link key={opp.id} to={`/app/opportunities/${opp.id}`}>
              <Card className="transition-shadow hover:shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      {opp.project_name}
                    </CardTitle>
                    <Badge variant="outline">{opp.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <div>
                      <dt className="font-medium">Contractor</dt>
                      <dd>{opp.contractor || "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Owner</dt>
                      <dd>{opp.owner || "—"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
