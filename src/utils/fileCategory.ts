export type FileCategory = "image" | "video" | "document" | "audio" | "other";

const DOCUMENT_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
]);

export function getFileCategory(mimeType: string): FileCategory {
  const mime = (mimeType || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (DOCUMENT_MIMES.has(mime) || mime.includes("word") || mime.includes("excel") ||
      mime.includes("spreadsheet") || mime.includes("presentation") ||
      mime.includes("powerpoint") || mime.startsWith("text/")) {
    return "document";
  }
  return "other";
}
