"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product, ProductVariant } from '../lib/types';
import * as api from '../lib/supabaseApi';

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (variantId: string, quantity?: number) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  detailed: Array<CartItem & { product: Product; variant: ProductVariant }>;
};

const CartCtx = createContext<CartState | undefined>(undefined);

const STORAGE_KEY = 'cart:v2';
const CART_ID_KEY = 'cart:id:v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    async function restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
        const cartId = localStorage.getItem(CART_ID_KEY);
        if (!cartId) {
          // create a cart in Supabase; if that fails, we keep local-only
          try {
            const id = await api.createCart();
            localStorage.setItem(CART_ID_KEY, id);
          } catch (e) {
            // ignore supabase errors and keep local usage
            // console.warn('Could not create supabase cart', e);
          }
        }
      } catch {}
    }
    restore();
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = async (variantId: string, quantity = 1) => {
    try {
      // enforce stock limit using variant info
      const info = await api.getVariantWithProduct(variantId);
      const stock = info?.variant.stock ?? Number.MAX_SAFE_INTEGER;
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.variantId === variantId);
        if (idx >= 0) {
          const copy = [...prev];
          const nextQty = Math.min(copy[idx].quantity + quantity, stock);
          copy[idx] = { ...copy[idx], quantity: nextQty };
          return copy;
        }
        const initialQty = Math.min(quantity, stock);
        return [...prev, { variantId, quantity: initialQty }];
      });
      setOpen(true);

      // Persist to Supabase cart if available
      try {
        const cartId = localStorage.getItem(CART_ID_KEY) ?? undefined;
        if (!cartId) return;
        await api.addCartItem(cartId, variantId, Math.min(quantity, stock));
      } catch (e) {}
    } catch (e) {
      // fallback optimistic
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.variantId === variantId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
          return copy;
        }
        return [...prev, { variantId, quantity }];
      });
      setOpen(true);
    }
  };

  const remove = async (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
    try {
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      const { data: itemsRows, error } = await (await import('../lib/supabaseClient')).supabase
        .from('cart_items')
        .select('id, variant_id')
        .eq('cart_id', cartId);
      if (error || !itemsRows) return;
      const target = itemsRows.find((r: any) => r.variant_id === variantId);
      if (target) await api.removeCartItem(target.id);
    } catch (e) {}
  };

  const setQuantity = async (variantId: string, qty: number) => {
    try {
      const info = await api.getVariantWithProduct(variantId);
      const stock = info?.variant.stock ?? Number.MAX_SAFE_INTEGER;
      const clamped = Math.max(1, Math.min(qty, stock));
      setItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, quantity: clamped } : i)));
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      const { data: itemsRows, error } = await (await import('../lib/supabaseClient')).supabase
        .from('cart_items')
        .select('id, variant_id')
        .eq('cart_id', cartId);
      if (error || !itemsRows) return;
      const target = itemsRows.find((r: any) => r.variant_id === variantId);
      if (target) await api.updateCartItemQuantity(target.id, clamped);
    } catch (e) {
      const clamped = Math.max(1, qty);
      setItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, quantity: clamped } : i)));
    }
  };

  const clear = async () => {
    // clear local state
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}

    // best-effort: remove cart items from Supabase and clear cart id
    try {
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      // fetch cart_items for this cart
      const { data: itemsRows, error } = await (await import('../lib/supabaseClient')).supabase
        .from('cart_items')
        .select('id')
        .eq('cart_id', cartId);
      if (!error && itemsRows && itemsRows.length > 0) {
        // remove each item
        for (const r of itemsRows) {
          try { await api.removeCartItem(r.id); } catch (e) {}
        }
      }
      // optionally remove the cart row
      try {
        await (await import('../lib/supabaseClient')).supabase
          .from('carts')
          .delete()
          .eq('id', cartId);
      } catch (e) {}
      try { localStorage.removeItem(CART_ID_KEY); } catch {}
    } catch (e) {
      // ignore
    }
  };

  const [detailedProducts, setDetailedProducts] = useState<Array<CartItem & { product: Product; variant: ProductVariant }>>([]);

  useEffect(() => {
    async function loadProducts() {
      const results: Array<CartItem & { product: Product; variant: ProductVariant }> = [];
      for (const item of items) {
        try {
          const res = await api.getVariantWithProduct(item.variantId);
          if (res) {
            results.push({ ...item, product: res.product, variant: res.variant });
          }
        } catch (e) {}
      }
      setDetailedProducts(results);
    }
    loadProducts();
  }, [items]);

  const subtotal = detailedProducts.reduce((sum: number, i) => sum + i.variant.price * i.quantity, 0);
  const count = detailedProducts.reduce((sum: number, i) => sum + i.quantity, 0);

  const value: CartState = {
    items,
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen((v) => !v),
    add,
    remove,
    setQuantity,
    clear,
    subtotal,
    count,
    detailed: detailedProducts,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

