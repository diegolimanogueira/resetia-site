import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icone } from "@/components/ui/icone";
import { Section } from "@/components/ui/section";
import type { IconeId } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Topo das páginas internas: glow à direita, kicker (com ícone opcional), H1, lead e um extra (CTAs).
 * `tituloMenor` para headlines longas (landing pages das soluções).
 */
export function HeroPagina({
  antes,
  kicker,
  icone,
  titulo,
  tituloMenor = false,
  lead,
  children,
}: {
  antes?: ReactNode;
  kicker: string;
  icone?: IconeId;
  titulo: ReactNode;
  tituloMenor?: boolean;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <Section
      espaco="nenhum"
      className="border-line overflow-hidden border-b bg-[radial-gradient(circle_at_85%_40%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_45%)] pt-[70px] pb-[70px] md:pt-[110px] md:pb-[90px]"
    >
      <div className="container-site">
        {antes ? <div className="mb-[30px]">{antes}</div> : null}
        <Eyebrow className={icone ? "flex items-center gap-2.5" : undefined}>
          {icone ? <Icone id={icone} tamanho={20} /> : null}
          {kicker}
        </Eyebrow>
        <h1
          className={cn(
            "mb-[30px] max-w-[1050px]",
            tituloMenor ? "text-[clamp(34px,4.6vw,66px)] leading-[1.06] font-bold tracking-[-0.03em]" : "display-h1",
          )}
        >
          {titulo}
        </h1>
        <p className="text-fg-2 mb-6 max-w-[800px] text-[clamp(19px,2.2vw,24px)] leading-[1.5]">{lead}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </Section>
  );
}
