import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  // Delete o produto com nome "Pão de avelã"
  const deleted = await db.product.deleteMany({
    where: {
      name: 'Pão de avelã',
    },
  });

  console.log(`Deletados ${deleted.count} produto(s)`);

  // Agora cria o produto correto
  await db.product.create({
    data: {
      name: 'Pão de avelã',
      description: '',
      price: 9.90,
      stock: 100,
      imageUrl: '/images/products/pao-avela.png',
      categoryId: 1, // Assumindo que Lanches tem ID 1
    },
  });

  console.log('Produto recriado com a imagem correta!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
