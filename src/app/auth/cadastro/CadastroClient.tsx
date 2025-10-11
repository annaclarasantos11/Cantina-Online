"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function CadastroClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(true);

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    pass?: string;
    confirm?: string;
    agree?: string;
  }>({});

  const alertRef = useRef<HTMLDivElement | null>(null);

  function validate() {
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = "Informe seu nome completo.";
    if (!validateEmail(email.trim())) e.email = "Informe um e-mail válido.";
  if (pass.trim().length < 8) e.pass = "A senha deve ter pelo menos 8 caracteres.";
    if (confirm !== pass) e.confirm = "As senhas não conferem.";
    if (!agree) e.agree = "Você precisa aceitar os termos para continuar.";
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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
  }

  useEffect(() => {
    setErrors({});
  }, [name, email, pass, confirm, agree]);

  return (
    <section className="min-h-[100svh] bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <header className="mb-4">
            <h1 className="text-2xl font-bold">Criar conta</h1>
            <p className="text-sm text-gray-600">Cadastre-se para fazer seus pedidos.</p>
          </header>

          <div
            ref={alertRef}
            tabIndex={-1}
            className="sr-only"
            aria-live="assertive"
            aria-atomic="true"
          >
            {Object.values(errors)
              .filter(Boolean)
              .join(". ")}
          </div>

          {done ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4" />
              <div>
                <strong className="font-semibold">Conta criada!</strong>{" "}
                Agora você já pode {" "}
                <Link href={{ pathname: "/auth/login" }} className="underline">
                  entrar
                </Link>
                .
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Nome completo
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-err" : undefined}
                  placeholder="Ex.: Maria Oliveira"
                />
                {errors.name && (
                  <p id="name-err" className="mt-1 text-xs text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

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
                    type={show1 ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500"
                    aria-invalid={!!errors.pass}
                    aria-describedby={errors.pass ? "pass-err" : undefined}
                    placeholder="Mínimo de 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShow1((s) => !s)}
                    className="absolute right-2 top-1.5 rounded-md p-2 text-gray-600 hover:bg-gray-100"
                    aria-label={show1 ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {show1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.pass && (
                  <p id="pass-err" className="mt-1 text-xs text-red-600">
                    {errors.pass}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium">
                  Confirmar senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirm"
                    type={show2 ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500"
                    aria-invalid={!!errors.confirm}
                    aria-describedby={errors.confirm ? "confirm-err" : undefined}
                    placeholder="Repita sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShow2((s) => !s)}
                    className="absolute right-2 top-1.5 rounded-md p-2 text-gray-600 hover:bg-gray-100"
                    aria-label={show2 ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm && (
                  <p id="confirm-err" className="mt-1 text-xs text-red-600">
                    {errors.confirm}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span>
                  Concordo com os {" "}
                  <Link href={{ pathname: "/sobre" }} className="text-orange-700 underline">
                    termos de uso
                  </Link>
                  .
                </span>
              </label>
              {errors.agree && <p className="text-xs text-red-600">{errors.agree}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Criar conta
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            Já tem conta?{" "}
            <Link href={{ pathname: "/auth/login" }} className="text-orange-700 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
