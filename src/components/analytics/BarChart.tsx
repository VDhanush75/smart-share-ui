import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyPoint } from "@/services/analyticsService";

interface BarChartProps {
  title: string;
  data: DailyPoint[];
  accent?: string;
}

export function BarChart({ title, data, accent = "bg-primary" }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">Total: {total}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-2">
          {data.map((d) => {
            const pct = (d.value / max) * 100;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex h-full w-full items-end">
                  <div
                    className={`w-full rounded-t-md ${accent} transition-all`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    title={`${d.label}: ${d.value}`}
                  />
                </div>
                <div className="text-[10px] font-medium text-muted-foreground">{d.label}</div>
                <div className="text-[11px] font-semibold text-foreground">{d.value}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
