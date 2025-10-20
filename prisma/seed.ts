import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  // Categorias — mantive as quatro, mesmo sem usar Doces/Refeições agora
  const categories = [
    { name: 'Lanches', slug: 'lanches' },
    { name: 'Bebidas', slug: 'bebidas' },
    { name: 'Doces', slug: 'doces' },
    { name: 'Refeições', slug: 'refeicoes' },
  ];

  const map: Record<string, number> = {};

  for (const c of categories) {
    const r = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    map[c.slug] = r.id;
  }

  // Limpa dados antigos
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();

  // ====== PRODUTOS NOVOS ======
  const products = [
    // Lanches (R$ 9,90)
    {
      name: 'Croissant de Chocolate',
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/croissant-chocolate.png',
      categorySlug: 'lanches',
    },
    {
      name: 'Croissante de Queijo', // grafia conforme você pediu
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/croissante-queijo.png',
      categorySlug: 'lanches',
    },
    {
      name: 'Pão de batata',
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/pao-batata.png',
      categorySlug: 'lanches',
    },
    {
      name: 'Pão de avelã',
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/pao-avela.png',
      categorySlug: 'lanches',
    },
    {
      name: 'Torta de brócolis',
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/torta-brocolis.png',
      categorySlug: 'lanches',
    },
    {
      name: 'Folheado de 4 queijos',
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/folheado-4-queijos.png',
      categorySlug: 'lanches',
    },
    {
      name: 'Folheado de pizza',
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/folheado-pizza.png',
      categorySlug: 'lanches',
    },

    // Bebidas
    { name: 'H2O',                description: '', price: 6.00, stock: 100, imageUrl: '/images/products/h2o.png', categorySlug: 'bebidas' },
    { name: 'Del Valle Uva (1L)', description: '', price: 6.00, stock: 100, imageUrl: '/images/products/del-valle-uva.png', categorySlug: 'bebidas' },
    { name: 'Gatorade',           description: '', price: 8.00, stock: 100, imageUrl: '/images/products/gatorade.png', categorySlug: 'bebidas' },
    { name: 'Limoneto',           description: '', price: 6.00, stock: 100, imageUrl: '/images/products/limoneto.png', categorySlug: 'bebidas' },
    { name: 'Chá Leão Guaraná',   description: '', price: 4.50, stock: 100, imageUrl: '/images/products/cha-leao-guarana.png', categorySlug: 'bebidas' },
    { name: 'Guaraviton',         description: '', price: 6.00, stock: 100, imageUrl: '/images/products/guaraviton.png', categorySlug: 'bebidas' },
    { name: 'Toddynho',           description: '', price: 5.00, stock: 100, imageUrl: '/images/products/toddynho.png', categorySlug: 'bebidas' },

    // Doces
    { name: 'Alfajor',            description: '', price: 7.50, stock: 100, imageUrl: '/images/products/alfajor.jpg', categorySlug: 'doces' },
    { name: 'Paçoca',             description: '', price: 0.50, stock: 100, imageUrl: '/images/products/pacoca.jpg', categorySlug: 'doces' },
    { name: 'Paçoca Caseira',     description: '', price: 5.50, stock: 100, imageUrl: '/images/products/pacoca2.jpg', categorySlug: 'doces' },
    { name: 'Pé de Moca',         description: '', price: 3.50, stock: 100, imageUrl: '/images/products/pedemoca.jpg', categorySlug: 'doces' },
    { name: 'Cookie',             description: '', price: 6.50, stock: 100, imageUrl: '/images/products/cookie.jpg', categorySlug: 'doces' },
    { name: 'Halls Morango',      description: '', price: 3.00, stock: 100, imageUrl: '/images/products/hallsmorango.jpg', categorySlug: 'doces' },
    { name: 'Halls Preto',        description: '', price: 3.00, stock: 100, imageUrl: '/images/products/hallspreto.jpg', categorySlug: 'doces' },
    { name: 'Pingo de Leite',     description: '', price: 0.50, stock: 100, imageUrl: '/images/products/pingo.jpg', categorySlug: 'doces' },
    { name: 'Água',               description: '', price: 3.50, stock: 100, imageUrl: '/images/products/agua.jpg', categorySlug: 'bebidas' },
  ] as const;

  for (const p of products) {
    await db.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: map[p.categorySlug],
      },
    });
  }

  console.log('Seed ok');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
