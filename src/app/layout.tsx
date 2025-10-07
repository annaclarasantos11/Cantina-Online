import type { Metadata } from "next";
import "./globals.css";
import HeaderClient from "@/components/HeaderClient";
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
          <HeaderClient />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
