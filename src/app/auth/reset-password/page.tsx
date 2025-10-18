"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordClient } from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
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

            <div className="rounded-3xl border border-red-100/60 bg-white/95 p-8 shadow-xl shadow-orange-100/40">
              <p className="text-center text-base text-red-700">
                Link de recuperação inválido ou expirado. 
                <br />
                <Link href="/auth/recuperar" className="font-semibold underline">
                  Solicitar novo link
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Redefinir senha</h1>
            <p className="text-sm text-gray-600">
              Crie uma nova senha para sua conta.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-orange-100/60 bg-white/95 p-8 shadow-xl shadow-orange-100/40">
            <ResetPasswordClient token={token} />
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
