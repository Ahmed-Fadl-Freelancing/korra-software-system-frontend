import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubOpportunities } from "@/lib/stub-data";
import { Opportunity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";

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
      <h1 className="text-xl font-semibold">Engineering Workbench</h1>
      <p className="text-sm text-muted-foreground">
        Opportunities requiring verification or model selection.
      </p>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((opp) => (
            <Link key={opp.id} to={`/app/opportunities/${opp.id}`}>
              <Card className="transition-shadow hover:shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    {opp.project_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{opp.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
