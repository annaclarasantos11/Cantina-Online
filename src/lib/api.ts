export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const port = process.env.NEXT_PUBLIC_API_PORT?.trim() || "4000";
    return `${protocol}//${hostname}:${port}`.replace(/\/$/, "");
  }

  return "http://localhost:4000";
}
