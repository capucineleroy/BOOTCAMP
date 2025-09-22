"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Role, User } from "../lib/types";
import { supabase } from "../lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

type InternalAuthState = AuthState & { initialized: boolean };


const AuthCtx = createContext<AuthState | undefined>(undefined);

const DEFAULT_ROLE: Role = "client";

const toAppUser = (raw: SupabaseUser | null | undefined): User | null => {
  if (!raw) return null;

  const email = raw.email ?? "";
  const metadata = raw.user_metadata ?? {};
  const metadataFirstName = typeof metadata.firstName === "string" ? metadata.firstName.trim() : "";
  const metadataLastName = typeof metadata.lastName === "string" ? metadata.lastName.trim() : "";
  const metadataName = typeof metadata.name === "string" ? metadata.name.trim() : "";
  const derivedName = [metadataFirstName, metadataLastName].filter(Boolean).join(" ") || metadataName;
  const fallbackName = derivedName || (email.includes("@") ? email.split("@")[0] : "");
  const name = fallbackName || "Utilisateur";
  // Prefer app_metadata over user_metadata when present
  const appMeta: any = (raw as any).app_metadata ?? {};
  const appRole = typeof appMeta.role === "string" ? appMeta.role : undefined;
  const metadataRole = typeof metadata.role === "string" ? metadata.role : undefined;
  const resolvedRole = appRole ?? metadataRole;
  const role: Role = resolvedRole === "admin" || resolvedRole === "seller" || resolvedRole === "client" ? resolvedRole : DEFAULT_ROLE;

  return { id: raw.id, name, email, role };
};

const getRedirectUrl = () => (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("AuthProvider getSession error", error);
        // still mark initialized so guards don't wait forever
        if (mounted) setInitialized(true);
        return;
      }
      if (!mounted) return;
      setUser(toAppUser(data.session?.user));
      setInitialized(true);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAppUser(session?.user));
      setInitialized(true);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (firstName: string, lastName: string, email: string, password: string) => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const displayName = [trimmedFirstName, trimmedLastName].filter(Boolean).join(" ") || (trimmedEmail.includes("@") ? trimmedEmail.split("@")[0] : trimmedEmail);

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          name: displayName,
          role: DEFAULT_ROLE,
        },
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<InternalAuthState>(() => ({ user, role: user?.role ?? "guest", login, signup, logout, initialized }), [user, login, signup, logout, initialized]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
