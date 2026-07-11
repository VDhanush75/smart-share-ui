// Supabase Edge Function: cleanup-expired-resources
// Deletes expired resources from Storage and the `resources` table.
//
// Deploy:
//   supabase functions deploy cleanup-expired-resources --no-verify-jwt
//
// Invoke (manual, not scheduled yet):
//   curl -X POST "$SUPABASE_URL/functions/v1/cleanup-expired-resources" \
//        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

// @ts-ignore - Deno remote import (runs in Supabase Edge runtime)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Deno remote import
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const RESOURCES_BUCKET = "resources";
const RESOURCES_TABLE = "resources";

interface ExpiredRow {
  id: string;
  storage_path: string;
  expires_at: string;
}

interface CleanupSummary {
  checked: number;
  deleted: number;
  failed: number;
  errors: string[];
}

function getAdminClient(): SupabaseClient {
  // @ts-ignore - Deno global
  const url = Deno.env.get("SUPABASE_URL");
  // @ts-ignore - Deno global
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchExpiredResources(supabase: SupabaseClient): Promise<ExpiredRow[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from(RESOURCES_TABLE)
    .select("id, storage_path, expires_at")
    .lt("expires_at", nowIso);

  if (error) throw new Error(`Failed to query expired resources: ${error.message}`);
  return (data ?? []) as ExpiredRow[];
}

async function deleteStorageFile(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage.from(RESOURCES_BUCKET).remove([storagePath]);
  if (error) throw new Error(`Storage delete failed for ${storagePath}: ${error.message}`);
}

async function deleteResourceRow(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from(RESOURCES_TABLE).delete().eq("id", id);
  if (error) throw new Error(`DB delete failed for row ${id}: ${error.message}`);
}

async function cleanupExpiredResources(): Promise<CleanupSummary> {
  const supabase = getAdminClient();
  const summary: CleanupSummary = { checked: 0, deleted: 0, failed: 0, errors: [] };

  const expired = await fetchExpiredResources(supabase);
  summary.checked = expired.length;
  console.log(`[cleanup] Found ${expired.length} expired resource(s).`);

  for (const row of expired) {
    try {
      await deleteStorageFile(supabase, row.storage_path);
      console.log(`[cleanup] Deleted file: ${row.storage_path}`);

      await deleteResourceRow(supabase, row.id);
      console.log(`[cleanup] Deleted DB row: ${row.id}`);

      summary.deleted += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.failed += 1;
      summary.errors.push(message);
      console.error(`[cleanup] ${message}`);
    }
  }

  console.log(
    `[cleanup] Summary — checked: ${summary.checked}, deleted: ${summary.deleted}, failed: ${summary.failed}`,
  );
  return summary;
}

serve(async () => {
  try {
    const summary = await cleanupExpiredResources();
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cleanup] Fatal: ${message}`);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
