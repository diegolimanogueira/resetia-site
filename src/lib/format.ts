/** 7.1 → "7,1" (uma casa decimal, vírgula pt-BR). */
export function formatNota(valor: number) {
  return valor.toFixed(1).replace(".", ",");
}
