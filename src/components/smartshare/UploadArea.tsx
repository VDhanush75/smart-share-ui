import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadAreaProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ACCEPTED =
  ".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.mp3,.wav,.txt";

export function UploadArea({ file, onFileChange, maxSizeMB = 50, disabled }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (f: File) => {
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB} MB limit.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (validate(f)) onFileChange(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !file && inputRef.current?.click()}
        className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:min-h-[260px] ${
          dragOver
            ? "border-primary bg-primary-soft"
            : "border-border bg-muted/40 hover:border-primary/50 hover:bg-primary-soft/50"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="flex w-full max-w-md items-center gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <FileIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground sm:text-lg">
                Drag & drop your file here
              </p>
              <p className="text-sm text-muted-foreground">or click to browse from your device</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="rounded-full"
            >
              Choose File
            </Button>
          </>
        )}
      </div>

      <div className="space-y-1 px-1 text-center">
        <p className="text-xs text-muted-foreground">
          Supported: Images, Videos, PDF, PPT, Word, Excel, Audio and other documents
        </p>
        <p className="text-xs font-medium text-muted-foreground">Maximum size: {maxSizeMB} MB</p>
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>
    </div>
  );
}
