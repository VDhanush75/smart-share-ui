import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HBarRow {
  key: string;
  label: string;
  value: number;
  secondary?: string;
}

interface HorizontalBarsProps {
  title: string;
  rows: HBarRow[];
  valueLabel?: string;
  accent?: string;
  emptyText?: string;
}

export function HorizontalBars({
  title,
  rows,
  valueLabel,
  accent = "bg-primary",
  emptyText = "No data yet",
}: HorizontalBarsProps) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => {
              const pct = (r.value / max) * 100;
              return (
                <li key={r.key} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground" title={r.label}>
                      {r.label}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {r.secondary ? `${r.secondary} · ` : ""}
                      <span className="font-semibold text-foreground">{r.value}</span>
                      {valueLabel ? ` ${valueLabel}` : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${accent} transition-all`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
