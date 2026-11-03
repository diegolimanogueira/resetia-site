import { alertas as textos } from "@/content/ai-score-analise";
import { perguntasCentrais } from "@/content/ai-score-questionario";
import { dimensoesDo } from "./calcular";
import { daRegra, daResposta, type Afirmacao, type EvidenciaRef } from "./evidencia";
import { metodoAtual, type Metodo } from "./metodo";
import { regras } from "./regras";
import type { Resultado, Slot } from "./tipos";

/**
 * Alertas: padrões entre respostas que pedem atenção. Cada um é decidido por perguntas específicas (não por médias
 * de dimensão), cita as respostas que o sustentam e só aparece quando elas existem: "Não sei" nunca vale como zero
 * (a falta de resposta aparece no alerta de pontos cegos e na leitura da dimensão). Nenhum alerta é cortado: a tela
 * decide quantos mostra de início. Independem do nível de maturidade e da recomendação de soluções.
 */

export type AlertaId = keyof typeof textos.itens;
export interface Alerta extends Afirmacao {
  alerta: AlertaId;
  titulo: string;
}

interface Contexto {
  /** Resposta válida (0 a 4) da pergunta, ou `undefined` se não respondeu ou respondeu "Não sei". */
  v: (pergunta: string) => number | undefined;
  naoSei: string[];
  validas: number[];
  notasDasDimensoes: number[];
}

const entre = (c: Contexto, pergunta: string, de: number, ate: number) => {
  const x = c.v(pergunta);
  return x !== undefined && x >= de && x <= ate;
};

interface Especificacao {
  id: AlertaId;
  /** Respostas que sustentam o alerta, por pergunta. A regra em `quando` tem que cair dentro desta declaração. */
  afirma?: Record<string, readonly number[]>;
  quando: (c: Contexto) => boolean;
  evidencias?: (c: Contexto) => EvidenciaRef[];
}

/** Na ordem de exibição: começo da jornada, riscos, oportunidades de execução, visibilidade e equilíbrio. */
const especificacoes: Especificacao[] = [
  {
    id: "inicio",
    quando: (c) => c.validas.length > 0 && c.validas.every((x) => x <= 1),
    evidencias: () => [daRegra("regra:todas-as-respostas-validas-nos-dois-primeiros-estagios")],
  },
  {
    id: "adocao-sem-governanca",
    afirma: { p3: [2, 3, 4], p9: [0, 1] },
    quando: (c) => entre(c, "p3", 2, 4) && entre(c, "p9", 0, 1),
  },
  {
    id: "uso-sem-direcao",
    afirma: { p3: [2, 3, 4], p1: [0, 1], p2: [0, 1] },
    quando: (c) => entre(c, "p3", 2, 4) && entre(c, "p1", 0, 1) && entre(c, "p2", 0, 1),
  },
  {
    id: "ferramentas-sem-resultado",
    afirma: { p8: [2, 3, 4], p11: [0, 1] },
    quando: (c) => entre(c, "p8", 2, 4) && entre(c, "p11", 0, 1),
  },
  {
    id: "estrategia-sem-execucao",
    afirma: { p1: [3, 4], p6: [0, 1] },
    quando: (c) => entre(c, "p1", 3, 4) && entre(c, "p6", 0, 1),
  },
  {
    id: "processos-sem-dados",
    afirma: { p6: [2, 3, 4], p7: [0, 1] },
    quando: (c) => entre(c, "p6", 2, 4) && entre(c, "p7", 0, 1),
  },
  {
    id: "lideranca-a-frente",
    afirma: { p2: [3, 4], p4: [0, 1] },
    quando: (c) => entre(c, "p2", 3, 4) && entre(c, "p4", 0, 1),
  },
  {
    id: "pontos-cegos",
    quando: (c) => c.naoSei.length >= regras.alertas.pontosCegos,
    evidencias: (c) => c.naoSei.map((p) => daResposta(p, null)),
  },
  {
    id: "desequilibrio",
    quando: (c) =>
      c.notasDasDimensoes.length > 1 &&
      Math.max(...c.notasDasDimensoes) - Math.min(...c.notasDasDimensoes) >= regras.alertas.desequilibrio,
    evidencias: () => [daRegra("regra:diferenca-entre-dimensoes")],
  },
];

/** Respostas citadas na declaração `afirma` de um alerta. */
const evidenciasDe = (e: Especificacao, c: Contexto): EvidenciaRef[] =>
  e.evidencias?.(c) ?? Object.keys(e.afirma ?? {}).map((p) => daResposta(p, c.v(p) as 0 | 1 | 2 | 3 | 4));

/** Declaração `afirma` de cada alerta decidido por perguntas, exposta para os testes. */
export const afirmaDosAlertas = Object.fromEntries(
  especificacoes.filter((e) => e.afirma).map((e) => [e.id, e.afirma!]),
) as Partial<Record<AlertaId, Record<string, readonly number[]>>>;

export function detectarAlertas(
  centrais: readonly Slot[],
  resultado: Pick<Resultado, "dimensoes">,
  metodo: Metodo = metodoAtual,
): Alerta[] {
  const porId = new Map<string, Slot>(perguntasCentrais.map((p, i) => [p.id, centrais[i]]));
  const contexto: Contexto = {
    v: (p) => {
      const s = porId.get(p);
      return typeof s === "number" ? s : undefined;
    },
    naoSei: perguntasCentrais.filter((_, i) => centrais[i] === null).map((p) => p.id),
    validas: centrais.filter((s): s is 0 | 1 | 2 | 3 | 4 => typeof s === "number"),
    notasDasDimensoes: dimensoesDo(metodo)
      .map((d) => resultado.dimensoes[d])
      .filter((n): n is number => n !== null),
  };
  return especificacoes
    .filter((e) => e.quando(contexto))
    .map((e) => ({
      id: `alerta.${e.id}`,
      alerta: e.id,
      natureza: "derivado" as const,
      titulo: textos.itens[e.id].titulo,
      texto: textos.itens[e.id].texto,
      evidencias: evidenciasDe(e, contexto),
      ...(e.afirma ? { afirma: e.afirma } : {}),
    }));
}
