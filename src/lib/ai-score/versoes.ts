/**
 * Versões do RESET AI Score. São três coisas diferentes e nenhuma muda sozinha:
 * - formato: como as respostas viram texto no link (`v=` no hash);
 * - método: a regra numérica da nota (pontos, pesos, faixas dos níveis). Mudou número, nasce um método novo;
 * - análise: os textos e as regras de leitura (leituras, alertas, recomendações, plano). Mudou texto ou regra, sobe a análise.
 * Um link ou um registro antigo continua sendo lido pelo método e pelo formato com que foi criado.
 */
export const FORMATO_ATUAL = "2";
export const METODO_ATUAL = "1";
export const ANALISE_ATUAL = "2";

/** Só notas do mesmo método podem ser comparadas entre si (ex.: a reavaliação de 90 dias). */
export const comparavel = (a: { metodo: string }, b: { metodo: string }) => a.metodo === b.metodo;
