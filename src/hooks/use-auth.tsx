"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "@/lib/data/types";
import { apiFetch } from "@/lib/api/client";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import {
  canEditSettings as canEditSettingsFor,
  canManageMembers as canManageMembersFor,
  canSendMessages as canSendMessagesFor,
  isAccountRole,
  type AccountRole,
} from "@/lib/auth/roles";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string | null;
  beta_features: string[];
  account_id: string | null;
  account_role: AccountRole | null;
}

export interface AccountSummary {
  id: string;
  name: string;
  default_currency: string;
}

export type AccountStatus = "loading" | "ready" | "unlinked" | "error";

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  accountStatus: AccountStatus;
  accountStatusDetail: string | null;
  accountId: string | null;
  accountRole: AccountRole | null;
  account: AccountSummary | null;
  defaultCurrency: string;
  isOwner: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isViewer: boolean;
  canManageMembers: boolean;
  canEditSettings: boolean;
  canSendMessages: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type MePayload = {
  user: User | null;
  profile: Profile | null;
  account: AccountSummary | null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [statusDetail, setStatusDetail] = useState<string | null>(null);

  const fetchAuth = useCallback(async () => {
    try {
      const data = await apiFetch<MePayload>("/api/auth/me");
      if (data?.user) {
        setUser(data.user);
        setProfile(data.profile ?? null);
        setAccount(data.account ?? null);
        setStatusDetail(null);
      } else {
        setUser(null);
        setProfile(null);
        setAccount(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
      setAccount(null);
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  const signOut = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
      setProfile(null);
      setAccount(null);
      if (typeof window !== "undefined") {
        window.location.assign(window.location.origin + "/login");
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchAuth();
  }, [fetchAuth]);

  const accountRole: AccountRole | null = useMemo(() => {
    if (!profile?.account_role) return null;
    return isAccountRole(profile.account_role) ? profile.account_role : null;
  }, [profile?.account_role]);

  const accountId = profile?.account_id ?? null;

  const accountStatus: AccountStatus = useMemo(() => {
    if (loading || profileLoading) return "loading";
    if (!user) return "unlinked";
    if (statusDetail) return "error";
    if (!accountId || !accountRole) return "unlinked";
    return "ready";
  }, [loading, profileLoading, user, statusDetail, accountId, accountRole]);

  const defaultCurrency = account?.default_currency ?? DEFAULT_CURRENCY;
  const isOwner = accountRole === "owner";
  const isAdmin = accountRole === "admin";
  const isAgent = accountRole === "agent";
  const isViewer = accountRole === "viewer";
  const canManageMembers = accountRole ? canManageMembersFor(accountRole) : false;
  const canEditSettings = accountRole ? canEditSettingsFor(accountRole) : false;
  const canSendMessages = accountRole ? canSendMessagesFor(accountRole) : false;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      signOut,
      refreshProfile,
      accountStatus,
      accountStatusDetail: statusDetail,
      accountId,
      accountRole,
      account,
      defaultCurrency,
      isOwner,
      isAdmin,
      isAgent,
      isViewer,
      canManageMembers,
      canEditSettings,
      canSendMessages,
    }),
    [
      user,
      profile,
      loading,
      profileLoading,
      signOut,
      refreshProfile,
      accountStatus,
      statusDetail,
      accountId,
      accountRole,
      account,
      defaultCurrency,
      isOwner,
      isAdmin,
      isAgent,
      isViewer,
      canManageMembers,
      canEditSettings,
      canSendMessages,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
