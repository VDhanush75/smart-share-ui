import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileQuestion, Loader2, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ViewerLayout } from "@/components/smartshare/ViewerLayout";
import { EmptyState } from "@/components/smartshare/EmptyState";
import { Button } from "@/components/ui/button";
import {
  getResourceByShareCode,
  trackResourceView,
  fetchTextPreview,
  downloadResource,
  trackResourceDownload,
  type ResourceRow,
} from "@/services/resourceService";
import { toast } from "sonner";

export const Route = createFileRoute("/view/$shareCode")({
  head: () => ({
    meta: [
      { title: "Resource Viewer — SmartShare" },
      { name: "description", content: "View a shared file, text, or code snippet on any device." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ViewPage,
});

type Status = "loading" | "not_found" | "expired" | "ready" | "error";

function ViewPage() {
  const { shareCode } = Route.useParams();
  const [status, setStatus] = useState<Status>("loading");
  const [resource, setResource] = useState<ResourceRow | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const res = await getResourceByShareCode(shareCode);
        if (cancelled) return;
        if (!res) {
          setStatus("not_found");
          return;
        }
        if (new Date(res.expires_at).getTime() < Date.now()) {
          setResource(res);
          setStatus("expired");
          return;
        }
        setResource(res);
        setStatus("ready");
        trackResourceView(res.id).catch(() => {});
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : "Failed to load resource");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareCode]);

  const [downloading, setDownloading] = useState(false);

  const isText = resource?.resource_type === "text";

  const handleDownload = async () => {
    if (!resource || downloading) return;
    setDownloading(true);
    try {
      if (isText) {
        const blob = new Blob([resource.text_content ?? ""], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = resource.original_name || `snippet-${shareCode}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        trackResourceDownload(resource.id).catch(() => {});
      } else if (resource.public_url) {
        await downloadResource({
          id: resource.id,
          public_url: resource.public_url,
          original_name: resource.original_name,
        });
      }
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloading(false);
    }
  };


  if (status === "loading") {
    return (
      <ViewerLayout resourceName="Loading…">
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ViewerLayout>
    );
  }

  if (status === "not_found") {
    return (
      <ViewerLayout resourceName="Not found">
        <EmptyState
          icon={FileQuestion}
          title="Resource not found"
          description={`No resource matches share code "${shareCode}".`}
        />
      </ViewerLayout>
    );
  }

  if (status === "expired") {
    return (
      <ViewerLayout resourceName={resource?.original_name ?? "Expired"}>
        <EmptyState
          icon={FileQuestion}
          title="This resource has expired."
          description="Shared resources are available for 24 hours. Ask the sender to upload it again."
        />
      </ViewerLayout>
    );
  }

  if (status === "error" || !resource) {
    return (
      <ViewerLayout resourceName="Error">
        <EmptyState
          icon={FileQuestion}
          title="Something went wrong"
          description={errorMsg || "Unable to load this resource."}
        />
      </ViewerLayout>
    );
  }

  return (
    <ViewerLayout resourceName={resource.original_name} onDownload={handleDownload}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-primary-soft px-3 py-1 font-mono font-semibold text-primary">
          {shareCode}
        </span>
        <span className="text-muted-foreground">
          Uploaded {formatDate(resource.created_at)}
          {resource.file_size ? ` · ${formatBytes(resource.file_size)}` : ""}
          {isText && resource.language ? ` · ${resource.language}` : ""}
        </span>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-8">
        <ResourcePreview resource={resource} onDownload={handleDownload} />
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <MetaRow label={isText ? "Title" : "File name"} value={resource.original_name} />
        <MetaRow
          label={isText ? "Language" : "File size"}
          value={isText ? (resource.language ?? "plain text") : formatBytes(resource.file_size)}
        />
        <MetaRow label="Uploaded" value={formatDate(resource.created_at)} />
        <MetaRow
          label="Type"
          value={isText ? "Text / Code snippet" : (resource.mime_type || resource.file_type)}
        />
      </div>
    </ViewerLayout>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ResourcePreview({
  resource,
  onDownload,
}: {
  resource: ResourceRow;
  onDownload: () => void;
}) {
  if (resource.resource_type === "text") {
    return <CodeSnippetPreview resource={resource} />;
  }

  const mime = resource.mime_type || "";
  const url = resource.public_url;

  if (!url) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Preview not available"
        description="This resource has no file attached."
      />
    );
  }

  if (mime.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={resource.original_name}
        className="mx-auto max-h-[70vh] w-auto rounded-2xl object-contain"
      />
    );
  }

  if (mime.startsWith("video/")) {
    return (
      <video
        src={url}
        controls
        className="mx-auto max-h-[70vh] w-full rounded-2xl bg-black"
      />
    );
  }

  if (mime.startsWith("audio/")) {
    return (
      <div className="py-8">
        <audio src={url} controls className="mx-auto w-full max-w-lg" />
      </div>
    );
  }

  if (mime === "application/pdf") {
    return (
      <iframe
        src={url}
        title={resource.original_name}
        className="h-[75vh] w-full rounded-2xl border border-border bg-muted"
      />
    );
  }

  if (mime.startsWith("text/") || mime === "application/json") {
    return <TextPreview url={url} onDownload={onDownload} />;
  }

  return (
    <EmptyState
      icon={FileQuestion}
      title="Preview not available"
      description="This file type can't be previewed in the browser, but you can still download it."
      action={
        <Button onClick={onDownload} className="rounded-full">
          Download file
        </Button>
      }
    />
  );
}

function CodeSnippetPreview({ resource }: { resource: ResourceRow }) {
  const [copied, setCopied] = useState(false);
  const content = resource.text_content ?? "";
  const language = (resource.language || "text").toLowerCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {language}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="rounded-full"
        >
          {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-border">
        <SyntaxHighlighter
          language={language}
          style={oneLight}
          showLineNumbers
          customStyle={{ margin: 0, padding: "1rem", fontSize: "0.85rem", background: "hsl(var(--muted))" }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function TextPreview({
  url,
  onDownload,
}: {
  url: string;
  onDownload: () => void;
}) {
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetchTextPreview(url)
      .then((t) => !cancelled && setText(t))
      .catch((e) => !cancelled && setErr(e instanceof Error ? e.message : "Failed to load text"));
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (err) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Couldn't load text preview"
        description={err}
        action={
          <Button onClick={onDownload} className="rounded-full">
            Download file
          </Button>
        }
      />
    );
  }

  if (text === null) {
    return (
      <div className="grid place-items-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-muted p-4 text-sm text-foreground">
      {text}
    </pre>
  );
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
