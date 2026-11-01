import type { DimensaoId } from "@/content/types";
import { dimensoesDo } from "./calcular";
import { metodoAtual, type Metodo } from "./metodo";
import type { Resultado, Slot } from "./tipos";

/**
 * Cobertura das respostas: quanta informação existe por trás da nota. É um fato contado, não uma probabilidade:
 * não vira margem de erro nem grau de confiança estatística. "Não sei responder" fica fora da média (método 1),
 * então menos respostas válidas podem até subir a nota; por isso a cobertura aparece sempre junto dela.
 *
 * - completa: as 12 respostas centrais são válidas.
 * - estimativa: a nota existe, mas ao menos uma resposta foi "Não sei". Vale como estimativa com cobertura incompleta.
 * - parcial: não há nota consolidada (menos de 10 respostas válidas ou uma dimensão sem resposta).
 */
type SituacaoDaNota = "completa" | "estimativa" | "parcial";

export interface Cobertura {
  /** Perguntas centrais. */
  total: number;
  /** Com resposta válida (sem contar "Não sei responder"). */
  validas: number;
  /** Posições das perguntas centrais respondidas com "Não sei". */
  naoSei: number[];
  porDimensao: Record<DimensaoId, { validas: number; total: number }>;
  /** Dimensões calculadas com uma única resposta. */
  umaResposta: DimensaoId[];
  /** Dimensões sem nenhuma resposta válida. */
  semResposta: DimensaoId[];
  situacao: SituacaoDaNota;
}

export function coberturaDe(
  centrais: readonly Slot[],
  resultado: Pick<Resultado, "parcial">,
  metodo: Metodo = metodoAtual,
): Cobertura {
  const ids = dimensoesDo(metodo);
  const porDimensao = Object.fromEntries(ids.map((id) => [id, { validas: 0, total: 0 }])) as Cobertura["porDimensao"];
  const naoSei: number[] = [];
  metodo.dimensaoDaPergunta.forEach((id, i) => {
    porDimensao[id].total += 1;
    const s = centrais[i];
    if (typeof s === "number") porDimensao[id].validas += 1;
    else if (s === null) naoSei.push(i);
  });
  const validas = ids.reduce((soma, id) => soma + porDimensao[id].validas, 0);
  const total = metodo.dimensaoDaPergunta.length;
  return {
    total,
    validas,
    naoSei,
    porDimensao,
    umaResposta: ids.filter((id) => porDimensao[id].validas === 1),
    semResposta: ids.filter((id) => porDimensao[id].validas === 0),
    situacao: resultado.parcial ? "parcial" : validas < total ? "estimativa" : "completa",
  };
}
