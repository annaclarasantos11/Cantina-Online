'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

const BASE_KEY = 'cantina-cart-v1';
function resolveKey(userId: number | null | undefined) {
  if (!userId) return BASE_KEY;
  return `${BASE_KEY}-user-${userId}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const storageKey = useMemo(() => resolveKey(user?.id), [user?.id]);
  const lastLoadedKey = useRef<string | null>(null);

  // load from localStorage
  useEffect(() => {
    try {
      if (lastLoadedKey.current === storageKey) return;
      const rawPrimary = localStorage.getItem(storageKey);
      if (rawPrimary) {
        setItems(JSON.parse(rawPrimary));
        lastLoadedKey.current = storageKey;
        return;
      }

      if (user?.id) {
        const fallback = localStorage.getItem(BASE_KEY);
        if (fallback) {
          const parsed = JSON.parse(fallback) as CartItem[];
          setItems(parsed);
          localStorage.setItem(storageKey, fallback);
          lastLoadedKey.current = storageKey;
          return;
        }
      }

      const rawBase = localStorage.getItem(BASE_KEY);
      if (rawBase) setItems(JSON.parse(rawBase));
      else setItems([]);
      lastLoadedKey.current = storageKey;
    } catch {
      setItems([]);
    }
  }, [storageKey, user?.id]);

  // persist
  useEffect(() => {
    try {
      const payload = JSON.stringify(items);
      localStorage.setItem(storageKey, payload);
      if (user?.id && storageKey !== BASE_KEY) {
        localStorage.setItem(BASE_KEY, payload);
      }
    } catch {}
  }, [items, storageKey, user?.id]);

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
