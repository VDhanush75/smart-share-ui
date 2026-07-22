import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";

interface ViewerLayoutProps {
  resourceName: string;
  onDownload?: () => void;
  children: ReactNode;
}

export function ViewerLayout({ resourceName, onDownload, children }: ViewerLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <h1 className="truncate text-center text-sm font-semibold text-foreground sm:text-base">
            {resourceName}
          </h1>
          <Button onClick={onDownload} size="sm" className="rounded-full">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
