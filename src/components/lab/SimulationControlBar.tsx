import { useState } from "react";
import { Ban, Gavel, ScaleIcon, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runDemoScenario } from "@/lib/lab/api";
import { useLabData } from "@/context/LabDataContext";
import type { DemoScenario } from "@/lib/lab/types";
import { cn } from "@/lib/utils";

const SCENARIOS: { key: DemoScenario; label: string; icon: typeof ScaleIcon }[] = [
  { key: "budget_conflict", label: "Load Budget Conflict", icon: ScaleIcon },
  { key: "amendment_cycle", label: "Load Amendment Cycle", icon: Gavel },
  { key: "attack_sequence", label: "Load Attack Sequence", icon: ShieldAlert },
  { key: "board_escalation", label: "Load Board Escalation", icon: Ban },
];

export default function SimulationControlBar() {
  const { refresh } = useLabData();
  const [pendingScenario, setPendingScenario] = useState<DemoScenario | null>(null);

  const fire = async (scenario: DemoScenario) => {
    setPendingScenario(scenario);
    try {
      await runDemoScenario(scenario);
      await refresh();
    } catch (err) {
      console.error("Demo scenario failed:", err);
    } finally {
      setPendingScenario(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {SCENARIOS.map((scenario) => (
        <Button
          key={scenario.key}
          variant="ghost-glass"
          size="sm"
          disabled={pendingScenario !== null}
          onClick={() => fire(scenario.key)}
          className={cn(
            "justify-start gap-2 text-xs",
            pendingScenario === scenario.key && "animate-pulse",
          )}
        >
          <scenario.icon size={14} />
          {scenario.label}
        </Button>
      ))}
    </div>
  );
}
