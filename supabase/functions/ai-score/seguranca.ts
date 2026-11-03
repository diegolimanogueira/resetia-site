// Peças de segurança das ações públicas da função: hash, identificadores determinísticos, IP e limites por janela.
import { rpc } from "./base.ts";

export const CHAVE = /^[A-Za-z0-9_-]{43}$/;

export async function sha256hex(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...h].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** UUID derivado do conteúdo: o mesmo evento repetido (reenvio da fila do navegador) tem sempre o mesmo id. */
export async function uuidDeterministico(...partes: string[]) {
  const h = (await sha256hex(partes.join("|"))).slice(0, 32).split("");
  h[12] = "5";
  h[16] = "89ab"[Number.parseInt(h[16], 16) % 4];
  const s = h.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** Primeiro IP de x-forwarded-for. Só entra no limite por hash, nunca é gravado. */
export const ipDoPedido = (req: Request) =>
  (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "desconhecido").split(",")[0].trim() ||
  "desconhecido";

/**
 * Conta um uso na janela e diz se ainda cabe. Se o banco não responder, deixa passar (e registra): perder um contato
 * por causa do contador seria pior do que um excesso raro.
 */
export async function dentroDoLimite(chave: string, janelaSegundos: number, maximo: number) {
  const r = await rpc<boolean>("consumir_limite", {
    p_chave: chave,
    p_janela_segundos: janelaSegundos,
    p_maximo: maximo,
  });
  if (r.estado !== "ok") {
    console.warn(`limite ${chave.split(":")[0]}: sem resposta do banco, liberado`);
    return true;
  }
  return r.dados !== false;
}
