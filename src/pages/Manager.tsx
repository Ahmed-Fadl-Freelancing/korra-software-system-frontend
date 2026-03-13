import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FolderOpen, CheckCircle } from "lucide-react";

const stats = [
  { label: "Total Opportunities", value: "—", icon: FolderOpen },
  { label: "Active Tasks", value: "—", icon: CheckCircle },
  { label: "Team Members", value: "—", icon: Users },
  { label: "Completion Rate", value: "—", icon: BarChart3 },
];

export default function Manager() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Manager Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Dashboard data will be populated from Django API / Edge Functions.
      </p>
    </div>
  );
}
