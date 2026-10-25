import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";

/** Topo das páginas internas (reset360 .page-hero): glow à direita, kicker, H1, lead e um extra opcional. */
export function HeroPagina({
  antes,
  kicker,
  titulo,
  lead,
  children,
}: {
  antes?: ReactNode;
  kicker: string;
  titulo: ReactNode;
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
        <Eyebrow>{kicker}</Eyebrow>
        <h1 className="display-h1 mb-[30px] max-w-[1050px]">{titulo}</h1>
        <p className="text-fg-2 max-w-[800px] text-[clamp(19px,2.2vw,26px)] leading-[1.5]">{lead}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </Section>
  );
}
