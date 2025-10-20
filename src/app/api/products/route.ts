import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { HAS_DB } from "@/env";

export async function GET() {
  // [VERCEL] Fallback para mock quando HAS_DB === false.
  // ATENÇÃO: código Prisma existente mantido abaixo.
  if (HAS_DB) {
    // --- CÓDIGO EXISTENTE (Prisma) MANTIDO ---
    const data = await db.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(data);
    // -----------------------------------------
  }

  // [VERCEL] Sem DB → retorna mock
  const { products } = await import("@/data/mock");
  return NextResponse.json(products);
}
