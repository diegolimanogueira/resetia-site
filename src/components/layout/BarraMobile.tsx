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

/** Barra fixa de WhatsApp no celular. Aparece depois do hero (600px) para não competir com os botões dele. */
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
        "border-line bg-carvao/90 fixed inset-x-0 bottom-0 z-40 border-t px-[6vw] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[12px] transition-[transform,visibility] duration-300 ease-out md:hidden",
        visivel ? "visible translate-y-0" : "invisible translate-y-full",
      )}
    >
      <Botao href={waGeral()} origem="barra-mobile" className="w-full">
        {site.barraMobile}
      </Botao>
    </div>
  );
}
