"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Botao } from "@/components/ui/botao";
import { site } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const assinarScroll = (notificar: () => void) => {
  window.addEventListener("scroll", notificar, { passive: true });
  return () => window.removeEventListener("scroll", notificar);
};

/** Questionário e resultado do AI Score e admin: a barra cobriria os botões de avançar e enviar. */
const SEM_BARRA = /^\/(ai-score\/(avaliacao|resultado|preferencias)|admin)(\/|$)/;

/** Onde a intenção da página é a conversa (Análise Estratégica): o WhatsApp é a ação principal, e a avaliação, a alternativa. */
const CONVERSA_PRINCIPAL = /^\/diagnostico-gratuito(\/|$)/;

/**
 * Ação sempre à mão depois do hero (600px): barra fixa no celular e botões flutuantes no desktop. A principal é a
 * avaliação gratuita (RESET AI Score), com o WhatsApp como alternativa; na página da Análise Estratégica, ao contrário.
 * Antes disso fica fora da tela, invisível e inerte, para não competir com os botões do hero.
 */
export function BarraMobile() {
  const pathname = usePathname() ?? "/";
  const visivel = useSyncExternalStore(
    assinarScroll,
    () => window.scrollY > 600,
    () => false,
  );
  if (SEM_BARRA.test(pathname)) return null;
  const conversa = CONVERSA_PRINCIPAL.test(pathname);

  return (
    <div
      data-barra-mobile
      inert={!visivel}
      className={cn(
        "fixed z-40 transition-[transform,visibility,opacity] duration-300 ease-out",
        "border-line bg-fundo/90 inset-x-0 bottom-0 border-t px-[6vw] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[12px]",
        "md:inset-x-auto md:right-6 md:bottom-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
        visivel ? "visible translate-y-0 opacity-100" : "invisible translate-y-full opacity-0",
      )}
    >
      <div className="grid grid-cols-[1.4fr_1fr] gap-2 md:flex md:flex-col md:items-end">
        {conversa ? (
          <>
            <Botao href={waGeral()} origem="barra-mobile" tamanho="sm" className="w-full md:w-auto">
              {site.barraMobile}
            </Botao>
            <Botao
              href="/ai-score/"
              origem="ai-score-barra"
              variante="secundario"
              tamanho="sm"
              className="w-full md:w-auto"
            >
              {site.ctaMenu}
            </Botao>
          </>
        ) : (
          <>
            <Botao href="/ai-score/" origem="ai-score-barra" tamanho="sm" className="w-full md:w-auto">
              {site.ctaAiScore}
            </Botao>
            <Botao
              href={waGeral()}
              origem="barra-mobile"
              variante="secundario"
              tamanho="sm"
              className="w-full md:w-auto"
            >
              {site.barraMobile}
            </Botao>
          </>
        )}
      </div>
    </div>
  );
}
