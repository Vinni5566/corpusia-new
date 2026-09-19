import { useState } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCorpusData } from "@/context/CorpusDataContext";

const DEFAULT_GOAL =
  "Launch a global AI marketing campaign for product v2.0, budget capped at $15,000 by policy.";

const GOAL_PRESETS = [
  {
    label: "Marketing Campaign",
    goal: "Launch digital marketing campaign across advertising channels with $12,000 budget cap.",
  },
  {
    label: "Infrastructure Scaling",
    goal: "Expand multi-region cloud server clusters for agent workloads with $18,000 budget allocation.",
  },
  {
    label: "Security Audit",
    goal: "Conduct comprehensive security compliance audit and penetration testing with $9,500 budget cap.",
  },
];

export default function KickoffDialog() {
  const { submitInitiative, submitting } = useCorpusData();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [owner, setOwner] = useState("John Doe (Product Lead)");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim().length < 10) {
      toast.error("Initiative goal must be at least 10 characters long.");
      return;
    }
    try {
      await submitInitiative(goal, owner);
      toast.success("Initiative launched! Agents are evaluating the goal.");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to launch initiative.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glow" className="gap-2 font-semibold">
          <Play size={16} />
          New Initiative
        </Button>
      </DialogTrigger>
      <DialogContent className="border-primary/40 sm:max-w-lg bg-card/95 text-foreground shadow-2xl backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Launch New Corporate Initiative
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit a company goal to the multi-agent orchestrator. Marketing and Finance
            will negotiate a plan under FSM-guarded autonomy.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="goal" className="text-xs font-semibold">
                Company Goal / Objective
              </Label>
              <span className="text-[0.65rem] text-muted-foreground">Quick Presets:</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-1">
              {GOAL_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setGoal(preset.goal)}
                  className="rounded-md border border-border/60 bg-background/40 px-2 py-1 text-[0.65rem] text-foreground/90 transition-colors hover:border-primary/50 hover:bg-primary/10"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Type your initiative goal here..."
              required
              className="min-h-[110px] bg-background/80 text-foreground border-border/80 focus:border-primary text-sm font-medium focus-visible:ring-primary/40 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="owner" className="text-xs font-semibold">
              Initiator Name (Owner)
            </Label>
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
              placeholder="e.g. Jane Smith (CAIO)"
              className="bg-background/80 text-foreground border-border/80 focus:border-primary text-sm font-medium focus-visible:ring-primary/40"
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" variant="glow" disabled={submitting} className="w-full gap-2 font-semibold">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Triggering Agents..." : "Kick Off Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
