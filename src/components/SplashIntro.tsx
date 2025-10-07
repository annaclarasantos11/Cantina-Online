"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SplashIntro() {
  const router = useRouter();
  const [auto, setAuto] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) return;
    timerRef.current = window.setTimeout(() => router.push("/menu"), 4500) as unknown as number;
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [auto, router]);

  return (
    <section className="relative min-h-[84vh] overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
      <div className="absolute -top-24 -right-24 w-[40rem] h-[40rem] rounded-full bg-brand-100 blur-3xl opacity-50" />

      <header className="container pt-10 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          <span className="text-gray-900">Cantina</span>
          <span className="text-brand-700">Online</span>
        </Link>
        <Link href="/menu" className="btn btn-outline">
          Ver Menu
        </Link>
      </header>

      <div className="container grid lg:grid-cols-2 gap-10 items-center py-16">
        <div className="fade-in">
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            Cantina sem fila, <span className="text-brand-700">do seu jeito.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl">
            Faça o pedido no site, escolha o horário e retire sem estresse. Rápido para quem compra, organizado para quem vende.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => router.push('/menu')} className="btn btn-primary px-5 py-3">
              Ver Menu
            </button>
            <a href="#como-funciona" className="btn btn-outline px-5 py-3">
              Como funciona
            </a>
            <label className="ml-2 inline-flex items-center gap-2 text-sm text-gray-500 select-none">
              <input
                type="checkbox"
                checked={!auto}
                onChange={(e) => setAuto(!e.target.checked)}
                className="rounded border-gray-300"
                aria-label="Desativar redirecionamento automático"
              />
              Não redirecionar automaticamente
            </label>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              "Pagamento na retirada",
              "Horário agendado",
              "Pedidos organizados",
              "Menos tempo na fila",
            ].map((t) => (
              <div key={t} className="rounded-2xl border bg-white/70 backdrop-blur px-4 py-3 text-sm shadow-card">
                • {t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative fade-in">
          <div className="aspect-[4/3] w-full rounded-2xl border bg-white shadow-card overflow-hidden">
            <div className="h-full w-full grid place-content-center text-center p-10">
              <div className="text-2xl font-semibold">Preview do Menu</div>
              <p className="text-gray-500 mt-2">Alguns itens da vitrine aparecem aqui.</p>
              <div className="mt-6 grid grid-cols-3 gap-3 opacity-90">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -z-10 -bottom-8 -left-8 w-56 h-56 rounded-full bg-brand-200 blur-2xl opacity-40" />
        </div>
      </div>

      <div id="como-funciona" className="container pb-20">
        <h2 className="text-2xl font-bold mb-6">Como funciona</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { t: "Escolha no menu", d: "Veja lanches e bebidas com preço e foto." },
            { t: "Agende a retirada", d: "Selecione o intervalo/horário disponível." },
            { t: "Pague no balcão", d: "Leve o ticket e confirme seu pedido." },
          ].map((s) => (
            <div key={s.t} className="card">
              <div className="text-lg font-semibold">{s.t}</div>
              <p className="text-gray-600 mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t py-8 text-center text-sm text-gray-600">
        Cantina Online · {new Date().getFullYear()}
      </footer>
    </section>
  );
}
