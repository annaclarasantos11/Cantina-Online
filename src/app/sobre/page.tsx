export default function SobrePage() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Regras de Funcionamento</h1>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
        {/* Pedidos */}
        <div>
          <h2 className="text-xl font-semibold">Pedidos</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-800">
            <li>Os pedidos são feitos pelo site e confirmados na área “Meus pedidos”.</li>
            <li>Ao finalizar, seu pedido gerará um ticket com um código único para a retirada.</li>
            <li>Cada pedido deve ser associado a um intervalo/horário de retirada disponível.</li>
            <li>Pedidos feitos fora do horário de funcionamento serão agendados para o próximo dia útil ou até o próximo período disponível.</li>
            <li>Itens sujeitos à disponibilidade de estoque no dia.</li>
          </ul>
        </div>

        {/* Pagamentos */}
        <div>
          <h2 className="text-xl font-semibold">Pagamentos</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-800">
            <li>Pagamento efetuado no momento da retirada.</li>
            <li>Formas aceitas: dinheiro, <strong>PPA</strong> e cartão (débito/crédito).</li>
          </ul>
        </div>

        {/* Retirada */}
        <div>
          <h2 className="text-xl font-semibold">Retirada</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-800">
            <li>Após confirmar seu pedido no site, dirija-se a um totem de impressão para retirar seu ticket.</li>
            <li>No horário agendado, vá até o balcão da cantina com o seu ticket em mãos.</li>
            <li>Para validar e liberar o pedido, você deverá digitar seu RA (Registro de Aluno) no terminal de confirmação.</li>
            <li>Pedidos ficam disponíveis por até 15 minutos após o horário escolhido.</li>
            <li>Pedidos não retirados dentro do prazo serão colocados para venda novamente.</li>
          </ul>
        </div>

        {/* Problemas com o Ticket */}
        <div>
          <h2 className="text-xl font-semibold">Problemas com o Ticket?</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-800">
            <li><strong>Perdeu o ticket?</strong> Volte ao totem, selecione a opção de reimpressão e informe seu RA para gerar uma segunda via.</li>
            <li><strong>Lembra o código do pedido?</strong> Você pode digitar o código do pedido e o seu RA diretamente no terminal de validação, sem precisar do ticket físico.</li>
          </ul>
        </div>

        {/* Alterações e Cancelamentos */}
        <div>
          <h2 className="text-xl font-semibold">Alterações e Cancelamentos</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-800">
            <li>Alterações são possíveis enquanto o pedido não entrar em preparo, com limite de até 30 minutos antes do horário de retirada.</li>
            <li>Cancelamentos após o início do preparo podem não gerar reembolso.</li>
          </ul>
        </div>

        {/* Condutas e Avisos */}
        <div>
          <h2 className="text-xl font-semibold">Condutas e Avisos</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-800">
            <li>Mantenha a fila organizada e respeite o atendimento prioritário.</li>
            <li><strong>Alérgenos:</strong> Alguns itens podem conter traços de glúten, leite e oleaginosas.</li>
            <li>Em dias de eventos, os horários podem sofrer ajustes.</li>
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h2 className="text-xl font-semibold">Contato</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-800">
            <li>Para dúvidas ou suporte, procure a cantina ou a coordenação.</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600">
          Estas regras podem ser atualizadas a qualquer momento.
        </p>
      </div>
    </section>
  );
}
