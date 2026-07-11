import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DirectLinkCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
          <Link2 className="h-4 w-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Direct Link
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 truncate rounded-xl bg-muted px-4 py-3 font-mono text-sm text-foreground">
          {url}
        </div>
        <Button onClick={copy} variant="outline" size="lg" className="rounded-full sm:w-auto">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
