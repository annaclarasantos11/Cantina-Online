/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // [PRODUCTION] Rewrite para backend em produção
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    
    // Modo development: rewrite para localhost se ativado
    if (process.env.NEXT_PUBLIC_ENABLE_LOCAL_REWRITE === "1") {
      return [{ source: "/auth/:path*", destination: "http://127.0.0.1:4000/auth/:path*" }];
    }

    // Modo produção: rewrite para backend remoto se definido
    if (apiBase) {
      return [{ source: "/auth/:path*", destination: `${apiBase}/auth/:path*` }];
    }

    // Sem backend: sem rewrite
    return [];
  },
};

export default nextConfig;
