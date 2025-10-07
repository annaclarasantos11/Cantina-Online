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
    <section className="container mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu</h1>
          <p className="text-gray-600 mt-1">Use os filtros rápidos ou pesquise por nome/descrição.</p>
        </div>
      </header>

      <MenuFilters products={products} />
    </section>
  );
}
