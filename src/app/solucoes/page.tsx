import type { Metadata } from "next";
import { CtaFinal } from "@/components/sections/shared/CtaFinal";
import { ListaSolucoes } from "@/components/sections/shared/ListaSolucoes";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { seo } from "@/content/site";
import { solucoes } from "@/content/solucoes";
import { waGeral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: seo.solucoes.title,
  description: seo.solucoes.description,
  alternates: { canonical: "/solucoes/" },
};

export default function Solucoes() {
  const h = solucoes.hero;
  return (
    <main data-tom="neutro" className="text-fg bg-(--bg)">
      <Section tom="neutro" className="gutter pt-[120px] pb-20">
        <div className="container-site">
          <Eyebrow className="text-fg-2 mb-6">{h.kicker}</Eyebrow>
          <h1 className="mb-6 text-[clamp(40px,5.6vw,80px)] leading-[.95] font-bold tracking-[-0.03em]">
            {h.titulo[0]}
            <br />
            {h.titulo[1]}
          </h1>
          <p className="text-fg-2 max-w-[60ch] text-[20px] leading-[1.6]">{h.lead}</p>
        </div>
      </Section>
      <Section tom="neutro" className="gutter pb-[120px]">
        <div className="container-site">
          <ListaSolucoes itens={solucoes.lista} detalhada />
        </div>
      </Section>
      <CtaFinal cta={solucoes.cta} href={waGeral()} origem="solucoes" />
    </main>
  );
}
