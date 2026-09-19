import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabaseAdmin.ts";
import { callLlm } from "../_shared/llm.ts";
import { simulateBargainingRounds } from "../_shared/math.ts";

interface BargainRequest {
  requestedAmount: number;
  idealAmount: number;
  policyCap: number;
  initiativeLabel: string;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { requestedAmount, idealAmount, policyCap, initiativeLabel } =
      (await req.json()) as BargainRequest;

    const supabase = getServiceClient();

    const { data: pointer } = await supabase
      .from("lab_constitution_pointer")
      .select("current_version")
      .eq("id", 1)
      .maybeSingle();
    const constitutionVersion = pointer?.current_version ?? 1;

    const { rounds, solution } = simulateBargainingRounds(
      requestedAmount,
      idealAmount,
      policyCap,
    );

    // LLM generates the natural-language "personality" dialogue per round.
    // The numeric offer itself is never influenced by the LLM — it is
    // already fixed by the solver above (per spec: "do not let the LLM's
    // number diverge from the solver's trajectory").
    const dialogueRounds = await Promise.all(
      rounds.map(async (round) => {
        try {
          const prompt = `You are simulating a budget negotiation, round ${round.roundNo}.
Marketing is now offering/requesting $${round.marketingOffer}.
Finance is countering at $${round.financeOffer}.
Write ONE short sentence of in-character dialogue for Marketing justifying their number, and ONE short sentence for Finance justifying theirs. Respond as JSON: {"marketing": "...", "finance": "..."}`;
          const raw = await callLlm(
            [
              { role: "system", content: "You write terse, realistic corporate negotiation dialogue." },
              { role: "user", content: prompt },
            ],
            true,
          );
          const parsed = JSON.parse(raw);
          return {
            marketing: parsed.marketing as string,
            finance: parsed.finance as string,
          };
        } catch {
          return {
            marketing: `Marketing holds at $${round.marketingOffer}, citing reach targets.`,
            finance: `Finance counters at $${round.financeOffer}, citing policy variance.`,
          };
        }
      }),
    );

    const finalRound = rounds[rounds.length - 1];

    const { data: decision, error: decisionError } = await supabase
      .from("lab_decisions")
      .insert({
        initiative_label: initiativeLabel,
        title: `Budget negotiation — ${initiativeLabel}`,
        status: "Pending",
        requested_by: "Marketing Agent",
        amount: finalRound.amount,
        reasoning_summary: `Converged via Nash Bargaining Solution to $${finalRound.amount} after ${rounds.length} rounds.`,
        constitution_version_applied: constitutionVersion,
        llm_verdict: "negotiate",
        symbolic_verdict: null,
        verdict_agreement: null,
        bargaining_efficiency_pct: finalRound.efficiencyPct,
        bargaining_rounds: rounds.length,
      })
      .select()
      .single();

    if (decisionError) throw decisionError;

    const roundRows = rounds.map((round, idx) => ({
      decision_id: decision.id,
      round_no: round.roundNo,
      marketing_offer: round.marketingOffer,
      finance_offer: round.financeOffer,
      marketing_utility: round.marketingUtility,
      finance_utility: round.financeUtility,
      efficiency_pct: round.efficiencyPct,
      dialogue_marketing: dialogueRounds[idx].marketing,
      dialogue_finance: dialogueRounds[idx].finance,
    }));

    const { data: insertedRounds, error: roundsError } = await supabase
      .from("lab_bargaining_rounds")
      .insert(roundRows)
      .select();

    if (roundsError) throw roundsError;

    return jsonResponse({ decision, rounds: insertedRounds, solution });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
