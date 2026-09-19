import { useEffect, useRef, useMemo } from "react";
import { useLabData } from "@/context/LabDataContext";

interface TerminalLine {
  timestamp: string;
  prefix: string;
  prefixColor: string;
  message: string;
}

export default function LabActivityTerminal() {
  const { decisions, attackLog, pendingAmendment, constitution } = useLabData();
  const endRef = useRef<HTMLDivElement>(null);

  const lines: TerminalLine[] = useMemo(() => {
    const decisionLines: TerminalLine[] = decisions.slice(0, 8).map((d) => ({
      timestamp: d.created_at,
      prefix: "[DECISION]",
      prefixColor: "hsl(var(--primary))",
      message: `${d.title} — LLM:${d.llm_verdict ?? "n/a"} SYM:${d.symbolic_verdict ?? "n/a"} ${
        d.verdict_agreement === false ? "(OVERRIDE)" : ""
      }`,
    }));

    const attackLines: TerminalLine[] = attackLog.slice(0, 8).map((a) => ({
      timestamp: a.created_at,
      prefix: "[SHIELD]",
      prefixColor: "hsl(var(--destructive))",
      message: `${(a.outcome ?? "BLOCKED").toUpperCase()} — blocklist v${a.blocklist_version_before} -> v${a.blocklist_version_after}`,
    }));

    const constitutionLines: TerminalLine[] = constitution
      ? [
          {
            timestamp: constitution.effective_from,
            prefix: "[CONSTITUTION]",
            prefixColor: "hsl(var(--glow-cyan))",
            message: `Active version v${constitution.version} (${constitution.source})`,
          },
        ]
      : [];

    const amendmentLines: TerminalLine[] = pendingAmendment
      ? [
          {
            timestamp: pendingAmendment.created_at,
            prefix: "[CONSTITUTION]",
            prefixColor: "hsl(var(--warning))",
            message: "Pending amendment awaiting human ratification.",
          },
        ]
      : [];

    return [...decisionLines, ...attackLines, ...constitutionLines, ...amendmentLines].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [decisions, attackLog, pendingAmendment, constitution]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="scrollbar-thin max-h-[260px] overflow-y-auto rounded-lg border border-primary/20 bg-background/80 p-4 font-mono-terminal text-[0.78rem] leading-relaxed shadow-[inset_0_0_20px_hsl(var(--primary)/0.08)]">
      <div className="text-muted-foreground">
        [SYSTEM] {new Date().toLocaleTimeString()} — Governance Lab terminal initialized...
      </div>
      {lines.length === 0 && (
        <div className="text-muted-foreground">
          [SYSTEM] Awaiting activity — fire a Simulation Control demo button.
        </div>
      )}
      {lines.map((line, idx) => (
        <div key={idx}>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>
            [{new Date(line.timestamp).toLocaleTimeString()}]
          </span>{" "}
          <span style={{ color: line.prefixColor, fontWeight: 700 }}>{line.prefix}</span>{" "}
          <span className="text-foreground/90">{line.message}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
