/**
 * Camada fina sobre Umami ou GA4. Sem NEXT_PUBLIC_ANALYTICS_ID nada é carregado e `track` é no-op.
 * Eventos de conversão, sempre com a origem do botão (`data-cta`): `cta_diagnostico_gratuito` (WhatsApp da
 * Análise Estratégica, "Falar com um especialista"), `cta_whatsapp` (demais conversas), `cta_pagina_diagnostico`
 * (links para /diagnostico-gratuito, a página da Análise Estratégica),
 * `cta_ai_score` (links para o RESET AI Score) e `cta_teste_spotlite` (autodiagnóstico na Spotlite).
 * O questionário registra o funil com `track()`: `ai_score_inicio`, `ai_score_etapa`, `ai_score_concluido`,
 * `ai_score_lead` e `ai_score_download`.
 */
export type Provedor = "umami" | "ga4";

export const analytics = {
  provedor: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as Provedor | undefined) ?? "umami",
  id: process.env.NEXT_PUBLIC_ANALYTICS_ID ?? "",
  host: process.env.NEXT_PUBLIC_ANALYTICS_HOST ?? "https://cloud.umami.is",
  get ativo() {
    return this.id.length > 0;
  },
};

type Dados = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: { track: (evento: string, dados?: Dados) => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Catálogo dos eventos do RESET AI Score, cada um com o que mede e o denominador natural da taxa. `unico`: o evento
 * conta uma vez por sessão (ou uma vez por avaliação, quando a chave é dada), mesmo que a tela renderize de novo ou
 * a pessoa volte à etapa. Nenhum evento leva nome, e-mail, telefone, texto digitado, resposta privada ou token:
 * `track` só aceita as chaves declaradas aqui, com valores curtos de vocabulário controlado.
 * Documentação para quem lê os números: docs/medicao.md.
 */
export const EVENTOS_AI_SCORE = {
  ai_score_abertura: {
    mede: "Abriu o questionário",
    denominador: "visitas da página do AI Score",
    unico: "sessao",
    chaves: [],
  },
  ai_score_primeira_interacao: {
    mede: "Respondeu a primeira pergunta de segmentação",
    denominador: "aberturas do questionário",
    unico: "sessao",
    chaves: [],
  },
  ai_score_inicio: {
    mede: "Concluiu a segmentação e foi para as perguntas",
    denominador: "aberturas do questionário",
    unico: "sessao",
    chaves: ["escopo", "papel"],
  },
  ai_score_etapa: { mede: "Avançou uma etapa", denominador: "segmentações concluídas", chaves: ["etapa", "total"] },
  ai_score_concluido: {
    mede: "Terminou o questionário",
    denominador: "segmentações concluídas",
    unico: "sessao",
    chaves: ["escopo", "nivel", "indice", "areas"],
  },
  ai_score_contato: {
    mede: "Contato aceito pelo servidor (nome e e-mail)",
    denominador: "questionários concluídos",
    unico: "sessao",
    chaves: ["nivel", "marketing"],
  },
  ai_score_lead: {
    mede: "Pediu o relatório completo (empresa informada)",
    denominador: "contatos aceitos",
    unico: "sessao",
    chaves: ["nivel", "contato", "marketing"],
  },
  ai_score_aprofundamento_inicio: {
    mede: "Começou o aprofundamento",
    denominador: "relatórios liberados",
    unico: "sessao",
    chaves: [],
  },
  ai_score_aprofundamento_salvo: {
    mede: "Salvou o aprofundamento",
    denominador: "aprofundamentos iniciados",
    chaves: ["camada"],
  },
  ai_score_aprofundamento_pulado: {
    mede: "Escolheu não responder agora",
    denominador: "relatórios liberados",
    unico: "sessao",
    chaves: [],
  },
  ai_score_download: {
    mede: "Baixou o PDF ou imprimiu",
    denominador: "relatórios liberados",
    chaves: ["nivel", "formato"],
  },
  ai_score_email_aceito: {
    mede: "Provedor de e-mail aceitou o relatório",
    denominador: "relatórios liberados",
    unico: "sessao",
    chaves: [],
  },
  ai_score_email_falhou: {
    mede: "Envio do relatório por e-mail falhou",
    denominador: "relatórios liberados",
    unico: "sessao",
    chaves: ["estado"],
  },
} as const;

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
 * Registra um evento. Eventos fora do catálogo são descartados; os dados passam por `limparDados`; um evento marcado
 * `unico` conta uma vez por sessão (e por `chave`, se informada). Sem analytics configurado, não faz nada.
 */
export function track(evento: string, dados: Dados = {}, chave?: string) {
  if (!analytics.ativo || typeof window === "undefined") return;
  const doSite = (EVENTOS_DO_SITE as readonly string[]).includes(evento);
  const ai = EVENTOS_AI_SCORE[evento as keyof typeof EVENTOS_AI_SCORE];
  if (!doSite && !ai) return;
  if (ai && "unico" in ai && jaContou(evento, chave)) return;
  const limpos = limparDados(doSite ? CHAVES_DO_SITE : ai.chaves, dados);
  if (analytics.provedor === "umami") window.umami?.track(evento, limpos);
  else window.gtag?.("event", evento, limpos);
}

/** Links que contam como conversão (o listener de clique do Analytics usa este seletor). */
export const SELETOR_CTA =
  "a[href*='wa.me'], a[href*='spotlite.com.br/descoberta/'], a[href*='/diagnostico-gratuito'], a[href*='/ai-score']";

/** Nome do evento para um clique em CTA. Botões da Análise Estratégica têm `data-cta` começando com "diagnostico". */
export function eventoDoClique(alvo: { href: string; cta?: string }) {
  if (alvo.href.includes("wa.me"))
    return alvo.cta?.startsWith("diagnostico") ? "cta_diagnostico_gratuito" : "cta_whatsapp";
  if (alvo.href.includes("spotlite.com.br/descoberta/")) return "cta_teste_spotlite";
  if (alvo.href.includes("/ai-score")) return "cta_ai_score";
  return "cta_pagina_diagnostico";
}
