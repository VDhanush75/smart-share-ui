import { supabase } from "@/lib/supabase";
import type { FileCategory } from "@/utils/fileCategory";

export interface DailyPoint {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Short label e.g. "Mon" */
  label: string;
  value: number;
}

export interface TopResource {
  id: string;
  original_name: string;
  share_code: string;
  file_type: FileCategory;
  views: number;
  downloads: number;
}

export interface TypeDistribution {
  type: FileCategory;
  count: number;
}

export interface AnalyticsSummary {
  uploads7d: DailyPoint[];
  views7d: DailyPoint[];
  downloads7d: DailyPoint[];
  topViewed: TopResource[];
  topDownloaded: TopResource[];
  distribution: TypeDistribution[];
}

type ResourceRecord = {
  id: string;
  original_name: string;
  share_code: string;
  file_type: FileCategory;
  views: number | null;
  downloads: number | null;
  created_at: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function last7Days(): { date: string; label: string; key: string }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const out: { date: string; label: string; key: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, label: DAY_LABELS[d.getDay()], key });
  }
  return out;
}

function toDayKey(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

async function fetchResourcesInWindow(days: number): Promise<ResourceRecord[]> {
  const since = new Date(Date.now() - (days - 1) * DAY_MS);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("resources")
    .select("id, original_name, share_code, file_type, views, downloads, created_at")
    .gte("created_at", since.toISOString());

  if (error) throw new Error(error.message);
  return (data ?? []) as ResourceRecord[];
}

export async function getWeeklyTrends(): Promise<{
  uploads: DailyPoint[];
  views: DailyPoint[];
  downloads: DailyPoint[];
}> {
  const rows = await fetchResourcesInWindow(7);
  const days = last7Days();

  const uploads = new Map<string, number>();
  const views = new Map<string, number>();
  const downloads = new Map<string, number>();
  for (const d of days) {
    uploads.set(d.key, 0);
    views.set(d.key, 0);
    downloads.set(d.key, 0);
  }

  for (const r of rows) {
    const key = toDayKey(r.created_at);
    if (!uploads.has(key)) continue;
    uploads.set(key, (uploads.get(key) ?? 0) + 1);
    views.set(key, (views.get(key) ?? 0) + (r.views ?? 0));
    downloads.set(key, (downloads.get(key) ?? 0) + (r.downloads ?? 0));
  }

  const build = (m: Map<string, number>): DailyPoint[] =>
    days.map((d) => ({ date: d.date, label: d.label, value: m.get(d.key) ?? 0 }));

  return { uploads: build(uploads), views: build(views), downloads: build(downloads) };
}

export async function getTopViewed(limit = 10): Promise<TopResource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("id, original_name, share_code, file_type, views, downloads")
    .order("views", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as ResourceRecord[]).map((r) => ({
    id: r.id,
    original_name: r.original_name,
    share_code: r.share_code,
    file_type: r.file_type,
    views: r.views ?? 0,
    downloads: r.downloads ?? 0,
  }));
}

export async function getTopDownloaded(limit = 10): Promise<TopResource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("id, original_name, share_code, file_type, views, downloads")
    .order("downloads", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as ResourceRecord[]).map((r) => ({
    id: r.id,
    original_name: r.original_name,
    share_code: r.share_code,
    file_type: r.file_type,
    views: r.views ?? 0,
    downloads: r.downloads ?? 0,
  }));
}

export async function getTypeDistribution(): Promise<TypeDistribution[]> {
  const { data, error } = await supabase.from("resources").select("file_type");
  if (error) throw new Error(error.message);

  const counts = new Map<FileCategory, number>();
  for (const row of (data ?? []) as { file_type: FileCategory }[]) {
    counts.set(row.file_type, (counts.get(row.file_type) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [trends, topViewed, topDownloaded, distribution] = await Promise.all([
    getWeeklyTrends(),
    getTopViewed(10),
    getTopDownloaded(10),
    getTypeDistribution(),
  ]);
  return {
    uploads7d: trends.uploads,
    views7d: trends.views,
    downloads7d: trends.downloads,
    topViewed,
    topDownloaded,
    distribution,
  };
}
