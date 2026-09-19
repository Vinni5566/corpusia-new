import { useEffect, useRef } from "react";
import type { AgentLog, Initiative } from "@/lib/corpus/types";

interface ActivityTerminalProps {
  logs: AgentLog[];
  activeInitiative?: Initiative;
}

export default function ActivityTerminal({ logs, activeInitiative }: ActivityTerminalProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="scrollbar-thin max-h-[280px] overflow-y-auto rounded-lg border border-primary/20 bg-background/80 p-4 font-mono-terminal text-[0.8rem] leading-relaxed shadow-[inset_0_0_20px_hsl(var(--primary)/0.08)]">
      <div className="text-muted-foreground">
        [SYSTEM] {new Date().toLocaleTimeString()} — Terminal session initialized...
      </div>
      {logs.map((log, idx) => (
        <div key={log.id || idx}>
          <span className="text-primary">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
          <span className="font-bold text-glow-pink" style={{ color: "hsl(var(--glow-pink))" }}>
            [{log.agent}]
          </span>{" "}
          <span className="text-accent">{(log.eventType ?? "EVENT").toUpperCase()}</span>:{" "}
          <span className="text-foreground/90">{log.summary}</span>
        </div>
      ))}
      {activeInitiative?.status === "Done" && (
        <div className="font-semibold text-success">
          [SYSTEM] {new Date().toLocaleTimeString()} — Initiative execution finished. Ledger synced.
        </div>
      )}
      <div className="flex items-center gap-1 text-success">
        <span>$</span>
        <span className="h-3.5 w-2 animate-blink bg-success" />
      </div>
      <div ref={endRef} />
    </div>
  );
}
