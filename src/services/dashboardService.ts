import { supabase } from "@/lib/supabase";
import { RESOURCES_BUCKET } from "@/lib/upload";
import type { ResourceRow } from "./resourceService";

export interface DashboardStats {
  totalUploads: number;
  activeResources: number;
  expiredResources: number;
  totalViews: number;
  totalDownloads: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const nowIso = new Date().toISOString();

  const [totalRes, activeRes, expiredRes, sumsRes] = await Promise.all([
    supabase.from("resources").select("*", { count: "exact", head: true }),
    supabase
      .from("resources")
      .select("*", { count: "exact", head: true })
      .gt("expires_at", nowIso),
    supabase
      .from("resources")
      .select("*", { count: "exact", head: true })
      .lte("expires_at", nowIso),
    supabase.from("resources").select("views, downloads"),
  ]);

  if (totalRes.error) throw new Error(totalRes.error.message);
  if (activeRes.error) throw new Error(activeRes.error.message);
  if (expiredRes.error) throw new Error(expiredRes.error.message);
  if (sumsRes.error) throw new Error(sumsRes.error.message);

  const rows = (sumsRes.data ?? []) as Array<{ views?: number | null; downloads?: number | null }>;
  const totalViews = rows.reduce((acc, r) => acc + (r.views ?? 0), 0);
  const totalDownloads = rows.reduce((acc, r) => acc + (r.downloads ?? 0), 0);

  return {
    totalUploads: totalRes.count ?? 0,
    activeResources: activeRes.count ?? 0,
    expiredResources: expiredRes.count ?? 0,
    totalViews,
    totalDownloads,
  };
}

export async function getRecentUploads(limit = 10): Promise<ResourceRow[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as ResourceRow[];
}

export async function getAllUploads(): Promise<ResourceRow[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ResourceRow[];
}

export async function deleteResource(id: string, storagePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(RESOURCES_BUCKET)
    .remove([storagePath]);
  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
