export default function HorariosPage() {
  return (
    <section className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Horários de Atendimento</h1>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <ul className="space-y-2">
          <li><strong>De segunda a sexta-feira:</strong> 7h30 às 18h</li>
          <li><strong>Ensino Médio:</strong> 10:15 às 10:45</li>
          <li><strong>Ensino Médio(Tarde):</strong> 15:15 às 15:35</li>
          <li><strong>Ensino Fundamental(Manhã):</strong> 09:30 às 10h</li>
          <li><strong>Ensino Fundamental(Tarde):</strong> 15:15 às 15:45</li>
          <li><strong>Local:</strong> Cantina do pátio principal</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">Os horários podem variar em dias de eventos.</p>
      </div>
    </section>
  );
}
