import { useState } from "react";
import { Brain, Cpu, Database, Layers, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MEMORY_BUFFERS = {
  marketing: {
    agent: "Marketing Agent",
    contextTokens: "1,240 / 4,096 tokens",
    vectorDocs: [
      { doc: "Q4 Marketing Spend Strategy Guide 2026", similarity: 0.92 },
      { doc: "Social Media ROI Policy Caps v3", similarity: 0.88 },
      { doc: "Brand Campaign Guidelines PDF", similarity: 0.79 },
    ],
    shortTermMemory: [
      "Requested $9,500 budget allocation for Q4 feature launch.",
      "Received counter-offer $7,200 from Finance Agent.",
      "Accepted Nash Bargaining solution at 94.2% Pareto efficiency.",
    ],
  },
  finance: {
    agent: "Finance Agent",
    contextTokens: "1,890 / 4,096 tokens",
    vectorDocs: [
      { doc: "Corporate Treasury Spending Cap Policy 2026", similarity: 0.96 },
      { doc: "Strict Mode Verification Protocol v2", similarity: 0.91 },
      { doc: "Quarterly Departmental Variance Limits", similarity: 0.84 },
    ],
    shortTermMemory: [
      "Evaluated Marketing request $9,500 against policy cap $6,000.",
      "Triggered Nash Bargaining solver (800 convergence steps).",
      "Symbolic verifier confirmed policy compliance.",
    ],
  },
  orchestrator: {
    agent: "Orchestrator Agent",
    contextTokens: "2,410 / 8,192 tokens",
    vectorDocs: [
      { doc: "FSM Initiative State Machine Transitions", similarity: 0.98 },
      { doc: "Multi-Agent Autonomy Rate Constraints", similarity: 0.93 },
    ],
    shortTermMemory: [
      "Initialized campaign state: Marketing -> Finance -> Ratified.",
      "Monitored live WebSocket event broadcasts.",
      "Updated system autonomy gauge to 85%.",
    ],
  },
};

export default function AgentMemoryInspector() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost-glass" size="sm" className="gap-1.5 text-xs text-primary border-primary/30">
          <Brain size={14} />
          Agent Memory & RAG
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-primary/20 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Brain size={18} className="text-primary" />
            Agent Vector Memory & RAG Explainability
          </DialogTitle>
          <DialogDescription>
            Inspect real-time vector retrieval similarity scores, retrieved guidelines, and short-term agent memory.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="marketing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/40">
            <TabsTrigger value="marketing" className="text-xs">Marketing Agent</TabsTrigger>
            <TabsTrigger value="finance" className="text-xs">Finance Agent</TabsTrigger>
            <TabsTrigger value="orchestrator" className="text-xs">Orchestrator</TabsTrigger>
          </TabsList>

          {Object.entries(MEMORY_BUFFERS).map(([key, data]) => (
            <TabsContent key={key} value={key} className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Cpu size={14} className="text-glow-cyan" />
                  {data.agent} Context Budget:
                </span>
                <span className="font-mono-terminal text-primary">{data.contextTokens}</span>
              </div>

              <div>
                <h5 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <Database size={12} /> Retrieved RAG Vector Documents
                </h5>
                <div className="flex flex-col gap-2">
                  {data.vectorDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-border/40 bg-background/20 px-3 py-2 text-xs"
                    >
                      <span className="truncate text-foreground/90">{doc.doc}</span>
                      <Badge variant="secondary" className="font-mono-terminal text-[0.65rem] text-success">
                        {(doc.similarity * 100).toFixed(0)}% match
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <Layers size={12} /> Short-Term Memory Ring Buffer
                </h5>
                <div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-background/30 p-3 font-mono-terminal text-xs text-foreground/80">
                  {data.shortTermMemory.map((mem, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{mem}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
