import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabaseAdmin.ts";
import { callLlm } from "../_shared/llm.ts";

interface BoardroomRequest {
  amount: number;
  reason: string; // 'amount_over_30000' | 'strict_mode_conflict'
}

interface TranscriptTurn {
  persona: string;
  turn: number;
  message: string;
}

const PERSONAS = [
  {
    name: "Optimist" as const,
    system:
      "You are the Silicon Valley Optimist board member. You favor bold, fast action and see upside in taking calculated risks.",
  },
  {
    name: "Auditor" as const,
    system:
      "You are the Conservative Auditor board member. You focus on financial risk, compliance, and precedent. You are skeptical of large or unusual requests.",
  },
  {
    name: "Safety Advocate" as const,
    system:
      "You are the AI Safety Advocate board member. You focus on downstream risk, unintended consequences, and whether human oversight is sufficient.",
  },
];

// Section 5 — triggered only for ultra-high-risk escalation (>$30k or a
// strict_mode override conflict). Feeds AWAITING_HUMAN_APPROVAL as context;
// never bypasses it.
//
// Performance note: the 3 personas within a turn are fired in PARALLEL
// (Promise.all) since none of them need to see each other's message within
// the same turn — only turns are sequential (each turn sees the full prior
// discussion). This cuts a 9-call sequential chain down to 3 sequential
// rounds of 3 parallel calls, roughly a 3x latency improvement regardless
// of which model is behind LLM_MODEL.
Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { amount, reason } = (await req.json()) as BoardroomRequest;
    const supabase = getServiceClient();

    const transcript: TranscriptTurn[] = [];

    for (let turn = 1; turn <= 3; turn++) {
      const priorContext = transcript.map((t) => `${t.persona}: ${t.message}`).join("\n");

      const turnMessages = await Promise.all(
        PERSONAS.map(async (persona) => {
          try {
            const message = await callLlm(
              [
                { role: "system", content: `${persona.system} Keep your response to 1-2 short sentences.` },
                {
                  role: "user",
                  content: `Boardroom debate, turn ${turn} of 3. A request for $${amount} triggered escalation (${reason}). Discussion so far:\n${priorContext || "(none yet)"}\nGive your view.`,
                },
              ],
              false,
              90,
            );
            return { persona: persona.name, turn, message: message.trim() };
          } catch {
            return {
              persona: persona.name,
              turn,
              message: `[Fallback] ${persona.name} weighs in on the $${amount} request given ${reason}.`,
            };
          }
        }),
      );

      transcript.push(...turnMessages);
    }

    const outcomeSummary = `Board discussed a $${amount} escalation (${reason}) across 3 rounds. Outcome feeds into human approval — does not bypass it.`;

    const { data: session, error } = await supabase
      .from("lab_boardroom_sessions")
      .insert({
        trigger_reason: reason,
        amount,
        transcript,
        outcome_summary: outcomeSummary,
      })
      .select()
      .single();
    if (error) throw error;

    return jsonResponse({ session });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
