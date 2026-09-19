import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  fetchAttackLog,
  fetchCurrentConstitution,
  fetchDecisions,
  fetchLatestBargainingRounds,
  fetchLatestBlocklistVersion,
  fetchLatestBoardroomSession,
  fetchPendingAmendment,
} from "@/lib/lab/api";
import type { HistorySnapshot } from "@/lib/lab/api";
import { LAB_SUPABASE_CONFIGURED } from "@/lib/lab/config";
import type {
  AmendmentProposal,
  AttackLogEntry,
  BargainingRound,
  BoardroomSession,
  Constitution,
  LabDecision,
} from "@/lib/lab/types";

interface LabDataState {
  configured: boolean;
  constitution: Constitution | null;
  pendingAmendment: AmendmentProposal | null;
  decisions: LabDecision[];
  recentRounds: BargainingRound[];
  attackLog: AttackLogEntry[];
  blocklistVersion: number;
  boardroomSession: BoardroomSession | null;
  loading: boolean;
  error: string | null;
  isHistoricalView: boolean;
  historicalSnapshot: HistorySnapshot | null;
  applyHistoricalSnapshot: (snapshot: HistorySnapshot | null) => void;
  refresh: () => Promise<void>;
}

const LabDataContext = createContext<LabDataState | null>(null);

export function LabDataProvider({ children }: { children: ReactNode }) {
  const [liveConstitution, setLiveConstitution] = useState<Constitution | null>(null);
  const [constitution, setConstitution] = useState<Constitution | null>(null);
  const [pendingAmendment, setPendingAmendment] = useState<AmendmentProposal | null>(null);
  const [liveDecisions, setLiveDecisions] = useState<LabDecision[]>([]);
  const [decisions, setDecisions] = useState<LabDecision[]>([]);
  const [recentRounds, setRecentRounds] = useState<BargainingRound[]>([]);
  const [attackLog, setAttackLog] = useState<AttackLogEntry[]>([]);
  const [liveBlocklistVersion, setLiveBlocklistVersion] = useState(1);
  const [blocklistVersion, setBlocklistVersion] = useState(1);
  const [boardroomSession, setBoardroomSession] = useState<BoardroomSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [historicalSnapshot, setHistoricalSnapshot] = useState<HistorySnapshot | null>(null);
  const [isHistoricalView, setIsHistoricalView] = useState(false);

  const refresh = useCallback(async () => {
    if (!LAB_SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }
    try {
      const [
        constitutionData,
        amendmentData,
        decisionsData,
        roundsData,
        attackData,
        blocklistVersionData,
        boardroomData,
      ] = await Promise.all([
        fetchCurrentConstitution(),
        fetchPendingAmendment(),
        fetchDecisions(),
        fetchLatestBargainingRounds(),
        fetchAttackLog(),
        fetchLatestBlocklistVersion(),
        fetchLatestBoardroomSession(),
      ]);

      setLiveConstitution(constitutionData);
      setLiveDecisions(decisionsData);
      setLiveBlocklistVersion(blocklistVersionData);

      if (!isHistoricalView) {
        setConstitution(constitutionData);
        setDecisions(decisionsData);
        setBlocklistVersion(blocklistVersionData);
      }

      setPendingAmendment(amendmentData);
      setRecentRounds(roundsData);
      setAttackLog(attackData);
      setBoardroomSession(boardroomData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Governance Lab data.");
    } finally {
      setLoading(false);
    }
  }, [isHistoricalView]);

  const applyHistoricalSnapshot = useCallback(
    (snapshot: HistorySnapshot | null) => {
      if (!snapshot) {
        setIsHistoricalView(false);
        setHistoricalSnapshot(null);
        setConstitution(liveConstitution);
        setDecisions(liveDecisions);
        setBlocklistVersion(liveBlocklistVersion);
        return;
      }

      setIsHistoricalView(true);
      setHistoricalSnapshot(snapshot);

      if (snapshot.constitution) {
        setConstitution(snapshot.constitution);
      }
      if (snapshot.blocklistVersion) {
        setBlocklistVersion(snapshot.blocklistVersion);
      }
      if (snapshot.decision) {
        setDecisions([snapshot.decision]);
      }
    },
    [liveConstitution, liveDecisions, liveBlocklistVersion]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: LabDataState = {
    configured: LAB_SUPABASE_CONFIGURED,
    constitution,
    pendingAmendment,
    decisions,
    recentRounds,
    attackLog,
    blocklistVersion,
    boardroomSession,
    loading,
    error,
    isHistoricalView,
    historicalSnapshot,
    applyHistoricalSnapshot,
    refresh,
  };

  return <LabDataContext.Provider value={value}>{children}</LabDataContext.Provider>;
}

export function useLabData() {
  const ctx = useContext(LabDataContext);
  if (!ctx) {
    throw new Error("useLabData must be used within LabDataProvider");
  }
  return ctx;
}
