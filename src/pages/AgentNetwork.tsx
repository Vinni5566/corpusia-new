import { Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LineageGraph from "@/components/corpus/LineageGraph";
import EmptyState from "@/components/corpus/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useCorpusData } from "@/context/CorpusDataContext";

const LEGEND = [
  { label: "Orchestrator", variant: "orchestrator" },
  { label: "Marketing", variant: "marketing" },
  { label: "Finance", variant: "finance" },
  { label: "Engineering", variant: "engineering" },
  { label: "Human", variant: "human" },
] as const;

export default function AgentNetwork() {
  const { graphData, activeInitiative } = useCorpusData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {LEGEND.map((item) => (
          <Badge key={item.label} variant={item.variant}>
            {item.label}
          </Badge>
        ))}
      </div>

      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="text-base">
            {activeInitiative ? activeInitiative.name : "Agent Lineage Graph"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {graphData ? (
            <div className="overflow-hidden rounded-xl border border-border/40 bg-background/40">
              <LineageGraph data={graphData} activeStatus={activeInitiative?.status} height={520} />
            </div>
          ) : (
            <EmptyState
              icon={Network}
              title="No graph data yet"
              description="Launch an initiative to see agents negotiate and route work in real time."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
