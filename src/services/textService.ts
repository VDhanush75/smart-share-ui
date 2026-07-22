import { createResource, type ResourceRow } from "@/services/resourceService";
import { generateShareCode } from "@/utils/shareCode";

const EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface CreateTextResourceInput {
  title: string;
  content: string;
  language: string;
}

export async function createTextResource(
  input: CreateTextResourceInput,
): Promise<ResourceRow> {
  const share_code = generateShareCode();
  const expires_at = new Date(Date.now() + EXPIRY_MS).toISOString();
  const title = input.title.trim() || `Snippet ${share_code}`;

  return createResource({
    share_code,
    original_name: title,
    storage_path: null,
    public_url: null,
    file_type: "document",
    mime_type: "text/plain",
    file_size: new Blob([input.content]).size,
    expires_at,
    resource_type: "text",
    text_content: input.content,
    language: input.language,
  });
}

export const SUPPORTED_LANGUAGES = [
  "text",
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "sql",
  "bash",
  "json",
  "yaml",
  "html",
  "css",
  "markdown",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
