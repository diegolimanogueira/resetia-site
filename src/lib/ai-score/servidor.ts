/**
 * Ponto de entrada do código compartilhado com a função supabase/functions/ai-score (Deno). `npm run funcao:nucleo`
 * empacota este arquivo, e tudo o que ele importa, em supabase/functions/ai-score/nucleo.js: a função calcula,
 * analisa, monta as dicas e os e-mails com o mesmo código do site. Nada aqui pode usar APIs do navegador.
 */
import { biblioteca } from "@/content/ai-score-dicas";
import { instrucoes } from "@/content/ai-score-instrucoes";
import { dimensoes, modulosArea, niveis, relatorio, resultadoTextos } from "@/content/ai-score-questionario";
import { nomesSolucoes } from "@/content/solucoes-nomes";
import { waUrl } from "@/lib/whatsapp";
import { analisar } from "./analisar";
import { calcular } from "./calcular";
import { codificar, completas, decodificar } from "./codificar";
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
  calcular,
  completas,
  decodificar,
  esquemaDicas,
  fatosParaDicas,
  instrucoes,
  montarDicas,
  montarEmailRelatorio,
  montarEmailReset,
  recomendar,
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

/** Link do e-mail: o resultado com o par (lead, avaliação), que libera o relatório completo em qualquer aparelho. */
export const linkRelatorio = (site: string, r: RespostasCompletas & { id: string }, leadId: string) =>
  `${site}/ai-score/resultado/#${codificar(r)}&lead=${leadId}`;

/** WhatsApp da Análise Estratégica com a nota e as duas maiores lacunas, como na tela de resultado. */
export function whatsappDoResultado(r: RespostasCompletas) {
  const resultado = calcular(r);
  const rec = recomendar(resultado, r.desafios);
  return waUrl(
    resultadoTextos.mensagem({
      indice: resultado.indice,
      nivel: nomeDoNivel(resultado.nivel),
      lacunas: rec.lacunas.slice(0, 2).map(nomeDaDimensao),
    }),
  );
}
