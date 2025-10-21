// [VERCEL] Mock mínimo para produtos/categorias/pedidos (sem DB).
export type Category = { id: number; name: string; slug: string };
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
};

export const categories: Category[] = [
  { id: 1, name: "Lanches", slug: "lanches" },
  { id: 2, name: "Bebidas", slug: "bebidas" },
  { id: 3, name: "Doces", slug: "doces" },
  { id: 4, name: "Refeições", slug: "refeicoes" },
];

const bySlug: Record<string, Category> = Object.fromEntries(categories.map((c) => [c.slug, c]));

export const products: Product[] = [
  {
    id: 1,
    name: "Croissant de Chocolate",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/croissant-chocolate.png",
    category: bySlug["lanches"],
  },
  {
    id: 2,
    name: "Croissante de Queijo",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/croissante-queijo.png",
    category: bySlug["lanches"],
  },
  {
    id: 3,
    name: "Pão de batata",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/pao-batata.png",
    category: bySlug["lanches"],
  },
  {
    id: 4,
    name: "Pão de avelã",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/pao-avela.png",
    category: bySlug["lanches"],
  },
  {
    id: 5,
    name: "Torta de brócolis",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/torta-brocolis.png",
    category: bySlug["lanches"],
  },
  {
    id: 6,
    name: "Folheado de 4 queijos",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/folheado-4-queijos.png",
    category: bySlug["lanches"],
  },
  {
    id: 7,
    name: "Folheado de pizza",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/folheado-pizza.png",
    category: bySlug["lanches"],
  },
  {
    id: 8,
    name: "H2O",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/h2o.png",
    category: bySlug["bebidas"],
  },
  {
    id: 9,
    name: "Del Valle Uva (1L)",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/del-valle-uva.png",
    category: bySlug["bebidas"],
  },
  {
    id: 10,
    name: "Gatorade",
    description: "",
    price: 8.0,
    imageUrl: "/images/products/gatorade.png",
    category: bySlug["bebidas"],
  },
  {
    id: 11,
    name: "Limoneto",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/limoneto.png",
    category: bySlug["bebidas"],
  },
  {
    id: 12,
    name: "Chá Leão Guaraná",
    description: "",
    price: 4.5,
    imageUrl: "/images/products/cha-leao-guarana.png",
    category: bySlug["bebidas"],
  },
  {
    id: 13,
    name: "Guaraviton",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/guaraviton.png",
    category: bySlug["bebidas"],
  },
  {
    id: 14,
    name: "Toddynho",
    description: "",
    price: 5.0,
    imageUrl: "/images/products/toddynho.png",
    category: bySlug["bebidas"],
  },
  {
    id: 15,
    name: "Água",
    description: "",
    price: 3.5,
    imageUrl: "/images/products/agua.jpg",
    category: bySlug["bebidas"],
  },
  {
    id: 16,
    name: "Alfajor",
    description: "",
    price: 7.5,
    imageUrl: "/images/products/alfajor.jpg",
    category: bySlug["doces"],
  },
  {
    id: 17,
    name: "Paçoca",
    description: "",
    price: 0.5,
    imageUrl: "/images/products/pacoca.jpg",
    category: bySlug["doces"],
  },
  {
    id: 18,
    name: "Paçoca Caseira",
    description: "",
    price: 5.5,
    imageUrl: "/images/products/pacoca2.jpg",
    category: bySlug["doces"],
  },
  {
    id: 19,
    name: "Pé de Moca",
    description: "",
    price: 3.5,
    imageUrl: "/images/products/pedemoca.jpg",
    category: bySlug["doces"],
  },
  {
    id: 20,
    name: "Cookie",
    description: "",
    price: 6.5,
    imageUrl: "/images/products/cookie.jpg",
    category: bySlug["doces"],
  },
  {
    id: 21,
    name: "Halls Morango",
    description: "",
    price: 3.0,
    imageUrl: "/images/products/hallsmorango.jpg",
    category: bySlug["doces"],
  },
  {
    id: 22,
    name: "Halls Preto",
    description: "",
    price: 3.0,
    imageUrl: "/images/products/hallspreto.jpg",
    category: bySlug["doces"],
  },
  {
    id: 23,
    name: "Pingo de Leite",
    description: "",
    price: 0.5,
    imageUrl: "/images/products/pingo.jpg",
    category: bySlug["doces"],
  },
];

// [VERCEL] Pedidos mockados (vazio por padrão)
export const orders: any[] = [];
