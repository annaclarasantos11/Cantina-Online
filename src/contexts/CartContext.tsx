'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

type AddItemInput = Omit<CartItem, 'quantity'>;

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (i: AddItemInput) => void;
  removeItem: (productId: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const KEY = 'cantina-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const api: CartContextType = useMemo(() => ({
    items,
    count: items.reduce((a, b) => a + b.quantity, 0),
    total: Number(items.reduce((a, b) => a + b.quantity * b.price, 0).toFixed(2)),
    addItem: (i) => {
      setItems(prev => {
        const idx = prev.findIndex(p => p.productId === i.productId);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = { ...clone[idx], quantity: clone[idx].quantity + 1 };
          return clone;
        }
        return [...prev, { ...i, quantity: 1 }];
      });
    },
    removeItem: (productId) => setItems(prev => prev.filter(p => p.productId !== productId)),
    increment: (productId) => setItems(prev => prev.map(p => p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p)),
    decrement: (productId) => setItems(prev => prev.flatMap(p => {
      if (p.productId !== productId) return [p];
      const q = p.quantity - 1;
      return q <= 0 ? [] : [{ ...p, quantity: q }];
    })),
    clear: () => setItems([])
  }), [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
