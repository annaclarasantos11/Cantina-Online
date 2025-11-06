import { API_BASE, ENABLE_LOCAL_REWRITE } from "@/env";

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const res = await fetch(`/api${normalizedPath}`, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });

  if (!res.ok) {
    const err = await safeJson(res);
    const message = (err as any)?.error || (err as any)?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return (await safeJson(res)) as T;
}

export async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function getApiBaseUrl(): string {
  if (API_BASE) {
    return API_BASE;
  }

  if (typeof window !== "undefined" && ENABLE_LOCAL_REWRITE) {
    const { protocol, hostname } = window.location;
    const port = process.env.NEXT_PUBLIC_API_PORT?.trim() || "4000";
    return `${protocol}//${hostname}:${port}`.replace(/\/$/, "");
  }

  return "";
}
