import { FileText, Shield, Wifi } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLabData } from "@/context/LabDataContext";
import { generateComplianceReport } from "@/lib/lab/reportGenerator";

interface GraphLayerToggleProps {
  showShield: boolean;
  onShieldChange: (value: boolean) => void;
  showTelemetry: boolean;
  onTelemetryChange: (value: boolean) => void;
}

export function GraphLayerToggle({
  showShield,
  onShieldChange,
  showTelemetry,
  onTelemetryChange,
}: GraphLayerToggleProps) {
  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <Switch checked={showShield} onCheckedChange={onShieldChange} className="scale-75" />
        <Label className="text-[0.7rem] text-muted-foreground">Shield layer</Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch checked={showTelemetry} onCheckedChange={onTelemetryChange} className="scale-75" />
        <Label className="text-[0.7rem] text-muted-foreground">Telemetry layer</Label>
      </div>
    </div>
  );
}

export function LabStatusTicker() {
  const { constitution, blocklistVersion, decisions, attackLog, recentRounds } = useLabData();

  const handleExportReport = () => {
    generateComplianceReport({
      constitution,
      decisions,
      attackLog,
      recentRounds,
      blocklistVersion,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Wifi size={12} className="text-success" />
          Constitution v{constitution?.version ?? 1}
        </span>
        <span className="flex items-center gap-1.5">
          <Shield size={12} className="text-glow-cyan" />
          Blocklist v{blocklistVersion}
        </span>
        <span>{decisions.length} decisions logged</span>
      </div>
      <Button
        variant="ghost-glass"
        size="sm"
        onClick={handleExportReport}
        className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
      >
        <FileText size={14} />
        Export Compliance Report
      </Button>
    </div>
  );
}
