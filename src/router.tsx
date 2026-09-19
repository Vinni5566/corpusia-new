import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import AppLayout from "./components/corpus/AppLayout";

const CommandDeck = lazy(() => import("./pages/CommandDeck"));
const AgentNetwork = lazy(() => import("./pages/AgentNetwork"));
const Negotiation = lazy(() => import("./pages/Negotiation"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Ledger = lazy(() => import("./pages/Ledger"));
const GovernanceLab = lazy(() => import("./pages/GovernanceLab"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
    <Loader2 className="animate-spin text-primary" size={28} />
    <p className="text-sm">Loading module...</p>
  </div>
);

export const routers = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        name: "home",
        element: (
          <Suspense fallback={<PageFallback />}>
            <CommandDeck />
          </Suspense>
        ),
      },
      {
        path: "network",
        name: "network",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AgentNetwork />
          </Suspense>
        ),
      },
      {
        path: "negotiation",
        name: "negotiation",
        element: (
          <Suspense fallback={<PageFallback />}>
            <Negotiation />
          </Suspense>
        ),
      },
      {
        path: "analytics",
        name: "analytics",
        element: (
          <Suspense fallback={<PageFallback />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: "ledger",
        name: "ledger",
        element: (
          <Suspense fallback={<PageFallback />}>
            <Ledger />
          </Suspense>
        ),
      },
      {
        path: "lab",
        name: "governance-lab",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GovernanceLab />
          </Suspense>
        ),
      },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: (
      <Suspense fallback={<PageFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
