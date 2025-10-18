"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    return normalizedName !== user.name || normalizedEmail.toLowerCase() !== user.email.toLowerCase();
  }, [email, name, user]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!user) return;
    if (!hasChanges) {
      setFeedback({ type: "error", message: "Nenhuma alteração para salvar." });
      return;
    }

    const payload: { name?: string; email?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName && trimmedName !== user.name) payload.name = trimmedName;
    if (trimmedEmail && trimmedEmail.toLowerCase() !== user.email.toLowerCase()) payload.email = trimmedEmail;

    setLoading(true);
    try {
      const result = await updateProfile(payload);
      if (result.ok) {
        setFeedback({ type: "success", message: "Perfil atualizado com sucesso." });
      } else {
        setFeedback({ type: "error", message: result.message ?? "Não foi possível atualizar o perfil." });
      }
    } catch (error) {
      console.error("updateProfile error", error);
      setFeedback({ type: "error", message: "Ocorreu um erro inesperado." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dados pessoais</h2>
          <p className="text-sm text-gray-600">Atualize seu nome e e-mail quando precisar.</p>
        </div>
        <button
          type="submit"
          disabled={loading || !hasChanges}
          className="inline-flex items-center justify-center rounded-full border border-orange-500 bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-500"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Nome completo
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="Seu nome"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            placeholder="seu@email.com"
            required
          />
        </label>
      </div>

      {feedback && (
        <p
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
