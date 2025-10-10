import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api";

function apiBaseIPv4() {
  return getApiBaseUrl().replace("://localhost", "://127.0.0.1");
}

export async function POST(req: NextRequest) {
  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const url = `${apiBaseIPv4()}/auth/register`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data: any = null;
    try { data = await res.json(); } catch {}

    if (res.ok) {
      console.log("[Next/api] Cadastro OK:", payload?.email, "->", url);
      return NextResponse.json(data ?? { ok: true }, { status: res.status });
    }

    console.warn("[Next/api] Cadastro falhou:", data?.message || res.statusText, "status=", res.status, "url=", url);
    return NextResponse.json(data ?? { message: "Erro ao cadastrar" }, { status: res.status });
  } catch (err: any) {
    console.error("[Next/api] Fetch para backend falhou:", err?.code || err?.message, "url=", url);
    return NextResponse.json({ message: "API backend indisponível", target: url }, { status: 502 });
  }
}
