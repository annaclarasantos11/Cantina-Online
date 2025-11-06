"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { api } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;

export function NovaSenhaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isFormValid = useMemo(() => {
    return password.length >= MIN_PASSWORD_LENGTH && password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!email) {
      setFeedback({ type: "error", message: "E-mail não informado. Volte e tente novamente." });
      return;
    }

    if (!isFormValid) {
      setFeedback({ type: "error", message: "As senhas devem coincidir e ter pelo menos 8 caracteres." });
      return;
    }

    setLoading(true);

    try {
      await api<unknown>("/auth/reset-password", {
        method: "POST",
        json: { email, password },
      });

      setFeedback({
        type: "success",
        message: "Senha atualizada com sucesso! Você será redirecionado para o login.",
      });

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    } catch (error) {
      console.error("reset-password error", error);
      const message = error instanceof Error ? error.message : "Erro ao atualizar senha.";
      setFeedback({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600">E-mail não encontrado. Retorne e informe novamente.</p>
        <Link
          className="inline-flex items-center justify-center rounded-full border border-orange-500 px-5 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          href="/auth/recuperar"
        >
          Voltar para recuperar acesso
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-orange-100/60 bg-orange-50/60 px-4 py-3 text-sm text-gray-700">
        Redefinindo senha para <span className="font-semibold text-orange-700">{email}</span>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-700">Nova senha</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 pl-12 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="Digite a nova senha"
            minLength={MIN_PASSWORD_LENGTH}
            required
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-700">Confirmar senha</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 pl-12 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="Confirme a nova senha"
            minLength={MIN_PASSWORD_LENGTH}
            required
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
      </label>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full rounded-full border border-orange-500 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow-[0_18px_28px_-18px_rgba(249,115,22,0.65)] outline-none transition hover:shadow-[0_22px_32px_-18px_rgba(234,88,12,0.7)] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-500"
      >
        {loading ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
