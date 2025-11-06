import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: "Banco de dados não configurado" }, { status: 503 });
  }

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
  }

  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "E-mail inválido" }, { status: 400 });
  }

  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ message: "Senha deve ter entre 8 e 128 caracteres" }, { status: 400 });
  }

  try {
    const [{ default: bcrypt }, { db }] = await Promise.all([
      import("bcryptjs"),
      import("@/lib/prisma"),
    ]);

    const user = await db.user.findUnique({ where: { email }, select: { id: true } });

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true, message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("[auth/reset-password] erro:", error);
    return NextResponse.json({ message: "Erro ao atualizar senha" }, { status: 500 });
  }
}
