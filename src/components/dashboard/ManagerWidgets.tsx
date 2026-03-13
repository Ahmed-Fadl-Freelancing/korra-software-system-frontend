import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const teamWorkload = [
  { name: "Alice", tasks: 5 },
  { name: "Bob", tasks: 3 },
  { name: "Charlie", tasks: 8 },
  { name: "Diana", tasks: 2 },
];

const bottlenecks = [
  { project: "Highway Bridge Renovation", days: 12, status: "Waiting on verification" },
  { project: "Municipal Water Treatment", days: 8, status: "Pending pricing" },
];

export function ManagerWidgets() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Team Workload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamWorkload.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-sm">
                <span>{m.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-primary/20" style={{ width: `${m.tasks * 12}px` }}>
                    <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{m.tasks}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bottlenecks.map((b) => (
              <div key={b.project} className="space-y-1">
                <p className="text-sm font-medium">{b.project}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive">
                    {b.days} days
                  </Badge>
                  <span className="text-xs text-muted-foreground">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4 text-primary" />
            Quick Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["By Engineer", "By Status", "By Contractor", "Overdue", "High Priority"].map((f) => (
              <Button key={f} variant="outline" size="sm" className="text-xs">
                {f}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
