import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy code");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Share Code
      </p>
      <div className="mt-5 flex flex-col items-center gap-5">
        <div className="w-full rounded-2xl bg-primary-soft px-4 py-8 text-center">
          <p className="font-mono text-5xl font-bold tracking-[0.35em] text-primary sm:text-6xl">
            {code}
          </p>
        </div>
        <Button onClick={copy} variant="outline" size="lg" className="w-full rounded-full">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> Copy Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
