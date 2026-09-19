import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabaseAdmin.ts";

interface HistoryRequest {
  timestamp: string; // ISO8601
}

// Section 6 — reconstructs constitution version, latest attack/blocklist
// state, and most recent decision/bargaining state as of a given instant.
// A frontend-only equivalent also exists in src/lib/lab/api.ts
// (fetchHistoryAt) so the Time-Travel Debugger works even before this
// function is deployed; this server copy exists for parity / future
// server-side aggregation.
Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { timestamp } = (await req.json()) as HistoryRequest;
    const supabase = getServiceClient();

    const [constitutionRes, attackRes, decisionRes, amendmentRes] = await Promise.all([
      supabase
        .from("lab_constitutions")
        .select("*")
        .lte("effective_from", timestamp)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("lab_attack_log")
        .select("*")
        .lte("created_at", timestamp)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("lab_decisions")
        .select("*")
        .lte("created_at", timestamp)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("lab_amendment_proposals")
        .select("*")
        .lte("created_at", timestamp)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return jsonResponse({
      constitution: constitutionRes.data ?? null,
      attackLogEntry: attackRes.data ?? null,
      blocklistVersion: attackRes.data?.blocklist_version_after ?? 1,
      decision: decisionRes.data ?? null,
      amendment: amendmentRes.data ?? null,
    });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
