import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "@/services/authService";
import { LoadingSpinner } from "@/components/smartshare/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    let active = true;

    authService.getSession().then((session) => {
      if (!active) return;
      if (session) {
        setStatus("authed");
      } else {
        setStatus("unauthed");
        navigate({ to: "/admin/login", replace: true });
      }
    });

    const { data: sub } = authService.onAuthStateChange((session) => {
      if (!active) return;
      if (!session) {
        setStatus("unauthed");
        navigate({ to: "/admin/login", replace: true });
      } else {
        setStatus("authed");
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (status !== "authed") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
