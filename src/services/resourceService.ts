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
  views?: number;
}

export async function createResource(input: CreateResourceInput): Promise<ResourceRow> {
  const { data, error } = await supabase
    .from("resources")
    .insert(input)
    .select()
    .single();

  if (error) {
    await supabase.storage.from(RESOURCES_BUCKET).remove([input.storage_path]);
    throw new Error(error.message);
  }

  return data as ResourceRow;
}

export async function getResourceByShareCode(
  shareCode: string,
): Promise<ResourceRow | null> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("share_code", shareCode)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ResourceRow | null) ?? null;
}

export async function incrementViews(resourceId: string): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("resources")
    .select("views")
    .eq("id", resourceId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  const current = (data as { views?: number } | null)?.views ?? 0;

  const { error } = await supabase
    .from("resources")
    .update({ views: current + 1 })
    .eq("id", resourceId);

  if (error) throw new Error(error.message);
}

export async function logResourceView(resourceId: string): Promise<void> {
  const { error } = await supabase
    .from("resource_views")
    .insert({ resource_id: resourceId });
  if (error) throw new Error(error.message);
}

export async function trackResourceView(resourceId: string): Promise<void> {
  await Promise.allSettled([incrementViews(resourceId), logResourceView(resourceId)]);
}

export async function incrementDownloads(resourceId: string): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("resources")
    .select("downloads")
    .eq("id", resourceId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  const current = (data as { downloads?: number } | null)?.downloads ?? 0;

  const { error } = await supabase
    .from("resources")
    .update({ downloads: current + 1 })
    .eq("id", resourceId);

  if (error) throw new Error(error.message);
}

export async function logResourceDownload(resourceId: string): Promise<void> {
  const { error } = await supabase
    .from("resource_downloads")
    .insert({ resource_id: resourceId });
  if (error) throw new Error(error.message);
}

export async function downloadResource(resource: {
  id: string;
  public_url: string;
  original_name: string;
}): Promise<void> {
  const response = await fetch(resource.public_url);
  if (!response.ok) {
    throw new Error(`Failed to download file (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = resource.original_name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  await Promise.allSettled([
    incrementDownloads(resource.id),
    logResourceDownload(resource.id),
  ]);
}

export async function fetchTextPreview(url: string, maxBytes = 100_000): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch text (${res.status})`);
  const text = await res.text();
  return text.length > maxBytes ? text.slice(0, maxBytes) + "\n\n… (truncated)" : text;
}
