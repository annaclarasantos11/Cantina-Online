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
    <section className="min-h-[100svh] bg-gradient-to-br from-white via-orange-50/40 to-orange-100/30">
      <div className="container flex items-center justify-center py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,420px)]">
          <div className="space-y-6 text-gray-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
              Cadastro rápido
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Crie sua conta e adiante seus intervalos</h1>
            <p className="text-base">
              Com o cadastro você salva preferências, gera tickets em segundos e garante que o lanche esteja pronto na hora certa.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Histórico organizado</p>
                <p className="mt-1 text-xs text-gray-600">Visualize compras anteriores e repita pedidos facilmente.</p>
              </li>
              <li className="rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Retirada otimizada</p>
                <p className="mt-1 text-xs text-gray-600">Mostre o ticket no balcão e finalize o pagamento.</p>
              </li>
            </ul>
          </div>

          <div className="w-full">
            <div className="rounded-3xl border border-gray-200 bg-white/95 p-8 shadow-xl shadow-orange-100/50 backdrop-blur">
              <header className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Criar conta</h2>
                <p className="mt-1 text-sm text-gray-600">Preencha os dados para começar a fazer pedidos.</p>
              </header>

              <div
                ref={alertRef}
                tabIndex={-1}
                className="sr-only"
                aria-live="assertive"
                aria-atomic="true"
              >
                {Object.values(errors).filter(Boolean).join(". ")}
              </div>

              {done ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-800">
                      Nome completo
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-err" : undefined}
                      placeholder="Ex.: Maria Oliveira"
                    />
                    {errors.name ? (
                      <p id="name-err" className="mt-1 text-xs text-red-600">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

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
                        type={show1 ? "text" : "password"}
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 pr-12 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        aria-invalid={!!errors.pass}
                        aria-describedby={errors.pass ? "pass-err" : undefined}
                        placeholder="Mínimo de 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShow1((s) => !s)}
                        className="absolute right-2 top-1.5 inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
                        aria-label={show1 ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {show1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.pass ? (
                      <p id="pass-err" className="mt-1 text-xs text-red-600">
                        {errors.pass}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-800">
                      Confirmar senha
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="confirm"
                        type={show2 ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 pr-12 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        aria-invalid={!!errors.confirm}
                        aria-describedby={errors.confirm ? "confirm-err" : undefined}
                        placeholder="Repita sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShow2((s) => !s)}
                        className="absolute right-2 top-1.5 inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
                        aria-label={show2 ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirm ? (
                      <p id="confirm-err" className="mt-1 text-xs text-red-600">
                        {errors.confirm}
                      </p>
                    ) : null}
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 text-sm text-gray-700">
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
                  {errors.agree ? <p className="text-xs text-red-600">{errors.agree}</p> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full justify-center"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Criar conta
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-gray-600">
                Já tem conta?{" "}
                <Link href={{ pathname: "/auth/login" }} className="font-semibold text-orange-700 hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
