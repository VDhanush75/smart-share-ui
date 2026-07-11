import { uploadResource, type UploadOptions } from "@/lib/upload";
import { generateShareCode } from "@/utils/shareCode";
import { getFileCategory } from "@/utils/fileCategory";
import { createResource, type ResourceRow } from "@/services/resourceService";

const EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function uploadAndRegisterFile(
  file: File,
  options: UploadOptions = {}
): Promise<ResourceRow> {
  const uploaded = await uploadResource(file, options);
  const share_code = generateShareCode();
  const file_type = getFileCategory(uploaded.mime_type);
  const expires_at = new Date(Date.now() + EXPIRY_MS).toISOString();

  return createResource({
    share_code,
    original_name: uploaded.original_name,
    storage_path: uploaded.storage_path,
    public_url: uploaded.public_url,
    file_type,
    mime_type: uploaded.mime_type,
    file_size: uploaded.file_size,
    expires_at,
  });
}
