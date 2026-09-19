import { useEffect, useState } from "react";
import { BarChart3, DollarSign, Percent, ShieldCheck } from "lucide-react";
import { fetchConstitutionHistory } from "@/lib/lab/api";
import { useLabData } from "@/context/LabDataContext";
import StatCard from "@/components/corpus/StatCard";
import type { Constitution } from "@/lib/lab/types";

export default function LabAnalytics() {
  const { decisions, constitution } = useLabData();
  const [history, setHistory] = useState<Constitution[]>([]);

  useEffect(() => {
    fetchConstitutionHistory().then(setHistory).catch(() => setHistory([]));
  }, [constitution?.version]);

  const totalSpend = decisions
    .filter((d) => d.status === "Approved")
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const agreementCount = decisions.filter((d) => d.verdict_agreement).length;
  const agreementPct =
    decisions.length > 0 ? Math.round((agreementCount / decisions.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Approved Spend" value={`$${totalSpend.toLocaleString()}`} icon={DollarSign} accent="violet" />
        <StatCard label="Verdict Agreement" value={`${agreementPct}%`} icon={Percent} accent="cyan" />
        <StatCard label="Constitution Version" value={`v${constitution?.version ?? 1}`} icon={ShieldCheck} accent="success" />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <BarChart3 size={14} />
          Constitution Version Timeline
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {history.map((c) => (
            <div
              key={c.version}
              className="flex shrink-0 flex-col items-center gap-1 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-center"
              title={c.diff_from_previous ?? undefined}
            >
              <span className="text-xs font-semibold text-primary">v{c.version}</span>
              <span className="text-[0.6rem] text-muted-foreground">
                {new Date(c.effective_from).toLocaleDateString()}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <span className="text-xs text-muted-foreground">No constitution history yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
