import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await db.product.findMany({
    include: { category: true },
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(data);
}
