"use client";

import { useSyncExternalStore } from "react";
import { Botao } from "@/components/ui/botao";
import { site } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const assinarScroll = (notificar: () => void) => {
  window.addEventListener("scroll", notificar, { passive: true });
  return () => window.removeEventListener("scroll", notificar);
};

/**
 * WhatsApp sempre à mão depois do hero (600px): barra fixa no celular e botão flutuante no desktop.
 * Antes disso fica fora da tela, invisível e inerte, para não competir com os botões do hero.
 */
export function BarraMobile() {
  const visivel = useSyncExternalStore(
    assinarScroll,
    () => window.scrollY > 600,
    () => false,
  );

  return (
    <div
      data-barra-mobile
      inert={!visivel}
      className={cn(
        "fixed z-40 transition-[transform,visibility,opacity] duration-300 ease-out",
        "border-line bg-carvao/90 inset-x-0 bottom-0 border-t px-[6vw] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[12px]",
        "md:inset-x-auto md:right-6 md:bottom-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
        visivel ? "visible translate-y-0 opacity-100" : "invisible translate-y-full opacity-0",
      )}
    >
      <Botao href={waGeral()} origem="barra-mobile" className="w-full md:w-auto">
        {site.barraMobile}
      </Botao>
    </div>
  );
}
