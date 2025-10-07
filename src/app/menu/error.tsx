'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-2xl font-bold text-red-600">Algo deu errado!</h2>
      <p className="text-gray-600">{error.message || 'Erro ao carregar o menu.'}</p>
      <button
        onClick={reset}
        className="btn btn-primary"
      >
        Tentar novamente
      </button>
    </div>
  );
}
