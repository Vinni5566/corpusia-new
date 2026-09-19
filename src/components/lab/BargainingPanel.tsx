import { motion } from "framer-motion";
import { useLabData } from "@/context/LabDataContext";

function EfficiencySparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const width = 120;
  const height = 28;
  const max = 100;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * width;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--glow-cyan))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * width;
        const y = height - (v / max) * height;
        return <circle key={i} cx={x} cy={y} r={2.5} fill="hsl(var(--glow-cyan))" />;
      })}
    </svg>
  );
}

export default function BargainingPanel() {
  const { recentRounds } = useLabData();

  if (recentRounds.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        No bargaining sessions yet — fire &ldquo;Load Budget Conflict&rdquo; to see one.
      </p>
    );
  }

  const efficiencyValues = recentRounds.map((r) => r.efficiency_pct);
  const latestRound = recentRounds[recentRounds.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Round {latestRound.round_no} — {latestRound.efficiency_pct}% Pareto-efficient
        </span>
        <EfficiencySparkline values={efficiencyValues} />
      </div>

      <div className="scrollbar-thin flex max-h-72 flex-col gap-3 overflow-y-auto">
        {recentRounds.map((round) => (
          <motion.div
            key={round.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-agent-marketing/15 text-[0.65rem] font-semibold text-agent-marketing">
                M
              </div>
              <div className="flex-1 rounded-xl rounded-tl-sm border border-border/50 bg-card/30 px-3 py-2 text-xs">
                {round.dialogue_marketing ?? `Offers $${round.marketing_offer}.`}
              </div>
            </div>
            <div className="flex items-start justify-end gap-2">
              <div className="flex-1 rounded-xl rounded-tr-sm border border-border/50 bg-card/30 px-3 py-2 text-right text-xs">
                {round.dialogue_finance ?? `Counters at $${round.finance_offer}.`}
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-agent-finance/15 text-[0.65rem] font-semibold text-agent-finance">
                F
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
