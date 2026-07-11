import { supabase } from "@/lib/supabase";
import { RESOURCES_BUCKET } from "@/lib/upload";
import type { FileCategory } from "@/utils/fileCategory";

export interface CreateResourceInput {
  share_code: string;
  original_name: string;
  storage_path: string;
  public_url: string;
  file_type: FileCategory;
  mime_type: string;
  file_size: number;
  expires_at: string;
}

export interface ResourceRow extends CreateResourceInput {
  id: string;
  created_at: string;
}

export async function createResource(input: CreateResourceInput): Promise<ResourceRow> {
  const { data, error } = await supabase
    .from("resources")
    .insert(input)
    .select()
    .single();

  if (error) {
    // Clean up orphan storage file
    await supabase.storage.from(RESOURCES_BUCKET).remove([input.storage_path]);
    throw new Error(error.message);
  }

  return data as ResourceRow;
}
