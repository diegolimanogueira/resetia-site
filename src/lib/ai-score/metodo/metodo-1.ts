import type { DimensaoId, NivelId } from "@/content/types";

/**
 * MÉTODO 1 — CONGELADO. Não edite estes números.
 *
 * É a regra que calculou todas as notas gravadas até hoje (a de 28/10, tarde: pontos 0/15/40/70/100, menor
 * dimensão em dobro, mínimo de 10 respostas). Quem abre um link antigo ou um registro do painel recebe a nota
 * por estes valores, mesmo que o método atual mude. Para mudar qualquer número, crie `metodo-2.ts`, registre-o em
 * `metodo/index.ts`, avance `METODO_ATUAL` e explique a decisão em `docs/decisions.md`.
 *
 * Os testes comparam este arquivo com um literal e com o conteúdo do questionário (níveis e dimensão de cada
 * pergunta), para que uma edição acidental falhe.
 */
export interface Metodo {
  versao: string;
  /** Pontos de cada alternativa, da 1ª à 5ª. */
  pontos: readonly [number, number, number, number, number];
  /** A dimensão mais fraca conta este número de vezes no AI Score (1 = média simples). */
  pesoMenorDimensao: number;
  /** Mínimo de respostas válidas, entre as 12 centrais, para consolidar a nota. */
  minimoRespondidas: number;
  /** Dimensão de cada uma das 12 perguntas centrais, na ordem do questionário. */
  dimensaoDaPergunta: readonly DimensaoId[];
  /** Faixas dos cinco níveis (nota inclusiva nos dois extremos). */
  niveis: ReadonlyArray<{ id: NivelId; min: number; max: number }>;
}

export const metodo1: Metodo = Object.freeze({
  versao: "1",
  pontos: Object.freeze([0, 15, 40, 70, 100]) as Metodo["pontos"],
  pesoMenorDimensao: 2,
  minimoRespondidas: 10,
  dimensaoDaPergunta: Object.freeze([
    "estrategia",
    "estrategia",
    "pessoas",
    "pessoas",
    "processos",
    "processos",
    "dados",
    "dados",
    "governanca",
    "governanca",
    "resultados",
    "resultados",
  ]) as readonly DimensaoId[],
  niveis: Object.freeze([
    Object.freeze({ id: "inicial", min: 0, max: 19 }),
    Object.freeze({ id: "explorando", min: 20, max: 39 }),
    Object.freeze({ id: "desenvolvimento", min: 40, max: 59 }),
    Object.freeze({ id: "estruturada", min: 60, max: 79 }),
    Object.freeze({ id: "avancada", min: 80, max: 100 }),
  ]) as Metodo["niveis"],
});
