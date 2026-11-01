/**
 * Ponto de entrada do código compartilhado com a função supabase/functions/ai-score (Deno). `npm run funcao:nucleo`
 * empacota este arquivo, e tudo o que ele importa, em supabase/functions/ai-score/nucleo.js: a função calcula,
 * analisa, monta as dicas e os e-mails com o mesmo código do site. Nada aqui pode usar APIs do navegador.
 */
import { biblioteca } from "@/content/ai-score-dicas";
import { instrucoes } from "@/content/ai-score-instrucoes";
import { dimensoes, modulosArea, niveis, relatorio } from "@/content/ai-score-questionario";
import { nomesSolucoes } from "@/content/solucoes-nomes";
import { waUrl } from "@/lib/whatsapp";
import { CONSENTIMENTOS_VERSAO } from "@/content/ai-score-consentimentos";
import { analisar } from "./analisar";
import { esforcoEstimado, paraLinha, validarAprofundamento } from "./aprofundamento";
import { calcular } from "./calcular";
import { completas, decodificar, lerLink } from "./codificar";
import { codigoCanonico } from "./codec";
import { emailPessoal, emailValido, normalizarWhatsapp } from "./contato";
import { montarDevolutiva } from "./devolutiva";
import { ANALISE_ATUAL, METODO_ATUAL } from "./versoes";
import { alvosDasDicas, montarDicas as montarDicasCom } from "./dicas";
import { esquemaDicas, fatosParaDicas, validarDicas } from "./dicas-ia";
import { montarEmailRelatorio, montarEmailReset } from "./email";
import { recomendar } from "./recomendar";
import type { RespostasCompletas } from "./tipos";

/** Dicas com a biblioteca já carregada (a função não precisa carregar nada sob demanda). */
const montarDicas = (...args: Parameters<typeof montarDicasCom> extends [unknown, ...infer R] ? R : never) =>
  montarDicasCom(biblioteca, ...args);

export {
  alvosDasDicas,
  analisar,
  ANALISE_ATUAL,
  calcular,
  codigoCanonico,
  completas,
  CONSENTIMENTOS_VERSAO,
  decodificar,
  emailPessoal,
  emailValido,
  esforcoEstimado,
  esquemaDicas,
  fatosParaDicas,
  instrucoes,
  lerLink,
  METODO_ATUAL,
  montarDevolutiva,
  montarDicas,
  montarEmailRelatorio,
  montarEmailReset,
  normalizarWhatsapp,
  paraLinha,
  recomendar,
  validarAprofundamento,
  validarDicas,
  waUrl,
};

export { nomesSolucoes };

/** Como o resumo chama quem respondeu: a empresa, ou a área avaliada (a mesma regra da tela de resultado). */
export const quemDoResumo = (r: RespostasCompletas, empresa: string | null) =>
  r.escopo === "empresa"
    ? (empresa ?? relatorio.resumo.suaEmpresa)
    : `${relatorio.resumo.suaArea} (${modulosArea.find((m) => m.area === r.escopo)?.nome}${empresa ? `, ${empresa}` : ""})`;
export const nomeDoNivel = (id: string | null) => niveis.find((n) => n.id === id)?.nome ?? null;
export const nomeDaDimensao = (id: string) => dimensoes.find((d) => d.id === id)?.nome ?? id;

/**
 * Link do e-mail: o resultado, com o código da própria avaliação (no formato e nas versões com que foi feita). Só os
 * leads antigos (criados pelo navegador, sem chave) levam o `&lead=` que libera o relatório em qualquer aparelho; os
 * novos não levam o id do lead no link, porque ele não autoriza nada.
 */
export const linkRelatorio = (site: string, codigo: string, leadId: string | null, token: string | null = null) =>
  `${site}/ai-score/resultado/#${codigo}${token ? `&k=${token}` : leadId ? `&lead=${leadId}` : ""}`;

/** Página de preferências de contato, aberta só com o token de finalidade `preferencias`. */
export const linkPreferencias = (site: string, token: string) => `${site}/ai-score/preferencias/#k=${token}`;

/** WhatsApp da Análise Estratégica com a nota e as duas maiores lacunas, como na tela de resultado. */
export function whatsappDoResultado(r: RespostasCompletas) {
  return waUrl(montarDevolutiva(r).sintese.conversa.mensagem);
}
