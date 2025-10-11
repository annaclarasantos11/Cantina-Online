"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function LoginClient() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);

  function validate() {
    const e: typeof errors = {};
    if (!validateEmail(email.trim())) e.email = "Informe um e-mail válido.";
    if (pass.trim().length < 8) e.pass = "A senha deve ter pelo menos 8 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      alertRef.current?.focus();
      return;
    }
    setLoading(true);
    setFormError(null);
    const result = await signIn({ email: email.trim(), password: pass });
    setLoading(false);
    if (!result.ok) {
      setFormError(result.message ?? "Falha ao entrar.");
      alertRef.current?.focus();
      return;
    }

    setEmail("");
    setPass("");
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    setErrors({});
    setFormError(null);
  }, [email, pass]);

  return (
    <section className="min-h-[100svh] bg-gradient-to-br from-white via-orange-50/40 to-orange-100/30">
      <div className="container flex items-center justify-center py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,420px)]">
          <div className="space-y-6 text-gray-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
              Acesso seguro
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Entre para gerenciar seus pedidos</h1>
            <p className="text-base">
              Faça login para acompanhar o status dos seus tickets, revisar compras anteriores e agilizar a retirada na cantina.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Tickets salvos</p>
                <p className="mt-1 text-xs text-gray-600">Baixe e reimprima sempre que precisar.</p>
              </li>
              <li className="rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Retirada sem filas</p>
                <p className="mt-1 text-xs text-gray-600">Mostre o código impresso e retire na hora.</p>
              </li>
            </ul>
          </div>

          <div className="w-full">
            <div className="rounded-3xl border border-gray-200 bg-white/95 p-8 shadow-xl shadow-orange-100/50 backdrop-blur">
              <header className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Entrar</h2>
                <p className="mt-1 text-sm text-gray-600">Informe suas credenciais para continuar.</p>
              </header>

              <div
                ref={alertRef}
                tabIndex={-1}
                className="sr-only"
                aria-live="assertive"
                aria-atomic="true"
              >
                {[formError, ...Object.values(errors)].filter(Boolean).join(". ")}
              </div>

              {formError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-err" : undefined}
                    placeholder="voce@exemplo.com"
                  />
                  {errors.email ? (
                    <p id="email-err" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="pass" className="block text-sm font-medium text-gray-800">
                    Senha
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="pass"
                      type={show ? "text" : "password"}
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 pr-12 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      aria-invalid={!!errors.pass}
                      aria-describedby={errors.pass ? "pass-err" : undefined}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-2 top-1.5 inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
                      aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.pass ? (
                    <p id="pass-err" className="mt-1 text-xs text-red-600">
                      {errors.pass}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href={{ pathname: "/auth/recuperar" }}
                    className="text-sm font-semibold text-orange-700 hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full justify-center"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Entrar
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Não tem conta?{" "}
                <Link href={{ pathname: "/auth/cadastro" }} className="font-semibold text-orange-700 hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
