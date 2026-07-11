import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OpenResourceCard() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const trimmed = code.trim();
  const disabled = trimmed.length === 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    navigate({ to: "/view/$shareCode", params: { shareCode: trimmed } });
  };

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Open Shared Resource</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-character Share Code to access a shared resource.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          maxLength={6}
          placeholder="ABC123"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Share Code"
          className="h-12 flex-1 rounded-full text-center font-mono text-lg font-semibold tracking-[0.35em] uppercase"
        />
        <Button
          type="submit"
          size="lg"
          disabled={disabled}
          className="h-12 rounded-full text-base font-semibold"
        >
          Open Resource
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
