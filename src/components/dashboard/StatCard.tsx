import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent = "bg-primary-soft text-primary", loading }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1 truncate text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
