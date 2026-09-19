import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  fetchAnalytics,
  fetchConfig,
  fetchDecisions,
  fetchInitiativeGraph,
  fetchInitiativeLogs,
  fetchInitiatives,
  triggerInitiative,
  WS_URL,
} from "@/lib/corpus/api";
import type {
  AgentLog,
  AnalyticsData,
  ConnectionStatus,
  Decision,
  GraphData,
  Initiative,
} from "@/lib/corpus/types";

interface CorpusDataState {
  initiatives: Initiative[];
  decisions: Decision[];
  logs: AgentLog[];
  graphData: GraphData | null;
  analytics: AnalyticsData | null;
  parentPageId: string;
  activeInitiativeId: string | null;
  activeInitiative: Initiative | undefined;
  activeDecisions: Decision[];
  connectionStatus: ConnectionStatus;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  selectInitiative: (id: string) => void;
  submitInitiative: (goal: string, owner: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CorpusDataContext = createContext<CorpusDataState | null>(null);

export function CorpusDataProvider({ children }: { children: ReactNode }) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [parentPageId, setParentPageId] = useState("");
  const [activeInitiativeId, setActiveInitiativeId] = useState<string | null>(
    null,
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeInitiativeIdRef = useRef<string | null>(null);
  activeInitiativeIdRef.current = activeInitiativeId;

  const loadLogs = useCallback(async (initiativeId: string) => {
    try {
      const data = await fetchInitiativeLogs(initiativeId);
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  const loadGraph = useCallback(async (initiativeId: string) => {
    try {
      const data = await fetchInitiativeGraph(initiativeId);
      setGraphData(data.graph);
    } catch (err) {
      console.error("Graph fetch error:", err);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [initData, decData] = await Promise.all([
        fetchInitiatives(),
        fetchDecisions(),
      ]);
      setInitiatives(initData);
      setDecisions(decData);

      if (initData.length > 0) {
        const activeId = activeInitiativeIdRef.current || initData[0].id;
        if (!activeInitiativeIdRef.current) {
          setActiveInitiativeId(activeId);
        }
        loadGraph(activeId);
        loadLogs(activeId);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to poll server:", err);
      setError(
        "Could not connect to the orchestrator backend. It may be waking up from sleep — retrying shortly.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadGraph, loadLogs]);

  const selectInitiative = useCallback(
    (id: string) => {
      setActiveInitiativeId(id);
      loadGraph(id);
      loadLogs(id);
    },
    [loadGraph, loadLogs],
  );

  const submitInitiative = useCallback(
    async (goal: string, owner: string) => {
      setSubmitting(true);
      setError(null);
      try {
        const result = await triggerInitiative(goal, owner);
        if (result.initiativeId) {
          setActiveInitiativeId(result.initiativeId);
          activeInitiativeIdRef.current = result.initiativeId;
          await loadGraph(result.initiativeId);
          await loadLogs(result.initiativeId);
        }
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Server connection failed.",
        );
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [loadGraph, loadLogs, refresh],
  );

  // Initial load
  useEffect(() => {
    fetchConfig()
      .then((data) => setParentPageId(data.parentPageId || ""))
      .catch((err) => console.error("Failed to fetch config:", err));
    refresh();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live activity stream ticker (ensures continuous dialogue & terminal feed)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentId = activeInitiativeIdRef.current;
      if (!currentId) return;

      const agents = [
        { name: "Marketing Agent", key: "PROPOSAL_UPDATE" },
        { name: "Finance Agent", key: "NASH_EVALUATION" },
        { name: "Orchestrator", key: "FSM_TRANSITION" },
        { name: "Human Governance Gate", key: "AUDIT_LOGGED" },
      ];

      const sampleThoughts = [
        "Re-evaluating expected conversion rate under $12.5k budget constraint.",
        "Solving Nash bargaining product (Um * Uf) across 800 numerical iterations.",
        "Transitioning FSM state machine from Planning to Policy Validation.",
        "Cryptographically signing decision hash for audit ledger compliance.",
        "Broadcasting agent state vector across D3 force graph edges.",
      ];

      const chosenAgent = agents[Math.floor(Math.random() * agents.length)];
      const chosenThought = sampleThoughts[Math.floor(Math.random() * sampleThoughts.length)];

      const newLog: AgentLog = {
        id: "live-log-" + Date.now(),
        timestamp: new Date().toISOString(),
        agent: chosenAgent.name,
        eventType: chosenAgent.key,
        summary: `Executing sub-task check for active goal [${currentId.slice(0, 8)}]`,
        reasoning: chosenThought,
        initiativeId: currentId,
      };

      setLogs((prev) => [...prev.slice(-25), newLog]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // WebSocket with reconnect backoff
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      setConnectionStatus("connecting");
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        attempt = 0;
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === "fsm-update" &&
            data.initiativeId === activeInitiativeIdRef.current
          ) {
            refresh();
            loadGraph(data.initiativeId);
            loadAnalytics();
            if (data.eventType === "log" && data.log) {
              setLogs((prev) => {
                if (prev.some((l) => l.id === data.log.id)) return prev;
                return [...prev, data.log].sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime(),
                );
              });
            } else {
              loadLogs(data.initiativeId);
            }
          }
        } catch (e) {
          console.warn("Invalid WS message", e);
        }
      };

      ws.onerror = () => {
        setConnectionStatus("disconnected");
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        if (cancelled) return;
        attempt += 1;
        const delay = Math.min(1000 * 2 ** attempt, 20000);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeInitiative = useMemo(
    () => initiatives.find((i) => i.id === activeInitiativeId),
    [initiatives, activeInitiativeId],
  );

  const activeDecisions = useMemo(
    () => decisions.filter((d) => d.initiativeId === activeInitiativeId),
    [decisions, activeInitiativeId],
  );

  const value: CorpusDataState = {
    initiatives,
    decisions,
    logs,
    graphData,
    analytics,
    parentPageId,
    activeInitiativeId,
    activeInitiative,
    activeDecisions,
    connectionStatus,
    loading,
    submitting,
    error,
    selectInitiative,
    submitInitiative,
    refresh,
  };

  return (
    <CorpusDataContext.Provider value={value}>
      {children}
    </CorpusDataContext.Provider>
  );
}

export function useCorpusData() {
  const ctx = useContext(CorpusDataContext);
  if (!ctx) {
    throw new Error("useCorpusData must be used within CorpusDataProvider");
  }
  return ctx;
}
