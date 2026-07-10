export type ResourceKind = "image" | "video" | "pdf" | "document" | "audio" | "unknown";

export function detectKind(name: string): ResourceKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt"].includes(ext)) return "document";
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
  return "unknown";
}
