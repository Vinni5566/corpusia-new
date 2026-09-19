import { useState } from "react";
import { BookOpen, ShieldCheck, Cpu, Code2, Zap, Terminal, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SystemArchitectureModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/60">
          <BookOpen size={14} className="text-primary" />
          <span className="hidden sm:inline">Architecture & Spec</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-h-[85vh] overflow-y-auto max-w-3xl border-border/60 p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Cpu className="text-primary" size={20} />
            CorpusAI — System Architecture & Mathematical Foundations
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enterprise Multi-Agent OS Command Center & Governance Lab Technical Blueprint
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6 text-xs text-foreground/90">
          {/* Section 1: Architecture */}
          <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-sm text-primary">
              <Zap size={16} /> 1. Dual-Backend Hybrid Architecture
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              CorpusAI combines an Express WebSocket telemetry backend for low-latency operational dialogues with Supabase PostgreSQL & Deno Edge Functions for symbolic policy verification.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="rounded border border-border/40 bg-background/50 p-3">
                <span className="font-semibold text-xs text-foreground">Operational Command Tier</span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Node.js / Express WebSocket service handling agent dialogue streams, telemetry sparklines, and D3 network force graphs.
                </p>
              </div>
              <div className="rounded border border-border/40 bg-background/50 p-3">
                <span className="font-semibold text-xs text-foreground">Governance & Security Lab</span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supabase PostgreSQL database enforcing RLS, Nash bargaining equilibria solver, and term-frequency vector classifier.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Math */}
          <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <Code2 size={16} /> 2. Mathematical Foundations & Algorithms
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-xs text-foreground">Game-Theoretic Nash Bargaining Kernel</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  When Marketing requests budget x against Finance policy cap C, agent utilities UM(x) and UF(x) are defined and solved across 800 numerical iterations to maximize:
                </p>
                <div className="mt-1.5 rounded bg-background/80 p-2 font-mono-terminal text-[11px] text-emerald-300">
                  max_x ( U_M(x) &times; U_F(x) ) &nbsp; where U_M(x) = clamp01(x / ideal)
                </div>
              </div>

              <div>
                <span className="font-semibold text-xs text-foreground">TF Vector Cosine Similarity Classifier</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Adversarial prompt injections are tokenized and evaluated via term-frequency cosine similarity:
                </p>
                <div className="mt-1.5 rounded bg-background/80 p-2 font-mono-terminal text-[11px] text-cyan-300">
                  Similarity(A, B) = (A &middot; B) / ( ||A|| &times; ||B|| ) &ge; 0.75 &rarr; BLOCKED
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Hotkeys */}
          <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <Terminal size={16} /> 3. Hackathon Presenter Hotkeys
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono-terminal text-[11px]">
              <div className="flex items-center justify-between rounded bg-background/60 p-2 border border-border/30">
                <span className="text-primary font-bold">Shift + D</span>
                <span className="text-muted-foreground">▶ 60-Sec Tour</span>
              </div>
              <div className="flex items-center justify-between rounded bg-background/60 p-2 border border-border/30">
                <span className="text-primary font-bold">Shift + E</span>
                <span className="text-muted-foreground">PDF Compliance</span>
              </div>
              <div className="flex items-center justify-between rounded bg-background/60 p-2 border border-border/30">
                <span className="text-primary font-bold">Shift + A</span>
                <span className="text-muted-foreground">Red-Team Attack</span>
              </div>
              <div className="flex items-center justify-between rounded bg-background/60 p-2 border border-border/30">
                <span className="text-primary font-bold">Shift + M</span>
                <span className="text-muted-foreground">Memory & RAG</span>
              </div>
            </div>
          </div>

          {/* Section 4: Security */}
          <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 space-y-2">
            <h3 className="flex items-center gap-2 font-bold text-sm text-purple-400">
              <Lock size={16} /> 4. Enterprise RBAC & RLS Policies
            </h3>
            <p className="text-[11px] font-mono-terminal text-muted-foreground">
              Supports 4 Role tiers (CAIO, Security Lead, Finance Auditor, Read-Only Observer). Observer roles freeze form controls and policy sliders automatically.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
