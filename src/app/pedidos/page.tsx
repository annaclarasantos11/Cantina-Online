"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Printer, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatBRL } from "@/utils/currency";

export default function CheckoutPage() {
  const { items, total, clear, increment, decrement, removeItem } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
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
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const now = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    const lines: string[] = [];
    lines.push("Cantina Online - Ticket");
    lines.push("==========================");
    lines.push(`Pedido nº: ${ticketNumber}`);
    lines.push(`Data: ${now}`);
    lines.push(`Cliente: ${customerName || "Não informado"}`);
    if (noteValue) {
      lines.push(`Observação: ${noteValue}`);
    }
    lines.push("");
    lines.push("Itens:");
    snapshot.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.produto}`);
      lines.push(`   Quantidade: ${item.quantidade}`);
      lines.push(`   Unitário: ${item.unitario}`);
      lines.push(`   Subtotal: ${item.subtotal}`);
    });
    lines.push("");
    lines.push(`Total: ${formatter.format(totalValue)}`);
    lines.push("");
    lines.push("Retire seu pedido no balcão. Obrigado!");

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
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

    if (!user) {
      setError("Você precisa estar logado para fazer um pedido");
      setLoading(false);
      return;
    }

    const snapshot = items.map((i) => ({
      id: i.productId,
      produto: i.name,
      quantidade: i.quantity,
      unitario: formatBRL(i.price),
      subtotal: formatBRL(i.quantity * i.price),
    }));
    const totalValue = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          note: note || undefined,
          userId: user.id,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Falha ao criar pedido. Tente novamente.");
      }
      const data = await res.json();
      const ticket = data.orderNumber ?? data.orderId;
      const numericTicket = typeof ticket === "number" ? ticket : Number(ticket);
      console.groupCollapsed(
        `📦 Pedido confirmado #${Number.isFinite(numericTicket) ? numericTicket : "novo"}`
      );
      console.log("Cliente:", name || "(não informado)");
      if (note) console.log("Observação:", note);
      console.table(snapshot);
      console.log("Total:", formatBRL(totalValue));
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
      <section className="bg-gradient-to-b from-white via-orange-50/40 to-white">
        <div className="container py-16">
          <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white/95 p-10 text-center shadow-xl shadow-emerald-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
              Pedido confirmado
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-gray-900">Ticket emitido com sucesso</h1>
            <p className="mt-3 text-sm text-gray-600">
              O ticket foi baixado automaticamente. Apresente-o no balcão no horário combinado.
            </p>
            <div className="mt-6 text-5xl font-black text-orange-600">#{orderNumber}</div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/menu" className="btn btn-primary">
                Voltar ao cardápio
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOrderNumber(null);
                }}
                className="btn btn-outline"
              >
                Fazer outro pedido
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hasItems = items.length > 0;
  const steps = [
    {
      icon: ShoppingBag,
      title: "Revise o carrinho",
      description: hasItems
        ? `${items.length} ${items.length === 1 ? "item" : "itens"} selecionados`
        : "Nenhum item no carrinho",
    },
    {
      icon: ClipboardList,
      title: "Informe seus dados",
      description: "Nome e observações para impressão do ticket",
    },
    {
      icon: Printer,
      title: "Imprima o ticket",
      description: "Leve ao balcão e finalize o pagamento",
    },
    {
      icon: Store,
      title: "Retire",
      description: "Apresente o ticket no horário escolhido",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white via-orange-50/35 to-white">
      <div className="container py-14">
        <header className="mb-12 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
            Etapa final
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Finalize seu pedido</h1>
          <p className="text-base text-gray-600">
            Revise os itens do carrinho, confirme seus dados e gere o ticket para retirar tudo no balcão.
            O pagamento é realizado pessoalmente com a equipe da cantina.
          </p>
        </header>

        <div className="grid gap-4 rounded-3xl border border-orange-100 bg-white/95 p-6 shadow-xl shadow-orange-100/40 backdrop-blur lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="flex items-start gap-4 rounded-2xl bg-orange-50/60 p-4 text-sm text-gray-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
                <step.icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-lg shadow-gray-200/40">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Resumo do carrinho</h2>
              {hasItems ? (
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm font-medium text-orange-700 hover:underline"
                >
                  Limpar tudo
                </button>
              ) : null}
            </div>
            <div className="mt-5 space-y-4">
              {hasItems ? (
                items.map((i) => (
                  <article key={i.productId} className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{i.name}</h3>
                        <p className="text-xs text-gray-600">{formatBRL(i.price)} / unidade</p>
                        {typeof i.maxQuantity === "number" ? (
                          <p className="mt-1 text-xs text-gray-500">
                            {i.maxQuantity > 0
                              ? `Disponíveis: ${Math.max(i.maxQuantity - i.quantity, 0)} de ${i.maxQuantity}`
                              : "Sem estoque no momento"}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(i.productId)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => decrement(i.productId)}
                          className="grid h-9 w-9 place-items-center rounded-l-full text-lg leading-none transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                          aria-label={`Diminuir ${i.name}`}
                        >
                          −
                        </button>
                        <span className="w-12 text-center text-sm font-semibold" aria-live="polite">
                          {i.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(i.productId)}
                          disabled={typeof i.maxQuantity === "number" && i.quantity >= i.maxQuantity}
                          aria-disabled={typeof i.maxQuantity === "number" && i.quantity >= i.maxQuantity}
                          className={`grid h-9 w-9 place-items-center rounded-r-full text-lg leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600 ${
                            typeof i.maxQuantity === "number" && i.quantity >= i.maxQuantity
                              ? "cursor-not-allowed opacity-40"
                              : "hover:bg-gray-100"
                          }`}
                          aria-label={`Aumentar ${i.name}`}
                        >
                          +
                        </button>
                      </div>

                      <p className="min-w-[5rem] text-right text-sm font-semibold text-gray-800">
                        {formatBRL(i.quantity * i.price)}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-8 text-center text-sm text-gray-600">
                  Seu carrinho está vazio. Explore o <Link href="/menu" className="font-semibold text-orange-700 hover:underline">cardápio</Link> para adicionar itens.
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-4 text-sm font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-lg shadow-gray-200/40">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Identificação</h2>
              <p className="mt-1 text-sm text-gray-600">
                Os dados aparecem no ticket para facilitar a entrega. Se precisar, adicione uma observação para a equipe.
              </p>
            </div>

            <label className="block">
              <span className="block text-sm font-medium text-gray-800">Seu nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Como o ticket deve sair impresso"
                required
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-gray-800">Observação (opcional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                rows={3}
                placeholder="Ex.: Sem cebola, entregar no período da tarde"
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              className="btn btn-primary mt-auto w-full"
              onClick={submit}
              disabled={loading || !name || !hasItems}
              aria-busy={loading}
            >
              {loading ? "Enviando..." : "Confirmar pedido"}
            </button>

            <p className="text-xs text-gray-500">
              Dica: ao finalizar, faça o download do ticket e valide no totem da cantina antes do intervalo.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
