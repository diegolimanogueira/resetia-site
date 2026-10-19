"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Botao } from "@/components/ui/botao";
import { site } from "@/content/site";
import { waGeral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Barra fixa de WhatsApp no celular. Aparece depois do hero (600px) para não competir com os botões dele. */
export function BarraMobile() {
  const { scrollY } = useScroll();
  const [visivel, setVisivel] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setVisivel(y > 600));

  return (
    <div
      data-barra-mobile
      inert={!visivel}
      className={cn(
        "border-cinza/25 bg-carvao/90 fixed inset-x-0 bottom-0 z-40 border-t px-[6vw] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[12px] transition-transform duration-300 ease-out md:hidden",
        visivel ? "translate-y-0" : "translate-y-full",
      )}
    >
      <Botao href={waGeral()} origem="barra-mobile" magnetico={false} seta={false} className="w-full">
        {site.barraMobile}
      </Botao>
    </div>
  );
}
