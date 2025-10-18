"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Ticket, UserCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OrdersHistory } from "./components/OrdersHistory";

export default function PerfilPage() {
  const router = useRouter();
  const { user, initializing, signOut } = useAuth();

  // Se não logado, manda para login quando terminar de inicializar
  useEffect(() => {
    if (!initializing && !user) router.replace("/auth/login");
  }, [initializing, user, router]);

  if (initializing) {
    return (
      <section className="bg-gradient-to-b from-white via-orange-50/30 to-white">
        <div className="container py-16">
          <div className="rounded-3xl border border-gray-100 bg-white/80 px-6 py-16 text-center text-sm text-gray-600 shadow-sm">
            Carregando suas informações...
          </div>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="bg-gradient-to-b from-white via-orange-50/35 to-white">
      <div className="container py-16">
        <div className="max-w-3xl rounded-3xl border border-orange-100 bg-white/95 p-8 shadow-xl shadow-orange-100/50">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <UserCircle2 className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Perfil</p>
                <h1 className="text-2xl font-semibold text-gray-900">Olá, {user.name.split(" ")[0]}</h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sair
            </button>
          </header>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase text-gray-500">Nome completo</dt>
              <dd className="mt-2 text-base font-medium text-gray-900">{user.name}</dd>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase text-gray-500">E-mail</dt>
              <dd className="mt-2 break-words text-base font-medium text-gray-900">{user.email}</dd>
            </div>
          </dl>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link href="/pedidos" className="inline-flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-sm font-semibold text-orange-700 shadow-sm transition hover:translate-y-[-2px] hover:shadow-md">
              Ver meus pedidos
              <Ticket className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/menu" className="inline-flex items-center justify-between rounded-2xl border border-gray-200 bg-white/90 p-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:translate-y-[-2px] hover:shadow-md">
              Voltar ao cardápio
            </Link>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Histórico de pedidos</h2>
                <p className="text-sm text-gray-600">Acompanhe seus pedidos anteriores e confira os itens de cada um.</p>
              </div>
            </header>

            <div className="mt-6">
              <OrdersHistory userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
