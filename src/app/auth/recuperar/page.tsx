"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RecuperarClient } from "./RecuperarClient";

export default function RecuperarPage() {
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recuperar acesso</h1>
            <p className="text-sm text-gray-600">
              Digite seu e-mail para receber um link de recuperação de senha.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-orange-100/60 bg-white/95 p-8 shadow-xl shadow-orange-100/40">
            <RecuperarClient />
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Lembrou sua senha?{" "}
            <Link href="/auth/login" className="font-semibold text-orange-700 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
