import { desafios, horizontes, modulosArea, perguntasCentrais, segmentacao } from "@/content/ai-score-questionario";
import type { AreaId } from "@/content/types";
import type { Respostas, RespostasCompletas, Slot } from "./tipos";

/**
 * As respostas viram um texto curto (`v=1&e=empresa&p=ceo&…&r=3421x3214321`) que vai no hash da URL do resultado.
 * Assim o resultado recarrega, pode ser compartilhado e reaberto pelo admin sem backend. Nunca leva nome ou e-mail.
 * 0–4 = pontos, x = "Não sei responder", - = sem resposta (só no rascunho).
 */

const VERSAO = "1";
const TOTAL_CENTRAIS = perguntasCentrais.length;
const TOTAL_AREA = 4;
const CHAVE_AREA: Record<AreaId, string> = { marketing: "am", vendas: "av", "customer-success": "ac" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ids = <T extends string>(lista: ReadonlyArray<{ id: T }>) => new Set<string>(lista.map((o) => o.id));
const validos = {
  escopo: ids(segmentacao.escopo.opcoes),
  papel: ids(segmentacao.papel.opcoes),
  porte: ids(segmentacao.porte.opcoes),
  segmento: ids(segmentacao.segmento.opcoes),
  area: new Set<string>(modulosArea.map((m) => m.area)),
  desafio: ids(desafios),
  horizonte: ids(horizontes.opcoes),
};

const paraTexto = (slots: readonly Slot[], n: number) =>
  Array.from({ length: n }, (_, i) => {
    const s = slots[i];
    return s === undefined ? "-" : s === null ? "x" : String(s);
  }).join("");

function paraSlots(texto: string | null, n: number): Slot[] | null {
  if (texto === null) return Array<Slot>(n).fill(undefined);
  if (!new RegExp(`^[0-4x-]{${n}}$`).test(texto)) return null;
  return [...texto].map((c) => (c === "-" ? undefined : c === "x" ? null : (Number(c) as Slot)));
}

export const respostasVazias = (): Respostas => ({
  areas: [],
  centrais: Array<Slot>(TOTAL_CENTRAIS).fill(undefined),
  porArea: {},
  desafios: [],
});

export function codificar(r: Respostas): string {
  const partes: Array<[string, string | undefined]> = [
    ["v", VERSAO],
    ["e", r.escopo],
    ["p", r.papel],
    ["t", r.porte],
    ["s", r.segmento],
    ["r", paraTexto(r.centrais, TOTAL_CENTRAIS)],
    ["a", r.areas.length ? r.areas.join(",") : undefined],
    ...r.areas.map((a): [string, string] => [CHAVE_AREA[a], paraTexto(r.porArea[a] ?? [], TOTAL_AREA)]),
    ["d", r.desafios.length ? r.desafios.join(",") : undefined],
    ["h", r.horizonte],
    ["id", r.id],
  ];
  return partes
    .filter((p): p is [string, string] => p[1] !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

/** Lê o texto do hash (com ou sem `#`). Qualquer valor fora do esperado invalida tudo: devolve `null`. */
export function decodificar(texto: string): Respostas | null {
  const q = new URLSearchParams(texto.replace(/^#/, ""));
  if (q.get("v") !== VERSAO) return null;

  const campo = <K extends keyof typeof validos>(chave: string, tipo: K) => {
    const v = q.get(chave);
    if (v === null) return { ok: true, valor: undefined };
    return validos[tipo].has(v) ? { ok: true, valor: v } : { ok: false, valor: undefined };
  };
  const escopo = campo("e", "escopo");
  const papel = campo("p", "papel");
  const porte = campo("t", "porte");
  const segmento = campo("s", "segmento");
  const horizonte = campo("h", "horizonte");
  if (![escopo, papel, porte, segmento, horizonte].every((c) => c.ok)) return null;

  const centrais = paraSlots(q.get("r"), TOTAL_CENTRAIS);
  if (!centrais) return null;

  const lista = (chave: string, tipo: "area" | "desafio") => {
    const v = q.get(chave);
    if (!v) return [];
    const itens = v.split(",");
    return itens.every((i) => validos[tipo].has(i)) && new Set(itens).size === itens.length ? itens : null;
  };
  const areas = lista("a", "area") as AreaId[] | null;
  const escolhidos = lista("d", "desafio");
  if (!areas || !escolhidos || escolhidos.length > 2) return null;

  const porArea: Respostas["porArea"] = {};
  for (const a of areas) {
    const slots = paraSlots(q.get(CHAVE_AREA[a]), TOTAL_AREA);
    if (!slots) return null;
    porArea[a] = slots;
  }

  const id = q.get("id") ?? undefined;
  if (id !== undefined && !UUID.test(id)) return null;

  return {
    id,
    escopo: escopo.valor as Respostas["escopo"],
    papel: papel.valor as Respostas["papel"],
    porte: porte.valor as Respostas["porte"],
    segmento: segmento.valor as Respostas["segmento"],
    areas,
    centrais,
    porArea,
    desafios: escolhidos as Respostas["desafios"],
    horizonte: horizonte.valor as Respostas["horizonte"],
  };
}

/** Todas as perguntas respondidas (inclusive com "Não sei"), um ou dois desafios e o prazo. */
export function completas(r: Respostas | null): r is RespostasCompletas {
  if (!r?.escopo || !r.papel || !r.porte || !r.segmento || !r.horizonte) return false;
  if (r.desafios.length < 1 || r.desafios.length > 2) return false;
  if (r.escopo !== "empresa" && !r.areas.includes(r.escopo)) return false;
  if (r.centrais.length !== TOTAL_CENTRAIS || r.centrais.some((s) => s === undefined)) return false;
  return r.areas.every((a) => (r.porArea[a] ?? []).length === TOTAL_AREA && !r.porArea[a]!.includes(undefined));
}
