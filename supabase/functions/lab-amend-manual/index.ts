import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabaseAdmin.ts";

interface AmendManualRequest {
  proposedRules: {
    max_amount: number;
    requires_approval_above: number;
    variance_tolerance: number;
    strict_mode: boolean;
  };
}

function diffRules(
  before: AmendManualRequest["proposedRules"],
  after: AmendManualRequest["proposedRules"],
): string {
  const changes: string[] = [];
  for (const key of Object.keys(after) as (keyof typeof after)[]) {
    if (before[key] !== after[key]) {
      changes.push(`${key}: ${before[key]} -> ${after[key]}`);
    }
  }
  return changes.length > 0 ? changes.join(", ") : "No changes.";
}

// Section 3b — drafts a NEW constitution version row but does NOT flip
// current_version. That only happens via lab-amend-ratify. This enforces
// the "diff-then-ratify" flow instead of a silent config mutation.
Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { proposedRules } = (await req.json()) as AmendManualRequest;
    const supabase = getServiceClient();

    const { data: pointer } = await supabase
      .from("lab_constitution_pointer")
      .select("current_version")
      .eq("id", 1)
      .single();

    const { data: current, error: currentError } = await supabase
      .from("lab_constitutions")
      .select("*")
      .eq("version", pointer.current_version)
      .single();
    if (currentError) throw currentError;

    const nextVersion = current.version + 1;
    const diff = diffRules(current.rules, proposedRules);

    const { data: draft, error: draftError } = await supabase
      .from("lab_constitutions")
      .insert({
        version: nextVersion,
        rules: proposedRules,
        ratified_by: "human",
        diff_from_previous: `v${current.version} -> v${nextVersion}: ${diff}`,
        source: "manual_amendment",
      })
      .select()
      .single();
    if (draftError) throw draftError;

    return jsonResponse({ draftVersion: draft });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
