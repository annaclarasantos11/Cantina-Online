"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type AuthUser = { id: number; name: string; email: string };
type SignInInput = { email: string; password: string; remember?: boolean };
type SignInResult = { ok: true } | { ok: false; message?: string };
type UpdateProfileInput = { name?: string; email?: string };
type UpdateProfileResult = { ok: true; user: AuthUser } | { ok: false; message?: string };
type AuthContextShape = {
  user: AuthUser | null;
  initializing: boolean;
  signIn: (input: SignInInput) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<UpdateProfileResult>;
};
type PersistMode = "local" | "session";

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const LOCAL_KEY = "cantina-auth-user";
const SESSION_KEY = "cantina-auth-user-session";

type StoredUser = AuthUser;
type StoredData = StoredUser & { persist: PersistMode };

function readStored(): StoredData | null {
  if (typeof window === "undefined") return null;
  const l = window.localStorage.getItem(LOCAL_KEY);
  if (l) {
    try {
      const p = JSON.parse(l) as AuthUser;
      if (p?.id && p?.email) return { ...p, persist: "local" };
    } catch {}
  }
  const s = window.sessionStorage.getItem(SESSION_KEY);
  if (s) {
    try {
      const p = JSON.parse(s) as AuthUser;
      if (p?.id && p?.email) return { ...p, persist: "session" };
    } catch {}
  }
  return null;
}

function storeUser(data: AuthUser, mode: PersistMode) {
  const payload = JSON.stringify(data);
  if (mode === "local") {
    localStorage.setItem(LOCAL_KEY, payload);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, payload);
    localStorage.removeItem(LOCAL_KEY);
  }
}

function clearStored() {
  localStorage.removeItem(LOCAL_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const persistMode = useRef<PersistMode | null>(null);
  const userRef = useRef<AuthUser | null>(null);

  const resetAuth = useCallback(() => {
    setUser(null);
    userRef.current = null;
    persistMode.current = null;
    clearStored();
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const persistUser = useCallback((data: AuthUser, mode?: PersistMode) => {
    const persist = mode ?? persistMode.current ?? "local";
    persistMode.current = persist;
    storeUser(data, persist);
  }, []);

  // Valida sessão via cookie (chama /api/auth/me)
  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          resetAuth();
        }
        return;
      }

      const data = (await res.json()) as { ok: boolean; user: AuthUser };
      if (data.ok && data.user) {
        setUser(data.user);
        userRef.current = data.user;
        const mode = persistMode.current ?? "local";
        persistUser(data.user, mode);
      }
    } catch (error) {
      console.error("Erro ao renovar perfil:", error);
    }
  }, [persistUser, resetAuth]);

  // Inicializa: verifica se há usuário salvo e valida sessão
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = readStored();
        if (!active) return;

        if (stored) {
          persistMode.current = stored.persist;
          userRef.current = stored;
          setUser(stored);
        }

        // Tenta validar sessão via cookie
        await refreshProfile();
      } catch (error) {
        console.error("Erro ao inicializar auth:", error);
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const signIn = useCallback(
    async ({ email, password }: SignInInput): Promise<SignInResult> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // [IMPORTANTE] Permite que o cookie seja recebido
          body: JSON.stringify({ email, password }),
        });

        const json = (await res.json().catch(() => ({}))); 

        if (!res.ok) {
          const message =
            typeof json?.message === "string"
              ? json.message
              : "Credenciais inválidas";
          return { ok: false, message };
        }

        // Resposta esperada: { ok: true, user: { id, email, name } }
        if (json?.ok && json?.user) {
          const nextUser = json.user as AuthUser;
          setUser(nextUser);
          userRef.current = nextUser;
          persistMode.current = "local";
          persistUser(nextUser, "local");
          return { ok: true };
        }

        return { ok: false, message: "Falha ao processar resposta de login" };
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        return { ok: false, message: "Erro de conexão" };
      }
    },
    [persistUser]
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
    resetAuth();
  }, [resetAuth]);

  const updateProfile = useCallback(
    async ({ name, email }: UpdateProfileInput): Promise<UpdateProfileResult> => {
      try {
        const payload: Record<string, string> = {};
        if (typeof name === "string" && name.trim())
          payload.name = name.trim();
        if (typeof email === "string" && email.trim())
          payload.email = email.trim();

        if (Object.keys(payload).length === 0) {
          return { ok: false, message: "Nenhum campo para atualizar" };
        }

        const res = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const json = (await res.json().catch(() => ({})));

        if (!res.ok) {
          const message =
            typeof json?.message === "string"
              ? json.message
              : "Erro ao atualizar perfil";
          return { ok: false, message };
        }

        if (json?.ok && json?.user) {
          const updatedUser = json.user as AuthUser;
          setUser(updatedUser);
          userRef.current = updatedUser;
          const mode = persistMode.current ?? "local";
          persistUser(updatedUser, mode);
          return { ok: true, user: updatedUser };
        }

        return { ok: false, message: "Falha ao processar resposta" };
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return { ok: false, message: "Erro de conexão" };
      }
    },
    [persistUser]
  );

  const value: AuthContextShape = {
    user,
    initializing,
    signIn,
    signOut,
    refreshProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
