"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Role, User } from '../lib/types';

type AuthState = {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'auth:v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [user]);

  const login = async (email: string, _password: string) => {
    // Mocked: role by email prefix
    const role: Role = email.startsWith('admin') ? 'admin' : email.startsWith('seller') ? 'seller' : 'client';
    setUser({ id: 'u-1', name: email.split('@')[0], email, role });
  };

  const signup = async (name: string, email: string, _password: string) => {
    const role: Role = 'client';
    setUser({ id: 'u-2', name, email, role });
  };

  const logout = () => setUser(null);

  const value = useMemo<AuthState>(() => ({ user, role: user?.role ?? 'guest', login, signup, logout }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

