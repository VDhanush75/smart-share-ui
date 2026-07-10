import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Share Code
      </p>
      <div className="mt-4 flex flex-col items-center gap-4">
        <div className="w-full rounded-xl bg-primary-soft px-4 py-5 text-center">
          <p className="font-mono text-4xl font-bold tracking-[0.35em] text-primary sm:text-5xl">
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
