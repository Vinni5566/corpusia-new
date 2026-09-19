# CorpusAI Governance & Security Lab — New Simulation Subsystem

## Context

The user provided a large 9-section spec (Nash Bargaining Kernel, Self-Amending
Constitution, Adversarial Immune System, Boardroom Debate, Time-Travel Debugger,
Telemetry HUD, expanded Simulation Control HUD) describing upgrades to an
`OrchestratorFSM`, Marketing/Finance/Engineering agents, Notion/GitHub/Slack
wrappers, etc.

**Critical fact confirmed by reading the full repo tree:** none of that backend
exists in this Enter project. This workspace only contains a frontend dashboard
(`src/pages`, `src/components/corpus`, `CorpusDataContext.tsx`) that calls a
external, already-deployed API at `https://corpusai-2ftb.onrender.com` via
`fetch`/`WebSocket`. There is no `OrchestratorFSM`, no agent code, no Notion/
GitHub/Slack wrappers, and no backend of any kind in this repo — that lives in
a separate service outside Enter's reach.

Since the real backend can't be edited here, this build implements the entire
spec as a **new, self-contained simulation layer inside this project**, backed
by Enter Cloud (Supabase Postgres + Edge Functions + AI capability). It does
not touch or fetch from `corpusai-2ftb.onrender.com`. It is additive: a new
route (`/lab`) and one new sidebar nav entry are the only touches to existing
files — every existing page/component (CommandDeck, Negotiation, AgentNetwork,
Ledger, Analytics, LineageGraph, NegotiationChat, ActivityTerminal, etc.)
stays completely untouched.

## Prerequisites (first actions in build phase)
1. `supabase_enable` — needed for Postgres persistence (Constitution versions,
   Decisions, Attack Log, Amendments, Boardroom sessions) and Edge Functions.
2. `enable_ai_capability` — needed for LLM calls (negotiation dialogue,
   amendment drafting, red-team goal generation, boardroom personas).

## Scope decisions / simplifications (per spec's own allowances)
- **Guardrail classifier "embedding":** implemented as a deterministic
  bag-of-words TF vector + cosine similarity in a Postgres/Edge Function
  (no external embedding API dependency) — satisfies "embed and compare via
  cosine similarity" without fragile infra, keeps demo reliable.
- **Symbolic verifier:** plain conditional evaluator against
  `constitution.rules` (Z3 explicitly marked optional in spec — skipped).
- **Multi-agent split beyond 2 parties:** explicit combinatorial Shapley
  calculation for the fixed 3-agent case (Marketing/Finance/Engineering).
- **Section 8 demo buttons:** fully mocked, zero LLM/DB-solver calls, pure
  synthetic data writes for guaranteed <30s reliable demo flow.

## Data Layer (Supabase — Section 1)
New tables (SQL migration), all with `created_at timestamptz default now()`:
- `constitutions`: `id, version int, effective_from, rules jsonb, ratified_by,
  diff_from_previous text, source text` — insert-only, `current_version`
  tracked via a `constitution_pointer` singleton table.
- `sim_decisions`: mirrors spec's extended Decision schema — `title, status,
  requested_by, amount, reasoning_summary, constitution_version_applied,
  llm_verdict, symbolic_verdict, verdict_agreement, bargaining_efficiency_pct,
  bargaining_rounds, initiative_label`.
- `bargaining_rounds`: `decision_id, round_no, marketing_offer, finance_offer,
  marketing_utility, finance_utility, efficiency_pct, dialogue_marketing,
  dialogue_finance`.
- `attack_log`: `attempt_id uuid, payload text, outcome text
  (blocked|breached), blocklist_version_before int, blocklist_version_after int`.
- `blocklist_entries`: `version int, payload text, vector jsonb` (seeded with
  10–15 known-attack phrases at migration time).
- `amendment_proposals`: `status (pending|ratified|rejected), proposed_rules
  jsonb, justification text, cited_decision_ids jsonb, created_from_decision_ids`.
- `boardroom_sessions`: `trigger_reason, amount, transcript jsonb, outcome_summary`.

## Edge Functions (`supabase/functions/`)
1. `lab-bargain` — Section 2: given `{ requestedAmount, idealAmount, policyCap }`,
   compute Nash Bargaining Solution in closed form (maximize product of
   utility gains over disagreement point) across a discretized feasible range;
   run up to 4 rounds, LLM generates natural-language counter-offer text per
   round (personality kept), numeric offer clamped to move monotonically
   toward solver's target; compute/store `bargaining_efficiency_pct`.
2. `lab-verify` — Section 3a: fetch `current_version.rules`, run deterministic
   conditional checks against a proposed decision amount, call LLM once for
   `llm_verdict` + a human-readable rationale, store both verdicts +
   `verdict_agreement`; on disagreement, symbolic wins.
3. `lab-amend-manual` — Section 3b: accepts a proposed rules diff, writes a
   new `constitutions` row (version+1), does NOT flip `constitution_pointer`
   until a separate `ratify` call — enforces the diff-then-ratify flow.
4. `lab-amend-watch` — Section 3c: scans last 3 `sim_decisions` for repeated
   near-cap disputes on the same clause; if triggered, LLM drafts a structured
   proposal citing decision IDs, writes to `amendment_proposals` (pending) —
   never auto-applies.
5. `lab-redteam` — Section 4: LLM generates a novel adversarial goal (given
   running list of prior attempts this session to avoid repeats); classifier
   computes TF-vector cosine similarity vs `blocklist_entries`; blocks above
   threshold, else marks breached and immediately inserts the new payload
   into `blocklist_entries` bumping `blocklist_version`; logs to `attack_log`.
6. `lab-boardroom` — Section 5: triggered when `amount > 30000` or verifier
   conflicts with strict_mode; runs 3 LLM persona turns (Optimist / Auditor /
   Safety Advocate), writes transcript to `boardroom_sessions`.
7. `lab-history` — Section 6: given a timestamp, reconstructs the constitution
   version, latest attack/blocklist version, and most recent decision/
   bargaining state as of that instant (`created_at <= timestamp` queries
   across tables).
8. `lab-demo` — Section 8: `{ scenario: "budget_conflict"|"amendment_cycle"|
   "attack_sequence"|"board_escalation" }` — inserts fully synthetic,
   pre-scripted rows (no LLM calls) so all 4 buttons run instantly and
   reliably for a live demo.

## Frontend (all new files, nothing existing edited except router + one nav link)
- `src/router.tsx`: add one child route `{ path: "lab", element: <GovernanceLab /> }`.
- `src/components/corpus/AppSidebar.tsx`: add one `NAV_ITEMS` entry ("Governance Lab").
  *(Only existing-file touches in the whole build.)*
- `src/lib/lab/types.ts`, `src/lib/lab/api.ts` (Supabase client + edge fn calls).
- `src/pages/GovernanceLab.tsx` — new Bento-grid page per Section 7 layout:
  - Row 1: header + status ticker + Pending Amendment badge (opens ratify modal).
  - Row 2L: Goal input + `SimulationControlBar` (4 demo buttons, Section 8) +
    `ConstitutionPanel` (sliders → diff → Ratify modal, pending-amendment view).
  - Row 2-3R: `ImmuneSystemLineageGraph` — new D3 graph (separate component,
    does not touch the real `LineageGraph.tsx`) with independently toggleable
    shield / shrinking attack-surface ring / telemetry overlay layers.
  - Row 3L: `LabActivityTerminal` — new terminal component printing
    `[CONSTITUTION]` / `[SHIELD]` prefixed events alongside normal ticks.
  - Row 4L: `BargainingPanel` — chat bubbles (new component, mirrors existing
    chat visual style) + small efficiency sparkline that ticks up per round.
  - Row 4R: `LabAnalytics` — spend/autonomy stat cards + constitution-version
    timeline strip.
  - Row 5 (conditional): `BoardroomHUD` — round-table seats, active-speaker glow.
  - Bottom, full width, docked: `TimelineScrubber` with tick marks for
    constitution/amendment events; scrubbing calls `lab-history` and re-renders
    all panels above for that instant.
- New small components: `TelemetryHUD.tsx` (per-agent latency/token bars).

## Verification
- After migration: `constitutions` table has a seeded v1 row and
  `constitution_pointer` = 1.
- Firing "Load Budget Conflict" demo button produces a `sim_decisions` row
  with `bargaining_rounds` and an efficiency trajectory ending ≥90%.
- Firing "Load Amendment Cycle" produces a `pending` `amendment_proposals`
  row; clicking Ratify bumps `constitution_pointer` and the badge disappears.
- Firing "Load Attack Sequence" produces one `blocked` then one `breached`
  attempt with `blocklist_version_after > blocklist_version_before`, and the
  attack-surface ring visibly shrinks on the graph.
- Firing "Load Board Escalation" renders `BoardroomHUD` with a 3-turn transcript.
- Scrubbing the timeline to a pre-amendment timestamp shows the prior
  constitution version's rules in the panel.
- Lint/build clean; no existing page (`CommandDeck`, `Negotiation`,
  `AgentNetwork`, `Ledger`, `Analytics`) or existing component is modified.
