import { useEffect, useState } from "react";
import { Activity, Cpu, Zap } from "lucide-react";

const AGENTS = ["Orchestrator", "Marketing", "Finance", "Engineering"] as const;

interface TelemetryReading {
  agent: string;
  latencyMs: number;
  tokens: number;
  memoryMb: number;
  history: number[];
}

export default function TelemetryHUD() {
  const [readings, setReadings] = useState<TelemetryReading[]>(
    AGENTS.map((agent) => ({
      agent,
      latencyMs: 120,
      tokens: 340,
      memoryMb: 64,
      history: [110, 125, 115, 130, 120],
    })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings((prev) =>
        prev.map((r) => {
          const nextLatency = Math.max(40, Math.round(r.latencyMs + (Math.random() - 0.5) * 50));
          const nextHistory = [...r.history.slice(1), nextLatency];
          return {
            ...r,
            latencyMs: nextLatency,
            tokens: Math.max(50, Math.round(r.tokens + (Math.random() - 0.5) * 90)),
            memoryMb: Math.max(20, Math.round(r.memoryMb + (Math.random() - 0.5) * 8)),
            history: nextHistory,
          };
        }),
      );
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const totalTokens = readings.reduce((sum, r) => sum + r.tokens, 0);
  const avgLatency = Math.round(readings.reduce((sum, r) => sum + r.latencyMs, 0) / readings.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-primary" />
          Agent System Telemetry
        </div>
        <div className="flex items-center gap-3 text-[0.65rem]">
          <span className="flex items-center gap-1 text-glow-cyan font-mono-terminal">
            <Zap size={10} /> {avgLatency} ms avg
          </span>
          <span className="flex items-center gap-1 text-glow-pink font-mono-terminal">
            <Cpu size={10} /> {totalTokens} tk/s
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {readings.map((r) => (
          <div key={r.agent} className="flex flex-col justify-between rounded-lg border border-border/50 bg-background/30 p-2.5">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="truncate text-[0.65rem] font-semibold text-foreground">{r.agent}</p>
                <Sparkline values={r.history} />
              </div>
              <div className="flex flex-col gap-1">
                <MiniBar label="latency" value={r.latencyMs} max={300} unit="ms" />
                <MiniBar label="tokens" value={r.tokens} max={800} unit="" />
                <MiniBar label="mem" value={r.memoryMb} max={128} unit="mb" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const width = 36;
  const height = 12;
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--glow-cyan))"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MiniBar({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-10 shrink-0 text-[0.55rem] uppercase text-muted-foreground">{label}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-glow-cyan transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-[0.55rem] text-muted-foreground font-mono-terminal">
        {Math.round(value)}
        {unit}
      </span>
    </div>
  );
}
