"use client";

import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect } from "react";
import { registrarOrigem } from "@/lib/ai-score/navegador";
import { SELETOR_CTA, analytics, eventoDoClique, track } from "@/lib/analytics";

/**
 * Carrega o script de analytics escolhido por env e registra os eventos do site: cliques nos CTAs
 * (WhatsApp, AI Score, Análise Estratégica, teste da Spotlite), com `data-cta`, e Web Vitals.
 * Sem env, não renderiza nada. Também guarda a origem da visita (UTM, referrer) para o RESET AI Score.
 */
export function Analytics() {
  useReportWebVitals((m) => {
    track("web_vitals", {
      nome: m.name,
      valor: Math.round(m.name === "CLS" ? m.value * 1000 : m.value),
      rating: m.rating,
    });
  });

  useEffect(() => registrarOrigem(), []);

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
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analytics.id}',{anonymize_ip:true});`}
        </Script>
      </>
    );
  }

  return <Script src={`${analytics.host}/script.js`} data-website-id={analytics.id} strategy="afterInteractive" />;
}
