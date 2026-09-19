# CorpusAI — Premium Command-Center Dashboard Overhaul

## Context
The Enter project currently only has the default template (`src/pages/Index.tsx` is a placeholder hero). The user wants us to build/redesign the **CorpusAI** frontend — a multi-agent enterprise OS dashboard — referencing `github.com/HSVM-exe/CorpusAI` for functional spec (kickoff form, FSM timeline, D3 lineage graph, agent negotiation chat, WebSocket activity terminal, autonomy gauge, Recharts analytics, initiatives ledger).

Decisions from user:
- **Data source**: connect live to the real deployed backend `https://corpusai-2ftb.onrender.com` via `fetch` + native `WebSocket` (same contract as the original repo: `/api/config`, `/api/initiatives`, `/api/initiatives/trigger`, `/api/initiatives/:id/logs`, `/api/initiatives/:id/graph`, `/api/decisions`, `/api/analytics`, and a `wss://` FSM update stream). No mock data, no Supabase.
- **Scope**: full visual redesign **and** IA/layout restructure — move from one giant scrolling page to a sidebar-navigated command center with distinct views.
- **Visual direction**: dark, cinematic command-center — near-black base, neon cyan + violet accents, glassmorphism panels, glowing particles on the lineage graph, subtle ambient canvas background.

## Information Architecture (new)
Persistent **AppShell** (sidebar + topbar) wrapping route-based views via `react-router-dom` (already installed):

- `/` — **Command Deck**: compact kickoff form (in a drawer/dialog triggered from topbar "New Initiative"), active initiative header, FSM timeline stepper, state rollup summary, decision gates, autonomy gauge, quick stat cards.
- `/network` — **Agent Network**: full-size D3 force-directed lineage graph (glowing particles, drag, hover tooltips), agent legend.
- `/negotiation` — **Negotiation**: Agent Negotiation Chat (bubble thread with "Agent Thoughts" expandable reasoning) + Live Activity Terminal, side-by-side on desktop.
- `/analytics` — **Analytics**: Recharts bar chart of per-agent metrics, autonomy history, summary stat cards.
- `/ledger` — **Ledger**: initiatives history list (click to set active) + decisions log.

Sidebar shows brand, nav links (lucide icons), live connection status pill (WS connected/reconnecting), and "Open Notion Workspace" link pinned at bottom. Topbar shows current view title, breadcrum33 subtitle, and "New Initiative" CTA that opens a `Dialog` with the kickoff form.

Active initiative / initiatives / decisions / logs / graph / analytics / WS connection are all lifted into one shared context so every route reads the same live data without re-fetching.

## Architecture / Files

**Data layer**
- `src/lib/corpus/types.ts` — `Initiative`, `Decision`, `AgentLog`, `GraphData`, `AnalyticsData` types (ported from original repo).
- `src/lib/corpus/api.ts` — `API_URL`/`WS_URL` constants (`https://corpusai-2ftb.onrender.com`, derived `wss://`), typed fetch helpers for every endpoint.
- `src/context/CorpusDataContext.tsx` — provider that owns: initiatives/decisions/logs/graphData/analytics/parentPageId/activeInitiativeId/connection state; polling `fetchData`; WebSocket lifecycle (reconnect w/ backoff + status flag); `triggerInitiative(goal, owner)`; `selectInitiative(id)`. Exposes `useCorpusData()` hook.

**Design system**
- `src/index.css` — replace default light tokens with a dark-first HSL palette: `--background` near-black (e.g. `222 47% 4%`), `--card` translucent slate for glass panels, `--primary` violet, new custom tokens: `--accent-cyan`, `--accent-violet`, agent tokens (`--agent-marketing`, `--agent-finance`, `--agent-engineering`, `--agent-orchestrator`, `--agent-human`), `--glow-*` box-shadow vars, glass-card utility class (backdrop-blur + border + shadow), custom scrollbar, keyframes for `pulse-glow`, `particle-float`, `shimmer` (skeletons).
- `tailwind.config.ts` — extend `colors` with the new semantic/agent tokens, `boxShadow.glow`, `keyframes`/`animation` for pulse/shimmer, `fontFamily` (Outfit via existing Google Fonts import pattern or keep default + `font-display` for headings).
- Reuse/restyle shadcn primitives already present: `card`, `button` (add `glow`/`ghost-glass` variants), `badge` (agent color variants), `dialog`, `tabs`, `scroll-area`, `progress`.

**Shared components** (`src/components/corpus/`)
- `AppSidebar.tsx`, `AppTopbar.tsx`, `AppLayout.tsx` (wraps `<Outlet/>`, used in `router.tsx`).
- `AmbientBackground.tsx` — lightweight `<canvas>` starfield/nebula (no `three.js` dependency needed; radial gradients + drifting glow dots via `requestAnimationFrame`, respects `prefers-reduced-motion`).
- `LineageGraph.tsx` — D3 force graph ported from original, restyled with new token colors, glow filter, animated flow particles, drag, tooltip (portal styled with design tokens instead of inline hex).
- `AutonomyGauge.tsx` — radial gauge (SVG `strokeDasharray` or Recharts `RadialBarChart`) showing autonomy %.
- `AnalyticsCharts.tsx` — Recharts bar chart restyled with tokens + tooltip.
- `NegotiationChat.tsx` — message bubbles per agent with avatar initials, color-coded by agent token, collapsible "Agent Thoughts" reasoning block, framer-motion enter animation per new message.
- `ActivityTerminal.tsx` — monospace scrolling terminal, auto-scroll, blinking cursor line.
- `FsmTimeline.tsx` — 4-step stepper (Marketing → Finance → Sign-off → Fired) with animated active/completed states.
- `DecisionGates.tsx`, `InitiativesLedger.tsx`, `KickoffDialog.tsx`, `StatCard.tsx`, `ConnectionStatusPill.tsx`, `EmptyState.tsx` (used when no active initiative / backend unreachable — must look intentional, not a broken error box).

**Pages** (`src/pages/`)
- `CommandDeck.tsx` (replaces placeholder `Index.tsx` content), `AgentNetwork.tsx`, `Negotiation.tsx`, `Analytics.tsx`, `Ledger.tsx`.
- `router.tsx` — wrap all routes in `AppLayout`; keep `NotFound` route.

**Dependencies to add**: `d3` + `@types/d3` (for the lineage graph). `recharts` and `framer-motion` already installed — reuse them; skip `three.js` (canvas-based ambient background is enough and keeps bundle lean).

## Verification
- `pnpm` install of `d3`; app builds and lints clean.
- Manually check in preview: sidebar navigation switches views without losing active-initiative context; kickoff dialog submits to `POST /api/initiatives/trigger`; network tab shows calls to `https://corpusai-2ftb.onrender.com`; WebSocket connects to `wss://corpusai-2ftb.onrender.com` (check console/network for `[WS] Connected`); graceful empty/loading states if the backend is asleep (Render free tier cold start) or unreachable (styled empty state, not a crash).
- Responsive check at mobile width (sidebar collapses to a drawer/bottom nav).
- Screenshot `http://localhost:3000` to confirm the dark glass aesthetic renders correctly with no light-on-light/dark-on-dark contrast issues.
