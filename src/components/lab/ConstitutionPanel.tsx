import { useState } from "react";
import { FileWarning, Lock, Scale } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { draftManualAmendment, ratifyAmendment } from "@/lib/lab/api";
import { useLabData } from "@/context/LabDataContext";
import { useAuth } from "@/context/AuthContext";
import type { Constitution, ConstitutionRules } from "@/lib/lab/types";

const DEFAULT_RULES: ConstitutionRules = {
  max_amount: 15000,
  requires_approval_above: 10000,
  variance_tolerance: 0.15,
  strict_mode: false,
};

export default function ConstitutionPanel() {
  const { constitution, pendingAmendment, refresh, isHistoricalView } = useLabData();
  const { roleInfo } = useAuth();
  const [draftRules, setDraftRules] = useState<ConstitutionRules | null>(null);
  const [draftVersion, setDraftVersion] = useState<Constitution | null>(null);
  const [ratifying, setRatifying] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const rawRules = draftRules ?? constitution?.rules;
  const rules: ConstitutionRules =
    rawRules && typeof rawRules === "object" && !Array.isArray(rawRules)
      ? {
          max_amount: typeof (rawRules as ConstitutionRules).max_amount === "number" ? (rawRules as ConstitutionRules).max_amount : DEFAULT_RULES.max_amount,
          requires_approval_above: typeof (rawRules as ConstitutionRules).requires_approval_above === "number" ? (rawRules as ConstitutionRules).requires_approval_above : DEFAULT_RULES.requires_approval_above,
          variance_tolerance: typeof (rawRules as ConstitutionRules).variance_tolerance === "number" ? (rawRules as ConstitutionRules).variance_tolerance : DEFAULT_RULES.variance_tolerance,
          strict_mode: typeof (rawRules as ConstitutionRules).strict_mode === "boolean" ? (rawRules as ConstitutionRules).strict_mode : DEFAULT_RULES.strict_mode,
        }
      : DEFAULT_RULES;

  const updateRule = <K extends keyof ConstitutionRules>(key: K, value: ConstitutionRules[K]) => {
    if (!roleInfo.canEditConstitution || isHistoricalView) return;
    setDraftRules({ ...rules, [key]: value });
  };

  const handleDraft = async () => {
    if (!draftRules) return;
    setDrafting(true);
    try {
      const result = await draftManualAmendment({ proposedRules: draftRules });
      setDraftVersion(result.draftVersion);
    } catch (err) {
      console.error("Failed to draft amendment:", err);
    } finally {
      setDrafting(false);
    }
  };

  const handleRatifyManual = async () => {
    if (!draftVersion) return;
    setRatifying(true);
    try {
      await ratifyAmendment({ version: draftVersion.version });
      setDraftVersion(null);
      setDraftRules(null);
      await refresh();
    } catch (err) {
      console.error("Failed to ratify:", err);
    } finally {
      setRatifying(false);
    }
  };

  const handleRatifyPending = async () => {
    if (!pendingAmendment) return;
    setRatifying(true);
    try {
      await ratifyAmendment({ amendmentId: pendingAmendment.id });
      await refresh();
    } catch (err) {
      console.error("Failed to ratify pending amendment:", err);
    } finally {
      setRatifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-primary" />
          <span className="text-sm font-semibold">Constitution</span>
          {constitution && (
            <Badge variant="secondary" className="text-[0.65rem]">
              v{constitution.version}
            </Badge>
          )}
        </div>
        {!roleInfo.canEditConstitution && (
          <Badge variant="outline" className="gap-1 text-[0.65rem] border-warning/40 text-warning">
            <Lock size={10} /> Read-Only ({roleInfo.badge})
          </Badge>
        )}
      </div>

      {pendingAmendment && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-left text-xs font-medium text-warning transition-colors hover:bg-warning/15">
              <FileWarning size={14} className="shrink-0" />
              Pending amendment awaiting ratification
            </button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-warning/30 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>AI-Proposed Amendment</DialogTitle>
              <DialogDescription>{pendingAmendment.justification}</DialogDescription>
            </DialogHeader>
            <pre className="scrollbar-thin max-h-40 overflow-auto rounded-md border border-border/60 bg-background/60 p-3 font-mono-terminal text-xs">
              {JSON.stringify(pendingAmendment.proposed_rules, null, 2)}
            </pre>
            <DialogFooter>
              <Button variant="glow" disabled={ratifying} onClick={handleRatifyPending}>
                {ratifying ? "Ratifying..." : "Ratify"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <Label>Max Amount</Label>
            <span className="font-mono-terminal text-muted-foreground">${rules.max_amount}</span>
          </div>
          <Slider
            min={1000}
            max={50000}
            step={500}
            value={[rules.max_amount]}
            onValueChange={([v]) => updateRule("max_amount", v)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <Label>Requires Approval Above</Label>
            <span className="font-mono-terminal text-muted-foreground">
              ${rules.requires_approval_above}
            </span>
          </div>
          <Slider
            min={500}
            max={40000}
            step={500}
            value={[rules.requires_approval_above]}
            onValueChange={([v]) => updateRule("requires_approval_above", v)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <Label>Variance Tolerance</Label>
            <span className="font-mono-terminal text-muted-foreground">
              {(rules.variance_tolerance ?? 0.15).toFixed(2)}
            </span>
          </div>
          <Slider
            min={0}
            max={0.5}
            step={0.01}
            value={[rules.variance_tolerance]}
            onValueChange={([v]) => updateRule("variance_tolerance", v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Strict Mode</Label>
          <Switch
            checked={rules.strict_mode}
            onCheckedChange={(checked) => updateRule("strict_mode", checked)}
          />
        </div>
      </div>

      {draftRules && !draftVersion && (
        <Button size="sm" variant="ghost-glass" disabled={drafting} onClick={handleDraft}>
          {drafting ? "Drafting..." : "Preview Amendment Diff"}
        </Button>
      )}

      <Dialog open={!!draftVersion} onOpenChange={(open) => !open && setDraftVersion(null)}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Constitution Amendment</DialogTitle>
            <DialogDescription>{draftVersion?.diff_from_previous}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="glow" disabled={ratifying} onClick={handleRatifyManual}>
              {ratifying ? "Ratifying..." : "Ratify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
