import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  Network,
  ScrollText,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCorpusData } from "@/context/CorpusDataContext";

const NAV_ITEMS = [
  { to: "/", label: "Command Deck", icon: LayoutDashboard, end: true },
  { to: "/network", label: "Agent Network", icon: Network },
  { to: "/negotiation", label: "Negotiation", icon: Activity },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ledger", label: "Ledger", icon: ScrollText },
  { to: "/lab", label: "Governance Lab", icon: ShieldAlert },
];

export default function AppSidebar() {
  const { parentPageId } = useCorpusData();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border/35 bg-sidebar-background/15 backdrop-blur-lg backdrop-saturate-150 shadow-[inset_-1px_0_0_0_hsl(var(--foreground)/0.04)] md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-glow-cyan shadow-glow-violet">
          <Network size={18} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-base font-bold leading-none tracking-tight">CorpusAI</p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            Enterprise OS
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
              )
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <a
          href={parentPageId ? `https://notion.so/${parentPageId}` : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!parentPageId}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lg border border-sidebar-border/35 bg-sidebar-accent/10 backdrop-blur-md px-3 py-2.5 text-xs font-medium text-sidebar-foreground transition-colors",
            parentPageId ? "hover:border-primary/40 hover:text-foreground" : "pointer-events-none opacity-50",
          )}
        >
          Open Notion Workspace
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
}
