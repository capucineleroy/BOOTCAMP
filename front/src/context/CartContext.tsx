"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '../lib/types';
import { products } from '../lib/data';

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (productId: string, size: number, quantity = 1) => {
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
  };

  const remove = (productId: string, size: number) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const setQuantity = (productId: string, size: number, qty: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, qty) } : i)));
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

