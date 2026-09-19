import { createContext, useContext, useState, type ReactNode } from "react";

export type EnterpriseRole = "caio" | "security_lead" | "finance_auditor" | "observer";

export interface RoleInfo {
  key: EnterpriseRole;
  label: string;
  badge: string;
  color: string;
  canEditConstitution: boolean;
  canManageBlocklist: boolean;
  canBargain: boolean;
}

export const ROLE_DEFINITIONS: Record<EnterpriseRole, RoleInfo> = {
  caio: {
    key: "caio",
    label: "Chief AI Officer (CAIO)",
    badge: "Full Admin",
    color: "hsl(var(--glow-pink))",
    canEditConstitution: true,
    canManageBlocklist: true,
    canBargain: true,
  },
  security_lead: {
    key: "security_lead",
    label: "AI Security Lead",
    badge: "Security Admin",
    color: "hsl(var(--destructive))",
    canEditConstitution: false,
    canManageBlocklist: true,
    canBargain: false,
  },
  finance_auditor: {
    key: "finance_auditor",
    label: "Finance Auditor",
    badge: "Finance Admin",
    color: "hsl(var(--glow-cyan))",
    canEditConstitution: false,
    canManageBlocklist: false,
    canBargain: true,
  },
  observer: {
    key: "observer",
    label: "Read-Only Observer",
    badge: "View Only",
    color: "hsl(var(--muted-foreground))",
    canEditConstitution: false,
    canManageBlocklist: false,
    canBargain: false,
  },
};

interface AuthContextState {
  role: EnterpriseRole;
  roleInfo: RoleInfo;
  setRole: (role: EnterpriseRole) => void;
}

const AuthContext = createContext<AuthContextState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<EnterpriseRole>("caio");

  const value: AuthContextState = {
    role,
    roleInfo: ROLE_DEFINITIONS[role],
    setRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
