import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Download as DownloadIcon,
  Eye,
  FileArchive,
  FileClock,
  FolderOpen,
  LayoutDashboard,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { authService } from "@/services/authService";
import {
  deleteResource,
  getAllUploads,
  getDashboardStats,
  getRecentUploads,
  type DashboardStats,
} from "@/services/dashboardService";
import type { ResourceRow } from "@/services/resourceService";

import { Sidebar, type DashboardView } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentUploadsTable } from "@/components/dashboard/RecentUploadsTable";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { EmptyState } from "@/components/smartshare/EmptyState";

export const Route = createFileRoute("/administrator/")({
  head: () => ({
    meta: [
      { title: "Administrator Dashboard — SmartShare" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdministratorPage,
});

function AdministratorPage() {
  return (
    <ProtectedRoute>
      <DashboardShell />
    </ProtectedRoute>
  );
}

function DashboardShell() {
  const navigate = useNavigate();
  const [view, setView] = useState<DashboardView>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<ResourceRow[]>([]);
  const [all, setAll] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [target, setTarget] = useState<ResourceRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [s, r, a] = await Promise.all([
        getDashboardStats(),
        getRecentUploads(10),
        getAllUploads(),
      ]);
      setStats(s);
      setRecent(r);
      setAll(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
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

  async function handleConfirmDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteResource(target.id, target.storage_path);
      toast.success("Resource deleted");
      setTarget(null);
      await load(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const title = view === "dashboard" ? "Dashboard" : "Resources";
  const subtitle =
    view === "dashboard" ? "Overview of shared resources" : "Manage all uploaded resources";

  const tableRows = view === "dashboard" ? recent : all;

  const statCards = useMemo(
    () => [
      { label: "Total Uploads", value: stats?.totalUploads ?? 0, icon: Upload, accent: "bg-primary-soft text-primary" },
      { label: "Active Resources", value: stats?.activeResources ?? 0, icon: Activity, accent: "bg-emerald-500/10 text-emerald-600" },
      { label: "Expired Resources", value: stats?.expiredResources ?? 0, icon: FileClock, accent: "bg-amber-500/10 text-amber-600" },
      { label: "Total Views", value: stats?.totalViews ?? 0, icon: Eye, accent: "bg-sky-500/10 text-sky-600" },
      { label: "Total Downloads", value: stats?.totalDownloads ?? 0, icon: DownloadIcon, accent: "bg-violet-500/10 text-violet-600" },
    ],
    [stats],
  );

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      <Sidebar
        active={view}
        onSelectView={(v) => setView(v)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          onRefresh={() => void load(true)}
          refreshing={refreshing}
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          {view === "dashboard" && (
            <section>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {statCards.map((s) => (
                  <StatCard key={s.label} {...s} loading={loading} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              {view === "dashboard" ? (
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              )}
              <h2 className="text-base font-semibold text-foreground">
                {view === "dashboard" ? "Recent Uploads" : "All Resources"}
              </h2>
              <span className="text-xs text-muted-foreground">({tableRows.length})</span>
            </div>

            {loading ? (
              <LoadingState rows={6} />
            ) : tableRows.length === 0 ? (
              <EmptyState
                icon={FileArchive}
                title="No resources yet"
                description="Uploads will appear here as soon as users share files."
              />
            ) : (
              <RecentUploadsTable rows={tableRows} onDelete={setTarget} />
            )}
          </section>
        </main>
      </div>

      <ConfirmDeleteDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        fileName={target?.original_name}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
