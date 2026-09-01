import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";

// Dummy queue distribution -- swap for a real breakdown once /engineering/queue is wired up.
const queueByStatus = [
  { status: "Draft", count: 3 },
  { status: "In Review", count: 5 },
  { status: "Pending Pricing", count: 2 },
  { status: "Ready", count: 4 },
];

export function QueueByStatusCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-primary" />
          Queue by Status
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[160px] pl-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={queueByStatus} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "hsl(var(--primary) / 0.06)" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
