import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, FileType2, Image as ImageIcon, Music, PlayCircle, FileQuestion } from "lucide-react";
import { ViewerLayout } from "@/components/smartshare/ViewerLayout";
import { EmptyState } from "@/components/smartshare/EmptyState";
import { Button } from "@/components/ui/button";
import { detectKind, type ResourceKind } from "@/lib/file-type";

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

// Placeholder resource — real data will come from backend in v2.
const PLACEHOLDER_NAME = "Presentation_Q4_Review.pdf";

function ViewPage() {
  const { shareCode } = Route.useParams();
  const [kind, setKind] = useState<ResourceKind>(detectKind(PLACEHOLDER_NAME));

  return (
    <ViewerLayout resourceName={PLACEHOLDER_NAME}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-primary-soft px-3 py-1 font-mono font-semibold text-primary">
          {shareCode}
        </span>
        <span className="text-muted-foreground">Preview mode · UI placeholder</span>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-8">
        <ResourcePreview kind={kind} name={PLACEHOLDER_NAME} />
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Demo · Try preview types
        </p>
        <div className="flex flex-wrap gap-2">
          {(["image", "video", "pdf", "document", "audio", "unknown"] as ResourceKind[]).map(
            (k) => (
              <Button
                key={k}
                size="sm"
                variant={kind === k ? "default" : "outline"}
                onClick={() => setKind(k)}
                className="rounded-full capitalize"
              >
                {k}
              </Button>
            ),
          )}
        </div>
      </div>
    </ViewerLayout>
  );
}

function ResourcePreview({ kind, name }: { kind: ResourceKind; name: string }) {
  switch (kind) {
    case "image":
      return (
        <div className="grid aspect-video place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-secondary">
          <div className="flex flex-col items-center gap-3 text-primary">
            <ImageIcon className="h-16 w-16" />
            <p className="text-sm font-medium text-muted-foreground">Image preview</p>
          </div>
        </div>
      );
    case "video":
      return (
        <div className="relative grid aspect-video place-items-center rounded-2xl bg-foreground/90">
          <PlayCircle className="h-20 w-20 text-primary-foreground" strokeWidth={1.5} />
          <p className="absolute bottom-4 text-xs font-medium text-primary-foreground/70">
            Video preview
          </p>
        </div>
      );
    case "pdf":
      return (
        <div className="grid aspect-[3/4] max-h-[70vh] place-items-center rounded-2xl bg-muted sm:aspect-video">
          <div className="flex flex-col items-center gap-3 text-primary">
            <FileType2 className="h-16 w-16" />
            <p className="text-sm font-medium text-muted-foreground">PDF preview — {name}</p>
          </div>
        </div>
      );
    case "document":
      return (
        <div className="grid aspect-video place-items-center rounded-2xl bg-muted">
          <div className="flex flex-col items-center gap-3 text-primary">
            <FileText className="h-16 w-16" />
            <p className="text-sm font-medium text-muted-foreground">Document preview</p>
          </div>
        </div>
      );
    case "audio":
      return (
        <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-secondary py-16">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Music className="h-16 w-16" />
            <div className="h-2 w-64 rounded-full bg-card">
              <div className="h-full w-1/3 rounded-full bg-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Audio player</p>
          </div>
        </div>
      );
    default:
      return (
        <EmptyState
          icon={FileQuestion}
          title="Preview not available"
          description="This file type can't be previewed in the browser, but you can still download it."
        />
      );
  }
}
