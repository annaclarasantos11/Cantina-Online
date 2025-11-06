"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { NovaSenhaClient } from "./NovaSenhaClient";

export default function NovaSenhaPage() {
  const router = useRouter();

  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="container flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar
          </button>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Definir nova senha</h1>
            <p className="text-sm text-gray-600">Crie uma nova senha para acessar sua conta.</p>
          </div>

          <div className="mt-8 rounded-3xl border border-orange-100/60 bg-white/95 p-8 shadow-xl shadow-orange-100/40">
            <NovaSenhaClient />
          </div>
        </div>
      </div>
    </section>
  );
}
