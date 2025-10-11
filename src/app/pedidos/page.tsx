'use client';

import { useCart } from '@/contexts/CartContext';
import { formatBRL } from '@/utils/currency';
import { useState } from 'react';

export default function CheckoutPage() {
  const { items, total, clear, increment, decrement, removeItem } = useCart();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          note: note || undefined,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
        })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Falha ao criar pedido');
      }
      const data = await res.json();
      setOrderId(data.orderId);
      clear();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    return (
      <div className="container py-8 max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
        <p>Anote o número do seu pedido:</p>
        <div className="text-4xl font-extrabold text-orange-700">{orderId}</div>
        <p className="text-gray-600">Apresente este número ao retirar na cantina.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">Resumo</h1>
        <div className="space-y-3">
          {items.map(i => (
            <div key={i.productId} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-gray-600">{formatBRL(i.price)} / un.</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i.productId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
                  <button
                    type="button"
                    onClick={() => decrement(i.productId)}
                    className="grid h-9 w-9 place-items-center rounded-l-full hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                    aria-label={`Diminuir ${i.name}`}
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                    {i.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => increment(i.productId)}
                    className="grid h-9 w-9 place-items-center rounded-r-full hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                    aria-label={`Aumentar ${i.name}`}
                  >
                    +
                  </button>
                </div>

                <div className="text-right text-sm font-semibold text-gray-800 min-w-[5rem]">
                  {formatBRL(i.quantity * i.price)}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-gray-600">Total</span>
            <strong>{formatBRL(total)}</strong>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Identificação</h2>
        <label className="block">
          <span className="block text-sm font-medium">Seu nome</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-200"
            required
          />
        </label>

        <label className="block mt-4">
          <span className="block text-sm font-medium">Observação (opcional)</span>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-200"
            rows={3}
          />
        </label>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        <button
          className="btn btn-primary mt-6"
          onClick={submit}
          disabled={loading || !name || items.length === 0}
          aria-busy={loading}
        >
          {loading ? 'Enviando...' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  );
}
