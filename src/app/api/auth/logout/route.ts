// [VERCEL] Limpa o cookie e encerra sessão
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true, message: "Logout realizado" });

    // Limpa o cookie setando maxAge = 0
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json(
      { ok: false, message: "Erro ao fazer logout" },
      { status: 500 }
    );
  }
}
