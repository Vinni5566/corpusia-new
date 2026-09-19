import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import type { AgentLog } from "@/lib/corpus/types";
import { AGENT_BADGE_VARIANT, normalizeAgentKey } from "@/lib/corpus/agents";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NegotiationChatProps {
  logs: AgentLog[];
}

export default function NegotiationChat({ logs }: NegotiationChatProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  if (logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No negotiation activity yet for this initiative.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {logs.map((log) => {
        const agentKey = normalizeAgentKey(log.agent);
        const isExpanded = expandedLogId === log.id;

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3"
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              )}
              style={{
                background: `hsl(${agentKeyToVar(agentKey)} / 0.18)`,
                color: `hsl(${agentKeyToVar(agentKey)})`,
              }}
            >
              {log.agent[0]}
            </div>
            <div className="flex-1 rounded-xl border border-border/60 bg-card/40 p-3">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{log.agent}</span>
                  <Badge variant={AGENT_BADGE_VARIANT[agentKey] as never} className="text-[0.6rem]">
                    {log.eventType}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{log.summary}</p>
              {log.reasoning && (
                <div className="mt-2 border-t border-dashed border-border/60 pt-2">
                  <button
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {isExpanded ? "Hide agent thoughts" : "Read agent thoughts"}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {isExpanded && (
                    <pre className="mt-2 whitespace-pre-wrap rounded-md border border-border/60 bg-background/60 p-2 font-mono-terminal text-xs text-accent">
                      {log.reasoning}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );
}

function agentKeyToVar(key: string) {
  switch (key) {
    case "orchestrator":
      return "var(--agent-orchestrator)";
    case "marketing":
      return "var(--agent-marketing)";
    case "finance":
      return "var(--agent-finance)";
    case "engineering":
      return "var(--agent-engineering)";
    case "human":
      return "var(--agent-human)";
    default:
      return "220 15% 62%";
  }
}
