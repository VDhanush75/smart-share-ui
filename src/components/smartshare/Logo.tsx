import { Link } from "@tanstack/react-router";
import { Share2 } from "lucide-react";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-soft)] group-hover:scale-105 transition-transform">
        <Share2 className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Smart<span className="text-primary">Share</span>
      </span>
    </Link>
  );
}
