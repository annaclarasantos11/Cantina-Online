// [VERCEL] Atualizar perfil do usuário
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(req: Request) {
  try {
    const [{ default: jwt }, { db }] = await Promise.all([
      import("jsonwebtoken"),
      import("@/lib/prisma"),
    ]);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado" },
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
        { ok: false, message: "Token inválido" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, email } = body ?? {};

    if (!name && !email) {
      return NextResponse.json(
        { ok: false, message: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    const userId = parseInt(payload.sub, 10);

    // Se tentando trocar email, verifica se não existe
    if (email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { ok: false, message: "Email já está em uso" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { ok: false, message: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}
