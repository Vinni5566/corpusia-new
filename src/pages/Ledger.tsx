import { FileText, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InitiativesLedger from "@/components/corpus/InitiativesLedger";
import DecisionGates from "@/components/corpus/DecisionGates";
import EmptyState from "@/components/corpus/EmptyState";
import { useCorpusData } from "@/context/CorpusDataContext";

export default function Ledger() {
  const { initiatives, decisions, activeInitiativeId, selectInitiative } = useCorpusData();

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText size={18} style={{ color: "hsl(var(--glow-pink))" }} />
            Initiatives Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="scrollbar-thin max-h-[600px] overflow-y-auto">
          <InitiativesLedger
            initiatives={initiatives}
            activeInitiativeId={activeInitiativeId}
            onSelect={selectInitiative}
          />
        </CardContent>
      </Card>

      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gavel size={18} className="text-primary" />
            All Decisions
          </CardTitle>
        </CardHeader>
        <CardContent className="scrollbar-thin max-h-[600px] overflow-y-auto">
          {decisions.length > 0 ? (
            <DecisionGates decisions={decisions} />
          ) : (
            <EmptyState
              icon={Gavel}
              title="No decisions yet"
              description="Decision gates appear once agents request budget sign-off."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
