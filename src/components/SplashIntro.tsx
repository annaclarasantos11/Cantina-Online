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
    <section className="relative min-h-[100svh] overflow-hidden bg-landing">
      {/* Elementos flutuantes - visíveis apenas em telas médias+ */}
      <img
        src="/images/products/croissant-chocolate.png"
        alt=""
        className="hidden md:block absolute top-20 right-[10%] w-32 lg:w-40 animate-float pointer-events-none opacity-90"
        style={{ animationDelay: "0s" }}
        aria-hidden="true"
      />
      <img
        src="/images/products/folheado-pizza.png"
        alt=""
        className="hidden md:block absolute bottom-32 left-[8%] w-28 lg:w-36 animate-float pointer-events-none opacity-85"
        style={{ animationDelay: "2s" }}
        aria-hidden="true"
      />
      <img
        src="/images/products/h2o.png"
        alt=""
        className="hidden lg:block absolute top-1/2 left-[15%] w-20 animate-float pointer-events-none opacity-80"
        style={{ animationDelay: "1s" }}
        aria-hidden="true"
      />

      {/* Header inline (não usa o Header.tsx para manter isolado) */}
      <header className="container pt-10 flex items-center justify-between relative z-10">
        <Link href="/" className="font-bold text-xl">
          <span className="text-gray-900">Cantina</span>
          <span className="text-orange-600">Online</span>
        </Link>
        <Link href="/menu" className="btn btn-outline">
          Ver Menu
        </Link>
      </header>

      {/* Hero Section */}
      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[calc(100svh-200px)] text-center py-16">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Cantina sem fila,{" "}
            <span className="text-orange-600">do seu jeito</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Faça seu pedido online, retire no horário escolhido e economize tempo. 
            Sem filas, sem estresse.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => router.push('/menu')} 
              className="btn btn-primary px-6 py-3 text-lg w-full sm:w-auto"
            >
              Entrar no cardápio
            </button>
            <Link 
              href="/sobre" 
              className="btn btn-outline px-6 py-3 text-lg w-full sm:w-auto"
            >
              Regras & horários
            </Link>
          </div>

          {/* Botão "Não redirecionar" */}
          {auto && (
            <button
              onClick={() => setAuto(false)}
              className="btn btn-outline text-sm mt-4"
            >
              Não redirecionar
            </button>
          )}
        </div>

        {/* Features cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full">
          {[
            { title: "Sem filas", desc: "Peça online e retire pronto" },
            { title: "Escolha o horário", desc: "Agende quando for retirar" },
            { title: "Pague no local", desc: "Confirme na cantina" },
          ].map((item) => (
            <div 
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer inline */}
      <footer className="relative z-10 border-t border-gray-200/50 py-6 text-center text-sm text-gray-600">
        Cantina Online · {new Date().getFullYear()}
      </footer>
    </section>
  );
}
