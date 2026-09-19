export interface ConstitutionRules {
  max_amount: number;
  requires_approval_above: number;
  variance_tolerance: number;
  strict_mode: boolean;
}

export interface Constitution {
  id: string;
  version: number;
  effective_from: string;
  rules: ConstitutionRules;
  ratified_by: "human" | "system-default";
  diff_from_previous: string | null;
  source: "manual_amendment" | "ai_proposed_amendment";
  created_at: string;
}

export type Verdict = "approve" | "reject" | "negotiate";

export interface LabDecision {
  id: string;
  initiative_label: string;
  title: string;
  status: "Pending" | "Approved" | "Rejected";
  requested_by: string;
  amount: number;
  reasoning_summary: string | null;
  constitution_version_applied: number;
  llm_verdict: Verdict | null;
  symbolic_verdict: "approve" | "reject" | null;
  verdict_agreement: boolean | null;
  bargaining_efficiency_pct: number | null;
  bargaining_rounds: number;
  created_at: string;
}

export interface BargainingRound {
  id: string;
  decision_id: string;
  round_no: number;
  marketing_offer: number;
  finance_offer: number;
  marketing_utility: number;
  finance_utility: number;
  efficiency_pct: number;
  dialogue_marketing: string | null;
  dialogue_finance: string | null;
  created_at: string;
}

export interface BlocklistEntry {
  id: string;
  version: number;
  payload: string;
  vector: Record<string, number>;
  created_at: string;
}

export interface AttackLogEntry {
  id: string;
  attempt_id: string;
  payload: string;
  outcome: "blocked" | "breached";
  blocklist_version_before: number;
  blocklist_version_after: number;
  created_at: string;
}

export interface AmendmentProposal {
  id: string;
  status: "pending" | "ratified" | "rejected";
  proposed_rules: ConstitutionRules;
  justification: string;
  cited_decision_ids: string[];
  created_from_decision_ids: string[];
  resulting_version: number | null;
  created_at: string;
  resolved_at: string | null;
}

export interface BoardroomSession {
  id: string;
  trigger_reason: string;
  amount: number | null;
  transcript: BoardroomTurn[];
  outcome_summary: string | null;
  decision_id: string | null;
  created_at: string;
}

export interface BoardroomTurn {
  persona: "Optimist" | "Auditor" | "Safety Advocate";
  turn: number;
  message: string;
}

export type DemoScenario =
  | "budget_conflict"
  | "amendment_cycle"
  | "attack_sequence"
  | "board_escalation";
