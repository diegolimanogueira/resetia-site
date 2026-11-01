import type { Resposta } from "./tipos";

/**
 * Modelo de evidência: toda afirmação do relatório diz de onde vem. É o mesmo na tela, no PDF, no e-mail e no
 * painel, e as referências são estáveis entre versões (p1 a p12 para as perguntas centrais; m1 a m4, v1 a v4 e c1
 * a c4 para as áreas).
 *
 * - declarado: o que a pessoa respondeu (a alternativa escolhida, literal);
 * - derivado: cálculo ou regra aplicada às respostas, sem informação nova;
 * - hipotese: algo plausível que ainda não foi confirmado (nunca apresentado como fato);
 * - validar: o que falta saber, com a pergunta que resolveria.
 */
type Natureza = "declarado" | "derivado" | "hipotese" | "validar";

export type EvidenciaRef =
  | { tipo: "resposta"; ref: string; valor: Resposta }
  | { tipo: "dado-operacional"; ref: string; valor: string | number | null }
  | { tipo: "regra"; ref: string };

export interface Afirmacao {
  /** Identificador estável da afirmação, para o painel e para comparar versões. */
  id: string;
  natureza: Natureza;
  texto: string;
  evidencias: EvidenciaRef[];
  /**
   * Respostas (níveis 0 a 4, por pergunta) para as quais o texto é verdadeiro, quando o texto depende delas.
   * Os testes conferem que o motor só emite a afirmação dentro dessa declaração.
   */
  afirma?: Record<string, readonly number[]>;
  /** Pergunta que resolveria a dúvida, quando a natureza é `validar`. */
  pergunta?: string;
}

export const daResposta = (ref: string, valor: Resposta): EvidenciaRef => ({ tipo: "resposta", ref, valor });
export const daRegra = (ref: string): EvidenciaRef => ({ tipo: "regra", ref });
