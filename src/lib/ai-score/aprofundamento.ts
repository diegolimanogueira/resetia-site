import {
  consequencias,
  dadosDisponiveis,
  OUTRA,
  papeisNaDecisao,
  periodos,
  rotinas,
} from "@/content/ai-score-aprofundamento";
import type { AreaId } from "@/content/types";

/**
 * Aprofundamento de uma dor operacional: tipos, validação e cálculo do esforço. O MESMO código valida no navegador e
 * na função (via nucleo.js), e os limites abaixo são os do banco (supabase/migrations/0008_captura.sql): um teste
 * compara os dois. Dado privado: nada disto vai para o link do resultado, para a IA ou para o analytics.
 */

export const LIMITES = {
  volume: 100_000,
  minutos: 600,
  unidade: 40,
  rotinaOutra: 120,
  consequenciaOutra: 200,
  indicador: 200,
  ferramentas: 8,
  ferramenta: 40,
  revisao: 1000,
} as const;

type PeriodoId = (typeof periodos)[number]["id"];
type DadosId = (typeof dadosDisponiveis)[number]["id"];
type PapelDecisorId = (typeof papeisNaDecisao)[number]["id"];
/** Campos que a pessoa pode responder com "Não sei". */
type CampoNaoSei = "rotina" | "volume" | "consequencia" | "minutos";
const CAMPOS_NAO_SEI: readonly CampoNaoSei[] = ["rotina", "volume", "consequencia", "minutos"];

export interface Aprofundamento {
  area: AreaId;
  /** Até onde a pessoa foi: 1 (rotina, volume, consequência) ou 2 (e tempo, ferramentas, dados, indicador, papel). */
  camada: 1 | 2;
  /** Cresce a cada gravação: uma gravação atrasada não sobrescreve uma mais nova. */
  revisao: number;
  rotina?: string;
  rotinaOutra?: string;
  volume?: number;
  unidade?: string;
  periodo?: PeriodoId;
  consequencia?: string;
  consequenciaOutra?: string;
  minutos?: number;
  ferramentas: string[];
  dados?: DadosId;
  indicador?: string;
  papelDecisor?: PapelDecisorId;
  naoSei: CampoNaoSei[];
}

type ErrosAprofundamento = Partial<Record<keyof Aprofundamento | "geral", string>>;
export type ResultadoValidacao = { ok: true; valor: Aprofundamento } | { ok: false; erros: ErrosAprofundamento };

const AREAS: readonly AreaId[] = ["marketing", "vendas", "customer-success"];
const ids = (lista: ReadonlyArray<{ id: string }>) => lista.map((o) => o.id);

/** Texto limpo: sem caracteres de controle, espaços colapsados, aparado. */
const limpar = (t: unknown) =>
  typeof t === "string"
    ? t
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

/** E-mail ou telefone digitado num campo de texto aberto: o aprofundamento não é lugar de contato pessoal. */
const temContato = (t: string) => /\S+@\S+\.\S+/.test(t) || /(?:\d[\s().+-]*){10,}/.test(t);

const casas = (n: number, max: number) => Math.abs(n * 10 ** max - Math.round(n * 10 ** max)) < 1e-6;

/**
 * Valida e normaliza um aprofundamento. Nada é obrigatório (pode-se pular e responder "Não sei"), mas o que vem tem
 * que estar certo: unidade e período acompanham o volume, opções existem na área, texto tem limite e não carrega
 * contato, e "Não sei" não convive com um valor para o mesmo campo.
 */
export function validarAprofundamento(entrada: unknown): ResultadoValidacao {
  const o = (entrada && typeof entrada === "object" && !Array.isArray(entrada) ? entrada : {}) as Record<
    string,
    unknown
  >;
  const erros: ErrosAprofundamento = {};
  const msg = {
    opcao: "Escolha uma das opções.",
    obrigatorio: "Preencha este campo ou marque Não sei.",
    conflito: "Responda ou marque Não sei, não os dois.",
    contato: "Não coloque e-mail nem telefone aqui.",
  };

  const area = AREAS.includes(o.area as AreaId) ? (o.area as AreaId) : undefined;
  if (!area) erros.area = msg.opcao;
  const camada = o.camada === 1 || o.camada === 2 ? o.camada : undefined;
  if (!camada) erros.camada = msg.opcao;
  const revisao =
    typeof o.revisao === "number" && Number.isInteger(o.revisao) && o.revisao >= 1 && o.revisao <= LIMITES.revisao
      ? o.revisao
      : undefined;
  if (revisao === undefined) erros.revisao = msg.opcao;

  const bruto = Array.isArray(o.naoSei) ? o.naoSei : [];
  if (bruto.some((c) => !CAMPOS_NAO_SEI.includes(c as CampoNaoSei))) erros.naoSei = msg.opcao;
  const naoSei = CAMPOS_NAO_SEI.filter((c) => bruto.includes(c));
  const nao = (c: CampoNaoSei) => naoSei.includes(c);

  const texto = (
    campo: "rotinaOutra" | "consequenciaOutra" | "indicador",
    min: number,
    max: number,
    obrigatorio = false,
  ) => {
    const t = limpar(o[campo]);
    if (!t) {
      if (obrigatorio) erros[campo] = msg.obrigatorio;
      return undefined;
    }
    if (t.length < min || t.length > max) erros[campo] = `Use entre ${min} e ${max} caracteres.`;
    else if (temContato(t)) erros[campo] = msg.contato;
    return t;
  };

  // Rotina
  let rotina: string | undefined;
  let rotinaOutra: string | undefined;
  if (o.rotina !== undefined && o.rotina !== null && o.rotina !== "") {
    if (nao("rotina")) erros.rotina = msg.conflito;
    else if (area && typeof o.rotina === "string" && (o.rotina === OUTRA || ids(rotinas[area]).includes(o.rotina))) {
      rotina = o.rotina;
      if (rotina === OUTRA) rotinaOutra = texto("rotinaOutra", 2, LIMITES.rotinaOutra, true);
    } else erros.rotina = msg.opcao;
  }

  // Volume, com unidade e período
  let volume: number | undefined;
  let unidade: string | undefined;
  let periodo: PeriodoId | undefined;
  const temVolume = o.volume !== undefined && o.volume !== null && o.volume !== "";
  if (temVolume) {
    if (nao("volume")) erros.volume = msg.conflito;
    else if (typeof o.volume !== "number" || !Number.isFinite(o.volume) || o.volume <= 0)
      erros.volume = "Informe um número maior que zero.";
    else if (o.volume > LIMITES.volume)
      erros.volume = `Use um número de até ${LIMITES.volume.toLocaleString("pt-BR")}.`;
    else if (!casas(o.volume, 2)) erros.volume = "Use no máximo duas casas decimais.";
    else volume = o.volume;
    unidade = limpar(o.unidade);
    if (!unidade || unidade.length > LIMITES.unidade) erros.unidade = `Use entre 1 e ${LIMITES.unidade} caracteres.`;
    else if (temContato(unidade)) erros.unidade = msg.contato;
    if (ids(periodos).includes(o.periodo as string)) periodo = o.periodo as PeriodoId;
    else erros.periodo = msg.opcao;
  } else if (nao("volume") && (o.unidade || o.periodo)) erros.volume = msg.conflito;

  // Consequência
  let consequencia: string | undefined;
  let consequenciaOutra: string | undefined;
  if (o.consequencia !== undefined && o.consequencia !== null && o.consequencia !== "") {
    if (nao("consequencia")) erros.consequencia = msg.conflito;
    else if (
      typeof o.consequencia === "string" &&
      (o.consequencia === OUTRA || ids(consequencias).includes(o.consequencia))
    ) {
      consequencia = o.consequencia;
      if (consequencia === OUTRA) consequenciaOutra = texto("consequenciaOutra", 2, LIMITES.consequenciaOutra, true);
    } else erros.consequencia = msg.opcao;
  }

  // Camada 2
  let minutos: number | undefined;
  let dados: DadosId | undefined;
  let papelDecisor: PapelDecisorId | undefined;
  let ferramentas: string[] = [];
  const camada2 =
    [o.minutos, o.dados, o.papelDecisor, o.indicador].some((v) => v !== undefined && v !== null && v !== "") ||
    (Array.isArray(o.ferramentas) && o.ferramentas.length > 0) ||
    nao("minutos");
  if (camada2 && camada === 1) erros.camada = "As perguntas da camada 2 pedem a camada 2.";
  if (o.minutos !== undefined && o.minutos !== null && o.minutos !== "") {
    if (nao("minutos")) erros.minutos = msg.conflito;
    else if (typeof o.minutos !== "number" || !Number.isFinite(o.minutos) || o.minutos <= 0)
      erros.minutos = "Informe um número maior que zero.";
    else if (o.minutos > LIMITES.minutos) erros.minutos = `Use um número de até ${LIMITES.minutos}.`;
    else if (!casas(o.minutos, 1)) erros.minutos = "Use no máximo uma casa decimal.";
    else minutos = o.minutos;
  }
  if (Array.isArray(o.ferramentas)) {
    const vistas = new Set<string>();
    for (const f of o.ferramentas) {
      const t = limpar(f);
      if (!t) continue;
      if (t.length > LIMITES.ferramenta || temContato(t))
        erros.ferramentas = `Use até ${LIMITES.ferramentas} ferramentas, de até ${LIMITES.ferramenta} caracteres cada, sem e-mail nem telefone.`;
      else if (!vistas.has(t.toLowerCase())) {
        vistas.add(t.toLowerCase());
        ferramentas.push(t);
      }
    }
    if (ferramentas.length > LIMITES.ferramentas) {
      erros.ferramentas = `Use até ${LIMITES.ferramentas} ferramentas, de até ${LIMITES.ferramenta} caracteres cada, sem e-mail nem telefone.`;
      ferramentas = ferramentas.slice(0, LIMITES.ferramentas);
    }
  } else if (o.ferramentas !== undefined && o.ferramentas !== null) erros.ferramentas = msg.opcao;
  if (o.dados !== undefined && o.dados !== null && o.dados !== "") {
    if (ids(dadosDisponiveis).includes(o.dados as string)) dados = o.dados as DadosId;
    else erros.dados = msg.opcao;
  }
  if (o.papelDecisor !== undefined && o.papelDecisor !== null && o.papelDecisor !== "") {
    if (ids(papeisNaDecisao).includes(o.papelDecisor as string)) papelDecisor = o.papelDecisor as PapelDecisorId;
    else erros.papelDecisor = msg.opcao;
  }
  const indicador = texto("indicador", 2, LIMITES.indicador);

  const respondeu =
    rotina ||
    volume !== undefined ||
    consequencia ||
    naoSei.some((c) => ["rotina", "volume", "consequencia"].includes(c));
  if (!respondeu && !camada2) erros.geral = "Responda ao menos uma pergunta ou marque Não sei.";

  if (Object.keys(erros).length || !area || !camada || revisao === undefined) return { ok: false, erros };

  const valor: Aprofundamento = { area, camada, revisao, ferramentas, naoSei };
  if (rotina) valor.rotina = rotina;
  if (rotinaOutra) valor.rotinaOutra = rotinaOutra;
  if (volume !== undefined) {
    valor.volume = volume;
    valor.unidade = unidade;
    valor.periodo = periodo;
  }
  if (consequencia) valor.consequencia = consequencia;
  if (consequenciaOutra) valor.consequenciaOutra = consequenciaOutra;
  if (minutos !== undefined) valor.minutos = minutos;
  if (dados) valor.dados = dados;
  if (indicador) valor.indicador = indicador;
  if (papelDecisor) valor.papelDecisor = papelDecisor;
  return { ok: true, valor };
}

/** Os campos do aprofundamento nos nomes das colunas do banco (função gravar_aprofundamento). */
export const paraLinha = (a: Aprofundamento) => ({
  area: a.area,
  camada: a.camada,
  revisao: a.revisao,
  rotina: a.rotina ?? null,
  rotina_outra: a.rotinaOutra ?? null,
  volume: a.volume ?? null,
  unidade: a.unidade ?? null,
  periodo: a.periodo ?? null,
  consequencia: a.consequencia ?? null,
  consequencia_outra: a.consequenciaOutra ?? null,
  minutos: a.minutos ?? null,
  ferramentas: a.ferramentas,
  dados: a.dados ?? null,
  indicador: a.indicador ?? null,
  papel_decisor: a.papelDecisor ?? null,
  nao_sei: a.naoSei,
});

export type Esforco =
  | { calculavel: true; volume: number; unidade: string; periodo: PeriodoId; minutos: number; horas: number }
  | { calculavel: false; falta: Array<"volume" | "minutos"> };

/**
 * Esforço atual informado: ocorrências no período × minutos por ocorrência ÷ 60 (200 propostas por mês × 15 minutos =
 * 50 horas por mês). É o esforço que a pessoa declarou, não uma economia: nada aqui vira dinheiro, porcentagem de
 * ganho ou receita perdida, e sem volume e tempo informados o resultado diz o que falta.
 */
export function esforcoEstimado(a: Pick<Aprofundamento, "volume" | "unidade" | "periodo" | "minutos">): Esforco {
  const falta: Array<"volume" | "minutos"> = [];
  if (a.volume === undefined || !a.unidade || !a.periodo) falta.push("volume");
  if (a.minutos === undefined) falta.push("minutos");
  if (falta.length || a.volume === undefined || !a.unidade || !a.periodo || a.minutos === undefined)
    return { calculavel: false, falta };
  return {
    calculavel: true,
    volume: a.volume,
    unidade: a.unidade,
    periodo: a.periodo,
    minutos: a.minutos,
    horas: Math.round(((a.volume * a.minutos) / 60) * 10) / 10,
  };
}
