"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type OrderDTO = {
  id: number;
  createdAt: string | Date;
  total: number;
  items: OrderItem[];
};

const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

type OrdersHistoryProps = {
  userId: number;
};

export function OrdersHistory({ userId }: OrdersHistoryProps) {
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(String(userId))}`);
        if (!res.ok) {
          throw new Error("Erro ao buscar pedidos");
        }
        const data = (await res.json()) as OrderDTO[];
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Não foi possível carregar seus pedidos.");
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3" role="status" aria-live="polite">
          <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-16 w-full animate-pulse rounded-2xl bg-gray-100" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 text-sm text-gray-600">
          Você ainda não tem pedidos.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => {
          const isOpen = Boolean(expanded[order.id]);
          return (
            <article key={order.id} className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-700">
                  <span className="font-semibold text-gray-900">Pedido #{order.id}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <p className="text-base font-semibold text-gray-900">{formatMoney(order.total)}</p>
              </div>
              <button
                type="button"
                className="mt-3 inline-flex items-center text-sm font-semibold text-orange-700 hover:underline"
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [order.id]: !isOpen,
                  }))
                }
                aria-expanded={isOpen}
              >
                {isOpen ? "Ocultar itens" : "Ver itens"}
              </button>
              {isOpen ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="py-2">Produto</th>
                        <th className="py-2">Qtd</th>
                        <th className="py-2">Unitário</th>
                        <th className="py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="py-2 pr-4 font-medium text-gray-900">{item.name}</td>
                          <td className="py-2 pr-4">{item.quantity}</td>
                          <td className="py-2 pr-4">{formatMoney(item.unitPrice)}</td>
                          <td className="py-2 font-semibold text-gray-900">{formatMoney(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    );
  }, [orders, expanded, loading, error]);

  return <div>{content}</div>;
}
