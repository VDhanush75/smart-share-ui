import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Tv, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/smartshare/Logo";
import { UploadArea } from "@/components/smartshare/UploadArea";
import { ProgressBar } from "@/components/smartshare/ProgressBar";
import { uploadAndRegisterFile } from "@/services/uploadService";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartShare — Temporary Anonymous File Sharing Instantly" },
      {
        name: "description",
        content: "Upload any file from any device. and Access it from any device using the Share Code or QR Code.",
      },
      {
        property: "og:title",
        content: "SmartShare — Share files Instantly between any devices using a temporary code.",
      },
      {
        property: "og:description",
        content: "Upload any file from any device. and Access it from any device using the Share Code or QR Code.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setProgress(0);
    try {
      const resource = await uploadAndRegisterFile(file, { onProgress: setProgress });
      toast.success("Upload complete");
      navigate({
        to: "/success",
        state: {
          share_code: resource.share_code,
          public_url: resource.public_url,
          original_name: resource.original_name,
        } as never,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft/40 via-background to-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
          <Tv className="h-3.5 w-3.5 text-primary" /> TV-ready
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-12">
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Instant sharing
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Share Files to Instantly{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Upload any file from any device. and Access it from any device using the Share Code or QR Code.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-elevated)] sm:mt-12 sm:p-8">
          <UploadArea file={file} onFileChange={setFile} maxSizeMB={50} disabled={uploading} />

          <div className="mt-6 space-y-4">
            {uploading && <ProgressBar value={progress} label="Uploading to SmartShare..." />}
            <Button
              size="lg"
              disabled={!file || uploading}
              onClick={startUpload}
              className="h-12 w-full rounded-full text-base font-semibold shadow-[var(--shadow-soft)]"
            >
              {uploading ? `Uploading ${progress}%` : "Upload"}
            </Button>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Fast", desc: "Instant sharing in seconds" },
            { icon: Tv, title: "Any TV", desc: "Works on any Smart TV browser" },
            { icon: Shield, title: "Private", desc: "Code-protected access" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card/60 p-4 text-center backdrop-blur">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
