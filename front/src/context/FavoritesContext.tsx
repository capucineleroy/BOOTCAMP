"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type FavoritesState = {
  ids: string[];
  toggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clear: () => void;
};

const KEY = 'favorites:v1';

const FavCtx = createContext<FavoritesState | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  }, [ids]);

  const toggle = (productId: string) => {
    setIds((prev) => (prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId]));
  };

  const clear = () => setIds([]);

  const isFavorite = (productId: string) => ids.includes(productId);

  const value = useMemo(() => ({ ids, toggle, isFavorite, clear }), [ids]);

  return <FavCtx.Provider value={value}>{children}</FavCtx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavCtx);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
