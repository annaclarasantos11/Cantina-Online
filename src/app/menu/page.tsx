import { headers } from "next/headers";
import MenuCard from "@/components/MenuCard";

type Category = { id: number; name: string; slug: string };
type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number; // aceita string "9.90" ou number 9.9
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

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.json();
}

export const metadata = { title: "Menu | Cantina Online" };

export default async function MenuPage() {
  const products = await fetchJSON<Product[]>("/api/products");

  const lanches = products.filter((p) => p.category?.slug === "lanches");
  const bebidas = products.filter((p) => p.category?.slug === "bebidas");

  return (
    <section className="space-y-10">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold">Menu</h1>
        <nav className="text-sm text-gray-600 flex gap-4">
          <a href="#lanches" className="underline-offset-2 hover:underline">
            Lanches ({lanches.length})
          </a>
          <a href="#bebidas" className="underline-offset-2 hover:underline">
            Bebidas ({bebidas.length})
          </a>
        </nav>
      </header>

      {/* Lanches (mantém layout original: imagem recortada/cover) */}
      <div id="lanches" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Lanches</h2>
          <span className="text-sm text-gray-500">{lanches.length} item(ns)</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lanches.map((p) => (
            <MenuCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              price={p.price}
              imageUrl={p.imageUrl}
              // sem imageMode => default "cover"
            />
          ))}
        </div>
      </div>

      {/* Bebidas (mostra a garrafa inteira, menor: imageMode="contain") */}
      <div id="bebidas" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Bebidas</h2>
          <span className="text-sm text-gray-500">{bebidas.length} item(ns)</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bebidas.map((p) => (
            <MenuCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              price={p.price}
              imageUrl={p.imageUrl}
              imageMode="contain" // aplica somente nas bebidas
            />
          ))}
        </div>
      </div>
    </section>
  );
}
