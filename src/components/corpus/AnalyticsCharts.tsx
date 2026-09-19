import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsData } from "@/lib/corpus/types";

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const chartData = Object.entries(data.agentMetrics).map(([agent, metrics]) => ({
    agent,
    avgResponseMs: metrics.avgResponseMs,
    successCount: metrics.successCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="agent"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent) / 0.06)" }}
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            color: "hsl(var(--popover-foreground))",
            fontSize: "0.8rem",
          }}
        />
        <Bar dataKey="avgResponseMs" name="Avg Response (ms)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        <Bar dataKey="successCount" name="Successes" fill="hsl(var(--glow-cyan))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
