import type { Metadata } from "next";
import "./globals.css";
import HeaderClient from "@/components/HeaderClient";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Cantina Online",
  description: "Pedidos rápidos na cantina escolar — Next.js + Prisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <CartProvider>
            <HeaderClient />
            <main className="mx-auto max-w-7xl px-4">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
