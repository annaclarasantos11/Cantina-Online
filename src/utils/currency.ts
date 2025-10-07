export const formatBRL = (n: number | string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    typeof n === 'string' ? Number(n) : n
  );
