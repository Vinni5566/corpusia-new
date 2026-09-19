import type { InitiativeStatus } from "./types";

export type AgentKey =
  | "orchestrator"
  | "marketing"
  | "finance"
  | "engineering"
  | "human"
  | "default";

export const AGENT_COLOR_VAR: Record<AgentKey, string> = {
  orchestrator: "var(--agent-orchestrator)",
  marketing: "var(--agent-marketing)",
  finance: "var(--agent-finance)",
  engineering: "var(--agent-engineering)",
  human: "var(--agent-human)",
  default: "220 15% 62%",
};

export const AGENT_BADGE_VARIANT: Record<AgentKey, string> = {
  orchestrator: "orchestrator",
  marketing: "marketing",
  finance: "finance",
  engineering: "engineering",
  human: "human",
  default: "secondary",
};

export function normalizeAgentKey(agent: string | undefined): AgentKey {
  if (!agent) return "default";
  const key = agent.toLowerCase();
  if (key.includes("orchestrator")) return "orchestrator";
  if (key.includes("marketing")) return "marketing";
  if (key.includes("finance")) return "finance";
  if (key.includes("engineering")) return "engineering";
  if (key.includes("human")) return "human";
  return "default";
}

export function getTimelineStep(status: InitiativeStatus | undefined): number {
  if (!status) return 0;
  switch (status) {
    case "Planning":
      return 1;
    case "Awaiting Approval":
      return 2;
    case "Approved":
    case "Executing":
      return 3;
    case "Done":
      return 4;
    default:
      return 0;
  }
}

export function getIsActiveAgent(
  nodeId: string,
  status?: InitiativeStatus,
): boolean {
  if (!status) return false;
  const cleanId = nodeId.toLowerCase();
  switch (status) {
    case "Planning":
      return (
        cleanId === "marketing" ||
        cleanId === "finance" ||
        cleanId === "orchestrator"
      );
    case "Awaiting Approval":
      return cleanId === "orchestrator";
    case "Approved":
    case "Executing":
      return cleanId === "engineering" || cleanId === "orchestrator";
    case "Done":
      return cleanId === "orchestrator";
    default:
      return false;
  }
}

export function statusToBadgeVariant(
  status: string,
): "success" | "destructive" | "warning" | "default" {
  if (status === "Done" || status === "Approved") return "success";
  if (status === "Rejected") return "destructive";
  if (status === "Pending" || status === "Awaiting Approval") return "warning";
  return "default";
}
