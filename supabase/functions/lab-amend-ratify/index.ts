import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabaseAdmin.ts";

interface RatifyRequest {
  amendmentId?: string; // ratify a pending AI-proposed amendment
  version?: number; // ratify a manually-drafted constitution version
}

// Section 3b/3c — the ONE gate through which any constitution change
// becomes live. Used by both the manual amendment path and the AI-proposed
// amendment path — never auto-applied by either.
Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { amendmentId, version } = (await req.json()) as RatifyRequest;
    const supabase = getServiceClient();

    let versionToActivate = version;

    if (amendmentId) {
      const { data: proposal, error: proposalError } = await supabase
        .from("lab_amendment_proposals")
        .select("*")
        .eq("id", amendmentId)
        .single();
      if (proposalError) throw proposalError;

      const { data: pointer } = await supabase
        .from("lab_constitution_pointer")
        .select("current_version")
        .eq("id", 1)
        .single();
      const { data: current } = await supabase
        .from("lab_constitutions")
        .select("version")
        .eq("version", pointer.current_version)
        .single();

      const nextVersion = current.version + 1;
      const { error: insertError } = await supabase.from("lab_constitutions").insert({
        version: nextVersion,
        rules: proposal.proposed_rules,
        ratified_by: "human",
        diff_from_previous: proposal.justification,
        source: "ai_proposed_amendment",
      });
      if (insertError) throw insertError;

      await supabase
        .from("lab_amendment_proposals")
        .update({ status: "ratified", resulting_version: nextVersion, resolved_at: new Date().toISOString() })
        .eq("id", amendmentId);

      versionToActivate = nextVersion;
    }

    if (!versionToActivate) {
      return jsonResponse({ error: "Nothing to ratify: provide amendmentId or version." }, 400);
    }

    const { error: pointerError } = await supabase
      .from("lab_constitution_pointer")
      .update({ current_version: versionToActivate, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (pointerError) throw pointerError;

    return jsonResponse({ current_version: versionToActivate });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
