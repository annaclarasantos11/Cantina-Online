import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Body = {
  name: string;
  note?: string;
  items: { productId: number; quantity: number }[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body?.name || !Array.isArray(body?.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  // validate quantities
  for (const it of body.items) {
    if (!it.productId || !Number.isInteger(it.quantity) || it.quantity <= 0) {
      return NextResponse.json({ error: 'Item inválido' }, { status: 400 });
    }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Check stock
      for (const it of body.items) {
        const p = await tx.product.findUnique({ where: { id: it.productId } });
        if (!p) throw new Error(`Produto ${it.productId} não encontrado`);
        if (p.stock < it.quantity) throw new Error(`Estoque insuficiente para ${p.name}`);
      }

      // Create order
      const order = await tx.order.create({
        data: {
          name: body.name,
          note: body.note ?? null,
        },
      });

      // Items and stock decrement
      for (const it of body.items) {
        const p = await tx.product.findUniqueOrThrow({ where: { id: it.productId } });
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: p.id,
            quantity: it.quantity,
            price: p.price,
          },
        });
        await tx.product.update({
          where: { id: p.id },
          data: { stock: p.stock - it.quantity },
        });
      }

      return order.id;
    });

    return NextResponse.json({ orderId: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Erro ao criar pedido' }, { status: 400 });
  }
}
