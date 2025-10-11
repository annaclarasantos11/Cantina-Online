'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Route } from 'next';

const nav: Array<{ href: Route; label: string }> = [
  { href: '/', label: 'Início' },
  { href: '/menu', label: 'Menu' },
  { href: '/horarios', label: 'Horários' },
  { href: '/sobre', label: 'Sobre' },
];

export default function HeaderClient() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user, signOut, initializing, refreshProfile } = useAuth();

  const [openMobile, setOpenMobile] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initializing && !user) {
      refreshProfile();
    }
  }, [initializing, user, refreshProfile]);

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

  useEffect(() => {
    if (!openUserMenu) return;
    function onClick(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [openUserMenu]);

  useEffect(() => {
    setOpenUserMenu(false);
    setOpenMobile(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const userInitial = useMemo(() => {
    if (!user) return '?';
    const source = user.name?.trim() || user.email;
    return source ? source.charAt(0).toUpperCase() : '?';
  }, [user]);

  const userDisplayName = useMemo(() => {
    if (!user) return '';
    return user.name?.trim() || user.email;
  }, [user]);

  const firstName = useMemo(() => {
    if (!user) return '';
    const base = (user.name?.trim() || user.email).trim();
    const head = base.includes(' ') ? base.split(' ')[0] : base;
    return head.includes('@') ? head.split('@')[0] : head;
  }, [user]);

  const brand = useMemo(
    () => (
      <Link href={{ pathname: '/' }} className="flex items-center font-semibold tracking-tight">
        <span>Cantina</span>
        <span className="text-orange-600">Online</span>
      </Link>
    ),
    []
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/80">
      <div className="container mx-auto max-w-7xl px-4">
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
                      ? 'text-orange-700 font-semibold underline underline-offset-4'
                      : 'text-gray-700 hover:text-orange-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {!initializing && user ? (
              <div className="relative flex items-center gap-3" ref={userMenuRef}>
                <span className="hidden md:inline text-sm text-gray-700">
                  Olá, <b>{firstName}</b>
                </span>

                <button
                  type="button"
                  onClick={() => setOpenUserMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white pl-1 pr-3 py-1.5 text-sm text-gray-800 shadow-sm transition hover:border-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                  aria-haspopup="menu"
                  aria-expanded={openUserMenu}
                >
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white"
                    aria-label={`Conta de ${userDisplayName}`}
                  >
                    {userInitial}
                  </span>
                  <span className="hidden sm:inline max-w-[8rem] truncate text-left font-medium">
                    {userDisplayName}
                  </span>
                </button>

                {openUserMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                  >
                    <div className="px-4 pb-3 text-sm text-gray-700">
                      <p className="font-semibold truncate" title={userDisplayName}>
                        {userDisplayName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500" title={user.email}>
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/perfil"
                      onClick={() => setOpenUserMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                    >
                      Meu perfil
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenUserMenu(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : initializing ? (
              <div
                className="hidden h-10 w-24 animate-pulse rounded-full bg-gray-200 sm:inline-block"
                aria-hidden="true"
              />
            ) : (
              <Link
                href={{ pathname: '/auth/login' }}
                className="hidden sm:inline-flex btn btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
              >
                Entrar
              </Link>
            )}

            <Link
              href={{ pathname: '/pedidos' }}
              className={[
                'inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600',
                count > 0
                  ? 'border-orange-600 bg-orange-50 text-orange-800'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
              ].join(' ')}
              aria-label={`Ir para o carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Carrinho
              <span
                className={[
                  'ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-sm font-semibold text-white',
                  count > 0 ? 'bg-orange-600' : 'bg-gray-400',
                  pop ? 'animate-[pop_.3s_ease]' : '',
                ].join(' ')}
              >
                {count}
              </span>
            </Link>

            <button
              onClick={() => setOpenMobile((v) => !v)}
              className="md:hidden rounded-md border border-gray-300 p-2 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
              aria-label={openMobile ? 'Fechar menu' : 'Abrir menu'}
            >
              {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {openMobile && (
        <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur">
          <nav aria-label="Principal (mobile)" className="container mx-auto max-w-7xl px-4 py-2">
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
                          ? 'text-orange-700 font-semibold underline underline-offset-4'
                          : 'text-gray-700 hover:text-orange-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {user ? (
                <li className="mt-2 border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-3 px-3 pb-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white">
                      {userInitial}
                    </span>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">Olá, {firstName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setOpenMobile(false)}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Meu perfil
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMobile(false);
                      signOut();
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </li>
              ) : (
                <li className="mt-1">
                  <Link
                    href={{ pathname: '/auth/login' }}
                    onClick={() => setOpenMobile(false)}
                    className="block rounded-md px-3 py-2 text-sm text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Entrar
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

    </header>
  );
}
