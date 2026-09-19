import { BarChart3, Layers, Percent, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnalyticsCharts from "@/components/corpus/AnalyticsCharts";
import StatCard from "@/components/corpus/StatCard";
import EmptyState from "@/components/corpus/EmptyState";
import { useCorpusData } from "@/context/CorpusDataContext";

export default function Analytics() {
  const { analytics } = useCorpusData();

  if (!analytics) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics yet"
        description="Analytics populate once initiatives have run through the orchestrator."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Initiatives" value={analytics.totalInitiatives} icon={Layers} accent="violet" />
        <StatCard
          label="Success Rate"
          value={`${(analytics.successRate * 100).toFixed(0)}%`}
          icon={Percent}
          accent="success"
        />
        <StatCard label="Avg Negotiation Rounds" value={analytics.averageRounds} icon={Repeat} accent="cyan" />
      </div>

      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Agent-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsCharts data={analytics} />
        </CardContent>
      </Card>
    </div>
  );
}
