import PrintButton from "@/components/PrintButton";
import { CreditCard, Info, ListChecks, Ticket } from "lucide-react";

export const metadata = {
  title: "Regras de Funcionamento — Cantina Online",
  description: "Como a cantina organiza pedidos, pagamentos e retirada.",
};

export default function SobrePage() {
  const atualizado = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Regras de Funcionamento</h1>
            <p className="mt-1 text-gray-600">
              Entenda como funcionam os pedidos, pagamentos e a retirada.
            </p>
            <p className="mt-1 text-xs text-gray-500">Atualizado em {atualizado}</p>
          </div>

          <div className="flex items-center gap-2">
            <a href="/horarios" className="btn btn-outline">
              Ver horários
            </a>
            <PrintButton />
          </div>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <ListChecks className="h-5 w-5 text-orange-600" />
                Pedidos
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-gray-800 marker:text-orange-600">
                <li>Os pedidos são feitos pelo site e confirmados na área “Meus pedidos”.</li>
                <li>Ao finalizar, seu pedido gerará um ticket com um código único para a retirada.</li>
                <li>Cada pedido deve ser associado a um intervalo/horário de retirada disponível.</li>
                <li>
                  Pedidos feitos fora do horário de funcionamento serão agendados para o próximo dia útil
                  ou até o próximo período disponível.
                </li>
                <li>Itens sujeitos à disponibilidade de estoque no dia.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <CreditCard className="h-5 w-5 text-orange-600" />
                Pagamentos
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-gray-800 marker:text-orange-600">
                <li>Pagamento efetuado no momento da retirada.</li>
                <li>
                  Formas aceitas: dinheiro, <span className="font-semibold">PPA</span> e cartão
                  (débito/crédito).
                </li>
              </ul>
            </section>

            <section className="md:col-span-2">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Ticket className="h-5 w-5 text-orange-600" />
                Retirada
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-gray-800 marker:text-orange-600">
                <li>
                  Após confirmar seu pedido no site, dirija-se a um totem de impressão para retirar seu
                  ticket.
                </li>
                <li>No horário agendado, vá até o balcão da cantina com o seu ticket em mãos.</li>
                <li>
                  Para validar e liberar o pedido, você deverá digitar seu RA (Registro de Aluno) no terminal
                  de confirmação.
                </li>
                <li>Pedidos ficam disponíveis por até 15 minutos após o horário escolhido.</li>
                <li>Pedidos não retirados dentro do prazo serão colocados para venda novamente.</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5" />
              <p className="text-sm">
                Os horários podem variar em dias de eventos. Acompanhe os comunicados oficiais da escola.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <details className="rounded-lg border border-gray-200 p-4 open:shadow-sm">
              <summary className="cursor-pointer select-none text-sm font-semibold">Perdeu o ticket?</summary>
              <p className="mt-2 text-sm text-gray-700">
                Volte ao totem, selecione a opção de <strong>reimpressão</strong> e informe seu <strong>RA</strong>
                para gerar uma segunda via.
              </p>
            </details>
            <details className="rounded-lg border border-gray-200 p-4 open:shadow-sm">
              <summary className="cursor-pointer select-none text-sm font-semibold">
                Meu pedido não aparece no sistema. E agora?
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                Procure o balcão com um documento. Vamos checar pelo RA e pelo horário associado ao ticket.
              </p>
            </details>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/menu" className="btn btn-primary">
              Ir para o cardápio
            </a>
            <a href="/" className="btn btn-outline">
              Voltar ao início
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
