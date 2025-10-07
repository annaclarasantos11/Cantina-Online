import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "Cantina Online",
  description: "Pedidos rápidos na cantina escolar — Next.js + Prisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Header />
          <main className="container py-8">{children}</main>
          <footer className="border-t mt-12 py-8 text-center text-sm text-gray-600">
            Cantina Online · {new Date().getFullYear()}
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
