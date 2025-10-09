export function getApiBaseUrl(): string {
  if (typeof process !== "undefined") {
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (configured) {
      return configured.replace(/\/$/, "");
    }
  }
  return "http://localhost:4000";
}
