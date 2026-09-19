import type { Decision } from "@/lib/corpus/types";
import { statusToBadgeVariant } from "@/lib/corpus/agents";
import { Badge } from "@/components/ui/badge";

interface DecisionGatesProps {
  decisions: Decision[];
}

export default function DecisionGates({ decisions }: DecisionGatesProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {decisions.map((dec) => (
        <div
          key={dec.id}
          className="flex flex-col gap-1.5 rounded-lg border border-border/60 bg-card/40 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">{dec.title}</span>
            <Badge variant={statusToBadgeVariant(dec.status)}>{dec.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Justification: {dec.reasoningSummary}</p>
          {dec.decidedBy && dec.decidedAt && (
            <p className="text-xs italic text-muted-foreground">
              Decided by {dec.decidedBy} at {new Date(dec.decidedAt).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
