import { QrCode } from "lucide-react";

export function QRCard({ value }: { value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        QR Code
      </p>
      <div className="mt-4 flex flex-col items-center gap-4">
        <div className="grid h-52 w-52 place-items-center rounded-2xl bg-primary-soft">
          {/* Placeholder QR — real QR generation comes with backend */}
          <div className="relative grid h-40 w-40 grid-cols-8 grid-rows-8 gap-[2px] rounded-lg bg-card p-2">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-[1px] ${
                  (i * 7 + (i % 5)) % 3 === 0 ? "bg-foreground" : "bg-transparent"
                }`}
              />
            ))}
            <div className="absolute inset-0 grid place-items-center">
              <div className="rounded-lg bg-card p-2">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
        <p className="max-w-xs text-center text-xs text-muted-foreground">
          Scan this QR or enter the Share Code on the Smart TV.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/70">{value}</p>
      </div>
    </div>
  );
}
