// [VERCEL] Obter usuário atual baseado no cookie JWT
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const [{ default: jwt }, { db }] = await Promise.all([
      import("jsonwebtoken"),
      import("@/lib/prisma"),
    ]);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json(
        { ok: false, user: null },
        { status: 401 }
      );
    }

    let payload: { sub: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string;
      };
    } catch (error) {
      return NextResponse.json(
        { ok: false, user: null },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: parseInt(payload.sub, 10) },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return NextResponse.json(
      { ok: false, user: null, message: "Erro ao obter usuário" },
      { status: 500 }
    );
  }
}
