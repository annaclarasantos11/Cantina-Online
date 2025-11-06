"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { api } from "@/lib/api";

export function RecuperarClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isValidEmail = useMemo(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.trim().length > 0 && regex.test(email.trim());
  }, [email]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!isValidEmail) {
      setFeedback({ type: "error", message: "Por favor, digite um e-mail válido." });
      return;
    }

    setLoading(true);
    try {
      await api<unknown>("/auth/forgot-password", {
        method: "POST",
        json: { email: email.trim().toLowerCase() },
      });

      setFeedback({
        type: "success",
        message: `Link de recuperação enviado! Verifique seu e-mail (${email}).`,
      });
      setEmail("");

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      console.error("Recuperar erro", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setFeedback({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-700">E-mail</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 pl-12 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="seu@email.com"
            required
            disabled={loading}
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
        disabled={loading || !isValidEmail}
        className="w-full rounded-full border border-orange-500 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow-[0_18px_28px_-18px_rgba(249,115,22,0.65)] outline-none transition hover:shadow-[0_22px_32px_-18px_rgba(234,88,12,0.7)] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-500"
      >
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </button>
    </form>
  );
}
