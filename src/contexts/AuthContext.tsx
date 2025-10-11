"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";

type AuthUser = { id: number; name: string; email: string; };
type SignInInput = { email: string; password: string; remember?: boolean; };
type SignInResult = { ok: true } | { ok: false; message?: string; fieldErrors?: Record<string, string> };
type AuthContextShape = { user: AuthUser | null; accessToken: string | null; initializing: boolean; signIn: (input: SignInInput) => Promise<SignInResult>; signOut: () => Promise<void>; refreshProfile: () => Promise<void>; };
type PersistMode = "local" | "session";

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const LOCAL_KEY = "cantina-auth";
const SESSION_KEY = "cantina-auth-session";

type StoredAuth = { user: AuthUser; accessToken: string };
type StoredData = StoredAuth & { persist: PersistMode };

function readStored(): StoredData | null {
  if (typeof window === "undefined") return null;
  const l = window.localStorage.getItem(LOCAL_KEY);
  if (l) {
    try {
      const p = JSON.parse(l) as StoredAuth;
      if (p?.user && p?.accessToken) return { ...p, persist: "local" };
    } catch {}
  }
  const s = window.sessionStorage.getItem(SESSION_KEY);
  if (s) {
    try {
      const p = JSON.parse(s) as StoredAuth;
      if (p?.user && p?.accessToken) return { ...p, persist: "session" };
    } catch {}
  }
  return null;
}

function storeAuth(data: StoredAuth, mode: PersistMode) {
  const payload = JSON.stringify(data);
  if (mode === "local") { localStorage.setItem(LOCAL_KEY, payload); sessionStorage.removeItem(SESSION_KEY); }
  else { sessionStorage.setItem(SESSION_KEY, payload); localStorage.removeItem(LOCAL_KEY); }
}
function clearStored() { localStorage.removeItem(LOCAL_KEY); sessionStorage.removeItem(SESSION_KEY); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const persistMode = useRef<PersistMode | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const resetAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    accessTokenRef.current = null;
    userRef.current = null;
    persistMode.current = null;
    clearStored();
  }, []);

  useEffect(() => { accessTokenRef.current = accessToken; }, [accessToken]);

  useEffect(() => { userRef.current = user; }, [user]);

  const persistAuth = useCallback((data: StoredAuth, mode?: PersistMode) => {
    const persist = mode ?? persistMode.current ?? "local";
    persistMode.current = persist;
    storeAuth(data, persist);
  }, []);

  const refreshToken = useCallback(async () => {
    const res = await fetch(`${apiBase}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      const error = new Error("refresh failed");
      (error as any).status = res.status;
      throw error;
    }
    const data = (await res.json()) as { accessToken: string };
    setAccessToken(data.accessToken);
    const u = userRef.current;
    if (u) persistAuth({ user: u, accessToken: data.accessToken });
    return data.accessToken;
  }, [apiBase, persistAuth]);

  const safeRefreshProfile = useCallback(async (token?: string) => {
    const current = token ?? accessTokenRef.current;
    if (!current) return;
    let res = await fetch(`${apiBase}/auth/me`, { headers: { Authorization: `Bearer ${current}` }, credentials: "include", cache: "no-store" });
    if (res.status === 401) {
      try {
        const nt = await refreshToken();
        res = await fetch(`${apiBase}/auth/me`, { headers: { Authorization: `Bearer ${nt}` }, credentials: "include", cache: "no-store" });
      } catch (err: any) {
        if (err?.status === 401) {
          // refresh token inválido; mantenha dados locais para evitar logout abrupto
          return;
        }
        return;
      }
    }
    if (!res.ok) return;
    const data = (await res.json()) as { user: AuthUser };
    setUser(data.user);
    const tokenToPersist = accessTokenRef.current;
    if (tokenToPersist) persistAuth({ user: data.user, accessToken: tokenToPersist }, "local");
  }, [apiBase, persistAuth, refreshToken]);

  useEffect(() => {
    let active = true;
    (async () => {
      const stored = readStored();
      if (!active) return;
      if (stored) {
        persistMode.current = stored.persist;
        if (stored.persist !== "local") {
          persistAuth({ user: stored.user, accessToken: stored.accessToken }, "local");
          persistMode.current = "local";
        }
        userRef.current = stored.user;
        accessTokenRef.current = stored.accessToken;
        setUser(stored.user);
        setAccessToken(stored.accessToken);
      }

      try {
        const freshToken = await refreshToken();
        await safeRefreshProfile(freshToken);
      } catch (err: any) {
        if (err?.status === 401 && !stored) {
          resetAuth();
        }
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => { active = false; };
  }, [refreshToken, safeRefreshProfile, persistAuth, resetAuth]);

  const signIn = useCallback(async ({ email, password }: SignInInput): Promise<SignInResult> => {
    const attempt = (url: string) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password }) });
    const urls = [`${apiBase}/auth/login`, "/auth/login"];
    for (const url of urls) {
      try {
        const res = await attempt(url);
        const json = await res.json().catch(() => ({} as any));
        if (!res.ok) { const message = typeof json?.message === "string" ? json.message : "Credenciais inválidas"; return { ok: false, message }; }
        let token: string | null = json?.accessToken ?? json?.access_token ?? json?.token ?? json?.data?.accessToken ?? null;
        let nextUser: AuthUser | null = (json?.user ?? json?.data?.user) || null;
        if (!token) { try { token = await refreshToken(); } catch {} }
        if (!nextUser && token) {
          try {
            const me = await fetch(`${apiBase}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include", cache: "no-store" });
            if (me.ok) { const meJson = await me.json().catch(() => ({})); nextUser = meJson?.user ?? null; }
          } catch {}
        }
        if (token) { setAccessToken(token); accessTokenRef.current = token; }
        if (nextUser) setUser(nextUser);
        if (token && nextUser) {
          const mode: PersistMode = "local";
          persistMode.current = mode;
          persistAuth({ user: nextUser, accessToken: token }, mode);
          return { ok: true };
        }
        return { ok: false, message: "Falha ao processar a resposta de login." };
      } catch { continue; }
    }
    return { ok: false, message: "Não foi possível conectar ao servidor." };
  }, [apiBase, persistAuth, refreshToken]);

  const signOut = useCallback(async () => {
    try { await fetch(`${apiBase}/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    resetAuth();
  }, [apiBase, resetAuth]);

  const value: AuthContextShape = useMemo(() => ({ user, accessToken, initializing, signIn, signOut, refreshProfile: safeRefreshProfile }), [user, accessToken, initializing, signIn, signOut, safeRefreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within AuthProvider"); return ctx; }
