// [VERCEL] Centraliza flags de ambiente para evitar erros no build da Vercel.
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_VERCEL = process.env.VERCEL === "1"; // setado pela própria Vercel
export const HAS_DB = Boolean(process.env.DATABASE_URL); // se falso, usamos mock
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
// [VERCEL] Quando API_BASE === "", fetch(`${API_BASE}/api/...`) resolve para same-origin.
// Isso evita URL "undefined/..." no client.
export const ENABLE_LOCAL_REWRITE = process.env.NEXT_PUBLIC_ENABLE_LOCAL_REWRITE === "1";
