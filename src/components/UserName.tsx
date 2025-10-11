"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function UserName() {
  const { user, initializing, signOut } = useAuth();

  if (initializing) return null;

  // Se não estiver logado, mantém o botão "Entrar"
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
      >
        Entrar
      </Link>
    );
  }

  const first = (user.name || user.email).trim().split(" ")[0];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-800">
        Olá, <b>{first}</b>
      </span>
      <button
        onClick={signOut}
        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
        title="Sair"
      >
        Sair
      </button>
    </div>
  );
}
