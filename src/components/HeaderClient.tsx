'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from 'next';
import { ShoppingCart, Menu, X, LogOut, Search, Clock, Phone } from 'lucide-react';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const [searchTerm, setSearchTerm] = useState('');
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
      const timer = setTimeout(() => setPop(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  useEffect(() => {
    if (!openUserMenu) return;
    function handleClick(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [openUserMenu]);

  useEffect(() => {
    setOpenMobile(false);
    setOpenUserMenu(false);
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

  const brand = (
    <Link
      href={{ pathname: '/' }}
      className="group flex items-center gap-3 rounded-2xl border border-orange-100/60 bg-white/70 px-3 py-2 shadow-[0_16px_28px_-22px_rgba(249,115,22,0.55)] transition hover:border-orange-200 hover:bg-white/90"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-semibold text-white shadow-[0_12px_18px_-12px_rgba(249,115,22,0.8)]">
        CO
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[1.35rem] font-semibold text-gray-900 tracking-tight">
          Cantina<span className="text-orange-600">Online</span>
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-500/80">Sabor no intervalo</span>
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="hidden border-b border-orange-100/70 bg-[linear-gradient(120deg,#f97316,#fb923c,#f97316)] text-white md:block">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs font-semibold tracking-wide">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden />
            Pedidos até as 10h • retirada garantida às 10h30
          </span>
          <a href="tel:+5511999999999" className="flex items-center gap-2 text-white/90 transition hover:text-white">
            <Phone className="h-4 w-4" aria-hidden />
            Fale com a cantina
          </a>
        </div>
      </div>

      <div className="border-b border-orange-100/60">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {brand}

            <div className="hidden flex-1 lg:flex">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-full border border-orange-100 bg-white/80 py-3 pl-11 pr-4 text-sm text-gray-700 shadow-inner outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Buscar pratos, bebidas ou categorias..."
                  aria-label="Buscar no cardápio"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                href="/menu"
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-orange-500/80 bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_28px_-18px_rgba(249,115,22,0.65)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_32px_-18px_rgba(234,88,12,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden />
                Ver cardápio
              </Link>

              <Link
                href={{ pathname: '/pedidos' }}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600 ${
                  count > 0
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:text-orange-700'
                }`}
                aria-label={`Ir para o carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Carrinho</span>
                <span
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold text-white ${
                    count > 0 ? 'bg-orange-600' : 'bg-gray-400'
                  } ${pop ? 'animate-[pop_.3s_ease]' : ''}`}
                  aria-live="polite"
                >
                  {count}
                </span>
              </Link>

              {!initializing && user ? (
                <div className="relative flex items-center gap-2 md:gap-3" ref={userMenuRef}>
                  <div className="hidden flex-col leading-tight text-right lg:flex">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Bem-vindo</span>
                    <span className="text-sm font-semibold text-gray-700">{firstName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenUserMenu((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-1.5 py-1.5 text-sm text-gray-800 shadow-sm transition hover:border-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                    aria-haspopup="menu"
                    aria-expanded={openUserMenu}
                  >
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-base font-semibold text-white"
                      aria-label={`Conta de ${userDisplayName}`}
                    >
                      {userInitial}
                    </span>
                    <span className="hidden max-w-[10rem] truncate text-left text-sm font-semibold sm:inline">
                      {userDisplayName}
                    </span>
                  </button>

                  {openUserMenu && (
                    <div
                      role="menu"
                      className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-xl border border-gray-200 bg-white py-3 shadow-2xl"
                    >
                      <div className="px-5 pb-3 text-base text-gray-700">
                        <p className="truncate font-semibold" title={userDisplayName}>
                          {userDisplayName}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500" title={user.email}>
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/perfil"
                        onClick={() => setOpenUserMenu(false)}
                        className="block px-5 py-2.5 text-base text-gray-700 transition hover:bg-gray-50"
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
                        className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-base text-red-600 transition hover:bg-red-50"
                        role="menuitem"
                      >
                        <LogOut className="h-5 w-5" aria-hidden />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : initializing ? (
                <div className="hidden h-10 w-24 animate-pulse rounded-full bg-gray-200 sm:inline-block" aria-hidden="true" />
              ) : (
                <Link
                  href={{ pathname: '/auth/login' }}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-400/80 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                >
                  Entrar
                </Link>
              )}

              <button
                type="button"
                onClick={() => setOpenMobile((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600 md:hidden"
                aria-label={openMobile ? 'Fechar menu' : 'Abrir menu'}
              >
                {openMobile ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
                Menu
              </button>
            </div>

            <div className="mt-2 w-full lg:hidden">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white/80 py-3 pl-11 pr-4 text-sm text-gray-700 shadow-inner outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Buscar no cardápio..."
                  aria-label="Buscar no cardápio (mobile)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-orange-100 bg-white/80 md:block">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <nav aria-label="Principal" className="flex items-center gap-6">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={{ pathname: item.href }}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative px-1 text-sm font-semibold transition ${
                    active ? 'text-orange-700' : 'text-gray-600 hover:text-orange-700'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-1 h-0.5 origin-center rounded-full bg-orange-500 transition-transform duration-200 ${
                      active ? 'scale-100' : 'scale-0 group-hover:scale-100'
                    }`}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">Retirada no balcão</span>
            <span>Pagamentos via app ou cartão estudante</span>
          </div>
        </div>
      </div>

      {openMobile && (
        <div className="border-t border-orange-100 bg-white/95 shadow-lg md:hidden">
          <nav aria-label="Principal (mobile)" className="container mx-auto max-w-7xl px-4 py-3">
            <ul className="flex flex-col gap-2">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={{ pathname: item.href }}
                      onClick={() => setOpenMobile(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-transparent text-gray-700 hover:border-orange-200 hover:bg-orange-50/60'
                      }`}
                    >
                      {item.label}
                      {active ? <span className="text-xs uppercase text-orange-500">Agora</span> : null}
                    </Link>
                  </li>
                );
              })}
              <li className="border-t border-orange-100 pt-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-base font-semibold text-white">
                        {userInitial}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{userDisplayName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/perfil"
                      onClick={() => setOpenMobile(false)}
                      className="block rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-700"
                    >
                      Meu perfil
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMobile(false);
                        signOut();
                      }}
                      className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <Link
                    href={{ pathname: '/auth/login' }}
                    onClick={() => setOpenMobile(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    Entrar
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
