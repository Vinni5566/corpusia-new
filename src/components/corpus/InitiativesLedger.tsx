import type { Initiative } from "@/lib/corpus/types";
import { statusToBadgeVariant } from "@/lib/corpus/agents";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InitiativesLedgerProps {
  initiatives: Initiative[];
  activeInitiativeId: string | null;
  onSelect: (id: string) => void;
}

export default function InitiativesLedger({
  initiatives,
  activeInitiativeId,
  onSelect,
}: InitiativesLedgerProps) {
  if (initiatives.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No initiatives found in the ledger yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {initiatives.map((init) => {
        const isActive = activeInitiativeId === init.id;
        return (
          <button
            key={init.id}
            onClick={() => onSelect(init.id)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all duration-200",
              isActive
                ? "border-primary/60 bg-primary/10"
                : "border-border/60 bg-background/40 hover:border-primary/30 hover:bg-card/60",
            )}
          >
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold">{init.name}</h4>
              <span className="text-xs text-muted-foreground">
                Owner: {init.owner} · {new Date(init.created).toLocaleDateString()}
              </span>
            </div>
            <Badge variant={statusToBadgeVariant(init.status)} className="shrink-0">
              {init.status}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
