import { useState } from "react";
import { AlertCircle, Loader2, Network, ScaleIcon, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabDataProvider, useLabData } from "@/context/LabDataContext";
import LabSetupNotice from "@/components/lab/LabSetupNotice";
import SimulationControlBar from "@/components/lab/SimulationControlBar";
import ConstitutionPanel from "@/components/lab/ConstitutionPanel";
import ImmuneSystemGraph from "@/components/lab/ImmuneSystemGraph";
import LabActivityTerminal from "@/components/lab/LabActivityTerminal";
import BargainingPanel from "@/components/lab/BargainingPanel";
import LabAnalytics from "@/components/lab/LabAnalytics";
import BoardroomHUD from "@/components/lab/BoardroomHUD";
import TimelineScrubber from "@/components/lab/TimelineScrubber";
import TelemetryHUD from "@/components/lab/TelemetryHUD";
import { GraphLayerToggle, LabStatusTicker } from "@/components/lab/LabHeaderControls";
import { LiveNegotiationPipeline, LiveRedTeamTrigger } from "@/components/lab/LiveOperations";

function GovernanceLabContent() {
  const { configured, loading, error, boardroomSession } = useLabData();
  const [showShield, setShowShield] = useState(true);
  const [showTelemetryLayer, setShowTelemetryLayer] = useState(false);

  if (!configured) {
    return <LabSetupNotice />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={28} />
        <p className="text-sm">Loading Governance Lab...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: status ticker */}
      <LabStatusTicker />

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Row 2 Left: Simulation HUD + Live Pipeline + Constitution */}
        <div className="flex flex-col gap-6">
          <Card className="glass-panel border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Simulation Control HUD</CardTitle>
            </CardHeader>
            <CardContent>
              <SimulationControlBar />
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Live Negotiation Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LiveNegotiationPipeline />
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ScaleIcon size={18} className="text-primary" />
                Policy Sandbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConstitutionPanel />
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Telemetry</CardTitle>
            </CardHeader>
            <CardContent>
              <TelemetryHUD />
            </CardContent>
          </Card>
        </div>

        {/* Row 2-3 Right: Immune system graph */}
        <Card className="glass-panel border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert size={18} className="text-destructive" />
              Adversarial Immune System
            </CardTitle>
            <GraphLayerToggle
              showShield={showShield}
              onShieldChange={setShowShield}
              showTelemetry={showTelemetryLayer}
              onTelemetryChange={setShowTelemetryLayer}
            />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ImmuneSystemGraphWithData showShield={showShield} showTelemetry={showTelemetryLayer} />
            <LiveRedTeamTrigger />
          </CardContent>
        </Card>
      </div>

      {/* Row 3 Left: Activity terminal */}
      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Live Activity Terminal</CardTitle>
        </CardHeader>
        <CardContent>
          <LabActivityTerminal />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Row 4 Left: Negotiation chat + efficiency sparkline */}
        <Card className="glass-panel border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Network size={18} style={{ color: "hsl(var(--glow-pink))" }} />
              Nash Bargaining Kernel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BargainingPanel />
          </CardContent>
        </Card>

        {/* Row 4 Right: Analytics */}
        <Card className="glass-panel border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <LabAnalytics />
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Boardroom HUD, only when triggered */}
      {boardroomSession && (
        <Card className="glass-panel border-warning/30">
          <CardHeader>
            <CardTitle className="text-base">Boardroom Debate</CardTitle>
          </CardHeader>
          <CardContent>
            <BoardroomHUD />
          </CardContent>
        </Card>
      )}

      {/* Timeline scrubber docked at the bottom */}
      <TimelineScrubber />
    </div>
  );
}

function ImmuneSystemGraphWithData({
  showShield,
  showTelemetry,
}: {
  showShield: boolean;
  showTelemetry: boolean;
}) {
  const { blocklistVersion } = useLabData();
  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-background/40">
      <ImmuneSystemGraph
        blocklistVersion={blocklistVersion}
        showShield={showShield}
        showTelemetry={showTelemetry}
        height={340}
      />
    </div>
  );
}

export default function GovernanceLab() {
  return (
    <LabDataProvider>
      <GovernanceLabContent />
    </LabDataProvider>
  );
}
