import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/smartshare/Logo";
import { ShareCodeCard } from "@/components/smartshare/ShareCodeCard";
import { QRCard } from "@/components/smartshare/QRCard";

const DEMO_CODE = "AB39KD";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "Upload Successful — SmartShare" },
      { name: "description", content: "Your file is ready to open on the Smart TV." },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/view/${DEMO_CODE}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft/40 via-background to-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success ring-8 ring-success/5">
            <CheckCircle2 className="h-12 w-12" strokeWidth={2.25} />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Upload Successful
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Your file is ready. Use the Share Code or scan the QR on your Smart TV.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ShareCodeCard code={DEMO_CODE} />
          <QRCard value={shareUrl} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link to="/">Upload Another</Link>
          </Button>
          <Button
            size="lg"
            className="rounded-full"
            onClick={() =>
              navigate({ to: "/view/$shareCode", params: { shareCode: DEMO_CODE } })
            }
          >
            Open Resource
          </Button>
        </div>
      </main>
    </div>
  );
}
