import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { authService } from "@/services/authService";
import {
  getAnalyticsSummary,
  type AnalyticsSummary,
} from "@/services/analyticsService";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { BarChart } from "@/components/analytics/BarChart";
import { HorizontalBars } from "@/components/analytics/HorizontalBars";

export const Route = createFileRoute("/administrator/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SmartShare Administrator" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsShell />
    </ProtectedRoute>
  );
}

function AnalyticsShell() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const summary = await getAnalyticsSummary();
      setData(summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authService.logout();
      navigate({ to: "/admin/login", replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      <Sidebar
        active="analytics"
        onLogout={handleLogout}
        loggingOut={loggingOut}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Analytics"
          subtitle="Historical activity across the last 7 days"
          onMenuClick={() => setMobileOpen(true)}
          onRefresh={() => void load(true)}
          refreshing={refreshing}
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          {loading || !data ? (
            <LoadingState rows={6} />
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <BarChart title="Uploads · last 7 days" data={data.uploads7d} accent="bg-primary" />
                <BarChart title="Views · last 7 days" data={data.views7d} accent="bg-sky-500" />
                <BarChart
                  title="Downloads · last 7 days"
                  data={data.downloads7d}
                  accent="bg-violet-500"
                />
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <HorizontalBars
                  title="Top 10 most viewed"
                  valueLabel="views"
                  accent="bg-sky-500"
                  rows={data.topViewed.map((r) => ({
                    key: r.id,
                    label: r.original_name,
                    value: r.views,
                    secondary: r.share_code,
                  }))}
                />
                <HorizontalBars
                  title="Top 10 most downloaded"
                  valueLabel="downloads"
                  accent="bg-violet-500"
                  rows={data.topDownloaded.map((r) => ({
                    key: r.id,
                    label: r.original_name,
                    value: r.downloads,
                    secondary: r.share_code,
                  }))}
                />
              </section>

              <section>
                <HorizontalBars
                  title="Resource type distribution"
                  valueLabel="files"
                  accent="bg-emerald-500"
                  rows={data.distribution.map((d) => ({
                    key: d.type,
                    label: d.type.charAt(0).toUpperCase() + d.type.slice(1),
                    value: d.count,
                  }))}
                />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
