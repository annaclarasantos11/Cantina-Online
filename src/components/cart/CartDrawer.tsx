'use client';

import { formatBRL } from '@/utils/currency';
import { useCart } from '@/contexts/CartContext';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { items, increment, decrement, removeItem, total } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Esc
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onOpenChange]);

  // Very small focus trap for accessibility
  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (document.activeElement === last && !e.shiftKey) {
        e.preventDefault();
        first?.focus();
      } else if (document.activeElement === first && e.shiftKey) {
        e.preventDefault();
        last?.focus();
      }
    };
    root.addEventListener('keydown', handler as any);
    (first || root).focus();
    return () => root.removeEventListener('keydown', handler as any);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Carrinho"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={dialogRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4 flex flex-col outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Seu carrinho</h2>
          <button aria-label="Fechar" onClick={() => onOpenChange(false)} className="p-2 rounded hover:bg-gray-100">
            <X />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-auto space-y-3">
          {items.length === 0 && <p className="text-gray-600">Carrinho vazio.</p>}
          {items.map((it) => (
            <div key={it.productId} className="flex items-center gap-3 rounded-xl border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {it.imageUrl && <img src={it.imageUrl} alt={it.name} className="h-16 w-16 rounded-lg object-cover" />}
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-600">{formatBRL(it.price)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="btn btn-outline px-3" aria-label="Diminuir" onClick={() => decrement(it.productId)}>-</button>
                  <span aria-live="polite" className="min-w-6 text-center">{it.quantity}</span>
                  <button className="btn btn-outline px-3" aria-label="Aumentar" onClick={() => increment(it.productId)}>+</button>
                  <button className="ml-4 text-sm text-red-600 hover:underline" onClick={() => removeItem(it.productId)}>
                    Remover
                  </button>
                </div>
              </div>
              <div className="font-semibold">{formatBRL(it.quantity * it.price)}</div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total</span>
            <strong>{formatBRL(total)}</strong>
          </div>
          <a href="/pedidos" className="btn btn-primary w-full mt-3 text-center">Ir para checkout</a>
        </div>
      </div>
    </div>
  );
}
