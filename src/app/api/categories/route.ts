import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await db.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(data);
}
