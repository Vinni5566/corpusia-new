import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/corpus/types";

interface ConnectionStatusPillProps {
  status: ConnectionStatus;
  className?: string;
}

const CONFIG: Record<ConnectionStatus, { label: string; dot: string; text: string }> = {
  connected: { label: "Live", dot: "bg-success", text: "text-success" },
  connecting: { label: "Connecting", dot: "bg-warning", text: "text-warning" },
  disconnected: { label: "Reconnecting", dot: "bg-destructive", text: "text-destructive" },
};

export default function ConnectionStatusPill({ status, className }: ConnectionStatusPillProps) {
  const config = CONFIG[status];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-border/30 bg-card/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            config.dot,
            status !== "disconnected" && "animate-ping",
          )}
        />
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", config.dot)} />
      </span>
      <span className={config.text}>{config.label}</span>
    </div>
  );
}
