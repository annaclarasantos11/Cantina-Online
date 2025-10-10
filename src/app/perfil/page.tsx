"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function PerfilPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();

  // Se não logado, manda para login quando terminar de inicializar
  useEffect(() => {
    if (!initializing && !user) router.replace("/auth/login");
  }, [initializing, user, router]);

  if (initializing) {
    return (
      <section className="px-6 py-12">
        <h1 className="text-xl font-semibold">Carregando...</h1>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold">Meu perfil</h1>
      <p className="text-gray-700">
        Nome: <b>{user.name}</b>
      </p>
      <p className="text-gray-700">
        E-mail: <b>{user.email}</b>
      </p>
    </section>
  );
}
