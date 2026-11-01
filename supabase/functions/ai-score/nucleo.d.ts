// Tipos da superfície de nucleo.js que a função usa. O nucleo.js é gerado (`npm run funcao:nucleo`) e minificado: sem
// este arquivo o Deno infere uniões sem discriminante e `link.tipo !== "ok"` não estreita nada. Mantenha em dia com
// src/lib/ai-score/servidor.ts; o `deno check` do CI falha se algum uso na função deixar de bater com estes tipos.

export type Slot = number | null;

export interface RespostasCompletas {
  id?: string;
  escopo: string;
  papel: string;
  porte: string;
  segmento: string;
  areas: string[];
  centrais: Slot[];
  porArea: Record<string, Slot[]>;
  desafios: string[];
  horizonte: string;
}

export type LeituraLink =
  | {
      tipo: "ok";
      respostas: RespostasCompletas;
      formato: "1" | "2";
      metodo: string;
      analise: string | null;
      analiseMaisNova: boolean;
    }
  | { tipo: "vazio" }
  | { tipo: "invalido" }
  | { tipo: "formato-desconhecido" }
  | { tipo: "metodo-desconhecido"; metodo: string };

export interface OrigemDoLink {
  formato: "1" | "2";
  metodo: string;
  analise: string | null;
  analiseMaisNova: boolean;
}

export interface Resultado {
  dimensoes: Record<string, number | null>;
  respondidas: number;
  parcial: boolean;
  media: number | null;
  indice: number | null;
  nivel: string | null;
  areas: Record<string, number | null>;
}

export interface Devolutiva {
  versoes: {
    formato: "1" | "2";
    metodo: string;
    analiseDoLink: string | null;
    analiseAtual: string;
    anteriorAoVersionamento: boolean;
    analiseMaisNova: boolean;
  };
  resultado: Resultado;
  cobertura: {
    total: number;
    validas: number;
    naoSei: number[];
    umaResposta: string[];
    semResposta: string[];
    situacao: "completa" | "estimativa" | "parcial";
  };
  // O restante da devolutiva é repassado como está (JSON); a função só o lê através dos módulos do núcleo.
  recomendacao: any;
  analise: any;
  leituras: any;
  sintese: any;
}

export type ResultadoValidacao = { ok: true; valor: any } | { ok: false; erros: Record<string, string> };

export const CONSENTIMENTOS_VERSAO: string;
export function lerLink(texto: string | null | undefined): LeituraLink;
export function completas(r: unknown): r is RespostasCompletas;
export function codigoCanonico(l: Extract<LeituraLink, { tipo: "ok" }>): string;
export function montarDevolutiva(r: RespostasCompletas, origem?: OrigemDoLink): Devolutiva;
export function validarAprofundamento(entrada: unknown): ResultadoValidacao;
export function paraLinha(a: any): Record<string, unknown>;
export function esforcoEstimado(a: any): unknown;
export function emailValido(email: string): boolean;
export function emailPessoal(email: string): boolean;
export function normalizarWhatsapp(texto: string): string | null;

// Dicas, e-mails e links: usados pela função como estão, sem tipagem fina.
export const instrucoes: { escritor: string; revisor: string };
export const nomesSolucoes: Record<string, string>;
export function alvosDasDicas(resultado: any): string[];
export function fatosParaDicas(r: any, resultado: any, alvos?: string[]): unknown;
export function esquemaDicas(alvos: string[]): any;
export function validarDicas(bruto: unknown, alvos: string[]): Record<string, string[]>;
export function montarDicas(...args: any[]): any;
export function montarEmailRelatorio(dados: any): { assunto: string; html: string; texto: string };
export function montarEmailReset(dados: any): { assunto: string; html: string; texto: string };
export function quemDoResumo(r: RespostasCompletas, empresa: string | null): string;
export function linkRelatorio(site: string, codigo: string, leadId: string | null): string;
export function whatsappDoResultado(r: RespostasCompletas): string;
export function waUrl(mensagem?: string, numero?: string): string;
