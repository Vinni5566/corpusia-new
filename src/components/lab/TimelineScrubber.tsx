import { useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { fetchConstitutionHistory, fetchHistoryAt } from "@/lib/lab/api";
import type { HistorySnapshot } from "@/lib/lab/api";
import type { Constitution } from "@/lib/lab/types";
import { useLabData } from "@/context/LabDataContext";

const RANGE_HOURS = 48;

function timeToPercent(iso: string, rangeStartMs: number, rangeMs: number): number {
  const t = new Date(iso).getTime();
  return Math.min(100, Math.max(0, ((t - rangeStartMs) / rangeMs) * 100));
}

export default function TimelineScrubber() {
  const { pendingAmendment, applyHistoricalSnapshot, isHistoricalView } = useLabData();
  const [percent, setPercent] = useState(100);
  const [snapshot, setSnapshot] = useState<HistorySnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [constitutionHistory, setConstitutionHistory] = useState<Constitution[]>([]);

  useEffect(() => {
    fetchConstitutionHistory()
      .then(setConstitutionHistory)
      .catch(() => setConstitutionHistory([]));
  }, [pendingAmendment?.id]);

  const now = Date.now();
  const rangeStartMs = now - RANGE_HOURS * 60 * 60 * 1000;
  const rangeMs = RANGE_HOURS * 60 * 60 * 1000;

  const handleChange = async ([value]: number[]) => {
    setPercent(value);
    if (value >= 99) {
      setSnapshot(null);
      applyHistoricalSnapshot(null);
      return;
    }

    const targetTime = now - ((100 - value) / 100) * rangeMs;
    setLoading(true);
    try {
      const result = await fetchHistoryAt(new Date(targetTime).toISOString());
      setSnapshot(result);
      applyHistoricalSnapshot(result);
    } catch (err) {
      console.error("History fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToLive = () => {
    setPercent(100);
    setSnapshot(null);
    applyHistoricalSnapshot(null);
  };

  // Discrete tick marks: one per constitution version change
  const ticks = constitutionHistory
    .filter((c) => {
      const t = new Date(c.effective_from).getTime();
      return t >= rangeStartMs && t <= now;
    })
    .map((c) => ({
      version: c.version,
      percent: timeToPercent(c.effective_from, rangeStartMs, rangeMs),
      source: c.source,
    }));

  return (
    <div className={`glass-panel flex w-full flex-col gap-3 rounded-xl p-4 transition-all ${
      isHistoricalView ? "border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/10" : ""
    }`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <History size={14} className={isHistoricalView ? "text-amber-400 animate-pulse" : "text-primary"} />
          Time-Travel Debugger
          {isHistoricalView && (
            <span className="rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-amber-300">
              Historical View Active (v{snapshot?.constitution?.version ?? "Past"})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isHistoricalView && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToLive}
              className="h-6 gap-1 border-amber-500/40 px-2 text-[0.65rem] text-amber-300 hover:bg-amber-500/20"
            >
              <RotateCcw size={10} />
              Return to Live (Now)
            </Button>
          )}
          <span className="text-muted-foreground">
            {loading
              ? "Reconstructing historical state..."
              : snapshot?.constitution
                ? `Restored v${snapshot.constitution.version} — max spend $${snapshot.constitution.rules.max_amount}`
                : "Scrub to reconstruct past system state"}
          </span>
        </div>
      </div>

      <Slider value={[percent]} onValueChange={handleChange} min={0} max={100} step={1} />

      <div className="relative h-4">
        {ticks.map((tick) => (
          <div
            key={tick.version}
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${tick.percent}%` }}
            title={`Constitution v${tick.version} (${tick.source}) ratified here`}
          >
            <div className="h-2 w-0.5 bg-primary" />
            <span className="mt-0.5 text-[0.55rem] text-primary font-bold">v{tick.version}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[0.65rem] text-muted-foreground">
        <span>-{RANGE_HOURS}h (Past)</span>
        <span>now (Live)</span>
      </div>

      {snapshot?.decision ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-3 text-[0.7rem] text-foreground shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-amber-300 text-xs">
              ⏮️ Reconstructed Business Task: {snapshot.decision.title}
            </span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase text-amber-400 border border-amber-500/40">
              {snapshot.decision.status}
            </span>
          </div>
          <p className="text-muted-foreground text-[0.72rem] mb-2 leading-relaxed">
            <strong className="text-foreground">Task Details:</strong> Audited under Constitution v{snapshot.constitution?.version ?? 1} (${snapshot.constitution?.rules.max_amount ?? 15000} cap).
          </p>
          <div className="grid grid-cols-2 gap-2 rounded bg-background/60 p-2 border border-border/40 text-[0.68rem]">
            <div>
              <span className="text-muted-foreground">LLM Analysis Verdict:</span>{" "}
              <span className="font-semibold text-foreground">{snapshot.decision.llm_verdict ?? "Approved"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Symbolic Rule Verdict:</span>{" "}
              <span className="font-semibold text-emerald-400">{snapshot.decision.symbolic_verdict ?? "Verified Safe"}</span>
            </div>
          </div>
          {snapshot.decision.bargaining_rounds > 0 && (
            <div className="mt-1.5 text-[0.65rem] text-amber-300/80">
              ⚡ Nash Bargaining: Resolved across {snapshot.decision.bargaining_rounds} numerical rounds.
            </div>
          )}
        </div>
      ) : isHistoricalView ? (
        <div className="rounded-lg border border-amber-500/30 bg-background/40 p-2.5 text-[0.7rem] text-muted-foreground">
          <span className="font-semibold text-amber-300">Reconstructed System Point:</span> Scanned historical timestamp — Constitution v{snapshot?.constitution?.version ?? 1} active with ${snapshot?.constitution?.rules.max_amount ?? 15000} spending cap.
        </div>
      ) : null}
    </div>
  );
}
