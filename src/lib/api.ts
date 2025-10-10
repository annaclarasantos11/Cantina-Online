export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  const isHttp = /^https?:\/\//i.test(raw);
  const base = (isHttp ? raw : "http://127.0.0.1:4000").replace(/\/$/, "");
  return base.replace("://localhost", "://127.0.0.1");
}
