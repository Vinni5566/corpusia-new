import { NavLink } from "react-router-dom";
import { Activity, BarChart3, LayoutDashboard, Network, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Deck", icon: LayoutDashboard, end: true },
  { to: "/network", label: "Network", icon: Network },
  { to: "/negotiation", label: "Chat", icon: Activity },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
  { to: "/ledger", label: "Ledger", icon: ScrollText },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/60 bg-background/90 py-2 backdrop-blur-xl md:hidden">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[0.65rem] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
