import { Underline } from "@/components/motion/Underline";
import { Botao } from "@/components/ui/botao";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { waGeral } from "@/lib/whatsapp";

/** Ato 8 — Fecho (carvão). Frase-conceito do manual com sublinhado verde que cresce. */
export function Fecho() {
  const s = home.fecho;
  return (
    <Section tom="carvao" data-ato="fecho" className="gutter z-[1] pt-[180px] pb-[160px] text-center">
      <h2 className="mx-auto mb-8 max-w-[14ch] text-[clamp(40px,6.4vw,88px)] leading-[.95] font-bold tracking-[-0.03em]">
        <span data-dl className="text-cinza block">
          {s.linha1}
        </span>
        <span className="block">
          {s.linha2Prefixo}
          <span className="relative inline-block">
            <span data-dl>{s.linha2Destaque}</span>
            <Underline />
          </span>
        </span>
      </h2>
      <p className="text-cinza mx-auto mb-10 max-w-[40ch] text-[20px] leading-[1.6]">{s.apoio}</p>
      <Botao href={waGeral()} origem="fecho">
        {s.cta}
      </Botao>
    </Section>
  );
}
