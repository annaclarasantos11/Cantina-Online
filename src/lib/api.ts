// [VERCEL] Versão atualizada que usa env centralizado.
import { API_BASE, ENABLE_LOCAL_REWRITE } from "@/env";

export function getApiBaseUrl(): string {
  // [VERCEL] Se NEXT_PUBLIC_API_URL está definida, usar
  if (API_BASE) {
    return API_BASE;
  }

  // [VERCEL] Em desenvolvimento com rewrite para localhost
  if (typeof window !== "undefined" && ENABLE_LOCAL_REWRITE) {
    const { protocol, hostname } = window.location;
    const port = process.env.NEXT_PUBLIC_API_PORT?.trim() || "4000";
    return `${protocol}//${hostname}:${port}`.replace(/\/$/, "");
  }

  // [VERCEL] Default: same-origin (localhost:3000 em dev, vercel.app em prod)
  // Fetch automático resolve para same-origin
  return "";
}
