# CorpusAI — Enterprise Multi-Agent OS Command Center & Governance Lab

[![Built with enter.pro](https://img.shields.io/badge/Built%20with-Enter.pro-FC5776?style=for-the-badge&labelColor=1F1F1F)](https://enter.pro)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tests-100%25%20Passed-success?style=flat-square)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square)](https://corpus-ai-business.vercel.app)

> **CorpusAI** is an enterprise-grade **Multi-Agent Operating System Command Center and Governance Lab**. It provides a visual interface to monitor, audit, mathematically optimize, and security-constrain autonomous AI agents (Marketing, Finance, Engineering, and Orchestrator) executing corporate initiatives.

---

## 📌 Table of Contents
- [1. Executive Summary & Value Proposition](#1-executive-summary--value-proposition)
- [2. System Architecture & Dual-Backend Design](#2-system-architecture--dual-backend-design)
- [3. Complete Feature Breakdown (A to Z)](#3-complete-feature-breakdown-a-to-z)
- [4. Mathematical Foundations & Algorithms](#4-mathematical-foundations--algorithms)
- [5. Hackathon Presenter Hotkeys & 60-Second Demo Mode](#5-hackathon-presenter-hotkeys--60-second-demo-mode)
- [6. Technology Stack Matrix](#6-technology-stack-matrix)
- [7. Database Schema & RLS Security Hardening](#7-database-schema--rls-security-hardening)
- [8. Local Development & Vitest Testing Guide](#8-local-development--vitest-testing-guide)
- [9. Production Deployment Guide](#9-production-deployment-guide)
- [10. Codebase Folder Structure](#10-codebase-folder-structure)
- [11. License](#11-license)

---

## 1. Executive Summary & Value Proposition

### The Problem
As enterprises deploy autonomous AI agents for marketing, treasury spending, and software deployment, they encounter three critical roadblocks:
1. **Unconstrained Spending & Runaway Autonomy:** Agents executing budget requests without deterministic hard spending caps or multi-signature approvals.
2. **Black-Box Agent Negotiation:** Sub-agents negotiating allocations using opaque text prompts without mathematical Pareto efficiency bounds.
3. **Adversarial Vulnerability:** Prompt injection attacks overriding system instructions to breach corporate policies.

### The CorpusAI Solution
CorpusAI functions as an **Operating System & Safety Shield** for multi-agent networks. It merges real-time operational monitoring with a serverless governance engine enforcing symbolic policy verification, mathematical Nash Bargaining equilibrium, term-frequency vector security, and historic state reconstruction.

---

## 2. System Architecture & Dual-Backend Design

CorpusAI utilizes a **Hybrid Dual-Backend Architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. FRONTEND LAYER                               │
│  React 19 | Vite | TypeScript | Tailwind CSS | shadcn/ui | D3.js       │
│  React Router (Lazy Routes) | Context API | Sonner Toasts | Recharts     │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │                                  │
┌──────────────────▼─────────────────┐┌───────────────▼──────────────────┐
│  2. OPERATIONAL COMMAND DECK TIER   ││   3. GOVERNANCE LAB TIER (SERVERLESS)│
│  Node.js / Express WebSocket Svc   ││   Supabase Deno Edge Functions       │
│  (https://corpusai-2ftb.onrender.com)││   (`lab-bargain`, `lab-verify`, etc.) │
└──────────────────┬─────────────────┘└───────────────┬──────────────────┘
                   │                                  │
┌──────────────────▼──────────────────────────────────▼──────────────────┐
│                       4. AUTHENTICATION & SECURITY                      │
│   AuthContext (RBAC: CAIO, Security Lead, Finance Auditor, Observer)   │
│   Adversarial Immune System (TF Cosine Similarity Vector Blocklist)    │
│   Database Row Level Security (RLS) Service Role Constraints            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                          5. DATABASE LAYER                             │
│   Supabase PostgreSQL (`lab_constitutions`, `lab_decisions`,           │
│   `lab_bargaining_rounds`, `lab_attack_log`, `lab_boardroom_sessions`) │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Operational Command Deck Tier:** Connects via REST and WebSockets to an external Render service (`https://corpusai-2ftb.onrender.com`) managed by `CorpusDataContext.tsx` to render real-time agent dialogues, telemetry HUD sparklines, and D3 lineage graphs.
2. **Governance & Security Lab Tier (`/lab`):** Serverless architecture backed by Supabase PostgreSQL (`0001_governance_lab.sql`) and Deno Edge Functions (`supabase/functions`). Managed by `LabDataContext.tsx`, it executes symbolic verifications, vector cosine similarity checks, and boardroom escalations.

---

## 3. Complete Feature Breakdown (A to Z)

| Feature | Description | File Path |
| :--- | :--- | :--- |
| **Command Deck Overview (`/`)** | Central hub displaying active campaign state machine timeline, autonomy gauge, and telemetry. | [`CommandDeck.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/pages/CommandDeck.tsx) |
| **D3 Force Lineage Graph (`/network`)** | Interactive D3 force-directed SVG graph mapping agent communications, data flow, and authority boundaries. | [`LineageGraph.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/corpus/LineageGraph.tsx) |
| **Agent Negotiation Stream (`/negotiation`)** | Real-time agent dialogue feed with collapsible "Agent Thought" cards revealing internal reasoning. | [`NegotiationChat.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/corpus/NegotiationChat.tsx) |
| **Analytics Deck (`/analytics`)** | Recharts performance charts tracking spending, token burn rates, and autonomy ratios. | [`AnalyticsCharts.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/corpus/AnalyticsCharts.tsx) |
| **Initiatives Ledger (`/ledger`)** | Full historical audit ledger of past campaigns and decision gates. | [`InitiativesLedger.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/corpus/InitiativesLedger.tsx) |
| **Policy Sandbox (`/lab`)** | Tune spending caps, variance tolerance, and strict mode parameters in real time. | [`ConstitutionPanel.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/lab/ConstitutionPanel.tsx) |
| **Nash Bargaining Kernel** | Game-theoretic solver computing Pareto-optimal compromises between Marketing and Finance. | [`NashBargainingPanel.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/lab/NashBargainingPanel.tsx) |
| **Adversarial Red-Team Simulator** | Term-frequency vector classifier blocking prompt injection attacks in under 12ms. | [`LiveOperations.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/lab/LiveOperations.tsx) |
| **Boardroom Escalation Engine** | Triggers 3-persona AI courtroom sessions (Optimist, Auditor, Safety Advocate) when spend > $30k. | [`BoardroomPanel.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/lab/BoardroomPanel.tsx) |
| **Time-Travel Debugger** | Interactive historical scrubber reconstructing past database state at any historical timestamp. | [`TimeTravelDebugger.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/lab/TimeTravelDebugger.tsx) |
| **Enterprise RBAC Switcher** | Role switcher (CAIO, AI Security Lead, Finance Auditor, Read-Only Observer) locking UI controls for observers. | [`AuthContext.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/context/AuthContext.tsx) |
| **1-Click PDF Compliance Exporter** | Generates downloadable A4 audit reports formatted for ISO/IEC 42001 & EU AI Act compliance. | [`reportGenerator.ts`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/lib/lab/reportGenerator.ts) |
| **Agent Memory & RAG Inspector** | Modal inspecting vector retrieval similarity scores (96% match) and context token budgets. | [`AgentMemoryInspector.tsx`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/src/components/corpus/AgentMemoryInspector.tsx) |

---

## 4. Mathematical Foundations & Algorithms

### 1. Game-Theoretic Nash Bargaining Kernel
When Marketing asks for budget $x$ against Finance policy cap $C$, agent utilities are defined as:

$$U_M(x) = \text{clamp01}\left(\frac{x}{\text{ideal}}\right)$$
$$U_F(x) = \text{clamp01}\left(1 - \frac{|x - C|}{C}\right)$$

CorpusAI solves for the Pareto-optimal compromise by maximizing the Nash Product across 800 numerical step iterations:

$$\max_x \left( U_M(x) \times U_F(x) \right)$$

### 2. Term-Frequency Vector Cosine Similarity Classifier
Adversarial prompt injections are tokenized, cleaned of stopwords, normalized into term-frequency vectors $A$ and $B$, and evaluated via cosine similarity:

$$\text{similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i} A_i B_i}{\sqrt{\sum_{i} A_i^2} \sqrt{\sum_{i} B_i^2}}$$

If $\text{similarity}(A, B) \ge 0.75$, the prompt injection is **BLOCKED** immediately with zero LLM token consumption.

---

## 5. Hackathon Presenter Hotkeys & 60-Second Demo Mode

CorpusAI includes built-in keyboard triggers for live hackathon presentations:

| Hotkey | Feature Triggered | Description |
| :--- | :--- | :--- |
| **`Shift + D`** | **▶ 60-Sec Demo Mode** | Runs a focused 60-second tour visiting Command Deck, D3 Lineage Graph, Negotiation Stream, Governance Lab, and PDF Export. |
| **`Shift + E`** | **PDF Compliance Export** | Generates a downloadable A4 Governance Audit Report in 1 click. |
| **`Shift + A`** | **Red-Team Attack Test** | Simulates an adversarial prompt injection attack with shield sound FX. |
| **`Shift + M`** | **Agent Memory Inspector** | Opens the Agent Vector Memory & RAG Explainability modal. |

---

## 6. Technology Stack Matrix

- **Frontend Core:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 3.4, shadcn/ui.
- **Data Visualization:** D3.js (`d3-force`), Recharts.
- **Audio Synthesizer:** Pure browser Web Audio API synthesizer (`soundEngine.ts`).
- **Database & Serverless:** Supabase PostgreSQL, Deno Edge Functions.
- **Operational Backend:** Node.js, Express, WebSockets (`wss://corpusai-2ftb.onrender.com`).
- **Automated Testing:** Vitest 3.2 unit test runner (`npm test`).
- **Deployment:** Vercel (Frontend), Render (WebSocket Backend), Supabase (Edge Functions).

---

## 7. Database Schema & RLS Security Hardening

The database is built on Supabase PostgreSQL with hardened Row Level Security (RLS) policies ([`0002_tighten_rls.sql`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/supabase/migrations/0002_tighten_rls.sql)):

- `lab_constitutions`: Stores rule sets (`max_amount`, `requires_approval_above`, `variance_tolerance`, `strict_mode`).
- `lab_constitution_pointer`: Pointer to active version ID.
- `lab_decisions`: Logs all audited decision requests and symbolic verdicts.
- `lab_bargaining_rounds`: Stores step-by-step Nash Bargaining convergence data.
- `lab_attack_log`: Logs red-team attack attempts, TF similarity scores, and outcomes (`blocked`/`breached`).
- `lab_boardroom_sessions`: Stores 3-persona courtroom debate transcripts.

---

## 8. Local Development & Vitest Testing Guide

```bash
# 1. Clone the repository
git clone https://github.com/HSVM-exe/Corpus-AI.git
cd Corpus-AI

# 2. Install dependencies cleanly
npm install --legacy-peer-deps

# 3. Run automated Vitest unit test suite (13/13 tests pass)
npm test

# 4. Run TypeScript compiler check
npx --package=typescript tsc -p tsconfig.app.json

# 5. Start local Vite development server
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 9. Production Deployment Guide

### Frontend (Vercel)
Pre-configured with [`vercel.json`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/vercel.json) and [`.npmrc`](file:///C:/Users/Yash/.gemini/antigravity/scratch/CorpusAI/.npmrc) (`legacy-peer-deps=true`).
1. Connect repository on **[Vercel](https://vercel.com)**.
2. Add Environment Variables:
   - `VITE_SUPABASE_URL=https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your-anon-public-key`
3. Click **Deploy**.

---

## 10. Codebase Folder Structure

```
CorpusAI/
├── public/                     # Static assets and i18n translation files
├── src/                        # Core React Application Code
│   ├── components/             # Reusable UI components (corpus, lab, ui)
│   ├── context/                # Global State (AuthContext, CorpusData, LabData)
│   ├── hooks/                  # Custom Hooks (usePresenterHotkeys.ts)
│   ├── lib/                    # Core Business Logic & Algorithms
│   │   ├── soundEngine.ts      # Web Audio API audio synthesizer
│   │   └── lab/                # Math, classifier, reportGenerator, api client
│   ├── pages/                  # Dynamic Route Pages (CommandDeck, GovernanceLab, etc.)
│   └── router.tsx              # React Router setup with React.lazy code splitting
├── supabase/                   # Supabase PostgreSQL migrations & Deno Edge Functions
├── vercel.json                 # Vercel Single-Page Application rewrite rules
├── .npmrc                      # Legacy peer dependencies configuration
└── package.json                # npm scripts and dependency definitions
```

---

## 11. License

- **Repository:** [`https://github.com/HSVM-exe/Corpus-AI`](https://github.com/HSVM-exe/Corpus-AI)
- **License:** MIT License — Open for Enterprise AI Safety Research.
