"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Role, User } from "../lib/types";
import { supabase } from "../lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

const DEFAULT_ROLE: Role = "client";

const toAppUser = (raw: SupabaseUser | null | undefined): User | null => {
  if (!raw) return null;

  const email = raw.email ?? "";
  const metadata = raw.user_metadata ?? {};
  const metadataName = typeof metadata.name === "string" ? metadata.name.trim() : "";
  const name = metadataName || (email.includes("@") ? email.split("@")[0] : email) || "Utilisateur";
  const metadataRole = typeof metadata.role === "string" ? metadata.role : undefined;
  const role: Role = metadataRole === "admin" || metadataRole === "seller" || metadataRole === "client" ? metadataRole : DEFAULT_ROLE;

  return { id: raw.id, name, email, role };
};

const getRedirectUrl = () => (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("AuthProvider getSession error", error);
        return;
      }
      if (!mounted) return;
      setUser(toAppUser(data.session?.user));
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAppUser(session?.user));
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

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const trimmedName = name.trim();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: trimmedName || (email.includes("@") ? email.split("@")[0] : email), role: DEFAULT_ROLE },
        emailRedirectTo: getRedirectUrl(),
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthState>(() => ({ user, role: user?.role ?? "guest", login, signup, logout }), [user, login, signup, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
