import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabaseAdmin.ts";
import { callLlm } from "../_shared/llm.ts";

interface VerifyRequest {
  decisionId: string;
}

// Section 3a — deterministic symbolic verifier + LLM verdict, both stored.
// On disagreement, the symbolic verdict always wins.
function symbolicallyVerify(
  amount: number,
  rules: { max_amount: number; requires_approval_above: number; variance_tolerance: number; strict_mode: boolean },
): { verdict: "approve" | "reject"; rationale: string } {
  if (amount > rules.max_amount) {
    return {
      verdict: "reject",
      rationale: `Amount $${amount} exceeds hard cap of $${rules.max_amount}.`,
    };
  }
  if (rules.strict_mode && amount > rules.requires_approval_above) {
    return {
      verdict: "reject",
      rationale: `Strict mode active: amount $${amount} exceeds approval threshold of $${rules.requires_approval_above}.`,
    };
  }
  return { verdict: "approve", rationale: "Within policy bounds." };
}

const LLM_JSON_INSTRUCTION =
  "You are the Finance Agent. Respond ONLY with minified JSON matching this shape: {'verdict': 'approve' | 'reject' | 'negotiate', 'rationale': 'short string'} — but use double quotes as valid JSON requires.";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { decisionId } = (await req.json()) as VerifyRequest;
    const supabase = getServiceClient();

    const { data: decision, error: decisionError } = await supabase
      .from("lab_decisions")
      .select("*")
      .eq("id", decisionId)
      .single();
    if (decisionError) throw decisionError;

    const { data: constitution, error: constitutionError } = await supabase
      .from("lab_constitutions")
      .select("*")
      .eq("version", decision.constitution_version_applied)
      .single();
    if (constitutionError) throw constitutionError;

    const symbolic = symbolicallyVerify(decision.amount, constitution.rules);

    let llmVerdict: "approve" | "reject" | "negotiate" = "approve";
    try {
      const raw = await callLlm(
        [
          {
            role: "system",
            content: LLM_JSON_INSTRUCTION,
          },
          {
            role: "user",
            content: `Decision: ${decision.title}, amount $${decision.amount}. Policy: max_amount=$${constitution.rules.max_amount}, requires_approval_above=$${constitution.rules.requires_approval_above}, variance_tolerance=${constitution.rules.variance_tolerance}, strict_mode=${constitution.rules.strict_mode}. Give your verdict.`,
          },
        ],
        true,
      );
      const parsed = JSON.parse(raw);
      llmVerdict = parsed.verdict;
    } catch {
      llmVerdict = symbolic.verdict === "approve" ? "approve" : "reject";
    }

    const verdictAgreement = llmVerdict === symbolic.verdict;
    const finalStatus = symbolic.verdict === "approve" ? "Approved" : "Rejected";

    const { data: updated, error: updateError } = await supabase
      .from("lab_decisions")
      .update({
        llm_verdict: llmVerdict,
        symbolic_verdict: symbolic.verdict,
        verdict_agreement: verdictAgreement,
        status: finalStatus,
        reasoning_summary: verdictAgreement
          ? symbolic.rationale
          : `LLM suggested ${llmVerdict.toUpperCase()}; policy engine overrode to ${symbolic.verdict.toUpperCase()} (${symbolic.rationale})`,
      })
      .eq("id", decisionId)
      .select()
      .single();
    if (updateError) throw updateError;

    return jsonResponse({ decision: updated });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
