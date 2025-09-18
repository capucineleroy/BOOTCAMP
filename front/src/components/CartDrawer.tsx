"use client";
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { isOpen, close, detailed, subtotal, setQuantity, remove } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />
      <aside
        className={`fixed inset-y-0 right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-b-[#E6E6E6]">
          <h2 className="text-lg font-semibold text-[#015A52]">Your Cart</h2>
          <button onClick={close} className="text-sm text-neutral-600 hover:text-neutral-900">Close</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-9rem)]">
          {detailed.length === 0 && (
            <p className="text-sm text-neutral-600">Your cart is empty.</p>
          )}
          {detailed.map((item) => (
            <div key={item.variantId} className="flex gap-3 border rounded-lg p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{item.product.name}</div>
                    <div className="text-xs text-neutral-500">Taille {item.variant.size} · {item.variant.color}</div>
                  </div>
                  <div className="text-sm">{(item.variant.price * item.quantity).toFixed(0)} €</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <button className="px-2 py-1 rounded border" onClick={() => setQuantity(item.variantId, item.quantity - 1)}>-</button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button className="px-2 py-1 rounded border" onClick={() => setQuantity(item.variantId, item.quantity + 1)}>+</button>
                  </div>
                  <button className="text-xs text-rose-600" onClick={() => remove(item.variantId)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-auto border-t-2 border-[#015A52] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-600">Total</span>
              <span className="text-base font-semibold">{subtotal.toFixed(0)} €</span>
            </div>
            <button className="w-full py-3 rounded-lg bg-[#015A52] text-white hover:opacity-95">Checkout</button>
          </div>
          <Link href="/checkout" className="w-full block text-center py-3 rounded-lg bg-[#1f1fff] text-white hover:opacity-95">Checkout</Link>
        </div>
      </aside>
    </div>
  );
}




