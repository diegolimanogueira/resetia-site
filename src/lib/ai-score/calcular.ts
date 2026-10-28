import { dimensoes, niveis, perguntasCentrais } from "@/content/ai-score-questionario";
import type { DimensaoId, NivelId } from "@/content/types";
import { regras } from "./regras";
import type { Faixa, Respostas, Resultado, Slot } from "./tipos";

/**
 * Cálculo determinístico do RESET AI Score. Nada aqui usa IA: as mesmas respostas dão sempre a mesma nota.
 * - Nota da dimensão = média das respostas válidas (0 a 4) / 4 × 100. "Não sei responder" fica fora da média.
 * - AI Score = média das seis dimensões, arredondada para inteiro.
 * - Índice da área = média das quatro respostas da área × 25. Não entra no AI Score.
 */

const valida = (r: Slot): r is 0 | 1 | 2 | 3 | 4 => typeof r === "number";
const mediaDe = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Média das respostas válidas convertida para 0 a 100; `null` sem nenhuma resposta válida. */
export function notaDe(respostas: readonly Slot[]): number | null {
  const v = respostas.filter(valida);
  return v.length ? (mediaDe(v) / 4) * 100 : null;
}

export function nivelDe(indice: number): NivelId {
  return (niveis.find((n) => indice >= n.min && indice <= n.max) ?? niveis[niveis.length - 1]).id;
}

/** Posição do nível (1 a 5), para "Nível 3 de 5". */
export const numeroDoNivel = (id: NivelId) => niveis.findIndex((n) => n.id === id) + 1;

export function faixaDe(nota: number): Faixa {
  if (nota >= regras.faixas.altaDesde) return "alta";
  return nota >= regras.faixas.mediaDesde ? "media" : "baixa";
}

export function calcular(r: Pick<Respostas, "centrais" | "areas" | "porArea">): Resultado {
  const porDimensao = Object.fromEntries(
    dimensoes.map((d) => [
      d.id,
      notaDe(perguntasCentrais.map((p, i) => (p.dimensao === d.id ? r.centrais[i] : undefined))),
    ]),
  ) as Record<DimensaoId, number | null>;

  const notas = Object.values(porDimensao).filter((n): n is number => n !== null);
  const respondidas = r.centrais.filter(valida).length;
  const parcial = respondidas < regras.minimoRespondidas || notas.length < dimensoes.length;
  const media = notas.length ? Math.round(mediaDe(notas)) : null;
  const indice = parcial ? null : media;

  return {
    dimensoes: porDimensao,
    respondidas,
    parcial,
    media,
    indice,
    nivel: indice === null ? null : nivelDe(indice),
    areas: Object.fromEntries(r.areas.map((a) => [a, notaDe(r.porArea[a] ?? [])])),
  };
}

/** Nota para exibir: inteiro ou uma casa decimal, no formato brasileiro (37,5). */
export const formatarNota = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
