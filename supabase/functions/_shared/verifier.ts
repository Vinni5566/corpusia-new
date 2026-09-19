// Shared symbolic verifier — deterministic, independent of any LLM.
// Used by both lab-verify (standalone check) and lab-bargain (inline check
// immediately after a negotiation concludes) so every decision — live or
// on-demand — always gets both verdicts populated together.

export interface ConstitutionRules {
  max_amount: number;
  requires_approval_above: number;
  variance_tolerance: number;
  strict_mode: boolean;
}

export interface SymbolicResult {
  verdict: "approve" | "reject";
  rationale: string;
}

export function symbolicallyVerify(amount: number, rules: ConstitutionRules): SymbolicResult {
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

export const LLM_VERDICT_JSON_INSTRUCTION =
  "You are the Finance Agent. Respond ONLY with minified JSON matching this shape: {'verdict': 'approve' | 'reject' | 'negotiate', 'rationale': 'short string'} — but use double quotes as valid JSON requires.";
