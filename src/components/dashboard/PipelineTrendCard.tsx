import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// Dummy trend data -- swap for a real /opportunities time-series once that endpoint exists.
const pipelineTrend = [
  { week: "W1", opportunities: 4 },
  { week: "W2", opportunities: 6 },
  { week: "W3", opportunities: 5 },
  { week: "W4", opportunities: 8 },
  { week: "W5", opportunities: 7 },
  { week: "W6", opportunities: 11 },
  { week: "W7", opportunities: 9 },
  { week: "W8", opportunities: 13 },
];

export function PipelineTrendCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" />
          Pipeline Trend — Last 8 Weeks
        </CardTitle>
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          +44% growth
        </span>
      </CardHeader>
      <CardContent className="h-[160px] pl-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pipelineTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pipelineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
              labelFormatter={(label) => `Week ${label}`}
              formatter={(value: number) => [`${value} opportunities`, ""]}
            />
            <Area
              type="monotone"
              dataKey="opportunities"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#pipelineFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
