"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type SignInInput = {
  email: string;
  password: string;
  remember: boolean;
};

type SignInResult =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

type AuthContextShape = {
  user: AuthUser | null;
  accessToken: string | null;
  initializing: boolean;
  signIn: (input: SignInInput) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

type PersistMode = "local" | "session";

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const LOCAL_KEY = "cantina-auth";
const SESSION_KEY = "cantina-auth-session";

type StoredAuth = {
  user: AuthUser;
  accessToken: string;
};

type StoredData = StoredAuth & { persist: PersistMode };

function readStored(): StoredData | null {
  if (typeof window === "undefined") return null;

  const localRaw = window.localStorage.getItem(LOCAL_KEY);
  if (localRaw) {
    try {
      const parsed = JSON.parse(localRaw) as StoredAuth;
      if (parsed?.user && parsed?.accessToken) {
        return { ...parsed, persist: "local" };
      }
    } catch {}
  }

  const sessionRaw = window.sessionStorage.getItem(SESSION_KEY);
  if (sessionRaw) {
    try {
      const parsed = JSON.parse(sessionRaw) as StoredAuth;
      if (parsed?.user && parsed?.accessToken) {
        return { ...parsed, persist: "session" };
      }
    } catch {}
  }

  return null;
}

function storeAuth(data: StoredAuth, mode: PersistMode) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(data);

  if (mode === "local") {
    window.localStorage.setItem(LOCAL_KEY, payload);
    window.sessionStorage.removeItem(SESSION_KEY);
  } else {
    window.sessionStorage.setItem(SESSION_KEY, payload);
    window.localStorage.removeItem(LOCAL_KEY);
  }
}

function clearStored() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const persistMode = useRef<PersistMode | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const persistAuth = useCallback(
    (data: StoredAuth, mode?: PersistMode) => {
      const persist = mode ?? persistMode.current ?? "session";
      persistMode.current = persist;
      storeAuth(data, persist);
    },
    []
  );

  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("refresh failed");
      }
      const data = (await res.json()) as { accessToken: string };
      setAccessToken(data.accessToken);
      if (user) {
        persistAuth({ user, accessToken: data.accessToken });
      }
      return data.accessToken;
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      clearStored();
      throw error;
    }
  }, [apiBase, persistAuth, user]);

  const safeRefreshProfile = useCallback(
    async (token?: string, overridePersist?: PersistMode) => {
      const currentToken = token ?? accessTokenRef.current;
      if (!currentToken) return;

      let res = await fetch(`${apiBase}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
      });

      if (res.status === 401) {
        try {
          const newToken = await refreshToken();
          res = await fetch(`${apiBase}/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
            credentials: "include",
          });
        } catch {
          return;
        }
      }

      if (!res.ok) return;

      const data = (await res.json()) as { user: AuthUser };
      setUser(data.user);
      const tokenToPersist = accessTokenRef.current;
      if (tokenToPersist) {
        persistAuth({ user: data.user, accessToken: tokenToPersist }, overridePersist);
      }
    },
    [apiBase, persistAuth, refreshToken]
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const stored = readStored();
      if (!active) return;

      if (stored) {
        persistMode.current = stored.persist;
        setUser(stored.user);
        setAccessToken(stored.accessToken);
        try {
          await safeRefreshProfile(stored.accessToken, stored.persist);
        } finally {
          if (active) {
            setInitializing(false);
          }
        }
      } else if (active) {
        setInitializing(false);
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [safeRefreshProfile]);

  const signIn = useCallback(
    async ({ email, password, remember }: SignInInput): Promise<SignInResult> => {
      try {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const result = await res.json().catch(() => ({}));
          const message = typeof result?.message === "string" ? result.message : "Falha ao entrar.";
          return { ok: false, message };
        }

        const data = (await res.json()) as { user: AuthUser; accessToken: string };
        setUser(data.user);
        setAccessToken(data.accessToken);
        accessTokenRef.current = data.accessToken;
        const mode: PersistMode = remember ? "local" : "session";
        persistMode.current = mode;
        persistAuth({ user: data.user, accessToken: data.accessToken }, mode);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: "Não foi possível conectar ao servidor." };
      }
    },
    [apiBase, persistAuth]
  );

  const signOut = useCallback(async () => {
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    setUser(null);
    setAccessToken(null);
    accessTokenRef.current = null;
    persistMode.current = null;
    clearStored();
  }, [apiBase]);

  const value: AuthContextShape = useMemo(
    () => ({
      user,
      accessToken,
      initializing,
      signIn,
      signOut,
      refreshProfile: safeRefreshProfile,
    }),
    [user, accessToken, initializing, signIn, signOut, safeRefreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
