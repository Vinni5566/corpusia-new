import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "violet" | "cyan" | "pink" | "success" | "warning";
  className?: string;
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  violet: "text-primary bg-primary/10",
  cyan: "text-glow-cyan bg-accent/10",
  pink: "bg-[hsl(var(--glow-pink)/0.1)]",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "violet",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "glass-panel flex items-center gap-4 rounded-xl p-4 transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ACCENT_STYLES[accent])}>
        <Icon size={18} style={accent === "pink" ? { color: "hsl(var(--glow-pink))" } : undefined} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
