'use client';

import { useCart } from '@/contexts/CartContext';
import { formatBRL } from '@/utils/currency';
import { useState } from 'react';

export default function CheckoutPage() {
  const { items, total, clear, increment, decrement, removeItem } = useCart();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadTicket(
    ticketNumber: number,
    snapshot: Array<{
      produto: string;
      quantidade: number;
      unitario: string;
      subtotal: string;
    }>,
    totalValue: number,
    customerName: string,
    noteValue: string | null
  ) {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const now = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());

    const lines: string[] = [];
    lines.push('Cantina Online - Ticket');
    lines.push('==========================');
    lines.push(`Pedido nº: ${ticketNumber}`);
    lines.push(`Data: ${now}`);
    lines.push(`Cliente: ${customerName || 'Não informado'}`);
    if (noteValue) {
      lines.push(`Observação: ${noteValue}`);
    }
    lines.push('');
    lines.push('Itens:');
    snapshot.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.produto}`);
      lines.push(`   Quantidade: ${item.quantidade}`);
      lines.push(`   Unitário: ${item.unitario}`);
      lines.push(`   Subtotal: ${item.subtotal}`);
    });
    lines.push('');
    lines.push(`Total: ${formatter.format(totalValue)}`);
    lines.push('');
    lines.push('Retire seu pedido no balcão. Obrigado!');

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ticket-pedido-${ticketNumber}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const snapshot = items.map((i) => ({
      id: i.productId,
      produto: i.name,
      quantidade: i.quantity,
      unitario: formatBRL(i.price),
      subtotal: formatBRL(i.quantity * i.price),
    }));
    const totalValue = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
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
        throw new Error(j?.error || 'Falha ao criar pedido. Tente novamente.');
      }
      const data = await res.json();
  const ticket = data.orderNumber ?? data.orderId;
  const numericTicket = typeof ticket === 'number' ? ticket : Number(ticket);
  console.groupCollapsed(`📦 Pedido confirmado #${Number.isFinite(numericTicket) ? numericTicket : 'novo'}`);
      console.log('Cliente:', name || '(não informado)');
      if (note) console.log('Observação:', note);
      console.table(snapshot);
      console.log('Total:', formatBRL(totalValue));
      console.groupEnd();
      if (Number.isFinite(numericTicket)) {
        downloadTicket(numericTicket, snapshot, totalValue, name, note || null);
        setOrderNumber(numericTicket);
      } else {
        setOrderNumber(null);
      }
      clear();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="container py-8 max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
        <p>Ticket gerado com sucesso. Número do pedido:</p>
        <div className="text-4xl font-extrabold text-orange-700">{orderNumber}</div>
        <p className="text-gray-600">Faça o download do seu ticket e apresente ao retirar na cantina.</p>
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
                  {typeof i.maxQuantity === 'number' ? (
                    <div className="text-xs text-gray-500 mt-1">
                      {i.maxQuantity > 0
                        ? `Disponíveis: ${Math.max(i.maxQuantity - i.quantity, 0)} de ${i.maxQuantity}`
                        : 'Sem estoque no momento'}
                    </div>
                  ) : null}
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
                    disabled={typeof i.maxQuantity === 'number' && i.quantity >= i.maxQuantity}
                    aria-disabled={typeof i.maxQuantity === 'number' && i.quantity >= i.maxQuantity}
                    className={`grid h-9 w-9 place-items-center rounded-r-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600 ${
                      typeof i.maxQuantity === 'number' && i.quantity >= i.maxQuantity
                        ? 'cursor-not-allowed opacity-40'
                        : 'hover:bg-gray-100'
                    }`}
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
