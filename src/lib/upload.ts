import { supabase } from "./supabase";

export const RESOURCES_BUCKET = "resources";

export type FileCategory = "images" | "videos" | "documents" | "audio" | "others";

export function getCategory(file: File): FileCategory {
  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (mime.startsWith("image/")) return "images";
  if (mime.startsWith("video/")) return "videos";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime === "application/pdf" ||
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("spreadsheet") ||
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    mime === "text/plain"
  ) {
    return "documents";
  }

  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic"].includes(ext)) return "images";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "videos";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "audio";
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "rtf"].includes(ext))
    return "documents";

  return "others";
}

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildUniquePath(file: File) {
  const category = getCategory(file);
  const dot = file.name.lastIndexOf(".");
  const base = dot > 0 ? file.name.slice(0, dot) : file.name;
  const ext = dot > 0 ? file.name.slice(dot + 1) : "";
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const filename = `${sanitizeName(base).slice(0, 60)}-${unique}${ext ? "." + ext : ""}`;
  return `${category}/${filename}`;
}

export interface UploadResult {
  original_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size: number;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export async function uploadResource(
  file: File,
  { onProgress, signal }: UploadOptions = {}
): Promise<UploadResult> {
  const storage_path = buildUniquePath(file);
  const mime_type = file.type || "application/octet-stream";

  onProgress?.(0);

  // supabase-js v2 doesn't expose progress; simulate smooth progress until upload resolves
  let simulated = 0;
  const tick = setInterval(() => {
    simulated = Math.min(90, simulated + Math.random() * 8 + 4);
    onProgress?.(Math.floor(simulated));
  }, 200);

  try {
    const { error } = await supabase.storage
      .from(RESOURCES_BUCKET)
      .upload(storage_path, file, {
        contentType: mime_type,
        cacheControl: "3600",
        upsert: false,
      });

    if (signal?.aborted) throw new Error("Upload aborted");
    if (error) throw error;

    const { data } = supabase.storage.from(RESOURCES_BUCKET).getPublicUrl(storage_path);

    onProgress?.(100);

    return {
      original_name: file.name,
      storage_path,
      public_url: data.publicUrl,
      mime_type,
      file_size: file.size,
    };
  } finally {
    clearInterval(tick);
  }
}
