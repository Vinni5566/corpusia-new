import { AlertCircle, Award, CheckCircle2, Gauge, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AutonomyGauge from "@/components/corpus/AutonomyGauge";
import FsmTimeline from "@/components/corpus/FsmTimeline";
import DecisionGates from "@/components/corpus/DecisionGates";
import EmptyState from "@/components/corpus/EmptyState";
import StatCard from "@/components/corpus/StatCard";
import LineageGraph from "@/components/corpus/LineageGraph";
import { useCorpusData } from "@/context/CorpusDataContext";
import { getTimelineStep } from "@/lib/corpus/agents";

export default function CommandDeck() {
  const {
    activeInitiative,
    activeDecisions,
    decisions,
    graphData,
    loading,
    error,
  } = useCorpusData();

  const totalDecisionsCount = decisions.length;
  const autoApprovedCount = decisions.filter((d) => d.title.includes("(Auto-Approved)")).length;
  const autonomyRate =
    totalDecisionsCount > 0 ? Math.round((autoApprovedCount / totalDecisionsCount) * 100) : 0;
  const currentStep = getTimelineStep(activeInitiative?.status);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm">Initializing CorpusAI...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Decisions" value={totalDecisionsCount} icon={Sparkles} accent="violet" />
        <StatCard label="Auto-Approved" value={autoApprovedCount} icon={CheckCircle2} accent="success" />
        <StatCard
          label="Human Sign-off"
          value={totalDecisionsCount - autoApprovedCount}
          icon={Award}
          accent="warning"
        />
        <StatCard label="Autonomy Rate" value={`${autonomyRate}%`} icon={Gauge} accent="cyan" />
      </div>

      {activeInitiative ? (
        <Card className="glass-panel border-border/60">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="min-w-0">
              <CardTitle className="text-lg">{activeInitiative.name}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Owner: {activeInitiative.owner} · Started{" "}
                {new Date(activeInitiative.created).toLocaleString()}
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            {graphData && (
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Agent Lineage Graph
                </h4>
                <div className="overflow-hidden rounded-xl border border-border/40 bg-background/40">
                  <LineageGraph data={graphData} activeStatus={activeInitiative.status} height={320} />
                </div>
              </div>
            )}

            <FsmTimeline currentStep={currentStep} />

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-primary">
                State Rollup Summary
              </span>
              <p className="text-sm leading-relaxed text-foreground/90">
                {activeInitiative.summary || "Initial scheduling state..."}
              </p>
            </div>

            {activeDecisions.length > 0 && (
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Decision Gates
                </h4>
                <DecisionGates decisions={activeDecisions} />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="No active initiative"
          description="Submit a goal from the New Initiative button to see the FSM run live."
        />
      )}

      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award size={18} className="text-success" />
            System Autonomy Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
          <AutonomyGauge percent={autonomyRate} />
          <div className="grid w-full max-w-xs grid-cols-1 gap-2">
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total Decisions</span>
              <span className="font-semibold">{totalDecisionsCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Auto-Approved</span>
              <span className="font-semibold text-success">{autoApprovedCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Requires Human Sign-off</span>
              <span className="font-semibold text-warning">
                {totalDecisionsCount - autoApprovedCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
