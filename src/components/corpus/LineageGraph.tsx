import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { GraphData, InitiativeStatus } from "@/lib/corpus/types";
import { getIsActiveAgent, normalizeAgentKey } from "@/lib/corpus/agents";

interface LineageGraphProps {
  data: GraphData | null;
  activeStatus?: InitiativeStatus;
  height?: number;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  label?: string;
}

const AGENT_HUES: Record<string, [string, string]> = {
  orchestrator: ["#c4b5fd", "#7c3aed"],
  marketing: ["#f9a8d4", "#db2777"],
  finance: ["#6ee7b7", "#059669"],
  engineering: ["#93c5fd", "#2563eb"],
  human: ["#fcd34d", "#d97706"],
  default: ["#cbd5e1", "#64748b"],
};

export default function LineageGraph({
  data,
  activeStatus,
  height = 420,
}: LineageGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(700);
  const [revealedStage, setRevealedStage] = useState<number>(1);

  // Auto-expand network step by step upon receiving data or kickoff
  useEffect(() => {
    if (!data) return;
    setRevealedStage(1);

    const timer1 = setTimeout(() => setRevealedStage(2), 500);
    const timer2 = setTimeout(() => setRevealedStage(3), 1000);
    const timer3 = setTimeout(() => setRevealedStage(4), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current?.parentElement) return;
    const parent = svgRef.current.parentElement;

    const updateWidth = () => {
      const w = parent.clientWidth;
      if (w > 50) {
        setMeasuredWidth(w);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const clientW = container ? container.clientWidth : 0;
    const width = clientW > 50 ? clientW : Math.max(measuredWidth, 700);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const defs = svg.append("defs");

    const glowFilter = defs
      .append("filter")
      .attr("id", "corpus-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    glowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const linkGlow = defs
      .append("filter")
      .attr("id", "corpus-link-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    linkGlow.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
    const lm = linkGlow.append("feMerge");
    lm.append("feMergeNode").attr("in", "blur");
    lm.append("feMergeNode").attr("in", "SourceGraphic");

    Object.entries(AGENT_HUES).forEach(([key, colors]) => {
      const grad = defs
        .append("radialGradient")
        .attr("id", `corpus-grad-${key}`)
        .attr("cx", "30%")
        .attr("cy", "30%")
        .attr("r", "70%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", colors[0]);
      grad.append("stop").attr("offset", "100%").attr("stop-color", colors[1]);
    });

    // Filter nodes based on progressive revealedStage
    // Stage 1: Orchestrator / start only
    // Stage 2: Orchestrator + Marketing
    // Stage 3: Orchestrator + Marketing + Finance
    // Stage 4: Full network
    const isNodeRevealed = (nodeId: string) => {
      const key = normalizeAgentKey(nodeId);
      if (key === "orchestrator" || nodeId === "start") return true;
      if (revealedStage >= 2 && (key === "marketing" || nodeId === "fsm_planning")) return true;
      if (revealedStage >= 3 && (key === "finance" || nodeId === "agent_mkt")) return true;
      if (revealedStage >= 4) return true;
      return false;
    };

    const activeNodesData = data.nodes.filter((n) => isNodeRevealed(n.id));
    const activeNodeIds = new Set(activeNodesData.map((n) => n.id));

    const nodes: SimNode[] = activeNodesData.map((n) => ({ ...n }));
    const links: SimLink[] = data.edges
      .filter((e) => activeNodeIds.has(e.from) && activeNodeIds.has(e.to))
      .map((e) => ({
        source: e.from,
        target: e.to,
        label: e.label,
      }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(150),
      )
      .force("charge", d3.forceManyBody().strength(-340))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(48))
      .force("x", d3.forceX(width / 2).strength(0.06))
      .force("y", d3.forceY(height / 2).strength(0.06));

    let tooltip = d3.select<HTMLDivElement, unknown>("body").select<HTMLDivElement>(".corpus-lineage-tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "corpus-lineage-tooltip")
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("background", "hsl(var(--popover) / 0.98)")
        .style("color", "hsl(var(--popover-foreground))")
        .style("padding", "0.5rem 0.85rem")
        .style("border-radius", "0.5rem")
        .style("font-size", "0.75rem")
        .style("max-width", "280px")
        .style("line-height", "1.4")
        .style("border", "1px solid hsl(var(--border))")
        .style("box-shadow", "0 12px 32px -8px rgba(0,0,0,0.6)")
        .style("z-index", "9999")
        .style("opacity", "0")
        .style("transition", "opacity 0.15s ease");
    }

    const linkHitArea = svg
      .append("g")
      .selectAll("path.hit")
      .data(links)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 18)
      .style("cursor", "pointer");

    const link = svg
      .append("g")
      .selectAll("path.link-line")
      .data(links)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 1.5)
      .style("pointer-events", "none");

    // Fast particles stream 1
    const particles = svg
      .append("g")
      .selectAll("circle.particle")
      .data(links)
      .enter()
      .append("circle")
      .attr("r", 3.5)
      .attr("fill", "hsl(var(--glow-cyan))")
      .style("filter", "url(#corpus-glow)")
      .each(function (d) {
        (d as SimLink & { t: number }).t = Math.random();
      });

    // Fast particles stream 2 (offset)
    const particles2 = svg
      .append("g")
      .selectAll("circle.particle-2")
      .data(links)
      .enter()
      .append("circle")
      .attr("r", 2.5)
      .attr("fill", "#a7f3d0")
      .style("filter", "url(#corpus-glow)")
      .each(function (d) {
        (d as SimLink & { t2: number }).t2 = (Math.random() + 0.5) % 1;
      });

    function getNodeLabel(node: string | SimNode): string {
      return typeof node === "string" ? node : node.label || node.id || "";
    }

    linkHitArea
      .on("mouseenter", function (_event, d) {
        link
          .filter((ld) => ld === d)
          .attr("stroke", "hsl(var(--primary) / 0.7)")
          .attr("stroke-width", 2.5)
          .style("filter", "url(#corpus-link-glow)");

        if (d.label) {
          tooltip
            .html(
              `<strong>${getNodeLabel(d.source)} &rarr; ${getNodeLabel(d.target)}</strong><br/>${d.label}`,
            )
            .style("opacity", "1");
        }
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${(event as MouseEvent).clientX + 14}px`)
          .style("top", `${(event as MouseEvent).clientY - 10}px`);
      })
      .on("mouseleave", function (_event, d) {
        link
          .filter((ld) => ld === d)
          .attr("stroke", "hsl(var(--border))")
          .attr("stroke-width", 1.5)
          .style("filter", "none");
        tooltip.style("opacity", "0");
      });

    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const node = svg
      .append("g")
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .call(drag);

    node
      .append("circle")
      .attr("class", "pulse-ring")
      .attr("r", 30)
      .attr("fill", "none")
      .attr("stroke", (d) => {
        const key = normalizeAgentKey(d.id);
        return AGENT_HUES[key]?.[0] ?? AGENT_HUES.default[0];
      })
      .attr("stroke-width", 1.5)
      .attr("opacity", (d) => (getIsActiveAgent(d.id, activeStatus) ? 0.5 : 0));

    node
      .append("circle")
      .attr("r", (d) => (getIsActiveAgent(d.id, activeStatus) ? 25 : 19))
      .attr("fill", (d) => {
        const key = normalizeAgentKey(d.id);
        const colorKey = AGENT_HUES[key] ? key : "default";
        return `url(#corpus-grad-${colorKey})`;
      })
      .style("filter", (d) =>
        getIsActiveAgent(d.id, activeStatus) ? "url(#corpus-glow)" : "none",
      )
      .attr("stroke", (d) =>
        getIsActiveAgent(d.id, activeStatus)
          ? "hsl(var(--foreground))"
          : "hsl(var(--border))",
      )
      .attr("stroke-width", (d) =>
        getIsActiveAgent(d.id, activeStatus) ? 2.5 : 1.5,
      );

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (getIsActiveAgent(d.id, activeStatus) ? 38 : 32))
      .style("font-size", "0.78rem")
      .style("font-weight", "600")
      .style("fill", "hsl(var(--foreground))")
      .style("letter-spacing", "0.02em")
      .text((d) => d.label);

    function animatePulse() {
      node
        .selectAll(".pulse-ring")
        .filter(function () {
          const d = d3.select<SVGCircleElement, SimNode>(this as SVGCircleElement).datum();
          return getIsActiveAgent(d.id, activeStatus);
        })
        .transition()
        .duration(1200)
        .attr("r", 36)
        .attr("opacity", 0)
        .transition()
        .duration(0)
        .attr("r", 26)
        .attr("opacity", 0.5)
        .on("end", animatePulse);
    }
    animatePulse();

    simulation.on("tick", () => {
      const pathStr = (d: SimLink) => {
        const s = d.source as SimNode;
        const t = d.target as SimNode;
        return `M${s.x},${s.y} L${t.x},${t.y}`;
      };
      link.attr("d", pathStr);
      linkHitArea.attr("d", pathStr);

      // Fast particle stream movement
      particles
        .attr("cx", (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const t0 = (d as SimLink & { t: number }).t;
          return (s.x ?? 0) + t0 * ((t.x ?? 0) - (s.x ?? 0));
        })
        .attr("cy", (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const t0 = (d as SimLink & { t: number }).t;
          return (s.y ?? 0) + t0 * ((t.y ?? 0) - (s.y ?? 0));
        })
        .each(function (d) {
          const link0 = d as SimLink & { t: number };
          link0.t = (link0.t + 0.024) % 1; // High speed particle flow!
        });

      particles2
        .attr("cx", (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const t0 = (d as SimLink & { t2: number }).t2;
          return (s.x ?? 0) + t0 * ((t.x ?? 0) - (s.x ?? 0));
        })
        .attr("cy", (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const t0 = (d as SimLink & { t2: number }).t2;
          return (s.y ?? 0) + t0 * ((t.y ?? 0) - (s.y ?? 0));
        })
        .each(function (d) {
          const link0 = d as SimLink & { t2: number };
          link0.t2 = (link0.t2 + 0.024) % 1; // Second fast stream particle!
        });

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, activeStatus, height, measuredWidth, revealedStage]);

  if (!data) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground"
        style={{ height }}
      >
        No lineage data yet.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 rounded-md border border-border/40 bg-background/80 px-2.5 py-1 text-[11px] font-mono-terminal backdrop-blur">
        <span className="flex items-center gap-1.5 text-primary">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          Network Growth Stage {revealedStage}/4
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground">High-Speed Packet Stream</span>
        {revealedStage < 4 && (
          <button
            onClick={() => setRevealedStage(4)}
            className="ml-1 text-xs text-primary underline hover:text-primary/80"
          >
            Expand All
          </button>
        )}
        {revealedStage === 4 && (
          <button
            onClick={() => setRevealedStage(1)}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Replay Growth
          </button>
        )}
      </div>
      <svg ref={svgRef} className="w-full" style={{ height }} />
    </div>
  );
}
