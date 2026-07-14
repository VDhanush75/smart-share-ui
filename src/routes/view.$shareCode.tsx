import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileQuestion, Loader2 } from "lucide-react";
import { ViewerLayout } from "@/components/smartshare/ViewerLayout";
import { EmptyState } from "@/components/smartshare/EmptyState";
import { Button } from "@/components/ui/button";
import {
  getResourceByShareCode,
  incrementViews,
  fetchTextPreview,
  downloadResource,
  type ResourceRow,
} from "@/services/resourceService";

export const Route = createFileRoute("/view/$shareCode")({
  head: () => ({
    meta: [
      { title: "Resource Viewer — SmartShare" },
      { name: "description", content: "View a shared file on your Smart TV." },
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
        incrementViews(res.id).catch(() => {
          /* non-critical */
        });
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

  const handleDownload = async () => {
    if (!resource || downloading) return;
    setDownloading(true);
    try {
      await downloadResource({
        id: resource.id,
        public_url: resource.public_url,
        original_name: resource.original_name,
      });
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
          Uploaded {formatDate(resource.created_at)} · {formatBytes(resource.file_size)}
        </span>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-8">
        <ResourcePreview resource={resource} onDownload={handleDownload} />
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <MetaRow label="File name" value={resource.original_name} />
        <MetaRow label="File size" value={formatBytes(resource.file_size)} />
        <MetaRow label="Uploaded" value={formatDate(resource.created_at)} />
        <MetaRow label="Type" value={resource.mime_type || resource.file_type} />
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
  const mime = resource.mime_type || "";

  if (mime.startsWith("image/")) {
    return (
      <img
        src={resource.public_url}
        alt={resource.original_name}
        className="mx-auto max-h-[70vh] w-auto rounded-2xl object-contain"
      />
    );
  }

  if (mime.startsWith("video/")) {
    return (
      <video
        src={resource.public_url}
        controls
        className="mx-auto max-h-[70vh] w-full rounded-2xl bg-black"
      />
    );
  }

  if (mime.startsWith("audio/")) {
    return (
      <div className="py-8">
        <audio src={resource.public_url} controls className="mx-auto w-full max-w-lg" />
      </div>
    );
  }

  if (mime === "application/pdf") {
    return (
      <iframe
        src={resource.public_url}
        title={resource.original_name}
        className="h-[75vh] w-full rounded-2xl border border-border bg-muted"
      />
    );
  }

  if (mime.startsWith("text/") || mime === "application/json") {
    return <TextPreview resource={resource} onDownload={onDownload} />;
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

function TextPreview({
  resource,
  onDownload,
}: {
  resource: ResourceRow;
  onDownload: () => void;
}) {
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetchTextPreview(resource.public_url)
      .then((t) => !cancelled && setText(t))
      .catch((e) => !cancelled && setErr(e instanceof Error ? e.message : "Failed to load text"));
    return () => {
      cancelled = true;
    };
  }, [resource.public_url]);

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

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
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
