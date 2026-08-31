import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "flat";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendDirection?: TrendDirection;
  className?: string;
}

const trendStyles: Record<TrendDirection, { icon: typeof TrendingUp; className: string }> = {
  up: { icon: TrendingUp, className: "text-emerald-600" },
  down: { icon: TrendingDown, className: "text-destructive" },
  flat: { icon: Minus, className: "text-muted-foreground" },
};

export function KpiCard({ label, value, icon: Icon, trend, trendDirection, className }: KpiCardProps) {
  const trendStyle = trendDirection ? trendStyles[trendDirection] : null;
  const TrendIcon = trendStyle?.icon;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={cn("flex items-center gap-1 text-xs", trendStyle?.className ?? "text-muted-foreground")}>
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
                {trend}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
