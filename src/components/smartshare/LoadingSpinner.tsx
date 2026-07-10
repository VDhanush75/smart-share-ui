import { Loader2 } from "lucide-react";

export function LoadingSpinner({ size = 24, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
