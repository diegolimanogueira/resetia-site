/**
 * Camada fina sobre Umami ou GA4. Sem NEXT_PUBLIC_ANALYTICS_ID nada é carregado e `track` é no-op.
 * Eventos de conversão, sempre com a origem do botão (`data-cta`): `cta_diagnostico_gratuito` (WhatsApp do
 * RESET Scan), `cta_whatsapp` (demais conversas), `cta_pagina_diagnostico` (links para /diagnostico-gratuito)
 * e `cta_teste_spotlite` (autodiagnóstico na Spotlite).
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

export function track(evento: string, dados: Dados = {}) {
  if (!analytics.ativo || typeof window === "undefined") return;
  if (analytics.provedor === "umami") window.umami?.track(evento, dados);
  else window.gtag?.("event", evento, dados);
}

/** Links que contam como conversão (o listener de clique do Analytics usa este seletor). */
export const SELETOR_CTA = "a[href*='wa.me'], a[href*='spotlite.com.br/descoberta/'], a[href*='/diagnostico-gratuito']";

/** Nome do evento para um clique em CTA. Botões do diagnóstico gratuito têm `data-cta` começando com "diagnostico". */
export function eventoDoClique(alvo: { href: string; cta?: string }) {
  if (alvo.href.includes("wa.me"))
    return alvo.cta?.startsWith("diagnostico") ? "cta_diagnostico_gratuito" : "cta_whatsapp";
  if (alvo.href.includes("spotlite.com.br/descoberta/")) return "cta_teste_spotlite";
  return "cta_pagina_diagnostico";
}
