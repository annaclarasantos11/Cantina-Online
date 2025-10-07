# Cantina Online

Sistema acadêmico de pedidos para cantina escolar — **Next.js + Tailwind + Prisma**.

> **Versão**: 2025-10-02

## Requisitos
- Node.js 20+
- MySQL acessível via `DATABASE_URL`

## Instalação
```bash
cp .env.example .env            # edite com seu MySQL
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Abra http://localhost:3000

## Rotas de API
- `GET /api/health` → `{ ok: true }`
- `GET /api/categories` → categorias
- `GET /api/products` → produtos (com `category` embutida)
- `POST /api/orders` → cria pedido: `{ name, note?, items:[{productId, quantity}] }`

## Deploy (Vercel)
- Adicione a env `DATABASE_URL`
- Build padrão `npm run build`

## Observações
- Imagens são placeholders em `public/images/`.
- Carrinho usa `localStorage` e persiste no navegador.
