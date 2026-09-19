import type {
  AgentLog,
  AnalyticsData,
  Decision,
  GraphData,
  Initiative,
} from "./types";

export const API_URL = "https://corpusai-2ftb.onrender.com";
export const WS_URL = API_URL.replace(/^http/, "ws");

// ---------------------------------------------------------------------------
// Local Memory Fallback Store (active if Render backend is offline or sleeping)
// ---------------------------------------------------------------------------

const mockInitiatives: Initiative[] = [
  {
    id: "init-default-1",
    name: "Global AI Marketing Campaign v2.0",
    status: "Planning",
    owner: "John Doe (Product Lead)",
    created: new Date().toISOString(),
    summary:
      "Launch digital marketing campaign across advertising channels with $12,000 budget cap.",
  },
  {
    id: "init-default-2",
    name: "Multi-Region Cloud Server Expansion",
    status: "Executing",
    owner: "Sarah Jenkins (Infrastructure)",
    created: new Date(Date.now() - 3600000 * 24).toISOString(),
    summary:
      "Expand multi-region cloud server clusters for agent workloads with $18,000 budget allocation.",
  },
  {
    id: "init-default-3",
    name: "Security Compliance Audit",
    status: "Approved",
    owner: "Alex Vance (Security)",
    created: new Date(Date.now() - 3600000 * 48).toISOString(),
    summary:
      "Conduct comprehensive security compliance audit and penetration testing with $9,500 budget cap.",
  },
];

const mockDecisions: Decision[] = [
  {
    id: "dec-1",
    title: "Marketing Campaign Budget Allocation",
    status: "Pending",
    requestedBy: "Marketing Agent",
    amount: 12000,
    reasoningSummary:
      "Proposes $12,000 ad spend across search and social channels. Within $15,000 policy cap.",
    initiativeId: "init-default-1",
  },
  {
    id: "dec-2",
    title: "Server Node Provisioning",
    status: "Approved",
    requestedBy: "Engineering Agent",
    amount: 18000,
    reasoningSummary:
      "Provision 8 high-throughput compute nodes for low-latency agent inference.",
    initiativeId: "init-default-2",
    decidedBy: "Finance Guardrail Agent",
    decidedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const mockLogs: Record<string, AgentLog[]> = {
  "init-default-1": [
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      agent: "Orchestrator",
      eventType: "INITIATIVE_TRIGGERED",
      summary: "Goal 'Global AI Marketing Campaign v2.0' submitted",
      reasoning: "Goal parsed and initialized in FSM state machine.",
      initiativeId: "init-default-1",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() + 1000).toISOString(),
      agent: "Marketing Agent",
      eventType: "PROPOSAL_CREATED",
      summary: "Drafted $12,000 ad spend campaign",
      reasoning: "Calculated projected ROI at 3.4x based on historical conversion benchmarks.",
      initiativeId: "init-default-1",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() + 2000).toISOString(),
      agent: "Finance Agent",
      eventType: "BARGAINING_INITIATED",
      summary: "Reviewing campaign budget against constitutional cap",
      reasoning: "Evaluating proposed $12k budget against $15k ceiling rule.",
      initiativeId: "init-default-1",
    },
  ],
};

const mockGraphs: Record<string, GraphData> = {
  "init-default-1": {
    nodes: [
      { id: "start", label: "Goal Kickoff" },
      { id: "fsm_planning", label: "Planning (FSM)" },
      { id: "agent_mkt", label: "Marketing Strategy" },
      { id: "agent_fin", label: "Finance Audit" },
      { id: "gate_approval", label: "Decision Gate" },
    ],
    edges: [
      { from: "start", to: "fsm_planning", label: "Submit Goal" },
      { from: "fsm_planning", to: "agent_mkt", label: "Dispatch Plan" },
      { from: "agent_mkt", to: "agent_fin", label: "Propose Budget ($12k)" },
      { from: "agent_fin", to: "gate_approval", label: "Verify Policy Cap" },
    ],
  },
};

const mockAnalytics: AnalyticsData = {
  totalInitiatives: 14,
  successRate: 92.8,
  averageRounds: 3.2,
  agentMetrics: {
    Orchestrator: { avgResponseMs: 120, successCount: 42 },
    "Marketing Agent": { avgResponseMs: 340, successCount: 38 },
    "Finance Agent": { avgResponseMs: 280, successCount: 36 },
  },
};

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 1200): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetchWithTimeout(`${API_URL}${path}`, {}, 1200);
    if (!res.ok) {
      throw new Error(`Request failed: ${path} (${res.status})`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      return fallback;
    }
    return data as T;
  } catch (err) {
    return fallback;
  }
}

export function fetchConfig(): Promise<{ parentPageId?: string }> {
  return getJson("/api/config", { parentPageId: "corpus-main-deck" });
}

export function fetchInitiatives(): Promise<Initiative[]> {
  return getJson("/api/initiatives", mockInitiatives);
}

export function fetchDecisions(): Promise<Decision[]> {
  return getJson("/api/decisions", mockDecisions);
}

export function fetchInitiativeLogs(
  initiativeId: string,
): Promise<{ logs: AgentLog[] }> {
  const logs = mockLogs[initiativeId] || [
    {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      agent: "Orchestrator",
      eventType: "STATE_LOADED",
      summary: `Loaded workspace logs for ${initiativeId}`,
      reasoning: "Active monitoring state attached.",
      initiativeId,
    },
  ];
  return getJson(`/api/initiatives/${initiativeId}/logs`, { logs });
}

export function fetchInitiativeGraph(
  initiativeId: string,
): Promise<{ graph: GraphData }> {
  const defaultGraph: GraphData = {
    nodes: [
      { id: "start", label: "Goal Kickoff" },
      { id: "fsm_planning", label: "Planning (FSM)" },
      { id: "agent_exec", label: "Agent Execution" },
      { id: "gate_approval", label: "Decision Gate" },
    ],
    edges: [
      { from: "start", to: "fsm_planning", label: "Submit Goal" },
      { from: "fsm_planning", to: "agent_exec", label: "Dispatch Work" },
      { from: "agent_exec", to: "gate_approval", label: "Check Governance" },
    ],
  };
  const graph = mockGraphs[initiativeId] || defaultGraph;
  return getJson(`/api/initiatives/${initiativeId}/graph`, { graph });
}

export function fetchAnalytics(): Promise<AnalyticsData> {
  return getJson("/api/analytics", mockAnalytics);
}

export async function triggerInitiative(
  goal: string,
  owner: string,
): Promise<{ initiativeId: string }> {
  const initiativeId = "init-" + Date.now();
  const title = goal.length > 55 ? goal.slice(0, 52) + "..." : goal;

  const newInitiative: Initiative = {
    id: initiativeId,
    name: title,
    status: "Planning",
    owner: owner || "Initiator",
    created: new Date().toISOString(),
    summary: goal,
  };

  mockInitiatives.unshift(newInitiative);

  const newDecision: Decision = {
    id: "dec-" + Date.now(),
    title: `Policy Audit: ${title}`,
    status: "Pending",
    requestedBy: "Marketing Agent",
    amount: 12500,
    reasoningSummary: `Goal request submitted by ${owner}. Governance audit pending.`,
    initiativeId,
  };
  mockDecisions.unshift(newDecision);

  mockLogs[initiativeId] = [
    {
      id: "log-" + Date.now() + "-1",
      timestamp: new Date().toISOString(),
      agent: "Orchestrator",
      eventType: "INITIATIVE_TRIGGERED",
      summary: `Goal '${title}' launched by ${owner}`,
      reasoning: "Goal parsed and initialized in FSM state machine.",
      initiativeId,
    },
    {
      id: "log-" + Date.now() + "-2",
      timestamp: new Date(Date.now() + 500).toISOString(),
      agent: "Marketing Agent",
      eventType: "PROPOSAL_CREATED",
      summary: "Drafted execution roadmap and budget specification",
      reasoning: "Goal aligns with strategic growth KPIs. Submitting budget request for approval.",
      initiativeId,
    },
    {
      id: "log-" + Date.now() + "-3",
      timestamp: new Date(Date.now() + 1000).toISOString(),
      agent: "Finance Agent",
      eventType: "POLICY_CHECK",
      summary: "Verifying request against constitutional policy caps",
      reasoning: "Cross-checking budget limits against organizational governance rules.",
      initiativeId,
    },
  ];

  mockGraphs[initiativeId] = {
    nodes: [
      { id: "start", label: "Goal Kickoff" },
      { id: "fsm_planning", label: "Planning (FSM)" },
      { id: "agent_mkt", label: "Marketing Strategy" },
      { id: "agent_fin", label: "Finance Audit" },
      { id: "gate_approval", label: "Decision Gate" },
    ],
    edges: [
      { from: "start", to: "fsm_planning", label: "Submit Goal" },
      { from: "fsm_planning", to: "agent_mkt", label: "Dispatch Plan" },
      { from: "agent_mkt", to: "agent_fin", label: "Propose Budget ($12.5k)" },
      { from: "agent_fin", to: "gate_approval", label: "Verify Policy Cap" },
    ],
  };

  // Optional background trigger attempt
  fetchWithTimeout(
    `${API_URL}/api/initiatives/trigger`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, owner }),
    },
    1500,
  ).catch(() => {});

  return { initiativeId };
}

