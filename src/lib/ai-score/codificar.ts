import { ANALISE_ATUAL, METODO_ATUAL } from "./versoes";
import { codificarV2 } from "./codec/v2";
import { lerLink } from "./codec";
import type { Respostas } from "./tipos";

/**
 * Porta de entrada do codec. `codificar` gera sempre o formato atual (v2, com a versão do método e da análise);
 * `decodificar` lê qualquer formato conhecido e devolve só as respostas (ou `null`). Quem precisa distinguir os
 * estados (vazio, inválido, formato ou método desconhecido) ou saber a versão do link usa `lerLink`.
 * O formato 1 continua legível para sempre (`codec/v1.ts`).
 */
export { respostasVazias, completas } from "./codec/comum";
export { lerLink } from "./codec";

export const codificar = (r: Respostas) => codificarV2(r, { metodo: METODO_ATUAL, analise: ANALISE_ATUAL });

/** Lê o texto do hash (com ou sem `#`). Qualquer valor fora do esperado devolve `null`. */
export function decodificar(texto: string): Respostas | null {
  const l = lerLink(texto);
  return l.tipo === "ok" ? l.respostas : null;
}
