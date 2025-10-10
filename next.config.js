/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/auth/:path*", destination: "http://127.0.0.1:4000/auth/:path*" }];
  },
};
export default nextConfig;
