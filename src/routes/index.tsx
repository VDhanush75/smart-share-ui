import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Tv, Zap, Shield, Smartphone, FileText, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/smartshare/Logo";
import { UploadArea } from "@/components/smartshare/UploadArea";
import { ProgressBar } from "@/components/smartshare/ProgressBar";
import { OpenResourceCard } from "@/components/smartshare/OpenResourceCard";
import { uploadAndRegisterFile } from "@/services/uploadService";
import { createTextResource, SUPPORTED_LANGUAGES } from "@/services/textService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartShare — Share Files, Text & Code Instantly" },
      {
        name: "description",
        content: "Share any file, text note, or code snippet across devices with a temporary share code or QR.",
      },
      { property: "og:title", content: "SmartShare — Share Files, Text & Code Instantly" },
      {
        property: "og:description",
        content: "Share any file, text note, or code snippet across devices with a temporary share code or QR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type Mode = "file" | "text";

function HomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("file");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Text state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<string>("text");
  const [submittingText, setSubmittingText] = useState(false);

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

  const submitText = async () => {
    if (submittingText) return;
    if (!content.trim()) {
      toast.error("Please enter some text or code to share");
      return;
    }
    setSubmittingText(true);
    try {
      const resource = await createTextResource({ title, content, language });
      toast.success("Snippet shared");
      navigate({
        to: "/success",
        state: {
          share_code: resource.share_code,
          public_url: null,
          original_name: resource.original_name,
        } as never,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to share snippet";
      console.error("Text share error:", err);
      toast.error(message);
    } finally {
      setSubmittingText(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft/40 via-background to-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
          <Tv className="h-3.5 w-3.5 text-primary" /> Device-ready
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-12">
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Instant sharing
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Share Files, Text & Code{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Upload a file or paste text and code. Open it on any device with the Share Code or QR.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-elevated)] sm:mt-12 sm:p-8">
          <div className="mb-6 inline-flex w-full rounded-full bg-muted p-1 sm:w-auto">
            <ModeTab active={mode === "file"} onClick={() => setMode("file")} icon={UploadIcon} label="File" />
            <ModeTab active={mode === "text"} onClick={() => setMode("text")} icon={FileText} label="Text / Code" />
          </div>

          {mode === "file" ? (
            <>
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
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                <div className="space-y-2">
                  <Label htmlFor="snippet-title">Title (optional)</Label>
                  <Input
                    id="snippet-title"
                    placeholder="e.g. React auth hook"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    disabled={submittingText}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={submittingText}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="snippet-content">Content</Label>
                <Textarea
                  id="snippet-content"
                  placeholder="Paste your text or code here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={submittingText}
                  className="min-h-[220px] rounded-2xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {content.length.toLocaleString()} characters
                </p>
              </div>
              <Button
                size="lg"
                disabled={submittingText || !content.trim()}
                onClick={submitText}
                className="h-12 w-full rounded-full text-base font-semibold shadow-[var(--shadow-soft)]"
              >
                {submittingText ? "Sharing…" : "Share Snippet"}
              </Button>
            </div>
          )}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Fast", desc: "Instant sharing in seconds" },
            { icon: Smartphone, title: "Any Device", desc: "Works on any Device browser" },
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

        <OpenResourceCard />
      </main>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-6",
        active
          ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
