"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useFavorites } from "../context/FavoritesContext";
import type { Product } from "../lib/types";
import { HeartIcon, CartIcon } from "./icons";
import { useCart } from "../context/CartContext";

function co2Index(seed: string | number): number {
  const s = String(seed);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  // plage 5–50
  return Math.abs(hash % 46) + 5;
}

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(product.id);
  const firstAvailableVariant = product.sizes.find((s) => s.stock > 0) ?? product.sizes[0];

  const co2 = useMemo(() => co2Index(product.id), [product.id]);

  return (
    <div className="group rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100">
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute left-2 top-2 z-10 text-xs bg-white/90 backdrop-blur rounded px-2 py-1 text-emerald-700 font-medium">
          {co2} kg CO₂e
        </div>

        <button
          aria-label="Toggle favorite"
          onClick={() => toggle(product.id)}
          className="absolute right-2 top-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500"
        >
          <HeartIcon filled={fav} className="w-5 h-5" />
        </button>

        {/* image */}
        <div
          className="w-full h-full bg-[color:var(--color-brand-1)]"
          style={{ backgroundColor: product.color }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">
            {product.brand} {product.name}
          </h3>
          <p className="text-sm text-neutral-600 line-clamp-2">
            {product.sizes.length} tailles disponibles
          </p>
        </Link>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-neutral-600 text-sm">
            {product.price.toFixed(0)} €
          </span>

          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.id}`}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-[color:var(--color-brand-3)] text-white hover:opacity-90"
            >
              Voir le produit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
