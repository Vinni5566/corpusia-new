export type InitiativeStatus =
  | "Planning"
  | "Awaiting Approval"
  | "Approved"
  | "Rejected"
  | "Executing"
  | "Done";

export interface Initiative {
  id: string;
  name: string;
  status: InitiativeStatus;
  owner: string;
  created: string;
  summary: string;
}

export type DecisionStatus = "Pending" | "Approved" | "Rejected";

export interface Decision {
  id: string;
  title: string;
  status: DecisionStatus;
  requestedBy: string;
  amount: number;
  reasoningSummary: string;
  initiativeId: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agent: string;
  eventType: string;
  summary: string;
  reasoning: string;
  initiativeId: string;
}

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AgentMetrics {
  avgResponseMs: number;
  successCount: number;
}

export interface AnalyticsData {
  totalInitiatives: number;
  successRate: number;
  averageRounds: number;
  agentMetrics: Record<string, AgentMetrics>;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
