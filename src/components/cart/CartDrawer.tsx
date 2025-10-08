'use client';

import { useCart } from '@/contexts/CartContext';
import { formatBRL } from '@/utils/currency';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { items, increment, decrement, removeItem, clear, total } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onOpenChange]);

  function close() {
    onOpenChange(false);
  }

  useEffect(() => {
    const html = document.documentElement;
    if (open) {
      const prev = html.style.overflow;
      html.style.overflow = 'hidden';
      return () => {
        html.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[80] ${open ? '' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Carrinho"
      onClick={close}
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={[
          'absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col outline-none',
          'transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Seu carrinho</h2>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clear}
                className="text-sm text-gray-600 hover:underline"
                aria-label="Limpar carrinho"
              >
                Limpar
              </button>
            )}
            <button
              aria-label="Fechar"
              onClick={close}
              className="rounded p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-sky-50 text-2xl text-sky-700">
                🧺
              </div>
              <h3 className="mt-4 text-base font-semibold">Carrinho vazio</h3>
              <p className="mt-1 text-sm text-gray-600">Que tal começar pelo cardápio?</p>
              <a href="/menu" className="btn btn-primary mt-4 w-full">
                Ver cardápio
              </a>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.productId}
                className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-sky-200"
              >
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-100" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{it.name}</div>
                      <div className="text-xs text-gray-600">
                        {formatBRL(it.price)} <span className="text-gray-400">/ un.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(it.productId)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                      aria-label={`Remover ${it.name}`}
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
                      <button
                        type="button"
                        onClick={() => decrement(it.productId)}
                        className="grid h-8 w-8 place-items-center rounded-l-full hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600"
                        aria-label={`Diminuir ${it.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span aria-live="polite" className="w-8 text-center text-sm tabular-nums">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(it.productId)}
                        className="grid h-8 w-8 place-items-center rounded-r-full hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600"
                        aria-label={`Aumentar ${it.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right font-semibold">{formatBRL(it.quantity * it.price)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t bg-white px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total</span>
            <strong className="text-base">{formatBRL(total)}</strong>
          </div>
          <a href="/pedidos" className="btn btn-primary mt-3 w-full text-center">
            Ir para checkout
          </a>
          <p className="mt-2 text-center text-xs text-gray-500">Retirada no balcão • sem taxa</p>
        </div>
      </aside>
    </div>
  );
}
