import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import HeaderClient from "@/components/HeaderClient";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Cantina Online",
  description: "Pedidos rápidos na cantina escolar — Next.js + Prisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${cormorant.variable}`}>
      <body className="font-sans bg-cantina text-gray-900">
        <AuthProvider>
          <CartProvider>
            <HeaderClient />
            <main className="relative w-full">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
