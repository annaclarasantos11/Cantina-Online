"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { useCart } from "@/contexts/CartContext";

type Category = { id: number; name: string; slug: string };
type Product = {
  id: number | string;
  name: string;
  description?: string;
  price: string | number;
  imageUrl?: string;
  category: Category;
  stock?: number | string;
};

type Props = { products: Product[] };

type QuickFilter = "todos" | "salgados" | "doces" | "bebidas";

/** Mapeia slugs/categorias reais para os filtros desejados */
function mapCategoryToFilter(slug: string): QuickFilter {
  const s = slug?.toLowerCase() ?? "";
  if (s.includes("bebida")) return "bebidas";
  if (s.includes("doce")) return "doces";
  // lanches e refeições (ou outros salgados) entram aqui
  if (s.includes("lanche") || s.includes("refei")) return "salgados";
  return "salgados";
}

/** Normaliza string para busca sem acentos e case-insensitive */
function normalize(t: string) {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function MenuFilters({ products }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("todos");
  const { addItem, increment, decrement, items, setItemLimit } = useCart();

  const counts = useMemo(() => {
    const c = { todos: products.length, salgados: 0, doces: 0, bebidas: 0 };
    for (const p of products) {
      const k = mapCategoryToFilter(p.category?.slug ?? "");
      if (k === "salgados") c.salgados++;
      if (k === "doces") c.doces++;
      if (k === "bebidas") c.bebidas++;
    }
    return c;
  }, [products]);

  const list = useMemo(() => {
    const query = normalize(q);
    return products
      .filter((p) => {
        if (filter !== "todos") {
          const k = mapCategoryToFilter(p.category?.slug ?? "");
          if (k !== filter) return false;
        }
        if (!query) return true;
        const hay = normalize(`${p.name} ${p.description ?? ""}`);
        return hay.includes(query);
      })
      .sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)));
  }, [products, q, filter]);

  useEffect(() => {
    for (const p of products) {
      const normalizedId =
        typeof p.id === "number"
          ? p.id
          : Number.parseInt(String(p.id), 10);
      if (!Number.isFinite(normalizedId)) continue;
      let stock: number | undefined;
      if (typeof p.stock === "number" && Number.isFinite(p.stock)) {
        stock = p.stock;
      } else if (typeof p.stock === "string") {
        const parsed = Number.parseInt(p.stock.trim(), 10);
        if (Number.isFinite(parsed)) stock = parsed;
      }
      if (typeof stock !== "number") continue;
      const entry = items.find((item) => item.productId === normalizedId);
      if (!entry) continue;
      if (entry.maxQuantity !== stock || entry.quantity > stock) {
        setItemLimit(normalizedId, stock);
      }
    }
  }, [products, items, setItemLimit]);

  const pills: Array<{ key: QuickFilter; label: string; count: number }> = [
    { key: "todos", label: "Todos", count: counts.todos },
    { key: "salgados", label: "Salgados", count: counts.salgados },
    { key: "doces", label: "Doces", count: counts.doces },
    { key: "bebidas", label: "Bebidas", count: counts.bebidas },
  ];

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Pílulas de filtro */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filtros rápidos">
          {pills.map((p) => {
            const active = filter === p.key;
            return (
              <button
                key={p.key}
                role="radio"
                aria-checked={active}
                onClick={() => setFilter(p.key)}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                ].join(" ")}
              >
                {p.label}
                <span
                  className={[
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full",
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600",
                  ].join(" ")}
                  style={{ paddingInline: 8 }}
                >
                  {p.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Busca */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar item do cardápio..."
            aria-label="Buscar item do cardápio"
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm outline-none ring-0 focus:border-orange-500"
          />
          {q ? (
            <button
              onClick={() => setQ("")}
              className="absolute right-2 top-1.5 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              aria-label="Limpar busca"
              title="Limpar"
            >
              Limpar
            </button>
          ) : null}
        </div>
      </div>

      {/* Resultados */}
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-600">
          Nada encontrado {filter !== "todos" ? `em ${filter}` : ""} {q ? `para "${q}"` : ""}.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => {
            const isBebida = mapCategoryToFilter(p.category?.slug ?? "") === "bebidas";
            const normalizedPriceRaw =
              typeof p.price === "number"
                ? p.price
                : Number.parseFloat(String(p.price).replace(",", "."));
            const hasValidPrice = Number.isFinite(normalizedPriceRaw);
            const normalizedId =
              typeof p.id === "number"
                ? p.id
                : Number.parseInt(String(p.id), 10);
            const canAdd = Number.isFinite(normalizedId) && hasValidPrice;
            let stock: number | undefined;
            if (typeof p.stock === "number" && Number.isFinite(p.stock)) {
              stock = p.stock;
            } else if (typeof p.stock === "string") {
              const parsed = Number.parseInt(p.stock.trim(), 10);
              if (Number.isFinite(parsed)) stock = parsed;
            }
            const cartEntry =
              Number.isFinite(normalizedId)
                ? items.find((item) => item.productId === normalizedId)
                : undefined;
            return (
              <div
                key={p.id}
                className="animate-fade-up"
                style={{ ["--delay" as any]: `${i * 50}ms` }}
              >
                <MenuCard
                  id={p.id}
                  name={p.name}
                  description={p.description}
                  price={p.price}
                  imageUrl={p.imageUrl}
                  imageMode={isBebida ? "contain" : "cover"}
                  maxQuantity={typeof stock === "number" ? stock : undefined}
                  onAdd={
                    canAdd
                      ? () =>
                          addItem({
                            productId: normalizedId,
                            name: p.name,
                            price: normalizedPriceRaw,
                            imageUrl: p.imageUrl,
                            maxQuantity: typeof stock === "number" ? stock : undefined,
                          })
                      : undefined
                  }
                  onIncrease={
                    cartEntry && canAdd
                      ? () => increment(normalizedId)
                      : undefined
                  }
                  onDecrease={
                    cartEntry && canAdd
                      ? () => decrement(normalizedId)
                      : undefined
                  }
                  quantity={cartEntry?.quantity}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
