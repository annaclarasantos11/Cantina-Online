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
    <section className="min-h-[100svh] bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <header className="mb-4">
            <h1 className="text-2xl font-bold">Entrar</h1>
            <p className="text-sm text-gray-600">Acesse sua conta para continuar.</p>
          </header>

          <div
            ref={alertRef}
            tabIndex={-1}
            className="sr-only"
            aria-live="assertive"
            aria-atomic="true"
          >
            {[formError, ...Object.values(errors)]
              .filter(Boolean)
              .join(". ")}
          </div>

          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-err" : undefined}
                placeholder="voce@exemplo.com"
              />
              {errors.email && (
                <p id="email-err" className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pass" className="block text-sm font-medium">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="pass"
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500"
                  aria-invalid={!!errors.pass}
                  aria-describedby={errors.pass ? "pass-err" : undefined}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1.5 rounded-md p-2 text-gray-600 hover:bg-gray-100"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.pass && (
                <p id="pass-err" className="mt-1 text-xs text-red-600">
                  {errors.pass}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                href={{ pathname: "/auth/recuperar" }}
                className="text-sm text-orange-700 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Entrar
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Não tem conta?{" "}
            <Link
              href={{ pathname: "/auth/cadastro" }}
              className="text-orange-700 hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
