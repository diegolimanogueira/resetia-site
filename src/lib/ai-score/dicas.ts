import type { Biblioteca } from "@/content/ai-score-dicas";
import { dimensoes, perguntasCentrais } from "@/content/ai-score-questionario";
import type { DimensaoId } from "@/content/types";
import { regras } from "./regras";
import type { RespostasCompletas, Resultado } from "./tipos";

/**
 * Dicas de evolução por dimensão de nota baixa: quais dimensões recebem dicas, a reserva da biblioteca, a montagem
 * e a leitura. Usado no navegador e na função supabase/functions/ai-score. O que só a geração por IA usa (fatos,
 * esquema e validador) fica em `dicas-ia.ts`, fora do JavaScript do navegador.
 */

type FonteDica = "ia" | "biblioteca";

interface DicasDimensao {
  id: DimensaoId;
  dicas: string[];
  fonte: FonteDica;
}

export interface Dicas {
  /** "ia" quando todas vieram da IA; "biblioteca" quando nenhuma; "misto" quando a biblioteca completou. */
  fonte: FonteDica | "misto";
  modelo?: string;
  dimensoes: DicasDimensao[];
}

const ordem = dimensoes.map((d) => d.id);

/** Dimensões que recebem dicas: as de nota baixa (abaixo de 40); se não houver, as duas menores abaixo de 70. */
export function alvosDasDicas(resultado: Resultado): DimensaoId[] {
  const nota = (id: DimensaoId) => resultado.dimensoes[id];
  const comNota = ordem.filter((id) => nota(id) !== null);
  const baixas = comNota.filter((id) => nota(id)! < regras.faixas.mediaDesde);
  if (baixas.length) return baixas;
  return comNota
    .filter((id) => nota(id)! < regras.faixas.altaDesde)
    .sort((a, b) => nota(a)! - nota(b)!)
    .slice(0, 2);
}

/**
 * Reserva: a dica da biblioteca para o estágio de cada pergunta da dimensão (uma por pergunta). A biblioteca entra
 * por parâmetro para o navegador carregá-la só quando o relatório aparece.
 */
export function dicasDaBiblioteca(biblioteca: Biblioteca, r: RespostasCompletas, id: DimensaoId): string[] {
  return perguntasCentrais
    .map((p, i) => ({ p, atual: r.centrais[i] }))
    .filter(({ p }) => p.dimensao === id)
    .map(({ p, atual }) => {
      const b = biblioteca[p.id];
      if (atual === null || atual === undefined) return b.naoSei;
      return atual === 4 ? null : b.estagios[atual];
    })
    .filter((d): d is string => d !== null);
}

/** Junta as dicas da IA (já validadas) com a biblioteca onde a IA não deixou nenhuma dica boa. */
export function montarDicas(
  biblioteca: Biblioteca,
  r: RespostasCompletas,
  alvos: DimensaoId[],
  daIa: Partial<Record<DimensaoId, string[]>> = {},
  modelo?: string,
): Dicas {
  const porDimensao: DicasDimensao[] = alvos.map((id) =>
    daIa[id]?.length
      ? { id, dicas: daIa[id]!, fonte: "ia" }
      : { id, dicas: dicasDaBiblioteca(biblioteca, r, id), fonte: "biblioteca" },
  );
  const fontes = new Set(porDimensao.map((d) => d.fonte));
  const fonte = fontes.size === 1 ? [...fontes][0] : fontes.size === 0 ? "biblioteca" : "misto";
  return { fonte, modelo: fontes.has("ia") ? modelo : undefined, dimensoes: porDimensao };
}

/** Confere o formato de dicas vindas da função ou do cache antes de mostrar. */
export function lerDicas(bruto: unknown, alvos: DimensaoId[]): Dicas | null {
  const d = bruto as Partial<Dicas> | null;
  if (!d || !Array.isArray(d.dimensoes)) return null;
  const dimensoesOk = d.dimensoes.filter(
    (x): x is DicasDimensao =>
      !!x &&
      alvos.includes(x.id) &&
      Array.isArray(x.dicas) &&
      x.dicas.every((t) => typeof t === "string") &&
      (x.fonte === "ia" || x.fonte === "biblioteca"),
  );
  if (!dimensoesOk.length) return null;
  return {
    fonte: d.fonte === "ia" || d.fonte === "biblioteca" || d.fonte === "misto" ? d.fonte : "misto",
    modelo: typeof d.modelo === "string" ? d.modelo : undefined,
    dimensoes: dimensoesOk,
  };
}
