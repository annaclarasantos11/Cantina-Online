// [VERCEL] Valida/renova sessão via cookie
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const [{ default: jwt }, { db }] = await Promise.all([
      import("jsonwebtoken"),
      import("@/lib/prisma"),
    ]);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json(
        { ok: false, message: "Token ausente ou inválido" },
        { status: 401 }
      );
    }

    let payload: { sub: string; email: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string;
        email: string;
      };
    } catch (error) {
      return NextResponse.json(
        { ok: false, message: "Token expirado ou inválido" },
        { status: 401 }
      );
    }

    // Busca usuário para validar se ainda existe
    const user = await db.user.findUnique({
      where: { id: parseInt(payload.sub, 10) },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    // Reemite token para estender sessão
    const newToken = jwt.sign(
      { sub: String(user.id), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    res.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return res;
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return NextResponse.json(
      { ok: false, message: "Erro ao renovar sessão" },
      { status: 500 }
    );
  }
}
