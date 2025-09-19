"use client";
import Link from "next/link";
import type { Product } from "../lib/types";
import { HeartIcon } from "./icons";
import { useFavorites } from "../context/FavoritesContext";
export default function HomeTopCard({ product }: { product: Product }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(product.id);

  // image is expected to be product.images[0] (string)
  const image = product.images && product.images[0] ? product.images[0] : '/placeholder.png';
  const bg = (product as any).color ?? 'var(--color-brand-1)';

  return (
    <Link href={`/product/${product.id}`} className="group block rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900">
      <div className="relative aspect-square overflow-hidden">

        <button
          aria-label={isFavorite(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={() => toggle(product.id)}
          className="absolute right-2 top-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500"
          onMouseDown={(e) => e.preventDefault()}
          onClickCapture={(e) => e.preventDefault()}
        >
          <HeartIcon filled={fav} className="w-5 h-5" />
        </button>

        <div className="w-full h-full" style={{ backgroundColor: bg }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">{product.brand} {product.name}</h3>
        <p className="text-sm text-neutral-600 line-clamp-2">{product.sizes.length} tailles disponibles</p>

        <div className="mt-1 flex items-center justify-between">
          <h4 className="text-neutral-600 font-bold text-sm">{product.price.toFixed(0)} €</h4>
        </div>
      </div>
    </Link>
  );
}
