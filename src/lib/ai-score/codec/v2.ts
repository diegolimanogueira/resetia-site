import { METODO_ATUAL, ANALISE_ATUAL } from "../versoes";
import type { Respostas } from "../tipos";
import { juntar, lerCampos, partesDe } from "./comum";

/**
 * FORMATO 2: `v=2&m=<método>&n=<análise>&e=…&r=…`. Traz explícitas a versão do método (a regra da nota) e a da
 * análise (os textos e as regras de leitura) com que a avaliação foi feita. O token privado de um link do e-mail
 * (`&k=`) e o `&lead=` legado ficam de fora das respostas e nunca são gravados no `codigo`.
 */
const NUMERO = /^[1-9]\d{0,2}$/;

export function codificarV2(
  r: Respostas,
  versoes: { metodo: string; analise: string } = { metodo: METODO_ATUAL, analise: ANALISE_ATUAL },
): string {
  return juntar([["v", "2"], ["m", versoes.metodo], ["n", versoes.analise], ...partesDe(r)]);
}

export type LeituraV2 = { tipo: "ok"; respostas: Respostas; metodo: string; analise: string } | { tipo: "invalido" };

/** Lê um link `v=2`. Chave repetida, `m` ou `n` fora do padrão e qualquer campo inválido tornam o link inválido. */
export function decodificarV2(texto: string): LeituraV2 {
  const q = new URLSearchParams(texto.replace(/^#/, ""));
  const chaves = [...q.keys()];
  if (q.get("v") !== "2" || new Set(chaves).size !== chaves.length) return { tipo: "invalido" };
  const metodo = q.get("m");
  const analise = q.get("n");
  if (!metodo || !NUMERO.test(metodo) || !analise || !NUMERO.test(analise)) return { tipo: "invalido" };
  const respostas = lerCampos(q);
  return respostas ? { tipo: "ok", respostas, metodo, analise } : { tipo: "invalido" };
}
