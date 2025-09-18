"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '../lib/types';
import { products } from '../lib/data';
import * as api from '../lib/supabaseApi';

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (productId: string, size: number, quantity?: number) => void;
  remove: (productId: string, size: number) => void;
  setQuantity: (productId: string, size: number, qty: number) => void;
  subtotal: number;
  count: number;
  detailed: Array<CartItem & { product: Product }>;
};

const CartCtx = createContext<CartState | undefined>(undefined);

const STORAGE_KEY = 'cart:v1';
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

  const add = async (productId: string, size: number, quantity = 1) => {
    // Update local state optimistically
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId && i.size === size);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
        return copy;
      }
      return [...prev, { productId, size, quantity }];
    });
    setOpen(true);

    // Try to persist to Supabase: find variant id then insert
    try {
      const cartId = localStorage.getItem(CART_ID_KEY) ?? undefined;
      if (!cartId) return;
      // find variant by productId and size
      // product_variants table: product_id and size
      const { data: variants, error } = await (await import('../lib/supabaseClient')).supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('size', String(size));
      if (error || !variants || variants.length === 0) return;
      const variantId = variants[0].id;
      await api.addCartItem(cartId, variantId, quantity);
    } catch (e) {
      // ignore
    }
  };

  const remove = async (productId: string, size: number) => {
    // remove locally
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
    try {
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      // find cart_item id
      const { data: itemsRows, error } = await (await import('../lib/supabaseClient')).supabase
        .from('cart_items')
        .select('id, product_variants(*)')
        .eq('cart_id', cartId);
      if (error || !itemsRows) return;
      const target = itemsRows.find((r: any) => r.product_variants.product_id === productId && Number(r.product_variants.size) === size);
      if (target) await api.removeCartItem(target.id);
    } catch (e) {}
  };

  const setQuantity = async (productId: string, size: number, qty: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, qty) } : i)));
    try {
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      const { data: itemsRows, error } = await (await import('../lib/supabaseClient')).supabase
        .from('cart_items')
        .select('id, product_variants(*)')
        .eq('cart_id', cartId);
      if (error || !itemsRows) return;
      const target = itemsRows.find((r: any) => r.product_variants.product_id === productId && Number(r.product_variants.size) === size);
      if (target) await api.updateCartItemQuantity(target.id, qty);
    } catch (e) {}
  };

  const detailed = useMemo(() =>
    items.map((i) => ({ ...i, product: products.find((p) => p.id === i.productId)! })).filter((i) => i.product),
  [items]);

  const subtotal = detailed.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = detailed.reduce((sum, i) => sum + i.quantity, 0);

  const value: CartState = {
    items,
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen((v) => !v),
    add,
    remove,
    setQuantity,
    subtotal,
    count,
    detailed,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

