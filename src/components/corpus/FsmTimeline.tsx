import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Marketing", "Finance", "Sign-off", "Fired"];

interface FsmTimelineProps {
  currentStep: number;
}

export default function FsmTimeline({ currentStep }: FsmTimelineProps) {
  return (
    <div className="relative flex items-center justify-between px-2">
      <div className="absolute left-2 right-2 top-4 h-px bg-border" />
      <div
        className="absolute left-2 top-4 h-px bg-gradient-to-r from-primary to-glow-cyan transition-all duration-700"
        style={{
          width: `calc(${(Math.max(0, currentStep - 1) / (STEPS.length - 1)) * 100}% - ${currentStep > 1 ? 0 : 0}px)`,
        }}
      />
      {STEPS.map((label, idx) => {
        const step = idx + 1;
        const isCompleted = currentStep > step;
        const isActive = currentStep === step;
        return (
          <div key={label} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                isActive &&
                  "scale-110 border-primary bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--glow-violet)/0.6)]",
                isCompleted && "border-success bg-success text-background",
                !isActive && !isCompleted && "border-border bg-card text-muted-foreground",
              )}
            >
              {isCompleted ? <Check size={14} /> : step}
            </div>
            <span
              className={cn(
                "text-[0.7rem] font-medium text-muted-foreground",
                isActive && "font-semibold text-foreground",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
