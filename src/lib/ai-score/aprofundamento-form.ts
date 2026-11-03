import { OUTRA } from "@/content/ai-score-aprofundamento";
import type { Aprofundamento } from "./aprofundamento";

/**
 * Formulário do aprofundamento: o que a pessoa digita (tudo texto) e a conversão para o que o validador espera.
 * Fica fora do componente para ser testado sem tela. O validador (aprofundamento.ts) continua sendo o único juiz do
 * que vale; aqui só se monta a entrada e se diz em que pergunta cada erro aparece.
 */

export type PassoId =
  "area" | "rotina" | "volume" | "consequencia" | "minutos" | "ferramentas" | "dados" | "indicador" | "papel";

const CAMADA_1: readonly PassoId[] = ["rotina", "volume", "consequencia"];
const CAMADA_2: readonly PassoId[] = ["minutos", "ferramentas", "dados", "indicador", "papel"];

/** As perguntas de cada camada, em ordem. A área só é perguntada quando não dá para deduzi-la do questionário. */
export const passosDe = (camada: 1 | 2, perguntarArea: boolean): PassoId[] => [
  ...(perguntarArea ? (["area"] as const) : []),
  ...CAMADA_1,
  ...(camada === 2 ? CAMADA_2 : []),
];

export const primeiroDaCamada2: PassoId = CAMADA_2[0];

export type NaoSei = Aprofundamento["naoSei"][number];

export interface Campos {
  area: string;
  rotina: string;
  rotinaOutra: string;
  volume: string;
  unidade: string;
  periodo: string;
  consequencia: string;
  consequenciaOutra: string;
  minutos: string;
  ferramentas: string;
  dados: string;
  indicador: string;
  papelDecisor: string;
}

export const camposVazios = (area = ""): Campos => ({
  area,
  rotina: "",
  rotinaOutra: "",
  volume: "",
  unidade: "",
  periodo: "",
  consequencia: "",
  consequenciaOutra: "",
  minutos: "",
  ferramentas: "",
  dados: "",
  indicador: "",
  papelDecisor: "",
});

export interface Rascunho {
  fase: "adiado" | "perguntas";
  passo: PassoId;
  camada: 1 | 2;
  campos: Campos;
  naoSei: NaoSei[];
}

/**
 * Número digitado em português: "1.500" é mil e quinhentos, "1,5" é um e meio, "1.500,5" também. Vazio é ausência;
 * o que não for número vira NaN, e o validador responde com a mensagem certa.
 */
export function numeroDe(texto: string): number | undefined {
  const t = texto.trim();
  if (!t) return undefined;
  const normal = t.includes(",")
    ? t.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(\.\d{3})+$/.test(t)
      ? t.replace(/\./g, "")
      : t;
  return /^\d+(\.\d+)?$/.test(normal) ? Number(normal) : NaN;
}

const lista = (texto: string) =>
  texto
    .split(/[,;\n]/)
    .map((f) => f.trim())
    .filter(Boolean);

/** A entrada do validador a partir do formulário. Campos de camada 2 só entram na camada 2; "Não sei" vence o valor. */
export function entradaDe(r: Pick<Rascunho, "campos" | "naoSei" | "camada">, revisao: number) {
  const { campos: c, camada } = r;
  const naoSei = r.naoSei.filter((n) => camada === 2 || n !== "minutos");
  const nao = (n: NaoSei) => naoSei.includes(n);
  const entrada: Record<string, unknown> = { area: c.area, camada, revisao, naoSei };
  if (!nao("rotina") && c.rotina) {
    entrada.rotina = c.rotina;
    if (c.rotina === OUTRA) entrada.rotinaOutra = c.rotinaOutra;
  }
  const volume = nao("volume") ? undefined : numeroDe(c.volume);
  if (volume !== undefined) Object.assign(entrada, { volume, unidade: c.unidade, periodo: c.periodo });
  if (!nao("consequencia") && c.consequencia) {
    entrada.consequencia = c.consequencia;
    if (c.consequencia === OUTRA) entrada.consequenciaOutra = c.consequenciaOutra;
  }
  if (camada === 2) {
    const minutos = nao("minutos") ? undefined : numeroDe(c.minutos);
    if (minutos !== undefined) entrada.minutos = minutos;
    entrada.ferramentas = lista(c.ferramentas);
    if (c.dados) entrada.dados = c.dados;
    if (c.indicador) entrada.indicador = c.indicador;
    if (c.papelDecisor) entrada.papelDecisor = c.papelDecisor;
  }
  return entrada;
}

/** O formulário a partir de um aprofundamento já salvo (para corrigir ou aprofundar). */
export function camposDe(a: Aprofundamento): Campos {
  const numero = (n: number | undefined) => (n === undefined ? "" : String(n).replace(".", ","));
  return {
    area: a.area,
    rotina: a.rotina ?? "",
    rotinaOutra: a.rotinaOutra ?? "",
    volume: numero(a.volume),
    unidade: a.unidade ?? "",
    periodo: a.periodo ?? "",
    consequencia: a.consequencia ?? "",
    consequenciaOutra: a.consequenciaOutra ?? "",
    minutos: numero(a.minutos),
    ferramentas: a.ferramentas.join(", "),
    dados: a.dados ?? "",
    indicador: a.indicador ?? "",
    papelDecisor: a.papelDecisor ?? "",
  };
}

/** Em que pergunta cada erro do validador aparece. Chave sem pergunta própria cai no aviso geral. */
const PASSO_DO_ERRO: Record<string, PassoId> = {
  area: "area",
  rotina: "rotina",
  rotinaOutra: "rotina",
  volume: "volume",
  unidade: "volume",
  periodo: "volume",
  consequencia: "consequencia",
  consequenciaOutra: "consequencia",
  minutos: "minutos",
  ferramentas: "ferramentas",
  dados: "dados",
  indicador: "indicador",
  papelDecisor: "papel",
};
export const passoDoErro = (campo: string): PassoId | null => PASSO_DO_ERRO[campo] ?? null;

const PASSOS: readonly string[] = [...CAMADA_1, ...CAMADA_2, "area"];
const NAO_SEI: readonly string[] = ["rotina", "volume", "consequencia", "minutos"];

/** Lê o rascunho da sessão com cuidado: tudo que não tiver a forma esperada é descartado. */
export function lerRascunho(texto: string | null): Rascunho | null {
  if (!texto) return null;
  try {
    const r = JSON.parse(texto) as Partial<Rascunho>;
    if (r.fase !== "adiado" && r.fase !== "perguntas") return null;
    if (typeof r.passo !== "string" || !PASSOS.includes(r.passo)) return null;
    if (r.camada !== 1 && r.camada !== 2) return null;
    const bruto = (r.campos && typeof r.campos === "object" ? r.campos : {}) as Record<string, unknown>;
    const campos = camposVazios();
    for (const k of Object.keys(campos) as Array<keyof Campos>)
      if (typeof bruto[k] === "string") campos[k] = (bruto[k] as string).slice(0, 400);
    const naoSei = (Array.isArray(r.naoSei) ? r.naoSei : []).filter((n): n is NaoSei => NAO_SEI.includes(n));
    return { fase: r.fase, passo: r.passo as PassoId, camada: r.camada, campos, naoSei };
  } catch {
    return null;
  }
}
