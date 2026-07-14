import { LayoutDashboard, FolderOpen, LogOut, X } from "lucide-react";
import { Logo } from "@/components/smartshare/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardView = "dashboard" | "resources";

interface SidebarProps {
  active: DashboardView;
  onChange: (view: DashboardView) => void;
  onLogout: () => void;
  loggingOut?: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const items: { id: DashboardView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "resources", label: "Resources", icon: FolderOpen },
];

export function Sidebar({ active, onChange, onLogout, loggingOut, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Logo to="/administrator" />
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.id);
                  onMobileClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onLogout}
            disabled={loggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loggingOut ? "Signing out…" : "Logout"}
          </Button>
        </div>
      </aside>
    </>
  );
}
