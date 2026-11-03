"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect } from "react";
import { registrarOrigem } from "@/lib/ai-score/navegador";
import { SELETOR_CTA, analytics, eventoDoClique, track } from "@/lib/analytics";

/**
 * Carrega o script de analytics escolhido por env e registra os eventos do site: cliques nos CTAs
 * (WhatsApp, AI Score, Análise Estratégica, teste da Spotlite), com `data-cta`, e Web Vitals.
 * Sem env, não renderiza nada. Também guarda a origem da visita (UTM, referrer) para o RESET AI Score.
 *
 * O link do resultado leva as respostas (e, nos e-mails, um token) no hash da URL: o hash nunca vai ao provedor.
 * No Umami, `data-exclude-hash`; no GA4, a página é enviada à mão, só com origem, caminho e parâmetros de campanha.
 */
export function Analytics() {
  const caminho = usePathname();
  useReportWebVitals((m) => {
    track("web_vitals", {
      nome: m.name,
      valor: Math.round(m.name === "CLS" ? m.value * 1000 : m.value),
      rating: m.rating,
    });
  });

  useEffect(() => registrarOrigem(), []);

  // GA4: a visita de página é enviada aqui, sem o hash (o `config` abaixo vem com send_page_view desligado).
  useEffect(() => {
    if (analytics.ativo && analytics.provedor === "ga4")
      window.gtag?.("event", "page_view", {
        page_location: `${window.location.origin}${window.location.pathname}${window.location.search}`,
        page_path: caminho,
      });
  }, [caminho]);

  useEffect(() => {
    if (!analytics.ativo) return;
    const aoClicar = (e: MouseEvent) => {
      const alvo = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>(SELETOR_CTA) : null;
      if (!alvo) return;
      const evento = eventoDoClique({ href: alvo.href, cta: alvo.dataset.cta });
      track(evento, { origem: alvo.dataset.cta ?? "link", pagina: window.location.pathname });
    };
    document.addEventListener("click", aoClicar, { capture: true });
    return () => document.removeEventListener("click", aoClicar, { capture: true });
  }, []);

  if (!analytics.ativo) return null;

  if (analytics.provedor === "ga4") {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${analytics.id}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analytics.id}',{anonymize_ip:true,send_page_view:false});`}
        </Script>
      </>
    );
  }

  return (
    <Script
      src={`${analytics.host}/script.js`}
      data-website-id={analytics.id}
      data-exclude-hash="true"
      strategy="afterInteractive"
    />
  );
}
