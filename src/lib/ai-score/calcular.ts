import { niveis } from "@/content/ai-score-questionario";
import type { DimensaoId, NivelId } from "@/content/types";
import { metodoAtual, type Metodo } from "./metodo";
import { regras } from "./regras";
import type { Faixa, Respostas, Resultado, Slot } from "./tipos";

/**
 * Cálculo determinístico do RESET AI Score. Nada aqui usa IA: as mesmas respostas dão sempre a mesma nota.
 * Os números (pontos, peso da menor dimensão, mínimo de respostas, faixas dos níveis) vêm do MÉTODO, que é
 * versionado e congelado (`metodo/`): todas as funções recebem o método e, sem ele, usam o atual.
 * - Cada alternativa vale pontos progressivos (método 1: 0, 15, 40, 70, 100).
 * - Nota da dimensão = média dos pontos das respostas válidas. "Não sei responder" fica fora da média.
 * - AI Score = média das seis dimensões, com a mais fraca contando em dobro (método 1), inteiro.
 * - Índice da área = média dos pontos das quatro respostas da área. Não entra no AI Score.
 */

const valida = (r: Slot): r is 0 | 1 | 2 | 3 | 4 => typeof r === "number";
const mediaDe = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Dimensões de um método, na ordem em que aparecem nas perguntas. */
export const dimensoesDo = (metodo: Metodo = metodoAtual): DimensaoId[] => [...new Set(metodo.dimensaoDaPergunta)];

/** Média dos pontos das respostas válidas (0 a 100); `null` sem nenhuma resposta válida. */
export function notaDe(respostas: readonly Slot[], metodo: Metodo = metodoAtual): number | null {
  const v = respostas.filter(valida);
  return v.length ? mediaDe(v.map((r) => metodo.pontos[r])) : null;
}

/** AI Score a partir das notas das dimensões: média com a menor nota pesando `pesoMenorDimensao` vezes. */
export function indiceDe(notas: readonly number[], metodo: Metodo = metodoAtual): number {
  const extra = metodo.pesoMenorDimensao - 1;
  return Math.round((notas.reduce((a, b) => a + b, 0) + extra * Math.min(...notas)) / (notas.length + extra));
}

export function nivelDe(indice: number, metodo: Metodo = metodoAtual): NivelId {
  return (metodo.niveis.find((n) => indice >= n.min && indice <= n.max) ?? metodo.niveis[metodo.niveis.length - 1]).id;
}

/** Posição do nível (1 a 5), para "Nível 3 de 5". */
export const numeroDoNivel = (id: NivelId) => niveis.findIndex((n) => n.id === id) + 1;

/** Faixa de leitura de uma nota de dimensão. É regra de análise (textos e prioridades), não do método da nota. */
export function faixaDe(nota: number): Faixa {
  if (nota >= regras.faixas.altaDesde) return "alta";
  return nota >= regras.faixas.mediaDesde ? "media" : "baixa";
}

export function calcular(
  r: Pick<Respostas, "centrais" | "areas" | "porArea">,
  metodo: Metodo = metodoAtual,
): Resultado {
  const ids = dimensoesDo(metodo);
  const porDimensao = Object.fromEntries(
    ids.map((id) => [
      id,
      notaDe(
        metodo.dimensaoDaPergunta.map((d, i) => (d === id ? r.centrais[i] : undefined)),
        metodo,
      ),
    ]),
  ) as Record<DimensaoId, number | null>;

  const notas = Object.values(porDimensao).filter((n): n is number => n !== null);
  const respondidas = r.centrais.filter(valida).length;
  const parcial = respondidas < metodo.minimoRespondidas || notas.length < ids.length;
  const media = notas.length ? indiceDe(notas, metodo) : null;
  const indice = parcial ? null : media;

  return {
    dimensoes: porDimensao,
    respondidas,
    parcial,
    media,
    indice,
    nivel: indice === null ? null : nivelDe(indice, metodo),
    areas: Object.fromEntries(r.areas.map((a) => [a, notaDe(r.porArea[a] ?? [], metodo)])),
  };
}

/** Nota para exibir: inteiro ou uma casa decimal, no formato brasileiro (37,5). */
export const formatarNota = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
