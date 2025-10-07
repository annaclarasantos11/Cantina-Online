'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';

const nav: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Início' },
  { href: '/menu', label: 'Menu' },
  { href: '/horarios', label: 'Horários' },
  { href: '/sobre', label: 'Sobre' },
];

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold text-xl">
          Cantina<span className="text-sky-600">Online</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href as any}
              aria-current={pathname === i.href ? 'page' : undefined}
              className={`transition hover:text-sky-700 ${
                pathname === i.href ? 'text-sky-700 font-medium' : 'text-gray-600'
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Abrir carrinho"
          className="btn btn-outline relative"
          onClick={() => setOpen(true)}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Carrinho
          <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-600 px-2 text-sm text-white">
            {count}
          </span>
        </button>
      </div>

      <CartDrawer open={open} onOpenChange={setOpen} />
    </header>
  );
}
