import NowBadge from "@/components/NowBadge";
import { MapPin, Info, School } from "lucide-react";

type Slot = { titulo: string; faixa: string; detalhe?: string };

const slots: Slot[] = [
  { titulo: "Ensino Médio", faixa: "10:15 – 10:45" },
  { titulo: "Ensino Médio (Tarde)", faixa: "15:15 – 15:35" },
  { titulo: "Ensino Fundamental (Manhã)", faixa: "09:30 – 10:00" },
  { titulo: "Ensino Fundamental (Tarde)", faixa: "15:15 – 15:45" },
];

export const metadata = {
  title: "Horários — Cantina Online",
  description: "Horários de atendimento e intervalos por segmento.",
};

export default function HorariosPage() {
  const half = Math.ceil(slots.length / 2);

  return (
    <section className="bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Horários de Atendimento</h1>
              <p className="mt-1 text-gray-600">
                Segunda a sexta • <strong>07:30 – 18:00</strong>
              </p>
            </div>
            <NowBadge />
          </div>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-orange-600" />
              Cantina do pátio principal
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              <School className="h-4 w-4 text-orange-600" />
              Intervalos por segmento
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900">Intervalos</h2>
            </div>

            <ol className="relative border-l border-gray-200 pl-8">
              {slots.slice(0, half).map((s) => (
                <li key={s.titulo} className="relative mb-6 last:mb-0">
                  <span className="absolute -left-[9px] top-2 h-2.5 w-2.5 rounded-full bg-orange-600 ring-4 ring-orange-100" />
                  <div className="ml-2 flex items-start justify-between">
                    <div>
                      <p className="font-medium">{s.titulo}</p>
                      {s.detalhe ? <p className="text-sm text-gray-600">{s.detalhe}</p> : null}
                    </div>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                      {s.faixa}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <ol className="relative border-l border-gray-200 pl-8">
              {slots.slice(half).map((s) => (
                <li key={s.titulo} className="relative mb-6 last:mb-0">
                  <span className="absolute -left-[9px] top-2 h-2.5 w-2.5 rounded-full bg-orange-600 ring-4 ring-orange-100" />
                  <div className="ml-2 flex items-start justify-between">
                    <div>
                      <p className="font-medium">{s.titulo}</p>
                      {s.detalhe ? <p className="text-sm text-gray-600">{s.detalhe}</p> : null}
                    </div>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                      {s.faixa}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5" />
              <p className="text-sm">
                Os horários podem variar em dias de eventos. Fique atento aos comunicados da escola.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/menu" className="btn btn-primary">
              Ver cardápio
            </a>
            <a href="/sobre" className="btn btn-outline">
              Regras de funcionamento
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
