"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard';
import type { Product } from '../../lib/types';
import { getProduct as fetchProduct } from '../../lib/supabaseApi';

export default function FavoritesPage() {
  const { ids, toggle, clear } = useFavorites();
  const [loading, setLoading] = useState(false);
  const [favs, setFavs] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (!ids.length) {
          if (mounted) setFavs([]);
          return;
        }
        const results = await Promise.all(ids.map(async (id) => {
          try { return await fetchProduct(id); } catch { return null; }
        }));
        const items = results.filter((p): p is Product => !!p);
        if (mounted) setFavs(items);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [ids]);

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Mes favoris</h1>
          <p className="text-sm text-neutral-600">Retrouvez ici les paires que vous avez ajoutées.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => clear()} className="text-sm px-3 py-2 rounded border">Tout supprimer</button>
          <Link href="/shop" className="text-sm px-3 py-2 rounded bg-[color:var(--color-brand-3)] text-white">Continuer vos achats</Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border overflow-hidden">
              <div className="h-56 w-full bg-neutral-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-2/3" />
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : favs.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-neutral-600">Vous n'avez pas encore ajouté de favoris.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm px-4 py-2 rounded bg-[color:var(--color-brand-3)] text-white">Voir la collection</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favs.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

