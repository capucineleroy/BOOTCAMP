"use client";
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '../lib/types';
import { HeartIcon, CartIcon } from './icons';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [fav, setFav] = useState(false);
  const firstAvailable = product.sizes.find((s) => s.stock > 0)?.size ?? product.sizes[0].size;

  return (
    <div className="group rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100">
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute left-2 top-2 z-10 text-xs bg-white/90 backdrop-blur rounded px-2 py-1 text-emerald-700 font-medium">
          {product.co2} kg CO₂e
        </div>
        <button
          aria-label="Toggle favorite"
          onClick={() => setFav((v) => !v)}
          className="absolute right-2 top-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500"
        >
          <HeartIcon filled={fav} className="w-5 h-5" />
        </button>
        {/* image */}
        <div className="w-full h-full bg-[color:var(--color-brand-1)]" style={{ backgroundColor: product.color }}>
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
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-neutral-600 text-sm">{product.price.toFixed(0)} €</span>
          <button
            onClick={() => add(product.id, firstAvailable, 1)}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-[color:var(--color-brand-3)] text-white hover:opacity-90"
          >
            <CartIcon className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

