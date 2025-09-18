"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import * as api from '../../lib/supabaseApi';

export default function CheckoutPage() {
  const router = useRouter();
  const { detailed, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!detailed || detailed.length === 0) {
      // if cart empty, redirect back to shop
      router.replace('/shop');
    }
  }, [detailed, router]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      // Revalidate each cart item: find variant, price and stock
      const resolved: Array<{ variantId: string; quantity: number; price: number; productName: string }> = [];
      const notFoundItems: string[] = [];
      const oosItems: string[] = [];
      const { supabase } = await import('../../lib/supabaseClient');

      for (const i of detailed) {
        let qb = supabase.from('product_variants').select('*').eq('product_id', i.productId).eq('size', String(i.size)).limit(1);
        if ((i as any).color) qb = qb.eq('color', (i as any).color);
        const { data: variants, error } = await qb;
        if (error || !variants || variants.length === 0) {
          notFoundItems.push(`${i.product.name} (size ${i.size}${(i as any).color ? `, color ${(i as any).color}` : ''})`);
          continue;
        }
        const v = variants[0] as any;
        const price = Number(v.price ?? i.product.price ?? 0);
        const stock = Number(v.stock ?? 0);
        if (stock < i.quantity) {
          oosItems.push(`${i.product.name} (size ${i.size}${(i as any).color ? `, color ${(i as any).color}` : ''})`);
          continue;
        }
        resolved.push({ variantId: v.id, quantity: i.quantity, price, productName: i.product.name });
      }

      if (notFoundItems.length > 0) throw new Error(`Variant not found: ${notFoundItems.join(', ')}`);
      if (oosItems.length > 0) throw new Error(`Out of stock: ${oosItems.join(', ')}`);

      // Recompute total from validated variant prices
      const total = resolved.reduce((s, r) => s + r.price * r.quantity, 0);

      const res = await api.createOrder(null, resolved.map((r) => ({ variantId: r.variantId, quantity: r.quantity, price: r.price })), total);
      const id = (res && (res as any).id) ?? String(res);
      setOrderId(id);
      // clear cart
      await clear();
    } catch (e: any) {
      setError(e?.message ?? 'Could not create order');
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <h1 className="text-2xl font-semibold mb-4">Thank you for your purchase</h1>
        <p className="mb-4">Your order id: <strong>{orderId}</strong></p>
        <button onClick={() => router.push('/shop')} className="py-2 px-4 rounded bg-slate-800 text-white">Back to shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      <div className="border rounded p-4 mb-6">
        <h2 className="font-medium mb-2">Order summary</h2>
        {detailed.map((i) => (
          <div key={`${i.productId}-${i.size}`} className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">{i.product.name} <span className="text-xs text-neutral-500">(Size {i.size})</span></div>
              <div className="text-xs text-neutral-500">Qty: {i.quantity}</div>
            </div>
            <div className="text-sm">{(i.product.price * i.quantity).toFixed(0)} €</div>
          </div>
        ))}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-medium">Subtotal</span>
          <span className="text-base font-semibold">{subtotal.toFixed(0)} €</span>
        </div>
      </div>

      <div className="border rounded p-4 mb-6">
        <h2 className="font-medium mb-2">Payment (simulation)</h2>
        <p className="text-sm text-neutral-600 mb-4">This is a simulated payment flow. No real payment is taken.</p>
        <div className="space-y-3">
          <input placeholder="Name" className="w-full border rounded px-3 py-2" />
          <input placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input placeholder="Card number (sim)" className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      {error && <div className="text-rose-600 mb-4">{error}</div>}

      <div className="flex items-center gap-3">
        <button onClick={handlePlaceOrder} disabled={loading} className="py-3 px-4 rounded bg-[#1f1fff] text-white hover:opacity-95">
          {loading ? 'Placing order...' : 'Place order'}
        </button>
        <button onClick={() => router.back()} className="py-3 px-4 rounded border">Cancel</button>
      </div>
    </div>
  );
}
