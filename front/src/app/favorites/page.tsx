"use client";
import { useFavorites } from '../../context/FavoritesContext';
import { products } from '../../lib/data';
import Link from 'next/link';

export default function FavoritesPage() {
  const { ids, toggle, clear } = useFavorites();

  const favs = products.filter((p) => ids.includes(p.id));

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

      {favs.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-neutral-600">Vous n'avez pas encore ajouté de favoris.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm px-4 py-2 rounded bg-[color:var(--color-brand-3)] text-white">Voir la collection</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favs.map((p) => (
            <article key={p.id} className="group rounded-xl border overflow-hidden">
              <Link href={`/product/${p.id}`} className="block relative h-56 bg-[color:var(--color-brand-1)]" style={{ backgroundColor: p.color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </Link>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{p.name}</h3>
                  <div className="text-xs text-neutral-600">{p.price.toFixed(0)} €</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => toggle(p.id)} className="text-sm text-rose-600">Retirer</button>
                  <Link href={`/product/${p.id}`} className="text-sm px-3 py-1 rounded bg-[color:var(--color-brand-3)] text-white">Voir</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

