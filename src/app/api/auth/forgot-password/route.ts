import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ message: "E-mail obrigatório" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: "Banco de dados não configurado" }, { status: 503 });
    }

    const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });

    // Mesmo que não exista usuário, retornamos sucesso para evitar enumeração de emails.
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    console.info("[auth/forgot-password] Solicitação recebida para:", email);
    // Implementação de envio de e-mail/token pode ser adicionada aqui.

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth/forgot-password] erro:", error);
    return NextResponse.json({ message: "Erro ao processar solicitação" }, { status: 500 });
  }
}
