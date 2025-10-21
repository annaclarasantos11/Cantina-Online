/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // [VERCEL] Em produção, não reescreva para localhost.
    // Habilite apenas localmente via NEXT_PUBLIC_ENABLE_LOCAL_REWRITE=1
    if (!process.env.NEXT_PUBLIC_ENABLE_LOCAL_REWRITE) return [];

    // --- CÓDIGO EXISTENTE MANTIDO ABAIXO ---
    return [{ source: "/auth/:path*", destination: "http://127.0.0.1:4000/auth/:path*" }];
    // ----------------------------------------
  },
};
export default nextConfig;
