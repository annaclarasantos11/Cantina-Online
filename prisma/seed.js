const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Mock categories e products
const categories = [
  { id: 1, name: "Lanches", slug: "lanches" },
  { id: 2, name: "Bebidas", slug: "bebidas" },
  { id: 3, name: "Doces", slug: "doces" },
  { id: 4, name: "Refeições", slug: "refeicoes" },
];

const products = [
  {
    id: 1,
    name: "Croissant de Chocolate",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/croissant-chocolate.png",
    categoryId: 1,
  },
  {
    id: 2,
    name: "Croissante de Queijo",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/croissante-queijo.png",
    categoryId: 1,
  },
  {
    id: 3,
    name: "Pão de batata",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/pao-batata.png",
    categoryId: 1,
  },
  {
    id: 4,
    name: "Pão de avelã",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/pao-avela.png",
    categoryId: 1,
  },
  {
    id: 5,
    name: "Torta de brócolis",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/torta-brocolis.png",
    categoryId: 1,
  },
  {
    id: 6,
    name: "Folheado de 4 queijos",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/folheado-4-queijos.png",
    categoryId: 1,
  },
  {
    id: 7,
    name: "Folheado de pizza",
    description: "",
    price: 9.9,
    imageUrl: "/images/products/folheado-pizza.png",
    categoryId: 1,
  },
  {
    id: 8,
    name: "H2O",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/h2o.png",
    categoryId: 2,
  },
  {
    id: 9,
    name: "Del Valle Uva (1L)",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/del-valle-uva.png",
    categoryId: 2,
  },
  {
    id: 10,
    name: "Gatorade",
    description: "",
    price: 8.0,
    imageUrl: "/images/products/gatorade.png",
    categoryId: 2,
  },
  {
    id: 11,
    name: "Limoneto",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/limoneto.png",
    categoryId: 2,
  },
  {
    id: 12,
    name: "Chá Leão Guaraná",
    description: "",
    price: 4.5,
    imageUrl: "/images/products/cha-leao-guarana.png",
    categoryId: 2,
  },
  {
    id: 13,
    name: "Guaraviton",
    description: "",
    price: 6.0,
    imageUrl: "/images/products/guaraviton.png",
    categoryId: 2,
  },
  {
    id: 14,
    name: "Toddynho",
    description: "",
    price: 5.0,
    imageUrl: "/images/products/toddynho.png",
    categoryId: 2,
  },
  {
    id: 15,
    name: "Água",
    description: "",
    price: 3.5,
    imageUrl: "/images/products/agua.jpg",
    categoryId: 2,
  },
  {
    id: 16,
    name: "Alfajor",
    description: "",
    price: 7.5,
    imageUrl: "/images/products/alfajor.jpg",
    categoryId: 3,
  },
  {
    id: 17,
    name: "Paçoca",
    description: "",
    price: 0.5,
    imageUrl: "/images/products/pacoca.jpg",
    categoryId: 3,
  },
  {
    id: 18,
    name: "Paçoca Caseira",
    description: "",
    price: 5.5,
    imageUrl: "/images/products/pacoca2.jpg",
    categoryId: 3,
  },
  {
    id: 19,
    name: "Pé de Moca",
    description: "",
    price: 3.5,
    imageUrl: "/images/products/pedemoca.jpg",
    categoryId: 3,
  },
  {
    id: 20,
    name: "Cookie",
    description: "",
    price: 6.5,
    imageUrl: "/images/products/cookie.jpg",
    categoryId: 3,
  },
  {
    id: 21,
    name: "Halls Morango",
    description: "",
    price: 3.0,
    imageUrl: "/images/products/hallsmorango.jpg",
    categoryId: 3,
  },
  {
    id: 22,
    name: "Halls Preto",
    description: "",
    price: 3.0,
    imageUrl: "/images/products/hallspreto.jpg",
    categoryId: 3,
  },
  {
    id: 23,
    name: "Pingo de Leite",
    description: "",
    price: 0.5,
    imageUrl: "/images/products/pingo.jpg",
    categoryId: 3,
  },
];

async function main() {
  console.log("Starting seed...");

  // Upsert categories
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, slug: c.slug },
      create: { id: c.id, name: c.name, slug: c.slug },
    });
  }
  console.log(`✓ ${categories.length} categories seeded`);

  // Upsert products
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
      },
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
      },
    });
  }
  console.log(`✓ ${products.length} products seeded`);
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
