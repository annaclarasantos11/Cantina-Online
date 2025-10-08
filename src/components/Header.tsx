'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useMemo, useState } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import type { Route } from 'next';

const nav: Array<{ href: Route; label: string }> = [
  { href: '/', label: 'Início' },
  { href: '/menu', label: 'Menu' },
  { href: '/horarios', label: 'Horários' },
  { href: '/sobre', label: 'Sobre' },
];

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [openCart, setOpenCart] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  const [pop, setPop] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  useEffect(() => {
    if (count !== prevCount) {
      setPrevCount(count);
      setPop(true);
      const t = setTimeout(() => setPop(false), 300);
      return () => clearTimeout(t);
    }
  }, [count, prevCount]);

  const isActive = (href: string) => pathname === href;

  const brand = useMemo(
    () => (
      <Link href={{ pathname: '/' }} className="flex items-center font-semibold tracking-tight">
        <span>Cantina</span>
        <span className="text-sky-600">Online</span>
      </Link>
    ),
    []
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/80">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {brand}

          <nav aria-label="Principal" className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={{ pathname: item.href }}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'rounded-md px-3 py-2 text-sm transition',
                    active
                      ? 'text-sky-700 font-semibold underline underline-offset-4'
                      : 'text-gray-700 hover:text-sky-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={{ pathname: '/auth/login' }}
              className="hidden sm:inline-flex btn btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600"
            >
              Entrar
            </Link>

            <button
              onClick={() => setOpenCart(true)}
              className={[
                'inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600',
                count > 0
                  ? 'border-sky-600 bg-sky-50 text-sky-800'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
              ].join(' ')}
              aria-label={`Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
              aria-live="polite"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Carrinho
              <span
                className={[
                  'ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-sm font-semibold text-white',
                  count > 0 ? 'bg-sky-600' : 'bg-gray-400',
                  pop ? 'animate-[pop_.3s_ease]' : '',
                ].join(' ')}
              >
                {count}
              </span>
            </button>

            <button
              onClick={() => setOpenMobile((v) => !v)}
              className="md:hidden rounded-md border border-gray-300 p-2 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600"
              aria-label={openMobile ? 'Fechar menu' : 'Abrir menu'}
            >
              {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {openMobile && (
        <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur">
          <nav aria-label="Principal (mobile)" className="container mx-auto max-w-6xl px-4 py-2">
            <ul className="flex flex-col py-2">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={{ pathname: item.href }}
                      onClick={() => setOpenMobile(false)}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'block rounded-md px-3 py-2 text-sm transition',
                        active
                          ? 'text-sky-700 font-semibold underline underline-offset-4'
                          : 'text-gray-700 hover:text-sky-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-1">
                <Link
                  href={{ pathname: '/auth/login' }}
                  onClick={() => setOpenMobile(false)}
                  className="block rounded-md px-3 py-2 text-sm text-white bg-sky-600 hover:bg-sky-700"
                >
                  Entrar
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <CartDrawer open={openCart} onOpenChange={setOpenCart} />
    </header>
  );
}
