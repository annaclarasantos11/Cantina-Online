// [VERCEL] Obter usuário atual baseado no cookie JWT
// Retorna 200 sempre - deixa o frontend decidir a UI
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Sem token ou sem secret, retorna 200 com auth: false
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({
        ok: false,
        auth: false,
        user: null,
      });
    }

    const [{ default: jwt }, { db }] = await Promise.all([
      import("jsonwebtoken"),
      import("@/lib/prisma"),
    ]);

    let payload: { sub: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string;
      };
    } catch (error) {
      // Token inválido/expirado - ainda retorna 200
      return NextResponse.json({
        ok: false,
        auth: false,
        user: null,
      });
    }

    const user = await db.user.findUnique({
      where: { id: parseInt(payload.sub, 10) },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({
        ok: false,
        auth: false,
        user: null,
      });
    }

    return NextResponse.json({
      ok: true,
      auth: true,
      user,
    });
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    // Erro no servidor - ainda retorna 200 com auth: false
    return NextResponse.json({
      ok: false,
      auth: false,
      user: null,
    });
  }
}
