"use client";
import { notFound, useParams, useRouter } from 'next/navigation';
import { getProduct } from '../../../lib/data';
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const product = getProduct(params.id);
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState(product?.sizes.find((s) => s.stock > 0)?.size ?? product?.sizes[0].size);

  if (!product) return notFound();

  const stock = product.sizes.find((s) => s.size === size)?.stock ?? 0;

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="grid gap-3">
          <div className="aspect-square overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {product.images.slice(0, 3).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="mt-2 text-neutral-600">{product.description}</div>
          <div className="mt-4 text-xl font-semibold">{product.price.toFixed(0)} €</div>
          <div className="mt-2 inline-flex text-xs bg-white border rounded px-2 py-1 text-emerald-700">{product.co2} kg CO₂e</div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Select size</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSize(s.size)}
                  disabled={s.stock === 0}
                  className={`px-3 py-2 rounded border text-sm ${size === s.size ? 'bg-black text-white' : 'bg-white'} ${s.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {s.size}
                </button>
              ))}
            </div>
            <div className="text-xs text-neutral-600 mt-2">{stock > 0 ? `${stock} in stock` : 'Out of stock'}</div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => add(product.id, size!, 1)}
              disabled={!size || stock === 0}
              className="px-5 py-3 rounded-lg bg-[color:var(--color-brand-3)] text-white disabled:opacity-50"
            >
              Add to cart
            </button>
            <button onClick={() => router.push('/shop')} className="px-5 py-3 rounded-lg border">Back to shop</button>
          </div>
        </div>
      </div>
    </div>
  );
}

