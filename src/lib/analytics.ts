/**
 * Camada fina sobre Umami ou GA4. Sem NEXT_PUBLIC_ANALYTICS_ID nada é carregado e `track` é no-op.
 * Evento que importa neste site: `cta_whatsapp` (todo clique em link wa.me), com a origem do botão.
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
