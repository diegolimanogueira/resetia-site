import { analytics, type Dados } from "./analytics";

/**
 * Eventos do RESET AI Score: quais chaves cada um pode levar e se conta uma vez por sessão (`unico`, ou uma vez por
 * avaliação, quando `track` recebe a chave). Nenhum evento leva nome, e-mail, telefone, texto digitado, resposta
 * privada ou token: `track` só aceita as chaves declaradas aqui, com valores curtos de vocabulário controlado.
 * O que cada evento mede e o denominador de cada taxa estão em src/content/ai-score-eventos.ts e docs/medicao.md.
 */
export const EVENTOS_AI_SCORE = {
  ai_score_abertura: { unico: true, chaves: [] },
  ai_score_primeira_interacao: { unico: true, chaves: [] },
  ai_score_inicio: { unico: true, chaves: ["escopo", "papel"] },
  ai_score_etapa: { chaves: ["etapa", "total"] },
  ai_score_concluido: { unico: true, chaves: ["escopo", "nivel", "indice", "areas"] },
  ai_score_contato: { unico: true, chaves: ["nivel", "marketing"] },
  ai_score_lead: { unico: true, chaves: ["nivel", "contato", "marketing"] },
  ai_score_aprofundamento_inicio: { unico: true, chaves: [] },
  ai_score_aprofundamento_salvo: { chaves: ["camada"] },
  ai_score_aprofundamento_pulado: { unico: true, chaves: [] },
  ai_score_download: { chaves: ["nivel", "formato"] },
  ai_score_email_aceito: { unico: true, chaves: [] },
  ai_score_email_falhou: { unico: true, chaves: ["estado"] },
} as const satisfies Record<string, { unico?: true; chaves: readonly string[] }>;

export type EventoAiScore = keyof typeof EVENTOS_AI_SCORE;

/** Eventos de conversão do site em geral (cliques) e de desempenho, que já existiam. */
const EVENTOS_DO_SITE = [
  "cta_diagnostico_gratuito",
  "cta_whatsapp",
  "cta_pagina_diagnostico",
  "cta_ai_score",
  "cta_teste_spotlite",
  "web_vitals",
] as const;
const CHAVES_DO_SITE = ["origem", "pagina", "nome", "valor", "rating"];

/** Valor aceito: número, booleano ou texto curto de vocabulário controlado (nada que lembre e-mail, telefone, id ou token). */
const VOCABULARIO = /^[A-Za-z0-9][A-Za-z0-9_.:/+-]{0,59}$/;
const pareceDadoPessoal = (v: string) =>
  /@/.test(v) || /\d{8,}/.test(v) || /[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v) || /[A-Za-z0-9_-]{32,}/.test(v);

/** Deixa só as chaves declaradas e os valores seguros. Exportado para teste. */
export function limparDados(chaves: readonly string[], dados: Dados): Dados {
  const saida: Dados = {};
  for (const k of chaves) {
    const v = dados[k];
    if (typeof v === "number" ? Number.isFinite(v) : typeof v === "boolean") saida[k] = v;
    else if (typeof v === "string" && VOCABULARIO.test(v) && !pareceDadoPessoal(v)) saida[k] = v;
  }
  return saida;
}

const marcaDeEvento = (evento: string, chave?: string) => `resetia.ev.${evento}${chave ? `.${chave}` : ""}`;

/** Já contou nesta sessão? Se não, marca (sem armazenamento disponível, conta de novo: melhor repetir que perder). */
function jaContou(evento: string, chave?: string) {
  try {
    const k = marcaDeEvento(evento, chave);
    if (sessionStorage.getItem(k)) return true;
    sessionStorage.setItem(k, "1");
  } catch {
    // Sem sessionStorage, o evento passa.
  }
  return false;
}

/**
 * Envia um evento ao provedor ligado. Eventos fora do catálogo são descartados; os dados passam por `limparDados`;
 * um evento marcado `unico` conta uma vez por sessão (e por `chave`, se informada).
 */
export function enviar(evento: string, dados: Dados = {}, chave?: string) {
  if (!analytics.ativo || typeof window === "undefined") return;
  const doSite = (EVENTOS_DO_SITE as readonly string[]).includes(evento);
  const ai = EVENTOS_AI_SCORE[evento as EventoAiScore];
  if (!doSite && !ai) return;
  if (ai && "unico" in ai && jaContou(evento, chave)) return;
  const limpos = limparDados(doSite ? CHAVES_DO_SITE : ai.chaves, dados);
  if (analytics.provedor === "umami") window.umami?.track(evento, limpos);
  else window.gtag?.("event", evento, limpos);
}
