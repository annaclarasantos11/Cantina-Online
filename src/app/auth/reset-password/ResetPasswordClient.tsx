"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

interface ResetPasswordClientProps {
  token: string;
}

export function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const router = useRouter();
  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isValidPassword = useMemo(() => {
    return password.length >= 8 && password.length <= 128 && password === confirmPassword;
  }, [password, confirmPassword]);

  const passwordsMatch = useMemo(() => {
    return !confirmPassword || password === confirmPassword;
  }, [password, confirmPassword]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!isValidPassword) {
      setFeedback({ type: "error", message: "As senhas não correspondem ou são inválidas." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.message ?? "Não foi possível atualizar a senha.";
        return setFeedback({ type: "error", message });
      }

      setFeedback({
        type: "success",
        message: "Senha atualizada com sucesso! Redirecionando para login...",
      });

      // Redireciona para login após 2 segundos
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password erro", error);
      setFeedback({ type: "error", message: "Ocorreu um erro inesperado." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-700">Nova senha</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 pl-12 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="Mínimo 8 caracteres"
            required
            disabled={loading}
          />
        </div>
        <span className="text-xs text-gray-500">Mínimo 8 caracteres, máximo 128</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-700">Confirmar senha</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={`w-full rounded-2xl border bg-white px-4 pl-12 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 ${
              !passwordsMatch
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            }`}
            placeholder="Digite a senha novamente"
            required
            disabled={loading}
          />
        </div>
        {confirmPassword && !passwordsMatch && (
          <span className="text-xs text-red-600">As senhas não correspondem</span>
        )}
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
        disabled={loading || !isValidPassword}
        className="w-full rounded-full border border-orange-500 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow-[0_18px_28px_-18px_rgba(249,115,22,0.65)] outline-none transition hover:shadow-[0_22px_32px_-18px_rgba(234,88,12,0.7)] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-500"
      >
        {loading ? "Atualizando..." : "Atualizar senha"}
      </button>
    </form>
  );
}
