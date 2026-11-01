import type { Respostas } from "../tipos";
import { juntar, lerCampos, partesDe } from "./comum";

/**
 * FORMATO 1 — CONGELADO. É o link de todas as avaliações feitas até 31/10/2026: `v=1&e=…&r=…`, sem versão de método
 * nem de análise (o método 1 já estava em vigor). O decodificador não pode mudar de comportamento; o codificador
 * existe só para testes e para o rascunho antigo.
 */
export function codificarV1(r: Respostas): string {
  return juntar([["v", "1"], ...partesDe(r)]);
}

/** Lê um link `v=1`. Qualquer outro `v`, ou qualquer campo inválido, devolve `null`. */
export function decodificarV1(texto: string): Respostas | null {
  const q = new URLSearchParams(texto.replace(/^#/, ""));
  if (q.get("v") !== "1") return null;
  return lerCampos(q);
}
