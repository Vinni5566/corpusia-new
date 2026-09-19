import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useLabData } from "@/context/LabDataContext";
import { cn } from "@/lib/utils";

const PERSONA_META = {
  Optimist: { icon: TrendingUp, color: "hsl(var(--glow-pink))" },
  Auditor: { icon: ShieldCheck, color: "hsl(var(--glow-cyan))" },
  "Safety Advocate": { icon: Sparkles, color: "hsl(var(--primary))" },
} as const;

export default function BoardroomHUD() {
  const { boardroomSession } = useLabData();

  if (!boardroomSession) return null;

  const personas = Object.keys(PERSONA_META) as (keyof typeof PERSONA_META)[];
  const lastTurn = boardroomSession.transcript[boardroomSession.transcript.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          Boardroom Escalation — ${boardroomSession.amount?.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">{boardroomSession.trigger_reason}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {personas.map((persona) => {
          const meta = PERSONA_META[persona];
          const isActive = lastTurn?.persona === persona;
          return (
            <motion.div
              key={persona}
              animate={isActive ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
                isActive ? "border-primary/60 bg-primary/10" : "border-border/50 bg-background/30",
              )}
              style={isActive ? { boxShadow: `0 0 24px ${meta.color}40` } : undefined}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: `${meta.color}22`, color: meta.color }}
              >
                <meta.icon size={18} />
              </div>
              <span className="text-xs font-semibold">{persona}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="scrollbar-thin flex max-h-56 flex-col gap-2 overflow-y-auto rounded-lg border border-border/50 bg-background/30 p-3">
        {boardroomSession.transcript.map((turn, idx) => (
          <div key={idx} className="text-xs">
            <span className="font-semibold" style={{ color: PERSONA_META[turn.persona].color }}>
              {turn.persona}:
            </span>{" "}
            <span className="text-foreground/85">{turn.message}</span>
          </div>
        ))}
      </div>

      {boardroomSession.outcome_summary && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground/90">
          {boardroomSession.outcome_summary}
        </div>
      )}
    </div>
  );
}
