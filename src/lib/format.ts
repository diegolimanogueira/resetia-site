/** 7.1 → "7,1" (uma casa decimal, vírgula pt-BR). */
export function formatNota(valor: number) {
  return valor.toFixed(1).replace(".", ",");
}

/** 4200 → "4.200" (separador de milhar pt-BR, sem depender do locale do runtime). */
export function formatInteiro(valor: number) {
  return String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
