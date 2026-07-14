import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/administrator")({
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
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Administrator Dashboard</CardTitle>
            <CardDescription>You are signed in as the administrator.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out…
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
