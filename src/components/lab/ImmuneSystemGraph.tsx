import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ImmuneSystemGraphProps {
  blocklistVersion: number;
  showShield: boolean;
  showTelemetry: boolean;
  height?: number;
}

const NODES = [
  { id: "orchestrator", label: "Orchestrator", x: 0.5, y: 0.5 },
  { id: "marketing", label: "Marketing", x: 0.2, y: 0.25 },
  { id: "finance", label: "Finance", x: 0.8, y: 0.25 },
  { id: "engineering", label: "Engineering", x: 0.5, y: 0.85 },
];

const AGENT_COLOR: Record<string, string> = {
  orchestrator: "#c4b5fd",
  marketing: "#f9a8d4",
  finance: "#6ee7b7",
  engineering: "#93c5fd",
};

// Section 4/7 — a SEPARATE D3 graph from the real corpus LineageGraph.tsx.
// Renders the shield bubble + shrinking attack-surface ring + telemetry
// overlay as independently toggleable layers so it never gets visually
// noisy per the spec's explicit instruction.
export default function ImmuneSystemGraph({
  blocklistVersion,
  showShield,
  showTelemetry,
  height = 320,
}: ImmuneSystemGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const container = svg.parentElement;
    const width = container ? container.clientWidth : 500;

    const selection = d3.select(svg);
    selection.selectAll("*").remove();
    selection.attr("viewBox", `0 0 ${width} ${height}`);

    const defs = selection.append("defs");
    const glow = defs
      .append("filter")
      .attr("id", "immune-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const orchestrator = NODES[0];
    const orchestratorPos = { x: orchestrator.x * width, y: orchestrator.y * height };

    // Links (static, orchestrator to each other node)
    NODES.slice(1).forEach((node) => {
      selection
        .append("line")
        .attr("x1", orchestratorPos.x)
        .attr("y1", orchestratorPos.y)
        .attr("x2", node.x * width)
        .attr("y2", node.y * height)
        .attr("stroke", "hsl(var(--border))")
        .attr("stroke-width", 1.5);
    });

    // Attack-surface ring — shrinks as blocklistVersion increments
    if (showShield) {
      const maxRadius = Math.min(width, height) * 0.42;
      const shrinkFactor = Math.max(0.35, 1 - (blocklistVersion - 1) * 0.08);
      const attackRadius = maxRadius * shrinkFactor;

      selection
        .append("circle")
        .attr("cx", orchestratorPos.x)
        .attr("cy", orchestratorPos.y)
        .attr("r", attackRadius)
        .attr("fill", "hsl(var(--destructive) / 0.05)")
        .attr("stroke", "hsl(var(--destructive) / 0.4)")
        .attr("stroke-dasharray", "4 4")
        .style("transition", "r 0.6s ease");

      // Shield bubble around orchestrator
      selection
        .append("circle")
        .attr("cx", orchestratorPos.x)
        .attr("cy", orchestratorPos.y)
        .attr("r", 34)
        .attr("fill", "none")
        .attr("stroke", "hsl(var(--glow-cyan))")
        .attr("stroke-width", 2)
        .attr("opacity", 0.6)
        .style("filter", "url(#immune-glow)");
    }

    // Nodes
    NODES.forEach((node) => {
      const pos = { x: node.x * width, y: node.y * height };
      const g = selection.append("g").attr("transform", `translate(${pos.x},${pos.y})`);

      g.append("circle")
        .attr("r", node.id === "orchestrator" ? 26 : 20)
        .attr("fill", AGENT_COLOR[node.id])
        .attr("opacity", 0.85)
        .style("filter", "url(#immune-glow)");

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", node.id === "orchestrator" ? 42 : 36)
        .style("font-size", "0.75rem")
        .style("font-weight", "600")
        .style("fill", "hsl(var(--foreground))")
        .text(node.label);

      if (showTelemetry) {
        const barWidth = 3;
        const gap = 2;
        const bars = 4;
        const barsGroup = g
          .append("g")
          .attr("transform", `translate(${-(bars * (barWidth + gap)) / 2}, ${-46})`);
        for (let i = 0; i < bars; i++) {
          const h = 4 + Math.random() * 10;
          barsGroup
            .append("rect")
            .attr("x", i * (barWidth + gap))
            .attr("y", -h)
            .attr("width", barWidth)
            .attr("height", h)
            .attr("rx", 1)
            .attr("fill", "hsl(var(--glow-cyan) / 0.7)");
        }
      }
    });
  }, [blocklistVersion, showShield, showTelemetry, height]);

  return <svg ref={svgRef} className="w-full" style={{ height }} />;
}
