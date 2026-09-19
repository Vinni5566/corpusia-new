import { MessageSquare, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NegotiationChat from "@/components/corpus/NegotiationChat";
import ActivityTerminal from "@/components/corpus/ActivityTerminal";
import EmptyState from "@/components/corpus/EmptyState";
import { useCorpusData } from "@/context/CorpusDataContext";

export default function Negotiation() {
  const { activeInitiative, logs } = useCorpusData();

  if (!activeInitiative) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No active negotiation"
        description="Launch an initiative to watch Marketing and Finance agents negotiate live."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare size={18} style={{ color: "hsl(var(--glow-pink))" }} />
            Agent Negotiation Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="scrollbar-thin max-h-[600px] overflow-y-auto">
          <NegotiationChat logs={logs} />
        </CardContent>
      </Card>

      <Card className="glass-panel border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal size={18} className="text-primary" />
            Live Activity Terminal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTerminal logs={logs} activeInitiative={activeInitiative} />
        </CardContent>
      </Card>
    </div>
  );
}
