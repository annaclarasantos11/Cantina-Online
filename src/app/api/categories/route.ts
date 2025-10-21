import { NextResponse } from "next/server";
import { HAS_DB } from "@/env";

// [VERCEL] Evita prerender/export dessas rotas no build
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // [VERCEL] Sem DATABASE_URL? Use mock para build/preview/produção sem banco
  if (!process.env.DATABASE_URL) {
    const { categories } = await import("@/data/mock");
    return NextResponse.json(categories);
  }

  // --- SEU CÓDIGO EXISTENTE (Prisma) MANTIDO, APENAS RODARÁ QUANDO TIVER DB ---
  const { db } = await import("@/lib/prisma");
  const data = await db.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(data);
}
