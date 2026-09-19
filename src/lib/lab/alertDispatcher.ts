import { toast } from "sonner";

export type IncidentType = "attack_blocked" | "attack_breached" | "boardroom_escalated" | "policy_cap_exceeded";

export interface IncidentAlertPayload {
  incidentId: string;
  type: IncidentType;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: Record<string, unknown>;
  timestamp: string;
}

export async function dispatchIncidentWebhook(
  type: IncidentType,
  title: string,
  severity: IncidentAlertPayload["severity"],
  details: Record<string, unknown>,
  webhookUrl = "https://hooks.slack.com/services/DEMO/WEBHOOK/CORPUSAI",
) {
  const payload: IncidentAlertPayload = {
    incidentId: `inc_${Math.random().toString(36).substring(2, 9)}`,
    type,
    title,
    severity,
    details,
    timestamp: new Date().toISOString(),
  };

  // Log to console for security auditing
  console.log(`[CORPUS-AI WEBHOOK ALERT] Sending to ${webhookUrl}:`, payload);

  // Trigger floating alert toast preview
  toast.error(`🚨 Incident Alert (${severity}): ${title}`, {
    description: `Outbound Webhook dispatched to ${webhookUrl.slice(0, 30)}...`,
    duration: 5000,
  });

  return payload;
}
