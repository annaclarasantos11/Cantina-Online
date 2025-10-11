import { headers } from "next/headers";
import MenuFilters from "@/components/MenuFilters";

type Category = { id: number; name: string; slug: string };
type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  category: Category;
};

// Base absoluta (funciona em dev, Vercel ou proxy reverso)
function apiBase() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

export const metadata = { title: "Menu | Cantina Online" };

export default async function MenuPage() {
  const base = apiBase();
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar produtos");
  const products = (await res.json()) as Product[];

  return (
    <section className="relative isolate bg-gradient-to-b from-white via-orange-50/30 to-white">
      <div className="container py-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
              Retirada no balcão
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Cardápio do dia</h1>
            <p className="text-base text-gray-600">
              Explore lanches, doces e bebidas preparados para o intervalo. Filtre por categoria,
              busque por nome ou veja rapidamente o que está disponível para retirar.
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white/80 px-6 py-5 text-sm text-orange-700 shadow-sm backdrop-blur">
            <p className="font-semibold">Boas práticas da cantina</p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
                Garanta o pedido e retire no horário escolhido.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
                O status de estoque aparece em cada item.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
                Prefira adicionar ao carrinho antes de ir ao balcão.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-[1] pb-16">
        <div className="container">
          <div className="rounded-3xl border border-gray-200/80 bg-white/95 p-6 shadow-xl shadow-orange-100/40 backdrop-blur">
            <MenuFilters products={products} />
          </div>
        </div>
      </div>
    </section>
  );
}
