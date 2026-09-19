import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabaseAdmin.ts";
import { callLlm } from "../_shared/llm.ts";

const NEAR_MISS_COUNT = 3;
const NEAR_MISS_MARGIN_PCT = 5; // within 5% of the same cap

const AMENDMENT_JSON_SHAPE_HINT =
  "Respond ONLY with minified JSON having exactly two top-level keys: proposed_rules (an object with max_amount, requires_approval_above, variance_tolerance, strict_mode) and justification (a one-paragraph string citing the decisions).";

// Section 3c — the ONLY "history awareness" mechanism: a counter-based
// check for repeated near-miss disputes on the same rule clause. No
// separate precedent/RAG system per spec's explicit instruction.
Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const supabase = getServiceClient();

    const { data: pointer } = await supabase
      .from("lab_constitution_pointer")
      .select("current_version")
      .eq("id", 1)
      .single();
    const { data: constitution } = await supabase
      .from("lab_constitutions")
      .select("*")
      .eq("version", pointer.current_version)
      .single();

    const { data: recentDecisions, error } = await supabase
      .from("lab_decisions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(NEAR_MISS_COUNT);
    if (error) throw error;

    if (!recentDecisions || recentDecisions.length < NEAR_MISS_COUNT) {
      return jsonResponse({ triggered: false, reason: "Not enough decision history yet." });
    }

    const cap = constitution.rules.max_amount;
    const nearMisses = recentDecisions.filter((d) => {
      const marginPct = (Math.abs(d.amount - cap) / cap) * 100;
      return d.symbolic_verdict === "reject" && marginPct <= NEAR_MISS_MARGIN_PCT;
    });

    if (nearMisses.length < NEAR_MISS_COUNT) {
      return jsonResponse({ triggered: false, reason: "No repeated near-cap dispute pattern found." });
    }

    const citedIds = nearMisses.map((d) => d.id);
    const citedTitles = nearMisses.map((d) => `${d.title} ($${d.amount})`).join("; ");

    let proposedRules = { ...constitution.rules, max_amount: Math.round(cap * 1.1) };
    let justification = `Raised max_amount from $${cap} to $${proposedRules.max_amount} after ${nearMisses.length} repeated near-cap rejections: ${citedTitles}.`;

    try {
      const raw = await callLlm(
        [
          {
            role: "system",
            content: `You are the Amendment Proposal Agent. Given repeated near-cap policy disputes, draft a specific structured rule change. ${AMENDMENT_JSON_SHAPE_HINT}`,
          },
          {
            role: "user",
            content: `Current rules: ${JSON.stringify(constitution.rules)}. Disputed decisions (all rejected within ${NEAR_MISS_MARGIN_PCT}% of the cap): ${citedTitles}. Propose a rule change.`,
          },
        ],
        true,
      );
      const parsed = JSON.parse(raw);
      if (parsed.proposed_rules) proposedRules = parsed.proposed_rules;
      if (parsed.justification) justification = parsed.justification;
    } catch {
      // fall back to the deterministic proposal computed above
    }

    const { data: proposal, error: proposalError } = await supabase
      .from("lab_amendment_proposals")
      .insert({
        status: "pending",
        proposed_rules: proposedRules,
        justification,
        cited_decision_ids: citedIds,
        created_from_decision_ids: citedIds,
      })
      .select()
      .single();
    if (proposalError) throw proposalError;

    return jsonResponse({ triggered: true, proposal });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
