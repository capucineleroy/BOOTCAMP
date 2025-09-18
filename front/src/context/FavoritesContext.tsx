"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

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
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('product_id')
            .eq('user_id', user.id);
          if (!mounted) return;
          if (!error && data) {
            setIds(data.map((r: any) => r.product_id));
            return;
          }
        }
        // fallback local for guests or on error
        const raw = localStorage.getItem(KEY);
        if (raw) setIds(JSON.parse(raw));
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    // persist locally always for fast UX/guests
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  }, [ids]);

  const toggle = (productId: string) => {
    setIds((prev) => {
      const has = prev.includes(productId);
      const next = has ? prev.filter((p) => p !== productId) : [...prev, productId];
      // best-effort server sync
      (async () => {
        try {
          if (!user) return;
          if (has) {
            await supabase
              .from('user_favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('product_id', productId);
          } else {
            await supabase
              .from('user_favorites')
              .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });
          }
        } catch {}
      })();
      return next;
    });
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
