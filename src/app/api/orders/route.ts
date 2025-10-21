import { db } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { HAS_DB } from "@/env";

// [VERCEL] Evita prerender/export dessas rotas no build
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");

    if (!userIdParam) {
      return NextResponse.json({ message: "userId é obrigatório" }, { status: 400 });
    }

    const userId = Number(userIdParam);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ message: "userId inválido" }, { status: 400 });
    }

    // [VERCEL] Sem DATABASE_URL? Use mock para build/preview/produção sem banco
    if (!process.env.DATABASE_URL) {
      const { orders } = await import("@/data/mock");
      return NextResponse.json(orders, { status: 200 });
    }

    // --- SEU CÓDIGO EXISTENTE (Prisma) MANTIDO, APENAS RODARÁ QUANDO TIVER DB ---
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const payload = orders.map((order: any) => {
      const items = order.items.map((it: any) => {
        const unitPrice = Number(it.price ?? it.product?.price ?? 0);
        const quantity = Number(it.quantity ?? 0);
        const subtotal = unitPrice * quantity;
        return {
          id: it.id,
          name: it.product?.name ?? "Produto",
          quantity,
          unitPrice,
          subtotal,
        };
      });
      const total = items.reduce((acc: number, item: any) => acc + item.subtotal, 0);
      return {
        id: order.id,
        createdAt: order.createdAt,
        total,
        items,
      };
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders error", error);
    return NextResponse.json({ message: "Erro ao listar pedidos" }, { status: 500 });
  }
}

type Body = {
  name: string;
  note?: string;
  userId: number;
  items: { productId: number; quantity: number }[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body?.name || !body?.userId || !Array.isArray(body?.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  // validate quantities
  for (const it of body.items) {
    if (!it.productId || !Number.isInteger(it.quantity) || it.quantity <= 0) {
      return NextResponse.json({ error: 'Item inválido' }, { status: 400 });
    }
  }

  // [VERCEL] Sem DB, retorna erro indicando que o backend é necessário.
  if (!HAS_DB) {
    return NextResponse.json({ error: 'Criação de pedidos requer backend com banco de dados' }, { status: 503 });
  }

  try {
    const aggregated = new Map<number, number>();
    for (const item of body.items) {
      aggregated.set(item.productId, (aggregated.get(item.productId) ?? 0) + item.quantity);
    }

    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const ids = Array.from(aggregated.keys());
      const products = await tx.product.findMany({ where: { id: { in: ids } } });

      if (products.length !== ids.length) {
        const missing = ids.filter((id) => !products.some((p: any) => p.id === id));
        throw new Error(`Produto(s) não encontrados: ${missing.join(", ")}`);
      }

      for (const product of products) {
        const requestedQty = aggregated.get(product.id) ?? 0;
        if (product.stock < requestedQty) {
          throw new Error(`Estoque insuficiente para ${product.name}`);
        }
      }

      const order = await tx.order.create({
        data: {
          name: body.name,
          note: body.note ?? null,
          user: { connect: { id: body.userId } },
          items: {
            create: products.map((product: any) => ({
              productId: product.id,
              quantity: aggregated.get(product.id) ?? 0,
              price: Number(product.price),
            })),
          },
        },
      });

      await Promise.all(
        products.map((product: any) =>
          tx.product.update({
            where: { id: product.id },
            data: {
              stock: {
                decrement: aggregated.get(product.id) ?? 0,
              },
            },
          })
        )
      );

      return { id: order.id, number: order.id };
    });

    return NextResponse.json({ orderId: result.id, orderNumber: result.number });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Erro ao criar pedido' }, { status: 400 });
  }
}
